// division.js - Using new HTML structure (Debug Version)

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
let commitButton = null;

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    debugLog('Division practice initialized');
    
    // Initialize grid cell references
    initializeGridReferences();
    
    // Add animation styles
    addAnimationStyles();
    
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
        // Answer cells (from answer-section)
        'ans-q0': document.getElementById('ans-q0'),
        'ans-q1': document.getElementById('ans-q1'),
        'ans-q2': document.getElementById('ans-q2'),
        'ans-r': document.getElementById('ans-r'),
        'ans-rem': document.getElementById('ans-rem'),
        
        // Divisor cell (from divisor-section)
        'divisor': document.getElementById('divisor'),
        
        // Work grid cells - NEW STRUCTURE: 10 rows × 5 columns (r1c1 to r10c5)
        // Row 1: Dividend
        'r1c1': document.getElementById('r1c1'),
        'r1c2': document.getElementById('r1c2'),
        'r1c3': document.getElementById('r1c3'),
        'r1c4': document.getElementById('r1c4'),
        'r1c5': document.getElementById('r1c5'),
        
        // Row 2: Step 1 Product
        'r2c1': document.getElementById('r2c1'),
        'r2c2': document.getElementById('r2c2'),
        'r2c3': document.getElementById('r2c3'),
        'r2c4': document.getElementById('r2c4'),
        'r2c5': document.getElementById('r2c5'),
        
        // Row 3: Step 1 Remainder
        'r3c1': document.getElementById('r3c1'),
        'r3c2': document.getElementById('r3c2'),
        'r3c3': document.getElementById('r3c3'),
        'r3c4': document.getElementById('r3c4'),
        'r3c5': document.getElementById('r3c5'),
        
        // Row 4: Step 2 Product
        'r4c1': document.getElementById('r4c1'),
        'r4c2': document.getElementById('r4c2'),
        'r4c3': document.getElementById('r4c3'),
        'r4c4': document.getElementById('r4c4'),
        'r4c5': document.getElementById('r4c5'),
        
        // Row 5: Step 2 Remainder
        'r5c1': document.getElementById('r5c1'),
        'r5c2': document.getElementById('r5c2'),
        'r5c3': document.getElementById('r5c3'),
        'r5c4': document.getElementById('r5c4'),
        'r5c5': document.getElementById('r5c5'),
        
        // Row 6: Step 3 Product
        'r6c1': document.getElementById('r6c1'),
        'r6c2': document.getElementById('r6c2'),
        'r6c3': document.getElementById('r6c3'),
        'r6c4': document.getElementById('r6c4'),
        'r6c5': document.getElementById('r6c5'),
        
        // Row 7: Step 3 Remainder
        'r7c1': document.getElementById('r7c1'),
        'r7c2': document.getElementById('r7c2'),
        'r7c3': document.getElementById('r7c3'),
        'r7c4': document.getElementById('r7c4'),
        'r7c5': document.getElementById('r7c5'),
        
        // Row 8: Extra (for 4-digit)
        'r8c1': document.getElementById('r8c1'),
        'r8c2': document.getElementById('r8c2'),
        'r8c3': document.getElementById('r8c3'),
        'r8c4': document.getElementById('r8c4'),
        'r8c5': document.getElementById('r8c5'),
        
        // Row 9: Extra (for 5-digit)
        'r9c1': document.getElementById('r9c1'),
        'r9c2': document.getElementById('r9c2'),
        'r9c3': document.getElementById('r9c3'),
        'r9c4': document.getElementById('r9c4'),
        'r9c5': document.getElementById('r9c5'),
        
        // Row 10: Extra (baseline)
        'r10c1': document.getElementById('r10c1'),
        'r10c2': document.getElementById('r10c2'),
        'r10c3': document.getElementById('r10c3'),
        'r10c4': document.getElementById('r10c4'),
        'r10c5': document.getElementById('r10c5')
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
    newProblemBtn.addEventListener('click', async () => {
        await generateNewProblem();
    });
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
    setupControlButtonListeners();
    updateGuessDisplay();
    commitButton = document.getElementById('commitGuessBtn');
    if (commitButton) {debugLog('Found commit button');}
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
// ANIMATION: Bring Down Next Digit (Fixed)
// ============================================
// ============================================
// FIXED: Bring Down Next Digit Animation (Correct positioning)
// ============================================
function animateBringDown(nextDigit, sourceRow, sourceCol, targetRow, targetCol) {
    debugLog(`Animating bring down of ${nextDigit} from (r${sourceRow}c${sourceCol}) to (r${targetRow}c${targetCol})`);
    
    return new Promise((resolve) => {
        // Get source and target cells first
        const sourceCell = gridCells[`r${sourceRow}c${sourceCol}`];
        const targetCell = gridCells[`r${targetRow}c${targetCol}`];
        
        if (!sourceCell || !targetCell) {
            debugError('Source or target cell not found for animation');
            resolve();
            return;
        }
        
        // Get positions relative to viewport
        const sourceRect = sourceCell.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();
        
        // Get scroll position to adjust for fixed positioning
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Create the animation element
        const animElement = document.createElement('div');
        animElement.className = 'digit-animation';
        animElement.textContent = nextDigit;
        animElement.style.cssText = `
            position: fixed;
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            background: white;
            border: 2px solid #3498db;
            border-radius: 5px;
            width: ${sourceRect.width}px;
            height: ${sourceRect.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            transition: all 0.5s ease-in-out;
            pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        
        // Calculate CENTERED positions (accounting for scroll)
        const sourceLeft = sourceRect.left + sourceRect.width/2 + scrollX;
        const sourceTop = sourceRect.top + sourceRect.height/2 + scrollY;
        const targetLeft = targetRect.left + targetRect.width/2 + scrollX;
        const targetTop = targetRect.top + targetRect.height/2 + scrollY;
        
        // Position at source (centered)
        animElement.style.left = `${sourceLeft}px`;
        animElement.style.top = `${sourceTop}px`;
        
        // Add to document body
        document.body.appendChild(animElement);
        
        // Force reflow
        void animElement.offsetWidth;
        
        // Animate to target
        requestAnimationFrame(() => {
            animElement.style.left = `${targetLeft}px`;
            animElement.style.top = `${targetTop}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            animElement.style.backgroundColor = '#e3f2fd';
            
            // When animation completes
            setTimeout(() => {
                // Add the digit to target cell
                targetCell.textContent = nextDigit;
                
                // Add visual feedback to target cell
                targetCell.classList.add('digit-highlight');
                targetCell.style.backgroundColor = '#e3f2fd';
                targetCell.style.border = '2px solid #3498db';
                
                // Remove animation element
                animElement.remove();
                
                // Remove highlight after a moment
                setTimeout(() => {
                    targetCell.classList.remove('digit-highlight');
                    targetCell.style.backgroundColor = '';
                    targetCell.style.border = '';
                    resolve();
                }, 500);
            }, 500);
        });
    });
}

