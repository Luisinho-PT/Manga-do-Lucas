# api/index.py

# Importa a aplicação WSGI do seu projeto Django.
# Troque 'meuprojeto.wsgi' pelo nome correto do seu projeto.
# Ex: se o seu settings.py está em 'core/settings.py', use 'core.wsgi'
from manga.wsgi import application

# A Vercel espera uma variável chamada 'app'.
app = application