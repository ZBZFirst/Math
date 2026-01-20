// division.js - Complete Reconstruction

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
    BLUE: 'blue',     // divisor
    ORANGE: 'orange', // dividend digits
    YELLOW: 'yellow', // remainders & brought-down digits
    PINK: 'pink',     // user input (products)
    GREEN: 'green'    // answer
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
        currentDigit: 0,          // Which digit we're working on (0 to n-1)
        currentRow: 1,            // Which grid row we're filling next (1, 3, 5...)
        partial: digits[0],       // Current working number
        quotientDigits: [],       // Quotient digits found so far
        steps: [],                // Steps taken
        finished: false,
        
        // Grid structure - COMPLETE and pre-calculated
        workGrid: workGrid,       // 2D array [2n+1][n] - ALL cells exist
        answerGrid: answerGrid,   // 1D array [n+2]
        totalRows: 2 * n + 1,
        totalCols: n,
        
        // Current step info for problem display
        currentStep: 0,           // 0 = start, 1 = find quotient, 2 = subtract
        needsBringDown: false
    };
    
    currentGuess = 0;
    updateProblemDisplay();
    renderGrid();
    renderNumberButtons();
    clearFeedback();
}

// ============================================
// Grid Creation - 2n+1 Structure
// ============================================
function createCompleteGrid(digits, divisor) {
    const n = digits.length;
    const totalRows = 2 * n + 1;
    const totalCols = n;
    
    // Create empty work grid
    const workGrid = Array(totalRows).fill().map(() => Array(totalCols).fill(null));
    
    // Create answer grid (n quotient digits + "R" + remainder)
    const answerGrid = Array(n + 2).fill().map((_, i) => ({
        value: '',
        color: COLORS.GREEN,
        revealed: false,
        type: i < n ? 'quotient' : (i === n ? 'remainder_label' : 'remainder_value')
    }));
    answerGrid[n].value = 'R';
    answerGrid[n].revealed = true;
    
    // --------------------------------------------------
    // Row 0: DIVIDEND (Orange)
    // --------------------------------------------------
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
    
    // --------------------------------------------------
    // Rows 1, 3, 5...: PRODUCT rows (Pink - user input)
    // --------------------------------------------------
    for (let step = 0; step < n; step++) {
        const productRow = 2 * step + 1;
        
        // Determine which columns this product will occupy
        // For step 0: under first digit (column n-1)
        // For step 1: under first two digits if remainder was 2+ digits
        const partialLength = Math.min(step + 1, n); // Max columns this product could need
        const startCol = totalCols - partialLength;
        
        for (let colOffset = 0; colOffset < partialLength; colOffset++) {
            const col = startCol + colOffset;
            if (col < totalCols) {
                workGrid[productRow][col] = {
                    value: '',
                    color: COLORS.PINK,
                    type: 'product',
                    step: step,
                    position: colOffset,
                    revealed: false,
                    isInput: colOffset === (partialLength - 1), // Rightmost digit is user input
                    row: productRow,
                    col: col
                };
            }
        }
    }
    
    // --------------------------------------------------
    // Rows 2, 4, 6...: REMAINDER rows (Yellow - deterministic)
    // Also contain BROUGHT-DOWN digits
    // --------------------------------------------------
    for (let step = 0; step < n; step++) {
        const remainderRow = 2 * step + 2;
        
        if (remainderRow < totalRows) {
            // Remainder cells (will be filled after subtraction)
            const partialLength = Math.min(step + 1, n);
            const startCol = totalCols - partialLength;
            
            for (let colOffset = 0; colOffset < partialLength; colOffset++) {
                const col = startCol + colOffset;
                if (col < totalCols) {
                    workGrid[remainderRow][col] = {
                        value: '',
                        color: COLORS.YELLOW,
                        type: 'remainder',
                        step: step,
                        position: colOffset,
                        revealed: false,
                        row: remainderRow,
                        col: col
                    };
                }
            }
            
            // Brought-down digit (if not last step)
            if (step < n - 1) {
                const broughtDownCol = step + 1; // Next digit position
                const existingCell = workGrid[remainderRow][broughtDownCol];
                
                if (existingCell) {
                    existingCell.hasBroughtDown = true;
                    existingCell.broughtDownDigit = digits[step + 1];
                } else {
                    workGrid[remainderRow][broughtDownCol] = {
                        value: digits[step + 1],
                        color: COLORS.YELLOW,
                        type: 'brought_down',
                        step: step,
                        revealed: false,
                        row: remainderRow,
                        col: broughtDownCol,
                        broughtDownDigit: digits[step + 1]
                    };
                }
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
            case 0: // Starting
                currentSubProblem = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `Start with the first digit: ${p.partial} ÷ ${divisor}`;
                break;
                
            case 1: // Just found quotient, need to subtract
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentSubProblem = `${lastStep.partialBefore} - (${divisor} × ${lastStep.digit}) = ${lastStep.partialBefore} - ${lastStep.product}`;
                    instruction = `Subtract ${lastStep.product} from ${lastStep.partialBefore}`;
                }
                break;
                
            case 2: // Just subtracted, need to bring down
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
// Grid Rendering (Right Panel)
// ============================================
function renderGrid() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    const totalRows = p.totalRows;
    const totalCols = p.totalCols;
    
    let html = `
    <div class="long-division-grid">
        <style>
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
        </style>
        
        <div class="division-grid">
    `;
    
    // --------------------------------------------------
    // Column 0: DIVISOR (Blue) - spans all rows
    // --------------------------------------------------
    html += `<div class="grid-cell blue" style="grid-column: 1; grid-row: 1 / span ${totalRows + 1}">
        ${p.divisor}
    </div>`;
    
    // --------------------------------------------------
    // Row 0: ANSWER GRID (Green)
    // --------------------------------------------------
    for (let col = 0; col < p.answerGrid.length; col++) {
        const cell = p.answerGrid[col];
        const gridCol = col + 2; // +1 for divisor column
        
        let displayValue = cell.value;
        if (!cell.revealed) {
            if (cell.type === 'quotient') displayValue = '?';
            else if (cell.type === 'remainder_value') displayValue = '';
        }
        
        html += `<div class="grid-cell green" style="grid-column: ${gridCol}; grid-row: 1">
            ${displayValue}
        </div>`;
    }
    
    // --------------------------------------------------
    // Rows 1 through 2n: WORK GRID
    // --------------------------------------------------
    for (let row = 0; row < totalRows; row++) {
        const cssRow = row + 2; // +1 for answer row
        
        for (let col = 0; col < totalCols; col++) {
            const cell = p.workGrid[row][col];
            const cssCol = col + 2; // +1 for divisor column
            
            if (cell) {
                const isActiveInput = !p.finished && 
                                    cell.type === 'product' && 
                                    cell.isInput && 
                                    !cell.revealed &&
                                    row === p.currentRow;
                
                const cellClass = `grid-cell ${cell.color} ${isActiveInput ? 'input-active' : ''}`;
                const displayValue = cell.revealed ? cell.value : '';
                
                html += `<div class="${cellClass}" 
                         style="grid-column: ${cssCol}; grid-row: ${cssRow}"
                         data-row="${row}" 
                         data-col="${col}"
                         title="${cell.type}">
                    ${displayValue}
                </div>`;
            } else {
                // Empty cell for visual spacing
                html += `<div class="grid-cell empty" 
                         style="grid-column: ${cssCol}; grid-row: ${cssRow}"></div>`;
            }
        }
    }
    
    // --------------------------------------------------
    // DIVISION SYMBOL (overlay)
    // --------------------------------------------------
    html += `<div class="division-symbol" style="
        grid-column: 2;
        grid-row: 2 / span ${totalRows};
        border-left: 3px solid black;
        position: relative;
        margin-left: -15px;
        pointer-events: none;
    ">
        <div style="
            position: absolute;
            top: -3px;
            left: -15px;
            width: ${totalCols * 40 + 25}px;
            height: 3px;
            background: black;
        "></div>
    </div>`;
    
    html += `</div></div>`;
    
    // Add click handlers for input cells
    html += `<script>
        document.querySelectorAll('.grid-cell.input-active').forEach(cell => {
            cell.addEventListener('click', function() {
                const row = this.dataset.row;
                const col = this.dataset.col;
                console.log('Cell clicked:', row, col);
                // Input handling would go here
            });
        });
    </script>`;
    
    workStageContainer.innerHTML = html;
}

// ============================================
// User Input & Number Buttons
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
        // Step 1: Finding quotient digit
        processQuotientInput();
    } else if (p.currentStep === 1) {
        // Step 2: Confirming subtraction
        processSubtraction();
    } else if (p.currentStep === 2 && p.needsBringDown) {
        // Step 3: Bringing down next digit
        processBringDown();
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
        currentGuess = correctDigit; // Show correct answer
        updateGuessDisplay();
        return;
    }
    
    // CORRECT - Update state
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
    const productStr = String(product).padStart(partialStr.length, '0');
    
    for (let i = 0; i < productStr.length; i++) {
        const col = startCol + i;
        const cell = p.workGrid[productRow][col];
        if (cell && cell.type === 'product') {
            cell.value = productStr[i];
            cell.revealed = true;
        }
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
    
    // CORRECT - Update work grid with remainder
    const remainderRow = p.currentRow + 1;
    const partialStr = String(lastStep.partialBefore);
    const startCol = p.totalCols - partialStr.length;
    const remainderStr = String(expectedRemainder).padStart(partialStr.length, '0');
    
    for (let i = 0; i < remainderStr.length; i++) {
        const col = startCol + i;
        const cell = p.workGrid[remainderRow][col];
        if (cell && (cell.type === 'remainder' || cell.type === 'brought_down')) {
            cell.value = remainderStr[i];
            cell.revealed = true;
        }
    }
    
    // Update partial
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
        // No more digits - problem complete
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
    
    // Update final remainder in answer grid
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