// ============================================
// NEW: Generic number animation function
// ============================================
function animateNumberToCell(value, sourceElement, targetCellId) {
    return new Promise((resolve) => {
        // Get source and target positions
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetCell = gridCells[targetCellId];
        
        if (!targetCell) {
            debugError(`Target cell ${targetCellId} not found`);
            resolve();
            return;
        }
        
        const targetRect = targetCell.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Create animation element
        const animElement = document.createElement('div');
        animElement.className = 'digit-animation';
        animElement.textContent = value;
        animElement.style.cssText = `
            position: fixed;
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
            background: white;
            border: 2px solid #e74c3c;
            border-radius: 5px;
            width: ${sourceRect.width}px;
            height: ${sourceRect.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            transition: all 0.5s ease-in-out;
            pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        
        // Calculate positions
        const sourceLeft = sourceRect.left + sourceRect.width/2 + scrollX;
        const sourceTop = sourceRect.top + sourceRect.height/2 + scrollY;
        const targetLeft = targetRect.left + targetRect.width/2 + scrollX;
        const targetTop = targetRect.top + targetRect.height/2 + scrollY;
        
        // Start position
        animElement.style.left = `${sourceLeft}px`;
        animElement.style.top = `${sourceTop}px`;
        
        document.body.appendChild(animElement);
        void animElement.offsetWidth; // Force reflow
        
        // Animate to target
        requestAnimationFrame(() => {
            animElement.style.left = `${targetLeft}px`;
            animElement.style.top = `${targetTop}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            animElement.style.backgroundColor = '#ffeaa7';
            
            setTimeout(() => {
                // Set the value in target cell
                targetCell.textContent = value;
                
                // Visual feedback
                targetCell.classList.add('digit-highlight');
                
                // Clean up
                animElement.remove();
                
                setTimeout(() => {
                    targetCell.classList.remove('digit-highlight');
                    resolve();
                }, 300);
            }, 500);
        });
    });
}

