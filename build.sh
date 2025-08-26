#!/bin/bash

# --- MODO DE DEBUG ---
# O comando 'set -ex' é nosso superpoder aqui:
# 'e': Sai IMEDIATAMENTE se qualquer comando falhar. Isso vai quebrar o build e nos mostrar o erro.
# 'x': Mostra cada comando no log antes de executá-lo.
set -ex

echo "--- INICIANDO SCRIPT DE BUILD (MODO DEBUG) ---"

# Vamos verificar se as variáveis de ambiente essenciais do Django existem
# Se a SECRET_KEY não estiver definida nas configurações da Vercel, o build vai falhar aqui.
if [ -z "$SECRET_KEY" ]; then
  echo "ERRO: A variável de ambiente SECRET_KEY não está definida!"
  exit 1
fi

# Lista os arquivos na raiz para confirmar que tudo está no lugar certo
echo "Listando arquivos na raiz do projeto:"
ls -la

# Instala as dependências
echo "Instalando dependências..."
pip install -r requirements.txt

# Roda as migrações (se falhar aqui, o build vai parar e mostrar o erro)
echo "Rodando migrações..."
python manage.py migrate

# Roda o collectstatic (se falhar aqui, o build vai parar e mostrar o erro)
# Adicionamos o --clear para garantir que a pasta de estáticos esteja limpa
echo "Rodando collectstatic..."
python manage.py collectstatic --noinput --clear

echo "--- SCRIPT DE BUILD CONCLUÍDO COM SUCESSO ---"