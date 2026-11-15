# Guia de Deploy & Produção · CondoFlow 🚀

Este guia descreve os passos simples para colocar o **CondoFlow** no ar em produção.

---

## 1. Estrutura de Produção Pronta

- **Backend:** Django 5 + SimpleJWT + Gunicorn + WhiteNoise + Suporte a PostgreSQL + Cloudinary.
- **Frontend:** Angular 18 Standalone + Nginx / Static Site com compressão gzip e cache.
- **Banco de Dados:** PostgreSQL 16 (com isolamento multi-tenant automático).

---

## 2. Opções de Hospedagem

### Opção A: Deploy Automático no Render (Recomendado & Gratuito para Iniciar)
O arquivo `condoflow/render.yaml` já está configurado.

1. Suba o repositório para o seu **GitHub**.
2. Acesse [render.com](https://render.com) e conecte sua conta do GitHub.
3. Clique em **New +** -> **Blueprint**.
4. Selecione o repositório do CondoFlow. O Render criará automaticamente:
   - 1 Banco de Dados PostgreSQL gerenciado
   - 1 Web Service Python (Backend com Gunicorn e migrações automáticas)
   - 1 Static Site (Frontend Angular compilado)
5. Pronto! O sistema estará online com certificado SSL (HTTPS) automático.

---

### Opção B: Deploy via Docker Compose (VPS / Servidor Próprio / AWS / DigitalOcean)
Se você tiver uma VPS (Ubuntu/Debian) com Docker e Docker Compose instalados:

```bash
# 1. Clone o repositório no seu servidor
git clone <url-do-repositorio>
cd condoflow

# 2. Crie o arquivo .env a partir do modelo
cp .env.example .env

# 3. Suba todo o ecossistema (PostgreSQL + Backend Django + Frontend Nginx)
docker compose up -d --build

# 4. Verifique os containers rodando
docker compose ps
```
A aplicação responderá imediatamente na porta 80 do seu IP ou domínio!

---

### Opção C: Deploy no Railway ou Fly.io
- Conecte o repositório no Railway.
- Adicione um plugin de **PostgreSQL**.
- O Railway detectará o `backend/Dockerfile` e o `frontend/Dockerfile` automaticamente.

---

## 3. Criando o Primeiro Condomínio e Síndico em Produção

Após o deploy, execute no terminal do servidor ou via comando remoto:

```bash
python manage.py shell
```

E rode o script de inicialização do seu primeiro condomínio cliente:

```python
from condominio.models import Condominio, Usuario, Endereco

# 1. Cria o Condomínio
condo = Condominio.objects.create(
    nome="Residencial Exemplo",
    cnpj="12.345.678/0001-90",
    telefone="(92) 99999-0000"
)

# 2. Cria o Síndico Administrador
sindico = Usuario.objects.create_user(
    username="00000000000",
    cpf="00000000000",
    password="sua_senha_segura",
    first_name="Nome",
    last_name="Síndico",
    is_sindico=True,
    condominio=condo
)

# 3. Cria as Unidades
Endereco.objects.create(condominio=condo, bloco="A", numero="101")
Endereco.objects.create(condominio=condo, bloco="A", numero="102")
print("Condomínio e Síndico criados com sucesso!")
```

---

## 4. Variáveis de Ambiente Críticas (.env)

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `SECRET_KEY` | Chave criptográfica única | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Modo depuração (SEMPRE False em prod) | `False` |
| `ALLOWED_HOSTS` | Domínios aceitos pelo Django | `api.seusite.com.br,seuapp.onrender.com` |
| `DATABASE_URL` | String de conexão PostgreSQL | `postgres://user:pass@host:5432/dbname` |
| `CORS_ALLOWED_ORIGINS` | URLs do frontend permitidas | `https://app.seusite.com.br` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary para upload de fotos e PDFs | `seu_cloud_name` |
