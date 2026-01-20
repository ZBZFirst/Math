// division.js - Interactive Version

// ============================================
// DOM Elements
// ============================================
const problemDisplay = document.getElementById('problemdisplay');
const workStageContainer = document.getElementById('workStageContainer');
const workFeedback = document.getElementById('workFeedback');
const newProblemBtn = document.getElementById('newDivisionProblem');
const resetProblemBtn = document.getElementById('resetCurrentProblem');
const solvedCountEl = document.getElementById('solvedCount');
const mistakeCountEl = document.getElementById('mistakeCount');
const divisionAccuracyEl = document.getElementById('divisionAccuracy');
const currentStreakEl = document.getElementById('currentStreak');
const resetScoresBtn = document.getElementById('resetDivisionScores');

// ============================================
// State Management
// ============================================
let currentProblem = null;
let currentGuess = 0;
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;

// Color scheme
const COLORS = {
    BLUE: 'blue',
    ORANGE: 'orange',
    YELLOW: 'yellow',
    PINK: 'pink',
    GREEN: 'green'
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Division practice initialized');
    updateScoreDisplay();
    generateNewProblem();
    
    // Event listeners
    newProblemBtn.addEventListener('click', generateNewProblem);
    resetProblemBtn.addEventListener('click', resetCurrentProblem);
    resetScoresBtn.addEventListener('click', resetAllScores);
    
    // Create number buttons
    createNumberButtons();
});

// ============================================
// Problem Generation
// ============================================
function generateNewProblem() {
    let divisor = Math.floor(Math.random() * 15) + 1;
    let dividend;
    
    do {
        dividend = Math.floor(Math.random() * 999) + 1;
    } while (dividend <= divisor);
    
    initializeDivisionState(dividend, divisor);
}

function initializeDivisionState(dividend, divisor) {
    const digits = String(dividend).split('').map(Number);
    const n = digits.length;
    
    // Create COMPLETE 2n+1 grid structure
    const { workGrid, answerGrid } = createCompleteGrid(digits, divisor);
    
    currentProblem = {
        // Basic problem info
        dividend: dividend,
        divisor: divisor,
        digits: digits,
        n: n,
        
        // Current solving state
        currentDigit: 0,
        currentRow: 1,
        partial: digits[0],
        quotientDigits: [],
        steps: [],
        finished: false,
        
        // Grid structure
        workGrid: workGrid,
        answerGrid: answerGrid,
        totalRows: 2 * n + 1,
        totalCols: n,
        
        // Current step
        currentStep: 0,
        needsBringDown: false
    };
    
    currentGuess = 0;
    updateProblemDisplay();
    renderGrid();
    renderNumberButtons();
    clearFeedback();
}

// ============================================
// Grid Creation
// ============================================
function createCompleteGrid(digits, divisor) {
    const n = digits.length;
    const totalRows = 2 * n + 1;
    const totalCols = n;
    
    // Create empty work grid
    const workGrid = Array(totalRows).fill().map(() => Array(totalCols).fill(null));
    
    // Create answer grid
    const answerGrid = Array(n + 2).fill().map((_, i) => ({
        value: '',
        color: COLORS.GREEN,
        revealed: false,
        type: i < n ? 'quotient' : (i === n ? 'remainder_label' : 'remainder_value')
    }));
    answerGrid[n].value = 'R';
    answerGrid[n].revealed = true;
    
    // Row 0: DIVIDEND
    for (let col = 0; col < n; col++) {
        workGrid[0][col] = {
            value: digits[col],
            color: COLORS.ORANGE,
            type: 'dividend',
            digitIndex: col,
            revealed: true,
            row: 0,
            col: col
        };
    }
    
    // Create product and remainder rows
    for (let step = 0; step < n; step++) {
        const productRow = 2 * step + 1;
        const remainderRow = 2 * step + 2;
        
        // Product row
        const startCol = totalCols - 1 - step; // Align under current digit
        workGrid[productRow][startCol] = {
            value: '',
            color: COLORS.PINK,
            type: 'product',
            step: step,
            revealed: false,
            isInput: true,
            row: productRow,
            col: startCol
        };
        
        // Remainder row
        if (remainderRow < totalRows) {
            workGrid[remainderRow][startCol] = {
                value: '',
                color: COLORS.YELLOW,
                type: 'remainder',
                step: step,
                revealed: false,
                row: remainderRow,
                col: startCol
            };
            
            // Brought-down digit (if not last step)
            if (step < n - 1) {
                const broughtDownCol = startCol + 1;
                workGrid[remainderRow][broughtDownCol] = {
                    value: digits[step + 1],
                    color: COLORS.YELLOW,
                    type: 'brought_down',
                    step: step,
                    revealed: false,
                    row: remainderRow,
                    col: broughtDownCol
                };
            }
        }
    }
    
    return { workGrid, answerGrid };
}

