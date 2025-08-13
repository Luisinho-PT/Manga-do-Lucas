#!/bin/bash

# Garante que o script pare se algum comando falhar
set -e

echo "Iniciando a sincronização do changelog..."
python manage.py sync_changelog

echo "Executando o collectstatic..."
python manage.py collectstatic --noinput --clear

echo "Build finalizado com sucesso!"