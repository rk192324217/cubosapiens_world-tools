/* ============================================================
   The Wizarding Quiz — app.js
   Sections:
   1. State
   2. Constants & data
   3. Element references
   4. Particles spawner
   5. Welcome screen — question count selector
   6. Begin quiz
   7. Quiz flow — renderQuestion
   8. Timer logic
   9. Answer handling
   10. Feedback overlay
   11. Next question
   12. Lives display
   13. Progress bar
   14. Score display
   15. Results screen
   16. Rank + quotes system
   17. Share score
   18. Restart
   19. Screen transitions
   20. Toast helper
   21. Utility helpers
   ============================================================ */

/* ── 1. State ── */
let allQuestions = []; // loaded from questions.json
let gameQuestions = []; // shuffled subset for this round
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let livesLeft = 3;
let timerInterval = null;
let timeRemaining = 0;
let fastestTime = Infinity;
let questionStart = 0;
let selectedCount = 10; // how many questions to use
let answered = false;

/* ── 2. Constants ── */
const MAX_LIVES = 3;
const CIRCUMFERENCE_TIMER = 276.5; // 2π × 44
const CIRCUMFERENCE_RESULT = 439.8; // 2π × 70

const LETTERS = ["A", "B", "C", "D"];

const CORRECT_MESSAGES = [
  "Excellent! Ten points to Gryffindor!",
  "Brilliant! The Sorting Hat is impressed.",
  "Outstanding! Dumbledore would be proud.",
  "Extraordinary! You are a true witch or wizard.",
  "Magical! Professor McGonagall approves.",
  "Spectacular! The stars align in your favour.",
  "Superb! Even Hermione nods in agreement.",
  "Marvellous! Accio wisdom — you have it.",
  "Remarkable! The enchanted quill writes your name in glory.",
  "Splendid! A true Hogwarts scholar.",
];

const WRONG_MESSAGES = [
  "Alas… the Dementors circle closer.",
  "Voldemort stirs. That was not the spell.",
  "The Dark Mark rises. Try harder.",
  "Even Neville got this one right…",
  "The Mirror of Erised shows a better answer.",
  "Perhaps consult Hermione next time.",
  "The Sorting Hat shakes in disappointment.",
  "A Squib might have guessed that.",
  "Avada Kedavra — that answer is dead.",
  "Even Dobby knew the correct answer.",
];

const RANKS = [
  {
    min: 95,
    title: "Albus Dumbledore",
    quote:
      '"It is not our abilities that show what we truly are — it is our choices."',
  },
  {
    min: 85,
    title: "Hermione Granger",
    quote:
      '"Books! And cleverness! There are more important things — friendship and bravery."',
  },
  {
    min: 75,
    title: "Harry Potter",
    quote: '"I am not worried, Harry. I am with you."',
  },
  {
    min: 60,
    title: "Ron Weasley",
    quote: '"When in doubt, go to the library." — Well, perhaps next time.',
  },
  {
    min: 45,
    title: "Neville Longbottom",
    quote:
      '"It takes a great deal of bravery to stand up to our enemies, but a great deal more to stand up to our friends."',
  },
  {
    min: 25,
    title: "Draco Malfoy",
    quote:
      '"You\'ll soon find out that some wizarding families are much better than others."',
  },
  {
    min: 0,
    title: "Nearly Headless Nick",
    quote:
      '"I have been here nearly four hundred years and I have yet to master the most basic Quidditch moves."',
  },
];

/* ── 3. Element References ── */
const screenWelcome = document.getElementById("screenWelcome");
const screenQuiz = document.getElementById("screenQuiz");
const screenResult = document.getElementById("screenResult");
const btnBegin = document.getElementById("btnBegin");
const btnRestart = document.getElementById("btnRestart");
const btnShare = document.getElementById("btnShare");

