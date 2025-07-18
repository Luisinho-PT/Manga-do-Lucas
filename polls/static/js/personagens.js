// personagens.js - VERSÃO FINAL

window.addEventListener('DOMContentLoaded', () => {

    const mediaDataElement = document.getElementById('media-data');
    if (!mediaDataElement) { console.error("Elemento 'media-data' não encontrado."); return; }
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
    const playPauseButton = document.getElementById('playPauseButton');
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
            if(imageElement) { imageElement.src = currentMedia.src; imageElement.style.display = 'block'; }
            if (timeControlContainer) timeControlContainer.style.display = 'none';
            if (volumeControlContainer) volumeControlContainer.style.display = 'none';
            if (playPauseButton) playPauseButton.style.display = 'none';
        } else {
            if(imageElement) imageElement.style.display = 'none';
            videoElement.style.display = 'block';
            if (sourceElement) sourceElement.src = currentMedia.src;
            if (timeControlContainer) timeControlContainer.style.display = 'flex';
            if (volumeControlContainer) volumeControlContainer.style.display = 'flex';
            if (playPauseButton) playPauseButton.style.display = 'block';
            if (videoElement.classList) { videoElement.classList.toggle("small-height", !!currentMedia.small); }
            videoElement.load();
            videoElement.play().catch(error => console.log("Autoplay bloqueado.", error));
            videoElement.volume = currentVolume;
            videoElement.muted = (currentVolume === 0);
            videoElement.loop = true;
        }
    }

    function togglePlayPause() {
        if (videoElement.paused) { videoElement.play(); } else { videoElement.pause(); }
    }
    
    // Lógica de click-to-pause no vídeo
    videoElement.addEventListener('click', togglePlayPause);

    if(volumeButton && volumeSlider && volumeControlContainer) {
        volumeButton.addEventListener('click', (e) => { e.stopPropagation(); volumeSlider.classList.toggle('visible'); });
        volumeSlider.addEventListener('input', (e) => { const newVolume = e.target.value / 100; currentVolume = newVolume; videoElement.volume = currentVolume; videoElement.muted = newVolume === 0; updateVolumeIcon(); updateVolumeSliderBackground(); });
        document.addEventListener('click', (e) => { if (volumeControlContainer && !volumeControlContainer.contains(e.target)) { volumeSlider.classList.remove('visible'); } });
    }
    function updateVolumeSliderBackground() { if(volumeSlider) volumeSlider.style.background = `linear-gradient(to right, #ffd700 ${volumeSlider.value}%, #555 ${volumeSlider.value}%)`; }
    function updateVolumeIcon() { if(volumeButton) volumeButton.innerHTML = (videoElement.muted || videoElement.volume === 0) ? '&#128264;' : '&#128266;'; }

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

    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; }

    videoElement.addEventListener('loadedmetadata', () => {
        if (timeSlider) { timeSlider.disabled = false; timeSlider.style.opacity = 1; }
        if (timeDisplay && videoElement.duration && !isNaN(videoElement.duration)) { timeDisplay.textContent = `00:00 / ${formatTime(videoElement.duration)}`; }
        if(volumeSlider) { volumeSlider.value = currentVolume * 100; updateVolumeSliderBackground(); }
        updateVolumeIcon();
    });

    window.changeMedia = changeMedia;

    // --- LÓGICA EXCLUSIVA PARA O LUCAS (RESTAURADA E CORRIGIDA) ---
    if (randomButtonsContainer) {
        const clickedButtons = new Set();

        function randomizeButtons() {
            const container = randomButtonsContainer;
            if (!container) return;
            ['btn1', 'btn2', 'btn3'].forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    const x = Math.random() * (container.clientWidth - 30); // Subtrai a largura do botão
                    const y = Math.random() * (container.clientHeight - 30); // Subtrai a altura
                    btn.style.left = `${x}px`;
                    btn.style.top = `${y}px`;
                }
            });
        }

        function showFinalPopup() {
            const popupContainer = document.getElementById('popupContainer');
            if (!popupContainer) return;

            popupContainer.style.display = 'flex';
            setTimeout(() => {
                popupContainer.classList.add('visible');
            }, 10);

            setTimeout(() => {
                popupContainer.classList.remove('visible');
                setTimeout(() => {
                    popupContainer.style.display = 'none';
                }, 500);
            }, 3000);
        }

        window.registerClick = function(buttonId) {
            const btn = document.getElementById(buttonId);
            if(btn) btn.style.display = 'none'; // Esconde o botão ao clicar
            
            clickedButtons.add(buttonId);

            if (clickedButtons.size === 3) {
                showFinalPopup();
                clickedButtons.clear();
                // Opcional: Reaparece e aleatoriza os botões após o ciclo
                setTimeout(() => {
                    ['btn1', 'btn2', 'btn3'].forEach(id => {
                        const btn = document.getElementById(id);
                        if(btn) btn.style.display = 'block';
                    });
                    randomizeButtons();
                }, 4000);
            }
        }
        
        randomizeButtons();
        window.addEventListener('resize', randomizeButtons);
    }

    // --- INICIALIZAÇÃO ---
    videoElement.muted = true;
    document.body.addEventListener('click', () => { if (videoElement.muted) { videoElement.muted = false; updateVolumeIcon(); } }, { once: true });
    changeMedia(0);
    updateVolumeIcon();
});