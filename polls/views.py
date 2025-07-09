from django.shortcuts import render


# Create your views here.

def main_page(request):
    return render(request, 'main_page.html')

def history(request):
    return render(request, 'history.html')

def characters(request):
    return render(request, 'characters.html')

def chapters(request):
    return render(request, 'chapters.html')

def about(request):
    return render(request, 'about.html')


def lucas(request):
    return render(request, 'lucas.html')

def luis(request):
    return render(request, 'luis.html')