const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const timerRing = document.getElementById("timerRing");
const timerNum = document.getElementById("timerNum");
const questionCard = document.getElementById("questionCard");
const questionNumber = document.getElementById("questionNumber");
const questionPoints = document.getElementById("questionPoints");
const questionText = document.getElementById("questionText");
const optionsGrid = document.getElementById("optionsGrid");
const feedbackOverlay = document.getElementById("feedbackOverlay");
const feedbackInner = document.getElementById("feedbackInner");
const feedbackIcon = document.getElementById("feedbackIcon");
const feedbackWord = document.getElementById("feedbackWord");
const feedbackMsg = document.getElementById("feedbackMsg");

const rsScore = document.getElementById("rsScore");
const rsCorrect = document.getElementById("rsCorrect");
const rsWrong = document.getElementById("rsWrong");
const rsTime = document.getElementById("rsTime");
const rsPct = document.getElementById("rsPct");
const rsCircle = document.getElementById("rsCircle");
const resultTitle = document.getElementById("resultTitle");
const resultRank = document.getElementById("resultRank");
const resultQuote = document.getElementById("resultQuote");
const toastEl = document.getElementById("toast");

/* ── 4. Particles Spawner ── */
(function spawnParticles() {
  const container = document.getElementById("particles");
  const colors = ["#c9a227", "#f0c84a", "#e84a3a", "#fff8d0", "#8a6e1a"];

  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "particle";

    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const dur = Math.random() * 18 + 10;
    const delay = Math.random() * -20;
    const col = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      bottom:${Math.random() * 20}%;
      background:${col};
      opacity:${Math.random() * 0.5 + 0.2};
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      box-shadow: 0 0 ${size * 2}px ${col};
    `;
    container.appendChild(p);
  }
})();

/* ── 5. Welcome — Question Count Selector ── */
document.querySelectorAll(".qc-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".qc-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCount = parseInt(btn.dataset.count) || 0;
  });
});

/* ── 6. Begin Quiz ── */
btnBegin.addEventListener("click", async () => {
  if (allQuestions.length === 0) {
    showToast("Loading questions…");
    return;
  }
  startGame();
});

async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    allQuestions = await res.json();
  } catch (e) {
    console.error("Failed to load questions:", e);
    showToast("Could not load questions. Check questions.json exists.");
  }
}

function startGame() {
  // Reset state
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  livesLeft = MAX_LIVES;
  currentIndex = 0;
  fastestTime = Infinity;
  answered = false;

  // Shuffle and slice questions
  const shuffled = shuffle([...allQuestions]);
  gameQuestions =
    selectedCount === 0 ? shuffled : shuffled.slice(0, selectedCount);

  // Update UI
  scoreDisplay.textContent = "0";
  renderLives();
  showScreen(screenQuiz);

  setTimeout(() => renderQuestion(), 300);
}

/* ── 7. Render Question ── */
function renderQuestion() {
  if (currentIndex >= gameQuestions.length) {
    endGame();
    return;
  }

  answered = false;
  const q = gameQuestions[currentIndex];

  // Card entrance animation
  questionCard.style.opacity = "0";
  questionCard.style.transform = "translateY(12px)";

  // Update meta
  questionNumber.textContent = `Question ${currentIndex + 1}`;
  questionPoints.innerHTML = `<i class="fa-solid fa-bolt"></i> ${q.pts} pts`;
  questionText.textContent = q.q;

  // Update progress
  updateProgress();

  // Build options
  optionsGrid.innerHTML = "";
  const opts = shuffle(q.o.map((text, i) => ({ text, originalIndex: i })));

  opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.dataset.originalIndex = opt.originalIndex;
    btn.innerHTML = `
      <span class="option-letter">${LETTERS[i]}</span>
      <span class="option-text">${opt.text}</span>
    `;
    btn.addEventListener("click", () =>
      handleAnswer(btn, opt.originalIndex, q, opts),
    );
    optionsGrid.appendChild(btn);
  });

  // Animate card in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      questionCard.style.transition =
        "opacity 0.35s ease, transform 0.35s ease";
      questionCard.style.opacity = "1";
      questionCard.style.transform = "translateY(0)";
    });
  });

  // Animate options in with stagger
  const optBtns = optionsGrid.querySelectorAll(".option-btn");
  optBtns.forEach((b, i) => {
    b.style.opacity = "0";
    b.style.transform = "translateX(-14px)";
    setTimeout(
      () => {
        b.style.transition =
          "opacity 0.3s ease, transform 0.3s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease";
        b.style.opacity = "1";
        b.style.transform = "translateX(0)";
      },
      80 + i * 60,
    );
  });

  // Start timer
  questionStart = Date.now();
  startTimer(q.time || 15); // ← Fixed: fallback added
}

/* ── 8. Timer Logic (FIXED) ── */
function startTimer(seconds) {
  clearInterval(timerInterval);
  timeRemaining = seconds;

  updateTimerDisplay(seconds, seconds);

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay(timeRemaining, seconds);

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay(remaining, total) {
  timerNum.textContent = remaining;

  // Stroke dash offset - FIXED
  const pct = remaining / total;
  timerRing.style.strokeDashoffset = CIRCUMFERENCE_TIMER * (1 - pct);

  // Colour transitions
  timerRing.classList.remove("warning", "danger");
  if (remaining <= 5) timerRing.classList.add("danger");
  else if (remaining <= total * 0.35) timerRing.classList.add("warning");
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleTimeout() {
  if (answered) return;
  answered = true;
  wrongCount++;
  loseLife();

  // Reveal correct answer
  const q = gameQuestions[currentIndex];
  const btns = optionsGrid.querySelectorAll(".option-btn");
  btns.forEach((btn) => {
    btn.disabled = true;
    if (parseInt(btn.dataset.originalIndex) === q.a) {
      btn.classList.add("reveal-correct");
    }
  });

  showFeedback(false, "Time's up!", "The hourglass has run dry…");

  setTimeout(() => {
    hideFeedback();
    if (livesLeft <= 0) {
      endGame();
      return;
    }
    currentIndex++;
    renderQuestion();
  }, 2200);
}

/* ── 9. Answer Handling ── */
function handleAnswer(clickedBtn, selectedIndex, q, shuffledOpts) {
  if (answered) return;
  answered = true;
  stopTimer();

  const elapsed = Math.round((Date.now() - questionStart) / 1000);
  const isCorrect = selectedIndex === q.a;

  // Track fastest correct
  if (isCorrect && elapsed < fastestTime) fastestTime = elapsed;

  // Disable all buttons
  const allBtns = optionsGrid.querySelectorAll(".option-btn");
  allBtns.forEach((btn) => {
    btn.disabled = true;
  });

  if (isCorrect) {
    clickedBtn.classList.add("correct");
    score += q.pts;
    correctCount++;
    animateScore();
  } else {
    clickedBtn.classList.add("wrong");
    wrongCount++;
    loseLife();

    // Show the correct answer
    allBtns.forEach((btn) => {
      if (parseInt(btn.dataset.originalIndex) === q.a) {
        btn.classList.add("reveal-correct");
      }
    });
  }

  // Feedback
  const msg = isCorrect
    ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    : WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];

  showFeedback(isCorrect, isCorrect ? "Correct!" : "Wrong!", msg);

  // Delay before next question
  const delay = livesLeft <= 0 && !isCorrect ? 2400 : 2000;

  setTimeout(() => {
    hideFeedback();
    if (livesLeft <= 0) {
      endGame();
      return;
    }
    currentIndex++;
    renderQuestion();
  }, delay);
}

/* ── 10. Feedback Overlay ── */
function showFeedback(correct, word, msg) {
  feedbackInner.className = `feedback-inner ${correct ? "is-correct" : "is-wrong"}`;
  feedbackIcon.innerHTML = correct
    ? '<i class="fa-solid fa-wand-magic-sparkles"></i>'
    : '<i class="fa-solid fa-skull-crossbones"></i>';
  feedbackWord.textContent = word;
  feedbackMsg.textContent = msg;
  feedbackOverlay.classList.add("show");
}

function hideFeedback() {
  feedbackOverlay.classList.remove("show");
}

/* ── 11. Progress ── */
function updateProgress() {
  const total = gameQuestions.length;
  const pct = (currentIndex / total) * 100;
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${currentIndex + 1} / ${total}`;
}

/* ── 12. Lives ── */
function renderLives() {
  livesDisplay.innerHTML = "";
  for (let i = 0; i < MAX_LIVES; i++) {
    const icon = document.createElement("i");
    icon.className = `fa-solid fa-heart life-icon${i >= livesLeft ? " lost" : ""}`;
    livesDisplay.appendChild(icon);
  }
}

function loseLife() {
  livesLeft = Math.max(0, livesLeft - 1);
  renderLives();

  // Shake the lives display
  livesDisplay.style.animation = "none";
  requestAnimationFrame(() => {
    livesDisplay.style.animation = "wrong-shake 0.4s ease";
  });
}

/* ── 13. Score Animation ── */
function animateScore() {
  scoreDisplay.textContent = score;
  const badge = scoreDisplay.closest(".score-badge");
  badge.classList.remove("score-pop");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      badge.classList.add("score-pop");
    });
  });
}

