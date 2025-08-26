#!/bin/bash
set -ex

# Instala dependências
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# Coleta estáticos
python3 manage.py collectstatic --noinput --clear --verbosity 2