// ============================================
// Problem Display (Left Panel)
// ============================================
function updateProblemDisplay() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    const dividend = p.dividend;
    const divisor = p.divisor;
    
    let currentSubProblem = '';
    let instruction = '';
    
    if (p.finished) {
        const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
        const remainder = p.steps[p.steps.length - 1]?.subtraction || 0;
        currentSubProblem = `${dividend} ÷ ${divisor} = ${quotient} R ${remainder}`;
        instruction = 'Problem completed!';
    } else {
        // Show current sub-problem
        switch (p.currentStep) {
            case 0:
                currentSubProblem = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `Start with the first digit: ${p.partial} ÷ ${divisor}`;
                break;
                
            case 1:
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentSubProblem = `${lastStep.partialBefore} - (${divisor} × ${lastStep.digit}) = ${lastStep.partialBefore} - ${lastStep.product}`;
                    instruction = `Subtract ${lastStep.product} from ${lastStep.partialBefore}`;
                }
                break;
                
            case 2:
                const lastRemainder = p.steps[p.steps.length - 1]?.subtraction || p.partial;
                if (p.currentDigit < p.n - 1) {
                    const nextDigit = p.digits[p.currentDigit + 1];
                    currentSubProblem = `Bring down ${nextDigit}: ${lastRemainder}${nextDigit}`;
                    instruction = `Bring down the next digit (${nextDigit})`;
                    p.needsBringDown = true;
                }
                break;
        }
    }
    
    problemDisplay.innerHTML = `
        <div class="main-problem-display">
            <div class="large-equation">
                ${dividend} ÷ ${divisor}
            </div>
            
            ${!p.finished ? `
            <div class="current-subproblem">
                <div class="subproblem-title">Current Step:</div>
                <div class="subproblem-equation">${currentSubProblem}</div>
                <div class="instruction">${instruction}</div>
                ${p.currentStep === 0 ? `
                <div class="hint">How many times does ${divisor} go into ${p.partial}?</div>
                ` : ''}
            </div>
            ` : `
            <div class="solution-display">
                <div class="solution-title">Solution:</div>
                <div class="final-answer">
                    ${dividend} ÷ ${divisor} = 
                    ${p.quotientDigits.join('').replace(/^0+/, '') || '0'} 
                    R ${p.steps[p.steps.length - 1]?.subtraction || 0}
                </div>
            </div>
            `}
        </div>
    `;
}