/* ── 14. End Game ── */
function endGame() {
  stopTimer();
  showScreen(screenResult);
  buildResults();
}

function buildResults() {
  const total = gameQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const maxScore = gameQuestions.reduce((s, q) => s + q.pts, 0);

  rsScore.textContent = score;
  rsCorrect.textContent = correctCount;
  rsWrong.textContent = wrongCount;
  rsTime.textContent = fastestTime === Infinity ? "—" : fastestTime + "s";
  rsPct.textContent = pct + "%";

  // Animate result ring
  const scorePct = maxScore > 0 ? score / maxScore : 0;
  setTimeout(() => {
    rsCircle.style.strokeDashoffset = CIRCUMFERENCE_RESULT * (1 - scorePct);

    // Colour by performance
    if (scorePct >= 0.75) rsCircle.style.stroke = "#c9a227";
    else if (scorePct >= 0.5) rsCircle.style.stroke = "#8a7a5a";
    else rsCircle.style.stroke = "#4a3a2a";
  }, 400);

  // Animate score count up
  animateCountUp(rsScore, 0, score, 1200);

  // Rank
  const rank = getRank(pct);
  resultTitle.textContent = "The Sorting Hat Has Spoken";
  resultRank.textContent = rank.title;
  resultQuote.textContent = rank.quote;
}

