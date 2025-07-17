# polls/management/commands/sync_changelog.py
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware
from datetime import datetime
import os
import requests
from polls.models import Changelog

class Command(BaseCommand):
    help = "Sincroniza os commits do GitHub com o modelo Changelog, importando apenas os marcados com [changelog]."

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando a sincronização de commits do GitHub...")

        repo = "Luisinho-PT/Manga-do-Lucas"
        token = os.environ.get("GITHUB_TOKEN")
        headers = {"Authorization": f"token {token}"} if token else {}
        url = f"https://api.github.com/repos/{repo}/commits"
        
        params = {"per_page": 100}

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            commits_data = response.json()
        except requests.exceptions.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Erro ao buscar commits da API do GitHub: {e}"))
            return

        novos_commits = 0
        commits_ignorados_ja_existem = 0
        commits_ignorados_sem_marcador = 0

        hashes_existentes = set(Changelog.objects.values_list('commit_hash', flat=True))

        for commit in commits_data:
            full_hash = commit["sha"]
            message = commit["commit"]["message"]

            # --- MUDANÇA PRINCIPAL AQUI ---
            # 1. Verifica se a mensagem NÃO começa com o marcador.
            if not message.strip().startswith("[changelog]"):
                # Se não começar, ignora este commit e vai para o próximo.
                commits_ignorados_sem_marcador += 1
                continue # Pula para o próximo item do loop

            # 2. Se o marcador existe, limpa a mensagem para salvar no banco de dados.
            clean_message = message.replace("[changelog]", "").strip()
            # ---------------------------------
            
            # Verifica se o commit já existe no banco (mesma lógica de antes)
            if full_hash in hashes_existentes:
                commits_ignorados_ja_existem += 1
                continue

            # Se o hash não existe e tem o marcador, processa e adiciona
            iso_date = commit["commit"]["author"]["date"]
            dt_utc = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
            
            Changelog.objects.create(
                commit_hash=full_hash,
                message=clean_message, # Salva a mensagem já limpa
                date=dt_utc
            )
            self.stdout.write(self.style.SUCCESS(f"  - Adicionado: {clean_message.splitlines()[0][:60]}"))
            novos_commits += 1

        self.stdout.write(self.style.SUCCESS(f"\nSincronização concluída!"))
        self.stdout.write(f"  - Commits novos adicionados: {novos_commits}")
        self.stdout.write(f"  - Commits já existentes ignorados: {commits_ignorados_ja_existem}")
        self.stdout.write(f"  - Commits sem o marcador [changelog] ignorados: {commits_ignorados_sem_marcador}")