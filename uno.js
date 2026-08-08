import { BaseGame } from './core/BaseGame.js';
import { gameManager } from './core/gameManager.js';
import { audioManager } from './audio/audioManager.js';
import { animationManager } from './animation/animationManager.js';

const COLORS = ['red', 'green', 'blue', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Rev', '+2'];
const WILDS = ['Wild', '+4'];

class CosmicUNO extends BaseGame {
    constructor() {
        super("uno");
        
        this.deck = [];
        this.discard = [];
        this.players = [
            { id: 0, name: 'You', hand: [], isAI: false },
            { id: 1, name: 'AI 1 (Green)', hand: [], isAI: true },
            { id: 2, name: 'AI 2 (Yellow)', hand: [], isAI: true },
            { id: 3, name: 'AI 3 (Blue)', hand: [], isAI: true }
        ];
        
        this.turn = 0;
        this.direction = 1; // 1 for clockwise, -1 for counter
        this.currentColor = '';
        this.awaitingColor = false;
        
        // UI Elements
        this.drawPileBtn = document.getElementById('drawPile');
        this.discardPileEl = document.getElementById('discardPile');
        this.turnDisplay = document.getElementById('turnDisplay');
        this.actionText = document.getElementById('actionText');
        this.colorPicker = document.getElementById('colorPicker');
        this.directionIndicator = document.getElementById('directionIndicator');
        
        this.bindEvents();
        gameManager.registerGame(this);
    }

    bindEvents() {
        if (this.drawPileBtn) {
            this.drawPileBtn.addEventListener('click', () => {
                if (this.isPaused || !this.isRunning || this.players[this.turn].isAI || this.awaitingColor) return;
                this.drawCard(0);
                this.nextTurn();
            });
        }
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.getAttribute('data-color');
                this.currentColor = color;
                this.colorPicker.classList.add('d-none');
                this.awaitingColor = false;
                this.actionText.textContent = `Color changed to ${color.toUpperCase()}`;
                if (audioManager) audioManager.playLevelUp();
                
                // If it was +4, we apply it to next player now
                const topCard = this.discard[this.discard.length - 1];
                if (topCard.value === '+4') {
                    this.drawCard((this.turn + this.direction + 4) % 4, 4);
                    this.nextTurn(true); // skip next
                } else {
                    this.nextTurn();
                }
            });
        });
        
        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            document.getElementById('game-over-screen').classList.add('hidden');
            this.start();
        });
    }

    buildDeck() {
        this.deck = [];
        for (let color of COLORS) {
            this.deck.push({ color, value: '0' });
            for (let v of VALUES.slice(1)) {
                this.deck.push({ color, value: v });
                this.deck.push({ color, value: v });
            }
        }
        for (let i = 0; i < 4; i++) {
            this.deck.push({ color: 'wild', value: 'Wild' });
            this.deck.push({ color: 'wild', value: '+4' });
        }
        this.shuffle(this.deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    reset() {
        this.buildDeck();
        this.discard = [];
        this.direction = 1;
        this.turn = 0;
        this.awaitingColor = false;
        if (this.directionIndicator) this.directionIndicator.classList.remove('reverse');
        
        this.players.forEach(p => p.hand = []);
        
        // Deal 7
        for (let i = 0; i < 7; i++) {
            this.players.forEach(p => p.hand.push(this.deck.pop()));
        }
        
        // Initial discard (must not be wild for simplicity)
        let topCard;
        do {
            topCard = this.deck.pop();
            if (topCard.color === 'wild') this.deck.unshift(topCard);
        } while (topCard.color === 'wild');
        
        this.discard.push(topCard);
        this.currentColor = topCard.color;
        
        this.updateUI();
    }

    onStart() {
        this.reset();
        this.actionText.textContent = "Game started. Your turn!";
        this.updateUI();
    }

    drawCard(playerIdx, amount = 1) {
        if (audioManager) audioManager.playClick();
        for (let i = 0; i < amount; i++) {
            if (this.deck.length === 0) {
                // reshuffle discard
                const top = this.discard.pop();
                this.deck = [...this.discard];
                this.shuffle(this.deck);
                this.discard = [top];
            }
            if (this.deck.length > 0) {
                this.players[playerIdx].hand.push(this.deck.pop());
            }
        }
        this.updateUI();
    }

    renderCard(card, isHidden = false, index = -1, isPlayer = false) {
        const div = document.createElement('div');
        div.className = `uno-card ${isHidden ? 'back' : card.color}`;
        
        if (!isHidden) {
            if (card.color === 'wild') div.classList.add('wild');
            div.innerHTML = `<span>${card.value}</span>`;
        } else {
            div.innerHTML = `UNO`;
        }

        if (isPlayer && !isHidden && this.isValidMove(card)) {
            div.classList.add('valid-move');
        }

        if (isPlayer && !this.players[this.turn].isAI && this.turn === 0) {
            div.addEventListener('click', () => this.playCard(0, index));
        }

        return div;
    }

    updateUI() {
        // Discard pile
        this.discardPileEl.innerHTML = '';
        const topCard = this.discard[this.discard.length - 1];
        if (topCard) {
            const cardEl = this.renderCard(topCard);
            // Show current color glow if wild was played
            if (topCard.color === 'wild') {
                cardEl.style.boxShadow = `0 0 20px var(--uno-${this.currentColor})`;
                cardEl.style.borderColor = `var(--uno-${this.currentColor})`;
            }
            this.discardPileEl.appendChild(cardEl);
        }

        // Hands
        const pHand = document.getElementById('player-hand');
        if (pHand) {
            pHand.innerHTML = '';
            this.players[0].hand.forEach((card, idx) => {
                pHand.appendChild(this.renderCard(card, false, idx, true));
            });
            pHand.style.gap = this.players[0].hand.length > 10 ? '-40px' : '-30px';
        }

        for (let i = 1; i <= 3; i++) {
            const aiHand = document.getElementById(`ai${i}-hand`);
            if (aiHand) {
                aiHand.innerHTML = '';
                this.players[i].hand.forEach(() => {
                    aiHand.appendChild(this.renderCard(null, true));
                });
            }
        }

        // Turn Indicator
        if (this.turnDisplay) {
            const activePlayer = this.players[this.turn];
            this.turnDisplay.textContent = activePlayer.name + "'s Turn";
            this.turnDisplay.style.color = activePlayer.id === 0 ? '#ef4444' : '#fff';
            this.turnDisplay.style.background = activePlayer.id === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)';
            this.turnDisplay.style.borderColor = activePlayer.id === 0 ? '#ef4444' : 'rgba(255,255,255,0.2)';
        }
    }

    isValidMove(card) {
        const topCard = this.discard[this.discard.length - 1];
        if (card.color === 'wild') return true;
        if (card.color === this.currentColor) return true;
        if (card.value === topCard.value && topCard.color !== 'wild') return true;
        return false;
    }

    playCard(playerIdx, cardIdx) {
        if (this.isPaused || !this.isRunning || this.turn !== playerIdx || this.awaitingColor) return;
        
        const player = this.players[playerIdx];
        const card = player.hand[cardIdx];

        if (!this.isValidMove(card)) {
            if (playerIdx === 0) {
                this.actionText.textContent = "Invalid move!";
                if (audioManager) audioManager.playLose();
            }
            return;
        }

        if (audioManager) audioManager.playTone(500, 'sine', 0.1);

        // Remove from hand, add to discard
        player.hand.splice(cardIdx, 1);
        this.discard.push(card);
        
        if (card.color !== 'wild') {
            this.currentColor = card.color;
        }

        this.updateUI();

        // Check Win
        if (player.hand.length === 0) {
            this.endGame(playerIdx);
            return;
        }
        
        // UNO Call
        if (player.hand.length === 1) {
            this.actionText.textContent = `${player.name} says UNO!`;
            if (audioManager) audioManager.playAchievement();
        }

        // Process Action Cards
        let skipNext = false;
        
        if (card.value === 'Skip') {
            skipNext = true;
            this.actionText.textContent = `${player.name} played Skip!`;
        } else if (card.value === 'Rev') {
            this.direction *= -1;
            if (this.directionIndicator) this.directionIndicator.classList.toggle('reverse');
            this.actionText.textContent = `${player.name} played Reverse!`;
        } else if (card.value === '+2') {
            const nextP = (this.turn + this.direction + 4) % 4;
            this.drawCard(nextP, 2);
            skipNext = true;
            this.actionText.textContent = `${player.name} played +2!`;
        }

        if (card.color === 'wild') {
            if (player.isAI) {
                // AI chooses color it has most of
                const colors = { red: 0, green: 0, blue: 0, yellow: 0 };
                player.hand.forEach(c => { if (c.color !== 'wild') colors[c.color]++; });
                this.currentColor = Object.keys(colors).reduce((a, b) => colors[a] > colors[b] ? a : b) || 'red';
                this.actionText.textContent = `${player.name} changed color to ${this.currentColor.toUpperCase()}`;
                
                if (card.value === '+4') {
                    const nextP = (this.turn + this.direction + 4) % 4;
                    this.drawCard(nextP, 4);
                    skipNext = true;
                }
                setTimeout(() => this.nextTurn(skipNext), 1000);
            } else {
                this.awaitingColor = true;
                this.colorPicker.classList.remove('d-none');
                this.actionText.textContent = "Choose a color!";
                // nextTurn is called when color is picked
            }
        } else {
            setTimeout(() => this.nextTurn(skipNext), 1000);
        }
    }

    nextTurn(skip = false) {
        if (!this.isRunning) return;
        
        let steps = skip ? 2 : 1;
        this.turn = (this.turn + (this.direction * steps) + 4) % 4;
        
        this.updateUI();

        const activePlayer = this.players[this.turn];
        if (activePlayer.isAI) {
            this.actionText.textContent = `${activePlayer.name} is thinking...`;
            setTimeout(() => this.aiPlay(), 1500);
        } else {
            this.actionText.textContent = "Your turn!";
        }
    }

    aiPlay() {
        if (this.isPaused || !this.isRunning) return;
        const ai = this.players[this.turn];
        
        // Find valid cards
        let validIndices = [];
        ai.hand.forEach((card, idx) => {
            if (this.isValidMove(card)) validIndices.push(idx);
        });

        if (validIndices.length > 0) {
            // Pick a random valid card (Casual AI)
            const pick = validIndices[Math.floor(Math.random() * validIndices.length)];
            this.playCard(this.turn, pick);
        } else {
            this.actionText.textContent = `${ai.name} draws a card.`;
            this.drawCard(this.turn);
            setTimeout(() => this.nextTurn(), 1000);
        }
    }

    endGame(winnerIdx) {
        if (audioManager) audioManager.playWin();
        if (animationManager) animationManager.spawnConfetti(window.innerWidth/2, window.innerHeight/2, 100);
        
        const winner = this.players[winnerIdx];
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('winner-text').textContent = winnerIdx === 0 ? "YOU WIN!" : `${winner.name} WINS!`;
        
        if (winnerIdx === 0) {
            this.score = 1000;
            this.gameOver(true);
        } else {
            this.gameOver(false);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
    const game = new CosmicUNO();
    setTimeout(() => game.start(), 100);
});
} else {
    const _init = () => {
    const game = new CosmicUNO();
    setTimeout(() => game.start(), 100);
};
    _init();
}
