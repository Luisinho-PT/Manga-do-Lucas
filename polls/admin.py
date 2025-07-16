# admin.py
from django.contrib import admin
from .models import Comment, Changelog, VersaoSistema

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('nome', 'mensagem', 'criado_em', 'fixado') # Adicionado 'fixado' para visualização
    list_editable = ('fixado',) # Permite editar o 'fixado' na lista
    search_fields = ('nome', 'mensagem')
    list_filter = ('criado_em', 'fixado')
    ordering = ('-criado_em',)

@admin.register(Changelog)
class ChangelogAdmin(admin.ModelAdmin):
    # Campos adicionados aqui para facilitar a edição
    list_display = ('message', 'date', 'exibir', 'commit_hash')
    list_editable = ('exibir',)
    search_fields = ('commit_hash', 'message')
    list_filter = ('exibir', 'date') # Filtro por data e visibilidade
    ordering = ('-date',) # Ordena pelo mais recente primeiro

@admin.register(VersaoSistema)
class VersaoSistemaAdmin(admin.ModelAdmin):
    list_display = ('numero', 'commit_hash', 'atualizado_em')
    search_fields = ('numero', 'commit_hash')
    ordering = ('-atualizado_em',)