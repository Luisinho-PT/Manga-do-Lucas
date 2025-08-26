#!/bin/bash
set -ex

# Instala dependências
pip install -r requirements.txt

# Coleta estáticos
python3 manage.py collectstatic --noinput --clear --verbosity 2
