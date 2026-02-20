const htmlElement = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('gameStatus');
const resetButton = document.getElementById('resetButton');
const gameModeSelect = document.getElementById('gameMode');

// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'player-vs-player';
let winningLineElement = null;
let lastWinningCondition = null;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function disableBoard() {
    cells.forEach(cell => cell.classList.add('disabled-cell'));
}

function enableBoard() {
    cells.forEach(cell => cell.classList.remove('disabled-cell'));
}

// Reset game state and UI
function initializeGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    gameStatus.textContent = `${currentPlayer}'s Turn`;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled-cell');
    });

    if (winningLineElement) {
        winningLineElement.remove();
        winningLineElement = null;
    }

    lastWinningCondition = null;
    enableBoard();
}

// Cell click handler
function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);
    if (!gameActive || board[index] !== '' || e.target.classList.contains('disabled-cell')) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());

    checkGameResult();

    if (gameActive) {
        switchPlayer();
        if (gameMode === 'player-vs-computer' && currentPlayer === 'O') {
            disableBoard();
            setTimeout(() => {
                computerMove();
                if (gameActive) enableBoard();
            }, 700);
        }
    } else {
        disableBoard();
    }
}

// Switch current player and update UI
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.textContent = `${currentPlayer}'s Turn`;
}

// Check for win or draw
function checkGameResult() {
    let roundWon = false;
    let currentWinningCondition = null;

    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            currentWinningCondition = condition;
            break;
        }
    }

    if (roundWon) {
        gameStatus.textContent = `Player ${currentPlayer} Wins!`;
        gameActive = false;
        disableBoard();
        lastWinningCondition = currentWinningCondition;
        drawWinningLine(currentWinningCondition);
        return;
    }

    if (!board.includes('')) {
        gameStatus.textContent = `It's a Draw!`;
        gameActive = false;
        disableBoard();
    }
}

// Basic AI logic for computer (Player O)
function computerMove() {
    if (!gameActive) return;

    const available = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
    if (available.length === 0) return;

    let bestMove = -1;

    for (const i of available) {
        const testBoard = [...board];
        testBoard[i] = 'O';
        if (checkWinForPlayer(testBoard, 'O')) {
            bestMove = i;
            break;
        }
    }

    if (bestMove === -1) {
        for (const i of available) {
            const testBoard = [...board];
            testBoard[i] = 'X';
            if (checkWinForPlayer(testBoard, 'X')) {
                bestMove = i;
                break;
            }
        }
    }

    if (bestMove === -1 && board[4] === '') bestMove = 4;

    if (bestMove === -1) {
        const corners = [0, 2, 6, 8].filter(i => available.includes(i));
        if (corners.length > 0) bestMove = corners[Math.floor(Math.random() * corners.length)];
    }

    if (bestMove === -1) {
        bestMove = available[Math.floor(Math.random() * available.length)];
    }

    const cell = cells[bestMove];
    board[bestMove] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    checkGameResult();
    if (gameActive) switchPlayer();
}

// Check win condition for a specific player (used by AI)
function checkWinForPlayer(testBoard, player) {
    return winningConditions.some(([a, b, c]) =>
        testBoard[a] === player && testBoard[b] === player && testBoard[c] === player
    );
}

// Draws a strike-through line across the winning cells
function drawWinningLine(condition) {
    if (winningLineElement) winningLineElement.remove();

    winningLineElement = document.createElement('div');
    winningLineElement.classList.add('winning-line');
    gameBoard.appendChild(winningLineElement);

    const start = cells[condition[0]];
    const end = cells[condition[2]];

    const startX = start.offsetLeft + start.offsetWidth / 2;
    const startY = start.offsetTop + start.offsetHeight / 2;
    const endX = end.offsetLeft + end.offsetWidth / 2;
    const endY = end.offsetTop + end.offsetHeight / 2;

    const length = Math.hypot(endX - startX, endY - startY);
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

    winningLineElement.style.width = `${length}px`;
    winningLineElement.style.left = `${startX}px`;
    winningLineElement.style.top = `${startY}px`;
    winningLineElement.style.transformOrigin = '0 50%';
    winningLineElement.style.transform = `translateY(-50%) rotate(${angle}deg)`;
    winningLineElement.style.opacity = 1;
}

// Theme logic
function applyThemePreference() {
    const theme = localStorage.getItem('theme');
    htmlElement.classList.toggle('dark', theme === 'dark');
    themeToggle.checked = theme === 'dark';
}

function toggleDarkMode() {
    htmlElement.classList.toggle('dark');
    localStorage.setItem('theme', htmlElement.classList.contains('dark') ? 'dark' : 'light');
}

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', initializeGame);
gameModeSelect.addEventListener('change', e => {
    gameMode = e.target.value;
    initializeGame();
});
themeToggle.addEventListener('change', toggleDarkMode);

window.addEventListener('resize', () => {
    if (winningLineElement && lastWinningCondition) {
        drawWinningLine(lastWinningCondition);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    applyThemePreference();
    initializeGame();
});
