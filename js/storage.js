const STORAGE_KEY = "wordblitz-scores";

// Get the saved scores, or an empty array if there's nothing yet
export function getScores() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function getScoresBaked() {
    let data = [];
    data.push({ name: "Alice", score: 150 });
    data.push({ name: "Georgie", score: 100 });
    data.push({ name: "Demetrius", score: 89 });
    return data;
}

// Add one new score and write the whole array back
export function saveScore(name, score) {
    const scores = getScores();
    scores.push({ name, score });

    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
}