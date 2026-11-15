from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from condominio.models import (
    Condominio,
    Endereco,
    AreaComum,
    Aviso,
    Enquete,
    Chamado
)

Usuario = get_user_model()

class Command(BaseCommand):
    help = "Popula o banco de produção de forma idempotente com condomínios e usuários de teste"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Verificando / populando dados iniciais no banco de produção..."))

        # 1. SuperAdmin da Plataforma SaaS
        admin_user, created = Usuario.objects.get_or_create(
            username="99999999999",
            defaults={
                'cpf': "99999999999",
                'first_name': "SuperAdmin",
                'last_name': "SaaS",
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("SuperAdmin (99999999999) criado com sucesso!"))
        else:
            admin_user.set_password("admin123")
            admin_user.save()

        # 2. Condomínio 1: Residencial Flores de Manaus
        condo1, _ = Condominio.objects.get_or_create(
            cnpj="12345678000190",
            defaults={
                'nome': "Residencial Flores de Manaus",
                'codigo_identificador': "FLOR",
                'cidade': "Manaus",
                'estado': "AM",
                'plano': "profissional",
                'ativo': True
            }
        )

        # 3. Condomínio 2: Condomínio Parque do Sol
        condo2, _ = Condominio.objects.get_or_create(
            cnpj="98765432000110",
            defaults={
                'nome': "Condomínio Parque do Sol",
                'codigo_identificador': "SOL",
                'cidade': "Manaus",
                'estado': "AM",
                'plano': "essencial",
                'ativo': True
            }
        )

        # 4. Unidades de Flores de Manaus
        unidade_a101, _ = Endereco.objects.get_or_create(
            condominio=condo1, bloco="A", numero="101",
            defaults={'andar': "1"}
        )
        unidade_a102, _ = Endereco.objects.get_or_create(
            condominio=condo1, bloco="A", numero="102",
            defaults={'andar': "1"}
        )
        unidade_b201, _ = Endereco.objects.get_or_create(
            condominio=condo1, bloco="B", numero="201",
            defaults={'andar': "2"}
        )

        # 5. Síndico 1 (Flores de Manaus)
        sindico1, created = Usuario.objects.get_or_create(
            username="00000000000",
            defaults={
                'cpf': "00000000000",
                'first_name': "Carlos",
                'last_name': "Síndico Flores",
                'is_sindico': True,
                'condominio': condo1,
                'telefone': "92981112233"
            }
        )
        if created:
            sindico1.set_password("admin123")
            sindico1.save()
        else:
            sindico1.condominio = condo1
            sindico1.is_sindico = True
            sindico1.set_password("admin123")
            sindico1.save()

        # 6. Síndica 2 (Parque do Sol)
        sindica2, created = Usuario.objects.get_or_create(
            username="11111111111",
            defaults={
                'cpf': "11111111111",
                'first_name': "Ana",
                'last_name': "Paula Síndica",
                'is_sindico': True,
                'condominio': condo2,
                'telefone': "92992223344"
            }
        )
        if created:
            sindica2.set_password("admin123")
            sindica2.save()
        else:
            sindica2.condominio = condo2
            sindica2.is_sindico = True
            sindica2.set_password("admin123")
            sindica2.save()

        # 7. Morador Peterson Brito (Flores de Manaus - A101)
        morador, created = Usuario.objects.get_or_create(
            username="02343536279",
            defaults={
                'cpf': "02343536279",
                'first_name': "Peterson",
                'last_name': "Brito",
                'is_sindico': False,
                'condominio': condo1,
                'endereco': unidade_a101,
                'telefone': "92984445566"
            }
        )
        if created:
            morador.set_password("admin123")
            morador.save()
        else:
            morador.condominio = condo1
            morador.endereco = unidade_a101
            morador.set_password("admin123")
            morador.save()

        # 8. Áreas Comuns
        AreaComum.objects.get_or_create(
            condominio=condo1,
            nome="Churrasqueira Gourmet",
            defaults={
                'capacidade_maxima': 25,
                'taxa_reserva': 50.00,
                'descricao': "Espaço com grelha, freezer, bancada e mesas.",
                'ativa': True
            }
        )
        AreaComum.objects.get_or_create(
            condominio=condo1,
            nome="Salão de Festas Climatizado",
            defaults={
                'capacidade_maxima': 80,
                'taxa_reserva': 150.00,
                'descricao': "Salão amplo com ar-condicionado, cozinha de apoio e som.",
                'ativa': True
            }
        )

        # 9. Comunicado Oficial de Boas-Vindas
        Aviso.objects.get_or_create(
            condominio=condo1,
            titulo="Bem-vindo ao CondoFlow!",
            defaults={
                'conteudo': "A administração agora conta com um portal digital integrado para reservas, encomendas, enquetes e ocorrências.",
                'autor': sindico1,
                'is_importante': True
            }
        )

        # 10. Enquete / Votação da Assembleia
        Enquete.objects.get_or_create(
            condominio=condo1,
            titulo="Aprovação da Modernização das Câmeras de Segurança",
            defaults={
                'descricao': "Instalação de câmeras com leitura facial e gravação em nuvem nas portarias e garagens.",
                'opcao_1': "A Favor",
                'opcao_2': "Contra",
                'opcao_3': "Abstenção",
                'data_limite': date.today() + timedelta(days=30),
                'ativa': True,
                'criado_por': sindico1
            }
        )

        # 11. Chamado Exemplo
        Chamado.objects.get_or_create(
            condominio=condo1,
            titulo="Manutenção da Lâmpada do Hall Bloco A",
            defaults={
                'descricao': "A lâmpada do corredor do 1º andar está piscando.",
                'autor': morador,
                'categoria': "Iluminação",
                'prioridade': "media",
                'status': "aberto"
            }
        )

        self.stdout.write(self.style.SUCCESS("Dados iniciais de produção semeados com sucesso!"))
