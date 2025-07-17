// personagens.js - CORREÇÃO FINAL COM CLICK-TO-PAUSE

window.addEventListener('DOMContentLoaded', () => {

    const mediaDataElement = document.getElementById('media-data');
    if (!mediaDataElement) {
        console.error("Elemento 'media-data' não encontrado.");
        return;
    }
    const mediaList = JSON.parse(mediaDataElement.textContent);

    let currentIndex = 0;
    let isScrubbing = false;
    let currentVolume = 1;

    const videoElement = document.getElementById('mainVideo');
    const sourceElement = document.getElementById('videoSource');
    const imageElement = document.getElementById('mainImage');
    const captionElement = document.getElementById('videoCaption');
    const timeControlContainer = document.getElementById('time-control-container');
    const timeSlider = document.getElementById('timeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    // const playPauseButton = document.getElementById('playPauseButton'); // REMOVIDO
    const volumeButton = document.getElementById('volumeButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeControlContainer = document.querySelector('.volume-control-container');
    const randomButtonsContainer = document.querySelector('.random-button-container');

    function changeMedia(direction) {
        if (direction !== 0) {
            currentIndex += direction;
            if (currentIndex < 0) currentIndex = mediaList.length - 1;
            else if (currentIndex >= mediaList.length) currentIndex = 0;
        }
        const currentMedia = mediaList[currentIndex];
        if (captionElement) { captionElement.textContent = currentMedia.caption || ''; }

        if (currentMedia.type === 'image') {
            videoElement.style.display = 'none';
            videoElement.pause();
            if(imageElement) {
                imageElement.src = currentMedia.src;
                imageElement.style.display = 'block';
            }
            if (timeControlContainer) timeControlContainer.style.display = 'none';
            if (volumeControlContainer) volumeControlContainer.style.display = 'none';

        } else { // Se for um vídeo:
            if(imageElement) imageElement.style.display = 'none';
            
            videoElement.style.display = 'block';
            if (sourceElement) sourceElement.src = currentMedia.src;
            
            if (timeControlContainer) timeControlContainer.style.display = 'flex';
            if (volumeControlContainer) volumeControlContainer.style.display = 'flex';

            if (videoElement.classList) { videoElement.classList.toggle("small-height", !!currentMedia.small); }
            
            videoElement.load();
            videoElement.play().catch(error => console.log("Autoplay bloqueado.", error));
            videoElement.volume = currentVolume;
            videoElement.muted = (currentVolume === 0);
            videoElement.loop = true;
        }
    }

    // --- LÓGICA DE PLAY/PAUSE SIMPLIFICADA ---
    function togglePlayPause() {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }
    
    // ADICIONADO: Clicar no próprio vídeo agora pausa ou toca.
    videoElement.addEventListener('click', togglePlayPause);
    
    // Toda a lógica de 'updatePlayPauseIcon' e seu listener foram removidos.
    
    // --- LÓGICA DE VOLUME ---
    if(volumeButton && volumeSlider && volumeControlContainer) {
        volumeButton.addEventListener('click', (e) => { e.stopPropagation(); volumeSlider.classList.toggle('visible'); });
        volumeSlider.addEventListener('input', (e) => { const newVolume = e.target.value / 100; currentVolume = newVolume; videoElement.volume = currentVolume; videoElement.muted = newVolume === 0; updateVolumeIcon(); updateVolumeSliderBackground(); });
        document.addEventListener('click', (e) => { if (volumeControlContainer && !volumeControlContainer.contains(e.target)) { volumeSlider.classList.remove('visible'); } });
    }
    function updateVolumeSliderBackground() { if(volumeSlider) volumeSlider.style.background = `linear-gradient(to right, #ffd700 ${volumeSlider.value}%, #555 ${volumeSlider.value}%)`; }
    function updateVolumeIcon() { if(volumeButton) volumeButton.innerHTML = (videoElement.muted || videoElement.volume === 0) ? '&#128264;' : '&#128266;'; }

    // --- LÓGICA DA BARRA DE TEMPO ---
    if(timeSlider && timeDisplay) {
        videoElement.addEventListener('timeupdate', () => {
            if (isScrubbing) return;
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                const percentage = (videoElement.currentTime / videoElement.duration) * 100;
                timeSlider.value = percentage;
                timeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`;
                timeDisplay.textContent = `${formatTime(videoElement.currentTime)} / ${formatTime(videoElement.duration)}`;
            }
        });
        timeSlider.addEventListener('input', () => {
            if (videoElement.duration && !isNaN(videoElement.duration)) {
                const newTime = (timeSlider.value / 100) * videoElement.duration;
                videoElement.currentTime = newTime;
                timeSlider.style.background = `linear-gradient(to right, #ffd700 ${timeSlider.value}%, #555 ${timeSlider.value}%)`;
            }
        });
        timeSlider.addEventListener('mousedown', () => { isScrubbing = true; });
        timeSlider.addEventListener('mouseup', () => { isScrubbing = false; });
        timeSlider.addEventListener('touchstart', () => { isScrubbing = true; });
        timeSlider.addEventListener('touchend', () => { isScrubbing = false; });
    }

    // --- FUNÇÕES AUXILIARES E CARREGAMENTO INICIAL ---
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }

    videoElement.addEventListener('loadedmetadata', () => {
        if (timeSlider) { timeSlider.disabled = false; timeSlider.style.opacity = 1; }
        if (timeDisplay && videoElement.duration && !isNaN(videoElement.duration)) { timeDisplay.textContent = `00:00 / ${formatTime(videoElement.duration)}`; }
        if(volumeSlider) { volumeSlider.value = currentVolume * 100; updateVolumeSliderBackground(); }
        updateVolumeIcon();
    });

    window.changeMedia = changeMedia;

    if (randomButtonsContainer) {
        const clickedButtons = new Set();
        function showFinalPopup() { const popup = document.getElementById('finalPopupImage'); if (popup) popup.style.display = 'block'; setTimeout(() => { if (popup) popup.style.display = 'none'; }, 3000); }
        window.registerClick = function(buttonId) { clickedButtons.add(buttonId); if (clickedButtons.size === 3) { showFinalPopup(); clickedButtons.clear(); } }
    }

    videoElement.muted = true;
    document.body.addEventListener('click', () => { if (videoElement.muted) { videoElement.muted = false; updateVolumeIcon(); } }, { once: true });

    changeMedia(0);
    updateVolumeIcon();
});