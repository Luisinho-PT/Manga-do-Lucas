from django.contrib import admin
from .models import Comment, Changelog

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