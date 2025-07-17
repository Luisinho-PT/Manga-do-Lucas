"""
URL configuration for manga project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from polls.views import *  # Import the main page view from the polls app

urlpatterns = [
    path('', main_page, name='main_page'),  # Main page URL
    path('history/', history , name='history'),  # History page URL
    path('characters/', characters, name='characters'),  # Characters page URL
    path('chapters/', chapters, name='chapters'),  # Chapters page URL
    path('about/', about, name='about'),
    path('personagens/<str:nome_do_personagem>/', pagina_personagem ,name='pagina_personagem')
]