async function animateFromEquationToGrid() {
    const equation = document.querySelector('.large-equation');
    const text = equation.textContent;
    
    // Extract numbers from "425 ÷ 2"
    const [dividend, divisor] = text.split(' ÷ ').map(num => parseInt(num));
    const digits = String(dividend).split('');
    
    debugLog(`Animating numbers from equation to grid: ${dividend} ÷ ${divisor}`);
    
    // Animate divisor (2) to divisor cell
    await animateNumberToCell(divisor, equation, 'divisor');
    
    // Animate each dividend digit to dividend row
    for (let i = 0; i < digits.length; i++) {
        await animateNumberToCell(digits[i], equation, `r1c${i+1}`);
    }
}

// ============================================
// NEW: Animation to focus on current step
// ============================================
async function animateFocusOnCurrentStep() {
    return new Promise((resolve) => {
        const currentStepBox = document.querySelector('.current-step-container');
        if (!currentStepBox) {
            resolve();
            return;
        }
        
        // Highlight the current step box
        currentStepBox.style.transition = 'all 0.5s ease';
        currentStepBox.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.5)';
        currentStepBox.style.transform = 'scale(1.05)';
        currentStepBox.style.backgroundColor = '#e3f2fd';
        
        // Also highlight the relevant grid cells
        const p = currentProblem;
        if (p && p.currentStep === 0) {
            // For first step, highlight the first dividend digit and divisor
            if (gridCells['r1c1']) {
                gridCells['r1c1'].classList.add('digit-highlight');
            }
            if (gridCells['divisor']) {
                gridCells['divisor'].classList.add('digit-highlight');
            }
        }
        
        // Remove highlight after animation
        setTimeout(() => {
            currentStepBox.style.boxShadow = '';
            currentStepBox.style.transform = '';
            currentStepBox.style.backgroundColor = '';
            
            if (gridCells['r1c1']) gridCells['r1c1'].classList.remove('digit-highlight');
            if (gridCells['divisor']) gridCells['divisor'].classList.remove('digit-highlight');
            
            resolve();
        }, 1500);
    });
}

// ============================================
// NEW: Arrow pointing animation
// ============================================
function createFocusArrow(fromElement, toElement) {
    return new Promise((resolve) => {
        const arrow = document.createElement('div');
        arrow.className = 'focus-arrow';
        
        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate arrow path (simple line for now)
        const fromX = fromRect.left + fromRect.width / 2 + scrollX;
        const fromY = fromRect.top + fromRect.height / 2 + scrollY;
        const toX = toRect.left + toRect.width / 2 + scrollX;
        const toY = toRect.top + toRect.height / 2 + scrollY;
        
        // Calculate angle and distance
        const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
        const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        
        arrow.style.cssText = `
            position: fixed;
            width: ${distance}px;
            height: 8px;
            background: linear-gradient(90deg, rgba(52, 152, 219, 0.8), rgba(41, 128, 185, 0.8));
            border-radius: 4px;
            z-index: 9999;
            pointer-events: none;
            transform-origin: 0 50%;
            left: ${fromX}px;
            top: ${fromY - 4}px;
            transform: rotate(${angle}deg);
            animation: arrowPulse 1s infinite;
        `;
        
        document.body.appendChild(arrow);
        
        // Remove after animation
        setTimeout(() => {
            arrow.remove();
            resolve();
        }, 2000);
    });
}

