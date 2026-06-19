import { isValidWord } from "./api.js";
import { saveScore } from "./storage.js";

const rows = document.querySelectorAll(".game-row");
const keyboardButtons = document.querySelectorAll(".game-keyboard-button");
const scoreDisplay = document.getElementById("current-score");
const timerDisplay = document.querySelector(".game-timer");
const messageEl = document.getElementById("game-message");
const startOverlay = document.getElementById("start-overlay");
const nameModal = document.getElementById("name-modal");
const finalScoreEl = document.getElementById("final-score");
const nameForm = document.getElementById("name-form");
const usernameInput = document.getElementById("username");
const skipBtn = document.getElementById("skip-btn");
startOverlay.hidden = false;

const ROUND_SECONDS = 60;
let answer = "";
let currentRow = 0;
let currentGuess = "";
let gameStarted = false;
let timerId = null;
let timeLeft = ROUND_SECONDS;
const debug_mode = true;
const score = createScore();
const response = await fetch("assets/words.txt");
const words = (await response.text())
    .trim()
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase()
    )

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function isValidKey(key) {
    return /^[a-z]$/i.test(key);
}

function handleInput(key) {
    if (isValidKey(key)) addLetter(key);
    else if (key === "enter") handleEnter();
    else if (key === "Enter") handleEnter();
    else if (key === "erase") removeLetter();
    else if (key === "Backspace") removeLetter();
}

function createScore() {
    let total = 0;
    return {
        add(points) { total += points; return total; },
        get() { return total; },
        reset() { total = 0; },
    };
}

function renderGuess() {
    const tiles = rows[currentRow].querySelectorAll(".row-letter");
    tiles.forEach((tile, i) => {
        tile.textContent = currentGuess[i] ?? "";
    });
}

function resetBoard() {
    rows.forEach(row => {
        row.querySelectorAll(".row-letter").forEach(tile => {
            tile.textContent = "";
            tile.classList.remove("hit", "present", "absent");
        });
    });

    keyboardButtons.forEach(b => b.classList.remove("hit", "present", "absent"));
    currentRow = 0;
    currentGuess = "";
}

function addLetter(letter) {
    if (currentGuess.length >= 5) return;
    currentGuess += letter.toLowerCase();
    renderGuess();
}

function removeLetter() {
    currentGuess = currentGuess.slice(0, -1);
    renderGuess();
}

function newWord() {
    answer = getRandomWord();
    if (debug_mode) console.log("answer:", answer);
}

document.addEventListener("keydown", (e) => {
    if (!gameStarted) startGame();
    handleInput(e.key);
});

keyboardButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (!gameStarted) startGame();
        const key = btn.textContent.trim().toLowerCase();
        handleInput(key);
    });
});

function startGame() {
    gameStarted = true;
    startOverlay.hidden = true;
    newWord();
    startTimer();
}

function startTimer() {
    timeLeft = ROUND_SECONDS;
    updateTimer();
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function updateTimer() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");
    timerDisplay.textContent = `${m}:${s}`;
}

function resetGame() {
    nameModal.hidden = true;
    resetBoard();
    score.reset();
    scoreDisplay.textContent = "0";
    timerDisplay.textContent = "00:00";
    gameStarted = false;
    startOverlay.hidden = false;
}

function endGame() {
    clearInterval(timerId);
    finalScoreEl.textContent = score.get();
    nameModal.hidden = false;
}