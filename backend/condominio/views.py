from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action
from .permissions import EhAutenticado, IsSindico
from .models import Condominio, Usuario, Chamado, Endereco, Aviso
from .serializers import (
    CondominioSerializer,
    UsuarioSerializer, 
    ChamadoSerializer, 
    EnderecoSerializer, 
    AvisoSerializer
)

class CondominioViewSet(viewsets.ModelViewSet):
    """Gestão de Condomínios (Clientes da Plataforma SaaS)."""
    serializer_class = CondominioSerializer

    def get_permissions(self):
        # Apenas superadministrador da plataforma pode criar ou listar todos os condomínios
        if self.action in ['create', 'destroy']:
            return [IsAdminUser()]
        return [EhAutenticado()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Condominio.objects.all()
        if user.condominio:
            return Condominio.objects.filter(id=user.condominio.id)
        return Condominio.objects.none()


class EnderecoViewSet(viewsets.ModelViewSet):
    """Gerenciamento de unidades (apartamentos/blocos) isolado por condomínio."""
    serializer_class = EnderecoSerializer
    permission_classes = [EhAutenticado, IsSindico]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            condo_id = self.request.query_params.get('condominio_id')
            if condo_id:
                return Endereco.objects.filter(condominio_id=condo_id)
            return Endereco.objects.all().select_related('condominio')
        
        if not user.condominio:
            return Endereco.objects.none()
            
        return Endereco.objects.filter(condominio=user.condominio).select_related('condominio').order_by('bloco', 'numero')

    def perform_create(self, serializer):
        user = self.request.user
        condominio = user.condominio
        serializer.save(condominio=condominio)


class UsuarioViewSet(viewsets.ModelViewSet):
    """Cadastro público de morador (com código) e listagem isolada por condomínio."""
    serializer_class = UsuarioSerializer
    permission_classes = [EhAutenticado, IsSindico]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Usuario.objects.filter(is_superuser=False).select_related('condominio', 'endereco')

        if not user.condominio:
            return Usuario.objects.none()

        # Síndico visualiza apenas os moradores comuns do seu próprio condomínio
        return Usuario.objects.filter(
            condominio=user.condominio,
            is_sindico=False,
            is_staff=False,
            is_superuser=False
        ).select_related('endereco', 'condominio')

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        if self.action in ['me']:
            return [EhAutenticado()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil completo do usuário logado, incluindo dados do condomínio."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ChamadoViewSet(viewsets.ModelViewSet):
    """Abertura, acompanhamento e resolução de chamados isolados por condomínio."""
    serializer_class = ChamadoSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Chamado.objects.none()

        if user.is_superuser:
            return Chamado.objects.all().select_related('condominio', 'autor', 'autor__endereco')

        if not user.condominio:
            return Chamado.objects.none()

        # Síndico vê todos os chamados do seu condomínio
        if user.is_sindico or user.is_staff:
            return Chamado.objects.filter(condominio=user.condominio).select_related('autor', 'autor__endereco')

        # Morador comum vê somente os chamados abertos por ele no condomínio
        return Chamado.objects.filter(condominio=user.condominio, autor=user).select_related('autor', 'autor__endereco')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [EhAutenticado()]
        return [EhAutenticado(), IsSindico()]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(autor=user, condominio=user.condominio)


class AvisoViewSet(viewsets.ModelViewSet):
    """Quadro de avisos e comunicados exclusivo de cada condomínio."""
    serializer_class = AvisoSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Aviso.objects.all().select_related('condominio', 'autor')

        if not user.condominio:
            return Aviso.objects.none()

        return Aviso.objects.filter(condominio=user.condominio).select_related('autor')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [EhAutenticado()]
        return [EhAutenticado(), IsSindico()]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(autor=user, condominio=user.condominio)


class DashboardView(APIView):
    """Métricas em tempo real isoladas para o condomínio do usuário."""
    permission_classes = [EhAutenticado]

    def get(self, request):
        user = request.user
        is_sindico = bool(user.is_sindico or user.is_staff or user.is_superuser)
        condo = user.condominio

        if user.is_superuser and not condo:
            chamados_base = Chamado.objects.all()
            total_moradores = Usuario.objects.filter(is_sindico=False, is_staff=False, is_superuser=False).count()
            total_unidades = Endereco.objects.count()
            total_condominios = Condominio.objects.count()
            avisos_base = Aviso.objects.all()
        elif is_sindico and condo:
            chamados_base = Chamado.objects.filter(condominio=condo)
            total_moradores = Usuario.objects.filter(condominio=condo, is_sindico=False, is_staff=False, is_superuser=False).count()
            total_unidades = Endereco.objects.filter(condominio=condo).count()
            total_condominios = 1
            avisos_base = Aviso.objects.filter(condominio=condo)
        elif condo:
            chamados_base = Chamado.objects.filter(condominio=condo, autor=user)
            total_moradores = 0
            total_unidades = 0
            total_condominios = 1
            avisos_base = Aviso.objects.filter(condominio=condo)
        else:
            return Response({'erro': 'Usuário não vinculado a nenhum condomínio.'}, status=status.HTTP_400_BAD_REQUEST)

        chamados_abertos = chamados_base.filter(status='aberto').count()
        chamados_andamento = chamados_base.filter(status='em_andamento').count()
        chamados_concluidos = chamados_base.filter(status='concluido').count()
        chamados_cancelados = chamados_base.filter(status='cancelado').count()

        avisos_recentes = avisos_base.order_by('-created_at')[:5]
        avisos_serializer = AvisoSerializer(avisos_recentes, many=True)

        dados = {
            'condominio_nome': condo.nome if condo else "SaaS Master",
            'is_sindico': is_sindico,
            'total_condominios': total_condominios,
            'total_moradores': total_moradores,
            'total_unidades': total_unidades,
            'chamados_abertos': chamados_abertos,
            'chamados_andamento': chamados_andamento,
            'chamados_concluidos': chamados_concluidos,
            'chamados_cancelados': chamados_cancelados,
            'total_chamados': chamados_base.count(),
            'avisos_recentes': avisos_serializer.data,
        }

        return Response(dados)


from .models import AreaComum, Reserva
from .serializers import AreaComumSerializer, ReservaSerializer

class AreaComumViewSet(viewsets.ModelViewSet):
    """Gestão dos espaços comuns (Churrasqueira, Salão de Festas, etc.) por condomínio."""
    serializer_class = AreaComumSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AreaComum.objects.all()
        if not user.condominio:
            return AreaComum.objects.none()
        return AreaComum.objects.filter(condominio=user.condominio, ativa=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [EhAutenticado()]
        return [EhAutenticado(), IsSindico()]

    def perform_create(self, serializer):
        serializer.save(condominio=self.request.user.condominio)


class ReservaViewSet(viewsets.ModelViewSet):
    """Agendamento e aprovação de reservas de áreas comuns."""
    serializer_class = ReservaSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Reserva.objects.all().select_related('area_comum', 'morador', 'condominio')

        if not user.condominio:
            return Reserva.objects.none()

        # Síndico vê todas as reservas do seu condomínio
        if user.is_sindico or user.is_staff:
            return Reserva.objects.filter(condominio=user.condominio).select_related('area_comum', 'morador')

        # Morador comum vê as suas reservas
        return Reserva.objects.filter(condominio=user.condominio, morador=user).select_related('area_comum', 'morador')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(morador=user, condominio=user.condominio)

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado, IsSindico])
    def aprovar(self, request, pk=None):
        """Ação exclusiva do síndico para aprovar a reserva."""
        reserva = self.get_object()
        reserva.status = 'confirmada'
        reserva.resposta_sindico = request.data.get('resposta_sindico', 'Reserva aprovada pela administração.')
        reserva.save()
        return Response(ReservaSerializer(reserva).data)

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado, IsSindico])
    def rejeitar(self, request, pk=None):
        """Ação exclusiva do síndico para rejeitar a reserva."""
        reserva = self.get_object()
        reserva.status = 'rejeitada'
        reserva.resposta_sindico = request.data.get('resposta_sindico', 'Reserva não autorizada.')
        reserva.save()
        return Response(ReservaSerializer(reserva).data)

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado])
    def cancelar(self, request, pk=None):
        """Morador ou síndico cancela uma reserva agendada."""
        reserva = self.get_object()
        user = request.user
        if not user.is_sindico and reserva.morador != user:
            return Response({'erro': 'Você não tem permissão para cancelar esta reserva.'}, status=status.HTTP_403_FORBIDDEN)
        
        reserva.status = 'cancelada'
        reserva.save()
        return Response(ReservaSerializer(reserva).data)


