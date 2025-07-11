from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('nome', 'mensagem', 'criado_em')
    search_fields = ('nome', 'mensagem')
    list_filter = ('criado_em',)
    ordering = ('-criado_em',)