// ============================================
// Update addAnimationStyles() to include arrow styles
// ============================================
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* ... existing styles ... */
        
        @keyframes arrowPulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
        
        .focus-arrow::after {
            content: '';
            position: absolute;
            right: -10px;
            top: -6px;
            width: 0;
            height: 0;
            border-left: 20px solid rgba(52, 152, 219, 0.8);
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
        }
        
        .current-step-highlight {
            animation: pulseHighlight 2s ease-in-out;
            background-color: #e3f2fd !important;
            border: 3px solid #3498db !important;
        }
        
        @keyframes pulseHighlight {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(52, 152, 219, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// Problem Generation
// ============================================
async function generateNewProblem() {
    debugLog('Generating new problem');
    
    let divisor = Math.floor(Math.random() * 15) + 1;
    let dividend;
    
    do {
        dividend = Math.floor(Math.random() * 999) + 1;
    } while (dividend <= divisor);
    
    debugLog(`Generated problem: ${dividend} ÷ ${divisor}`);
    
    await initializeDivisionState(dividend, divisor); // Add await here
}

async function initializeDivisionState(dividend, divisor) {
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
        partial: digits[0],       // Current working number (first digit)
        quotientDigits: [],       // Quotient digits found so far
        steps: [],                // Steps taken
        finished: false,
        
        // Grid display state
        visibleRows: 2 * n + 1    // Number of rows to show (2n+1)
    };
    
    debugLog('Current problem state initialized', currentProblem);

    updateProblemDisplay();  // This sets .large-equation to "149 ÷ 2"

    await animateFromEquationToGrid();
    
    // ✅ NEW: Focus animation to show where to look next
    await animateFocusOnCurrentStep();

    // Update UI
    currentGuess = 0;
    updateGuessDisplay();
    clearFeedback();
    
    // Show/hide rows based on n
    updateVisibleRows(n);
    restoreCommitButton();
}

// ============================================
// Grid Management (using new HTML structure)
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
    // Note: We have 10 rows (r1 to r10) and 5 columns (c1 to c5)
    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                // Reset to empty
                cell.textContent = '';
                cell.classList.remove('hidden');
                debugLog(`Reset cell ${cellId} to ""`);
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
    
    // Update the dividend row (row 1 - NEW STRUCTURE)
    for (let i = 0; i < 5; i++) {
        const cellId = `r1c${i + 1}`; // Note: r1c1, r1c2, r1c3, etc.
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
    // We have 10 rows total in our work grid (r1 to r10)
    // But we need to account for the fact that row 1 is the dividend
    // So visible rows should start from row 2 for work area
    for (let row = 1; row <= 10; row++) {
        const shouldShow = row <= (visibleRows + 1); // +1 because row 1 is dividend
        
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                // Only hide/show rows 2 and above (row 1 is always shown as dividend)
                if (row >= 2) {
                    cell.style.display = shouldShow ? 'flex' : 'none';
                }
                if (DEBUG && row <= 8) {
                    debugLog(`${shouldShow ? 'Showing' : 'Hiding'} cell ${cellId}`);
                }
            }
        }
    }
}

