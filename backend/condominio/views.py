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


from .models import AreaComum, Reserva, BloqueioAreaComum
from .serializers import AreaComumSerializer, ReservaSerializer, BloqueioAreaComumSerializer

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
        if self.action in ['list', 'retrieve', 'disponibilidade']:
            return [EhAutenticado()]
        return [EhAutenticado(), IsSindico()]

    def perform_create(self, serializer):
        serializer.save(condominio=self.request.user.condominio)

    @action(detail=True, methods=['get'], permission_classes=[EhAutenticado])
    def disponibilidade(self, request, pk=None):
        """Retorna as reservas ativas e bloqueios do síndico desta área comum para verificação de disponibilidade."""
        from datetime import date
        user = request.user
        area = self.get_object()
        reservas = Reserva.objects.filter(
            condominio=user.condominio,
            area_comum=area,
            data_reserva__gte=date.today(),
            status__in=['pendente', 'confirmada']
        ).values('id', 'area_comum_id', 'data_reserva', 'periodo', 'status')

        dados = [
            {
                'id': r['id'],
                'area_comum_id': r['area_comum_id'],
                'data_reserva': r['data_reserva'].strftime('%Y-%m-%d') if hasattr(r['data_reserva'], 'strftime') else str(r['data_reserva']),
                'periodo': r['periodo'],
                'status': r['status'],
                'motivo': ''
            }
            for r in reservas
        ]

        # Inclui os bloqueios definidos pelo síndico
        bloqueios = BloqueioAreaComum.objects.filter(
            condominio=user.condominio,
            area_comum=area,
            data__gte=date.today()
        )
        for b in bloqueios:
            dados.append({
                'id': f"bloqueio_{b.id}",
                'bloqueio_id': b.id,
                'area_comum_id': b.area_comum_id,
                'data_reserva': b.data.strftime('%Y-%m-%d') if hasattr(b.data, 'strftime') else str(b.data),
                'periodo': b.periodo,
                'status': 'bloqueado',
                'motivo': b.motivo
            })

        return Response(dados)

    @action(detail=True, methods=['post'], url_path='bloquear-data', permission_classes=[EhAutenticado, IsSindico])
    def bloquear_data(self, request, pk=None):
        """Ação exclusiva do síndico para bloquear uma data/horário para a área comum."""
        area = self.get_object()
        user = request.user
        data_str = request.data.get('data')
        periodo = request.data.get('periodo', 'dia_inteiro')
        motivo = request.data.get('motivo', 'Indisponível pela Administração (Manutenção / Limpeza)')

        if not data_str:
            return Response({'erro': 'Informe a data a ser bloqueada.'}, status=status.HTTP_400_BAD_REQUEST)

        bloqueio, created = BloqueioAreaComum.objects.get_or_create(
            condominio=user.condominio,
            area_comum=area,
            data=data_str,
            periodo=periodo,
            defaults={'motivo': motivo, 'bloqueado_por': user}
        )
        if not created:
            bloqueio.motivo = motivo
            bloqueio.bloqueado_por = user
            bloqueio.save()

        return Response(BloqueioAreaComumSerializer(bloqueio).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='desbloquear-data', permission_classes=[EhAutenticado, IsSindico])
    def desbloquear_data(self, request, pk=None):
        """Ação exclusiva do síndico para liberar/desbloquear uma data para a área comum."""
        area = self.get_object()
        user = request.user
        data_str = request.data.get('data')
        periodo = request.data.get('periodo')
        bloqueio_id = request.data.get('bloqueio_id')

        qs = BloqueioAreaComum.objects.filter(condominio=user.condominio, area_comum=area)
        if bloqueio_id:
            qs = qs.filter(id=bloqueio_id)
        elif data_str:
            qs = qs.filter(data=data_str)
            if periodo:
                qs = qs.filter(periodo=periodo)
        else:
            return Response({'erro': 'Informe a data ou o ID do bloqueio a ser removido.'}, status=status.HTTP_400_BAD_REQUEST)

        removidos, _ = qs.delete()
        return Response({'sucesso': True, 'removidos': removidos, 'mensagem': 'Data desbloqueada com sucesso.'})


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

    @action(detail=False, methods=['get'], permission_classes=[EhAutenticado])
    def ocupadas(self, request):
        """Retorna as reservas ativas (pendentes ou confirmadas) para exibição de disponibilidade aos moradores."""
        from datetime import date
        user = request.user
        if not user.condominio:
            return Response([])

        area_id = request.query_params.get('area_comum')
        qs = Reserva.objects.filter(
            condominio=user.condominio,
            data_reserva__gte=date.today(),
            status__in=['pendente', 'confirmada']
        )
        if area_id:
            qs = qs.filter(area_comum_id=area_id)

        reservas = qs.values('id', 'area_comum_id', 'data_reserva', 'periodo', 'status')
        dados = [
            {
                'id': r['id'],
                'area_comum_id': r['area_comum_id'],
                'data_reserva': r['data_reserva'].strftime('%Y-%m-%d') if hasattr(r['data_reserva'], 'strftime') else str(r['data_reserva']),
                'periodo': r['periodo'],
                'status': r['status'],
                'motivo': ''
            }
            for r in reservas
        ]

        # Inclui os bloqueios definidos pelo síndico
        bloqueios = BloqueioAreaComum.objects.filter(
            condominio=user.condominio,
            data__gte=date.today()
        )
        if area_id:
            bloqueios = bloqueios.filter(area_comum_id=area_id)
        for b in bloqueios:
            dados.append({
                'id': f"bloqueio_{b.id}",
                'bloqueio_id': b.id,
                'area_comum_id': b.area_comum_id,
                'data_reserva': b.data.strftime('%Y-%m-%d') if hasattr(b.data, 'strftime') else str(b.data),
                'periodo': b.periodo,
                'status': 'bloqueado',
                'motivo': b.motivo
            })

        return Response(dados)

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


