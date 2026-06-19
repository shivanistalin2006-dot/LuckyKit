const board = document.getElementById('board');
const turnDisplay = document.getElementById('turn');
const movesDisplay = document.getElementById('moves');
const statusDisplay = document.getElementById('status');
const whiteTimeDisplay = document.getElementById('whiteTime');
const blackTimeDisplay = document.getElementById('blackTime');
const modeSelect = document.getElementById('mode');
const difficultySelect = document.getElementById('difficulty');

let chessBoard = [];
let currentTurn = 'white';
let moves = 0;
let selectedSquare = null;
let possibleMoves = [];
let gameOver = false;
let isFlipped = false;
let whiteTime = 300;
let blackTime = 300;
let timerInterval = null;
let gameMode = 'pvp';
let aiLevel = 'medium';

const pieces = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
};

function initGame() {
    chessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    
    const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    for (let col = 0; col < 8; col++) {
        chessBoard[0][col] = { type: backRank[col], color: 'black' };
        chessBoard[1][col] = { type: 'pawn', color: 'black' };
        chessBoard[6][col] = { type: 'pawn', color: 'white' };
        chessBoard[7][col] = { type: backRank[col], color: 'white' };
    }
    
    currentTurn = 'white';
    moves = 0;
    selectedSquare = null;
    possibleMoves = [];
    gameOver = false;
    whiteTime = 300;
    blackTime = 300;
    
    renderBoard();
    updateUI();
    startTimer();
}

function renderBoard() {
    board.innerHTML = '';
    
    const startRow = isFlipped ? 0 : 7;
    const endRow = isFlipped ? 8 : 6;
    const rowStep = isFlipped ? 1 : -1;
    
    for (let row = startRow; row !== endRow; row += rowStep) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            const isLight = (row + col) % 2 === 0;
            square.className += isLight ? ' light' : ' dark';
            
            if (chessBoard[row][col]) {
                const piece = chessBoard[row][col];
                square.textContent = pieces[piece.color][piece.type];
            }
            
            if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
                square.classList.add('selected');
            }
            
            if (possibleMoves.some(m => m.row === row && m.col === col)) {
                if (chessBoard[row][col]) {
                    square.classList.add('capture');
                } else {
                    square.classList.add('move');
                }
            }
            
            square.addEventListener('click', () => handleClick(row, col));
            board.appendChild(square);
        }
    }
}

function handleClick(row, col) {
    if (gameOver) return;
    if (gameMode === 'ai' && currentTurn === 'black') return;
    
    const piece = chessBoard[row][col];
    
    if (selectedSquare) {
        const move = possibleMoves.find(m => m.row === row && m.col === col);
        
        if (move) {
            executeMove(move);
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
            
            if (gameMode === 'ai' && !gameOver && currentTurn === 'black') {
                setTimeout(makeAIMove, 500);
            }
        } else if (piece && piece.color === currentTurn) {
            selectedSquare = { row, col };
            possibleMoves = getValidMoves(row, col);
            renderBoard();
        } else {
            selectedSquare = null;
            possibleMoves = [];
            renderBoard();
        }
    } else if (piece && piece.color === currentTurn) {
        selectedSquare = { row, col };
        possibleMoves = getValidMoves(row, col);
        renderBoard();
    }
}

function getValidMoves(row, col) {
    const piece = chessBoard[row][col];
    if (!piece) return [];
    
    let moves = [];
    
    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece);
            break;
    }
    
    return moves.filter(move => isValidMove(move, row, col, piece));
}

