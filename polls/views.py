import os
import requests
from django.shortcuts import render
from django.core.cache import cache
from datetime import datetime

# Create your views here.

def get_commit_message(commit_hash):
    cache_key = f"commit_message_{commit_hash}"
    message = cache.get(cache_key)
    if message:
        return message

    url = f"https://api.github.com/repos/Luisinho-PT/Manga-do-Lucas/commits/{commit_hash}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        message = data['commit']['message']
        cache.set(cache_key, message, timeout=3600)  # cache por 1 hora
        return message
    return "Mensagem do commit indisponível."

def main_page(request):
    commit_hash = os.environ.get("RENDER_GIT_COMMIT", "")[:7]
    deploy_date = datetime.now().strftime('%d/%m/%Y')

    if commit_hash:
        commit_message = get_commit_message(commit_hash)
        commit_info = f"{commit_hash} – {commit_message} – Deploy: {deploy_date}"
    else:
        commit_info = "Versão desconhecida"

    return render(request, 'main_page.html', {"commit_info": commit_info})

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