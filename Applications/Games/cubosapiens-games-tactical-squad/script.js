    let currentPlayer = "Player";
    let playerUnits = [56, 58, 60];
    let enemyUnits = [3, 5, 7];
    let selectedUnit = null;
    let selectedEnemy = null;
    let keyboardSelection = playerUnits[0];
    let score = 0;
    let difficulty = "medium";
    let moves = 0;
    let wins = Number(localStorage.getItem("wins")) || 0;
    const obstacles = [18, 19, 26, 29, 42, 45];
    const board=document.getElementById("board");
    for(let i = 0; i < 64; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => {
        handleCellClick(i);
    });
    board.appendChild(cell);
}
    function drawBoard() {
    // Clear all cells first
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.style.background = "";
        cell.style.border = "1px solid #222";
    });
    obstacles.forEach(index => {
    cells[index].textContent = "🪨";
    cells[index].style.background = "#555";
});
    // Draw player units
    playerUnits.forEach(index => {
    cells[index].textContent = "🪖";
    if (index === selectedUnit || index === keyboardSelection) {
        cells[index].style.background = "#2ecc71";
        cells[index].style.border = "3px solid yellow";
    } else {
        cells[index].style.border = "1px solid #222";
    }
});
    // Draw enemy units
    enemyUnits.forEach(index => {
    cells[index].textContent = "👾";
    if (index === selectedEnemy) {
        cells[index].style.background = "#e74c3c";
        cells[index].style.border = "3px solid yellow";
    } else {
        cells[index].style.border = "1px solid #222";
    }
});
}
    function isAdjacent(from, to) {

        const row1 = Math.floor(from / 8);
        const col1 = from % 8;

        const row2 = Math.floor(to / 8);
        const col2 = to % 8;

        return (
            Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1
        );
    }
    function getDistance(from, to) {

        const row1 = Math.floor(from / 8);
        const col1 = from % 8;

        const row2 = Math.floor(to / 8);
        const col2 = to % 8;

        return Math.abs(row1 - row2) + Math.abs(col1 - col2);
    }
    function getPossibleMoves(position) {

        let moves = [];
        if (position >= 8)
            moves.push(position - 8);

        if (position < 56)
            moves.push(position + 8);

        if (position % 8 !== 0)
            moves.push(position - 1);

        if (position % 8 !== 7)
            moves.push(position + 1);

    return moves;
}
    function handleCellClick(index) {
    if (playerUnits.includes(index)) {
        selectedUnit = index;
        keyboardSelection = index;
        selectedEnemy = null;
        drawBoard();
        return;
    }
    if (enemyUnits.includes(index)) {
    if (selectedUnit !== null && isAdjacent(selectedUnit, index)) {
        enemyUnits = enemyUnits.filter(enemy => enemy !== index);
        score += 10;
        document.getElementById("score").textContent = score;
        if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        document.getElementById("highScore").textContent = highScore;
    }
        selectedUnit = null;
        drawBoard();
        if (enemyUnits.length === 0) {
            wins++;
            localStorage.setItem("wins", wins);
            document.getElementById("wins").textContent = wins;
            showPopup("🎉 Victory!", "You defeated every enemy.");
    }
        return;
    }
    selectedEnemy = index;
    selectedUnit = null;
    drawBoard();
    return;
}
    if (selectedUnit !== null) {
    if (
        isAdjacent(selectedUnit, index) &&
        !playerUnits.includes(index) &&
        !enemyUnits.includes(index) &&
        !obstacles.includes(index)
    ) {
        const unitIndex = playerUnits.indexOf(selectedUnit);
        playerUnits[unitIndex] = index;
        selectedUnit = null;
        moves++;
        document.getElementById("moves").textContent = moves;

        currentPlayer = "Enemy";
        document.getElementById("turn").textContent = currentPlayer;

        drawBoard();
        let delay = 500;
        if (difficulty === "easy")
            delay = 800;
        else if (difficulty === "hard")
            delay = 250;
        setTimeout(enemyTurn, delay);
    }
}
}
function enemyTurn() {
    if (enemyUnits.length === 0 || playerUnits.length === 0) return;
    enemyUnits = enemyUnits.map(enemy => {
        let target = playerUnits[0];
        let bestDistance = getDistance(enemy, target);
        playerUnits.forEach(player => {
            const distance = getDistance(enemy, player);
            if (distance < bestDistance) {
                bestDistance = distance;
                target = player;
            }
        });
        let possibleMoves = getPossibleMoves(enemy);
        for (let move of possibleMoves) {
            if (playerUnits.includes(move)) {
                playerUnits = playerUnits.filter(p => p !== move);
                if (playerUnits.length === 0) {
                    drawBoard();
                    showPopup("💀 Game Over!", "All your soldiers were defeated.");
                }
                return enemy;
            }
        }
        let validMoves = possibleMoves.filter(move =>
            move >= 0 &&
            move < 64 &&
            !enemyUnits.includes(move) &&
            !playerUnits.includes(move)&&
            !obstacles.includes(move)
        );
        if (validMoves.length > 0) {
            validMoves.sort((a, b) => {
            return getDistance(a, target) - getDistance(b, target);
            });
            return validMoves[0];
        }
        return enemy;
    });
    currentPlayer = "Player";
    document.getElementById("turn").textContent = currentPlayer;
    drawBoard();
}
function restartGame() {
    playerUnits = [56, 58, 60];
    keyboardSelection = playerUnits[0];
    enemyUnits = [3, 5, 7];
    selectedUnit = null;
    selectedEnemy = null;
    score = 0;
    document.getElementById("score").textContent = score;
    moves = 0;
    document.getElementById("moves").textContent = moves;
    currentPlayer = "Player";
    document.getElementById("turn").textContent = currentPlayer;
    drawBoard();
}
document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("popup").classList.add("hidden");
    restartGame();
});
function showPopup(title, message){
    document.getElementById("popupTitle").textContent = title;
    document.getElementById("popupMessage").textContent = message;
    document.getElementById("popup").classList.remove("hidden");
}
document
    .getElementById("restartBtn")
    .addEventListener("click", restartGame);
