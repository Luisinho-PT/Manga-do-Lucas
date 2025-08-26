#!/bin/bash
# setup.sh

VENV_DIR=".venv"

# Remover .venv se existir
if [ -d "$VENV_DIR" ]; then
    echo "🧹 Removendo ambiente virtual existente..."
    rm -rf "$VENV_DIR"
fi

# Criar novo ambiente virtual com o mesmo nome
echo "🐍 Criando novo ambiente virtual em $VENV_DIR..."
python3 -m venv "$VENV_DIR"

# Ativar e instalar dependências
echo "📦 Instalando dependências do requirements.txt..."
source "$VENV_DIR/bin/activate"
python3 -m pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Ambiente virtual '.venv' recriado com sucesso!"
echo "🌐 Configuração concluída. Você pode ativar o ambiente virtual com 'source $VENV_DIR/bin/activate'."