# dados.py

# Este arquivo serve como um "mini banco de dados" para os dados dos personagens.
# A estrutura para cada personagem é um dicionário contendo:
# - 'media_list': Uma lista com os vídeos e imagens do personagem.
# - 'balloon_data': Uma lista com as frases e sons para o minigame dos balões.
#   (Atualmente, apenas 'luis' tem dados de balões).

dados = {
    'lucas': {
        'media_list': [
            {'type': 'video', 'src': 'videos/lucas/lucas_video.mp4', 'caption': 'Arco de treinamento do Lucas'},
            {'type': 'video', 'src': 'videos/lucas/lucas_video2.mp4', 'caption': 'Dirigindo meu Bergentruck'}
        ],
        'balloon_data': [] 
    },
    'luis': {
        'media_list': [
            {'type': 'video', 'src': 'videos/luis/luis_video.mp4', 'caption': 'A lore do meu personagem level 1'},
            {'type': 'video', 'src': 'videos/luis/luis_video2.mp4', 'caption': 'Quando a esperança acaba, uma outra pode lhe iluminar'},
            {'type': 'video', 'src': 'videos/luis/luis_video4.mp4', 'caption': 'Calma Calabreso'},
            {'type': 'video', 'src': 'videos/luis/luis_video3.mp4', 'caption': 'My Compass Curiosity'}
        ],
        'balloon_data': [
            {'text': 'That sword was supposed to pierce MY HEART! MINE!', 'sound': '/static/audio/luis/fala1.wav'},
            {'text': '"How foolish... HOW FOOLISH"', 'sound': '/static/audio/luis/fala2.wav'},
            {'text': "HARPOONERS.. FIRE!!!", 'sound': '/static/audio/luis/fala3.wav'},
            {'text': "As long as I kill YOU! I WILL HAVE NOTHING MORE TO WISH FOR IN MY LIFE!", 'sound': '/static/audio/luis/fala4.wav'},
            {'text': "Can't you see? They're all dead and it's all YOUR fault. You could've saved them and yet you did NOTHING.", 'sound': '/static/audio/luis/fala5.wav'}
        ]
    },
    'licas': {
        'media_list': [
            {'type': 'video', 'src': 'videos/licas/licas_video.mp4', 'caption': 'PLIM PLIM PLON'},
            {'type': 'video', 'src': 'videos/licas/licas_video2.mp4', 'caption': 'Ele é o mais honrado'},
            {'type': 'image', 'src': 'img/licas/prova.png', 'caption': 'Que prova?'}
        ],
        'balloon_data': []
    },
    'guido': {
        'media_list': [
            {'type': 'video', 'src': 'videos/guido/guido_video.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': 'videos/guido/guido_video2.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': 'videos/guido/guido_video3.mp4', 'caption': 'Alguem pare esse aura farmer'},
            {'type': 'video', 'src': 'videos/guido/guido_video4.mp4', 'caption': 'Alguem pare esse aura farmer'}
        ],
        'balloon_data': []
    },
    'ness': {
        'media_list': [
            {'type': 'image', 'src': 'img/ness/ness_imagem.png', 'caption': 'This is Peak.'},
            {'type': 'video', 'src': 'videos/ness/ness_video2.mp4', 'caption': 'Driving my Car after the Eclipse'},
            {'type': 'video', 'src': 'videos/ness/ness_video.mp4', 'caption': 'É MAFIA, É MAFIA'},
        ],
        'balloon_data': []
    },
    'karma': {
        'media_list': [],
        'balloon_data': []
    },
    'edward': {
        'media_list': [],
        'balloon_data': []
    },
    'berimbau': {
        'media_list': [],
        'balloon_data': []
    },
    'dot': {
        'media_list': [],
        'balloon_data': []
    },
    'exist': {
        'media_list': [],
        'balloon_data': []
    },
    'machiel': {
        'media_list': [],
        'balloon_data': []
    },
    'agug': {
        'media_list': [],
        'balloon_data': []
    },
}