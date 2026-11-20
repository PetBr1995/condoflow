import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Condominio, Usuario, Chamado, Endereco, Aviso

def limpar_cpf(cpf: str) -> str:
    """Remove pontuações e caracteres não numéricos do CPF."""
    return re.sub(r'\D', '', str(cpf or ''))


class CondominioSerializer(serializers.ModelSerializer):
    total_unidades = serializers.IntegerField(source='unidades.count', read_only=True)
    total_moradores = serializers.IntegerField(source='usuarios.count', read_only=True)

    class Meta:
        model = Condominio
        fields = [
            'id', 'nome', 'cnpj', 'codigo_identificador',
            'cidade', 'estado', 'plano', 'ativo',
            'total_unidades', 'total_moradores', 'created_at'
        ]
        read_only_fields = ['codigo_identificador', 'created_at']


class EnderecoSerializer(serializers.ModelSerializer):
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)

    class Meta:
        model = Endereco
        fields = ['id', 'condominio', 'condominio_nome', 'bloco', 'numero', 'andar', 'codigo_registro', 'created_at']
        read_only_fields = ['condominio', 'codigo_registro', 'created_at']

    def create(self, validated_data):
        # Associa automaticamente ao condomínio do síndico que está criando a unidade
        user = self.context['request'].user
        if not user.condominio and not user.is_superuser:
            raise serializers.ValidationError({"condominio": "Usuário não vinculado a nenhum condomínio."})
        
        condominio = validated_data.pop('condominio', None) or getattr(user, 'condominio', None)
        return Endereco.objects.create(condominio=condominio, **validated_data)


class UsuarioResumidoSerializer(serializers.ModelSerializer):
    """Serializer leve do usuário para aninhamento em chamados e avisos."""
    unidade = serializers.CharField(source='endereco.__str__', read_only=True)
    bloco = serializers.CharField(source='endereco.bloco', read_only=True)
    numero = serializers.CharField(source='endereco.numero', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'first_name', 'last_name', 'cpf', 'telefone', 'is_sindico', 'unidade', 'bloco', 'numero']