from django.utils import timezone
from .models import Encomenda
from .serializers import EncomendaSerializer

class EncomendaViewSet(viewsets.ModelViewSet):
    """Módulo de Portaria: Registro, notificação e baixa de encomendas dos moradores."""
    serializer_class = EncomendaSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Encomenda.objects.all().select_related('endereco', 'morador', 'condominio')

        if not user.condominio:
            return Encomenda.objects.none()

        # Síndico ou portaria visualiza todas as encomendas do condomínio
        if user.is_sindico or user.is_staff:
            return Encomenda.objects.filter(condominio=user.condominio).select_related('endereco', 'morador')

        # Morador comum vê encomendas vinculadas a ele ou à sua unidade
        return Encomenda.objects.filter(
            condominio=user.condominio,
            endereco=user.endereco
        ).select_related('endereco', 'morador')

    def get_permissions(self):
        # Apenas síndico/porteiro pode cadastrar encomendas recebidas
        if self.action in ['create', 'destroy']:
            return [EhAutenticado(), IsSindico()]
        return [EhAutenticado()]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado, IsSindico])
    def dar_baixa(self, request, pk=None):
        """Confirma a retirada da encomenda pelo morador."""
        encomenda = self.get_object()
        encomenda.status = 'entregue'
        encomenda.data_retirada = timezone.now()
        encomenda.save()
        return Response(EncomendaSerializer(encomenda).data)


