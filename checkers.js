// Neo Draughts Checkers Engine
document.addEventListener("DOMContentLoaded", () => {
    const SIZE = 8;
    const RED = 1;      // Player 1 (Red) - moves up
    const BLUE = 2;     // Player 2 / AI (Blue) - moves down
    const RED_KING = 3;
    const BLUE_KING = 4;

    let board = [];
    let turn = RED;
    let selectedPiece = null;
    let validMoves = [];
    let redCaptured = 0;
    let blueCaptured = 0;

    const boardEl = document.getElementById("checkersBoard");
    const turnIndicator = document.getElementById("turnIndicator");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const restartBtn = document.getElementById("restartBtn");
    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlaySub = document.getElementById("overlaySub");
    const overlayRestartBtn = document.getElementById("overlayRestartBtn");

    function initBoard() {
        board = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
        redCaptured = 0;
        blueCaptured = 0;
        turn = RED;
        selectedPiece = null;
        validMoves = [];
        
        // Populate initial checkers pieces
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if ((r + c) % 2 === 1) {
                    if (r < 3) board[r][c] = BLUE;
                    else if (r > 4) board[r][c] = RED;
                }
            }
        }
        updateUI();
        renderBoard();
        overlay.classList.add("d-none");
        overlay.classList.remove("d-flex");
    }

    function renderBoard() {
        boardEl.innerHTML = "";
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const cell = document.createElement("div");
                const isDark = (r + c) % 2 === 1;
                cell.className = `cell ${isDark ? "cell-dark" : "cell-light"}`;
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Check if this cell is a highlighted valid move
                const isValidMove = validMoves.some(m => m.r === r && m.c === c);
                if (isValidMove) {
                    cell.classList.add("cell-highlight");
                    cell.addEventListener("click", () => makeMove(r, c));
                }

                const pieceVal = board[r][c];
                if (pieceVal !== 0) {
                    const piece = document.createElement("div");
                    const isRed = pieceVal === RED || pieceVal === RED_KING;
                    const isKing = pieceVal === RED_KING || pieceVal === BLUE_KING;

                    piece.className = `piece ${isRed ? "piece-red" : "piece-black"}`;
                    if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                        piece.classList.add("piece-selected");
                    }

                    if (isKing) {
                        piece.innerHTML = `<span class="king-icon">👑</span>`;
                    }

                    piece.addEventListener("click", (e) => {
                        e.stopPropagation();
                        onPieceClick(r, c);
                    });

                    cell.appendChild(piece);
                }
                boardEl.appendChild(cell);
            }
        }
    }

    function onPieceClick(r, c) {
        const p = board[r][c];
        const isCurrentTurn = (turn === RED && (p === RED || p === RED_KING)) ||
                              (turn === BLUE && (p === BLUE || p === BLUE_KING));
        
        if (!isCurrentTurn) return;

        selectedPiece = { r, c };
        validMoves = getValidMoves(r, c);
        if (window.ArcadeSounds) window.ArcadeSounds.playTone(300, "sine", 0.05);
        renderBoard();
    }

    function getValidMoves(r, c) {
        const piece = board[r][c];
        const moves = [];
        if (piece === 0) return moves;

        const isKing = piece === RED_KING || piece === BLUE_KING;
        const isRed = piece === RED || piece === RED_KING;

        // Directions: Red moves up (-1), Blue moves down (+1)
        const dirs = [];
        if (isRed || isKing) dirs.push([-1, -1], [-1, 1]);
        if (!isRed || isKing) dirs.push([1, -1], [1, 1]);

        dirs.forEach(([dr, dc]) => {
            const nr = r + dr;
            const nc = c + dc;

            // Simple step
            if (isInBounds(nr, nc) && board[nr][nc] === 0) {
                moves.push({ r: nr, c: nc, isJump: false });
            }
            // Jump capture
            const jr = r + 2 * dr;
            const jc = c + 2 * dc;
            if (isInBounds(jr, jc) && board[jr][jc] === 0) {
                const targetPiece = board[nr][nc];
                const isEnemy = targetPiece !== 0 && ((isRed && (targetPiece === BLUE || targetPiece === BLUE_KING)) ||
                                                     (!isRed && (targetPiece === RED || targetPiece === RED_KING)));
                if (isEnemy) {
                    moves.push({ r: jr, c: jc, isJump: true, capR: nr, capC: nc });
                }
            }
        });

        return moves;
    }

    function isInBounds(r, c) {
        return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
    }

    function makeMove(toR, toC) {
        if (!selectedPiece) return;
        const move = validMoves.find(m => m.r === toR && m.c === toC);
        if (!move) return;

        const fromR = selectedPiece.r;
        const fromC = selectedPiece.c;
        const piece = board[fromR][fromC];

        board[toR][toC] = piece;
        board[fromR][fromC] = 0;

        // Jump capture
        if (move.isJump) {
            const capPiece = board[move.capR][move.capC];
            board[move.capR][move.capC] = 0;
            if (turn === RED) blueCaptured++;
            else redCaptured++;

            if (window.ArcadeSounds) window.ArcadeSounds.playTone(500, "square", 0.08);
            if (window.ArcadeCore) window.ArcadeCore.addXP(15);
        } else {
            if (window.ArcadeSounds) window.ArcadeSounds.playSelect();
        }

        // King promotion
        if (piece === RED && toR === 0) board[toR][toC] = RED_KING;
        if (piece === BLUE && toR === SIZE - 1) board[toR][toC] = BLUE_KING;

        selectedPiece = null;
        validMoves = [];

        // Switch Turn
        turn = turn === RED ? BLUE : RED;
        updateUI();
        renderBoard();

        checkVictory();

        // Trigger AI Move if it's Blue's turn
        if (turn === BLUE && !isGameOver()) {
            setTimeout(makeAIMove, 600);
        }
    }

    function makeAIMove() {
        const allMoves = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const p = board[r][c];
                if (p === BLUE || p === BLUE_KING) {
                    const vm = getValidMoves(r, c);
                    vm.forEach(m => allMoves.push({ fromR: r, fromC: c, move: m }));
                }
            }
        }

        if (allMoves.length === 0) {
            checkVictory();
            return;
        }

        // Prefer jump captures if available
        const jumpMoves = allMoves.filter(m => m.move.isJump);
        const selected = jumpMoves.length > 0 
            ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
            : allMoves[Math.floor(Math.random() * allMoves.length)];

        selectedPiece = { r: selected.fromR, c: selected.fromC };
        validMoves = [selected.move];
        makeMove(selected.move.r, selected.move.c);
    }

    function isGameOver() {
        let redCount = 0, blueCount = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === RED || board[r][c] === RED_KING) redCount++;
                if (board[r][c] === BLUE || board[r][c] === BLUE_KING) blueCount++;
            }
        }
        return redCount === 0 || blueCount === 0;
    }

    function checkVictory() {
        let redCount = 0, blueCount = 0;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (board[r][c] === RED || board[r][c] === RED_KING) redCount++;
                if (board[r][c] === BLUE || board[r][c] === BLUE_KING) blueCount++;
            }
        }

        if (redCount === 0) showVictory(false);
        else if (blueCount === 0) showVictory(true);
    }

    function showVictory(isRedWin) {
        if (isRedWin) {
            overlayTitle.innerText = "Player Victory! 🏆";
            overlayTitle.className = "fw-black fs-1 mb-2 text-warning";
            overlaySub.innerText = "Red player captured all enemy pieces!";
            if (window.ArcadeSounds) window.ArcadeSounds.playWin();
        } else {
            overlayTitle.innerText = "AI Victory! 🤖";
            overlayTitle.className = "fw-black fs-1 mb-2 text-info";
            overlaySub.innerText = "Blue AI dominated the checkers board!";
            if (window.ArcadeSounds) window.ArcadeSounds.playGameOver();
        }
        overlay.classList.remove("d-none");
        overlay.classList.add("d-flex");
    }

    function updateUI() {
        turnIndicator.innerText = turn === RED ? "Player (Red)" : "AI (Blue)";
        turnIndicator.className = turn === RED ? "m-0 fw-black text-danger" : "m-0 fw-black text-info";
        scoreDisplay.innerText = `${blueCaptured} - ${redCaptured}`;
    }

    restartBtn.addEventListener("click", initBoard);
    overlayRestartBtn.addEventListener("click", initBoard);

    initBoard();
});