// ============================================
// UPDATED: Problem Display - Better bring down instruction
// ============================================
// ============================================
// UPDATED: Problem Display - Better bring down instruction (FIXED)
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
    } else {
        // Show current step
        switch (p.currentStep) {
            case 0:
                currentStep = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `Find the largest multiple of ${divisor} without going over ${p.partial}`;
                break;
            case 1:
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                    instruction = `What is ${lastStep.partialBefore} minus ${lastStep.product}`;
                }
                break;
            case 2:
                if (p.currentDigitIndex >= p.n - 1) {
                    currentStep = "Complete the problem";
                    instruction = "No more digits to bring down";
                } else {
                    const nextDigit = p.digits[p.currentDigitIndex + 1]; // Get the NEXT digit
                    currentStep = `Bring down ${nextDigit}`;
                    instruction = `Click "Bring Down" button to bring down ${nextDigit}`;
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
// Add CSS for animations
// ============================================
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes digitPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .digit-highlight {
            animation: digitPulse 0.5s ease-in-out;
            background-color: #e3f2fd !important;
            border: 2px solid #3498db !important;
        }
        
        .bring-down-button {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 10px auto;
            box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
            transition: all 0.3s ease;
        }
        
        .bring-down-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
        }
        
        .bring-down-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .bring-down-icon {
            font-size: 24px;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        
        .digit-animation {
            position: absolute !important;
            z-index: 1000 !important;
        }
    `;
    document.head.appendChild(style);
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
    if (newGuess >= 0 && newGuess <= 99) {
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
// UPDATED: Commit Guess (Restored original logic)
// ============================================
async function commitGuess() {
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
        currentStep: p.currentStep
    });
    
    if (p.currentStep === 0) {
        debugLog('Processing quotient input');
        await processQuotientInput(p);
    } else if (p.currentStep === 1) {
        debugLog('Processing subtraction');
        await processSubtraction(p);
    } else if (p.currentStep === 2) {
        // Button should already be "Bring Down X" at this point
        debugLog('In bring down phase - button should handle this');
        // Don't do anything - let the transformed button handle it
    }
}

// ============================================
// Core Game Logic - Clean version
// ============================================

async function processQuotientInput(problem) {
    const correctDigit = Math.floor(problem.partial / problem.divisor);
    const correctProduct = correctDigit * problem.divisor;
    
    debugLog(`Quotient: ${currentGuess} vs ${correctProduct}`);
    restoreCommitButton();

    // Validation checks
    if (currentGuess % problem.divisor !== 0) {
        mistakeCount++;
        currentStreak = 0;
        await showFeedback(`${currentGuess} is not a multiple of ${problem.divisor}`, 'error');
        updateScoreDisplay();
        return;
    }
    
    if (currentGuess > problem.partial) {
        mistakeCount++;
        currentStreak = 0;
        await showFeedback(`Cannot use ${currentGuess} (greater than ${problem.partial})`, 'error');
        updateScoreDisplay();
        return;
    }
    
    if (currentGuess !== correctProduct) {
        mistakeCount++;
        currentStreak = 0;
        await showFeedback(`Incorrect.`, 'error');
        updateScoreDisplay();
        return;
    }

    // Correct answer
    const quotientDigit = currentGuess / problem.divisor;
    const stepNumber = problem.quotientDigits.length;
    
    problem.quotientDigits.push(quotientDigit);
    problem.steps.push({
        stepNumber: stepNumber,
        digit: quotientDigit,
        partialBefore: problem.partial,
        product: currentGuess,
        subtraction: problem.partial - currentGuess,
        digitIndex: problem.currentDigitIndex
    });
    
    updateQuotientInGrid(stepNumber, quotientDigit);
    updateProductInGrid(stepNumber, currentGuess);
    await showFeedback(`✓ ${quotientDigit} × ${problem.divisor} = ${currentGuess}`, 'success');
    
    problem.currentStep = 1;
    currentGuess = 0;
    
    debugLog(`→ Moving to subtraction step ${stepNumber}`);
    updateProblemDisplay();
    updateGuessDisplay();
}

async function processSubtraction(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
    if (!lastStep) return;
    
    const expectedRemainder = lastStep.subtraction;
    const stepNumber = lastStep.stepNumber;
    
    debugLog(`Subtract: ${currentGuess} vs ${expectedRemainder}`);
    restoreCommitButton();

    if (currentGuess !== expectedRemainder) {
        mistakeCount++;
        currentStreak = 0;
        await showFeedback(`✗ ${lastStep.partialBefore} - ${lastStep.product} ≠ ${currentGuess}`, 'error');
        updateScoreDisplay();
        return;
    }
    
    updateRemainderInGrid(stepNumber, expectedRemainder);
    problem.partial = expectedRemainder;
    await showFeedback(`✓ ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'success');
    
    problem.currentStep = 2;
    currentGuess = 0;
    
    // Check if we should immediately transform to bring down
    if (problem.currentDigitIndex < problem.n - 1) {
        const nextDigit = problem.digits[problem.currentDigitIndex + 1];
        transformToBringDownButton(nextDigit);
        await showFeedback(`Bring down ${nextDigit}`, 'info');
    } else {
        await completeProblem(problem);
    }
    
    updateProblemDisplay();
    updateGuessDisplay();
}

// ============================================
// UPDATED: Process Bring Down with User Action (Fixed)
// ============================================
function processBringDown(problem) {
    debugLog(`Bring down processing`, {
        currentDigitIndex: problem.currentDigitIndex,
        n: problem.n
    });
    
    // This function shouldn't transform the button anymore
    // It should only handle if somehow we got here with button not transformed
    if (problem.currentDigitIndex >= problem.n - 1) {
        debugLog(`No more digits to bring down. Completing problem.`);
        completeProblem(problem);
        return;
    }
    
    // Button should already be transformed at this point
    // Just make sure instruction is clear
    const nextDigit = problem.digits[problem.currentDigitIndex + 1];
    
    // Double-check button is transformed
    if (commitButton && !commitButton.innerHTML.includes('Bring Down')) {
        debugLog(`Button not transformed, transforming now`);
        transformToBringDownButton(nextDigit);
    }
    
    // Update instruction
    showFeedback(`Click "Bring Down ${nextDigit}" to continue`, 'info');
    updateProblemDisplay();
}