class UsuarioSerializer(serializers.ModelSerializer):
    codigo_registro = serializers.CharField(write_only=True, required=False, allow_blank=True)
    foto_base64 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    endereco = EnderecoSerializer(read_only=True)
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)
    biometria_cadastrada = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'cpf', 'telefone', 'is_sindico', 'condominio', 'condominio_nome',
            'endereco', 'codigo_registro', 'password', 'foto_base64', 'biometria_cadastrada'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False, 'allow_blank': True}
        }
        read_only_fields = ['is_sindico', 'condominio', 'is_staff', 'is_superuser', 'is_active']

    def get_biometria_cadastrada(self, obj):
        from .models import BiometriaFacial
        return BiometriaFacial.objects.filter(usuario=obj, ativa=True).exists()

    def validate_cpf(self, value):
        cpf_limpo = limpar_cpf(value)
        if len(cpf_limpo) != 11:
            raise serializers.ValidationError("O CPF deve conter exatamente 11 dígitos numéricos.")
        user = self.instance
        if Usuario.objects.filter(cpf=cpf_limpo).exclude(id=getattr(user, 'id', None)).exists():
            raise serializers.ValidationError("Já existe um morador cadastrado com este CPF.")
        return cpf_limpo

    def create(self, validated_data):
        codigo = validated_data.pop('codigo_registro', None)
        foto_b64 = validated_data.pop('foto_base64', None)
        senha = validated_data.pop('password', None)
        cpf = limpar_cpf(validated_data.get('cpf', ''))
        
        validated_data['cpf'] = cpf
        validated_data['username'] = cpf

        if senha:
            try:
                validate_password(senha)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

        casa_encontrada = None
        if codigo:
            casa_encontrada = Endereco.objects.select_related('condominio').filter(
                codigo_registro__iexact=codigo.strip()
            ).first()

            if not casa_encontrada:
                raise serializers.ValidationError({"codigo_registro": "Código de convite/apartamento inválido!"})
        else:
            raise serializers.ValidationError({"codigo_registro": "O código de convite é obrigatório para cadastro."})

        # Validação biométrica facial antecipada se foto fornecida
        resultado_facial = None
        if foto_b64 and foto_b64.strip():
            from .facial_engine import processar_foto_facial
            resultado_facial = processar_foto_facial(foto_b64)
            if not resultado_facial.get('sucesso'):
                raise serializers.ValidationError({"foto_base64": resultado_facial.get('erro', 'Rosto não identificado ou de baixa qualidade.')})

        # Vincula automaticamente o morador à unidade E ao condomínio correspondente!
        usuario = Usuario.objects.create(
            **validated_data,
            endereco=casa_encontrada,
            condominio=casa_encontrada.condominio
        )
        if senha:
            usuario.set_password(senha)
            usuario.save()

        # Salva o registro biométrico se validado
        if resultado_facial and resultado_facial.get('sucesso'):
            from .models import BiometriaFacial
            BiometriaFacial.objects.create(
                condominio=casa_encontrada.condominio,
                usuario=usuario,
                tipo_pessoa='morador',
                foto_base64=resultado_facial['face_base64'],
                vetor_facial=resultado_facial['vetor'],
                qualidade_score=resultado_facial.get('brilho', 100.0),
                ativa=True
            )

        return usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Retorna dados do condomínio e perfil direto no token JWT."""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_sindico'] = bool(user.is_sindico or user.is_staff or user.is_superuser)
        token['nome'] = user.get_full_name() or user.username
        token['cpf'] = user.cpf
        if user.condominio:
            token['condominio_id'] = user.condominio.id
            token['condominio_nome'] = user.condominio.nome
        if user.endereco:
            token['unidade'] = f"Bloco {user.endereco.bloco} - Apto {user.endereco.numero}"
        return token

    def validate(self, attrs):
        if 'username' in attrs:
            attrs['username'] = limpar_cpf(attrs['username'])
            
        data = super().validate(attrs)
        user = self.user
        is_sindico = bool(user.is_sindico or user.is_staff or user.is_superuser)
        
        data['is_sindico'] = is_sindico
        data['user_id'] = user.id
        data['nome'] = user.get_full_name() or user.username
        data['cpf'] = user.cpf
        data['condominio_id'] = user.condominio.id if user.condominio else None
        data['condominio_nome'] = user.condominio.nome if user.condominio else "Administração Central"
        data['unidade'] = f"Bloco {user.endereco.bloco} - Apto {user.endereco.numero}" if user.endereco else "Sem Unidade"
        return data


class ChamadoSerializer(serializers.ModelSerializer):
    autor = UsuarioResumidoSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)

    class Meta:
        model = Chamado
        fields = [
            'id', 'condominio', 'condominio_nome', 'titulo', 'descricao',
            'status', 'status_display', 'categoria',
            'prioridade', 'prioridade_display', 'foto', 'resposta_sindico',
            'autor', 'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'autor', 'created_at', 'updated_at']


class AvisoSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source='autor.get_full_name', read_only=True)
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)

    class Meta:
        model = Aviso
        fields = [
            'id', 'condominio', 'condominio_nome', 'titulo', 'conteudo',
            'is_importante', 'autor', 'autor_nome', 'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'autor', 'created_at', 'updated_at']


from datetime import date
from .models import AreaComum, Reserva, BloqueioAreaComum

class BloqueioAreaComumSerializer(serializers.ModelSerializer):
    area_nome = serializers.CharField(source='area_comum.nome', read_only=True)
    bloqueado_por_nome = serializers.CharField(source='bloqueado_por.get_full_name', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)

    class Meta:
        model = BloqueioAreaComum
        fields = [
            'id', 'condominio', 'area_comum', 'area_nome', 'data',
            'periodo', 'periodo_display', 'motivo', 'bloqueado_por',
            'bloqueado_por_nome', 'created_at'
        ]
        read_only_fields = ['condominio', 'bloqueado_por', 'created_at']

class AreaComumSerializer(serializers.ModelSerializer):
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)

    class Meta:
        model = AreaComum
        fields = [
            'id', 'condominio', 'condominio_nome', 'nome', 'descricao',
            'capacidade_maxima', 'taxa_reserva', 'ativa',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'created_at', 'updated_at']


class ReservaSerializer(serializers.ModelSerializer):
    area_nome = serializers.CharField(source='area_comum.nome', read_only=True)
    area_taxa = serializers.DecimalField(source='area_comum.taxa_reserva', max_digits=8, decimal_places=2, read_only=True)
    morador_nome = serializers.CharField(source='morador.get_full_name', read_only=True)
    morador_unidade = serializers.CharField(source='morador.endereco.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)
    condominio_nome = serializers.CharField(source='condominio.nome', read_only=True)

    class Meta:
        model = Reserva
        fields = [
            'id', 'condominio', 'condominio_nome', 'area_comum', 'area_nome',
            'area_taxa', 'morador', 'morador_nome', 'morador_unidade',
            'data_reserva', 'periodo', 'periodo_display', 'status',
            'status_display', 'observacoes', 'resposta_sindico',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'morador', 'created_at', 'updated_at']

    def validate(self, attrs):
        data_reserva = attrs.get('data_reserva')
        if data_reserva and data_reserva < date.today():
            raise serializers.ValidationError({"data_reserva": "Não é possível reservar uma data que já passou."})

        area = attrs.get('area_comum')
        periodo = attrs.get('periodo', 'dia_inteiro')

        # Se estiver criando ou alterando data/período, checa bloqueios do síndico e conflito de agendamento
        if area and data_reserva:
            # 1. Checa se o síndico bloqueou esta data/período para manutenção/interdição
            bloqueios = BloqueioAreaComum.objects.filter(
                area_comum=area,
                data=data_reserva
            )
            conflito_bloqueio = (
                bloqueios.filter(periodo=periodo).exists() or
                bloqueios.filter(periodo='dia_inteiro').exists() or
                (periodo == 'dia_inteiro' and bloqueios.exists())
            )
            if conflito_bloqueio:
                motivo_b = bloqueios.first().motivo if bloqueios.exists() else "Indisponível pela Administração"
                raise serializers.ValidationError({
                    "data_reserva": f"O espaço '{area.nome}' está indisponível nesta data/horário por determinação da administração: {motivo_b}"
                })

            qs = Reserva.objects.filter(
                area_comum=area,
                data_reserva=data_reserva,
                status__in=['pendente', 'confirmada']
            )
            if self.instance:
                qs = qs.exclude(id=self.instance.id)

            # Conflito: se qualquer um dos dois for 'dia_inteiro' ou ambos forem o mesmo período
            conflito = qs.filter(periodo=periodo).exists() or qs.filter(periodo='dia_inteiro').exists() or (periodo == 'dia_inteiro' and qs.exists())
            if conflito:
                raise serializers.ValidationError({
                    "data_reserva": f"O espaço '{area.nome}' já possui uma reserva agendada para esta data e horário."
                })

        return attrs


from .models import Encomenda

class EncomendaSerializer(serializers.ModelSerializer):
    unidade_str = serializers.CharField(source='endereco.__str__', read_only=True)
    bloco = serializers.CharField(source='endereco.bloco', read_only=True)
    numero = serializers.CharField(source='endereco.numero', read_only=True)
    morador_nome = serializers.CharField(source='morador.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    recebido_por_nome = serializers.CharField(source='recebido_por.get_full_name', read_only=True)

    class Meta:
        model = Encomenda
        fields = [
            'id', 'condominio', 'endereco', 'unidade_str', 'bloco', 'numero',
            'morador', 'morador_nome', 'empresa_entrega',
            'codigo_rastreio', 'codigo_retirada', 'descricao',
            'status', 'status_display', 'recebido_por_nome',
            'data_recebimento', 'data_retirada'
        ]
        read_only_fields = ['condominio', 'codigo_retirada', 'recebido_por', 'data_recebimento', 'data_retirada']

    def create(self, validated_data):
        user = self.context['request'].user
        condominio = user.condominio
        endereco = validated_data.get('endereco')
        
        # Se destinatário não foi passado explicitamente, tenta vincular ao morador da unidade
        morador = validated_data.get('morador')
        if not morador and endereco:
            morador = endereco.moradores.first()
            
        return Encomenda.objects.create(
            condominio=condominio,
            recebido_por=user,
            morador=morador,
            **validated_data
        )


from .models import AutorizacaoAcesso, DocumentoCondominio, Enquete, VotoEnquete

class AutorizacaoAcessoSerializer(serializers.ModelSerializer):
    unidade_str = serializers.CharField(source='endereco.__str__', read_only=True)
    bloco = serializers.CharField(source='endereco.bloco', read_only=True)
    numero = serializers.CharField(source='endereco.numero', read_only=True)
    morador_nome = serializers.CharField(source='morador.get_full_name', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AutorizacaoAcesso
        fields = [
            'id', 'condominio', 'endereco', 'unidade_str', 'bloco', 'numero',
            'morador', 'morador_nome', 'nome_visitante', 'documento',
            'tipo', 'tipo_display', 'data_prevista', 'placa_veiculo',
            'observacoes', 'status', 'status_display',
            'data_entrada', 'data_saida', 'created_at'
        ]
        read_only_fields = ['condominio', 'morador', 'endereco', 'data_entrada', 'data_saida', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        condominio = user.condominio
        endereco = user.endereco
        if not endereco and not user.is_superuser:
            raise serializers.ValidationError({"endereco": "O morador precisa estar vinculado a uma unidade para liberar acesso."})
            
        return AutorizacaoAcesso.objects.create(
            condominio=condominio,
            morador=user,
            endereco=endereco,
            **validated_data
        )


class DocumentoCondominioSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    criado_por_nome = serializers.CharField(source='criado_por.get_full_name', read_only=True)
    tamanho_kb = serializers.SerializerMethodField()

    class Meta:
        model = DocumentoCondominio
        fields = [
            'id', 'condominio', 'titulo', 'categoria', 'categoria_display',
            'arquivo', 'descricao', 'criado_por_nome', 'tamanho_kb', 'created_at'
        ]
        read_only_fields = ['condominio', 'criado_por', 'created_at']

    def get_tamanho_kb(self, obj):
        try:
            return round(obj.arquivo.size / 1024, 1)
        except Exception:
            return 0

    def create(self, validated_data):
        user = self.context['request'].user
        return DocumentoCondominio.objects.create(
            condominio=user.condominio,
            criado_por=user,
            **validated_data
        )


class EnqueteSerializer(serializers.ModelSerializer):
    total_votos = serializers.IntegerField(source='votos.count', read_only=True)
    votos_opcao_1 = serializers.SerializerMethodField()
    votos_opcao_2 = serializers.SerializerMethodField()
    votos_opcao_3 = serializers.SerializerMethodField()
    votos_opcao_4 = serializers.SerializerMethodField()
    minha_opcao_votada = serializers.SerializerMethodField()

    class Meta:
        model = Enquete
        fields = [
            'id', 'condominio', 'titulo', 'descricao', 'data_limite', 'ativa',
            'opcao_1', 'opcao_2', 'opcao_3', 'opcao_4',
            'total_votos', 'votos_opcao_1', 'votos_opcao_2', 'votos_opcao_3', 'votos_opcao_4',
            'minha_opcao_votada', 'created_at'
        ]
        read_only_fields = ['condominio', 'criado_por', 'created_at']

    def get_votos_opcao_1(self, obj):
        return obj.votos.filter(opcao_escolhida=1).count()

    def get_votos_opcao_2(self, obj):
        return obj.votos.filter(opcao_escolhida=2).count()

    def get_votos_opcao_3(self, obj):
        return obj.votos.filter(opcao_escolhida=3).count()

    def get_votos_opcao_4(self, obj):
        return obj.votos.filter(opcao_escolhida=4).count()

    def get_minha_opcao_votada(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated and user.endereco:
            voto = obj.votos.filter(endereco=user.endereco).first()
            if voto:
                return voto.opcao_escolhida
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        return Enquete.objects.create(
            condominio=user.condominio,
            criado_por=user,
            **validated_data
        )


# ==============================================================================
# SERIALIZERS DE RECONHECIMENTO FACIAL E CONTROLE DE ACESSO
# ==============================================================================

from .models import Visitante, BiometriaFacial, RegistroAcesso

class VisitanteSerializer(serializers.ModelSerializer):
    morador_nome = serializers.CharField(source='morador.get_full_name', read_only=True)
    morador_unidade = serializers.CharField(source='endereco.__str__', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tem_biometria = serializers.SerializerMethodField()
    foto_biometria = serializers.SerializerMethodField()

    class Meta:
        model = Visitante
        fields = [
            'id', 'condominio', 'morador', 'morador_nome', 'endereco', 'morador_unidade',
            'tipo', 'tipo_display', 'nome', 'documento', 'telefone', 'empresa',
            'data_inicio', 'data_fim', 'periodo', 'periodo_display',
            'status', 'status_display', 'codigo_acesso', 'observacoes',
            'tem_biometria', 'foto_biometria', 'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'morador', 'endereco', 'codigo_acesso', 'created_at', 'updated_at']

    def get_tem_biometria(self, obj):
        return obj.biometrias.filter(ativa=True).exists()

    def get_foto_biometria(self, obj):
        bio = obj.biometrias.filter(ativa=True).first()
        return bio.foto_base64 if bio else ''


class BiometriaFacialSerializer(serializers.ModelSerializer):
    pessoa_nome = serializers.SerializerMethodField()
    pessoa_unidade = serializers.SerializerMethodField()
    tipo_pessoa_display = serializers.CharField(source='get_tipo_pessoa_display', read_only=True)

    class Meta:
        model = BiometriaFacial
        fields = [
            'id', 'condominio', 'usuario', 'visitante', 'tipo_pessoa', 'tipo_pessoa_display',
            'foto_base64', 'qualidade_score', 'ativa', 'pessoa_nome', 'pessoa_unidade',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['condominio', 'created_at', 'updated_at']

    def get_pessoa_nome(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        if obj.visitante:
            return obj.visitante.nome
        return "Desconhecido"

    def get_pessoa_unidade(self, obj):
        if obj.usuario and obj.usuario.endereco:
            return str(obj.usuario.endereco)
        if obj.visitante and obj.visitante.endereco:
            return str(obj.visitante.endereco)
        return "Sem Unidade"


class RegistroAcessoSerializer(serializers.ModelSerializer):
    tipo_pessoa_display = serializers.CharField(source='get_tipo_pessoa_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RegistroAcesso
        fields = [
            'id', 'condominio', 'tipo_pessoa', 'tipo_pessoa_display',
            'usuario', 'visitante', 'nome_identificado', 'destino',
            'status', 'status_display', 'motivo', 'similaridade',
            'foto_capturada', 'dispositivo_ponto', 'created_at'
        ]
        read_only_fields = ['condominio', 'created_at']

