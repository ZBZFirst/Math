// division.js - Using Static HTML Grid

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

// Grid cell references (will be populated on initialization)
let gridCells = {};
let answerCells = {};

// ============================================
// State Management
// ============================================
let currentProblem = null;
let currentGuess = 0;
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Division practice initialized');
    
    // Initialize grid cell references
    initializeGridReferences();
    
    // Initialize UI
    updateScoreDisplay();
    setupButtonHandlers();
    
    // Generate first problem
    generateNewProblem();
});

// Initialize references to all grid cells
function initializeGridReferences() {
    // Map all grid cells by their IDs
    gridCells = {
        // Answer cells
        'ans-q0': document.getElementById('ans-q0'),
        'ans-q1': document.getElementById('ans-q1'),
        'ans-q2': document.getElementById('ans-q2'),
        'ans-r': document.getElementById('ans-r'),
        'ans-rem': document.getElementById('ans-rem'),
        
        // Divisor cell
        'divisor': document.getElementById('divisor'),
        
        // Work grid cells - organized by row and column
        'r2c1': document.getElementById('r2c1'),
        'r2c2': document.getElementById('r2c2'),
        'r2c3': document.getElementById('r2c3'),
        'r2c4': document.getElementById('r2c4'),
        'r2c5': document.getElementById('r2c5'),
        
        'r3c1': document.getElementById('r3c1'),
        'r3c2': document.getElementById('r3c2'),
        'r3c3': document.getElementById('r3c3'),
        'r3c4': document.getElementById('r3c4'),
        'r3c5': document.getElementById('r3c5'),
        
        'r4c1': document.getElementById('r4c1'),
        'r4c2': document.getElementById('r4c2'),
        'r4c3': document.getElementById('r4c3'),
        'r4c4': document.getElementById('r4c4'),
        'r4c5': document.getElementById('r4c5'),
        
        'r5c1': document.getElementById('r5c1'),
        'r5c2': document.getElementById('r5c2'),
        'r5c3': document.getElementById('r5c3'),
        'r5c4': document.getElementById('r5c4'),
        'r5c5': document.getElementById('r5c5'),
        
        'r6c1': document.getElementById('r6c1'),
        'r6c2': document.getElementById('r6c2'),
        'r6c3': document.getElementById('r6c3'),
        'r6c4': document.getElementById('r6c4'),
        'r6c5': document.getElementById('r6c5'),
        
        'r7c1': document.getElementById('r7c1'),
        'r7c2': document.getElementById('r7c2'),
        'r7c3': document.getElementById('r7c3'),
        'r7c4': document.getElementById('r7c4'),
        'r7c5': document.getElementById('r7c5'),
        
        'r8c1': document.getElementById('r8c1'),
        'r8c2': document.getElementById('r8c2'),
        'r8c3': document.getElementById('r8c3'),
        'r8c4': document.getElementById('r8c4'),
        'r8c5': document.getElementById('r8c5'),
        
        'r9c1': document.getElementById('r9c1'),
        'r9c2': document.getElementById('r9c2'),
        'r9c3': document.getElementById('r9c3'),
        'r9c4': document.getElementById('r9c4'),
        'r9c5': document.getElementById('r9c5'),
        
        'r10c1': document.getElementById('r10c1'),
        'r10c2': document.getElementById('r10c2'),
        'r10c3': document.getElementById('r10c3'),
        'r10c4': document.getElementById('r10c4'),
        'r10c5': document.getElementById('r10c5'),
        
        'r11c1': document.getElementById('r11c1'),
        'r11c2': document.getElementById('r11c2'),
        'r11c3': document.getElementById('r11c3'),
        'r11c4': document.getElementById('r11c4'),
        'r11c5': document.getElementById('r11c5')
    };
    
    // Store answer cells separately for easy access
    answerCells = {
        'q0': gridCells['ans-q0'],
        'q1': gridCells['ans-q1'],
        'q2': gridCells['ans-q2'],
        'rem': gridCells['ans-rem']
    };
}

// Setup all button handlers
function setupButtonHandlers() {
    // Main control buttons
    newProblemBtn.addEventListener('click', generateNewProblem);
    resetProblemBtn.addEventListener('click', resetCurrentProblem);
    resetScoresBtn.addEventListener('click', resetAllScores);
    
    // Create control buttons in the feedback area
    createControlButtons();
}

// ============================================
// Control Buttons Creation
// ============================================
function createControlButtons() {
    const controlButtonsHTML = `
        <div class="control-grid">
            <button class="grid-btn decrement" data-change="-5">-5</button>
            <button class="grid-btn decrement" data-change="-1">-1</button>
            <button class="grid-btn clear" id="clearGuess">C</button>
            <button class="grid-btn increment" data-change="+1">+1</button>
            <button class="grid-btn increment" data-change="+5">+5</button>
        </div>
        <div class="number-display">
            Current guess: <span id="currentGuessDisplay">0</span>
        </div>
        <button id="commitGuessBtn" class="commit-btn">✓ Confirm This Digit</button>
    `;
    
    workFeedback.innerHTML = controlButtonsHTML;
    
    // Add event listeners to control buttons
    setupControlButtonListeners();
}

