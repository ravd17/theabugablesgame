// ============================================
// CUSTOMIZATION CONFIGURATION - EDIT THESE!
// ============================================

const CONFIG = {
    // Grid Settings
    gridSize: 8,
    gemTypes: 6,
    
    // Level Settings - Change targets, moves, or add more levels!
    levels: [
        { level: 1, target: 500, moves: 20 },
        { level: 2, target: 1000, moves: 25 },
        { level: 3, target: 1500, moves: 30 }
    ],
    
    // Gem Colors/Styles - Customize the look of each gem type!
    // Use Tailwind gradient classes or solid colors
    gemStyles: [
        'bg-gradient-to-br from-red-400 to-red-600',      // Type 0: Red
        'bg-gradient-to-br from-blue-400 to-blue-600',    // Type 1: Blue
        'bg-gradient-to-br from-green-400 to-green-600',  // Type 2: Green
        'bg-gradient-to-br from-yellow-400 to-yellow-600',  // Type 3: Yellow
        'bg-gradient-to-br from-purple-400 to-purple-600',  // Type 4: Purple
        'bg-gradient-to-br from-pink-400 to-pink-600'     // Type 5: Pink
    ],
    
    // TEXT CONTENT - Change all the words/messages here!
    TEXT: {
        // Game Title
        gameTitle: 'GEM RUSH',
        
        // Level Display
        levelLabel: 'LEVEL',
        movesLabel: 'MOVES',
        scoreLabel: 'Score:',
        targetLabel: 'Target:',
        
        // Level Overlay (Start Screen)
        levelStartTitle: 'Level',  // Will show as "Level 1"
        levelStartSubtitle: 'Target: {target} points',  // {target} gets replaced with actual number
        levelStartHint: 'Match 3 or more gems to score!',
        startButtonText: 'Start Level',
        
        // Instructions
        instructions: 'Click a gem, then click an adjacent gem to swap',
        
        // Level Complete Modal
        levelCompleteTitle: 'Level Complete!',
        levelCompleteMessage: 'Great job! Ready for the next challenge?',
        nextLevelButton: 'Next Level →',
        
        // Out of Moves Message
        outOfMovesTitle: 'Out of moves!',
        outOfMovesMessage: 'Try again.',
        
        // Congratulations Modal (Final Level)
        congratsTitle: 'Victory!',
        congratsSubtitle: 'All Levels Completed!',
        congratsMessage: "You're a Gem Master! 💎",
        finalScoreLabel: 'Final Score:',
        playAgainButton: 'Play Again',
        
        // Emoji decorations
        victoryEmojis: ['🎉', '🏆', '🎊']
    },
    
    // COLORS - Customize the gem colors (alternative to CSS classes)
    // You can use hex colors here if you want to override with inline styles
    gemColors: {
        // Add custom hex colors if you prefer
        // type0: '#ff6b6b',
        // type1: '#4ecdc4',
        // etc.
    }
};

// Game State
let state = {
    grid: [],
    score: 0,
    level: 1,
    moves: 0,
    selectedGem: null,
    isProcessing: false,
    target: 0
};

// DOM Elements
const gridElement = document.getElementById('game-grid');
const scoreDisplay = document.getElementById('score-display');
const movesDisplay = document.getElementById('moves-display');
const levelDisplay = document.getElementById('level-display');
const targetDisplay = document.getElementById('target-display');
const progressBar = document.getElementById('progress-bar');
const levelOverlay = document.getElementById('level-overlay');
const overlayLevel = document.getElementById('overlay-level');
const overlayTarget = document.getElementById('overlay-target');
const congratsModal = document.getElementById('congrats-modal');
const levelCompleteModal = document.getElementById('level-complete-modal');
const finalScoreDisplay = document.getElementById('final-score');

// Initialize Game
function init() {
    showLevelOverlay();
}

