from django.db import models
from django.utils.timezone import localtime

class Comment(models.Model):
    nome = models.CharField(max_length=100)
    mensagem = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)
    fixado = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Se este comentário está sendo fixado, desfixa os outros
        if self.fixado:
            Comment.objects.filter(fixado=True).update(fixado=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.nome} - {self.mensagem[:30]}'
    
class Changelog(models.Model):
    commit_hash = models.CharField(max_length=40, unique=True)
    message = models.TextField()
    date = models.DateTimeField()
    exibir = models.BooleanField(default=True)  # ✅ Adicione esta linha

    def __str__(self):
        return self.message

    
class VersaoSistema(models.Model):
    numero = models.CharField("Número da versão", max_length=20, default='1.0.0')
    commit_hash = models.CharField("Commit hash", max_length=40, blank=True, null=True)
    atualizado_em = models.DateTimeField("Atualizado em", auto_now=True)

    def __str__(self):
        return f"Versão {self.numero}"