function setupControlButtonListeners() {
    // Number adjustment buttons
    document.querySelectorAll('[data-change]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            
            const delta = parseInt(btn.dataset.change);
            adjustGuess(delta);
        });
    });
    
    // Clear button
    document.getElementById('clearGuess').addEventListener('click', clearGuess);
    
    // Commit button
    document.getElementById('commitGuessBtn').addEventListener('click', commitGuess);
}

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
    
    // Reset grid to initial state
    resetGrid();
    
    currentProblem = {
        // Basic problem info
        dividend: dividend,
        divisor: divisor,
        digits: digits,
        n: n,
        
        // Current solving state
        currentStep: 0,           // 0: find quotient, 1: subtract, 2: bring down
        currentDigitIndex: 0,     // Which digit we're working on
        partial: digits[0],       // Current working number
        quotientDigits: [],       // Quotient digits found so far
        steps: [],                // Steps taken
        finished: false,
        
        // Grid display state
        visibleRows: 2 * n + 1    // Number of rows to show (2n+1)
    };
    
    // Update UI
    updateDivisor(divisor);
    updateDividend(digits);
    updateProblemDisplay();
    currentGuess = 0;
    updateGuessDisplay();
    clearFeedback();
    
    // Show/hide rows based on n
    updateVisibleRows(n);
}

// ============================================
// Grid Management (using static HTML)
// ============================================
function resetGrid() {
    // Clear all answer cells
    for (let key in answerCells) {
        if (answerCells[key]) {
            answerCells[key].textContent = '?';
        }
    }
    gridCells['ans-rem'].textContent = '?';
    
    // Clear all work grid cells
    for (let row = 2; row <= 11; row++) {
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                // Reset to initial values from HTML
                switch (row) {
                    case 2:
                        if (col <= 3) cell.textContent = '';
                        else cell.textContent = '';
                        break;
                    case 4:
                        if (col === 2) cell.textContent = '2';
                        else if (col !== 1) cell.textContent = '';
                        break;
                    case 6:
                        if (col === 3) cell.textContent = '3';
                        else cell.textContent = '';
                        break;
                    default:
                        cell.textContent = '';
                }
            }
        }
    }
}

function updateDivisor(divisor) {
    gridCells['divisor'].textContent = divisor;
}

function updateDividend(digits) {
    // Update the dividend row (row 2)
    for (let i = 0; i < 5; i++) {
        const cellId = `r2c${i + 1}`;
        const cell = gridCells[cellId];
        if (cell) {
            if (i < digits.length) {
                cell.textContent = digits[i];
                cell.style.display = 'flex';
            } else {
                cell.textContent = '';
                cell.style.display = 'none';
            }
        }
    }
}

function updateVisibleRows(n) {
    const visibleRows = 2 * n + 1;
    
    // Show/hide rows based on n
    for (let row = 2; row <= 11; row++) {
        const shouldShow = row <= (visibleRows + 1); // +1 because row 2 is the first work row
        
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.style.display = shouldShow ? 'flex' : 'none';
            }
        }
    }
}

// ============================================
// Problem Display (Left Panel)
// ============================================
function updateProblemDisplay() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    const dividend = p.dividend;
    const divisor = p.divisor;
    
    let mainEquation = `${dividend} ÷ ${divisor}`;
    let currentStep = '';
    let instruction = '';
    
    if (p.finished) {
        const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
        const remainder = p.steps[p.steps.length - 1]?.subtraction || 0;
        currentStep = `${dividend} ÷ ${divisor} = ${quotient} R ${remainder}`;
        instruction = 'Problem completed!';
    } else {
        // Show current step
        switch (p.currentStep) {
            case 0:
                currentStep = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `How many times does ${divisor} go into ${p.partial}?`;
                break;
            case 1:
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                    instruction = `Subtract ${lastStep.product} from ${lastStep.partialBefore}`;
                }
                break;
            case 2:
                const lastRemainder = p.steps[p.steps.length - 1]?.subtraction || p.partial;
                if (p.currentDigitIndex < p.n - 1) {
                    const nextDigit = p.digits[p.currentDigitIndex + 1];
                    currentStep = `Bring down ${nextDigit}`;
                    instruction = `New number: ${lastRemainder}${nextDigit}`;
                }
                break;
        }
    }
    
    problemDisplay.innerHTML = `
        <div class="equation-display">
            <div class="large-equation">
                ${mainEquation}
            </div>
        </div>
        <div class="current-step-container">
            <div class="current-step-title">Current Step</div>
            <div class="current-step-equation" id="currentStepEquation">
                ${currentStep}
            </div>
            <div class="current-instruction" id="currentInstruction">
                ${instruction}
            </div>
        </div>
    `;
}

// ============================================
// User Input Controls
// ============================================
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
        processQuotientInput(p);
    } else if (p.currentStep === 1) {
        processSubtraction(p);
    } else if (p.currentStep === 2) {
        processBringDown(p);
    }
}

