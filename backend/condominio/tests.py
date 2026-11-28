import json
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import (
    Condominio,
    Endereco,
    AreaComum,
    Reserva,
    Chamado,
    Aviso,
    Encomenda,
    Enquete,
    VotoEnquete
)

Usuario = get_user_model()

class CondoFlowE2ETestCase(APITestCase):
    def setUp(self):
        # 1. Criação de dois condomínios distintos
        self.condo_alpha = Condominio.objects.create(
            nome="Condomínio Alpha",
            cnpj="11111111000101",
            codigo_identificador="ALPHA"
        )
        self.condo_beta = Condominio.objects.create(
            nome="Condomínio Beta",
            cnpj="22222222000102",
            codigo_identificador="BETA"
        )

        # 2. Unidades do Condomínio Alpha
        self.unidade_a101 = Endereco.objects.create(
            condominio=self.condo_alpha,
            bloco="A",
            numero="101"
        )
        self.unidade_a102 = Endereco.objects.create(
            condominio=self.condo_alpha,
            bloco="A",
            numero="102"
        )

        # 3. Usuários do Condomínio Alpha
        self.sindico_alpha = Usuario.objects.create_user(
            username="11111111111",
            cpf="11111111111",
            password="password123",
            first_name="Síndico",
            last_name="Alpha",
            is_sindico=True,
            condominio=self.condo_alpha
        )
        self.morador_alpha = Usuario.objects.create_user(
            username="22222222222",
            cpf="22222222222",
            password="password123",
            first_name="Morador",
            last_name="Alpha",
            is_sindico=False,
            condominio=self.condo_alpha,
            endereco=self.unidade_a101
        )

        # 4. Usuários do Condomínio Beta
        self.sindico_beta = Usuario.objects.create_user(
            username="33333333333",
            cpf="33333333333",
            password="password123",
            first_name="Síndico",
            last_name="Beta",
            is_sindico=True,
            condominio=self.condo_beta
        )

    def get_jwt_header(self, username, password="password123"):
        res = self.client.post('/api/token/', {'username': username, 'password': password})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        return {'HTTP_AUTHORIZATION': f'Bearer {res.data["access"]}'}

    # ==========================================
    # TESTE 1: BLINDAGEM MULTI-TENANCY
    # ==========================================
    def test_multi_tenancy_strict_isolation(self):
        """Garante que dados criados no Condomínio Alpha NUNCA aparecem para o Condomínio Beta"""
        # Alpha cria Chamado, Aviso e Encomenda
        Chamado.objects.create(
            condominio=self.condo_alpha,
            autor=self.morador_alpha,
            titulo="Vazamento no Bloco A",
            descricao="Cano quebrado"
        )
        Aviso.objects.create(
            condominio=self.condo_alpha,
            autor=self.sindico_alpha,
            titulo="Reunião de Condomínio Alpha",
            conteudo="Data marcada"
        )
        Encomenda.objects.create(
            condominio=self.condo_alpha,
            endereco=self.unidade_a101,
            empresa_entrega="Amazon",
            codigo_rastreio="BR123456789",
            descricao="Pacote Amazon",
            recebido_por=self.sindico_alpha
        )

        # Síndico Beta faz requisição nos endpoints
        headers_beta = self.get_jwt_header("33333333333")

        # 1. Chamados
        r_chamados = self.client.get('/api/chamados/', **headers_beta)
        self.assertEqual(r_chamados.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r_chamados.data), 0, "Falha de Multi-Tenancy! Chamado de Alpha vazou para Beta!")

        # 2. Avisos
        r_avisos = self.client.get('/api/avisos/', **headers_beta)
        self.assertEqual(r_avisos.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r_avisos.data), 0, "Falha de Multi-Tenancy! Aviso de Alpha vazou para Beta!")

        # 3. Encomendas
        r_encomendas = self.client.get('/api/encomendas/', **headers_beta)
        self.assertEqual(r_encomendas.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r_encomendas.data), 0, "Falha de Multi-Tenancy! Encomenda de Alpha vazou para Beta!")

        # 4. Dashboard
        r_dash = self.client.get('/api/dashboard/', **headers_beta)
        self.assertEqual(r_dash.status_code, status.HTTP_200_OK)
        self.assertEqual(r_dash.data['condominio_nome'], "Condomínio Beta")
        self.assertEqual(r_dash.data['chamados_abertos'], 0)

    # ==========================================
    # TESTE 2: RESERVA ANTI-CONFLITO
    # ==========================================
    def test_reserva_anti_conflito_mesma_data(self):
        """Garante que a mesma área comum não pode ser reservada por dois moradores na mesma data"""
        area = AreaComum.objects.create(
            condominio=self.condo_alpha,
            nome="Churrasqueira 1",
            capacidade_maxima=20
        )

        headers_morador = self.get_jwt_header("22222222222")
        data_reserva = "2026-12-25"

        # 1. Primeira reserva (deve ter sucesso)
        payload = {
            'area_comum': area.id,
            'data_reserva': data_reserva,
            'periodo': 'dia_inteiro',
            'observacoes': 'Almoço de Natal'
        }
        res1 = self.client.post('/api/reservas/', payload, **headers_morador)
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        reserva_id = res1.data['id']

        # Síndico aprova a reserva
        reserva = Reserva.objects.get(id=reserva_id)
        reserva.status = 'confirmada'
        reserva.save()

        # 2. Tenta fazer outra reserva na MESMA área e MESMA data (deve ser rejeitada)
        res2 = self.client.post('/api/reservas/', payload, **headers_morador)
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('data_reserva', res2.data)

        # 3. Reserva em outra data diferente (deve ter sucesso)
        payload['data_reserva'] = "2026-12-26"
        res3 = self.client.post('/api/reservas/', payload, **headers_morador)
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)

        # 4. Consulta de disponibilidade e ocupação pelo morador
        res_disp = self.client.get(f'/api/areas-comuns/{area.id}/disponibilidade/', **headers_morador)
        self.assertEqual(res_disp.status_code, status.HTTP_200_OK)
        datas_ocupadas = [r['data_reserva'] for r in res_disp.data]
        self.assertIn("2026-12-25", datas_ocupadas)
        self.assertIn("2026-12-26", datas_ocupadas)

        res_ocup = self.client.get(f'/api/reservas/ocupadas/?area_comum={area.id}', **headers_morador)
        self.assertEqual(res_ocup.status_code, status.HTTP_200_OK)
        datas_ocupadas_2 = [r['data_reserva'] for r in res_ocup.data]
        self.assertIn("2026-12-25", datas_ocupadas_2)

        # 5. Síndico bloqueia uma data específica (ex: Manutenção)
        headers_sindico = self.get_jwt_header("11111111111")
        res_bloq = self.client.post(
            f'/api/areas-comuns/{area.id}/bloquear-data/',
            {'data': '2026-12-30', 'periodo': 'dia_inteiro', 'motivo': 'Pintura e Reforma'},
            **headers_sindico
        )
        self.assertEqual(res_bloq.status_code, status.HTTP_201_CREATED)

        # 6. Morador tenta reservar a data bloqueada (deve ser rejeitado)
        payload_bloq = {
            'area_comum': area.id,
            'data_reserva': '2026-12-30',
            'periodo': 'dia_inteiro',
            'observacoes': 'Tentativa em dia bloqueado'
        }
        res_fail = self.client.post('/api/reservas/', payload_bloq, **headers_morador)
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('data_reserva', res_fail.data)

        # 7. Síndico desbloqueia a data
        res_desbloq = self.client.post(
            f'/api/areas-comuns/{area.id}/desbloquear-data/',
            {'data': '2026-12-30', 'periodo': 'dia_inteiro'},
            **headers_sindico
        )
        self.assertEqual(res_desbloq.status_code, status.HTTP_200_OK)

        # 8. Morador agora consegue reservar a data liberada
        res_ok = self.client.post('/api/reservas/', payload_bloq, **headers_morador)
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)

        # 9. Regra dos Turnos: reservar Manhã deixa Tarde e Noite disponíveis
        data_turnos = (date.today() + timedelta(days=5)).isoformat()
        # 9.1 Reserva Manhã (deve ter sucesso)
        res_manha = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_turnos,
            'periodo': 'manha',
            'observacoes': 'Treino matinal'
        }, **headers_morador)
        self.assertEqual(res_manha.status_code, status.HTTP_201_CREATED)

        # 9.2 Outra tentativa para Manhã na mesma data (deve ser rejeitada)
        res_manha_duplicada = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_turnos,
            'periodo': 'manha'
        }, **headers_morador)
        self.assertEqual(res_manha_duplicada.status_code, status.HTTP_400_BAD_REQUEST)

        # 9.3 Tentativa de Dia Inteiro com Manhã já reservada (deve ser rejeitada)
        res_dia_inteiro_bloqueado = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_turnos,
            'periodo': 'dia_inteiro'
        }, **headers_morador)
        self.assertEqual(res_dia_inteiro_bloqueado.status_code, status.HTTP_400_BAD_REQUEST)

        # 9.4 Reserva Tarde na mesma data (deve ter SUCESSO - tarde permanece disponível!)
        res_tarde = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_turnos,
            'periodo': 'tarde',
            'observacoes': 'Aniversário à tarde'
        }, **headers_morador)
        self.assertEqual(res_tarde.status_code, status.HTTP_201_CREATED)

        # 9.5 Reserva Noite na mesma data (deve ter SUCESSO - noite permanece disponível!)
        res_noite = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_turnos,
            'periodo': 'noite',
            'observacoes': 'Jantar'
        }, **headers_morador)
        self.assertEqual(res_noite.status_code, status.HTTP_201_CREATED)

        # 10. Regra do Dia Inteiro: reserva de Dia Inteiro torna todos os turnos indisponíveis
        data_dia_todo = "2026-11-28"
        res_dia_todo = self.client.post('/api/reservas/', {
            'area_comum': area.id,
            'data_reserva': data_dia_todo,
            'periodo': 'dia_inteiro',
            'observacoes': 'Festa o dia todo'
        }, **headers_morador)
        self.assertEqual(res_dia_todo.status_code, status.HTTP_201_CREATED)

        # 10.1 Qualquer tentativa para manhã, tarde ou noite nessa data deve ser rejeitada
        for turno in ['dia_inteiro', 'manha', 'tarde', 'noite']:
            res_tentativa = self.client.post('/api/reservas/', {
                'area_comum': area.id,
                'data_reserva': data_dia_todo,
                'periodo': turno
            }, **headers_morador)
            self.assertEqual(res_tentativa.status_code, status.HTTP_400_BAD_REQUEST)

    # ==========================================
    # TESTE 3: ASSEMBLEIA VIRTUAL (1 VOTO POR UNIDADE)
    # ==========================================
    def test_enquete_limite_um_voto_por_unidade(self):
        """Garante que cada apartamento pode votar exatamente UMA vez na enquete da assembleia"""
        enquete = Enquete.objects.create(
            condominio=self.condo_alpha,
            criado_por=self.sindico_alpha,
            titulo="Aprovação da Reforma da Fachada",
            descricao="Pintura e impermeabilização",
            opcao_1="A favor",
            opcao_2="Contra",
            opcao_3="Abstenção",
            data_limite=date(2026, 12, 31),
            ativa=True
        )

        headers_morador = self.get_jwt_header("22222222222")

        # 1. Primeiro voto do apartamento A101
        res1 = self.client.post(f'/api/enquetes/{enquete.id}/votar/', {'opcao_escolhida': 1}, **headers_morador)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['total_votos'], 1)
        self.assertEqual(res1.data['votos_opcao_1'], 1)

        # 2. Segunda tentativa de voto da mesma unidade A101 (deve ser bloqueada)
        res2 = self.client.post(f'/api/enquetes/{enquete.id}/votar/', {'opcao_escolhida': 2}, **headers_morador)
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', res2.data)

    # ==========================================
    # TESTE 4: CADASTRO COM CÓDIGO DE CONVITE
    # ==========================================
    def test_cadastro_morador_codigo_convite(self):
        """Valida que o morador só consegue se cadastrar com código de convite de unidade válida"""
        codigo_valido = self.unidade_a102.codigo_registro

        payload = {
            'first_name': 'Mariana',
            'last_name': 'Costa',
            'cpf': '44444444444',
            'telefone': '92988887777',
            'codigo_registro': codigo_valido,
            'password': 'senhaSegura123'
        }

        # Cadastro com código correto via endpoint público /api/usuarios/
        res = self.client.post('/api/usuarios/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Verifica se o morador foi vinculado ao condomínio e endereço correto
        novo_morador = Usuario.objects.get(cpf='44444444444')
        self.assertEqual(novo_morador.condominio, self.condo_alpha)
        self.assertEqual(novo_morador.endereco, self.unidade_a102)

        # Tentativa de cadastro com código inválido
        payload_invalido = payload.copy()
        payload_invalido['cpf'] = '55555555555'
        payload_invalido['codigo_registro'] = 'CODIGO-INEXISTENTE-999'
        res_inv = self.client.post('/api/usuarios/', payload_invalido)
        self.assertEqual(res_inv.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('codigo_registro', res_inv.data)

    # ==========================================
    # TESTE 5: CICLO DE VIDA DO CHAMADO (OCORRÊNCIA)
    # ==========================================
    def test_ciclo_de_vida_chamado(self):
        """Valida abertura de chamado pelo morador e atualização de status pelo síndico"""
        headers_morador = self.get_jwt_header("22222222222")
        headers_sindico = self.get_jwt_header("11111111111")

        # 1. Morador abre chamado
        payload = {
            'titulo': 'Interfone sem sinal',
            'descricao': 'Não consigo atender a portaria',
            'categoria': 'Elétrica',
            'prioridade': 'alta'
        }
        res_criacao = self.client.post('/api/chamados/', payload, **headers_morador)
        self.assertEqual(res_criacao.status_code, status.HTTP_201_CREATED)
        chamado_id = res_criacao.data['id']
        self.assertEqual(res_criacao.data['status'], 'aberto')

        # 2. Síndico atualiza status para em_andamento e depois concluido
        res_update = self.client.patch(f'/api/chamados/{chamado_id}/', {
            'status': 'em_andamento',
            'resposta_sindico': 'Técnico agendado para amanhã'
        }, **headers_sindico)
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(res_update.data['status'], 'em_andamento')

        # 3. Conclusão do chamado
        res_concluir = self.client.patch(f'/api/chamados/{chamado_id}/', {
            'status': 'concluido'
        }, **headers_sindico)
        self.assertEqual(res_concluir.status_code, status.HTTP_200_OK)
        self.assertEqual(res_concluir.data['status'], 'concluido')

    # ==========================================
    # TESTE 6: RECONHECIMENTO FACIAL E TOTEM
    # ==========================================
    def test_biometria_facial_e_portaria_totem(self):
        """Valida o ciclo completo de cadastro facial do morador, convite de visitantes com selfie e totem da portaria."""
        from unittest.mock import patch
        from .models import BiometriaFacial, Visitante, RegistroAcesso

        headers_morador = self.get_jwt_header("22222222222")
        headers_sindico = self.get_jwt_header("11111111111")

        # 1. Morador consulta status antes de ter facial
        res_face_inicial = self.client.get('/api/biometrias/minha-face/', **headers_morador)
        self.assertEqual(res_face_inicial.status_code, status.HTTP_200_OK)
        self.assertFalse(res_face_inicial.data['tem_biometria'])

        # 2. Morador cadastra sua selfie com sucesso
        mock_face_morador = {
            'sucesso': True,
            'vetor': [0.088] * 128,
            'face_base64': 'data:image/jpeg;base64,mocked_morador_face',
            'brilho': 120.0
        }
        with patch('condominio.views.processar_foto_facial', return_value=mock_face_morador):
            res_cad_face = self.client.post('/api/biometrias/cadastrar-minha-face/', {
                'foto_base64': 'data:image/jpeg;base64,raw_selfie_morador'
            }, **headers_morador)
            self.assertEqual(res_cad_face.status_code, status.HTTP_201_CREATED)
            self.assertTrue(res_cad_face.data['sucesso'])

        # 3. Consulta status pós-cadastro
        res_face_pos = self.client.get('/api/biometrias/minha-face/', **headers_morador)
        self.assertEqual(res_face_pos.status_code, status.HTTP_200_OK)
        self.assertTrue(res_face_pos.data['tem_biometria'])
        self.assertEqual(res_face_pos.data['foto_base64'], 'data:image/jpeg;base64,mocked_morador_face')

        # 4. Morador cadastra um visitante / prestador
        res_vis = self.client.post('/api/visitantes/', {
            'nome': 'Roberto Eletricista',
            'tipo': 'prestador',
            'empresa': 'EletroReparos',
            'data_inicio': date.today().isoformat(),
            'data_fim': (date.today() + timedelta(days=5)).isoformat(),
            'periodo': 'dia_inteiro',
            'observacoes': 'Reparo no quadro elétrico'
        }, **headers_morador)
        self.assertEqual(res_vis.status_code, status.HTTP_201_CREATED)
        token_convite = res_vis.data['codigo_acesso']
        self.assertTrue(token_convite.startswith('CF-'))

        # 5. Visitante abre o link público do WhatsApp sem login (AllowAny)
        res_convite_pub = self.client.get(f'/api/visitantes/convite-publico/{token_convite}/')
        self.assertEqual(res_convite_pub.status_code, status.HTTP_200_OK)
        self.assertEqual(res_convite_pub.data['nome'], 'Roberto Eletricista')
        self.assertFalse(res_convite_pub.data['tem_biometria'])

        # 6. Visitante envia sua selfie pelo link público do celular
        mock_face_visitante = {
            'sucesso': True,
            'vetor': [0.05] * 128,
            'face_base64': 'data:image/jpeg;base64,mocked_visitante_face',
            'brilho': 115.0
        }
        with patch('condominio.views.processar_foto_facial', return_value=mock_face_visitante):
            res_selfie_vis = self.client.post(f'/api/visitantes/salvar-selfie-convite/{token_convite}/', {
                'foto_base64': 'data:image/jpeg;base64,selfie_enviada_pelo_celular'
            })
            self.assertEqual(res_selfie_vis.status_code, status.HTTP_200_OK)
            self.assertTrue(res_selfie_vis.data['sucesso'])

        # 7. Totem da Portaria faz a leitura ao vivo:
        # 7.1 Morador passa na frente da câmera (reconhecido -> Liberado!)
        with patch('condominio.views.processar_foto_facial', return_value=mock_face_morador):
            res_totem_morador = self.client.post('/api/portaria/identificar-face/', {
                'foto_base64': 'data:image/jpeg;base64,frame_camera_morador',
                'dispositivo_ponto': 'Portão Social'
            }, **headers_sindico)
            self.assertEqual(res_totem_morador.status_code, status.HTTP_200_OK)
            self.assertTrue(res_totem_morador.data['autorizado'])
            self.assertEqual(res_totem_morador.data['status'], 'autorizado')
            self.assertEqual(res_totem_morador.data['tipo'], 'morador')

        # 7.2 Pessoa desconhecida passa na frente da câmera (não reconhecido -> Negado!)
        mock_face_estranho = {
            'sucesso': True,
            'vetor': [-0.088] * 128, # Vetor oposto (similaridade 0.0)
            'face_base64': 'data:image/jpeg;base64,frame_desconhecido',
            'brilho': 110.0
        }
        with patch('condominio.views.processar_foto_facial', return_value=mock_face_estranho):
            res_totem_estranho = self.client.post('/api/portaria/identificar-face/', {
                'foto_base64': 'data:image/jpeg;base64,frame_camera_estranho'
            }, **headers_sindico)
            self.assertEqual(res_totem_estranho.status_code, status.HTTP_200_OK)
            self.assertFalse(res_totem_estranho.data['autorizado'])
            self.assertEqual(res_totem_estranho.data['status'], 'negado')

        # 8. Consulta de histórico de auditoria da portaria
        res_hist = self.client.get('/api/portaria/historico/', **headers_sindico)
        self.assertEqual(res_hist.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_hist.data), 2)

