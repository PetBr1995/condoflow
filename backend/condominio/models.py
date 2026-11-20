from django.db import models
from django.contrib.auth.models import AbstractUser
import string
import random

class Condominio(models.Model):
    """Entidade central do Multi-Tenancy (representa cada condomínio cliente do SaaS)."""
    PLANO_CHOICES = [
        ('trial', 'Período de Testes (Trial 30 dias)'),
        ('basico', 'Básico (Até 50 unidades)'),
        ('pro', 'Profissional (Até 150 unidades)'),
        ('enterprise', 'Enterprise (Ilimitado)'),
    ]

    nome = models.CharField(max_length=120, verbose_name="Nome do Condomínio")
    cnpj = models.CharField(max_length=18, blank=True, null=True, unique=True, verbose_name="CNPJ")
    codigo_identificador = models.CharField(max_length=20, unique=True, verbose_name="Identificador Único (Código)")
    cidade = models.CharField(max_length=60, default="Manaus", verbose_name="Cidade")
    estado = models.CharField(max_length=2, default="AM", verbose_name="UF")
    plano = models.CharField(max_length=20, choices=PLANO_CHOICES, default='trial', verbose_name="Plano Contratado")
    ativo = models.BooleanField(default=True, verbose_name="Assinatura Ativa?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Cadastrado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Condomínio (Cliente SaaS)"
        verbose_name_plural = "Condomínios (Clientes SaaS)"
        ordering = ['nome']

    def save(self, *args, **kwargs):
        if not self.codigo_identificador:
            slug_base = ''.join(filter(str.isalnum, self.nome.upper()))[:6] or "CONDO"
            aleatorio = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
            self.codigo_identificador = f"{slug_base}{aleatorio}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nome} [{self.codigo_identificador}]"


class Endereco(models.Model):
    """Representa uma unidade habitacional (apartamento/bloco) dentro de um condomínio específico."""
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='unidades', verbose_name="Condomínio")
    bloco = models.CharField(max_length=10, verbose_name="Bloco")
    numero = models.CharField(max_length=10, verbose_name="Apartamento / Número")
    andar = models.CharField(max_length=5, blank=True, null=True, verbose_name="Andar")
    codigo_registro = models.CharField(max_length=30, unique=True, null=True, blank=True, verbose_name="Código de Convite do Morador")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Unidade / Endereço"
        verbose_name_plural = "Unidades / Endereços"
        unique_together = ('condominio', 'bloco', 'numero')
        ordering = ['condominio', 'bloco', 'numero']

    def save(self, *args, **kwargs):
        if not self.codigo_registro:
            letras_aleatorias = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            bloco_limpo = self.bloco.strip().upper().replace(" ", "")
            num_limpo = self.numero.strip().upper().replace(" ", "")
            prefixo = self.condominio.codigo_identificador if self.condominio_id else "UNID"
            self.codigo_registro = f"{prefixo}-{bloco_limpo}{num_limpo}-{letras_aleatorias}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.condominio.nome} | Bloco {self.bloco} - Apto {self.numero}"


class Usuario(AbstractUser):
    condominio = models.ForeignKey(Condominio, on_delete=models.SET_NULL, null=True, blank=True, related_name='usuarios', verbose_name="Condomínio")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, blank=True, default="", verbose_name="Telefone / Celular")
    is_sindico = models.BooleanField(default=False, verbose_name="É Síndico?")
    endereco = models.ForeignKey(Endereco, on_delete=models.SET_NULL, null=True, blank=True, related_name='moradores', verbose_name="Unidade")
    foto_perfil = models.ImageField(upload_to='perfis/', null=True, blank=True, verbose_name="Foto de Perfil")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"

    def __str__(self):
        nome_completo = self.get_full_name()
        return nome_completo if nome_completo else self.username


class Chamado(models.Model):
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]

    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='chamados', verbose_name="Condomínio")
    titulo = models.CharField(max_length=80, verbose_name="Título")
    descricao = models.TextField(verbose_name="Descrição do Chamado")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberto', verbose_name="Status")
    categoria = models.CharField(max_length=60, default='Outros', blank=True, verbose_name="Categoria")
    prioridade = models.CharField(max_length=20, choices=PRIORIDADE_CHOICES, default='media', blank=True, verbose_name="Prioridade")
    foto = models.ImageField(upload_to='chamados/', null=True, blank=True, verbose_name="Foto do Chamado")
    resposta_sindico = models.TextField(blank=True, null=True, verbose_name="Resposta / Parecer da Administração")
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='chamados', verbose_name="Morador Autor")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Aberto em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Chamado"
        verbose_name_plural = "Chamados"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.condominio.codigo_identificador}] #{self.id} - {self.titulo}"