function showLevelOverlay() {
    const levelConfig = CONFIG.levels[state.level - 1];
    
    // Update with custom text
    const title = document.querySelector('#level-overlay h2');
    const subtitle = document.querySelector('#level-overlay p.text-lg');
    const hint = document.querySelector('#level-overlay p.text-sm');
    const button = document.querySelector('#level-overlay button');
    
    if(title) title.innerHTML = `${CONFIG.TEXT.levelStartTitle} <span id="overlay-level">${state.level}</span>`;
    if(subtitle) subtitle.textContent = CONFIG.TEXT.levelStartSubtitle.replace('{target}', levelConfig.target);
    if(hint) hint.textContent = CONFIG.TEXT.levelStartHint;
    if(button) button.textContent = CONFIG.TEXT.startButtonText;
    
    overlayLevel.textContent = state.level;
    overlayTarget.textContent = levelConfig.target;
    levelOverlay.classList.remove('hidden');
}

function startLevel() {
    const levelConfig = CONFIG.levels[state.level - 1];
    state.target = levelConfig.target;
    state.moves = levelConfig.moves;
    state.score = 0;
    state.selectedGem = null;
    state.isProcessing = false;
    
    updateDisplay();
    createGrid();
    levelOverlay.classList.add('hidden');
    
    // Fill grid without initial matches
    fillGridNoMatches();
    
    // Update text content dynamically
    updateTextContent();
}

function updateTextContent() {
    // Update all text elements based on CONFIG.TEXT
    document.querySelector('h1').textContent = CONFIG.TEXT.gameTitle;
    
    // Update labels
    const labels = document.querySelectorAll('.text-sm.opacity-80.font-semibold');
    if(labels[0]) labels[0].textContent = CONFIG.TEXT.levelLabel;
    if(labels[1]) labels[1].textContent = CONFIG.TEXT.movesLabel;
    
    // Update score/target labels
    const scoreLabel = document.querySelector('#score-display').previousSibling;
    const targetLabel = document.querySelector('#target-display').previousSibling;
    if(scoreLabel) scoreLabel.textContent = CONFIG.TEXT.scoreLabel + ' ';
    if(targetLabel) targetLabel.textContent = CONFIG.TEXT.targetLabel + ' ';
    
    // Update instructions
    const instructions = document.querySelector('.mt-4.text-center');
    if(instructions) instructions.querySelector('p').textContent = CONFIG.TEXT.instructions;
}

function createGrid() {
    gridElement.innerHTML = '';
    state.grid = [];
    
    for (let row = 0; row < CONFIG.gridSize; row++) {
        state.grid[row] = [];
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const gem = document.createElement('div');
            gem.className = 'gem w-full h-full rounded-xl cursor-pointer border-2 border-white/20';
            gem.dataset.row = row;
            gem.dataset.col = col;
            gem.onclick = () => handleGemClick(row, col);
            gridElement.appendChild(gem);
            state.grid[row][col] = {
                element: gem,
                type: null
            };
        }
    }
}

function fillGridNoMatches() {
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            let type;
            do {
                type = Math.floor(Math.random() * CONFIG.gemTypes);
            } while (
                (col >= 2 && state.grid[row][col-1].type === type && state.grid[row][col-2].type === type) ||
                (row >= 2 && state.grid[row-1][col].type === type && state.grid[row-2][col].type === type)
            );
            state.grid[row][col].type = type;
            updateGemVisual(row, col);
        }
    }
}

function updateGemVisual(row, col) {
    const cell = state.grid[row][col];
    cell.element.className = `gem w-full h-full rounded-xl cursor-pointer border-2 border-white/20 ${CONFIG.gemStyles[cell.type]}`;
}

function handleGemClick(row, col) {
    if (state.isProcessing || state.moves <= 0) return;
    
    const clickedGem = state.grid[row][col];
    
    if (!state.selectedGem) {
        // Select first gem
        state.selectedGem = { row, col, element: clickedGem.element };
        clickedGem.element.classList.add('selected');
    } else {
        const prevRow = state.selectedGem.row;
        const prevCol = state.selectedGem.col;
        
        // Check if clicking same gem (deselect)
        if (prevRow === row && prevCol === col) {
            clickedGem.element.classList.remove('selected');
            state.selectedGem = null;
            return;
        }
        
        // Check if adjacent
        const isAdjacent = Math.abs(prevRow - row) + Math.abs(prevCol - col) === 1;
        
        if (isAdjacent) {
            state.selectedGem.element.classList.remove('selected');
            swapGems(prevRow, prevCol, row, col);
        } else {
            // Select new gem
            state.selectedGem.element.classList.remove('selected');
            state.selectedGem = { row, col, element: clickedGem.element };
            clickedGem.element.classList.add('selected');
        }
    }
}

