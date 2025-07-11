from django import forms
from .models import Comment

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['nome', 'mensagem']
        widgets = {
            'nome': forms.TextInput(attrs={
                'placeholder': 'Seu nome',
                'class': 'form-input'
            }),
            'mensagem': forms.Textarea(attrs={
                'placeholder': 'Escreva seu comentário aqui...',
                'rows': 4,
                'class': 'form-textarea'
            }),
        }