class Aviso(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='avisos', verbose_name="Condomínio")
    titulo = models.CharField(max_length=100, verbose_name="Título do Comunicado")
    conteudo = models.TextField(verbose_name="Conteúdo")
    is_importante = models.BooleanField(default=False, verbose_name="Destacar / Urgente?")
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='avisos', verbose_name="Autor")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Publicado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Aviso / Comunicado"
        verbose_name_plural = "Avisos e Comunicados"
        ordering = ['-is_importante', '-created_at']

    def __str__(self):
        return f"[{self.condominio.codigo_identificador}] {self.titulo}"


class AreaComum(models.Model):
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='areas_comuns', verbose_name="Condomínio")
    nome = models.CharField(max_length=80, verbose_name="Nome do Espaço")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição / Regras de Uso")
    capacidade_maxima = models.PositiveIntegerField(default=20, verbose_name="Capacidade Máxima (Pessoas)")
    taxa_reserva = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, verbose_name="Taxa de Reserva / Limpeza (R$)")
    ativa = models.BooleanField(default=True, verbose_name="Disponível para Reserva?")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Cadastrado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Área Comum"
        verbose_name_plural = "Áreas Comuns"
        ordering = ['nome']

    def __str__(self):
        return f"{self.nome} ({self.condominio.nome})"


class Reserva(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente de Aprovação'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('rejeitada', 'Rejeitada'),
    ]

    PERIODO_CHOICES = [
        ('dia_inteiro', 'Dia Inteiro (08:00 às 22:00)'),
        ('manha', 'Manhã (08:00 às 13:00)'),
        ('tarde', 'Tarde (13:00 às 18:00)'),
        ('noite', 'Noite (18:00 às 23:00)'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='reservas', verbose_name="Condomínio")
    area_comum = models.ForeignKey(AreaComum, on_delete=models.CASCADE, related_name='reservas', verbose_name="Espaço")
    morador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reservas', verbose_name="Morador Solicitante")
    data_reserva = models.DateField(verbose_name="Data da Reserva")
    periodo = models.CharField(max_length=20, choices=PERIODO_CHOICES, default='dia_inteiro', verbose_name="Período")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente', verbose_name="Status da Reserva")
    observacoes = models.TextField(blank=True, null=True, verbose_name="Observações / Finalidade do Evento")
    resposta_sindico = models.TextField(blank=True, null=True, verbose_name="Parecer do Síndico")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Solicitado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Reserva de Espaço"
        verbose_name_plural = "Reservas de Espaços"
        ordering = ['-data_reserva', '-created_at']

    def __str__(self):
        return f"{self.area_comum.nome} - {self.data_reserva} ({self.get_status_display()})"


class BloqueioAreaComum(models.Model):
    """Permite ao síndico definir dias e horários indisponíveis para reserva (ex: manutenção, limpeza, reformas)."""
    PERIODO_CHOICES = Reserva.PERIODO_CHOICES

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='bloqueios_area', verbose_name="Condomínio")
    area_comum = models.ForeignKey(AreaComum, on_delete=models.CASCADE, related_name='bloqueios', verbose_name="Espaço")
    data = models.DateField(verbose_name="Data Bloqueada")
    periodo = models.CharField(max_length=20, choices=PERIODO_CHOICES, default='dia_inteiro', verbose_name="Período")
    motivo = models.CharField(max_length=150, default="Indisponível pela Administração (Manutenção / Limpeza)", verbose_name="Motivo do Bloqueio")
    bloqueado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='bloqueios_criados', verbose_name="Bloqueado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Bloqueado em")

    class Meta:
        verbose_name = "Bloqueio de Área Comum (Síndico)"
        verbose_name_plural = "Bloqueios de Áreas Comuns (Síndico)"
        ordering = ['-data']
        unique_together = ('area_comum', 'data', 'periodo')

    def __str__(self):
        return f"[Bloqueio Síndico] {self.area_comum.nome} - {self.data} ({self.periodo})"


