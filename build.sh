#!/bin/bash
set -ex

# Atualiza pip (opcional)
python3 -m pip install --upgrade pip

# Instala dependências
python3 -m pip install -r requirements.txt

# Rodar migrations (opcional)
# python3 manage.py migrate --noinput

# Coletar arquivos estáticos
python3 manage.py collectstatic --noinput --clear --verbosity 2
