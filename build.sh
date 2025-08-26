#!/bin/bash

# Garante que o script pare se algum comando falhar
set -e

echo "Iniciando a sincronização do changelog..."
python manage.py sync_changelog

# Adiciona um comando para sair imediatamente se qualquer comando falhar
echo "Iniciando o build..."

# Instala as dependências (boa prática, embora a Vercel geralmente faça isso)
pip install -r requirements.txt

# Roda as migrações do banco de dados
python manage.py migrate

# Coleta os arquivos estáticos
python manage.py collectstatic --noinput

echo "Build finalizado."