class Encomenda(models.Model):
    """Módulo de Portaria: Registro de encomendas e pacotes entregues na portaria."""
    STATUS_CHOICES = [
        ('aguardando_retirada', 'Aguardando Retirada'),
        ('entregue', 'Entregue ao Morador'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='encomendas', verbose_name="Condomínio")
    endereco = models.ForeignKey(Endereco, on_delete=models.CASCADE, related_name='encomendas', verbose_name="Unidade / Apartamento")
    morador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='encomendas', verbose_name="Morador Notificado")
    empresa_entrega = models.CharField(max_length=60, default="Mercado Livre", verbose_name="Transportadora / Origem")
    codigo_rastreio = models.CharField(max_length=40, blank=True, default="", verbose_name="Código de Rastreio / Etiqueta")
    codigo_retirada = models.CharField(max_length=20, blank=True, verbose_name="Código de Retirada")
    descricao = models.CharField(max_length=120, blank=True, default="Pacote / Caixa", verbose_name="Descrição da Encomenda")
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='aguardando_retirada', verbose_name="Status")
    recebido_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='encomendas_recebidas', verbose_name="Recebido por")
    data_recebimento = models.DateTimeField(auto_now_add=True, verbose_name="Recebido em")
    data_retirada = models.DateTimeField(null=True, blank=True, verbose_name="Entregue em")

    class Meta:
        verbose_name = "Encomenda na Portaria"
        verbose_name_plural = "Encomendas na Portaria"
        ordering = ['-data_recebimento']

    def save(self, *args, **kwargs):
        if not self.codigo_retirada:
            aleatorio = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
            bloco = self.endereco.bloco.strip().upper() if self.endereco else "U"
            num = self.endereco.numero.strip().upper() if self.endereco else "0"
            self.codigo_retirada = f"{bloco}{num}-{aleatorio}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.endereco} | {self.empresa_entrega} ({self.get_status_display()})"


class AutorizacaoAcesso(models.Model):
    """Controle de Portaria: Liberação prévia de visitantes e prestadores de serviço."""
    TIPO_CHOICES = [
        ('visitante', 'Visitante / Amigo / Familiar'),
        ('prestador', 'Prestador de Serviço'),
        ('delivery', 'Entregador / Delivery'),
    ]

    STATUS_CHOICES = [
        ('autorizado', 'Aguardando Entrada'),
        ('no_condominio', 'Presente no Condomínio'),
        ('finalizado', 'Saída Registrada'),
        ('cancelado', 'Cancelado'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='autorizacoes_acesso', verbose_name="Condomínio")
    morador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='autorizacoes_acesso', verbose_name="Morador Responsável")
    endereco = models.ForeignKey(Endereco, on_delete=models.CASCADE, related_name='autorizacoes_acesso', verbose_name="Unidade")
    nome_visitante = models.CharField(max_length=100, verbose_name="Nome do Visitante / Prestador")
    documento = models.CharField(max_length=20, blank=True, default="", verbose_name="RG ou CPF")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='visitante', verbose_name="Tipo de Acesso")
    data_prevista = models.DateField(verbose_name="Data Prevista")
    placa_veiculo = models.CharField(max_length=10, blank=True, default="", verbose_name="Placa do Veículo (se houver)")
    observacoes = models.TextField(blank=True, default="", verbose_name="Observações / Empresa")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='autorizado', verbose_name="Status")
    data_entrada = models.DateTimeField(null=True, blank=True, verbose_name="Horário de Entrada")
    data_saida = models.DateTimeField(null=True, blank=True, verbose_name="Horário de Saída")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Autorizado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Autorização de Acesso (Portaria)"
        verbose_name_plural = "Autorizações de Acesso (Portaria)"
        ordering = ['-data_prevista', '-created_at']

    def __str__(self):
        return f"{self.nome_visitante} -> {self.endereco} ({self.get_status_display()})"


class DocumentoCondominio(models.Model):
    """Repositório de Arquivos Oficiais: Atas, Convenção, Regimentos e Balancetes."""
    CATEGORIA_CHOICES = [
        ('regimento', 'Regimento Interno & Convenção'),
        ('ata', 'Ata de Assembleia'),
        ('financeiro', 'Prestação de Contas / Balancete'),
        ('comunicado', 'Circular / Edital Oficial'),
        ('outros', 'Outros Documentos'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='documentos', verbose_name="Condomínio")
    titulo = models.CharField(max_length=100, verbose_name="Título do Documento")
    categoria = models.CharField(max_length=25, choices=CATEGORIA_CHOICES, default='outros', verbose_name="Categoria")
    arquivo = models.FileField(upload_to='documentos/', verbose_name="Arquivo (PDF / Imagem)")
    descricao = models.TextField(blank=True, default="", verbose_name="Descrição / Observações")
    criado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='documentos_postados', verbose_name="Publicado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Publicado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Documento Oficial"
        verbose_name_plural = "Documentos Oficiais"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_categoria_display()}] {self.titulo}"


