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
const startText = startOverlay.querySelector("p");
startOverlay.hidden = false;

const ROUND_SECONDS = 60;
let answer = "";
let currentRow = 0;
let currentGuess = "";
let gameStarted = false;
let timerId = null;
let timeLeft = ROUND_SECONDS;
let acceptingInput = false;
const debug_mode = true;
const log_the_words = true;
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
    if (debug_mode) console.log("key pressed:", key);
    if (!acceptingInput) return;
    if (isValidKey(key)) addLetter(key);
    else if (key === "enter") handleEnter();
    else if (key === "erase" || key === "backspace") removeLetter();
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
    flashMessage("New word generated!", 700);
    if (debug_mode || log_the_words) console.log("answer:", answer);
}

function flashMessage(text, duration = 1000) {
    startText.textContent = text;
    startOverlay.hidden = false;

    setTimeout(() => {
        startOverlay.hidden = true;
        startText.textContent = "Press any key to start";
    }, duration);
}


function checkGuess(guess, answer) {
    guess = guess.toLowerCase();
    answer = answer.toLowerCase();
    const result = Array(5).fill("absent");
    const answerLetters = answer.split("");

    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result[i] = "hit";
            answerLetters[i] = null;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (result[i] === "hit") continue;
        const idx = answerLetters.indexOf(guess[i]);
        if (idx !== -1) {
            result[i] = "present";
            answerLetters[idx] = null;
        }
    }

    return result;
}

function keyButton(letter) {
    return [...keyboardButtons].find(b => b.textContent.trim().toLowerCase() === letter);
}

function paintRow(guess, result) {
    const tiles = rows[currentRow].querySelectorAll(".row-letter");
    result.forEach((status, i) => {
        tiles[i].classList.add(status);
        const key = keyButton(guess[i]);

        if (!key || key.classList.contains("hit")) return;  // green stays green

        if (status === "hit") {
            key.classList.remove("present", "absent");
            key.classList.add("hit");
        } else if (status === "present") {
            key.classList.remove("absent");
            key.classList.add("present");
        } else if (!key.classList.contains("present")) {
            key.classList.add("absent");
        }
    });
}

async function handleEnter() {
    if (currentGuess.length < 5) {
        return;
    }

    let valid;

    try {
        valid = await isValidWord(currentGuess);
    } catch (err) {
        // notify the user of the error after i add notifications :(
        return;
    }

    if (!valid) {
        // word not found quick flash
        return;
    }

    const guess = currentGuess;
    const result = checkGuess(guess, answer);
    paintRow(guess, result);

    if (result.every(s => s === "hit")) {
        scoreDisplay.textContent = score.add(1);
        acceptingInput = false;
        setTimeout(() => {
            resetBoard();
            newWord();
            acceptingInput = true;
        }, 700);
        return;
    }

    currentRow++;
    currentGuess = "";

    if (currentRow >= rows.length) {
        acceptingInput = false;
        setTimeout(() => {
            resetBoard();
            newWord();
            acceptingInput = true;
        }, 700);
    }
}

document.addEventListener("keydown", (e) => {
    if (!gameStarted) startGame();
    handleInput(e.key.toLowerCase());
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
    acceptingInput = true;
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
    acceptingInput = false;
    nameModal.hidden = false;
}

nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (!name) return;
    saveScore(name, score.get());
    resetGame();
});

skipBtn.addEventListener("click", () => resetGame());