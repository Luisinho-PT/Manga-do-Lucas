#!/bin/bash
#!/bin/bash
set -ex  # -e: para o script se der erro | -x: mostra cada comando executado

echo "--- INICIANDO SCRIPT DE BUILD ---"

# aplica migrations (se você realmente precisa no build, senão pode tirar e deixar só no runtime)
python3 manage.py migrate --noinput

# coleta estáticos
python3 manage.py collectstatic --noinput --clear --verbosity 2

# lista alguns arquivos coletados para aparecer nos logs da Vercel
ls -la staticfiles | head -20 || true

echo "--- SCRIPT DE BUILD CONCLUÍDO ---"