class Enquete(models.Model):
    """Assembleia Ágil: Votações e consultas rápidas entre os moradores."""
    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='enquetes', verbose_name="Condomínio")
    titulo = models.CharField(max_length=120, verbose_name="Pergunta / Título da Votação")
    descricao = models.TextField(blank=True, default="", verbose_name="Contexto / Justificativa")
    data_limite = models.DateField(verbose_name="Votação Aberta Até")
    ativa = models.BooleanField(default=True, verbose_name="Votação Ativa?")
    opcao_1 = models.CharField(max_length=80, verbose_name="Opção 1")
    opcao_2 = models.CharField(max_length=80, verbose_name="Opção 2")
    opcao_3 = models.CharField(max_length=80, blank=True, default="", verbose_name="Opção 3")
    opcao_4 = models.CharField(max_length=80, blank=True, default="", verbose_name="Opção 4")
    criado_por = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='enquetes_criadas', verbose_name="Criado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Aberta em")

    class Meta:
        verbose_name = "Enquete / Votação"
        verbose_name_plural = "Enquetes e Votações"
        ordering = ['-ativa', '-created_at']

    def __str__(self):
        return self.titulo


class VotoEnquete(models.Model):
    """Registro auditado de voto por unidade (1 voto por apartamento)."""
    enquete = models.ForeignKey(Enquete, on_delete=models.CASCADE, related_name='votos')
    morador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='meus_votos')
    endereco = models.ForeignKey(Endereco, on_delete=models.CASCADE, related_name='votos_unidade')
    opcao_escolhida = models.PositiveSmallIntegerField(verbose_name="Número da Opção Votada")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Votado em")

    class Meta:
        verbose_name = "Voto de Enquete"
        verbose_name_plural = "Votos de Enquetes"
        unique_together = ('enquete', 'endereco')

    def __str__(self):
        return f"{self.endereco} votou na Opção {self.opcao_escolhida} na Enquete #{self.enquete_id}"


# ==============================================================================
# CONTROLE DE ACESSO E RECONHECIMENTO FACIAL
# ==============================================================================

class Visitante(models.Model):
    """Cadastro de visitantes e prestadores de serviço autorizados com regras de período."""
    TIPO_CHOICES = [
        ('visitante', 'Visitante / Convidado'),
        ('prestador', 'Prestador de Serviço / Técnico'),
        ('delivery', 'Entregador Frequente'),
    ]

    PERIODO_CHOICES = [
        ('dia_inteiro', 'Qualquer Horário (06h às 23h)'),
        ('comercial', 'Horário Comercial (08h às 18h)'),
        ('manha', 'Manhã (08h às 12h)'),
        ('tarde', 'Tarde (13h às 18h)'),
        ('noite', 'Noite (18h às 23h)'),
    ]

    STATUS_CHOICES = [
        ('ativo', 'Autorizado / Ativo'),
        ('expirado', 'Expirado'),
        ('bloqueado', 'Bloqueado'),
        ('concluido', 'Visita Concluída'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='visitantes', verbose_name="Condomínio")
    morador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='visitantes_convidados', verbose_name="Morador Responsável")
    endereco = models.ForeignKey(Endereco, on_delete=models.SET_NULL, null=True, blank=True, related_name='visitantes', verbose_name="Unidade de Destino")
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='visitante', verbose_name="Tipo de Acesso")
    nome = models.CharField(max_length=120, verbose_name="Nome Completo")
    documento = models.CharField(max_length=30, blank=True, default="", verbose_name="RG ou CPF")
    telefone = models.CharField(max_length=20, blank=True, default="", verbose_name="WhatsApp / Telefone")
    empresa = models.CharField(max_length=80, blank=True, default="", verbose_name="Empresa / Serviço (ex: Enel, Pintor)")
    
    data_inicio = models.DateField(verbose_name="Liberado a partir de")
    data_fim = models.DateField(verbose_name="Válido até")
    periodo = models.CharField(max_length=20, choices=PERIODO_CHOICES, default='dia_inteiro', verbose_name="Faixa de Horário Permitida")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo', verbose_name="Status do Convite")
    codigo_acesso = models.CharField(max_length=20, blank=True, null=True, unique=True, verbose_name="Código do Convite / Token")
    observacoes = models.TextField(blank=True, default="", verbose_name="Observações / Instruções")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Visitante / Prestador"
        verbose_name_plural = "Visitantes e Prestadores"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.codigo_acesso:
            aleatorio = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            self.codigo_acesso = f"CF-{aleatorio}"
        if not self.endereco and self.morador and self.morador.endereco:
            self.endereco = self.morador.endereco
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.get_tipo_display()}] {self.nome} -> {self.endereco or 'Geral'}"


