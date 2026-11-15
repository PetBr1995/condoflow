# ==========================================
# CondoFlow Backend - Production Dockerfile
# ==========================================
FROM python:3.12-slim

# Evita criação de arquivos .pyc e permite logs em tempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Instala dependências do sistema operacional necessárias para compilar libs (ex: psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e instala dependências Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . /app/

# Coleta arquivos estáticos para o WhiteNoise
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Executa migrações do banco e inicia o servidor Gunicorn
CMD sh -c "python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:${PORT} --workers 3 --timeout 120"
