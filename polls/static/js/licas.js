const videos = [
    {
        src: '/static/img/licas/licas_video.mp4',
        caption: 'PLIM PLIM PLON',
        type: 'video'
    },
    {
        src: '/static/img/licas/licas_video2.mp4',
        caption: 'Ele é o mais honrado',
        type: 'video'
    },
    {
        src: '/static/img/licas/prova.png',
        caption: 'Que prova?',
        type: 'image'
    }
];

let currentIndex = 0;

function changeMedia(direction) {
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = videos.length - 1;
    } else if (currentIndex >= videos.length) {
        currentIndex = 0;
    }

    const media = videos[currentIndex];
    const captionElement = document.getElementById('videoCaption');
    const videoElement = document.getElementById('mainVideo');
    const imageElement = document.getElementById('mainImage');

    captionElement.textContent = media.caption;

    if (media.type === 'video') {
        imageElement.style.display = 'none';

        videoElement.style.display = 'block';
        videoElement.querySelector('source').src = media.src;
        videoElement.load();
        videoElement.play();
    } else if (media.type === 'image') {
        // Parar o vídeo anterior e esconder
        videoElement.pause();
        videoElement.style.display = 'none';

        imageElement.src = media.src;
        imageElement.style.display = 'block';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    changeMedia(0);
});