function processQuotientInput(problem) {
    const correctDigit = Math.floor(problem.partial / problem.divisor);
    const product = currentGuess * problem.divisor;
    
    // Validation
    if (product > problem.partial) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Cannot multiply ${problem.divisor} × ${currentGuess} = ${product} (greater than ${problem.partial})`, 'error');
        updateScoreDisplay();
        return;
    }
    
    if (currentGuess !== correctDigit) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Incorrect. ${problem.partial} ÷ ${problem.divisor} = ${correctDigit}, not ${currentGuess}`, 'error');
        updateScoreDisplay();
        currentGuess = correctDigit;
        updateGuessDisplay();
        return;
    }
    
    // CORRECT - Update state
    problem.quotientDigits.push(currentGuess);
    problem.steps.push({
        digit: currentGuess,
        partialBefore: problem.partial,
        product: product,
        subtraction: problem.partial - product,
        stepIndex: problem.currentDigitIndex
    });
    
    // Update grid
    updateQuotientInGrid(problem.currentDigitIndex, currentGuess);
    updateProductInGrid(problem.currentDigitIndex, product);
    
    showFeedback(`Correct! ${problem.divisor} × ${currentGuess} = ${product}`, 'success');
    
    // Move to next step
    problem.currentStep = 1;
    currentGuess = problem.partial - product;
    
    updateProblemDisplay();
    updateGuessDisplay();
}

function processSubtraction(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
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
    
    // CORRECT - Update grid with remainder
    updateRemainderInGrid(problem.currentDigitIndex, expectedRemainder);
    
    problem.partial = expectedRemainder;
    showFeedback(`Correct! Remainder is ${expectedRemainder}`, 'success');
    
    // Move to next step
    problem.currentStep = 2;
    problem.currentDigitIndex++;
    
    updateProblemDisplay();
    currentGuess = 0;
    updateGuessDisplay();
}

function processBringDown(problem) {
    if (problem.currentDigitIndex >= problem.n) {
        completeProblem(problem);
        return;
    }
    
    // Bring down next digit
    const nextDigit = problem.digits[problem.currentDigitIndex];
    problem.partial = problem.partial * 10 + nextDigit;
    
    // Update instruction
    showFeedback(`Brought down ${nextDigit}. New number: ${problem.partial}`, 'success');
    
    // Move to next quotient step
    problem.currentStep = 0;
    
    updateProblemDisplay();
    currentGuess = 0;
    updateGuessDisplay();
}

function completeProblem(problem) {
    problem.finished = true;
    
    // Update final remainder in answer grid
    const finalRemainder = problem.steps[problem.steps.length - 1]?.subtraction || 0;
    gridCells['ans-rem'].textContent = finalRemainder;
    
    solvedCount++;
    currentStreak++;
    
    const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
    showFeedback(`Perfect! Answer: ${quotient} R ${finalRemainder}`, 'success');
    
    updateScoreDisplay();
    updateProblemDisplay();
}

// ============================================
// Grid Update Helpers
// ============================================
function updateQuotientInGrid(digitIndex, value) {
    const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
    if (digitIndex < quotientCellIds.length) {
        const cell = gridCells[quotientCellIds[digitIndex]];
        if (cell) {
            cell.textContent = value;
        }
    }
}

function updateProductInGrid(digitIndex, product) {
    // Map digit index to row (0 → row 3, 1 → row 5, 2 → row 7)
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[digitIndex];
    
    if (row) {
        const productStr = String(product).padStart(digitIndex + 1, '0');
        
        // Update product cells from right to left
        for (let i = 0; i < productStr.length; i++) {
            const col = 2 - digitIndex + i; // Align under current partial
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = productStr[i];
            }
        }
    }
}

function updateRemainderInGrid(digitIndex, remainder) {
    // Map digit index to row (0 → row 4, 1 → row 6, 2 → row 8)
    const rowMap = {0: 4, 1: 6, 2: 8};
    const row = rowMap[digitIndex];
    
    if (row) {
        const remainderStr = String(remainder).padStart(digitIndex + 1, '0');
        
        // Update remainder cells from right to left
        for (let i = 0; i < remainderStr.length; i++) {
            const col = 2 - digitIndex + i; // Align under current partial
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = remainderStr[i];
            }
        }
    }
}

// ============================================
// Feedback & UI Helpers
// ============================================
function showFeedback(message, type = 'error') {
    const feedbackArea = document.querySelector('.number-buttons-container');
    if (!feedbackArea) return;
    
    const existingFeedback = feedbackArea.querySelector('.feedback-message');
    if (existingFeedback) existingFeedback.remove();
    
    const feedbackMsg = document.createElement('div');
    feedbackMsg.className = `feedback-message feedback-${type}`;
    feedbackMsg.textContent = message;
    feedbackArea.appendChild(feedbackMsg);
    
    setTimeout(() => {
        if (feedbackMsg.parentNode) {
            feedbackMsg.remove();
        }
    }, type === 'error' ? 4000 : 3000);
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
    currentStreakEl.textContent = currentStreak;
    
    const total = solvedCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    divisionAccuracyEl.textContent = accuracy + '%';
    
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
