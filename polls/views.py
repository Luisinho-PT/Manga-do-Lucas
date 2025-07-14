import os 
import requests

from django.shortcuts import render, redirect
from django.core.cache import cache
from django.core.paginator import Paginator
from .forms import CommentForm
from .models import Comment, Changelog, VersaoSistema
from datetime import datetime, timedelta, timezone
from django.utils.timezone import make_aware
import pytz


def save_recent_commits_to_db(after_commit=None, limit=5):
    token = os.environ.get("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}

    url = "https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits"
    params = {"per_page": limit}
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print(f"Erro ao buscar commits: {response.status_code} - {response.text}")
        return

    data = response.json()

    for commit in data:
        full_hash = commit["sha"]
        if after_commit and full_hash.startswith(after_commit):
            break

        message = commit["commit"]["message"]
        iso_datetime = commit["commit"]["author"]["date"]
        dt = datetime.strptime(iso_datetime, "%Y-%m-%dT%H:%M:%SZ") - timedelta(hours=3)  # GMT-3

        # Cria ou atualiza o changelog no banco
        changelog, created = Changelog.objects.update_or_create(
            commit_hash=full_hash,
            defaults={
                'message': message,
                'date': dt,
            }
        )

def get_commit_message(commit_hash):
    cache_key = f"commit_message_{commit_hash}"
    message = cache.get(cache_key)
    if message:
        return message

    url = f"https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits/{commit_hash}"

    token = os.environ.get("GITHUB_TOKEN")
    headers = {}
    if token:
        headers['Authorization'] = f'token {token}'

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        message = data['commit']['message']
        cache.set(cache_key, message, timeout=3600)
        return message

    print(f"Erro ao buscar commit: {response.status_code} - {response.text}")
    return "Mensagem do commit indisponível."


def fetch_recent_commits(after_commit=None, limit=5):
    token = os.environ.get("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}

    url = "https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits"
    params = {"per_page": limit}

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"Erro ao buscar commits: {response.status_code} - {response.text}")
        return []

    data = response.json()
    commits = []
    for commit in data:
        full_hash = commit["sha"]
        if after_commit and full_hash == after_commit:
            # Para de pegar commits quando chegar no commit atual do deploy
            break

        short_hash = full_hash[:7]
        message = commit["commit"]["message"]
        iso_datetime = commit["commit"]["author"]["date"]
        dt = datetime.strptime(iso_datetime, "%Y-%m-%dT%H:%M:%SZ")
        # Ajuste de fuso horário, se quiser GMT-3
        dt = dt.replace(tzinfo=timezone.utc) - timedelta(hours=3)
        formatted_date = dt.strftime("%d/%m/%Y %H:%M")

        commits.append({
            "hash": short_hash,
            "message": message,
            "date": formatted_date,
        })

    return commits


def main_page(request):
    br_tz = pytz.timezone('America/Sao_Paulo')
    deploy_date = datetime.now(tz=br_tz).strftime('%d/%m/%Y')

    versao = VersaoSistema.objects.order_by('-atualizado_em').first()

    if versao:
        commit_info = f"{versao.numero} – Deploy: {deploy_date}"
    else:
        commit_info = f"Versão desconhecida – Deploy: {deploy_date}"

    changelog_objs = Changelog.objects.filter(exibir=True).order_by('-date')[:5]

    changelog = []
    for entry in changelog_objs:
        aware_date = make_aware(entry.date, timezone=timezone.utc) if entry.date.tzinfo is None else entry.date
        local_dt = aware_date.astimezone(br_tz)
        formatted_date = local_dt.strftime("%d/%m/%Y %H:%M")

        changelog.append({
            "message": entry.message,
            "date": formatted_date,
        })

    return render(request, 'main_page.html', {
        "commit_info": commit_info,
        "changelog": changelog,
    })

def history(request):
    return render(request, 'history.html')

def characters(request):
    return render(request, 'characters.html')

def chapters(request):
    return render(request, 'chapters.html')

def about(request):
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('about')
    else:
        form = CommentForm()

    fixado = Comment.objects.filter(fixado=True).first()  # Apenas um fixado
    outros_comentarios = Comment.objects.exclude(id=fixado.id if fixado else None).order_by('-criado_em')

    paginator = Paginator(outros_comentarios, 4)
    page_number = request.GET.get('page')
    comments_page = paginator.get_page(page_number)

    return render(request, 'about.html', {
        'form': form,
        'fixado': fixado,
        'comments': comments_page
    })

def lucas(request):
    return render(request, 'personagens/lucas.html')

def luis(request):
    return render(request, 'personagens/luis.html')

def licas(request):
    return render(request, 'personagens/licas.html')

def guido(request):
    return render(request, 'personagens/guido.html')

def agug(request):
    return render(request, 'personagens/agug.html')

def berimbau(request):
    return render(request, 'personagens/berimbau.html')

def edward(request):
    return render(request, 'personagens/edward.html')

def exist(request):
    return render(request, 'personagens/exist.html')

def guto(request):
    return render(request, 'personagens/guto.html')

def karma(request):
    return render(request, 'personagens/karma.html')

def mab(request):
    return render(request, 'personagens/mab.html')

def ness(request):
    return render(request, 'personagens/ness.html')

