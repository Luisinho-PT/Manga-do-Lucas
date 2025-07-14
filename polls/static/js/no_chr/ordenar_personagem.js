document.addEventListener("DOMContentLoaded", function () {
    const grid = document.querySelector(".character-grid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".character-card"));

    cards.sort((a, b) => {
        const nomeA = a.querySelector("p").textContent.toLowerCase();
        const nomeB = b.querySelector("p").textContent.toLowerCase();
        return nomeA.localeCompare(nomeB);
    });

    cards.forEach(card => grid.appendChild(card));
});
