// Lista de mídia (vídeos e imagens)
const mediaList = [
    {
        type: 'video',
        src: '/static/img/lucas/lucas_video.mp4',
        caption: 'Arco de treinamento do Lucas',
    },
    {
        type: 'video',
        src: '/static/img/lucas/lucas_video2.mp4',
        caption: 'Dirigindo meu Bergentruck',
    },
];

let currentIndex = 0;

// Controle dos cliques nos botões
const clickedButtons = new Set();

function changeMedia(direction) {
    currentIndex += direction;

    if (currentIndex < 0) {
        currentIndex = mediaList.length - 1;
    } else if (currentIndex >= mediaList.length) {
        currentIndex = 0;
    }

    const videoElement = document.getElementById('mainVideo');
    const sourceElement = document.getElementById('videoSource');
    const imageElement = document.getElementById('mainImage');
    const captionElement = document.getElementById('videoCaption');

    const currentMedia = mediaList[currentIndex];
    captionElement.textContent = currentMedia.caption;

    if (currentMedia.type === 'video') {
        imageElement.style.display = 'none';
        videoElement.style.display = 'block';
        sourceElement.src = currentMedia.src;
        videoElement.load();
        videoElement.play();
    } else if (currentMedia.type === 'image') {
        // Para o vídeo e esconde ele
        videoElement.pause();
        videoElement.style.display = 'none';

        // Mostra a imagem
        imageElement.src = currentMedia.src;
        imageElement.style.display = 'block';
    }
}

// Função para gerar posição aleatória fora da zona central (safe zone)
function getRandomPosition(container, safeZone) {
    let x, y;
    do {
        x = Math.random() * (container.clientWidth - 20); // largura do botão = 20px
        y = Math.random() * (container.clientHeight - 20);
    } while (
        x > safeZone.left && x < safeZone.right &&
        y > safeZone.top && y < safeZone.bottom
    );
    return { x, y };
}

function randomizeButtons() {
    const container = document.querySelector('.random-button-container');

    // Zona segura aproximada (40%-60% largura e 80%-100% altura do container)
    // Isso evita que botões apareçam perto do centro e em baixo do container (onde fica o vídeo)
    const safeZone = {
        left: container.clientWidth * 0.4,
        right: container.clientWidth * 0.6,
        top: container.clientHeight * 0.8,
        bottom: container.clientHeight
    };

    ['btn1', 'btn2', 'btn3'].forEach(id => {
        const btn = document.getElementById(id);
        const pos = getRandomPosition(container, safeZone);
        btn.style.left = `${pos.x}px`;
        btn.style.top = `${pos.y}px`;
    });
}


// Função para mostrar imagem final com fade-out
function showFinalPopup() {
    const popup = document.getElementById('finalPopupImage');

    popup.classList.remove('fade-out');
    popup.style.display = 'block';

    setTimeout(() => {
        popup.classList.add('fade-out');
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('fade-out');
        }, 1200); // tempo do fade
    }, 3000);
}

// Controla os cliques nos 3 botões
function registerClick(buttonId) {
    clickedButtons.add(buttonId);

    // Se já clicou nos 3 botões, mostra o popup final
    if (clickedButtons.size === 3) {
        showFinalPopup();
        clickedButtons.clear();
        randomizeButtons(); // Opcional: reposiciona os botões após o popup
    }
}

window.addEventListener('DOMContentLoaded', () => {
    changeMedia(0);
    randomizeButtons();
});
