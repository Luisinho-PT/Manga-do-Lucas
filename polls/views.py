import os
from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from datetime import datetime
from .models import Comment
from .forms import CommentForm


# Create your views here.

def main_page(request):
    commit_hash = os.environ.get("RENDER_GIT_COMMIT", "")[:7]
    deploy_date = datetime.now().strftime('%d/%m/%Y')

    commit_info = f"{commit_hash} – Deploy: {deploy_date}" if commit_hash else "versão desconhecida"

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