class BiometriaFacial(models.Model):
    """Armazenamento do vetor biométrico facial para moradores e visitantes."""
    TIPO_PESSOA_CHOICES = [
        ('morador', 'Morador'),
        ('visitante', 'Visitante'),
        ('prestador', 'Prestador de Serviço'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='biometrias', verbose_name="Condomínio")
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='biometrias', null=True, blank=True, verbose_name="Morador")
    visitante = models.ForeignKey(Visitante, on_delete=models.CASCADE, related_name='biometrias', null=True, blank=True, verbose_name="Visitante / Prestador")
    
    tipo_pessoa = models.CharField(max_length=20, choices=TIPO_PESSOA_CHOICES, default='morador', verbose_name="Tipo de Pessoa")
    foto_base64 = models.TextField(verbose_name="Foto do Rosto (Base64)")
    vetor_facial = models.JSONField(default=list, verbose_name="Vetor Numérico Facial (128d)")
    qualidade_score = models.FloatField(default=1.0, verbose_name="Índice de Qualidade / Iluminação")
    ativa = models.BooleanField(default=True, verbose_name="Biometria Ativa?")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Capturada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")

    class Meta:
        verbose_name = "Biometria Facial"
        verbose_name_plural = "Biometrias Faciais"
        ordering = ['-created_at']

    def __str__(self):
        nome = self.usuario.get_full_name() if self.usuario else (self.visitante.nome if self.visitante else "Desconhecido")
        return f"Biometria Facial [{self.get_tipo_pessoa_display()}]: {nome}"


class RegistroAcesso(models.Model):
    """Log de auditoria em tempo real de cada leitura facial na portaria/totem."""
    TIPO_PESSOA_CHOICES = [
        ('morador', 'Morador'),
        ('visitante', 'Visitante'),
        ('prestador', 'Prestador de Serviço'),
        ('desconhecido', 'Não Identificado'),
    ]

    STATUS_CHOICES = [
        ('autorizado', 'Acesso Liberado'),
        ('negado', 'Acesso Negado (Não Reconhecido)'),
        ('fora_horario', 'Acesso Negado (Fora do Horário Permitido)'),
        ('expirado', 'Acesso Negado (Convite Expirado)'),
        ('bloqueado', 'Acesso Negado (Bloqueado pela Administração)'),
    ]

    condominio = models.ForeignKey(Condominio, on_delete=models.CASCADE, related_name='registros_acesso', verbose_name="Condomínio")
    tipo_pessoa = models.CharField(max_length=20, choices=TIPO_PESSOA_CHOICES, default='desconhecido')
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='acessos_registrados')
    visitante = models.ForeignKey(Visitante, on_delete=models.SET_NULL, null=True, blank=True, related_name='acessos_registrados')
    
    nome_identificado = models.CharField(max_length=120, blank=True, default="Pessoa Desconhecida", verbose_name="Nome Identificado")
    destino = models.CharField(max_length=80, blank=True, default="", verbose_name="Destino (Bloco / Apto)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='negado', verbose_name="Status do Acesso")
    motivo = models.CharField(max_length=200, blank=True, default="", verbose_name="Motivo / Detalhes")
    similaridade = models.FloatField(default=0.0, verbose_name="Grau de Similaridade (%)")
    foto_capturada = models.TextField(blank=True, default="", verbose_name="Foto Capturada na Câmera (Base64)")
    dispositivo_ponto = models.CharField(max_length=80, default="Portão Principal Pedestres", verbose_name="Ponto de Acesso / Totem")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Horário da Leitura")

    class Meta:
        verbose_name = "Registro de Acesso"
        verbose_name_plural = "Histórico de Acessos"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at.strftime('%d/%m/%Y %H:%M:%S')}] {self.nome_identificado} -> {self.get_status_display()}"

