const videos = [
    {
        src: "/static/img/guido/guido_video.mp4",
        small: false
    },
    {
        src: "/static/img/guido/guido_video2.mp4",
        small: true   // este será reduzido
    },
    {   src: "/static/img/guido/guido_video3.mp4",
        small: true   // este também será reduzido
    },
    {   
        src: "/static/img/guido/guido_video4.mp4",
        small: true   // este também será reduzido
    },
];

let currentVideoIndex = 0;

function changeVideo(direction) {
    const videoElement = document.getElementById("mainVideo");

    currentVideoIndex += direction;

    if (currentVideoIndex < 0) {
        currentVideoIndex = videos.length - 1;
    } else if (currentVideoIndex >= videos.length) {
        currentVideoIndex = 0;
    }

    const newVideo = videos[currentVideoIndex];

    videoElement.querySelector("source").src = newVideo.src;
    videoElement.classList.toggle("small-height", newVideo.small);

    videoElement.load();
    videoElement.play();
}
