// Quantum Merge 2048 Engine
document.addEventListener("DOMContentLoaded", () => {
    const SIZE = 4;
    let board = [];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem("luckykit_2048_best") || "0");
    let gameOver = false;
    let won = false;

    const gridContainer = document.getElementById("gridContainer");
    const tileContainer = document.getElementById("tileContainer");
    const scoreEl = document.getElementById("score");
    const bestScoreEl = document.getElementById("bestScore");
    const restartBtn = document.getElementById("restartBtn");
    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlaySub = document.getElementById("overlaySub");
    const overlayRestartBtn = document.getElementById("overlayRestartBtn");

    bestScoreEl.innerText = bestScore;

    function initGame() {
        board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        score = 0;
        gameOver = false;
        won = false;
        scoreEl.innerText = score;
        overlay.classList.add("d-none");
        overlay.classList.remove("d-flex");
        tileContainer.innerHTML = "";
        
        spawnTile();
        spawnTile();
        renderBoard();
    }

    function spawnTile() {
        const emptyCells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return;
        const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randCell.r][randCell.c] = Math.random() < 0.9 ? 2 : 4;
    }

    function renderBoard() {
        tileContainer.innerHTML = "";
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const val = board[r][c];
                if (val !== 0) {
                    const tile = document.createElement("div");
                    tile.className = `tile tile-${val}`;
                    tile.innerText = val;
                    
                    // Position calculations
                    const boardWidth = tileContainer.clientWidth;
                    const gap = boardWidth > 350 ? 12 : 8;
                    const tileSize = (boardWidth - (gap * 3)) / 4;
                    const left = c * (tileSize + gap);
                    const top = r * (tileSize + gap);

                    tile.style.left = `${left}px`;
                    tile.style.top = `${top}px`;
                    tile.style.width = `${tileSize}px`;
                    tile.style.height = `${tileSize}px`;

                    tileContainer.appendChild(tile);
                }
            }
        }
    }

    function slide(row) {
        let arr = row.filter(val => val !== 0);
        let mergedScore = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                mergedScore += arr[i];
                arr[i + 1] = 0;
                if (arr[i] === 2048 && !won) {
                    won = true;
                    showWinOverlay();
                }
            }
        }
        arr = arr.filter(val => val !== 0);
        while (arr.length < SIZE) arr.push(0);
        return { newRow: arr, addedScore: mergedScore };
    }

    function moveLeft() {
        let moved = false;
        let turnScore = 0;
        for (let r = 0; r < SIZE; r++) {
            const { newRow, addedScore } = slide(board[r]);
            if (JSON.stringify(board[r]) !== JSON.stringify(newRow)) moved = true;
            board[r] = newRow;
            turnScore += addedScore;
        }
        return { moved, turnScore };
    }

    function rotateBoard() {
        const newBoard = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                newBoard[c][SIZE - 1 - r] = board[r][c];
            }
        }
        board = newBoard;
    }

    function handleMove(direction) {
        if (gameOver) return;
        let moved = false;
        let turnScore = 0;

        // Rotate board so we always move left logic
        let rotations = 0;
        if (direction === "up") rotations = 3;
        else if (direction === "right") rotations = 2;
        else if (direction === "down") rotations = 1;

        for (let i = 0; i < rotations; i++) rotateBoard();

        const res = moveLeft();
        moved = res.moved;
        turnScore = res.turnScore;

        for (let i = 0; i < (4 - rotations) % 4; i++) rotateBoard();

        if (moved) {
            if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
            score += turnScore;
            scoreEl.innerText = score;
            if (score > bestScore) {
                bestScore = score;
                bestScoreEl.innerText = bestScore;
                localStorage.setItem("luckykit_2048_best", bestScore.toString());
            }

            if (window.ArcadeCore) window.ArcadeCore.addXP(Math.floor(turnScore / 10));

            spawnTile();
            renderBoard();

            if (checkGameOver()) {
                gameOver = true;
                showGameOverOverlay();
            }
        }
    }

    function checkGameOver() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === 0) return false;
                if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
                if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
            }
        }
        return true;
    }

    function showGameOverOverlay() {
        overlayTitle.innerText = "Game Over!";
        overlayTitle.className = "fw-black fs-1 mb-2 text-danger";
        overlaySub.innerText = `Final Score: ${score}`;
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");
        if (window.ArcadeSounds) window.ArcadeSounds.playGameOver();
    }

    function showWinOverlay() {
        overlayTitle.innerText = "2048 Merged! 🎉";
        overlayTitle.className = "fw-black fs-1 mb-2 text-warning";
        overlaySub.innerText = `You achieved the Quantum 2048 tile! Score: ${score}`;
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");
        if (window.ArcadeSounds) window.ArcadeSounds.playWin();
    }

    // Keyboard Inputs
    window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "KeyW"].includes(e.code)) { e.preventDefault(); handleMove("up"); }
        else if (["ArrowDown", "KeyS"].includes(e.code)) { e.preventDefault(); handleMove("down"); }
        else if (["ArrowLeft", "KeyA"].includes(e.code)) { e.preventDefault(); handleMove("left"); }
        else if (["ArrowRight", "KeyD"].includes(e.code)) { e.preventDefault(); handleMove("right"); }
    });

    // Touch Swipe Inputs
    let touchStartX = 0, touchStartY = 0;
    const boardEl = document.getElementById("gridContainer");
    boardEl.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    boardEl.addEventListener("touchend", (e) => {
        if (!touchStartX || !touchStartY) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 30) {
            if (absDx > absDy) {
                handleMove(dx > 0 ? "right" : "left");
            } else {
                handleMove(dy > 0 ? "down" : "up");
            }
        }
        touchStartX = 0;
        touchStartY = 0;
    }, { passive: true });

    restartBtn.addEventListener("click", initGame);
    overlayRestartBtn.addEventListener("click", initGame);

    initGame();
});