const themeBtn = document.getElementById("themeBtn");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const theme = document.body.classList.contains("light")
        ? "light"
        : "dark";
    localStorage.setItem("theme", theme);
});
let highScore = Number(localStorage.getItem("highScore")) || 0;
document.getElementById("highScore").textContent = highScore;
document.getElementById("wins").textContent = wins;
document.getElementById("moves").textContent = moves;
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    document.body.classList.add("light");
}
document.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
        restartGame();
        return;
    }

    if (event.key === "t" || event.key === "T") {
        themeBtn.click();
        return;
    }

    if (selectedUnit === null){
        selectedUnit = keyboardSelection;
    };

    let target = selectedUnit;

    if (event.key === "ArrowUp") target -= 8;
    else if (event.key === "ArrowDown") target += 8;
    else if (event.key === "ArrowLeft") target -= 1;
    else if (event.key === "ArrowRight") target += 1;
    else return;

    if (
        target >= 0 &&
        target < 64 &&
        !playerUnits.includes(target) &&
        !enemyUnits.includes(target) &&
        !obstacles.includes(target) &&
        isAdjacent(selectedUnit, target)
    ) {
        const unitIndex = playerUnits.indexOf(selectedUnit);
        playerUnits[unitIndex] = target;
        selectedUnit = null;

        moves++;
        document.getElementById("moves").textContent = moves;

        currentPlayer = "Enemy";
        document.getElementById("turn").textContent = currentPlayer;

        drawBoard();

        let delay = 500;
        if (difficulty === "easy") delay = 800;
        else if (difficulty === "hard") delay = 250;

        setTimeout(enemyTurn, delay);
    }
});
document.getElementById("difficulty").addEventListener("change", function () {
    difficulty = this.value;
});
document.getElementById("helpBtn").addEventListener("click", () => {
    document.getElementById("helpModal").classList.remove("hidden");
});
document.getElementById("closeHelp").addEventListener("click", () => {
    document.getElementById("helpModal").classList.add("hidden");
});
drawBoard();