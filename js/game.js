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

const ROUND_SECONDS = 60;
let answer = "";
let currentRow = 0;
let currentGuess = "";
let gameStarted = false;
let timerId = null;
let timeLeft = ROUND_SECONDS;
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

function addLetter(letter) {
    if (currentGuess.length >= 5) return;
    currentGuess += letter.toLowerCase();
    renderGuess();
}

function removeLetter() {
    currentGuess = currentGuess.slice(0, -1);
    renderGuess();
}

document.addEventListener("keydown", (e) => {
    // if (!gameStarted) return startGame();
    if (/^[a-z]$/i.test(e.key)) addLetter(e.key);
    else if (e.key === "Backspace") removeLetter();
    else if (e.key === "Enter") handleEnter();
});