function animateCountUp(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── 15. Rank + Quotes ── */
function getRank(pct) {
  return RANKS.find((r) => pct >= r.min) || RANKS[RANKS.length - 1];
}

/* ── 16. Share Score ── */
btnShare.addEventListener("click", () => {
  const total = gameQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const rank = getRank(pct);
  const text = `⚡ I scored ${score} points in The Wizarding Quiz!\n🎓 My rank: ${rank.title}\n✅ ${correctCount}/${total} correct (${pct}% accuracy)\n\nThink you can beat me? Play now!`;

  if (navigator.share) {
    navigator.share({ title: "The Wizarding Quiz", text }).catch(() => {});
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Score copied to clipboard!");
      })
      .catch(() => {
        showToast("Share not supported on this browser");
      });
  }
});

/* ── 17. Restart ── */
btnRestart.addEventListener("click", () => {
  showScreen(screenWelcome);
});

/* ── 18. Screen Transitions ── */
function showScreen(targetScreen) {
  [screenWelcome, screenQuiz, screenResult].forEach((s) => {
    s.classList.remove("active");
  });
  targetScreen.classList.add("active");
}

/* ── 19. Toast ── */
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
}

/* ── 20. Utility: Shuffle (Fisher-Yates) ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Init ── */
loadQuestions();
