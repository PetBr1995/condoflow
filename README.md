# CondoFlow - Sistema Inteligente de Gestão Condominial

Plataforma fullstack moderna para gestão integrada de condomínios residenciais e comerciais, simplificando a comunicação entre a administração (síndicos) e os moradores.

---

## 🏢 Arquitetura Multi-Tenancy (SaaS Comercial)

O sistema agora é **Multi-Condomínio**. Isso significa que múltiplos condomínios usam a mesma instalação com isolamento total dos dados:
- O **Síndico A** gerencia exclusivamente o Condomínio A.
- O **Síndico B** gerencia exclusivamente o Condomínio B.
- Ao cadastrar um morador com o código da unidade (ex: `FLORES-A101-XXXX`), o sistema identifica o condomínio automaticamente e isola o acesso do morador.

### 👥 Contas de Teste Pré-Configuradas

| Perfil | Condomínio | CPF / Usuário | Senha | Código de Convite da Unidade |
| :--- | :--- | :--- | :--- | :--- |
| **SuperAdmin (SaaS)** | Administração Geral | `99999999999` | `admin123` | - |
| **Síndico 1** | *Residencial Flores de Manaus* | `00000000000` | `admin123` | `FLORES-A101-QVMY` (Apto 101) |
| **Síndico 2** | *Condomínio Parque do Sol* | `11111111111` | `admin123` | `PARQUE-B202-MXQS` (Apto 202) |

---

## 🚀 Principais Funcionalidades

- **Autenticação Segura JWT:** Autenticação stateless via JSON Web Tokens com perfis diferenciados (*Role-Based Access Control*).
- **Cadastro por Convite / Código de Unidade:** Moradores só podem se cadastrar vinculados à sua unidade informando o código exclusivo gerado pela administração (ex: `BLOCO-APTO-XXXX`).
- **Acesso Descomplicado por CPF:** Moradores utilizam o número do CPF para acesso direto, com sanitização automática de caracteres.
- **Módulo de Portaria & Encomendas:**
  - Registro de pacotes e correspondências recebidas na portaria (Mercado Livre, Amazon, Correios, Shopee, etc.).
  - Geração automática de código de retirada por unidade.
  - Baixa e confirmação de entrega ao morador com 1 clique.
- **Mural de Avisos & Comunicados:**
  - Publicação de informativos oficiais pelo síndico.
  - Sinalização de comunicados urgentes em destaque.
- **Módulo de Reservas de Áreas Comuns:**
  - Catálogo de espaços (Salão de Festas, Churrasqueira, Quadra, Espaço Gourmet) com capacidade e taxas.
  - Agendamento por data e período (*Dia Inteiro*, *Manhã*, *Tarde*, *Noite*).
  - Validação automática anti-conflito (impede reservas duplicadas no mesmo horário).
  - Painel de aprovação/rejeição com 1 clique para o síndico.
- **Gestão de Chamados e Ocorrências:**
  - Abertura de chamados por categoria (Hidráulica, Elétrica, Áreas Comuns, Segurança, Barulho, Outros).
  - Controle de prioridades (*Baixa*, *Média*, *Alta*, *Urgente*).
  - Ciclo de vida (*Aberto*, *Em Andamento*, *Concluído*, *Cancelado*).
  - Suporte a fotos e respostas da administração.
- **Quadro de Avisos e Comunicados:** Publicação de avisos pelo síndico com destaque para recados urgentes.
- **Dashboard Analítico:** Métricas consolidadas em tempo real com gráficos interativos.
- **Painel Administrativo do Síndico:** Cadastro de unidades, geração de códigos de convite e gestão de condôminos.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11+**
- **Django 5.0+** & **Django REST Framework**
- **SimpleJWT** (Autenticação JWT)
- **Django CORS Headers**
- **SQLite** (Desenvolvimento) / **PostgreSQL** (Produção)
- **Pillow** (Processamento e upload de fotos)

### Frontend
- **Angular 18** (Standalone Components)
- **TypeScript**
- **Angular Material & CDK**
- **Chart.js** (Gráficos analíticos)
- **RxJS**

---

## 📁 Estrutura do Projeto

```text
condoflow/
├── backend/                  # API REST com Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/                 # Configurações globais (settings, urls, asgi/wsgi)
│   ├── condominio/           # Módulos, regras de negócio, serializers e views
│   └── media/                # Diretório de uploads (fotos de chamados e perfis)
│
└── frontend/                 # Interface SPA com Angular 18
    ├── package.json
    ├── angular.json
    └── src/
        ├── app/
        │   ├── components/   # Navbar e componentes reutilizáveis
        │   ├── guards/       # AuthGuard de proteção de rotas
        │   ├── interceptors/ # Interceptor JWT automático
        │   ├── pages/        # Telas (login, cadastro, dashboard, chamados, moradores)
        │   └── services/     # Serviços de comunicação HTTP
        └── index.html
```

---

## 💻 Como Executar o Projeto Localmente

### 1. Configurando e Executando o Backend (Django)

1. Abra o terminal na pasta `condoflow/backend`:
   ```bash
   cd condoflow/backend
   ```

2. Crie e ative o ambiente virtual Python:
   ```bash
   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux/macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Execute as migrações do banco de dados:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Crie o usuário administrador (Síndico Principal):
   ```bash
   python manage.py createsuperuser
   ```

6. Inicie o servidor da API:
   ```bash
   python manage.py runserver
   ```
   A API estará disponível em: `http://127.0.0.1:8000/api/`  
   O painel administrativo em: `http://127.0.0.1:8000/admin/`

---

### 2. Configurando e Executando o Frontend (Angular)

1. Abra um segundo terminal na pasta `condoflow/frontend`:
   ```bash
   cd condoflow/frontend
   ```

2. Instale as dependências Node.js:
   ```bash
   npm install
   ```

3. Certifique-se de que o arquivo `src/app/config.ts` aponta para o backend local:
   ```typescript
   export const API_CONFIG = {
     baseUrl: 'http://127.0.0.1:8000/api/'
   };
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   # ou: npx ng serve
   ```

5. Acesse no navegador:
   `http://localhost:4200`

---

## 🔑 Endpoints Principais da API

| Método | Endpoint | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/token/` | Obtenção do token JWT (Login por CPF) | Público |
| `POST` | `/api/token/refresh/` | Renovação do token JWT | Autenticado |
| `GET/POST` | `/api/usuarios/` | Cadastro de moradores (POST) e listagem (GET) | POST (Público) / GET (Síndico) |
| `GET` | `/api/usuarios/me/` | Dados do usuário logado | Autenticado |
| `GET/POST` | `/api/enderecos/` | Gestão de apartamentos e códigos de convite | Síndico |
| `GET/POST` | `/api/chamados/` | Listagem e abertura de chamados | Autenticado |
| `PUT/PATCH/DELETE` | `/api/chamados/{id}/` | Atualização de status e exclusão | Síndico |
| `GET/POST` | `/api/avisos/` | Quadro de avisos e comunicados | GET (Todos) / POST (Síndico) |
| `GET` | `/api/dashboard/` | Métricas resumidas e analíticas | Autenticado |

---

## 📄 Licença
Distribuído sob licença privada. Desenvolvido para modernização da gestão condominial.