function swapGems(row1, col1, row2, col2) {
    state.isProcessing = true;
    
    // Swap in data
    const temp = state.grid[row1][col1].type;
    state.grid[row1][col1].type = state.grid[row2][col2].type;
    state.grid[row2][col2].type = temp;
    
    // Update visuals with animation
    updateGemVisual(row1, col1);
    updateGemVisual(row2, col2);
    
    // Check for matches
    const matches = findMatches();
    
    if (matches.length > 0) {
        state.moves--;
        updateDisplay();
        processMatches(matches);
    } else {
        // Swap back if no matches
        setTimeout(() => {
            const temp = state.grid[row1][col1].type;
            state.grid[row1][col1].type = state.grid[row2][col2].type;
            state.grid[row2][col2].type = temp;
            updateGemVisual(row1, col1);
            updateGemVisual(row2, col2);
            state.isProcessing = false;
            state.selectedGem = null;
        }, 300);
    }
}

function findMatches() {
    const matches = new Set();
    
    // Check horizontal matches
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize - 2; col++) {
            const type = state.grid[row][col].type;
            if (type !== null && 
                state.grid[row][col + 1].type === type && 
                state.grid[row][col + 2].type === type) {
                matches.add(`${row},${col}`);
                matches.add(`${row},${col + 1}`);
                matches.add(`${row},${col + 2}`);
            }
        }
    }
    
    // Check vertical matches
    for (let col = 0; col < CONFIG.gridSize; col++) {
        for (let row = 0; row < CONFIG.gridSize - 2; row++) {
            const type = state.grid[row][col].type;
            if (type !== null && 
                state.grid[row + 1][col].type === type && 
                state.grid[row + 2][col].type === type) {
                matches.add(`${row},${col}`);
                matches.add(`${row + 1},${col}`);
                matches.add(`${row + 2},${col}`);
            }
        }
    }
    
    return Array.from(matches).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col };
    });
}

function processMatches(matches) {
    // Add score
    const points = matches.length * 10;
    state.score += points;
    updateDisplay();
    
    // Animate matched gems
    matches.forEach(({ row, col }) => {
        state.grid[row][col].element.classList.add('matched');
    });
    
    setTimeout(() => {
        // Remove matched gems
        matches.forEach(({ row, col }) => {
            state.grid[row][col].type = null;
            state.grid[row][col].element.className = 'gem w-full h-full rounded-lg cursor-pointer';
        });
        
        // Apply gravity
        applyGravity();
    }, 500);
}

function applyGravity() {
    let moved = false;
    
    for (let col = 0; col < CONFIG.gridSize; col++) {
        for (let row = CONFIG.gridSize - 1; row > 0; row--) {
            if (state.grid[row][col].type === null) {
                // Find gem above to fall down
                for (let above = row - 1; above >= 0; above--) {
                    if (state.grid[above][col].type !== null) {
                        state.grid[row][col].type = state.grid[above][col].type;
                        state.grid[above][col].type = null;
                        updateGemVisual(row, col);
                        state.grid[row][col].element.classList.add('falling');
                        setTimeout(() => {
                            state.grid[row][col].element.classList.remove('falling');
                        }, 500);
                        moved = true;
                        break;
                    }
                }
            }
        }
        
        // Fill empty spots at top with new gems
        for (let row = 0; row < CONFIG.gridSize; row++) {
            if (state.grid[row][col].type === null) {
                state.grid[row][col].type = Math.floor(Math.random() * CONFIG.gemTypes);
                updateGemVisual(row, col);
                state.grid[row][col].element.classList.add('falling');
                setTimeout(() => {
                    state.grid[row][col].element.classList.remove('falling');
                }, 500);
                moved = true;
            }
        }
    }
    
    setTimeout(() => {
        // Check for new matches after gravity
        const newMatches = findMatches();
        if (newMatches.length > 0) {
            processMatches(newMatches);
        } else {
            state.isProcessing = false;
            state.selectedGem = null;
            checkWinCondition();
        }
    }, 600);
}