async function executeBringDown(problem, nextDigit) {
    debugLog(`Executing bring down for digit ${nextDigit}`, {
        currentDigitIndex: problem.currentDigitIndex,
        n: problem.n,
        partialBefore: problem.partial,
        nextDigit: nextDigit
    });
    
    // CRITICAL CHECK: Make sure we haven't already brought down all digits
    if (problem.currentDigitIndex >= problem.n - 1) {
        debugLog(`No more digits to bring down. Should complete problem.`);
        await completeProblem(problem);
        return;
    }
    
    // CRITICAL CHECK: Ensure we're in the right state for bring down
    if (problem.currentStep !== 2) {
        debugLog(`Not in bring down state (currentStep=${problem.currentStep}). Ignoring.`);
        return;
    }
    
    // CRITICAL CHECK: Make sure nextDigit matches the expected digit
    const expectedDigit = problem.digits[problem.currentDigitIndex + 1];
    if (nextDigit !== expectedDigit) {
        debugLog(`Digit mismatch: expected ${expectedDigit}, got ${nextDigit}. Ignoring.`);
        return;
    }
    
    // Remove the bring down button (if it exists separately)
    hideBringDownButton();
    
    // Update the partial
    problem.partial = problem.partial * 10 + nextDigit;
    
    debugLog(`Brought down ${nextDigit}. New partial: ${problem.partial}`);
    
    // Get the current step number
    const stepNumber = problem.steps.length - 1;
    
    // Update the grid with the brought down digit
    await updateBringDownInGrid(stepNumber, nextDigit);
    
    // Show success feedback
    await showFeedback(`✓ Brought down ${nextDigit}. New number: ${problem.partial}`, 'success');
    
    // Move to next quotient step
    problem.currentStep = 0;
    problem.currentDigitIndex++;
    currentGuess = 0;
    
    // Check if there are more digits to bring down
    if (problem.currentDigitIndex >= problem.n - 1) {
        // No more digits to bring down after this one
        debugLog(`No more digits after this. Next step should be final quotient.`);
    }
    
    // RESTORE the commit button to its original state
    restoreCommitButton();
    
    debugLog(`Moving to step 0 (new quotient). New partial: ${problem.partial}, next digit index: ${problem.currentDigitIndex}`);
    
    updateProblemDisplay();
    updateGuessDisplay();
}


// ============================================
// Bring Down Button UI (Fixed)
// ============================================
function showBringDownButton(nextDigit, onClick) {
    // Remove any existing bring down button
    hideBringDownButton();
    
    // Create the bring down button
    const bringDownBtn = document.createElement('button');
    bringDownBtn.id = 'bringDownBtn';
    bringDownBtn.className = 'bring-down-button';
    bringDownBtn.innerHTML = `
        <span class="bring-down-icon">↓</span>
        <span class="bring-down-text">Bring Down ${nextDigit}</span>
    `;
    
    bringDownBtn.style.cssText = `
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 10px auto;
        box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
        transition: all 0.3s ease;
    `;
    
    bringDownBtn.onmouseover = () => {
        bringDownBtn.style.transform = 'translateY(-2px)';
        bringDownBtn.style.boxShadow = '0 6px 8px rgba(52, 152, 219, 0.4)';
    };
    
    bringDownBtn.onmouseout = () => {
        bringDownBtn.style.transform = 'translateY(0)';
        bringDownBtn.style.boxShadow = '0 4px 6px rgba(52, 152, 219, 0.3)';
    };
    
    bringDownBtn.onclick = () => {
        bringDownBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        bringDownBtn.disabled = true;
        onClick();
    };
    
    // Add to the work feedback area
    const feedbackArea = document.getElementById('workFeedback');
    if (feedbackArea) {
        feedbackArea.appendChild(bringDownBtn);
    }
}

