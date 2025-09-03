
// Import valid words from external file
import { VALID_WORDS } from "./validWords.js";



let MAX_ROUNDS = 5;
const MAX_TRIES = 6;
let currentRound = 1;
let tries = [];
let roundResults = [];
let WORD = "";
let gameStarted = false;

const grid = document.getElementById("grid");
const guessInput = document.getElementById("guess");
const submitBtn = document.getElementById("submit");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");
const roundSelectorDiv = document.getElementById("round-selector");
const numRoundsSelect = document.getElementById("numRounds");
const startGameBtn = document.getElementById("startGame");
// Add timer element
let timerDiv = document.getElementById("timer");
let roundResultsDiv = document.getElementById("round-results");
let summaryResultsDiv = document.getElementById("summary-results");
// Hide summary div initially
summaryResultsDiv.style.display = "none";

// Timer variables
let startTime = null;
let endTime = null;
let timerInterval = null;
function getElapsedTime() {
    if (!startTime) return 0;
    if (endTime) return Math.floor((endTime - startTime) / 1000);
    return Math.floor((Date.now() - startTime) / 1000);
}
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec < 10 ? "0" : ""}${sec}s`;
}
function startLiveTimer() {
    timerDiv.textContent = "Time: 0m 00s";
    timerInterval = setInterval(() => {
        timerDiv.textContent = `Time: ${formatTime(getElapsedTime())}`;
    }, 1000);
}
function stopLiveTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerDiv.textContent = `Final Time: ${formatTime(getElapsedTime())}`;
}

function renderGrid() {
    grid.innerHTML = "";
    tries.forEach(trial => {
        for (let i = 0; i < 5; i++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.textContent = trial.guess[i] || "";
            if (trial.result[i]) cell.classList.add(trial.result[i]);
            grid.appendChild(cell);
        }
    });
    updateKeyboardColors();
}

function checkGuess(guess) {
    console.log("First valid word:", WORD);
    let result = Array(5).fill("absent");
    let wordArr = WORD.split("");
    let guessArr = guess.split("");
    // First pass: correct letters
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === wordArr[i]) {
            result[i] = "correct";
            wordArr[i] = null;
            guessArr[i] = null;
        }
    }
    // Second pass: present letters
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] && wordArr.includes(guessArr[i])) {
            result[i] = "present";
            wordArr[wordArr.indexOf(guessArr[i])] = null;
        }
    }
    return result;
}



submitBtn.addEventListener("click", () => {
    if (!gameStarted) return;
    if (!startTime) {
        startTime = Date.now();
        startLiveTimer();
    }
    let guess = guessInput.value.toUpperCase();
    if (guess.length !== 5) {
        message.textContent = "Enter a 5-letter word.";
        return;
    }
    if (!VALID_WORDS.includes(guess)) {
        message.textContent = "Not a valid word!";
        return;
    }
    if (tries.length >= MAX_TRIES) return;
    let result = checkGuess(guess);
    tries.push({ guess, result });
    renderGrid();
    guessInput.value = "";
    if (guess === WORD || tries.length === MAX_TRIES) {
        endTime = Date.now();
        stopLiveTimer();
        const elapsed = getElapsedTime();
        let success = guess === WORD;
        let attempts = tries.length;
        let roundInfo = {
            round: currentRound,
            word: WORD,
            success,
            attempts,
            time: elapsed
        };
        roundResults.push(roundInfo);
        displayRoundResults();
        if (currentRound < MAX_ROUNDS) {
            message.textContent = success
                ? `Round ${currentRound} complete! You guessed it in ${attempts} attempts and ${formatTime(elapsed)}.`
                : `Round ${currentRound} over! The word was ${WORD}. Attempts: ${attempts}, Time: ${formatTime(elapsed)}`;
            submitBtn.disabled = true;
            setTimeout(() => {
                nextRound();
            }, 2000);
        } else {
            message.textContent = success
                ? `Game finished! You guessed the last word in ${attempts} attempts and ${formatTime(elapsed)}.`
                : `Game finished! The last word was ${WORD}. Attempts: ${attempts}, Time: ${formatTime(elapsed)}`;
            submitBtn.disabled = true;
            roundResultsDiv.innerHTML = "";
            displaySummaryResults();
        }
    } else {
        message.textContent = "";
    }
});
function displayRoundResults() {
    let html = `<h3>Round Results</h3><ul>`;
    roundResults.forEach(r => {
        html += `<li>Round ${r.round}: Word: <b>${r.word}</b> | Attempts: ${r.attempts} | Time: ${formatTime(r.time)} | ${r.success ? "Guessed" : "Not Guessed"}</li>`;
    });
    html += `</ul>`;
    roundResultsDiv.innerHTML = html;
}

function displaySummaryResults() {
    // Only show summary if all rounds are completed
    if (currentRound < MAX_ROUNDS) {
        summaryResultsDiv.innerHTML = "";
        summaryResultsDiv.style.display = "none";
        return;
    }
    let html = `<h2>Game Summary</h2><ul>`;
    roundResults.forEach(r => {
        html += `<li>Round ${r.round}: Word: <b>${r.word}</b> | Attempts: ${r.attempts} | Time: ${formatTime(r.time)} | ${r.success ? "Guessed" : "Not Guessed"}</li>`;
    });
    html += `</ul>`;
    let totalTime = roundResults.reduce((sum, r) => sum + r.time, 0);
    let totalAttempts = roundResults.reduce((sum, r) => sum + r.attempts, 0);
    html += `<p><b>Total Attempts:</b> ${totalAttempts} <br><b>Total Time:</b> ${formatTime(totalTime)}</p>`;
    summaryResultsDiv.innerHTML = html;
    summaryResultsDiv.style.display = "block";
}

function nextRound() {
    currentRound++;
    if (currentRound > MAX_ROUNDS) return;
    tries = [];
    WORD = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
    console.log("First valid word:", WORD);
    startTime = null;
    endTime = null;
    if (timerInterval) clearInterval(timerInterval);
    timerDiv.textContent = "Time: 0m 00s";
    renderGrid();
    renderKeyboard();
    message.textContent = `Round ${currentRound} - Start guessing!`;
    submitBtn.disabled = false;
    guessInput.value = "";
    guessInput.focus();
}

guessInput.addEventListener("input", () => {
    // Remove any non-alphabetic characters
    guessInput.value = guessInput.value.replace(/[^a-zA-Z]/g, "");
});

guessInput.addEventListener("keyup", e => {
    if (e.key === "Enter") submitBtn.click();
});

// On-screen keyboard layout
const KEYS = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Enter","Z","X","C","V","B","N","M","Back"]
];

function renderKeyboard() {
    keyboard.innerHTML = "";
    KEYS.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        row.forEach(key => {
            const keyBtn = document.createElement("div");
            keyBtn.classList.add("key");
            keyBtn.setAttribute("data-key", key);
            if (key === "Enter" || key === "Back") keyBtn.classList.add("special");
            keyBtn.textContent = key;
            keyBtn.addEventListener("click", () => handleKey(key));
            rowDiv.appendChild(keyBtn);
        });
        keyboard.appendChild(rowDiv);
    });
}

function updateKeyboardColors() {
    // Track best status for each letter
    const status = {};
    tries.forEach(trial => {
        for (let i = 0; i < 5; i++) {
            const letter = trial.guess[i];
            const result = trial.result[i];
            if (!letter) continue;
            // Priority: correct > present > absent
            if (result === "correct") {
                status[letter] = "correct";
            } else if (result === "present" && status[letter] !== "correct") {
                status[letter] = "present";
            } else if (result === "absent" && !status[letter]) {
                status[letter] = "absent";
            }
        }
    });
    // Update keyboard keys
    document.querySelectorAll(".key[data-key]").forEach(keyBtn => {
        const key = keyBtn.getAttribute("data-key");
        keyBtn.classList.remove("correct", "present", "absent");
        if (status[key]) {
            keyBtn.classList.add(status[key]);
        }
    });
}

function handleKey(key) {
    if (key === "Enter") {
        submitBtn.click();
    } else if (key === "Back") {
        guessInput.value = guessInput.value.slice(0, -1);
    } else if (/^[A-Z]$/.test(key)) {
        if (guessInput.value.length < 5) {
            guessInput.value += key;
        }
    }
    guessInput.focus();
}





// Game initialization
function initializeGame() {
    MAX_ROUNDS = parseInt(numRoundsSelect.value);
    currentRound = 1;
    tries = [];
    roundResults = [];
    WORD = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
    console.log("First valid word:", WORD);
    gameStarted = true;
    roundSelectorDiv.style.display = "none";
    renderGrid();
    renderKeyboard();
    startTime = null;
    endTime = null;
    if (timerInterval) clearInterval(timerInterval);
    timerDiv.textContent = "Time: 0m 00s";
    message.textContent = `Round 1 - Start guessing!`;
    summaryResultsDiv.innerHTML = "";
    summaryResultsDiv.style.display = "none";
    submitBtn.disabled = false;
    guessInput.value = "";
    guessInput.focus();
}

startGameBtn.addEventListener("click", initializeGame);

// Hide game area until game starts
document.getElementById("game").style.display = "none";

startGameBtn.addEventListener("click", () => {
    document.getElementById("game").style.display = "block";
});
