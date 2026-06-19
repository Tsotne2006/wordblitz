import { getScores } from "./storage.js";

const tbody = document.getElementById("scoreboard-body");

//RENDER ALL OF THE SAVED SCORES
function renderScores() {
    const scores = getScores();
    tbody.innerHTML = "";

    scores.forEach((entry, index) => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = entry.name;

        const scoreCell = document.createElement("td");
        scoreCell.textContent = entry.score;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);

        tbody.appendChild(row);
    });
}

renderScores();