function hideBringDownButton() {
    const existingBtn = document.getElementById('bringDownBtn');
    if (existingBtn) {
        existingBtn.remove();
    }
}

// ============================================
// Button Transformation Functions
// ============================================
function transformToBringDownButton(nextDigit) {
    if (!commitButton) return;
    
    debugLog(`Transforming commit button to "Bring Down ${nextDigit}"`);
    
    // CRITICAL: Disable the button immediately to prevent double clicks
    commitButton.disabled = true;
    
    // Save original state
    if (!commitButton.originalHTML) {
        commitButton.originalHTML = commitButton.innerHTML;
        commitButton.originalOnClick = commitButton.onclick;
    }
    
    // Transform the button
    commitButton.innerHTML = `
        <span class="bring-down-icon">↓</span>
        <span class="bring-down-text">Bring Down ${nextDigit}</span>
    `;
    
    // Update styles for bring down button
    commitButton.style.cssText = `
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 10px auto;
        box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);
        transition: all 0.3s ease;
        width: 100%;
    `;
    
    // Re-enable after a short delay to prevent immediate double-click
    setTimeout(() => {
        commitButton.disabled = false;
    }, 300);
    
    // Create a new click handler that prevents multiple executions
    const handleBringDownClick = () => {
        // Disable button immediately on click
        commitButton.disabled = true;
        commitButton.style.opacity = '0.7';
        commitButton.style.cursor = 'not-allowed';
        
        // Execute the bring down
        executeBringDown(currentProblem, nextDigit);
    };
    
    // Replace the onclick
    commitButton.onclick = handleBringDownClick;
    
    // Remove hover effects since we're managing state
    commitButton.onmouseover = null;
    commitButton.onmouseout = null;
    
    // Show the button if it was hidden
    commitButton.style.display = 'flex';
}