# ==============================================================================
# RECONHECIMENTO FACIAL E PORTARIA INTELIGENTE
# ==============================================================================

from .facial_engine import processar_foto_facial, comparar_face_com_base
from .models import Visitante, BiometriaFacial, RegistroAcesso
from .serializers import VisitanteSerializer, BiometriaFacialSerializer, RegistroAcessoSerializer
from datetime import datetime

class BiometriaFacialViewSet(viewsets.ModelViewSet):
    """Gestão da biometria facial de moradores."""
    serializer_class = BiometriaFacialSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if not user.condominio:
            return BiometriaFacial.objects.none()
        if user.is_sindico or user.is_staff or user.is_superuser:
            return BiometriaFacial.objects.filter(condominio=user.condominio)
        return BiometriaFacial.objects.filter(condominio=user.condominio, usuario=user)

    @action(detail=False, methods=['get'], url_path='minha-face')
    def minha_face(self, request):
        """Retorna o registro biométrico facial ativo do morador logado."""
        user = request.user
        bio = BiometriaFacial.objects.filter(usuario=user, ativa=True).first()
        if not bio:
            return Response({'tem_biometria': False, 'mensagem': 'Nenhuma biometria facial cadastrada.'})
        return Response({
            'tem_biometria': True,
            'id': bio.id,
            'foto_base64': bio.foto_base64,
            'qualidade_score': bio.qualidade_score,
            'capturada_em': bio.created_at
        })

    @action(detail=False, methods=['post'], url_path='cadastrar-minha-face')
    def cadastrar_minha_face(self, request):
        """Morador envia sua selfie capturada pelo celular para extração e cadastro biométrico."""
        user = request.user
        if not user.condominio:
            return Response({'erro': 'Usuário não está vinculado a um condomínio.'}, status=status.HTTP_400_BAD_REQUEST)

        foto_base64 = request.data.get('foto_base64')
        if not foto_base64:
            return Response({'erro': 'Foto não fornecida. Capture a selfie antes de enviar.'}, status=status.HTTP_400_BAD_REQUEST)

        # Processa a foto com a IA de visão computacional
        resultado = processar_foto_facial(foto_base64)
        if not resultado['sucesso']:
            return Response({'erro': resultado['erro']}, status=status.HTTP_400_BAD_REQUEST)

        # Desativa registros faciais anteriores deste morador para manter o mais atual
        BiometriaFacial.objects.filter(usuario=user).update(ativa=False)

        bio = BiometriaFacial.objects.create(
            condominio=user.condominio,
            usuario=user,
            tipo_pessoa='morador',
            foto_base64=resultado['face_base64'],
            vetor_facial=resultado['vetor'],
            qualidade_score=resultado.get('brilho', 100.0),
            ativa=True
        )

        return Response({
            'sucesso': True,
            'mensagem': 'Biometria facial cadastrada com sucesso! Seu rosto está liberado para a portaria.',
            'biometria_id': bio.id,
            'face_recortada': bio.foto_base64
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='remover-minha-face')
    def remover_minha_face(self, request):
        """Permite ao morador revogar sua biometria facial."""
        user = request.user
        BiometriaFacial.objects.filter(usuario=user).update(ativa=False)
        return Response({'sucesso': True, 'mensagem': 'Biometria facial removida com sucesso.'})


class VisitanteViewSet(viewsets.ModelViewSet):
    """Gestão de visitantes, convidados e prestadores com link de convite e biometria."""
    serializer_class = VisitanteSerializer
    permission_classes = [EhAutenticado]

    def get_queryset(self):
        user = self.request.user
        if not user.condominio:
            return Visitante.objects.none()
        if user.is_sindico or user.is_staff or user.is_superuser:
            return Visitante.objects.filter(condominio=user.condominio).select_related('morador', 'endereco')
        return Visitante.objects.filter(condominio=user.condominio, morador=user).select_related('morador', 'endereco')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            morador=user,
            condominio=user.condominio,
            endereco=user.endereco
        )

    @action(detail=True, methods=['post'], url_path='vincular-face')
    def vincular_face(self, request, pk=None):
        """Porteiro ou morador vincula uma foto facial diretamente ao visitante cadastrado."""
        visitante = self.get_object()
        foto_base64 = request.data.get('foto_base64')
        if not foto_base64:
            return Response({'erro': 'Informe a foto do visitante.'}, status=status.HTTP_400_BAD_REQUEST)

        resultado = processar_foto_facial(foto_base64)
        if not resultado['sucesso']:
            return Response({'erro': resultado['erro']}, status=status.HTTP_400_BAD_REQUEST)

        BiometriaFacial.objects.filter(visitante=visitante).update(ativa=False)
        bio = BiometriaFacial.objects.create(
            condominio=visitante.condominio,
            visitante=visitante,
            tipo_pessoa=visitante.tipo,
            foto_base64=resultado['face_base64'],
            vetor_facial=resultado['vetor'],
            qualidade_score=resultado.get('brilho', 100.0),
            ativa=True
        )

        return Response({
            'sucesso': True,
            'mensagem': f'Facial de {visitante.nome} cadastrada com sucesso!',
            'face_base64': bio.foto_base64
        })

    @action(detail=False, methods=['get'], url_path='convite-publico/(?P<token>[^/.]+)', permission_classes=[AllowAny])
    def convite_publico(self, request, token=None):
        """Endpoint público acessado pelo visitante via WhatsApp para visualizar detalhes do convite."""
        visitante = Visitante.objects.filter(codigo_acesso__iexact=token).first()
        if not visitante:
            return Response({'erro': 'Convite não encontrado ou código inválido.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'codigo_acesso': visitante.codigo_acesso,
            'nome': visitante.nome,
            'tipo': visitante.get_tipo_display(),
            'morador_nome': visitante.morador.get_full_name(),
            'unidade': str(visitante.endereco) if visitante.endereco else 'Geral',
            'condominio_nome': visitante.condominio.nome,
            'data_inicio': visitante.data_inicio,
            'data_fim': visitante.data_fim,
            'periodo': visitante.get_periodo_display(),
            'status': visitante.status,
            'tem_biometria': visitante.biometrias.filter(ativa=True).exists()
        })

    @action(detail=False, methods=['post'], url_path='salvar-selfie-convite/(?P<token>[^/.]+)', permission_classes=[AllowAny])
    def salvar_selfie_convite(self, request, token=None):
        """Endpoint público onde o visitante tira a selfie no navegador do seu próprio celular."""
        visitante = Visitante.objects.filter(codigo_acesso__iexact=token).first()
        if not visitante:
            return Response({'erro': 'Convite não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if visitante.status != 'ativo':
            return Response({'erro': 'Este convite não está mais ativo.'}, status=status.HTTP_400_BAD_REQUEST)

        foto_base64 = request.data.get('foto_base64')
        if not foto_base64:
            return Response({'erro': 'Foto não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

        resultado = processar_foto_facial(foto_base64)
        if not resultado['sucesso']:
            return Response({'erro': resultado['erro']}, status=status.HTTP_400_BAD_REQUEST)

        BiometriaFacial.objects.filter(visitante=visitante).update(ativa=False)
        bio = BiometriaFacial.objects.create(
            condominio=visitante.condominio,
            visitante=visitante,
            tipo_pessoa=visitante.tipo,
            foto_base64=resultado['face_base64'],
            vetor_facial=resultado['vetor'],
            qualidade_score=resultado.get('brilho', 100.0),
            ativa=True
        )

        return Response({
            'sucesso': True,
            'mensagem': 'Selfie cadastrada com sucesso! Seu acesso ao condomínio foi pré-autorizado na portaria.',
            'face_base64': bio.foto_base64
        })


class PortariaTotemViewSet(viewsets.ViewSet):
    """
    Controlador de Portaria e Totem Facial:
    Recebe frames da câmera ao vivo, compara com o banco de dados e registra acessos.
    """
    permission_classes = [EhAutenticado]

    @action(detail=False, methods=['post'], url_path='identificar-face')
    def identificar_face(self, request):
        user = request.user
        condo = user.condominio
        if not condo:
            return Response({'erro': 'Usuário sem condomínio associado.'}, status=status.HTTP_400_BAD_REQUEST)

        foto_base64 = request.data.get('foto_base64')
        ponto_acesso = request.data.get('dispositivo_ponto', 'Portão Principal Pedestres')

        if not foto_base64:
            return Response({'erro': 'Imagem da câmera não enviada.'}, status=status.HTTP_400_BAD_REQUEST)

        resultado = processar_foto_facial(foto_base64)
        if not resultado['sucesso']:
            return Response({
                'autorizado': False,
                'motivo': resultado['erro'],
                'tipo': 'desconhecido'
            })

        vetor_camera = resultado['vetor']
        hoje = date.today()
        hora_atual = datetime.now().hour

        # 1. Busca biometrias ativas do condomínio (Moradores e Visitantes válidos)
        biometrias_moradores = BiometriaFacial.objects.filter(
            condominio=condo,
            ativa=True,
            usuario__isnull=False
        ).select_related('usuario', 'usuario__endereco')

        biometrias_visitantes = BiometriaFacial.objects.filter(
            condominio=condo,
            ativa=True,
            visitante__isnull=False,
            visitante__status='ativo',
            visitante__data_inicio__lte=hoje,
            visitante__data_fim__gte=hoje
        ).select_related('visitante', 'visitante__endereco')

        base_comparacao = []
        for b in biometrias_moradores:
            base_comparacao.append({
                'id': b.id,
                'tipo': 'morador',
                'objeto': b.usuario,
                'nome': b.usuario.get_full_name() or b.usuario.username,
                'unidade': str(b.usuario.endereco) if b.usuario.endereco else 'Morador',
                'vetor': b.vetor_facial
            })

        for b in biometrias_visitantes:
            v = b.visitante
            base_comparacao.append({
                'id': b.id,
                'tipo': v.tipo,
                'objeto': v,
                'nome': v.nome,
                'unidade': str(v.endereco) if v.endereco else 'Visita',
                'periodo': v.periodo,
                'vetor': b.vetor_facial
            })

        match, similaridade = comparar_face_com_base(vetor_camera, base_comparacao, limiar_minimo=0.78)

        if not match:
            # Não reconheceu ninguém
            RegistroAcesso.objects.create(
                condominio=condo,
                tipo_pessoa='desconhecido',
                nome_identificado='Pessoa Não Reconhecida',
                destino='Entrada',
                status='negado',
                motivo='Rosto não localizado na base de pessoas autorizadas.',
                similaridade=round(similaridade * 100, 1),
                foto_capturada=resultado['face_base64'],
                dispositivo_ponto=ponto_acesso
            )
            return Response({
                'autorizado': False,
                'status': 'negado',
                'nome': 'Não Reconhecido',
                'motivo': 'Rosto não cadastrado no condomínio.',
                'similaridade': round(similaridade * 100, 1),
                'foto_recortada': resultado['face_base64']
            })

        # Reconheceu alguém! Valida as regras de negócio:
        if match['tipo'] == 'morador':
            usuario = match['objeto']
            RegistroAcesso.objects.create(
                condominio=condo,
                tipo_pessoa='morador',
                usuario=usuario,
                nome_identificado=match['nome'],
                destino=match['unidade'],
                status='autorizado',
                motivo='Morador reconhecido com sucesso.',
                similaridade=round(similaridade * 100, 1),
                foto_capturada=resultado['face_base64'],
                dispositivo_ponto=ponto_acesso
            )
            return Response({
                'autorizado': True,
                'status': 'autorizado',
                'tipo': 'morador',
                'nome': match['nome'],
                'unidade': match['unidade'],
                'similaridade': round(similaridade * 100, 1),
                'mensagem': f'Acesso Liberado! Bem-vindo(a), {match["nome"]}!',
                'foto_recortada': resultado['face_base64']
            })

        # Se for Visitante ou Prestador de Serviço
        visitante = match['objeto']
        periodo_valido = True
        motivo_negacao = ''

        p = match.get('periodo', 'dia_inteiro')
        if p == 'manha' and not (6 <= hora_atual < 12):
            periodo_valido = False
            motivo_negacao = 'Acesso permitido apenas pela manhã (08h às 12h).'
        elif p == 'tarde' and not (12 <= hora_atual < 18):
            periodo_valido = False
            motivo_negacao = 'Acesso permitido apenas à tarde (13h às 18h).'
        elif p == 'noite' and not (18 <= hora_atual < 23):
            periodo_valido = False
            motivo_negacao = 'Acesso permitido apenas à noite (18h às 23h).'
        elif p == 'comercial' and not (8 <= hora_atual < 18):
            periodo_valido = False
            motivo_negacao = 'Acesso permitido apenas em horário comercial (08h às 18h).'

        if not periodo_valido:
            RegistroAcesso.objects.create(
                condominio=condo,
                tipo_pessoa=match['tipo'],
                visitante=visitante,
                nome_identificado=match['nome'],
                destino=match['unidade'],
                status='fora_horario',
                motivo=motivo_negacao,
                similaridade=round(similaridade * 100, 1),
                foto_capturada=resultado['face_base64'],
                dispositivo_ponto=ponto_acesso
            )
            return Response({
                'autorizado': False,
                'status': 'fora_horario',
                'tipo': match['tipo'],
                'nome': match['nome'],
                'unidade': match['unidade'],
                'motivo': motivo_negacao,
                'similaridade': round(similaridade * 100, 1),
                'foto_recortada': resultado['face_base64']
            })

        # Visitante / Prestador Liberado
        RegistroAcesso.objects.create(
            condominio=condo,
            tipo_pessoa=match['tipo'],
            visitante=visitante,
            nome_identificado=match['nome'],
            destino=match['unidade'],
            status='autorizado',
            motivo=f'Visitante autorizado para {match["unidade"]}',
            similaridade=round(similaridade * 100, 1),
            foto_capturada=resultado['face_base64'],
            dispositivo_ponto=ponto_acesso
        )

        return Response({
            'autorizado': True,
            'status': 'autorizado',
            'tipo': match['tipo'],
            'nome': match['nome'],
            'unidade': match['unidade'],
            'similaridade': round(similaridade * 100, 1),
            'mensagem': f'Acesso Liberado para {match["nome"]} (Destino: {match["unidade"]})',
            'foto_recortada': resultado['face_base64']
        })

    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        """Retorna os últimos 30 registros de acessos do condomínio."""
        user = request.user
        if not user.condominio:
            return Response([])

        registros = RegistroAcesso.objects.filter(condominio=user.condominio)[:30]
        return Response(RegistroAcessoSerializer(registros, many=True).data)