function getPawnMoves(row, col, piece) {
    const moves = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    
    if (row + direction >= 0 && row + direction < 8) {
        if (!chessBoard[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            if (row === startRow && !chessBoard[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        if (col - 1 >= 0 && chessBoard[row + direction][col - 1] && 
            chessBoard[row + direction][col - 1].color !== piece.color) {
            moves.push({ row: row + direction, col: col - 1 });
        }
        
        if (col + 1 < 8 && chessBoard[row + direction][col + 1] && 
            chessBoard[row + direction][col + 1].color !== piece.color) {
            moves.push({ row: row + direction, col: col + 1 });
        }
    }
    
    return moves;
}

function getRookMoves(row, col, piece) {
    return getLinearMoves(row, col, piece, [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ]);
}

function getBishopMoves(row, col, piece) {
    return getLinearMoves(row, col, piece, [
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ]);
}

function getQueenMoves(row, col, piece) {
    return getLinearMoves(row, col, piece, [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
        { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ]);
}

function getLinearMoves(row, col, piece, directions) {
    const moves = [];
    
    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!chessBoard[r][c]) {
                moves.push({ row: r, col: c });
            } else {
                if (chessBoard[r][c].color !== piece.color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    
    return moves;
}

function getKnightMoves(row, col, piece) {
    const moves = [];
    const knightMoves = [
        { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
        { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
        { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
        { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
    ];
    
    for (const { dr, dc } of knightMoves) {
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!chessBoard[r][c]) {
                moves.push({ row: r, col: c });
            } else if (chessBoard[r][c].color !== piece.color) {
                moves.push({ row: r, col: c });
            }
        }
    }
    
    return moves;
}

function getKingMoves(row, col, piece) {
    const moves = [];
    const kingMoves = [
        { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
        { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }
    ];
    
    for (const { dr, dc } of kingMoves) {
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!chessBoard[r][c]) {
                moves.push({ row: r, col: c });
            } else if (chessBoard[r][c].color !== piece.color) {
                moves.push({ row: r, col: c });
            }
        }
    }
    
    return moves;
}

function isValidMove(move, row, col, piece) {
    const tempBoard = chessBoard.map(r => r.map(p => p));
    
    chessBoard[move.row][move.col] = chessBoard[row][col];
    chessBoard[row][col] = null;
    
    if (piece.type === 'pawn' && move.row === 0 || move.row === 7) {
        chessBoard[move.row][move.col] = { type: 'queen', color: piece.color };
    }
    
    const inCheck = isInCheck(piece.color);
    
    chessBoard = tempBoard;
    
    return !inCheck;
}

function isInCheck(color) {
    let kingPos = null;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (chessBoard[row][col] && 
                chessBoard[row][col].type === 'king' && 
                chessBoard[row][col].color === color) {
                kingPos = { row, col };
                break;
            }
        }
    }
    
    if (!kingPos) return false;
    
    return isSquareAttacked(kingPos.row, kingPos.col, color);
}

function isSquareAttacked(row, col, color) {
    const oppositeColor = color === 'white' ? 'black' : 'white';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chessBoard[r][c];
            if (piece && piece.color === oppositeColor) {
                let moves = [];
                
                switch (piece.type) {
                    case 'pawn': moves = getPawnMoves(r, c, piece); break;
                    case 'rook': moves = getRookMoves(r, c, piece); break;
                    case 'knight': moves = getKnightMoves(r, c, piece); break;
                    case 'bishop': moves = getBishopMoves(r, c, piece); break;
                    case 'queen': moves = getQueenMoves(r, c, piece); break;
                    case 'king': moves = getKingMoves(r, c, piece); break;
                }
                
                if (moves.some(m => m.row === row && m.col === col)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function executeMove(move) {
    const piece = chessBoard[selectedSquare.row][selectedSquare.col];
    
    if (chessBoard[move.row][move.col]) {
        playSound('capture');
    }
    
    chessBoard[move.row][move.col] = piece;
    chessBoard[selectedSquare.row][selectedSquare.col] = null;
    
    if (piece.type === 'pawn' && (move.row === 0 || move.row === 7)) {
        showPromotion(move.row, move.col, piece.color);
        return;
    }
    
    playSound('move');
    
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    moves++;
    
    if (isInCheck(currentTurn)) {
        statusDisplay.textContent = 'Check!';
        playSound('check');
    }
    
    if (isGameOver()) {
        gameOver = true;
        statusDisplay.textContent = 'Game Over';
        showCheckmate(currentTurn === 'white' ? 'Black' : 'White');
        playSound('checkmate');
    }
    
    updateUI();
}

function showPromotion(row, col, color) {
    const modal = document.getElementById('promotionModal');
    const options = document.getElementById('promotionOptions');
    options.innerHTML = '';
    
    const types = ['queen', 'rook', 'bishop', 'knight'];
    
    types.forEach(type => {
        const option = document.createElement('div');
        option.className = 'promotion-option';
        option.textContent = pieces[color][type];
        option.addEventListener('click', () => {
            chessBoard[row][col] = { type, color };
            modal.style.display = 'none';
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            moves++;
            updateUI();
            renderBoard();
            
            if (gameMode === 'ai' && !gameOver && currentTurn === 'black') {
                setTimeout(makeAIMove, 500);
            }
        });
        options.appendChild(option);
    });
    
    modal.style.display = 'flex';
}

function showCheckmate(winner) {
    const modal = document.getElementById('checkmateModal');
    document.getElementById('checkmateMessage').textContent = `${winner} wins!`;
    modal.style.display = 'flex';
}

function isGameOver() {
    let allMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessBoard[row][col];
            if (piece && piece.color === currentTurn) {
                allMoves.push(...getValidMoves(row, col));
            }
        }
    }
    
    return allMoves.length === 0;
}

function makeAIMove() {
    let allMoves = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessBoard[row][col];
            if (piece && piece.color === 'black') {
                const moves = getValidMoves(row, col);
                moves.forEach(move => allMoves.push({ from: { row, col }, to: move }));
            }
        }
    }
    
    if (allMoves.length === 0) return;
    
    let move;
    
    if (aiLevel === 'easy') {
        move = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else {
        move = allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    selectedSquare = move.from;
    possibleMoves = [move.to];
    executeMove(move.to);
    selectedSquare = null;
    possibleMoves = [];
    renderBoard();
}

function updateUI() {
    turnDisplay.textContent = currentTurn;
    turnDisplay.className = currentTurn === 'white' ? 'turn-white' : 'turn-black';
    movesDisplay.textContent = moves;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (currentTurn === 'white') {
            whiteTime--;
            whiteTimeDisplay.textContent = formatTime(whiteTime);
            if (whiteTime <= 0) {
                gameOver = true;
                showCheckmate('Black');
                clearInterval(timerInterval);
            }
        } else {
            blackTime--;
            blackTimeDisplay.textContent = formatTime(blackTime);
            if (blackTime <= 0) {
                gameOver = true;
                showCheckmate('White');
                clearInterval(timerInterval);
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playSound(type) {
    // Simple sound placeholder
}

function newGame() {
    initGame();
}

function flipBoard() {
    isFlipped = !isFlipped;
    renderBoard();
}

modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    document.getElementById('aiDifficulty').style.display = gameMode === 'ai' ? 'block' : 'none';
});

difficultySelect.addEventListener('change', (e) => {
    aiLevel = e.target.value;
});

document.getElementById('checkmateNewGame').addEventListener('click', () => {
    document.getElementById('checkmateModal').style.display = 'none';
    initGame();
});

document.getElementById('newGame').addEventListener('click', initGame);
document.getElementById('restart').addEventListener('click', initGame);
document.getElementById('flipBoard').addEventListener('click', flipBoard);

initGame();