function restoreCommitButton() {
    if (!commitButton || !commitButton.originalHTML) return;
    
    debugLog('Restoring commit button to original state');
    
    // Re-enable the button
    commitButton.disabled = false;
    commitButton.style.opacity = '';
    commitButton.style.cursor = '';
    
    // Restore original content and click handler
    commitButton.innerHTML = commitButton.originalHTML;
    commitButton.onclick = commitButton.originalOnClick;
    
    // Restore original styles (from your CSS)
    commitButton.style.cssText = `
        width: 100%;
        padding: 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.2em;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Remove saved state
    delete commitButton.originalHTML;
    delete commitButton.originalOnClick;
}

// ============================================
// UPDATED: Grid Update Helpers with Animation
// ============================================

function updateBringDownInGrid(stepNumber, nextDigit) {
    debugLog(`Updating bring down in grid for step ${stepNumber}`, {
        stepNumber,
        nextDigit
    });
    
    // Row mapping: remainder from step 0 -> row 3, step 1 -> row 5, step 2 -> row 7
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        // Find where the remainder digits end in this row
        let rightmostCol = 0;
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell && cell.textContent !== '') {
                rightmostCol = col;
            }
        }
        
        // The brought-down digit goes in the NEXT column after the rightmost digit
        const targetCol = rightmostCol + 1;
        const cellId = `r${row}c${targetCol}`;
        const targetCell = gridCells[cellId];
        
        if (targetCell) {
            // CRITICAL: Only animate if the target cell is empty
            if (targetCell.textContent !== '') {
                debugLog(`Target cell ${cellId} already has value: ${targetCell.textContent}. Skipping animation.`);
                return Promise.resolve();
            }
            
            // Find which column in the dividend row has this digit
            // For 3-digit dividend: step 0 brings down digit 2 (col 2), step 1 brings down digit 3 (col 3)
            const sourceCol = stepNumber + 2; // Adjust based on your layout
            
            // Use the corrected animation function and return the promise
            return animateBringDown(nextDigit, 1, sourceCol, row, targetCol).then(() => {
                targetCell.textContent = nextDigit;
                debugLog(`Appended brought down digit ${nextDigit} to ${cellId} via animation`);
            });
        }
    }
    return Promise.resolve();
}

async function completeProblem(problem) {
    problem.finished = true;
    
    // Update final remainder in answer grid
    const finalRemainder = problem.partial;
    if (gridCells['ans-rem']) {
        gridCells['ans-rem'].textContent = finalRemainder;
        debugLog(`Set final remainder to ${finalRemainder} in ans-rem cell`);
    }
    
    solvedCount++;
    currentStreak++;
    
    const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
    debugLog(`Problem completed! Quotient: ${quotient}, Remainder: ${finalRemainder}`);
    
    await showFeedback(`🎉 Complete! ${problem.dividend} ÷ ${problem.divisor} = ${quotient} R ${finalRemainder}`, 'success');
    
    updateScoreDisplay();
    updateProblemDisplay();
}

// ============================================
// Grid Update Helpers - UPDATED FOR NEW STRUCTURE
// ============================================
function updateQuotientInGrid(stepNumber, value) {
    const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
    if (stepNumber < quotientCellIds.length) {
        const cellId = quotientCellIds[stepNumber];
        const cell = gridCells[cellId];
        if (cell) {
            cell.textContent = value;
            debugLog(`Updated quotient cell ${cellId} to ${value}`);
        } else {
            debugError(`Quotient cell ${cellId} not found`);
        }
    } else {
        debugError(`Step number ${stepNumber} out of range for quotient cells`);
    }
}

function updateProductInGrid(stepNumber, product) {
    debugLog(`Updating product in grid`, {
        stepNumber,
        product
    });
    
    // Row mapping: step 0 -> row 2, step 1 -> row 4, step 2 -> row 6
    const rowMap = {0: 2, 1: 4, 2: 6};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        const productStr = String(product);
        
        // Clear the row first
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = '';
            }
        }
        
        // Determine which columns we're working with
        // For step 0: working with column 1 only (first digit)
        // For step 1: working with columns 1-2 (first two digits)
        // For step 2: working with columns 1-3 (all three digits)
        const startCol = 1;
        const workingColumns = stepNumber + 1; // 1, 2, or 3
        
        // Right-align within the working columns
        const productLength = productStr.length;
        
        for (let i = 0; i < productLength; i++) {
            const col = startCol + (workingColumns - productLength) + i;
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = productStr[i];
                debugLog(`Set product cell ${cellId} to ${productStr[i]} (step ${stepNumber}, right-aligned in ${workingColumns} columns)`);
            }
        }
    }
}


function updateRemainderInGrid(stepNumber, remainder) {
    debugLog(`Updating remainder in grid`, {
        stepNumber,
        remainder
    });
    
    // Row mapping: step 0 -> row 3, step 1 -> row 5, step 2 -> row 7
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        const remainderStr = String(remainder);
        
        // Clear the row first
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = '';
            }
        }
        
        // Determine which columns we're working with
        const startCol = 1;
        const workingColumns = stepNumber + 1; // 1, 2, or 3
        
        // Right-align within the working columns
        const remainderLength = remainderStr.length;
        
        for (let i = 0; i < remainderLength; i++) {
            const col = startCol + (workingColumns - remainderLength) + i;
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = remainderStr[i];
                debugLog(`Set remainder cell ${cellId} to ${remainderStr[i]} (step ${stepNumber}, right-aligned in ${workingColumns} columns)`);
            }
        }
    }
}

// ============================================
// Feedback & UI Helpers
// ============================================
function showFeedback(message, type = 'error') {
    debugLog(`Showing feedback: ${type} - ${message}`);
    
    // Get the number display element
    const numberDisplay = document.querySelector('.number-display');
    if (!numberDisplay) {
        debugError('Number display not found');
        return;
    }
    
    // Save original content if not already saved
    if (!numberDisplay.originalHTML) {
        numberDisplay.originalHTML = numberDisplay.innerHTML;
    }
    
    // Show feedback in the number display area
    numberDisplay.innerHTML = `<div class="feedback-${type}">${message}</div>`;
    numberDisplay.classList.add('showing-feedback');
    
    // Determine delay based on message type
    const delay = type === 'error' ? 4000 : 2000; // 4s for errors, 2s for success/info
    
    // Return a promise that resolves after the delay
    return new Promise(resolve => {
        setTimeout(() => {
            if (numberDisplay.originalHTML) {
                numberDisplay.innerHTML = numberDisplay.originalHTML;
                numberDisplay.classList.remove('showing-feedback');
            }
            resolve();
        }, delay);
    });
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