function updateDisplay() {
    scoreDisplay.textContent = state.score;
    movesDisplay.textContent = state.moves;
    levelDisplay.textContent = state.level;
    targetDisplay.textContent = state.target;
    
    const progress = Math.min((state.score / state.target) * 100, 100);
    progressBar.style.width = `${progress}%`;
}

function checkWinCondition() {
    if (state.score >= state.target) {
        if (state.level === CONFIG.levels.length) {
            // Final level completed - Update and show congratulations!
            updateCongratsModal();
            finalScoreDisplay.textContent = state.score;
            congratsModal.classList.remove('hidden');
            createConfetti();
        } else {
            // Level completed
            updateLevelCompleteModal();
            levelCompleteModal.classList.remove('hidden');
        }
    } else if (state.moves <= 0) {
        // Game over - restart level
        setTimeout(() => {
            alert(`${CONFIG.TEXT.outOfMovesTitle}\n${CONFIG.TEXT.outOfMovesMessage}`);
            startLevel();
        }, 500);
    }
}

function updateCongratsModal() {
    // Update all text in congratulations modal
    const title = document.getElementById('congrats-title');
    const subtitle = document.getElementById('congrats-subtitle');
    const scoreLabel = document.getElementById('final-score-label');
    const message = document.getElementById('congrats-message');
    const button = document.getElementById('play-again-btn');
    const emojisContainer = document.getElementById('victory-emojis');
    
    if(title) title.textContent = CONFIG.TEXT.congratsTitle;
    if(subtitle) subtitle.textContent = CONFIG.TEXT.congratsSubtitle;
    if(scoreLabel) scoreLabel.textContent = CONFIG.TEXT.finalScoreLabel;
    if(message) message.textContent = CONFIG.TEXT.congratsMessage;
    if(button) {
        button.innerHTML = `<i data-lucide="rotate-ccw" class="w-5 h-5"></i> ${CONFIG.TEXT.playAgainButton}`;
        lucide.createIcons();
    }
    
    // Update emojis
    if(emojisContainer && CONFIG.TEXT.victoryEmojis) {
        emojisContainer.innerHTML = CONFIG.TEXT.victoryEmojis.map(emoji => `<span>${emoji}</span>`).join('');
    }
}

function updateLevelCompleteModal() {
    const modalTitle = document.querySelector('#level-complete-modal h3');
    const modalMessage = document.querySelector('#level-complete-modal p');
    const modalButton = document.querySelector('#level-complete-modal button');
    
    if(modalTitle) modalTitle.textContent = CONFIG.TEXT.levelCompleteTitle;
    if(modalMessage) modalMessage.textContent = CONFIG.TEXT.levelCompleteMessage;
    if(modalButton) modalButton.textContent = CONFIG.TEXT.nextLevelButton;
}

function nextLevel() {
    // Update modal text before hiding
    const modalTitle = document.querySelector('#level-complete-modal h3');
    const modalMessage = document.querySelector('#level-complete-modal p');
    const modalButton = document.querySelector('#level-complete-modal button');
    
    if(modalTitle) modalTitle.textContent = CONFIG.TEXT.levelCompleteTitle;
    if(modalMessage) modalMessage.textContent = CONFIG.TEXT.levelCompleteMessage;
    if(modalButton) modalButton.textContent = CONFIG.TEXT.nextLevelButton;
    
    levelCompleteModal.classList.add('hidden');
    state.level++;
    showLevelOverlay();
}

function restartGame() {
    congratsModal.classList.add('hidden');
    state.level = 1;
    state.score = 0;
    showLevelOverlay();
}

function createConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.opacity = Math.random();
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

// Prevent double-tap zoom on mobile
document.addEventListener('dblclick', function(event) {
    event.preventDefault();
}, { passive: false });

// Start game on load
window.onload = init;
