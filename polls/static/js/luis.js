// Lista de vídeos e suas legendas
const mediaList = [
    {
        type: 'video',
        src: '/static/img/luis/luis_video.mp4',
        caption: 'A lore do meu personagem level 1',
    },
    {
        type: 'video',
        src: '/static/img/luis/luis_video2.mp4',
        caption: 'Quando a esperança acaba, uma outra pode lhe iluminar',
    },
    {
        type: 'video',
        src: '/static/img/luis/luis_video3.mp4',
        caption: 'My Compass Curiosity',
    },
];

let currentIndex = 0;

// Elementos do DOM
const videoElement = document.getElementById('mainVideo');
const sourceElement = document.getElementById('videoSource');
const captionElement = document.getElementById('videoCaption');
const timeControlContainer = document.getElementById('time-control-container');
const timeSlider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const volumeButton = document.getElementById('volumeButton'); // NOVO

// MODIFICADO: Inicia o vídeo como mudo para garantir o autoplay
videoElement.muted = false;

function changeMedia(direction) {
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = mediaList.length - 1;
    } else if (currentIndex >= mediaList.length) {
        currentIndex = 0;
    }

    const currentMedia = mediaList[currentIndex];
    
    captionElement.textContent = currentMedia.caption;
    sourceElement.src = currentMedia.src;
    videoElement.load();

    // Tenta tocar o vídeo. O `catch` lida com o caso de o autoplay falhar.
    videoElement.play().catch(error => {
        console.log("Autoplay bloqueado, o usuário precisa interagir primeiro.", error);
        // O vídeo começará mudo de qualquer forma, e o usuário pode ativar o som.
    });

    if (currentIndex === 2) { 
        timeControlContainer.classList.add('visible');
        videoElement.loop = true;
    } else {
        timeControlContainer.classList.add('visible');
        videoElement.loop = true;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// NOVO: Função para controlar o volume
volumeButton.addEventListener('click', () => {
    videoElement.muted = !videoElement.muted;
    if (videoElement.muted) {
        volumeButton.innerHTML = '&#128264;'; // Ícone de som desligado
    } else {
        volumeButton.innerHTML = '&#128266;'; // Ícone de som ligado
    }
});

videoElement.addEventListener('timeupdate', () => {
    if (videoElement.duration) {
        const sliderValue = (videoElement.currentTime / videoElement.duration) * 100;
        timeSlider.value = sliderValue;
        const currentTimeFormatted = formatTime(videoElement.currentTime);
        const durationFormatted = formatTime(videoElement.duration);
        timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
    }
});

timeSlider.addEventListener('input', () => {
    if (videoElement.duration) {
        const newTime = (timeSlider.value / 100) * videoElement.duration;
        videoElement.currentTime = newTime;
    }
});

videoElement.addEventListener('loadedmetadata', () => {
    if (videoElement.duration) {
        const durationFormatted = formatTime(videoElement.duration);
        timeDisplay.textContent = `00:00 / ${durationFormatted}`;
    }
});

window.addEventListener('DOMContentLoaded', () => {
    changeMedia(0);
});