from django.core.management.base import BaseCommand
from django.utils.timezone import get_current_timezone
from datetime import datetime, timezone
import os
import requests
from polls.models import Changelog  # ajuste o nome do app se necessário

class Command(BaseCommand):
    help = "Sincroniza os commits recentes do GitHub com o modelo Changelog."

    def handle(self, *args, **kwargs):
        token = os.environ.get("GITHUB_TOKEN")
        headers = {"Authorization": f"token {token}"} if token else {}

        url = "https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits"
        params = {"per_page": 10}  # pega os 10 commits mais recentes

        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            self.stderr.write(f"Erro ao buscar commits: {response.status_code} - {response.text}")
            return

        commits_data = response.json()
        novos_commits = 0

        local_tz = get_current_timezone()

        for commit in commits_data:
            full_hash = commit["sha"]
            message = commit["commit"]["message"]
            iso_date = commit["commit"]["author"]["date"]

            # Parse datetime UTC vindo do GitHub
            dt_utc = datetime.strptime(iso_date, "%Y-%m-%dT%H:%M:%SZ")
            dt_utc = dt_utc.replace(tzinfo=timezone.utc)

            # Converte para timezone local (America/Sao_Paulo)
            dt_local = dt_utc.astimezone(local_tz)

            # Evita duplicatas
            if Changelog.objects.filter(commit_hash=full_hash).exists():
                continue

            Changelog.objects.create(
                commit_hash=full_hash,
                message=message,
                date=dt_local  # já com timezone correto
            )
            novos_commits += 1

        self.stdout.write(self.style.SUCCESS(f"{novos_commits} commits adicionados ao changelog."))
