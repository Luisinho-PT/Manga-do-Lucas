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
let isScrubbing = false;
let currentVolume = 1;

// Elementos do DOM
const videoElement = document.getElementById('mainVideo');
const sourceElement = document.getElementById('videoSource');
const captionElement = document.getElementById('videoCaption');
const timeControlContainer = document.getElementById('time-control-container');
const timeSlider = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');
const volumeButton = document.getElementById('volumeButton');
const volumeSlider = document.getElementById('volumeSlider');
const volumeControlContainer = document.querySelector('.volume-control-container');

// Para autoplay funcionar, o vídeo precisa começar mudo
videoElement.muted = true;

// --- LÓGICA DE VOLUME E INTERAÇÃO ---
// ... (toda a lógica de volume continua a mesma, não precisa alterar) ...
volumeButton.addEventListener('click', (e) => { e.stopPropagation(); volumeSlider.classList.toggle('visible'); });
volumeSlider.addEventListener('input', (e) => { const newVolume = e.target.value / 100; currentVolume = newVolume; videoElement.volume = currentVolume; videoElement.muted = newVolume === 0; updateVolumeIcon(); updateVolumeSliderBackground(); });
document.addEventListener('click', (e) => { if (!volumeControlContainer.contains(e.target)) { volumeSlider.classList.remove('visible'); } });
function updateVolumeSliderBackground() { const percentage = volumeSlider.value; volumeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`; }
function updateVolumeIcon() { if (videoElement.muted || videoElement.volume === 0) { volumeButton.innerHTML = '&#128264;'; } else { volumeButton.innerHTML = '&#128266;'; } }


// --- CONTROLES PRINCIPAIS DO VÍDEO (COM CORREÇÕES) ---

function changeMedia(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = mediaList.length - 1;
    else if (currentIndex >= mediaList.length) currentIndex = 0;

    const currentMedia = mediaList[currentIndex];
    captionElement.textContent = currentMedia.caption;
    sourceElement.src = currentMedia.src;

    // --- MUDANÇA 1: Desativa o slider de tempo enquanto o novo vídeo carrega ---
    timeSlider.disabled = true;
    timeSlider.style.opacity = 0.5; // Efeito visual para indicar que está desativado

    videoElement.load();
    videoElement.play().catch(error => console.log("Autoplay bloqueado.", error));
    
    videoElement.volume = currentVolume;
    videoElement.muted = (currentVolume === 0);
    
    timeControlContainer.classList.add('visible');
    videoElement.loop = true;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

videoElement.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    // --- MUDANÇA 2: Adiciona uma checagem extra para garantir que a duração é um número válido ---
    if (videoElement.duration && !isNaN(videoElement.duration)) {
        const percentage = (videoElement.currentTime / videoElement.duration) * 100;
        timeSlider.value = percentage;
        timeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`;
        const currentTimeFormatted = formatTime(videoElement.currentTime);
        const durationFormatted = formatTime(videoElement.duration);
        timeDisplay.textContent = `${currentTimeFormatted} / ${durationFormatted}`;
    }
});

timeSlider.addEventListener('input', () => {
    // --- MUDANÇA 3: A mesma checagem extra aqui ---
    if (videoElement.duration && !isNaN(videoElement.duration)) {
        const newTime = (timeSlider.value / 100) * videoElement.duration;
        videoElement.currentTime = newTime;
        const percentage = timeSlider.value;
        timeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`;
    }
});

timeSlider.addEventListener('mousedown', () => { isScrubbing = true; });
timeSlider.addEventListener('mouseup', () => { isScrubbing = false; });
timeSlider.addEventListener('touchstart', () => { isScrubbing = true; });
timeSlider.addEventListener('touchend', () => { isScrubbing = false; });

videoElement.addEventListener('loadedmetadata', () => {
    // --- MUDANÇA 4: Reativa o slider de tempo APENAS quando o vídeo está pronto ---
    if (videoElement.duration && !isNaN(videoElement.duration)) {
        timeSlider.disabled = false;
        timeSlider.style.opacity = 1;

        const durationFormatted = formatTime(videoElement.duration);
        timeDisplay.textContent = `00:00 / ${durationFormatted}`;
        timeSlider.style.background = `linear-gradient(to right, #ffd700 0%, #555 0%)`;
    }
    volumeSlider.value = currentVolume * 100;
    updateVolumeSliderBackground();
    updateVolumeIcon();
});

window.addEventListener('DOMContentLoaded', () => {
    videoElement.muted = true;
    volumeButton.innerHTML = '&#128266;';
    document.body.addEventListener('click', () => {
        if (videoElement.muted) {
            videoElement.muted = false;
            updateVolumeIcon();
        }
    }, { once: true });

    changeMedia(0);
});