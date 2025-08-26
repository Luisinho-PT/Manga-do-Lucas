#!/bin/bash

# 'e' sai se um comando falhar.
# 'x' mostra os comandos no log.
set -ex

echo "--- INICIANDO SCRIPT DE BUILD (VERSÃO CORRIGIDA) ---"

# A Vercel já instalou as dependências do requirements.txt.
# Então, pulamos diretamente para os comandos do Django.

# Usamos 'python3' para garantir que estamos usando a versão correta do Python.
echo "Rodando migrações..."
python3 manage.py migrate

echo "Rodando collectstatic..."
python3 manage.py collectstatic --noinput --clear

echo "--- SCRIPT DE BUILD CONCLUÍDO COM SUCESSO ---"