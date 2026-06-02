"use strict";

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

const ROWS = 20;
const COLS = 10;
const BLOCK = 30;

const difficultySpeed = {
    easy: 900,
    medium: 650,
    hard: 420
};

let selectedDifficulty = "easy";
let board = createBoard();
let score = 0;
let highScore = Number(localStorage.getItem("tetrisHighScore")) || 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = difficultySpeed[selectedDifficulty];
let lastTime = 0;
let gameRunning = false;
let paused = false;

const COLORS = {
    I: "#00f5ff",
    J: "#4444ff",
    L: "#ff6a00",
    O: "#ffe600",
    S: "#39ff14",
    T: "#bf00ff",
    Z: "#ff2d78"
};

const SHAPES = {
    I: [[1, 1, 1, 1]],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ]
};

let currentPiece = createPiece();
let nextPiece = createPiece();

function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function createPiece() {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];

    return {
        type,
        shape: SHAPES[type].map((row) => [...row]),
        color: COLORS[type],
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

function drawCell(context, x, y, color, size = BLOCK) {
    context.fillStyle = color;
    context.fillRect(x * size, y * size, size, size);

    context.strokeStyle = "#08080f";
    context.lineWidth = 2;
    context.strokeRect(x * size, y * size, size, size);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawCell(ctx, x, y, cell);
            }
        });
    });

    drawPiece(ctx, currentPiece);
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK, 0);
        ctx.lineTo(x * BLOCK, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK);
        ctx.lineTo(canvas.width, y * BLOCK);
        ctx.stroke();
    }
}

function drawPiece(context, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawCell(context, piece.x + x, piece.y + y, piece.color);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    nextCtx.fillStyle = "#0f0f1a";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    const size = 22;
    const offsetX = Math.floor((nextCanvas.width / size - nextPiece.shape[0].length) / 2);
    const offsetY = Math.floor((nextCanvas.height / size - nextPiece.shape.length) / 2);

    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect((offsetX + x) * size, (offsetY + y) * size, size, size);

                nextCtx.strokeStyle = "#08080f";
                nextCtx.lineWidth = 2;
                nextCtx.strokeRect((offsetX + x) * size, (offsetY + y) * size, size, size);
            }
        });
    });
}

function collide(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (
                piece.shape[y][x] &&
                (
                    board[piece.y + y] === undefined ||
                    board[piece.y + y][piece.x + x] === undefined ||
                    board[piece.y + y][piece.x + x]
                )
            ) {
                return true;
            }
        }
    }

    return false;
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        });
    });
}

function clearLines() {
    let cleared = 0;

    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (!board[y][x]) {
                continue outer;
            }
        }

        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
    }

    if (cleared > 0) {
        lines += cleared;
        score += cleared * 100 * level;

        level = Math.floor(lines / 5) + 1;

        const baseSpeed = difficultySpeed[selectedDifficulty];
        dropInterval = Math.max(120, baseSpeed - (level - 1) * 70);

        updateStats();
    }
}

function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
}

function rotatePiece() {
    if (!gameRunning || paused) return;

    const oldShape = currentPiece.shape;
    currentPiece.shape = rotateMatrix(currentPiece.shape);

    if (collide(currentPiece)) {
        currentPiece.shape = oldShape;
    }

    drawBoard();
}

function movePiece(direction) {
    if (!gameRunning || paused) return;

    currentPiece.x += direction;

    if (collide(currentPiece)) {
        currentPiece.x -= direction;
    }

    drawBoard();
}

function dropPiece() {
    if (!gameRunning || paused) return;

    currentPiece.y++;

    if (collide(currentPiece)) {
        currentPiece.y--;
        mergePiece();
        clearLines();

        currentPiece = nextPiece;
        nextPiece = createPiece();

        if (collide(currentPiece)) {
            endGame();
            return;
        }

        drawNextPiece();
    }

    dropCounter = 0;
    drawBoard();
}

function hardDrop() {
    if (!gameRunning || paused) return;

    while (!collide(currentPiece)) {
        currentPiece.y++;
    }

    currentPiece.y--;
    dropPiece();
}

function updateStats() {
    scoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    levelEl.textContent = level;
    linesEl.textContent = lines;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("tetrisHighScore", highScore);
        highScoreEl.textContent = highScore;
    }
}

function update(time = 0) {
    if (!gameRunning || paused) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        dropPiece();
    }

    drawBoard();
    requestAnimationFrame(update);
}

function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    paused = false;
    lastTime = 0;
    drawNextPiece();
    update();
}

function pauseGame() {
    if (!gameRunning) return;

    paused = !paused;

    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.innerHTML = paused
        ? '<i class="fa-solid fa-play"></i> RESUME'
        : '<i class="fa-solid fa-pause"></i> PAUSE';

    if (!paused) {
        lastTime = 0;
        update();
    }
}

function restartGame() {
    board = createBoard();
    score = 0;
    level = 1;
    lines = 0;
    dropCounter = 0;
    dropInterval = difficultySpeed[selectedDifficulty];
    currentPiece = createPiece();
    nextPiece = createPiece();
    gameRunning = true;
    paused = false;

    gameOverEl.classList.remove("show");
    document.getElementById("pauseBtn").innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';

    updateStats();
    drawNextPiece();
    drawBoard();
    update();
}

function endGame() {
    gameRunning = false;
    finalScoreEl.textContent = score;
    updateStats();
    gameOverEl.classList.add("show");
}

function setDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    dropInterval = difficultySpeed[selectedDifficulty];

    document.querySelectorAll(".difficulty-btn").forEach((button) => {
        button.classList.toggle("active", button.dataset.speed === difficulty);
    });

    restartGame();
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") movePiece(-1);
    if (event.key === "ArrowRight") movePiece(1);
    if (event.key === "ArrowDown") dropPiece();
    if (event.key === "ArrowUp") rotatePiece();
    if (event.code === "Space") {
        event.preventDefault();
        hardDrop();
    }
    if (event.key === "p" || event.key === "P") pauseGame();
});

document.querySelectorAll(".difficulty-btn").forEach((button) => {
    button.addEventListener("click", () => setDifficulty(button.dataset.speed));
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);
document.getElementById("playAgainBtn").addEventListener("click", restartGame);

document.getElementById("leftBtn").addEventListener("click", () => movePiece(-1));
document.getElementById("rightBtn").addEventListener("click", () => movePiece(1));
document.getElementById("downBtn").addEventListener("click", dropPiece);
document.getElementById("rotateBtn").addEventListener("click", rotatePiece);

updateStats();
drawBoard();
drawNextPiece();