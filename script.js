const boxes = document.querySelectorAll(".box");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");
const newGameBtn = document.querySelector(".new-game");
const resetBtn = document.querySelector(".reset");
const statusText = document.querySelector(".status");
const difficultyContainer = document.getElementById("difficultyContainer");
const confettiContainer = document.getElementById("confetti-container");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const aiModeBtn = document.getElementById("aiModeBtn");
const difficultySelect = document.getElementById("difficulty");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let vsAI = false;

const human = "X";
const ai = "O";

const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];


// 🎮 Mode Selection
twoPlayerBtn.addEventListener("click", () => {
    vsAI = false;
    difficultyContainer.classList.remove("show");
    resetGame();
});

aiModeBtn.addEventListener("click", () => {
    vsAI = true;
    difficultyContainer.classList.add("show");
    resetGame();
});




// 🎯 Box Click
boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (!gameActive || board[index] !== "") return;

        makeMove(index, currentPlayer);

        if (checkGameOver()) return;

        if (vsAI && currentPlayer === human) {
            currentPlayer = ai;

            statusText.innerText = "Computer is thinking";
            statusText.classList.add("thinking");

            disableBoard();

            let dots = 0;
            let thinkingInterval = setInterval(() => {
                dots = (dots + 1) % 4;
                statusText.innerText = "Computer is thinking" + ".".repeat(dots);
            }, 400);

            setTimeout(() => {
                clearInterval(thinkingInterval);
                statusText.classList.remove("thinking");

                aiMove();
                enableBoard();

                if (!checkGameOver()) {
                    currentPlayer = human;
                    statusText.innerText = "Your Turn";
                }
            }, 1200);

        } else {
            switchPlayer();
        }
    });
});


// 🔹 Make Move
function makeMove(index, player) {
    board[index] = player;
    boxes[index].innerText = player;
    boxes[index].disabled = true;
}
function disableBoard() {
    boxes.forEach(box => box.disabled = true);
}

function enableBoard() {
    boxes.forEach((box, index) => {
        if (board[index] === "") {
            box.disabled = false;
        }
    });
}



// 🔁 Switch Player (2 Player Mode)
function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerText = `Current Turn: ${currentPlayer}`;
}


// 🤖 AI Move Controller
function aiMove() {
    const difficulty = difficultySelect.value;

    if (difficulty === "easy") {
        randomMove();
    } 
    else if (difficulty === "medium") {
        mediumMove();
    } 
    else {
        hardMove();
    }
}


// 🟢 EASY (Random)
function randomMove() {
    let empty = board
        .map((val, idx) => val === "" ? idx : null)
        .filter(val => val !== null);

    let move = empty[Math.floor(Math.random() * empty.length)];
    makeMove(move, ai);
}


// 🟡 MEDIUM (Win → Block → Random)
function mediumMove() {
    let move = findBestMove(ai);
    if (move === -1) move = findBestMove(human);
    if (move === -1) return randomMove();

    makeMove(move, ai);
}


// 🔴 HARD (Unbeatable Minimax)
function hardMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    makeMove(move, ai);
}


// 🧠 Minimax
function minimax(board, depth, isMaximizing) {
    let result = evaluateBoard();
    if (result !== null) return result;

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = ai;
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;

    } else {
        let bestScore = Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = human;
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}


// 🔍 Evaluate Board
function evaluateBoard() {
    for (let pattern of winPatterns) {
        let [a,b,c] = pattern;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            if (board[a] === ai) return 10;
            if (board[a] === human) return -10;
        }
    }

    if (!board.includes("")) return 0;
    return null;
}


// 🔍 Find Best Move (Medium Mode)
function findBestMove(player) {
    for (let pattern of winPatterns) {
        let [a,b,c] = pattern;
        let values = [board[a], board[b], board[c]];

        if (
            values.filter(val => val === player).length === 2 &&
            values.includes("")
        ) {
            return pattern[values.indexOf("")];
        }
    }
    return -1;
}


// 🏆 Check Game Over
function checkGameOver() {
    for (let pattern of winPatterns) {
        let [a,b,c] = pattern;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            highlightWinner(a,b,c);
            showWinner(board[a]);
            return true;
        }
    }

    if (!board.includes("")) {
        showDraw();
        return true;
    }

    return false;
}


// ✨ Highlight Winner
function highlightWinner(a,b,c) {
    boxes[a].style.backgroundColor = "#90ee90";
    boxes[b].style.backgroundColor = "#90ee90";
    boxes[c].style.backgroundColor = "#90ee90";
}


// 🎉 Winner
function showWinner(player) {
    msg.innerText = vsAI
        ? (player === human ? "You Win! 🎉" : "Computer Wins! 🤖")
        : `Player ${player} Wins! 🎉`;

    msgContainer.classList.remove("hide");
    gameActive = false;

    launchConfetti(); // 🎉 Add this line
}



// 🤝 Draw
function showDraw() {
    msg.innerText = "It's a Draw!";
    msgContainer.classList.remove("hide");
    gameActive = false;
}


// 🔄 Reset
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;

    boxes.forEach(box => {
        box.innerText = "";
        box.disabled = false;
        box.style.backgroundColor = " ";
    });

    statusText.innerText = vsAI ? "Your Turn" : "Current Turn: X";
    msgContainer.classList.add("hide");
}


// Buttons
newGameBtn.addEventListener("click", resetGame);
resetBtn.addEventListener("click", resetGame);
function launchConfetti() {
    for (let i = 0; i < 120; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.backgroundColor = randomColor();
        confetti.style.animationDuration = (Math.random() * 2 + 2) + "s";

        confettiContainer.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function randomColor() {
    const colors = [
        "#ff4b2b",
        "#ffcc00",
        "#00f5a0",
        "#00d9f5",
        "#ff00ff",
        "#ffffff"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
