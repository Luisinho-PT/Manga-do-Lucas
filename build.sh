#!/bin/bash
set -ex
echo "--- INICIANDO SCRIPT DE BUILD ---"
python3 manage.py migrate
python3 manage.py collectstatic --noinput --clear
echo "--- SCRIPT DE BUILD CONCLUÍDO ---"