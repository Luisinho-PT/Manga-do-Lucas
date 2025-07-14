# admin.py
from django.contrib import admin
from .models import Comment, Changelog, VersaoSistema

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('nome', 'mensagem', 'criado_em')
    search_fields = ('nome', 'mensagem')
    list_filter = ('criado_em',)
    ordering = ('-criado_em',)

@admin.register(Changelog)
class ChangelogAdmin(admin.ModelAdmin):
    list_display = ('commit_hash', 'message', 'date')
    search_fields = ('commit_hash', 'message')

@admin.register(VersaoSistema)
class VersaoSistemaAdmin(admin.ModelAdmin):
    list_display = ('numero', 'commit_hash', 'atualizado_em')
    search_fields = ('numero', 'commit_hash')
    ordering = ('-atualizado_em',)
