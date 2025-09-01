
// Import valid words from external file
import { VALID_WORDS } from "./validWords.js";

console.log("First valid word:", VALID_WORDS[0]);

const WORD = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
const MAX_TRIES = 6;
let tries = [];

const grid = document.getElementById("grid");
const guessInput = document.getElementById("guess");
const submitBtn = document.getElementById("submit");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");

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
    console.log("First valid word:", VALID_WORDS[0]);
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
    if (guess === WORD) {
        message.textContent = "Congratulations! You guessed it!";
        submitBtn.disabled = true;
    } else if (tries.length === MAX_TRIES) {
        message.textContent = `Game over! The word was ${WORD}.`;
        submitBtn.disabled = true;
    } else {
        message.textContent = "";
    }
});

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

renderGrid();
renderKeyboard();
