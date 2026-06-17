// script.js - Fantasy Hangman Game (Fixed)

const wordBank = [
  { word: "HARRY", hint: "The boy who lived" },
  { word: "POTTER", hint: "Famous wizard with lightning scar" },
  { word: "HERMIONE", hint: "Brightest witch of her age" },
  { word: "DUMBLEDORE", hint: "Headmaster of Hogwarts" },
  { word: "VOLDEMORT", hint: "He who must not be named" },
  { word: "HOGWARTS", hint: "School of Witchcraft and Wizardry" },
  { word: "GRYFFINDOR", hint: "House of the brave" },
  { word: "SLYTHERIN", hint: "House of ambition and cunning" },
  { word: "RAVENCLAW", hint: "House of wit and learning" },
  { word: "HUFFLEPUFF", hint: "House of loyalty and hard work" },
  { word: "PERCY", hint: "Son of Poseidon" },
  { word: "JACKSON", hint: "Demigod hero with Riptide sword" },
  { word: "ANNABETH", hint: "Daughter of Athena" },
  { word: "OLYMPUS", hint: "Home of the Greek gods" },
  { word: "DEMIGOD", hint: "Half-god, half-human" },
  { word: "FRODO", hint: "Ring bearer from the Shire" },
  { word: "GANDALF", hint: "The Grey or White wizard" },
  { word: "ARAGORN", hint: "King of Gondor" },
  { word: "LEGOLAS", hint: "Elven archer" },
  { word: "SAURON", hint: "Dark Lord of Mordor" },
  { word: "MORDOR", hint: "Land of shadow" },
  { word: "MIDDLEEARTH", hint: "The world of the Fellowship" },
  { word: "SNAPE", hint: "Potions master with double life" },
  { word: "RON", hint: "Loyal friend with red hair" },
  { word: "BELLATRIX", hint: "Insane Death Eater" },
];

let selectedWord = "";
let selectedHint = "";
let guessedLetters = [];
let incorrectLetters = [];
let maxAttempts = 6;
let gameOver = false;
let wins = 0;
let losses = 0;

