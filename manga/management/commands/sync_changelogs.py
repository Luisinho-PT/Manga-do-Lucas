# polls/management/commands/sync_changelog.py
from django.core.management.base import BaseCommand
from django.utils.timezone import make_aware
from datetime import datetime
import os
import requests
from polls.models import Changelog  # ❗️ Ajuste "polls" para o nome do seu app

class Command(BaseCommand):
    help = "Sincroniza os commits recentes do repositório GitHub com o modelo Changelog."

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando a sincronização de commits do GitHub...")

        repo = "Luisinho-PT/Manga-do-Lucas"
        token = os.environ.get("GITHUB_TOKEN")
        headers = {"Authorization": f"token {token}"} if token else {}
        url = f"https://api.github.com/repos/{repo}/commits"
        
        # 💡 Aumentado para 100 (máximo por página) para evitar perder commits.
        params = {"per_page": 100}

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # Lança um erro para status 4xx/5xx
            commits_data = response.json()
        except requests.exceptions.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Erro ao buscar commits da API do GitHub: {e}"))
            return

        novos_commits = 0
        commits_ignorados = 0

        # Pega todos os hashes existentes no banco de uma só vez para otimizar
        hashes_existentes = set(Changelog.objects.values_list('commit_hash', flat=True))

        for commit in commits_data:
            full_hash = commit["sha"]
            
            # Otimização: verifica no conjunto em memória em vez de fazer um query por loop
            if full_hash in hashes_existentes:
                commits_ignorados += 1
                continue

            # Se o hash não existe, então processa e adiciona
            message = commit["commit"]["message"]
            iso_date = commit["commit"]["author"]["date"]
            
            # Converte a data para um objeto datetime ciente do fuso horário
            # O formato do GitHub é ISO 8601 com 'Z' (Zulu/UTC)
            dt_utc = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
            
            Changelog.objects.create(
                commit_hash=full_hash,
                message=message,
                date=dt_utc  # O Django armazena em UTC e converte na exibição
            )
            self.stdout.write(f"  - Adicionado: {message.splitlines()[0][:60]}")
            novos_commits += 1

        self.stdout.write(self.style.SUCCESS(f"\nSincronização concluída!"))
        self.stdout.write(f"  - Commits novos adicionados: {novos_commits}")
        self.stdout.write(f"  - Commits existentes ignorados: {commits_ignorados}")