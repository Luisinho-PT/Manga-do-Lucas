"""
WSGI config for manga project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manga.settings')

# Força o collectstatic durante o deploy / inicialização
try:
    call_command("collectstatic", interactive=False, clear=True, verbosity=1)
except Exception as e:
    print("⚠️ Collectstatic falhou:", e)

application = get_wsgi_application()
app = application
