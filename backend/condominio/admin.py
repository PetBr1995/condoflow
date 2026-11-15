from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Condominio, Usuario, Endereco, Chamado, Aviso

@admin.register(Condominio)
class CondominioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'codigo_identificador', 'cidade', 'estado', 'plano', 'ativo', 'created_at')
    list_filter = ('plano', 'ativo', 'estado')
    search_fields = ('nome', 'cnpj', 'codigo_identificador', 'cidade')
    readonly_fields = ('codigo_identificador', 'created_at', 'updated_at')


@admin.register(Endereco)
class EnderecoAdmin(admin.ModelAdmin):
    list_display = ('condominio', 'bloco', 'numero', 'andar', 'codigo_registro', 'created_at')
    search_fields = ('bloco', 'numero', 'codigo_registro', 'condominio__nome')
    list_filter = ('condominio', 'bloco')
    readonly_fields = ('codigo_registro', 'created_at', 'updated_at')


@admin.register(Usuario)
class UsuarioCustomAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'cpf', 'condominio', 'endereco', 'is_sindico', 'is_staff')
    list_filter = ('condominio', 'is_sindico', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'cpf', 'telefone')
    fieldsets = UserAdmin.fieldsets + (
        ('Dados Condominiais', {'fields': ('condominio', 'cpf', 'telefone', 'is_sindico', 'endereco', 'foto_perfil')}),
    )


@admin.register(Chamado)
class ChamadoAdmin(admin.ModelAdmin):
    list_display = ('id', 'condominio', 'titulo', 'status', 'categoria', 'prioridade', 'autor', 'created_at')
    list_filter = ('condominio', 'status', 'prioridade', 'categoria', 'created_at')
    search_fields = ('titulo', 'descricao', 'autor__first_name', 'autor__cpf')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Aviso)
class AvisoAdmin(admin.ModelAdmin):
    list_display = ('condominio', 'titulo', 'autor', 'is_importante', 'created_at')
    list_filter = ('condominio', 'is_importante', 'created_at')
    search_fields = ('titulo', 'conteudo')
    readonly_fields = ('created_at', 'updated_at')


from .models import AreaComum, Reserva

@admin.register(AreaComum)
class AreaComumAdmin(admin.ModelAdmin):
    list_display = ('nome', 'condominio', 'capacidade_maxima', 'taxa_reserva', 'ativa', 'created_at')
    list_filter = ('condominio', 'ativa')
    search_fields = ('nome', 'descricao', 'condominio__nome')


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('id', 'condominio', 'area_comum', 'morador', 'data_reserva', 'periodo', 'status', 'created_at')
    list_filter = ('condominio', 'status', 'periodo', 'data_reserva')
    search_fields = ('area_comum__nome', 'morador__first_name', 'morador__cpf')
    readonly_fields = ('created_at', 'updated_at')


from .models import Encomenda

@admin.register(Encomenda)
class EncomendaAdmin(admin.ModelAdmin):
    list_display = ('id', 'condominio', 'endereco', 'empresa_entrega', 'codigo_retirada', 'status', 'data_recebimento')
    list_filter = ('condominio', 'status', 'empresa_entrega')
    search_fields = ('endereco__bloco', 'endereco__numero', 'codigo_rastreio', 'codigo_retirada')
    readonly_fields = ('codigo_retirada', 'data_recebimento', 'data_retirada')


from .models import AutorizacaoAcesso, DocumentoCondominio, Enquete, VotoEnquete

@admin.register(AutorizacaoAcesso)
class AutorizacaoAcessoAdmin(admin.ModelAdmin):
    list_display = ('nome_visitante', 'tipo', 'endereco', 'data_prevista', 'status', 'created_at')
    list_filter = ('condominio', 'status', 'tipo', 'data_prevista')
    search_fields = ('nome_visitante', 'documento', 'placa_veiculo', 'endereco__numero')


@admin.register(DocumentoCondominio)
class DocumentoCondominioAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'condominio', 'criado_por', 'created_at')
    list_filter = ('condominio', 'categoria')
    search_fields = ('titulo', 'descricao')


@admin.register(Enquete)
class EnqueteAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'condominio', 'data_limite', 'ativa', 'created_at')
    list_filter = ('condominio', 'ativa')
    search_fields = ('titulo', 'descricao')


@admin.register(VotoEnquete)
class VotoEnqueteAdmin(admin.ModelAdmin):
    list_display = ('enquete', 'endereco', 'morador', 'opcao_escolhida', 'created_at')
    list_filter = ('opcao_escolhida',)
