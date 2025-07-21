document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LEITURA DOS DADOS E ELEMENTOS ---
    const mediaDataElement = document.getElementById('media-data');
    if (!mediaDataElement) {
        console.error("Elemento 'media-data' não foi encontrado.");
        return;
    }
    const mediaList = JSON.parse(mediaDataElement.textContent);
    if (!mediaList || mediaList.length === 0) return;

    const balloonDataElement = document.getElementById('balloon-data');
    let speechBalloonsData = [];
    if (balloonDataElement && balloonDataElement.textContent) {
        speechBalloonsData = JSON.parse(balloonDataElement.textContent);
    }
    let availablePhrases = [...speechBalloonsData];

    const preloadedSounds = {};
    function preloadBalloonSounds() {
        speechBalloonsData.forEach(({ sound }) => {
            if (!preloadedSounds[sound]) {
                const audio = new Audio(sound);
                audio.preload = 'auto';
                preloadedSounds[sound] = audio;
            }
        });
    }
    preloadBalloonSounds();

    // --- 2. VARIÁVEIS DE ESTADO E ELEMENTOS DO DOM ---
    let currentIndex = 0;
    let isScrubbing = false;
    let wasPlayingBeforeScrub = false;
    let currentVolume = 1;

    // <-- ALTERAÇÃO AQUI: Variáveis de estado para as lógicas exclusivas
    let nessFeatureState = 0; // 0: idle, 1: som tocou, 2: balões ativados
    const nessPsiSound = new Audio('/static/audio/ness/psi_flash.mp3'); // ATENÇÃO: Verifique se este caminho está correto
    nessPsiSound.preload = 'auto';
    // Fim da alteração

    const videoElement = document.getElementById('mainVideo');
    const sourceElement = document.getElementById('videoSource');
    const imageElement = document.getElementById('mainImage');
    const captionElement = document.getElementById('videoCaption');

    const timeControlContainer = document.getElementById('time-control-container');
    const timeSlider = document.getElementById('timeSlider');
    const customThumb = document.getElementById('customThumb');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeControlContainer = document.querySelector('.volume-control-container');
    const volumeButton = document.getElementById('volumeButton');
    const volumeSlider = document.getElementById('volumeSlider');

    const randomButtonsContainer = document.querySelector('.random-button-container');
    let isBalloonFeatureActive = false;
    const balloonContainer = document.getElementById('balloon-container');

    // =================================================================
    // --- 3. FUNÇÕES PRINCIPAIS DO PLAYER ---
    // =================================================================

    function changeMedia(direction) {
        cleanupBalloonFeature(); 
        // <-- ALTERAÇÃO AQUI: Reseta o estado da funcionalidade do Ness
        nessFeatureState = 0;
        // Fim da alteração

        currentIndex = (currentIndex + direction + mediaList.length) % mediaList.length;
        const currentMedia = mediaList[currentIndex];

        captionElement.textContent = currentMedia.caption || '';

        if (currentMedia.type === 'image') {
            videoElement.style.display = 'none';
            videoElement.pause();
            imageElement.src = currentMedia.src;
            imageElement.style.display = 'block';
            timeControlContainer.style.display = 'none';
            volumeControlContainer.style.display = 'none';
        } else {
            imageElement.style.display = 'none';
            videoElement.style.display = 'block';
            sourceElement.src = currentMedia.src;
            timeControlContainer.style.display = 'flex';
            volumeControlContainer.style.display = 'flex';

            videoElement.classList.toggle("small-height", !!currentMedia.small);

            videoElement.load();
            videoElement.play().catch(error => console.log("Autoplay bloqueado.", error));
            videoElement.volume = currentVolume;
            videoElement.muted = (currentVolume === 0);
            videoElement.loop = true;
        }
    }

    function togglePlayPause() {
        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    // =================================================================
    // --- 4. FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE (UI) ---
    // =================================================================

    function updateVolumeIcon() {
        volumeButton.innerHTML = (videoElement.muted || videoElement.volume === 0) ? '&#128264;' : '&#128266;';
    }

    function updateVolumeSliderBackground() {
        volumeSlider.style.background = `linear-gradient(to right, #ffd700 ${volumeSlider.value}%, #555 ${volumeSlider.value}%)`;
    }

    function initializePlayerControls() {
        if (!videoElement.duration || isNaN(videoElement.duration)) return;
        timeDisplay.textContent = `00:00 / ${formatTime(videoElement.duration)}`;
        volumeSlider.value = currentVolume * 100;
        updateVolumeSliderBackground();
        updateVolumeIcon();
    }

    function animationLoop() {
        if (!isScrubbing && !videoElement.paused) {
            const percentage = (videoElement.currentTime / videoElement.duration) * 100;
            timeSlider.value = percentage;
            timeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`;
            customThumb.style.left = `${(percentage / 100) * timeSlider.offsetWidth}px`;
            timeDisplay.textContent = `${formatTime(videoElement.currentTime)} / ${formatTime(videoElement.duration)}`;
            
            // <-- ALTERAÇÃO AQUI: Chama o roteirizador de lógicas exclusivas
            handleCharacterSpecificLogic();
            // Fim da alteração
        }
        requestAnimationFrame(animationLoop);
    }

    // =================================================================
    // --- 5. EVENT LISTENERS ---
    // =================================================================

    videoElement.addEventListener('click', togglePlayPause);
    videoElement.addEventListener('loadedmetadata', initializePlayerControls);

    function startScrubbing(e) {
        isScrubbing = true;
        wasPlayingBeforeScrub = !videoElement.paused;
        videoElement.pause();
        scrub(e);
    }

    function stopScrubbing() {
        if (!isScrubbing) return;
        isScrubbing = false;
        if (wasPlayingBeforeScrub) videoElement.play();
    }

    function scrub(e) {
        if (!isScrubbing) return;
        const clientX = e.clientX || e.touches[0].clientX;
        const rect = timeSlider.getBoundingClientRect();
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));

        const newTime = pos * videoElement.duration;
        videoElement.currentTime = newTime;

        const percentage = pos * 100;
        timeSlider.value = percentage;
        timeSlider.style.background = `linear-gradient(to right, #ffd700 ${percentage}%, #555 ${percentage}%)`;
        customThumb.style.left = `${pos * timeSlider.offsetWidth}px`;
        timeDisplay.textContent = `${formatTime(newTime)} / ${formatTime(videoElement.duration)}`;
    }

    timeSlider.addEventListener('mousedown', startScrubbing);
    document.addEventListener('mousemove', scrub);
    document.addEventListener('mouseup', stopScrubbing);
    timeSlider.addEventListener('touchstart', startScrubbing);
    document.addEventListener('touchmove', scrub);
    document.addEventListener('touchend', stopScrubbing);

    volumeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        volumeSlider.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
        if (!volumeControlContainer.contains(e.target)) {
            volumeSlider.classList.remove('visible');
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        currentVolume = e.target.value / 100;
        videoElement.volume = currentVolume;
        videoElement.muted = (currentVolume === 0);
        updateVolumeIcon();
        updateVolumeSliderBackground();
    });

    // =================================================================
    // --- 6. LÓGICA EXCLUSIVA E INICIALIZAÇÃO ---
    // =================================================================

    window.changeMedia = changeMedia;

    if (randomButtonsContainer) {
        const clickedButtons = new Set();
        const randomizeButtons = () => {
            ['btn1', 'btn2', 'btn3'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                const x = Math.random() * (randomButtonsContainer.clientWidth - 30);
                const y = Math.random() * (randomButtonsContainer.clientHeight - 30);
                btn.style.left = `${x}px`;
                btn.style.top = `${y}px`;
            });
        };
        const showFinalPopup = () => {
            const popup = document.getElementById('popupContainer');
            if (!popup) return;
            popup.style.display = 'flex';
            setTimeout(() => popup.classList.add('visible'), 10);
            setTimeout(() => {
                popup.classList.remove('visible');
                setTimeout(() => popup.style.display = 'none', 500);
            }, 3000);
        };
        window.registerClick = (buttonId) => {
            const btn = document.getElementById(buttonId);
            if (btn) btn.style.display = 'none';
            clickedButtons.add(buttonId);
            if (clickedButtons.size === 3) {
                showFinalPopup();
                clickedButtons.clear();
                setTimeout(() => {
                    ['btn1', 'btn2', 'btn3'].forEach(id => {
                        const b = document.getElementById(id);
                        if (b) b.style.display = 'block';
                    });
                    randomizeButtons();
                }, 3500);
            }
        };
        randomizeButtons();
        window.addEventListener('resize', randomizeButtons);
    }

    // =================================================================
    // --- 7. LÓGICA DOS BALÕES (LUIS) ---
    // =================================================================

    function getRandomPosition() {
        const zones = [
            { top: [5, 25], left: [5, 25] },
            { top: [5, 25], left: [75, 95] },
            { top: [65, 85], left: [5, 25] },
            { top: [65, 85], left: [75, 95] }
        ];
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const top = Math.random() * (randomZone.top[1] - randomZone.top[0]) + randomZone.top[0];
        const left = Math.random() * (randomZone.left[1] - randomZone.left[0]) + randomZone.left[0];
        return { top: `${top}vh`, left: `${left}vw` };
    }

    function onBalloonClick(event) {
        const balloon = event.currentTarget;
        balloon.style.pointerEvents = 'none';
        const sound = balloon.dataset.sound;
        const audio = preloadedSounds[sound]?.cloneNode();
        audio?.play();
        balloon.classList.add('popping');
        balloon.addEventListener('animationend', () => balloon.remove());
        setTimeout(createBalloon, 10000);
    }

    function createBalloon() {
        if (!isBalloonFeatureActive || videoElement.paused || speechBalloonsData.length === 0) return;
        if (availablePhrases.length === 0) {
            availablePhrases = [...speechBalloonsData];
        }
        const phraseIndex = Math.floor(Math.random() * availablePhrases.length);
        const phraseData = availablePhrases.splice(phraseIndex, 1)[0];
        const balloon = document.createElement('div');
        balloon.className = 'speech-balloon';
        balloon.textContent = phraseData.text;
        balloon.dataset.sound = phraseData.sound;
        const position = getRandomPosition();
        balloon.style.top = position.top;
        balloon.style.left = position.left;
        balloon.addEventListener('click', onBalloonClick);
        balloonContainer.appendChild(balloon);
    }

    function cleanupBalloonFeature() {
        isBalloonFeatureActive = false;
        if (balloonContainer) {
            balloonContainer.innerHTML = '';
        }
    }

    // =================================================================
    // --- 8. ROTEIRIZADOR DE LÓGICAS EXCLUSIVAS ---
    // =================================================================
    
    function handleCharacterSpecificLogic() {
        const nomePersonagem = document.querySelector('h1').textContent.toLowerCase();
        switch (nomePersonagem) {
            case 'luis':
                handleLuisLogic();
                break;
            case 'ness':
                handleNessLogic();
                break;
        }
    }

    function handleLuisLogic() {
        if (currentIndex === 2 && videoElement.currentTime >= 132 && !isBalloonFeatureActive) {
            isBalloonFeatureActive = true;
            createBalloon();
        }
        if (isBalloonFeatureActive && videoElement.ended) {
            cleanupBalloonFeature();
        }
    }

    function handleNessLogic() {
        if (currentIndex !== 0) return; // Apenas no primeiro vídeo

        const currentTime = videoElement.currentTime;

        // Estágio 0: Esperando para tocar o som
        if (nessFeatureState === 0 && currentTime >= 25) {
            nessPsiSound.play();
            nessFeatureState = 1; // Avança para o próximo estágio
        }

        // Estágio 1: Esperando para ativar os balões
        if (nessFeatureState === 1 && currentTime >= 30) {
            isBalloonFeatureActive = true;
            createBalloon();
            nessFeatureState = 2; // Avança para o estágio final (funcionalidade concluída)
        }
    }

    // --- INICIALIZAÇÃO DO PLAYER ---
    changeMedia(0);
    requestAnimationFrame(animationLoop);
});