// division.js - Using Static HTML Grid (Debug Version)

// ============================================
// Debug Configuration
// ============================================
const DEBUG = true; // Set to false to disable debug logs

function debugLog(message, data = null) {
    if (DEBUG) {
        if (data) {
            console.log(`[DEBUG] ${message}:`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
}

function debugError(message, error = null) {
    if (DEBUG) {
        console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
}

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
    debugLog('Division practice initialized');
    
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
    debugLog('Initializing grid cell references');
    
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
    
    // Log which cells were found
    const foundCells = Object.keys(gridCells).filter(key => gridCells[key]);
    debugLog(`Found ${foundCells.length} grid cells`, foundCells);
    
    // Store answer cells separately for easy access
    answerCells = {
        'q0': gridCells['ans-q0'],
        'q1': gridCells['ans-q1'],
        'q2': gridCells['ans-q2'],
        'rem': gridCells['ans-rem']
    };
    
    debugLog('Grid cell references initialized');
}

// Setup all button handlers
function setupButtonHandlers() {
    debugLog('Setting up button handlers');
    
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
    debugLog('Setting up existing control buttons');
    
    // The buttons already exist in HTML, just add listeners
    setupControlButtonListeners();
    
    // Also update the guess display
    updateGuessDisplay();
}

function setupControlButtonListeners() {
    debugLog('Setting up control button listeners');
    
    // Number adjustment buttons
    document.querySelectorAll('[data-change]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            
            const delta = parseInt(btn.dataset.change);
            debugLog(`Adjusting guess by ${delta}, current guess: ${currentGuess}`);
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
    debugLog('Generating new problem');
    
    let divisor = Math.floor(Math.random() * 15) + 1;
    let dividend;
    
    do {
        dividend = Math.floor(Math.random() * 999) + 1;
    } while (dividend <= divisor);
    
    debugLog(`Generated problem: ${dividend} ÷ ${divisor}`);
    
    initializeDivisionState(dividend, divisor);
}

function initializeDivisionState(dividend, divisor) {
    const digits = String(dividend).split('').map(Number);
    const n = digits.length;
    
    debugLog(`Initializing division state`, {
        dividend,
        divisor,
        digits,
        n,
        currentGuess
    });
    
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
    
    debugLog('Current problem state initialized', currentProblem);
    
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
    debugLog('Resetting grid to initial state');
    
    // Clear all answer cells
    for (let key in answerCells) {
        if (answerCells[key]) {
            answerCells[key].textContent = '?';
            debugLog(`Reset answer cell ${key} to ?`);
        }
    }
    if (gridCells['ans-rem']) {
        gridCells['ans-rem'].textContent = '?';
        debugLog('Reset remainder cell to ?');
    }
    
    // Clear all work grid cells and set proper initial state
    for (let row = 2; row <= 11; row++) {
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                // Reset to initial values from HTML
                if (row === 4 && col === 2) {
                    cell.textContent = '2';
                } else if (row === 6 && col === 3) {
                    cell.textContent = '3';
                } else {
                    cell.textContent = '';
                }
                cell.style.display = (row <= 8) ? 'flex' : 'none'; // Default hide extra rows
                debugLog(`Reset cell ${cellId} to "${cell.textContent}"`);
            }
        }
    }
    
    // Hide the divisor cell initially (will be shown when problem is loaded)
    if (gridCells['divisor']) {
        gridCells['divisor'].textContent = '?';
    }
}

function updateDivisor(divisor) {
    if (gridCells['divisor']) {
        gridCells['divisor'].textContent = divisor;
        debugLog(`Updated divisor cell to ${divisor}`);
    }
}

function updateDividend(digits) {
    debugLog(`Updating dividend cells with digits: ${digits}`);
    
    // Update the dividend row (row 2)
    for (let i = 0; i < 5; i++) {
        const cellId = `r2c${i + 1}`;
        const cell = gridCells[cellId];
        if (cell) {
            if (i < digits.length) {
                cell.textContent = digits[i];
                cell.style.display = 'flex';
                debugLog(`Set dividend cell ${cellId} to ${digits[i]}`);
            } else {
                cell.textContent = '';
                cell.style.display = 'none';
                debugLog(`Hid dividend cell ${cellId}`);
            }
        }
    }
}

function updateVisibleRows(n) {
    const visibleRows = 2 * n + 1;
    debugLog(`Showing ${visibleRows} rows for n=${n} (2n+1)`);
    
    // Show/hide rows based on n
    for (let row = 2; row <= 11; row++) {
        const shouldShow = row <= (visibleRows + 1); // +1 because row 2 is the first work row
        
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.style.display = shouldShow ? 'flex' : 'none';
                if (DEBUG && row <= 8) {
                    debugLog(`${shouldShow ? 'Showing' : 'Hiding'} cell ${cellId}`);
                }
            }
        }
    }
}

