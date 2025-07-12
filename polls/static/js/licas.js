// Lista de vídeos e legendas para Licas
const videos = [
    {
        src: '/static/img/licas/licas_video.mp4',
        caption: 'PLIM PLIM PLON'
    },
    {
        src: '/static/img/licas/licas_video2.mp4',
        caption: 'Ele é o mais honrado'
    }
];

let currentIndex = 0;

function changeVideo(direction) {
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = videos.length - 1;
    } else if (currentIndex >= videos.length) {
        currentIndex = 0;
    }

    const videoElement = document.getElementById('mainVideo');
    const sourceElement = document.getElementById('videoSource');
    const captionElement = document.getElementById('videoCaption');

    sourceElement.src = videos[currentIndex].src;
    captionElement.textContent = videos[currentIndex].caption;

    videoElement.load();
    videoElement.play();
}

window.addEventListener('DOMContentLoaded', () => {
    changeVideo(0);
});