// ============================================
// Grid Rendering (Right Panel) - FIXED
// ============================================
function renderGrid() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    const totalRows = p.totalRows;
    const totalCols = p.totalCols;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'long-division-grid';
    
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        .division-grid {
            display: inline-grid;
            grid-template-columns: 60px repeat(${totalCols + 2}, 40px);
            grid-template-rows: 40px repeat(${totalRows}, 40px);
            gap: 1px;
            background: #f0f0f0;
            border: 2px solid #333;
            padding: 10px;
            font-family: 'Courier New', monospace;
        }
        .grid-cell {
            background: white;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            min-width: 40px;
            min-height: 40px;
        }
        .grid-cell.orange { background: #ff8c2a; }
        .grid-cell.yellow { background: #ffee00; }
        .grid-cell.pink { background: #ffb6c1; }
        .grid-cell.green { background: #2db84d; color: white; }
        .grid-cell.blue { background: #00a6e6; color: white; }
        .grid-cell.empty { background: transparent; border: none; }
        .grid-cell.input-active { 
            box-shadow: 0 0 0 2px #007bff;
            cursor: pointer;
        }
        .division-symbol {
            grid-column: 2;
            grid-row: 2 / span ${totalRows};
            border-left: 3px solid black;
            position: relative;
            margin-left: -15px;
            pointer-events: none;
        }
        .division-symbol::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -15px;
            width: ${totalCols * 40 + 25}px;
            height: 3px;
            background: black;
        }
    `;
    
    // Create grid container
    const grid = document.createElement('div');
    grid.className = 'division-grid';
    
    // Add divisor cell
    const divisorCell = document.createElement('div');
    divisorCell.className = 'grid-cell blue';
    divisorCell.style.gridColumn = '1';
    divisorCell.style.gridRow = `1 / span ${totalRows + 1}`;
    divisorCell.textContent = p.divisor;
    grid.appendChild(divisorCell);
    
    // Add answer grid
    for (let col = 0; col < p.answerGrid.length; col++) {
        const cell = p.answerGrid[col];
        const gridCol = col + 2;
        
        let displayValue = cell.value;
        if (!cell.revealed) {
            if (cell.type === 'quotient') displayValue = '?';
            else if (cell.type === 'remainder_value') displayValue = '';
        }
        
        const answerCell = document.createElement('div');
        answerCell.className = 'grid-cell green';
        answerCell.style.gridColumn = gridCol;
        answerCell.style.gridRow = '1';
        answerCell.textContent = displayValue;
        grid.appendChild(answerCell);
    }
    
    // Add work grid cells
    for (let row = 0; row < totalRows; row++) {
        const cssRow = row + 2;
        
        for (let col = 0; col < totalCols; col++) {
            const cell = p.workGrid[row][col];
            const cssCol = col + 2;
            
            const cellDiv = document.createElement('div');
            
            if (cell) {
                const isActiveInput = !p.finished && 
                                    cell.type === 'product' && 
                                    cell.isInput && 
                                    !cell.revealed &&
                                    row === p.currentRow;
                
                cellDiv.className = `grid-cell ${cell.color} ${isActiveInput ? 'input-active' : ''}`;
                cellDiv.style.gridColumn = cssCol;
                cellDiv.style.gridRow = cssRow;
                cellDiv.textContent = cell.revealed ? cell.value : '';
                
                // Add click handler for active input cells
                if (isActiveInput) {
                    cellDiv.dataset.row = row;
                    cellDiv.dataset.col = col;
                    cellDiv.addEventListener('click', handleCellClick);
                }
            } else {
                cellDiv.className = 'grid-cell empty';
                cellDiv.style.gridColumn = cssCol;
                cellDiv.style.gridRow = cssRow;
            }
            
            grid.appendChild(cellDiv);
        }
    }
    
    // Add division symbol
    const symbol = document.createElement('div');
    symbol.className = 'division-symbol';
    grid.appendChild(symbol);
    
    // Assemble everything
    container.appendChild(style);
    container.appendChild(grid);
    
    // Clear and add to container
    workStageContainer.innerHTML = '';
    workStageContainer.appendChild(container);
}

// Handle cell clicks
function handleCellClick(event) {
    if (!currentProblem || currentProblem.finished) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    console.log('Cell clicked:', row, col);
    
    // For now, just focus on the number buttons
    // In a more advanced version, you could make the cell itself editable
    showFeedback('Use the number buttons below to enter your answer, then click "Confirm This Digit"', 'info');
}

// ============================================
// User Input & Number Buttons - FIXED
// ============================================
function createNumberButtons() {
    const numberButtonsHTML = `
        <div class="number-buttons-container">
            <div class="number-buttons-row">
                <button class="number-btn" data-change="1">+1</button>
                <button class="number-btn" data-change="-1">-1</button>
                <button class="number-btn clear">Clear</button>
            </div>
            <div class="number-display">
                Current guess: <span id="currentGuessDisplay">0</span>
            </div>
            <button id="commitGuessBtn" class="commit-btn">✓ Confirm This Digit</button>
        </div>
    `;
    
    workFeedback.innerHTML = numberButtonsHTML;
    
    // Re-attach event listeners
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            
            if (btn.classList.contains('clear')) {
                clearGuess();
                return;
            }
            
            const delta = parseInt(btn.dataset.change, 10);
            adjustGuess(delta);
        });
    });
    
    document.getElementById('commitGuessBtn').addEventListener('click', commitGuess);
}

function adjustGuess(delta) {
    if (!currentProblem || currentProblem.finished) return;
    
    const newGuess = currentGuess + delta;
    if (newGuess >= 0 && newGuess <= 9) {
        currentGuess = newGuess;
        updateGuessDisplay();
    }
}

function clearGuess() {
    currentGuess = 0;
    updateGuessDisplay();
}

function updateGuessDisplay() {
    const display = document.getElementById('currentGuessDisplay');
    if (display) {
        display.textContent = currentGuess;
    }
}

// ============================================
// Core Game Logic
// ============================================
function commitGuess() {
    if (!currentProblem || currentProblem.finished) return;
    
    const p = currentProblem;
    
    if (p.currentStep === 0) {
        processQuotientInput();
    } else if (p.currentStep === 1) {
        processSubtraction();
    } else if (p.currentStep === 2 && p.needsBringDown) {
        processBringDown();
    } else {
        showFeedback('Click "New Problem" to start a new division problem', 'info');
    }
}

function processQuotientInput() {
    const p = currentProblem;
    const correctDigit = Math.floor(p.partial / p.divisor);
    const product = currentGuess * p.divisor;
    
    // Validation
    if (product > p.partial) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Cannot multiply ${p.divisor} × ${currentGuess} = ${product} (greater than ${p.partial})`, 'error');
        updateScoreDisplay();
        return;
    }
    
    if (currentGuess !== correctDigit) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Incorrect. ${p.partial} ÷ ${p.divisor} = ${correctDigit}, not ${currentGuess}`, 'error');
        updateScoreDisplay();
        currentGuess = correctDigit;
        updateGuessDisplay();
        return;
    }
    
    // CORRECT
    p.quotientDigits.push(currentGuess);
    p.steps.push({
        digit: currentGuess,
        partialBefore: p.partial,
        product: product,
        subtraction: p.partial - product,
        stepIndex: p.currentDigit
    });
    
    // Update answer grid
    p.answerGrid[p.currentDigit].value = currentGuess;
    p.answerGrid[p.currentDigit].revealed = true;
    
    // Update work grid with product
    const productRow = p.currentRow;
    const partialStr = String(p.partial);
    const startCol = p.totalCols - partialStr.length;
    
    const cell = p.workGrid[productRow][startCol];
    if (cell && cell.type === 'product') {
        cell.value = currentGuess;
        cell.revealed = true;
    }
    
    showFeedback(`Correct! ${p.divisor} × ${currentGuess} = ${product}`, 'success');
    
    // Move to next step
    p.currentStep = 1;
    currentGuess = p.partial - product;
    
    updateProblemDisplay();
    renderGrid();
    updateGuessDisplay();
}

function processSubtraction() {
    const p = currentProblem;
    const lastStep = p.steps[p.steps.length - 1];
    const expectedRemainder = lastStep.subtraction;
    
    if (currentGuess !== expectedRemainder) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Incorrect subtraction. ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'error');
        updateScoreDisplay();
        currentGuess = expectedRemainder;
        updateGuessDisplay();
        return;
    }
    
    // CORRECT
    const remainderRow = p.currentRow + 1;
    const partialStr = String(lastStep.partialBefore);
    const startCol = p.totalCols - partialStr.length;
    
    const cell = p.workGrid[remainderRow][startCol];
    if (cell && cell.type === 'remainder') {
        cell.value = expectedRemainder;
        cell.revealed = true;
    }
    
    // Reveal brought-down digit if present
    if (p.currentDigit < p.n - 1) {
        const broughtDownCell = p.workGrid[remainderRow][startCol + 1];
        if (broughtDownCell && broughtDownCell.type === 'brought_down') {
            broughtDownCell.revealed = true;
        }
    }
    
    p.partial = expectedRemainder;
    showFeedback(`Correct! Remainder is ${expectedRemainder}`, 'success');
    
    // Move to next step
    p.currentStep = 2;
    p.currentDigit++;
    
    updateProblemDisplay();
    renderGrid();
    currentGuess = 0;
    updateGuessDisplay();
}

function processBringDown() {
    const p = currentProblem;
    
    if (p.currentDigit >= p.n) {
        completeProblem();
        return;
    }
    
    // Bring down next digit
    const nextDigit = p.digits[p.currentDigit];
    p.partial = p.partial * 10 + nextDigit;
    
    // Move to next product row
    p.currentRow += 2;
    p.currentStep = 0;
    p.needsBringDown = false;
    
    showFeedback(`Brought down ${nextDigit}. New number: ${p.partial}`, 'success');
    
    updateProblemDisplay();
    renderGrid();
    currentGuess = 0;
    updateGuessDisplay();
}

function completeProblem() {
    const p = currentProblem;
    p.finished = true;
    
    // Update final remainder
    const finalRemainder = p.steps[p.steps.length - 1]?.subtraction || 0;
    p.answerGrid[p.n + 1].value = finalRemainder;
    p.answerGrid[p.n + 1].revealed = true;
    
    solvedCount++;
    currentStreak++;
    
    const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
    showFeedback(`Perfect! Answer: ${quotient} R ${finalRemainder}`, 'success');
    
    updateScoreDisplay();
    updateProblemDisplay();
    renderGrid();
}

// ============================================
// Feedback & UI Helpers
// ============================================
function showFeedback(message, type = 'error') {
    const feedbackArea = document.querySelector('.number-buttons-container');
    if (feedbackArea) {
        const existingFeedback = feedbackArea.querySelector('.feedback-message');
        if (existingFeedback) existingFeedback.remove();
        
        const feedbackMsg = document.createElement('div');
        feedbackMsg.className = `feedback-message feedback-${type}`;
        feedbackMsg.textContent = message;
        feedbackArea.appendChild(feedbackMsg);
        
        setTimeout(() => {
            if (feedbackMsg.parentNode) feedbackMsg.remove();
        }, type === 'error' ? 4000 : 3000);
    }
}

function clearFeedback() {
    const feedbackMsg = document.querySelector('.feedback-message');
    if (feedbackMsg) feedbackMsg.remove();
}

function resetCurrentProblem() {
    if (currentProblem) {
        initializeDivisionState(currentProblem.dividend, currentProblem.divisor);
    }
}

// ============================================
// Score Management
// ============================================
function updateScoreDisplay() {
    solvedCountEl.textContent = solvedCount;
    mistakeCountEl.textContent = mistakeCount;
    
    const total = solvedCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    divisionAccuracyEl.textContent = accuracy + '%';
    currentStreakEl.textContent = currentStreak;
    
    // Save to localStorage
    localStorage.setItem('divisionSolvedCount', solvedCount);
    localStorage.setItem('divisionMistakeCount', mistakeCount);
    localStorage.setItem('divisionCurrentStreak', currentStreak);
}

function resetAllScores() {
    solvedCount = 0;
    mistakeCount = 0;
    currentStreak = 0;
    updateScoreDisplay();
}
