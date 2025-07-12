// Array com vídeos e legendas
const videos = [
    {
        src: '/static/img/lucas/lucas_video.mp4',
        caption: 'Arco de treinamento do Lucas'
    },
    {
        src: '/static/img/lucas/lucas_video2.mp4',
        caption: 'Dirigindo meu Bergentruck'
    }
];

let currentIndex = 0;

function changeVideo(direction) {
    currentIndex += direction;

    // Controla o looping do índice entre 0 e videos.length - 1
    if (currentIndex < 0) {
        currentIndex = videos.length - 1;
    } else if (currentIndex >= videos.length) {
        currentIndex = 0;
    }

    const videoElement = document.getElementById('mainVideo');
    const sourceElement = document.getElementById('videoSource');
    const captionElement = document.getElementById('videoCaption');

    // Atualiza o source do vídeo e a legenda
    sourceElement.src = videos[currentIndex].src;
    captionElement.textContent = videos[currentIndex].caption;

    // Precisa recarregar o vídeo após trocar o src
    videoElement.load();
    videoElement.play();
}

// Inicializa com o vídeo 0
window.addEventListener('DOMContentLoaded', () => {
    changeVideo(0);
});