// ============================================
// Problem Display (Left Panel)
// ============================================
function updateProblemDisplay() {
    if (!currentProblem) {
        debugLog('No current problem to display');
        return;
    }
    
    const p = currentProblem;
    debugLog('Updating problem display', {
        currentStep: p.currentStep,
        currentDigitIndex: p.currentDigitIndex,
        partial: p.partial,
        finished: p.finished
    });
    
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
        debugLog(`Problem finished. Quotient: ${quotient}, Remainder: ${remainder}`);
    } else {
        // Show current step
        switch (p.currentStep) {
            case 0:
                currentStep = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `How many times does ${divisor} go into ${p.partial}?`;
                debugLog(`Step 0: Finding quotient for ${p.partial} ÷ ${divisor}`);
                break;
            case 1:
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                    instruction = `Subtract ${lastStep.product} from ${lastStep.partialBefore}`;
                    debugLog(`Step 1: Subtracting ${lastStep.product} from ${lastStep.partialBefore}`);
                }
                break;
            case 2:
                const lastRemainder = p.steps[p.steps.length - 1]?.subtraction || p.partial;
                if (p.currentDigitIndex < p.n - 1) {
                    const nextDigit = p.digits[p.currentDigitIndex + 1];
                    currentStep = `Bring down ${nextDigit}`;
                    instruction = `New number: ${lastRemainder}${nextDigit}`;
                    debugLog(`Step 2: Bringing down ${nextDigit}, new partial: ${lastRemainder}${nextDigit}`);
                } else {
                    debugLog(`Step 2: No more digits to bring down`);
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
    if (!currentProblem || currentProblem.finished) {
        debugLog(`Cannot adjust guess: ${currentProblem ? 'problem finished' : 'no problem'}`);
        return;
    }
    
    const newGuess = currentGuess + delta;
    if (newGuess >= 0 && newGuess <= 9) {
        currentGuess = newGuess;
        updateGuessDisplay();
        debugLog(`Guess adjusted to ${currentGuess}`);
    } else {
        debugLog(`Guess out of bounds: ${newGuess}`);
    }
}

function clearGuess() {
    debugLog(`Clearing guess (was ${currentGuess})`);
    currentGuess = 0;
    updateGuessDisplay();
}

function updateGuessDisplay() {
    const display = document.getElementById('currentGuessDisplay');
    if (display) {
        display.textContent = currentGuess;
        debugLog(`Updated guess display to ${currentGuess}`);
    }
}

// ============================================
// Core Game Logic
// ============================================
function commitGuess() {
    if (!currentProblem) {
        debugError('Cannot commit: No current problem');
        showFeedback('No problem loaded. Click "New Problem"', 'error');
        return;
    }
    
    if (currentProblem.finished) {
        debugLog('Cannot commit: Problem already finished');
        showFeedback('Problem already completed!', 'info');
        return;
    }
    
    const p = currentProblem;
    debugLog(`Committing guess ${currentGuess}`, {
        currentStep: p.currentStep,
        currentDigitIndex: p.currentDigitIndex,
        partial: p.partial,
        divisor: p.divisor
    });
    
    if (p.currentStep === 0) {
        debugLog('Processing quotient input');
        processQuotientInput(p);
    } else if (p.currentStep === 1) {
        debugLog('Processing subtraction');
        processSubtraction(p);
    } else if (p.currentStep === 2) {
        debugLog('Processing bring down');
        processBringDown(p);
    } else {
        debugError(`Unknown step: ${p.currentStep}`);
        showFeedback('Something went wrong. Try resetting.', 'error');
    }
}

function processQuotientInput(problem) {
    const correctDigit = Math.floor(problem.partial / problem.divisor);
    const product = currentGuess * problem.divisor;
    
    debugLog(`Quotient input processing`, {
        partial: problem.partial,
        divisor: problem.divisor,
        currentGuess,
        correctDigit,
        product,
        condition: product > problem.partial ? 'product > partial' : 'product <= partial'
    });
    
    // Validation
    if (product > problem.partial) {
        mistakeCount++;
        currentStreak = 0;
        debugLog(`Invalid: ${problem.divisor} × ${currentGuess} = ${product} > ${problem.partial}`);
        showFeedback(`Cannot multiply ${problem.divisor} × ${currentGuess} = ${product} (greater than ${problem.partial})`, 'error');
        updateScoreDisplay();
        return;
    }
    
    if (currentGuess !== correctDigit) {
        mistakeCount++;
        currentStreak = 0;
        debugLog(`Incorrect: ${problem.partial} ÷ ${problem.divisor} = ${correctDigit}, not ${currentGuess}`);
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
    
    debugLog(`Correct! Updated problem state`, {
        quotientDigits: problem.quotientDigits,
        steps: problem.steps
    });
    
    // Update grid
    updateQuotientInGrid(problem.currentDigitIndex, currentGuess);
    updateProductInGrid(problem.currentDigitIndex, product);
    
    showFeedback(`Correct! ${problem.divisor} × ${currentGuess} = ${product}`, 'success');
    
    // Move to next step
    problem.currentStep = 1;
    currentGuess = problem.partial - product;
    
    debugLog(`Moving to step 1 (subtraction). New guess for remainder: ${currentGuess}`);
    
    updateProblemDisplay();
    updateGuessDisplay();
}

function processSubtraction(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
    if (!lastStep) {
        debugError('No last step found for subtraction');
        return;
    }
    
    const expectedRemainder = lastStep.subtraction;
    
    debugLog(`Subtraction processing`, {
        partialBefore: lastStep.partialBefore,
        product: lastStep.product,
        expectedRemainder,
        currentGuess
    });
    
    if (currentGuess !== expectedRemainder) {
        mistakeCount++;
        currentStreak = 0;
        debugLog(`Incorrect subtraction: guessed ${currentGuess}, expected ${expectedRemainder}`);
        showFeedback(`Incorrect subtraction. ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'error');
        updateScoreDisplay();
        currentGuess = expectedRemainder;
        updateGuessDisplay();
        return;
    }
    
    // CORRECT - Update grid with remainder
    updateRemainderInGrid(problem.currentDigitIndex, expectedRemainder);
    
    problem.partial = expectedRemainder;
    debugLog(`Correct subtraction. New partial: ${problem.partial}`);
    
    showFeedback(`Correct! Remainder is ${expectedRemainder}`, 'success');
    
    // Move to next step
    problem.currentStep = 2;
    problem.currentDigitIndex++;
    
    debugLog(`Moving to step 2 (bring down). Current digit index: ${problem.currentDigitIndex}, n: ${problem.n}`);
    
    updateProblemDisplay();
    currentGuess = 0;
    updateGuessDisplay();
}

function processBringDown(problem) {
    debugLog(`Bring down processing`, {
        currentDigitIndex: problem.currentDigitIndex,
        n: problem.n,
        digits: problem.digits,
        partial: problem.partial
    });
    
    if (problem.currentDigitIndex >= problem.n) {
        debugLog(`No more digits to bring down. Completing problem.`);
        completeProblem(problem);
        return;
    }
    
    // Bring down next digit
    const nextDigit = problem.digits[problem.currentDigitIndex];
    problem.partial = problem.partial * 10 + nextDigit;
    
    debugLog(`Brought down ${nextDigit}. New partial: ${problem.partial}`);
    
    // Update instruction
    showFeedback(`Brought down ${nextDigit}. New number: ${problem.partial}`, 'success');
    
    // Move to next quotient step
    problem.currentStep = 0;
    
    debugLog(`Moving to step 0 (new quotient). New partial: ${problem.partial}`);
    
    updateProblemDisplay();
    currentGuess = 0;
    updateGuessDisplay();
}

function completeProblem(problem) {
    problem.finished = true;
    
    // Update final remainder in answer grid
    const finalRemainder = problem.steps[problem.steps.length - 1]?.subtraction || 0;
    if (gridCells['ans-rem']) {
        gridCells['ans-rem'].textContent = finalRemainder;
        debugLog(`Set final remainder to ${finalRemainder} in ans-rem cell`);
    }
    
    solvedCount++;
    currentStreak++;
    
    const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
    debugLog(`Problem completed! Quotient: ${quotient}, Remainder: ${finalRemainder}`);
    
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
        const cellId = quotientCellIds[digitIndex];
        const cell = gridCells[cellId];
        if (cell) {
            cell.textContent = value;
            debugLog(`Updated quotient cell ${cellId} to ${value}`);
        } else {
            debugError(`Quotient cell ${cellId} not found`);
        }
    } else {
        debugError(`Digit index ${digitIndex} out of range for quotient cells`);
    }
}

function updateProductInGrid(digitIndex, product) {
    debugLog(`Updating product in grid`, {
        digitIndex,
        product,
        productStr: String(product)
    });
    
    // Map digit index to row (0 → row 3, 1 → row 5, 2 → row 7)
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[digitIndex];
    
    if (row !== undefined) {
        // For digit index 0, pad to 1 digit; index 1 pad to 2 digits; etc.
        const padding = digitIndex + 1;
        const productStr = String(product).padStart(padding, '0');
        debugLog(`Product string: "${productStr}" (padded to length ${padding})`);
        
        // Update product cells from right to left
        // Start column is 3 for 1-digit, 2 for 2-digit, 1 for 3-digit
        const startCol = 3 - digitIndex;
        
        for (let i = 0; i < productStr.length; i++) {
            const col = startCol + i;
            if (col >= 1 && col <= 5) {  // Only update valid columns
                const cellId = `r${row}c${col}`;
                const cell = gridCells[cellId];
                if (cell) {
                    cell.textContent = productStr[i];
                    debugLog(`Set product cell ${cellId} to ${productStr[i]}`);
                } else {
                    debugError(`Product cell ${cellId} not found`);
                }
            }
        }
    } else {
        debugError(`No row mapping for digit index ${digitIndex}`);
    }
}

function updateRemainderInGrid(digitIndex, remainder) {
    debugLog(`Updating remainder in grid`, {
        digitIndex,
        remainder,
        remainderStr: String(remainder)
    });
    
    // Map digit index to row (0 → row 4, 1 → row 6, 2 → row 8)
    const rowMap = {0: 4, 1: 6, 2: 8};
    const row = rowMap[digitIndex];
    
    if (row !== undefined) {
        // For digit index 0, pad to 1 digit; index 1 pad to 2 digits; etc.
        const padding = digitIndex + 1;
        const remainderStr = String(remainder).padStart(padding, '0');
        debugLog(`Remainder string: "${remainderStr}" (padded to length ${padding})`);
        
        // Update remainder cells from right to left
        // Start column is 3 for 1-digit, 2 for 2-digit, 1 for 3-digit
        const startCol = 3 - digitIndex;
        
        for (let i = 0; i < remainderStr.length; i++) {
            const col = startCol + i;
            if (col >= 1 && col <= 5) {  // Only update valid columns
                const cellId = `r${row}c${col}`;
                const cell = gridCells[cellId];
                if (cell) {
                    cell.textContent = remainderStr[i];
                    debugLog(`Set remainder cell ${cellId} to ${remainderStr[i]}`);
                } else {
                    debugError(`Remainder cell ${cellId} not found`);
                }
            }
        }
    } else {
        debugError(`No row mapping for digit index ${digitIndex}`);
    }
}

// ============================================
// Feedback & UI Helpers
// ============================================
function showFeedback(message, type = 'error') {
    debugLog(`Showing feedback: ${type} - ${message}`);
    
    const feedbackArea = document.getElementById('workFeedback');
    if (!feedbackArea) {
        debugError('Feedback area not found');
        return;
    }
    
    const existingFeedback = feedbackArea.querySelector('.feedback-message');
    if (existingFeedback) {
        debugLog('Removing existing feedback');
        existingFeedback.remove();
    }
    
    const feedbackMsg = document.createElement('div');
    feedbackMsg.className = `feedback-message feedback-${type}`;
    feedbackMsg.textContent = message;
    feedbackArea.appendChild(feedbackMsg);
    
    setTimeout(() => {
        if (feedbackMsg.parentNode) {
            feedbackMsg.remove();
            debugLog('Auto-removed feedback message');
        }
    }, type === 'error' ? 4000 : 3000);
}

function clearFeedback() {
    debugLog('Clearing feedback');
    const feedbackMsg = document.querySelector('.feedback-message');
    if (feedbackMsg) {
        feedbackMsg.remove();
    }
}

function resetCurrentProblem() {
    if (currentProblem) {
        debugLog(`Resetting current problem: ${currentProblem.dividend} ÷ ${currentProblem.divisor}`);
        initializeDivisionState(currentProblem.dividend, currentProblem.divisor);
    } else {
        debugLog('No current problem to reset');
    }
}

// ============================================
// Score Management
// ============================================
function updateScoreDisplay() {
    debugLog(`Updating score display`, {
        solvedCount,
        mistakeCount,
        currentStreak
    });
    
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
    debugLog('Resetting all scores');
    solvedCount = 0;
    mistakeCount = 0;
    currentStreak = 0;
    updateScoreDisplay();
}
