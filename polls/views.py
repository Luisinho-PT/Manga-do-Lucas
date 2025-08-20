import os
import requests
from django.http import Http404
from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from datetime import datetime, timezone
import pytz # Importado para o fuso horário de São Paulo
from wsgiref.util import FileWrapper
from django.http import StreamingHttpResponse, HttpResponseNotFound
from django.conf import settings
import re

# Imports dos seus models e forms
from .forms import CommentForm
from .models import Comment, Changelog, VersaoSistema
from .dados import dados

from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
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

def main_page(request):
    """
    View da página inicial que exibe informações de versão, changelog e fundo dinâmico.
    """
    br_tz = pytz.timezone('America/Sao_Paulo')
    
    # Busca a informação de versão do sistema
    versao = VersaoSistema.objects.order_by('-atualizado_em').first()
    deploy_date = datetime.now(tz=br_tz).strftime('%d/%m/%Y')
    commit_info = f"{versao.numero} – Deploy: {deploy_date}" if versao else f"Versão desconhecida – Deploy: {deploy_date}"

    # Busca os 5 últimos changelogs do banco de dados para exibir
    changelog_objs = Changelog.objects.filter(exibir=True).order_by('-date')[:5]

    changelog_data = []
    for entry in changelog_objs:
        # --- CORREÇÃO PRINCIPAL APLICADA AQUI ---
        # A data já vem "aware" do banco, então apenas convertemos para o fuso local.
        local_dt = entry.date.astimezone(br_tz)
        
        changelog_data.append({
            "message": entry.message,
            "date": local_dt,  # Enviamos o OBJETO de data/hora, não uma string!
        })

    # Contexto final para o template
    context = {
        "commit_info": commit_info,
        "changelog": changelog_data,
        "background_image_url": '/static/img/background.png'  # Caminho para sua imagem de fundo
    }
    
    return render(request, 'main_page.html', context)


def history(request):
    return render(request, 'history.html')


def characters(request):
    nomes_dos_personagens = list(dados.keys())
    context = {'personagens': nomes_dos_personagens,
               "background_image_url": '/static/img/background2.png'
    }
    return render(request, 'characters.html', context)

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


@csrf_exempt
def sync_changelogs_view(request):
    # Proteção: só dispara se receber o token correto
    secret_token = os.environ.get("SYNC_CHANGELOGS_TOKEN")
    provided_token = request.headers.get("X-Deploy-Token")

    if secret_token and provided_token == secret_token:
        call_command("sync_changelogs")
        return JsonResponse({"status": "ok", "message": "Changelogs sincronizados"})
    else:
        return HttpResponseForbidden("Token inválido")
    


RANGE_RE = re.compile(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', re.I)

class RangeFileWrapper(object):
    def __init__(self, filelike, blksize=8192, offset=0, length=None):
        self.filelike = filelike
        self.filelike.seek(offset, os.SEEK_SET)
        self.remaining = length
        self.blksize = blksize

    def close(self):
        if hasattr(self.filelike, 'close'):
            self.filelike.close()

    def __iter__(self):
        return self

    def __next__(self):
        if self.remaining is None:
            data = self.filelike.read(self.blksize)
            if data:
                return data
            raise StopIteration()
        else:
            if self.remaining <= 0:
                raise StopIteration()
            data = self.filelike.read(min(self.remaining, self.blksize))
            if not data:
                raise StopIteration()
            self.remaining -= len(data)
            return data

def stream_video(request, path):
    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = RANGE_RE.match(range_header)
    
    # CORREÇÃO: Usando 'polls' como o nome da sua app para encontrar o arquivo
    video_path = os.path.join(settings.BASE_DIR, 'polls', 'static', path)

    try:
        # ... (O restante da função stream_video permanece o mesmo) ...
        size = os.path.getsize(video_path)
        content_type = 'video/mp4'
        if range_match:
            first_byte, last_byte = range_match.groups()
            first_byte = int(first_byte) if first_byte else 0
            last_byte = int(last_byte) if last_byte else size - 1
            if last_byte >= size: last_byte = size - 1
            length = last_byte - first_byte + 1
            resp = StreamingHttpResponse(RangeFileWrapper(open(video_path, 'rb'), offset=first_byte, length=length), status=206, content_type=content_type)
            resp['Content-Length'] = str(length)
            resp['Content-Range'] = f'bytes {first_byte}-{last_byte}/{size}'
        else:
            resp = StreamingHttpResponse(FileWrapper(open(video_path, 'rb')), content_type=content_type)
            resp['Content-Length'] = str(size)
        resp['Accept-Ranges'] = 'bytes'
        return resp
    except FileNotFoundError:
        return HttpResponseNotFound("Arquivo de vídeo não encontrado.")
