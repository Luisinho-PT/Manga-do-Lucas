document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // [1] SETUP INICIAL: Leitura de dados e seleção de elementos do DOM
    // =========================================================================

    const sheet = document.querySelector('.character-sheet');
    if (!sheet) return;

    const characterName = sheet.dataset.characterName;
    const mediaList = JSON.parse(document.getElementById('media-data')?.textContent || '[]');
    const speechBalloonsData = JSON.parse(document.getElementById('balloon-data')?.textContent || '[]');

    if (mediaList.length === 0) return;

    const DOM = {
        video: document.getElementById('mainVideo'),
        videoSource: document.getElementById('videoSource'),
        image: document.getElementById('mainImage'),
        figure: document.querySelector('.media-player__figure'),
        caption: document.getElementById('mediaCaption'),
        prevButton: document.getElementById('prevButton'),
        nextButton: document.getElementById('nextButton'),
        timeControl: document.getElementById('time-control-container'),
        timeSlider: document.getElementById('timeSlider'),
        timeSliderWrapper: document.querySelector('.time-slider-wrapper'),
        customThumb: document.getElementById('customThumb'),
        timeTooltip: document.querySelector('.time-tooltip'),
        timeDisplay: document.getElementById('timeDisplay'),
        volumeControl: document.querySelector('.media-player__volume-control'),
        volumeButton: document.getElementById('volumeButton'),
        volumeSlider: document.getElementById('volumeSlider'),
        lucasInteraction: {
            container: document.getElementById('random-button-container'),
            buttons: document.querySelectorAll('.interactive-button'),
            popup: document.getElementById('popupContainer'),
        },
        balloonContainer: document.getElementById('balloon-container'),
    };

    // =========================================================================
    // [2] ESTADO DA APLICAÇÃO
    // =========================================================================

    const State = {
        currentIndex: 0,
        isScrubbing: false,
        wasPlayingBeforeScrub: false,
        currentVolume: 1,
        isBalloonFeatureActive: false,
        preloadedSounds: {},
        availablePhrases: [...speechBalloonsData],
        ness: { stage: 0, sound: new Audio('/static/audio/ness/ness_audio.wav') },
        lucas: { clickedButtons: new Set() },
    };

    // =========================================================================
    // [3] FUNÇÕES PRINCIPAIS DO PLAYER
    // =========================================================================

    function setMedia() {
        cleanupCharacterFeatures();
        const currentMedia = mediaList[State.currentIndex];
        DOM.caption.textContent = currentMedia.caption || '';

        if (currentMedia.type === 'image') {
            DOM.figure.classList.add('is-image');
            DOM.figure.classList.remove('is-video');
            DOM.video.classList.remove('active');
            DOM.video.pause();
            
            // CORREÇÃO: O JS agora monta a URL ESTÁTICA completa
            DOM.image.src = `/static/${currentMedia.src}`; 
            DOM.image.alt = currentMedia.caption || `Imagem de ${characterName}`;
            DOM.image.classList.add('active');

        } else { // type === 'video'
            DOM.figure.classList.add('is-video');
            DOM.figure.classList.remove('is-image');
            DOM.image.classList.remove('active');
            
            // CORREÇÃO: O JS agora monta a URL DE STREAMING completa
            const streamingUrl = `/media/stream/${currentMedia.src}`;
            DOM.videoSource.src = streamingUrl;
            
            DOM.video.load();
            DOM.video.play().catch(error => console.warn("Autoplay bloqueado.", error));
            DOM.video.classList.add('active');
        }
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    // =========================================================================
    // [4] ATUALIZAÇÕES DE INTERFACE (UI)
    // =========================================================================
    
    function updateVolumeIcon() {
        const isMuted = DOM.video.muted || DOM.video.volume === 0;
        DOM.volumeButton.classList.toggle('is-muted', isMuted);
    }
    
    function updateSliderProgress(slider, position) {
        const percentage = position !== undefined ? position * 100 : (slider.value / slider.max) * 100;
        slider.style.setProperty('--progress', `${percentage}%`);
    }

    function animationLoop() {
        if (!State.isScrubbing && DOM.video.duration) {
            const percentage = (DOM.video.currentTime / DOM.video.duration) * 100;
            DOM.timeSlider.value = percentage;
            updateSliderProgress(DOM.timeSlider);
            
            const thumbPosition = (percentage / 100) * DOM.timeSlider.offsetWidth;
            DOM.customThumb.style.left = `${thumbPosition}px`;

            DOM.timeDisplay.textContent = `${formatTime(DOM.video.currentTime)} / ${formatTime(DOM.video.duration)}`;
        }
        handleCharacterSpecificLogic();
        requestAnimationFrame(animationLoop);
    }

    function updateTooltip(e) {
        if (!DOM.video.duration) return;
        const rect = DOM.timeSlider.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0]?.clientX;
        if (clientX === undefined) return;

        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        
        const hoverTime = pos * DOM.video.duration;
        DOM.timeTooltip.textContent = formatTime(hoverTime);
        
        const tooltipWidth = DOM.timeTooltip.offsetWidth;
        const cursorPositionInPixels = pos * rect.width;
        let tooltipLeft = cursorPositionInPixels - (tooltipWidth / 2);
        
        if (tooltipLeft < 0) tooltipLeft = 0;
        if (tooltipLeft + tooltipWidth > rect.width) {
            tooltipLeft = rect.width - tooltipWidth;
        }
        DOM.timeTooltip.style.left = `${tooltipLeft}px`;
    }

    // =========================================================================
    // [5] EVENT HANDLERS
    // =========================================================================

    function handleMediaChange(direction) {
        State.currentIndex = (State.currentIndex + direction + mediaList.length) % mediaList.length;
        setMedia();
    }

    function handleTogglePlayPause() {
        if (DOM.video.paused) DOM.video.play();
        else DOM.video.pause();
    }

    function handleVolumeChange(e) {
        State.currentVolume = e.target.value / 100;
        DOM.video.volume = State.currentVolume;
        DOM.video.muted = State.currentVolume === 0;
        updateVolumeIcon();
        updateSliderProgress(DOM.volumeSlider);
    }

    // =========================================================================
    // [6] LÓGICAS ESPECÍFICAS DE PERSONAGENS
    // =========================================================================

    function manageStarAnimations() {
        const flyingStars = document.querySelectorAll('.star-container:not(.star--corner)');
        const animationClasses = [
            'odyssey-1', 'odyssey-2', 'odyssey-3', 'odyssey-4', 'odyssey-5',
            'odyssey-6', 'odyssey-7', 'odyssey-8', 'odyssey-9', 'odyssey-10',
            'odyssey-11', 'odyssey-12', 'odyssey-13', 'odyssey-14', 'odyssey-15'
        ];
        flyingStars.forEach(star => {
            function applyRandomAnimation() {
                const currentAnimation = star.dataset.currentAnimation;
                if (currentAnimation) {
                    star.classList.remove(currentAnimation);
                }
                let newAnimation;
                do {
                    newAnimation = animationClasses[Math.floor(Math.random() * animationClasses.length)];
                } while (newAnimation === currentAnimation);
                star.classList.add(newAnimation);
                star.dataset.currentAnimation = newAnimation;
            }
            star.addEventListener('animationend', applyRandomAnimation);
            applyRandomAnimation();
        });
    }

    function cleanupCharacterFeatures() {
        State.isBalloonFeatureActive = false;
        if (DOM.balloonContainer) DOM.balloonContainer.innerHTML = '';
        State.ness.stage = 0;
        if (characterName === 'lucas') {
            State.lucas.clickedButtons.clear();
            DOM.lucasInteraction.buttons.forEach(btn => btn.style.display = 'block');
            randomizeLucasButtons();
        }
    }

    function handleCharacterSpecificLogic() {
        switch (characterName) {
            case 'luis':
                const luisVideoIndex = 3;
                const luisTimeTrigger = 132;
                if (State.currentIndex !== luisVideoIndex) {
                    if (State.isBalloonFeatureActive) {
                        cleanupCharacterFeatures();
                    }
                    return;
                }
                if (DOM.video.currentTime >= luisTimeTrigger && !State.isBalloonFeatureActive) {
                    State.isBalloonFeatureActive = true;
                    createBalloon();
                } 
                else if (DOM.video.currentTime < luisTimeTrigger && State.isBalloonFeatureActive) {
                    cleanupCharacterFeatures();
                }
                break;
            case 'ness':
                const nessVideoIndex = 2;
                const nessSoundTrigger = 21;
                if (State.currentIndex !== nessVideoIndex) {
                    if (State.ness.stage > 0) {
                        cleanupCharacterFeatures();
                    }
                    return;
                }
                const currentTime = DOM.video.currentTime;
                if (currentTime >= nessSoundTrigger && State.ness.stage === 0) {
                    State.ness.sound.play();
                    State.ness.stage = 1;
                } 
                else if (currentTime < nessSoundTrigger && State.ness.stage > 0) {
                    cleanupCharacterFeatures();
                }
                break;
        }
    }
    
    function createBalloon() {
        if (!State.isBalloonFeatureActive || DOM.video.paused || speechBalloonsData.length === 0) return;
        if (State.availablePhrases.length === 0) {
            State.availablePhrases = [...speechBalloonsData];
        }
        const phraseIndex = Math.floor(Math.random() * State.availablePhrases.length);
        const phraseData = State.availablePhrases.splice(phraseIndex, 1)[0];
        const balloon = document.createElement('div');
        balloon.className = 'speech-balloon';
        balloon.textContent = phraseData.text;
        balloon.dataset.sound = phraseData.sound;
        const position = getRandomPosition();
        balloon.style.top = position.top;
        balloon.style.left = position.left;
        balloon.addEventListener('click', onBalloonClick);
        DOM.balloonContainer.appendChild(balloon);
    }

    function onBalloonClick(event) {
        const balloon = event.currentTarget;
        balloon.style.pointerEvents = 'none';
        const soundPath = balloon.dataset.sound;
        if (soundPath && State.preloadedSounds[soundPath]) {
            const audio = State.preloadedSounds[soundPath].cloneNode();
            audio.play();
        }
        balloon.classList.add('popping');
        balloon.addEventListener('animationend', () => balloon.remove());
        setTimeout(createBalloon, 8000 + Math.random() * 4000);
    }

    function getRandomPosition() {
        const margin = 10, variation = 20;
        const zones = [
            { top: [margin, margin + variation], left: [margin, margin + variation] },
            { top: [margin, margin + variation], left: [100 - margin - variation, 100 - margin] },
            { top: [100 - margin - variation, 100 - margin], left: [margin, margin + variation] },
            { top: [100 - margin - variation, 100 - margin], left: [100 - margin - variation, 100 - margin] }
        ];
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        const top = Math.random() * (randomZone.top[1] - randomZone.top[0]) + randomZone.top[0];
        const left = Math.random() * (randomZone.left[1] - randomZone.left[0]) + randomZone.left[0];
        return { top: `${top}vh`, left: `${left}vw` };
    }

    function randomizeLucasButtons() {
        if (!DOM.lucasInteraction.container) return;
        DOM.lucasInteraction.buttons.forEach(btn => {
            const container = DOM.lucasInteraction.container;
            const x = Math.random() * (container.clientWidth - 30);
            const y = Math.random() * (container.clientHeight - 30);
            btn.style.left = `${x}px`;
            btn.style.top = `${y}px`;
        });
    }

    function handleLucasButtonClick(button) {
        button.style.display = 'none';
        State.lucas.clickedButtons.add(button.id);
        if (State.lucas.clickedButtons.size === 3) {
            DOM.lucasInteraction.popup.classList.add('visible');
            setTimeout(() => {
                DOM.lucasInteraction.popup.classList.remove('visible');
                cleanupCharacterFeatures();
            }, 3000);
        }
    }

    // =========================================================================
    // [7] INICIALIZAÇÃO E BIND DE EVENTOS
    // =========================================================================

    function initialize() {
        speechBalloonsData.forEach(({ sound }) => {
            if (sound && !State.preloadedSounds[sound]) {
                 State.preloadedSounds[sound] = new Audio(sound);
            }
        });
        if (characterName === 'ness') {
            State.ness.sound.preload = 'auto';
        }

        DOM.prevButton.addEventListener('click', () => handleMediaChange(-1));
        DOM.nextButton.addEventListener('click', () => handleMediaChange(1));
        DOM.video.addEventListener('click', handleTogglePlayPause);
        DOM.volumeSlider.addEventListener('input', handleVolumeChange);
        
        DOM.volumeButton.addEventListener('click', () => {
            DOM.video.muted = !DOM.video.muted;
            if (!DOM.video.muted && DOM.video.volume === 0) {
                DOM.video.volume = 0.5;
                State.currentVolume = 0.5;
                DOM.volumeSlider.value = 50;
                updateSliderProgress(DOM.volumeSlider);
            }
            updateVolumeIcon();
        });
        
        DOM.video.addEventListener('volumechange', updateVolumeIcon);

        // --- Lógica de Scrubbing Robusta ---
        let finalScrubTime = 0;

        const processScrubbing = (e) => {
            if (!State.isScrubbing) return;
            const rect = DOM.timeSlider.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0, Math.min(1, pos));
            updateSliderProgress(DOM.timeSlider, pos);
            const thumbPosition = pos * DOM.timeSlider.offsetWidth;
            DOM.customThumb.style.left = `${thumbPosition}px`;
            updateTooltip(e);
            finalScrubTime = pos * DOM.video.duration;
        };

        const stopScrubbing = () => {
            if (!State.isScrubbing) return;
            DOM.video.currentTime = finalScrubTime;
            if (State.wasPlayingBeforeScrub) {
                DOM.video.play();
            }
            State.isScrubbing = false;
            DOM.timeSliderWrapper.classList.remove('is-scrubbing');
            DOM.timeTooltip.style.opacity = '0';
            document.removeEventListener('mousemove', processScrubbing);
            document.removeEventListener('mouseup', stopScrubbing);
            document.removeEventListener('touchmove', processScrubbing);
            document.removeEventListener('touchend', stopScrubbing);
        };

        const startScrubbing = (e) => {
            if (!DOM.video.duration) return;
            State.isScrubbing = true;
            State.wasPlayingBeforeScrub = !DOM.video.paused;
            DOM.video.pause();
            DOM.timeSliderWrapper.classList.add('is-scrubbing');
            processScrubbing(e);
            DOM.timeTooltip.style.opacity = '1';
            document.addEventListener('mousemove', processScrubbing);
            document.addEventListener('mouseup', stopScrubbing);
            document.addEventListener('touchmove', processScrubbing, { passive: true });
            document.addEventListener('touchend', stopScrubbing);
        };

        DOM.timeSlider.addEventListener('mousedown', startScrubbing);
        DOM.timeSlider.addEventListener('touchstart', startScrubbing, { passive: true });

        // --- Eventos do Tooltip (Hover) ---
        DOM.timeSliderWrapper.addEventListener('mouseenter', () => {
            updateTooltip({ clientX: -9999 });
            DOM.timeTooltip.style.opacity = '1';
        });
        DOM.timeSliderWrapper.addEventListener('mouseleave', () => {
            if (!State.isScrubbing) DOM.timeTooltip.style.opacity = '0';
        });
        DOM.timeSliderWrapper.addEventListener('mousemove', (e) => {
            if (!State.isScrubbing) updateTooltip(e);
        });

        // --- Eventos de Personagens Específicos ---
        if (characterName === 'lucas') {
            DOM.lucasInteraction.buttons.forEach(button => {
                button.addEventListener('click', () => handleLucasButtonClick(button));
            });
            randomizeLucasButtons();
            window.addEventListener('resize', randomizeLucasButtons);
        }
        if (characterName === 'luis') {
            manageStarAnimations();
        }
        
        // --- Inicia o Player ---
        setMedia(0);
        updateSliderProgress(DOM.volumeSlider);
        updateVolumeIcon();
        requestAnimationFrame(animationLoop);
    }

    initialize();
});