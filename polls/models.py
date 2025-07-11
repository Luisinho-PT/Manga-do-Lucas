from django.db import models

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