from datetime import date
from .models import AutorizacaoAcesso, DocumentoCondominio, Enquete, VotoEnquete
from .serializers import AutorizacaoAcessoSerializer, DocumentoCondominioSerializer, EnqueteSerializer

class AutorizacaoAcessoViewSet(viewsets.ModelViewSet):
    """Controle de Portaria: Liberações de visitantes e prestadores de serviço."""
    serializer_class = AutorizacaoAcessoSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AutorizacaoAcesso.objects.all().select_related('endereco', 'morador')
        if not user.condominio:
            return AutorizacaoAcesso.objects.none()

        # Síndico ou portaria visualiza todas as autorizações do condomínio
        if user.is_sindico or user.is_staff:
            return AutorizacaoAcesso.objects.filter(condominio=user.condominio).select_related('endereco', 'morador')

        # Morador comum vê as autorizações feitas por ele ou para sua unidade
        return AutorizacaoAcesso.objects.filter(
            condominio=user.condominio,
            endereco=user.endereco
        ).select_related('endereco', 'morador')

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado, IsSindico])
    def registrar_entrada(self, request, pk=None):
        """Portaria confirma a entrada do visitante/prestador."""
        acesso = self.get_object()
        acesso.status = 'no_condominio'
        acesso.data_entrada = timezone.now()
        acesso.save()
        return Response(AutorizacaoAcessoSerializer(acesso).data)

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado, IsSindico])
    def registrar_saida(self, request, pk=None):
        """Portaria confirma a saída do visitante/prestador."""
        acesso = self.get_object()
        acesso.status = 'finalizado'
        acesso.data_saida = timezone.now()
        acesso.save()
        return Response(AutorizacaoAcessoSerializer(acesso).data)

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado])
    def cancelar(self, request, pk=None):
        """Morador ou portaria cancela a autorização de entrada."""
        acesso = self.get_object()
        user = request.user
        if not user.is_sindico and acesso.morador != user:
            return Response({'erro': 'Apenas o morador solicitante pode cancelar.'}, status=status.HTTP_403_FORBIDDEN)
        
        acesso.status = 'cancelado'
        acesso.save()
        return Response(AutorizacaoAcessoSerializer(acesso).data)


class DocumentoCondominioViewSet(viewsets.ModelViewSet):
    """Repositório de Documentos e Atas do Condomínio."""
    serializer_class = DocumentoCondominioSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return DocumentoCondominio.objects.all().select_related('criado_por')
        if not user.condominio:
            return DocumentoCondominio.objects.none()

        return DocumentoCondominio.objects.filter(condominio=user.condominio).select_related('criado_por')

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [EhAutenticado(), IsSindico()]
        return [EhAutenticado()]


class EnqueteViewSet(viewsets.ModelViewSet):
    """Assembleia Ágil: Consultas e votações virtuais auditadas por unidade."""
    serializer_class = EnqueteSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Enquete.objects.all().prefetch_related('votos')
        if not user.condominio:
            return Enquete.objects.none()

        return Enquete.objects.filter(condominio=user.condominio).prefetch_related('votos')

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [EhAutenticado(), IsSindico()]
        return [EhAutenticado()]

    @action(detail=True, methods=['post'], permission_classes=[EhAutenticado])
    def votar(self, request, pk=None):
        """Registra o voto do apartamento na enquete."""
        enquete = self.get_object()
        user = request.user

        if not enquete.ativa or enquete.data_limite < date.today():
            return Response({'erro': 'Esta votação já foi encerrada.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.endereco:
            return Response({'erro': 'Apenas moradores com unidade vinculada podem votar.'}, status=status.HTTP_400_BAD_REQUEST)

        # Checa se o apartamento já votou
        if VotoEnquete.objects.filter(enquete=enquete, endereco=user.endereco).exists():
            return Response({'erro': 'Sua unidade (apartamento) já computou um voto nesta enquete.'}, status=status.HTTP_400_BAD_REQUEST)

        opcao = request.data.get('opcao_escolhida')
        if not opcao or int(opcao) not in [1, 2, 3, 4]:
            return Response({'erro': 'Selecione uma opção válida de voto.'}, status=status.HTTP_400_BAD_REQUEST)

        VotoEnquete.objects.create(
            enquete=enquete,
            morador=user,
            endereco=user.endereco,
            opcao_escolhida=int(opcao)
        )

        enquete = Enquete.objects.prefetch_related('votos').get(id=enquete.id)
        return Response(EnqueteSerializer(enquete, context={'request': request}).data)
