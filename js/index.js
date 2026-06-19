const WEBHOOK_URL = "https://discord.com/api/webhooks/1517542130044633261/yGk-SKFZSWU8LWPIF6UtqA7C-2mJTJ0aXlpC5XqEfTSqas-yffcpqKB3dqIzndthDzum";

const stars = document.querySelectorAll("#star-rating-button");
const starContainer = document.getElementById("star-rating");
const ratingForm = document.getElementById("rating-form");
let currentRating = 0;

function paintStars(n) {
    stars.forEach(star => {
        star.classList.toggle("filled", Number(star.dataset.value) <= n);
    });
}

function resetRating() {
    currentRating = 0;
    paintStars(currentRating);
}

stars.forEach(star => {                       // each handler closes over its star
    star.addEventListener("click", () => {
        const starValue = Number(star.dataset.value)

        if (currentRating === starValue) {
            resetRating();
        } else {
            currentRating = starValue;
        }

        paintStars(currentRating);
    });
});

stars.forEach(star => {
    star.addEventListener("mouseenter", () => {
        paintStars(Number(star.dataset.value));   // preview 1..N while hovering
    });
});

starContainer.addEventListener("mouseleave", () => {
    paintStars(currentRating);                     // revert to the locked-in rating
});

ratingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentRating === 0) {
        // add a notification that the user must select a rating before submitting
        return;
    }

    const liked = document.getElementById("liked").value;
    const comment = document.getElementById("comment").value.trim();

    const message = {
        content: `New WordBlitz rating — ⭐ ${currentRating}/5\nLiked: ${liked}\nComment: ${comment || "(none)"}`
    };

    try {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
        });
        // tell the user the rating was sent successfully
        ratingForm.reset();

        paintStars(0);
        currentRating = 0;
    } catch (err) {
        // alert the user of the error and suggest trying again later
    }
});