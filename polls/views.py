import os
import requests
import datetime
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from datetime import timezone
import pytz
from django.conf import settings
from django.core.management import call_command
from django.views.decorators.csrf import csrf_exempt

# --- OTIMIZAÇÃO: Importando o decorador de cache ---
from django.views.decorators.cache import cache_control

# Imports dos seus models e forms
from .forms import CommentForm
from .models import Comment, Changelog, VersaoSistema
from .dados import dados
#
# --- Funções de Interação com a API do GitHub ---
#

def save_recent_commits_to_db(limit=5):
    """
    Busca os commits mais recentes da API do GitHub e os salva no banco de dados.
    AGORA SALVANDO DATAS COM FUSO HORÁRIO (TIMEZONE-AWARE).
    """
    token = os.environ.get("GITHUB_TOKEN")
    headers = {"Authorization": f"token {token}"} if token else {}
    url = "https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits"
    params = {"per_page": limit}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Levanta um erro para status HTTP 4xx/5xx
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar commits: {e}")
        return

    commits_data = response.json()

    for commit_data in commits_data:
        full_hash = commit_data["sha"]
        message = commit_data["commit"]["message"]
        iso_datetime_str = commit_data["commit"]["author"]["date"]
        
        # --- MELHORIA APLICADA AQUI ---
        # Converte a string da API para um objeto datetime e já o torna "aware" (consciente) do fuso horário UTC.
        dt_utc = datetime.strptime(iso_datetime_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)

        # Cria ou atualiza o changelog no banco de dados com a data UTC aware.
        Changelog.objects.update_or_create(
            commit_hash=full_hash,
            defaults={'message': message, 'date': dt_utc}
        )

#
# --- Views do seu Site ---
#

# OTIMIZAÇÃO: Cache de 24 horas na Vercel.
# O conteúdo desta página só muda em um novo deploy, então podemos usar um cache longo.
# max_age=0 força o navegador a sempre verificar com a Vercel, que servirá do cache.
@cache_control(public=True, max_age=0, s_maxage=86400, stale_while_revalidate=30)
def main_page(request):
    """
    View da página inicial que exibe informações de versão, changelog e fundo dinâmico.
    """
    # ... (lógica da view original) ...
    br_tz = pytz.timezone('America/Sao_Paulo')
    versao = VersaoSistema.objects.order_by('-atualizado_em').first()
    deploy_date = versao.atualizado_em.astimezone(br_tz).strftime('%d/%m/%Y') if versao else 'N/A'
    commit_info = f"{versao.numero} – Deploy: {deploy_date}" if versao else "Versão desconhecida"
    changelog_objs = Changelog.objects.filter(exibir=True).order_by('-date')[:5]
    changelog_data = [
        {"message": entry.message, "date": entry.date.astimezone(br_tz)}
        for entry in changelog_objs
    ]
    context = {
        "commit_info": commit_info,
        "changelog": changelog_data,
        "background_image_url": '/static/img/background.png'
    }
    return render(request, 'main_page.html', context)

# OTIMIZAÇÃO: Cache de 24 horas. Página estática.
@cache_control(public=True, max_age=0, s_maxage=86400)
def history(request):
    return render(request, 'history.html')

# OTIMIZAÇÃO: Cache de 24 horas. O conteúdo só muda com deploy.
@cache_control(public=True, max_age=0, s_maxage=86400)
def characters(request):
    nomes_dos_personagens = list(dados.keys())
    context = {'personagens': nomes_dos_personagens,
               "background_image_url": '/static/img/background2.png'}
    return render(request, 'characters.html', context)

# OTIMIZAÇÃO: Cache de 24 horas. Página estática.
@cache_control(public=True, max_age=0, s_maxage=86400)
def chapters(request):
    return render(request, 'chapters.html')

# OTIMIZAÇÃO: Cache curto de 5 minutos para a lista de comentários.
# Isso reduz drasticamente as leituras do banco de dados sob tráfego intenso,
# mas ainda permite que novos comentários apareçam rapidamente.
@cache_control(public=True, max_age=0, s_maxage=300, stale_while_revalidate=30)
def about(request):
    if request.method == 'POST':
        form = CommentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('about')
    else:
        form = CommentForm()

    fixado = Comment.objects.filter(fixado=True).first()
    outros_comentarios = Comment.objects.exclude(id=fixado.id if fixado else None).order_by('-criado_em')

    paginator = Paginator(outros_comentarios, 4)
    page_number = request.GET.get('page')
    comments_page = paginator.get_page(page_number)

    context = {
        'form': form,
        'fixado': fixado,
        'comments': comments_page
    }
    return render(request, 'about.html', context)

# OTIMIZAÇÃO: Cache de 24 horas. O conteúdo só muda com deploy.
@cache_control(public=True, max_age=0, s_maxage=86400)
def pagina_personagem(request, nome_do_personagem):
    character_data = dados.get(nome_do_personagem.lower())
    if character_data is None:
        raise Http404("Personagem não encontrado")

    context = {
        'nome_personagem': nome_do_personagem,
        'media_list': character_data.get('media_list', []),
        'balloon_data': character_data.get('balloon_data', []),
    }
    return render(request, 'personagem.html', context)


# NENHUMA OTIMIZAÇÃO NECESSÁRIA AQUI.
# Esta é uma view de webhook/API, não deve ser cacheada.
@csrf_exempt
def sync_changelogs_view(request):
    secret_token = os.environ.get("SYNC_CHANGELOGS_TOKEN")
    provided_token = request.headers.get("X-Deploy-Token")

    if secret_token and provided_token == secret_token:
        call_command("sync_changelogs")
        return JsonResponse({"status": "ok", "message": "Changelogs sincronizados"})
    else:
        return HttpResponseForbidden("Token inválido")
