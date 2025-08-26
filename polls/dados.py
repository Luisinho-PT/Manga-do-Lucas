# dados.py

# --- PONTO CENTRAL DA CORREÇÃO ---
# Criamos uma variável para a URL base de toda a mídia.
# AGORA: Aponta para a pasta /static/ para funcionar com o Django e Vercel.
# FUTURO: Quando você hospedar em um serviço externo, BASTA MUDAR ESTA ÚNICA LINHA!
# Exemplo Futuro (Cloudinary/S3): MEDIA_BASE_URL = "https://res.cloudinary.com/seu-nome/image/upload/"

MEDIA_BASE_URL = "/static/"


# Este arquivo serve como um "mini banco de dados" para os dados dos personagens.
# Todos os caminhos 'src' e 'sound' foram padronizados para usar a MEDIA_BASE_URL.
dados = {
    'lucas': {
        'media_list': [
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/lucas/lucas_video.mp4', 'caption': 'Arco de treinamento do Lucas'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/lucas/lucas_video2.mp4', 'caption': 'Dirigindo meu Bergentruck'}
        ],
        'balloon_data': []
    },
    'luis': {
        'media_list': [
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/luis/luis_video.mp4', 'caption': 'A lore do meu personagem level 1'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/luis/luis_video2.mp4', 'caption': 'Quando a esperança acaba, uma outra pode lhe iluminar'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/luis/luis_video4.mp4', 'caption': 'Calma Calabreso'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/luis/luis_video3.mp4', 'caption': 'My Compass Curiosity'}
        ],
        'balloon_data': [
            {'text': 'That sword was supposed to pierce MY HEART! MINE!', 'sound': f'{MEDIA_BASE_URL}audio/luis/fala1.wav'},
            {'text': '"How foolish... HOW FOOLISH"', 'sound': f'{MEDIA_BASE_URL}audio/luis/fala2.wav'},
            {'text': "HARPOONERS.. FIRE!!!", 'sound': f'{MEDIA_BASE_URL}audio/luis/fala3.wav'},
            {'text': "As long as I kill YOU! I WILL HAVE NOTHING MORE TO WISH FOR IN MY LIFE!", 'sound': f'{MEDIA_BASE_URL}audio/luis/fala4.wav'},
            {'text': "Can't you see? They're all dead and it's all YOUR fault. You could've saved them and yet you did NOTHING.", 'sound': f'{MEDIA_BASE_URL}audio/luis/fala5.wav'}
        ]
    },
    'licas': {
        'media_list': [
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/licas/licas_video.mp4', 'caption': 'PLIM PLIM PLON'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/licas/licas_video2.mp4', 'caption': 'Ele é o mais honrado'},
            {'type': 'image', 'src': f'{MEDIA_BASE_URL}img/licas/prova.png', 'caption': 'Que prova?'}
        ],
        'balloon_data': []
    },
    'guido': {
        'media_list': [
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/guido/guido_video.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/guido/guido_video2.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/guido/guido_video3.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/guido/guido_video4.mp4', 'caption': 'Alguem pare esse aura farmer'}
        ],
        'balloon_data': []
    },
    'ness': {
        'media_list': [
            {'type': 'image', 'src': f'{MEDIA_BASE_URL}img/ness/ness_imagem.png', 'caption': 'This is Peak.'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/ness/ness_video2.mp4', 'caption': 'Driving my Car after the Eclipse'},
            {'type': 'video', 'src': f'{MEDIA_BASE_URL}videos/ness/ness_video.mp4', 'caption': 'É MAFIA, É MAFIA'},
        ],
        'balloon_data': []
    },
    # Personagens sem mídia permanecem iguais
    'karma': {'media_list': [], 'balloon_data': []},
    'edward': {'media_list': [], 'balloon_data': []},
    'berimbau': {'media_list': [], 'balloon_data': []},
    'dot': {'media_list': [], 'balloon_data': []},
    'exist': {'media_list': [], 'balloon_data': []},
    'machiel': {'media_list': [], 'balloon_data': []},
    'agug': {'media_list': [], 'balloon_data': []},
}