const hangmanStages = [
  "",
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/></svg>`,
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/><circle cx="130" cy="95" r="18" fill="none" stroke="#f1c40f" stroke-width="8"/></svg>`,
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/><circle cx="130" cy="95" r="18" fill="none" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="113" x2="130" y2="170" stroke="#f1c40f" stroke-width="8"/></svg>`,
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/><circle cx="130" cy="95" r="18" fill="none" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="113" x2="130" y2="170" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="130" x2="105" y2="150" stroke="#f1c40f" stroke-width="8"/></svg>`,
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/><circle cx="130" cy="95" r="18" fill="none" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="113" x2="130" y2="170" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="130" x2="105" y2="150" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="130" x2="155" y2="150" stroke="#f1c40f" stroke-width="8"/></svg>`,
  `<svg class="hangman-svg" viewBox="0 0 200 250"><line x1="50" y1="220" x2="150" y2="220" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="220" x2="70" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="70" y1="50" x2="130" y2="50" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="50" x2="130" y2="80" stroke="#f1c40f" stroke-width="8"/><circle cx="130" cy="95" r="18" fill="none" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="113" x2="130" y2="170" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="130" x2="105" y2="150" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="130" x2="155" y2="150" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="170" x2="110" y2="200" stroke="#f1c40f" stroke-width="8"/><line x1="130" y1="170" x2="150" y2="200" stroke="#f1c40f" stroke-width="8"/></svg>`,
];

function createKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = letter;
    btn.addEventListener("click", () => handleGuess(letter));
    keyboard.appendChild(btn);
  });
}

function selectRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordBank.length);
  selectedWord = wordBank[randomIndex].word.toUpperCase();
  selectedHint = wordBank[randomIndex].hint;
}

function initGame() {
  guessedLetters = [];
  incorrectLetters = [];
  gameOver = false;

  selectRandomWord();

  document.getElementById("hint").textContent = selectedHint;
  document.getElementById("game-message").innerHTML = "";
  document.getElementById("incorrect-guesses").textContent = "";

  updateWordDisplay();
  updateAttempts();
  createKeyboard();
  document.getElementById("hangman").innerHTML = hangmanStages[0];
  document.getElementById("hint-btn").disabled = false;
}

function updateWordDisplay() {
  const container = document.getElementById("word-display");
  container.innerHTML = "";
  selectedWord.split("").forEach((letter) => {
    const span = document.createElement("span");
    if (guessedLetters.includes(letter)) {
      span.textContent = letter;
      span.classList.add("revealed");
    } else {
      span.textContent = "_";
    }
    container.appendChild(span);
  });
}

function updateAttempts() {
  const remaining = maxAttempts - incorrectLetters.length;
  document.getElementById("attempts").textContent =
    `Attempts Left: ${remaining}`;
}

function updateStats() {
  document.getElementById("wins").textContent = wins;
  document.getElementById("losses").textContent = losses;
  const total = wins + losses;
  const accuracy = total === 0 ? 100 : Math.round((wins / total) * 100);
  document.getElementById("accuracy").textContent = `${accuracy}%`;
}

function handleGuess(letter) {
  if (
    gameOver ||
    guessedLetters.includes(letter) ||
    incorrectLetters.includes(letter)
  )
    return;

  guessedLetters.push(letter);

  if (selectedWord.includes(letter)) {
    updateWordDisplay();
    checkWin();
  } else {
    incorrectLetters.push(letter);
    document.getElementById("incorrect-guesses").textContent =
      incorrectLetters.join(" ");

    const stage = Math.min(incorrectLetters.length, 6);
    document.getElementById("hangman").innerHTML = hangmanStages[stage];

    updateAttempts();
    checkLoss();
  }

  // Disable the corresponding button
  const buttons = document.querySelectorAll("#keyboard button");
  buttons.forEach((btn) => {
    if (btn.textContent === letter) btn.disabled = true;
  });
}

function checkWin() {
  const won = selectedWord.split("").every((l) => guessedLetters.includes(l));
  if (won) {
    gameOver = true;
    wins++;
    document.getElementById("game-message").innerHTML = `
            <span class="text-success">🎉 CONGRATULATIONS! YOU WIN!<br>The word was <strong>${selectedWord}</strong></span>
        `;
    disableKeyboard();
    updateStats();
    triggerConfetti();
  }
}

function checkLoss() {
  if (incorrectLetters.length >= maxAttempts) {
    gameOver = true;
    losses++;
    document.getElementById("game-message").innerHTML = `
            <span class="text-danger">💀 GAME OVER!<br>The word was <strong>${selectedWord}</strong></span>
        `;
    updateWordDisplay();
    disableKeyboard();
    updateStats();
  }
}

function disableKeyboard() {
  document
    .querySelectorAll("#keyboard button")
    .forEach((btn) => (btn.disabled = true));
}

// Reveal Hint Letter (Fixed)
document.getElementById("hint-btn").addEventListener("click", () => {
  if (gameOver) return;

  const unguessedLetters = [
    ...new Set(
      selectedWord.split("").filter((l) => !guessedLetters.includes(l)),
    ),
  ];
  if (unguessedLetters.length === 0) return;

  const randomLetter =
    unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];

  // Penalty: use 1 attempt
  incorrectLetters.push(randomLetter);
  document.getElementById("incorrect-guesses").textContent =
    incorrectLetters.join(" ");

  const stage = Math.min(incorrectLetters.length, 6);
  document.getElementById("hangman").innerHTML = hangmanStages[stage];

  // Reveal the letter
  guessedLetters.push(randomLetter);
  updateWordDisplay();
  updateAttempts();

  // Disable hint button after use
  document.getElementById("hint-btn").disabled = true;

  checkWin();
  checkLoss();
});

// Physical Keyboard Support (Fixed)
document.addEventListener("keydown", (e) => {
  if (gameOver) return;
  const letter = e.key.toUpperCase();
  if (/^[A-Z]$/.test(letter)) {
    handleGuess(letter);
  }
});

// Restart
document.getElementById("restart-btn").addEventListener("click", initGame);

// Confetti
function triggerConfetti() {
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.textContent = ["✨", "🪄", "⚡", "🦅", "🏆"][
        Math.floor(Math.random() * 5)
      ];
      confetti.style.position = "fixed";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-50px";
      confetti.style.fontSize = "2rem";
      confetti.style.zIndex = "1000";
      confetti.style.transition = "all 3s linear";
      document.body.appendChild(confetti);

      requestAnimationFrame(() => {
        confetti.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 800}deg)`;
        confetti.style.opacity = "0";
      });

      setTimeout(() => confetti.remove(), 3500);
    }, i * 25);
  }
}

// Start
window.onload = () => {
  initGame();
  updateStats();
};
