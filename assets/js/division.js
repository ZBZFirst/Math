// ============================================================================
// Z = +3: CONFIGURATION & CONSTANTS LAYER
// (Global settings that never change)
// ============================================================================
const DEBUG = true; // Set to false to disable debug logs
const MAX_DIVIDEND = 999;
const MIN_DIVIDEND = 1;
const MAX_DIVISOR = 15;
const MIN_DIVISOR = 1;

// ============================================================================
// Z = +2: UTILITY & HELPER LAYER  
// (Pure functions with no side effects)
// ============================================================================

// Z+2.1: DEBUG CLASS - Consolidated debug functionality
class Debug {
    constructor(enabled) {
        this.enabled = enabled;
    }
    
    log(message, data = null) {
        if (!this.enabled) return;
        if (data) {
            console.log(`[DEBUG] ${message}:`, data);
        } else {
            console.log(`[DEBUG] ${message}`);
        }
    }
    
    error(message, error = null) {
        if (!this.enabled) return;
        console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
    
    warn(message, data = null) {
        if (!this.enabled) return;
        console.warn(`[DEBUG WARN] ${message}`, data || '');
    }
    
    info(message, data = null) {
        if (!this.enabled) return;
        console.info(`[DEBUG INFO] ${message}`, data || '');
    }
}

const debug = new Debug(DEBUG);

// Z+2.2: Math Utilities (Pure functions extracted from your logic)
function calculateQuotientDigit(partial, divisor) {
    return Math.floor(partial / divisor);
}

function calculateProduct(quotientDigit, divisor) {
    return quotientDigit * divisor;
}

function calculateRemainder(partial, product) {
    return partial - product;
}

function shouldBringDownNextDigit(currentDigitIndex, totalDigits) {
    return currentDigitIndex < totalDigits - 1;
}

function getNextPartial(currentPartial, nextDigit) {
    return currentPartial * 10 + nextDigit;
}

// ============================================================================
// Z = +1: DOM ELEMENT REFERENCES LAYER
// (All DOM element caching - NO logic here)
// ============================================================================

// Z+1.1: Primary UI Elements (KEEPING ALL YOUR REFERENCES)
const DOMReferences = {
    // Display elements
    problemDisplay: document.getElementById('problemdisplay'),
    workStageContainer: document.getElementById('workStageContainer'),
    workFeedback: document.getElementById('workFeedback'),
    
    // Control buttons
    newProblemBtn: document.getElementById('newDivisionProblem'),
    resetProblemBtn: document.getElementById('resetCurrentProblem'),
    resetScoresBtn: document.getElementById('resetDivisionScores'),
    
    // Score display elements
    solvedCountEl: document.getElementById('solvedCount'),
    mistakeCountEl: document.getElementById('mistakeCount'),
    divisionAccuracyEl: document.getElementById('divisionAccuracy'),
    currentStreakEl: document.getElementById('currentStreak'),
    
    // Guess controls
    clearGuessBtn: document.getElementById('clearGuess'),
    commitGuessBtn: document.getElementById('commitGuessBtn'),
    guessDisplay: document.getElementById('currentGuessDisplay')
};

// Z+1.2: Grid Cell References (KEEPING ALL 50+ EXPLICIT MAPPINGS)
let gridCells = {};
let answerCells = {};

function initializeGridReferences() {
    debug.log('Initializing grid cell references');
    
    // KEEPING YOUR EXACT MAPPING STRUCTURE
    gridCells = {
        // Answer cells (from answer-section) - KEEPING ALL
        'ans-q0': document.getElementById('ans-q0'),
        'ans-q1': document.getElementById('ans-q1'),
        'ans-q2': document.getElementById('ans-q2'),
        'ans-r': document.getElementById('ans-r'),
        'ans-rem': document.getElementById('ans-rem'),
        
        // Divisor cell (from divisor-section)
        'divisor': document.getElementById('divisor'),
        
        // Work grid cells - KEEPING ALL 50 CELLS EXPLICITLY
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
    
    // Log which cells were found (KEEPING YOUR DEBUG LOGIC)
    const foundCells = Object.keys(gridCells).filter(key => gridCells[key]);
    debug.log(`Found ${foundCells.length} grid cells`, foundCells);
    
    // Store answer cells separately for easy access (KEEPING YOUR STRUCTURE)
    answerCells = {
        'q0': gridCells['ans-q0'],
        'q1': gridCells['ans-q1'],
        'q2': gridCells['ans-q2'],
        'rem': gridCells['ans-rem']
    };
    
    debug.log('Grid cell references initialized');
}

// ============================================================================
// Z = 0: STATE MANAGEMENT LAYER
// (All application state - KEEPING ALL YOUR VARIABLES)
// ============================================================================

// Z0.1: Global Application State (KEEPING ALL YOUR VARIABLES)
let currentProblem = null;
let currentGuess = 0;
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;
let commitButton = null;

// Z0.2: State Management Functions (KEEPING ALL LOGIC)
function updateScoreDisplay() {
    debug.log(`Updating score display`, {
        solvedCount,
        mistakeCount,
        currentStreak
    });
    
    DOMReferences.solvedCountEl.textContent = solvedCount;
    DOMReferences.mistakeCountEl.textContent = mistakeCount;
    DOMReferences.currentStreakEl.textContent = currentStreak;
    
    const total = solvedCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    DOMReferences.divisionAccuracyEl.textContent = accuracy + '%';
    
    // Save to localStorage (KEEPING YOUR PERSISTENCE)
    localStorage.setItem('divisionSolvedCount', solvedCount);
    localStorage.setItem('divisionMistakeCount', mistakeCount);
    localStorage.setItem('divisionCurrentStreak', currentStreak);
}

function resetAllScores() {
    debug.log('Resetting all scores');
    solvedCount = 0;
    mistakeCount = 0;
    currentStreak = 0;
    updateScoreDisplay();
}

// ============================================================================
// Z = -1: CORE BUSINESS LOGIC LAYER
// (Division algorithm and game rules - KEEPING ALL YOUR LOGIC)
// ============================================================================

// Z-1.1: Problem Generation (KEEPING YOUR EXACT LOGIC)
async function generateNewProblem() {
    debug.log('Generating new problem');
    
    let divisor = Math.floor(Math.random() * MAX_DIVISOR) + MIN_DIVISOR;
    let dividend;
    
    do {
        dividend = Math.floor(Math.random() * MAX_DIVIDEND) + MIN_DIVIDEND;
    } while (dividend <= divisor);
    
    debug.log(`Generated problem: ${dividend} ÷ ${divisor}`);
    
    await initializeDivisionState(dividend, divisor);
}

// Z-1.2: Division State Initialization (KEEPING ALL YOUR LOGIC)
async function initializeDivisionState(dividend, divisor) {
    const digits = String(dividend).split('').map(Number);
    const n = digits.length;
    
    debug.log(`Initializing division state`, {
        dividend,
        divisor,
        digits,
        n,
        currentGuess
    });
    
    // Reset grid to initial state
    resetGrid();
    
    // KEEPING YOUR EXACT currentProblem STRUCTURE
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
    
    debug.log('Current problem state initialized', currentProblem);

    updateProblemDisplay();
    await animateFromEquationToGrid();
    await animateFocusOnCurrentStep();

    // Update UI
    currentGuess = 0;
    updateGuessDisplay();
    clearFeedback();
    
    // Show/hide rows based on n
    updateVisibleRows(n);
    restoreCommitButton();
}

// ============================================================================
// Z = -2: GRID MANAGEMENT LAYER
// (All grid manipulation - KEEPING ALL YOUR GRID LOGIC)
// ============================================================================

// Z-2.1: Grid Reset (KEEPING ALL YOUR LOGIC)
function resetGrid() {
    debug.log('Resetting grid to initial state');
    
    // Clear all answer cells (KEEPING YOUR EXACT LOGIC)
    for (let key in answerCells) {
        if (answerCells[key]) {
            answerCells[key].textContent = '?';
            debug.log(`Reset answer cell ${key} to ?`);
        }
    }
    if (gridCells['ans-rem']) {
        gridCells['ans-rem'].textContent = '?';
        debug.log('Reset remainder cell to ?');
    }
    
    // Clear all work grid cells (KEEPING YOUR EXACT LOOPS)
    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                // Reset to empty
                cell.textContent = '';
                cell.classList.remove('hidden');
                debug.log(`Reset cell ${cellId} to ""`);
            }
        }
    }
    
    // Hide the divisor cell initially (KEEPING YOUR LOGIC)
    if (gridCells['divisor']) {
        gridCells['divisor'].textContent = '?';
    }
}

// Z-2.2: Grid Update Functions (KEEPING ALL YOUR LOGIC)
function updateDivisor(divisor) {
    if (gridCells['divisor']) {
        gridCells['divisor'].textContent = divisor;
        debug.log(`Updated divisor cell to ${divisor}`);
    }
}

function updateDividend(digits) {
    debug.log(`Updating dividend cells with digits: ${digits}`);
    
    // Update the dividend row (KEEPING YOUR EXACT LOGIC)
    for (let i = 0; i < 5; i++) {
        const cellId = `r1c${i + 1}`;
        const cell = gridCells[cellId];
        if (cell) {
            if (i < digits.length) {
                cell.textContent = digits[i];
                cell.style.display = 'flex';
                debug.log(`Set dividend cell ${cellId} to ${digits[i]}`);
            } else {
                cell.textContent = '';
                cell.style.display = 'none';
                debug.log(`Hid dividend cell ${cellId}`);
            }
        }
    }
}

function updateVisibleRows(n) {
    const visibleRows = 2 * n + 1;
    debug.log(`Showing ${visibleRows} rows for n=${n} (2n+1)`);
    
    // Show/hide rows based on n (KEEPING YOUR EXACT LOGIC)
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
                    debug.log(`${shouldShow ? 'Showing' : 'Hiding'} cell ${cellId}`);
                }
            }
        }
    }
}

// Z-2.3: Grid Cell Updates (KEEPING ALL YOUR DETAILED LOGIC)
function updateQuotientInGrid(stepNumber, value) {
    const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
    if (stepNumber < quotientCellIds.length) {
        const cellId = quotientCellIds[stepNumber];
        const cell = gridCells[cellId];
        if (cell) {
            cell.textContent = value;
            debug.log(`Updated quotient cell ${cellId} to ${value}`);
        } else {
            debug.error(`Quotient cell ${cellId} not found`);
        }
    } else {
        debug.error(`Step number ${stepNumber} out of range for quotient cells`);
    }
}

function updateProductInGrid(stepNumber, product) {
    debug.log(`Updating product in grid`, {
        stepNumber,
        product
    });
    
    // Row mapping: step 0 -> row 2, step 1 -> row 4, step 2 -> row 6
    const rowMap = {0: 2, 1: 4, 2: 6};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        const productStr = String(product);
        
        // Clear the row first (KEEPING YOUR LOGIC)
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = '';
            }
        }
        
        // Determine which columns we're working with (KEEPING YOUR LOGIC)
        const startCol = 1;
        const workingColumns = stepNumber + 1; // 1, 2, or 3
        
        // Right-align within the working columns (KEEPING YOUR LOGIC)
        const productLength = productStr.length;
        
        for (let i = 0; i < productLength; i++) {
            const col = startCol + (workingColumns - productLength) + i;
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = productStr[i];
                debug.log(`Set product cell ${cellId} to ${productStr[i]} (step ${stepNumber}, right-aligned in ${workingColumns} columns)`);
            }
        }
    }
}

function updateRemainderInGrid(stepNumber, remainder) {
    debug.log(`Updating remainder in grid`, {
        stepNumber,
        remainder
    });
    
    // Row mapping: step 0 -> row 3, step 1 -> row 5, step 2 -> row 7
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        const remainderStr = String(remainder);
        
        // Clear the row first (KEEPING YOUR LOGIC)
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = '';
            }
        }
        
        // Determine which columns we're working with (KEEPING YOUR LOGIC)
        const startCol = 1;
        const workingColumns = stepNumber + 1; // 1, 2, or 3
        
        // Right-align within the working columns (KEEPING YOUR LOGIC)
        const remainderLength = remainderStr.length;
        
        for (let i = 0; i < remainderLength; i++) {
            const col = startCol + (workingColumns - remainderLength) + i;
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell) {
                cell.textContent = remainderStr[i];
                debug.log(`Set remainder cell ${cellId} to ${remainderStr[i]} (step ${stepNumber}, right-aligned in ${workingColumns} columns)`);
            }
        }
    }
}

// ============================================================================
// Z = -3: ANIMATION LAYER
// (All animations - KEEPING ALL YOUR ANIMATION LOGIC)
// ============================================================================

// Z-3.1: Bring Down Animation (KEEPING ALL YOUR DETAILED ANIMATION)
function animateBringDown(nextDigit, sourceRow, sourceCol, targetRow, targetCol) {
    debug.log(`Animating bring down of ${nextDigit} from (r${sourceRow}c${sourceCol}) to (r${targetRow}c${targetCol})`);
    
    return new Promise((resolve) => {
        // Get source and target cells first (KEEPING YOUR EXACT CHECKS)
        const sourceCell = gridCells[`r${sourceRow}c${sourceCol}`];
        const targetCell = gridCells[`r${targetRow}c${targetCol}`];
        
        if (!sourceCell || !targetCell) {
            debug.error('Source or target cell not found for animation');
            resolve();
            return;
        }
        
        // Get positions relative to viewport (KEEPING YOUR EXACT CALCULATIONS)
        const sourceRect = sourceCell.getBoundingClientRect();
        const targetRect = targetCell.getBoundingClientRect();
        
        // Get scroll position to adjust for fixed positioning (KEEPING YOUR LOGIC)
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Create the animation element (KEEPING YOUR EXACT CSS)
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
        
        // Calculate CENTERED positions (KEEPING YOUR EXACT MATH)
        const sourceLeft = sourceRect.left + sourceRect.width/2 + scrollX;
        const sourceTop = sourceRect.top + sourceRect.height/2 + scrollY;
        const targetLeft = targetRect.left + targetRect.width/2 + scrollX;
        const targetTop = targetRect.top + targetRect.height/2 + scrollY;
        
        // Position at source (centered)
        animElement.style.left = `${sourceLeft}px`;
        animElement.style.top = `${sourceTop}px`;
        
        // Add to document body
        document.body.appendChild(animElement);
        
        // Force reflow (KEEPING YOUR OPTIMIZATION)
        void animElement.offsetWidth;
        
        // Animate to target (KEEPING YOUR requestAnimationFrame)
        requestAnimationFrame(() => {
            animElement.style.left = `${targetLeft}px`;
            animElement.style.top = `${targetTop}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            animElement.style.backgroundColor = '#e3f2fd';
            
            // When animation completes (KEEPING YOUR TIMING)
            setTimeout(() => {
                // Add the digit to target cell
                targetCell.textContent = nextDigit;
                
                // Add visual feedback to target cell (KEEPING YOUR EFFECTS)
                targetCell.classList.add('digit-highlight');
                targetCell.style.backgroundColor = '#e3f2fd';
                targetCell.style.border = '2px solid #3498db';
                
                // Remove animation element
                animElement.remove();
                
                // Remove highlight after a moment (KEEPING YOUR TIMING)
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

// Z-3.2: Generic Number Animation (KEEPING ALL YOUR LOGIC)
function animateNumberToCell(value, sourceElement, targetCellId) {
    return new Promise((resolve) => {
        // Get source and target positions (KEEPING YOUR CHECKS)
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetCell = gridCells[targetCellId];
        
        if (!targetCell) {
            debug.error(`Target cell ${targetCellId} not found`);
            resolve();
            return;
        }
        
        const targetRect = targetCell.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Create animation element (KEEPING YOUR EXACT CSS)
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
        
        // Calculate positions (KEEPING YOUR MATH)
        const sourceLeft = sourceRect.left + sourceRect.width/2 + scrollX;
        const sourceTop = sourceRect.top + sourceRect.height/2 + scrollY;
        const targetLeft = targetRect.left + targetRect.width/2 + scrollX;
        const targetTop = targetRect.top + targetRect.height/2 + scrollY;
        
        // Start position
        animElement.style.left = `${sourceLeft}px`;
        animElement.style.top = `${sourceTop}px`;
        
        document.body.appendChild(animElement);
        void animElement.offsetWidth; // Force reflow (KEEPING YOUR OPTIMIZATION)
        
        // Animate to target (KEEPING YOUR requestAnimationFrame)
        requestAnimationFrame(() => {
            animElement.style.left = `${targetLeft}px`;
            animElement.style.top = `${targetTop}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            animElement.style.backgroundColor = '#ffeaa7';
            
            setTimeout(() => {
                // Set the value in target cell
                targetCell.textContent = value;
                
                // Visual feedback (KEEPING YOUR EFFECTS)
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

// Z-3.3: Equation to Grid Animation (KEEPING ALL YOUR LOGIC)
async function animateFromEquationToGrid() {
    const equation = document.querySelector('.large-equation');
    const text = equation.textContent;
    
    // Extract numbers from "425 ÷ 2" (KEEPING YOUR PARSING)
    const [dividend, divisor] = text.split(' ÷ ').map(num => parseInt(num));
    const digits = String(dividend).split('');
    
    debug.log(`Animating numbers from equation to grid: ${dividend} ÷ ${divisor}`);
    
    // Animate divisor (2) to divisor cell
    await animateNumberToCell(divisor, equation, 'divisor');
    
    // Animate each dividend digit to dividend row
    for (let i = 0; i < digits.length; i++) {
        await animateNumberToCell(digits[i], equation, `r1c${i+1}`);
    }
}

// Z-3.4: Focus Animation (KEEPING ALL YOUR LOGIC)
async function animateFocusOnCurrentStep() {
    return new Promise((resolve) => {
        const currentStepBox = document.querySelector('.current-step-container');
        if (!currentStepBox) {
            resolve();
            return;
        }
        
        // Highlight the current step box (KEEPING YOUR EFFECTS)
        currentStepBox.style.transition = 'all 0.5s ease';
        currentStepBox.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.5)';
        currentStepBox.style.transform = 'scale(1.05)';
        currentStepBox.style.backgroundColor = '#e3f2fd';
        
        // Also highlight the relevant grid cells (KEEPING YOUR LOGIC)
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
        
        // Remove highlight after animation (KEEPING YOUR TIMING)
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

// Z-3.5: Arrow Animation (KEEPING ALL YOUR LOGIC)
function createFocusArrow(fromElement, toElement) {
    return new Promise((resolve) => {
        const arrow = document.createElement('div');
        arrow.className = 'focus-arrow';
        
        // Get positions (KEEPING YOUR CALCULATIONS)
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate arrow path (KEEPING YOUR MATH)
        const fromX = fromRect.left + fromRect.width / 2 + scrollX;
        const fromY = fromRect.top + fromRect.height / 2 + scrollY;
        const toX = toRect.left + toRect.width / 2 + scrollX;
        const toY = toRect.top + toRect.height / 2 + scrollY;
        
        // Calculate angle and distance (KEEPING YOUR MATH)
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
        
        // Remove after animation (KEEPING YOUR TIMING)
        setTimeout(() => {
            arrow.remove();
            resolve();
        }, 2000);
    });
}

// ============================================================================
// Z = -4: UI DISPLAY LAYER
// (All display updates - KEEPING ALL YOUR UI LOGIC)
// ============================================================================

// Z-4.1: Problem Display (KEEPING ALL YOUR LOGIC)
function updateProblemDisplay() {
    if (!currentProblem) {
        debug.log('No current problem to display');
        return;
    }
    
    const p = currentProblem;
    debug.log('Updating problem display', {
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
        // Show current step (KEEPING YOUR EXACT LOGIC)
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
                    const nextDigit = p.digits[p.currentDigitIndex + 1];
                    currentStep = `Bring down ${nextDigit}`;
                    instruction = `Click "Bring Down" button to bring down ${nextDigit}`;
                }
                break;
        }
    }
    
    DOMReferences.problemDisplay.innerHTML = `
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

// Z-4.2: Guess Display (KEEPING ALL YOUR LOGIC)
function updateGuessDisplay() {
    // Get the element fresh each time to ensure we have the latest reference
    const guessDisplayElement = document.getElementById('currentGuessDisplay');
    if (guessDisplayElement) {
        guessDisplayElement.textContent = currentGuess;
        debug.log(`Updated guess display to ${currentGuess}`, { 
            elementExists: true, 
            currentGuess,
            previousContent: guessDisplayElement.textContent 
        });
    } else {
        debug.error('currentGuessDisplay element not found!');
        // Try to find it again
        console.log('Searching for currentGuessDisplay element...');
        const allElements = document.querySelectorAll('[id*="Guess"]');
        console.log('Found elements with "Guess" in id:', allElements);
    }
}

function adjustGuess(delta) {
    if (!currentProblem || currentProblem.finished) {
        debug.log(`Cannot adjust guess: ${currentProblem ? 'problem finished' : 'no problem'}`);
        return;
    }
    
    const newGuess = currentGuess + delta;
    if (newGuess >= 0 && newGuess <= 99) {
        currentGuess = newGuess;
        updateGuessDisplay();
        // Also log to console for debugging
        console.log(`adjustGuess: ${newGuess}, DOM should show: ${newGuess}`);
        debug.log(`Guess adjusted to ${currentGuess}`, { delta, newGuess });
    } else {
        debug.log(`Guess out of bounds: ${newGuess}`);
    }
}

function clearGuess() {
    debug.log(`Clearing guess (was ${currentGuess})`);
    currentGuess = 0;
    updateGuessDisplay();
}

// ============================================================================
// Z = -5: GAME LOGIC LAYER
// (Core game flow - KEEPING ALL YOUR LOGIC)
// ============================================================================

// Z-5.1: Quotient Processing (KEEPING ALL YOUR LOGIC)
async function processQuotientInput(problem) {
    const correctDigit = calculateQuotientDigit(problem.partial, problem.divisor);
    const correctProduct = calculateProduct(correctDigit, problem.divisor);
    
    debug.log(`Quotient: ${currentGuess} vs ${correctProduct}`);
    restoreCommitButton();

    // Validation checks (KEEPING ALL YOUR CHECKS)
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

    // Correct answer (KEEPING ALL YOUR LOGIC)
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
    
    debug.log(`→ Moving to subtraction step ${stepNumber}`);
    updateProblemDisplay();
    updateGuessDisplay();
}

// Z-5.2: Subtraction Processing (KEEPING ALL YOUR LOGIC)
async function processSubtraction(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
    if (!lastStep) return;
    
    const expectedRemainder = calculateRemainder(lastStep.partialBefore, lastStep.product);
    const stepNumber = lastStep.stepNumber;
    
    debug.log(`Subtract: ${currentGuess} vs ${expectedRemainder}`);
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
    
    // Check if we should immediately transform to bring down (KEEPING YOUR LOGIC)
    if (shouldBringDownNextDigit(problem.currentDigitIndex, problem.n)) {
        const nextDigit = problem.digits[problem.currentDigitIndex + 1];
        transformToBringDownButton(nextDigit);
        await showFeedback(`Bring down ${nextDigit}`, 'info');
    } else {
        await completeProblem(problem);
    }
    
    updateProblemDisplay();
    updateGuessDisplay();
}

// Z-5.3: Bring Down Processing (KEEPING ALL YOUR LOGIC)
function processBringDown(problem) {
    debug.log(`Bring down processing`, {
        currentDigitIndex: problem.currentDigitIndex,
        n: problem.n
    });
    
    // This function shouldn't transform the button anymore
    if (problem.currentDigitIndex >= problem.n - 1) {
        debug.log(`No more digits to bring down. Completing problem.`);
        completeProblem(problem);
        return;
    }
    
    const nextDigit = problem.digits[problem.currentDigitIndex + 1];
    
    // Double-check button is transformed
    if (commitButton && !commitButton.innerHTML.includes('Bring Down')) {
        debug.log(`Button not transformed, transforming now`);
        transformToBringDownButton(nextDigit);
    }
    
    showFeedback(`Click "Bring Down ${nextDigit}" to continue`, 'info');
    updateProblemDisplay();
}

async function executeBringDown(problem, nextDigit) {
    debug.log(`Executing bring down for digit ${nextDigit}`, {
        currentDigitIndex: problem.currentDigitIndex,
        n: problem.n,
        partialBefore: problem.partial,
        nextDigit: nextDigit
    });
    
    // CRITICAL CHECKS (KEEPING ALL YOUR CHECKS)
    if (problem.currentDigitIndex >= problem.n - 1) {
        debug.log(`No more digits to bring down. Should complete problem.`);
        await completeProblem(problem);
        return;
    }
    
    if (problem.currentStep !== 2) {
        debug.log(`Not in bring down state (currentStep=${problem.currentStep}). Ignoring.`);
        return;
    }
    
    const expectedDigit = problem.digits[problem.currentDigitIndex + 1];
    if (nextDigit !== expectedDigit) {
        debug.log(`Digit mismatch: expected ${expectedDigit}, got ${nextDigit}. Ignoring.`);
        return;
    }
    
    hideBringDownButton();
    
    // Update the partial
    problem.partial = getNextPartial(problem.partial, nextDigit);
    
    debug.log(`Brought down ${nextDigit}. New partial: ${problem.partial}`);
    
    const stepNumber = problem.steps.length - 1;
    
    // Update the grid with the brought down digit
    await updateBringDownInGrid(stepNumber, nextDigit);
    
    await showFeedback(`✓ Brought down ${nextDigit}. New number: ${problem.partial}`, 'success');
    
    problem.currentStep = 0;
    problem.currentDigitIndex++;
    currentGuess = 0;
    
    if (problem.currentDigitIndex >= problem.n - 1) {
        debug.log(`No more digits after this. Next step should be final quotient.`);
    }
    
    restoreCommitButton();
    
    debug.log(`Moving to step 0 (new quotient). New partial: ${problem.partial}, next digit index: ${problem.currentDigitIndex}`);
    
    updateProblemDisplay();
    updateGuessDisplay();
}

// Z-5.4: Problem Completion (KEEPING ALL YOUR LOGIC)
async function completeProblem(problem) {
    problem.finished = true;
    
    const finalRemainder = problem.partial;
    if (gridCells['ans-rem']) {
        gridCells['ans-rem'].textContent = finalRemainder;
        debug.log(`Set final remainder to ${finalRemainder} in ans-rem cell`);
    }
    
    solvedCount++;
    currentStreak++;
    
    const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
    debug.log(`Problem completed! Quotient: ${quotient}, Remainder: ${finalRemainder}`);
    
    await showFeedback(`🎉 Complete! ${problem.dividend} ÷ ${problem.divisor} = ${quotient} R ${finalRemainder}`, 'success');
    
    updateScoreDisplay();
    updateProblemDisplay();
}

// ============================================================================
// Z = -6: FEEDBACK & MESSAGING LAYER
// (All user feedback - KEEPING ALL YOUR LOGIC)
// ============================================================================

// Z-6.1: Feedback Display (KEEPING ALL YOUR LOGIC)
function showFeedback(message, type = 'error') {
    debug.log(`Showing feedback: ${type} - ${message}`);
    
    const numberDisplay = document.querySelector('.number-display');
    if (!numberDisplay) {
        debug.error('Number display not found');
        return new Promise(resolve => resolve());
    }
    
    if (!numberDisplay.originalHTML) {
        numberDisplay.originalHTML = numberDisplay.innerHTML;
    }
    
    numberDisplay.innerHTML = `<div class="feedback-${type}">${message}</div>`;
    numberDisplay.classList.add('showing-feedback');
    
    const delay = type === 'error' ? 4000 : 2000;
    
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
    debug.log('Clearing feedback');
    const feedbackMsg = document.querySelector('.feedback-message');
    if (feedbackMsg) {
        feedbackMsg.remove();
    }
}

// ============================================================================
// Z = -7: BUTTON & CONTROL LAYER
// (All button handling - KEEPING ALL YOUR LOGIC)
// ============================================================================

// Z-7.1: Button Setup (KEEPING ALL YOUR LOGIC)
function setupButtonHandlers() {
    debug.log('Setting up button handlers');
    
    DOMReferences.newProblemBtn.addEventListener('click', async () => {
        await generateNewProblem();
    });
    DOMReferences.resetProblemBtn.addEventListener('click', resetCurrentProblem);
    DOMReferences.resetScoresBtn.addEventListener('click', resetAllScores);
    
    createControlButtons();
}

function createControlButtons() {
    debug.log('Setting up existing control buttons');
    setupControlButtonListeners();
    updateGuessDisplay();
    commitButton = DOMReferences.commitGuessBtn;
    if (commitButton) {debug.log('Found commit button');}
}

function setupControlButtonListeners() {
    debug.log('Setting up control button listeners');
    
    document.querySelectorAll('[data-change]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            
            const delta = parseInt(btn.dataset.change);
            debug.log(`Adjusting guess by ${delta}, current guess: ${currentGuess}`);
            adjustGuess(delta);
        });
    });
    
    DOMReferences.clearGuessBtn.addEventListener('click', clearGuess);
    DOMReferences.commitGuessBtn.addEventListener('click', commitGuess);
}

// Z-7.2: Commit Logic (KEEPING ALL YOUR LOGIC)
async function commitGuess() {
    if (!currentProblem) {
        debug.error('Cannot commit: No current problem');
        showFeedback('No problem loaded. Click "New Problem"', 'error');
        return;
    }
    
    if (currentProblem.finished) {
        debug.log('Cannot commit: Problem already finished');
        showFeedback('Problem already completed!', 'info');
        return;
    }
    
    const p = currentProblem;
    debug.log(`Committing guess ${currentGuess}`, {
        currentStep: p.currentStep
    });
    
    if (p.currentStep === 0) {
        debug.log('Processing quotient input');
        await processQuotientInput(p);
    } else if (p.currentStep === 1) {
        debug.log('Processing subtraction');
        await processSubtraction(p);
    } else if (p.currentStep === 2) {
        debug.log('In bring down phase - button should handle this');
    }
}

// Z-7.3: Bring Down Button UI (KEEPING ALL YOUR LOGIC)
function showBringDownButton(nextDigit, onClick) {
    hideBringDownButton();
    
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

// Z-7.4: Button Transformation (KEEPING ALL YOUR LOGIC)
function transformToBringDownButton(nextDigit) {
    if (!commitButton) return;
    
    debug.log(`Transforming commit button to "Bring Down ${nextDigit}"`);
    
    commitButton.disabled = true;
    
    if (!commitButton.originalHTML) {
        commitButton.originalHTML = commitButton.innerHTML;
        commitButton.originalOnClick = commitButton.onclick;
    }
    
    commitButton.innerHTML = `
        <span class="bring-down-icon">↓</span>
        <span class="bring-down-text">Bring Down ${nextDigit}</span>
    `;
    
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
    
    setTimeout(() => {
        commitButton.disabled = false;
    }, 300);
    
    const handleBringDownClick = () => {
        commitButton.disabled = true;
        commitButton.style.opacity = '0.7';
        commitButton.style.cursor = 'not-allowed';
        
        executeBringDown(currentProblem, nextDigit);
    };
    
    commitButton.onclick = handleBringDownClick;
    commitButton.onmouseover = null;
    commitButton.onmouseout = null;
    commitButton.style.display = 'flex';
}

function restoreCommitButton() {
    if (!commitButton || !commitButton.originalHTML) return;
    
    debug.log('Restoring commit button to original state');
    
    commitButton.disabled = false;
    commitButton.style.opacity = '';
    commitButton.style.cursor = '';
    commitButton.innerHTML = commitButton.originalHTML;
    commitButton.onclick = commitButton.originalOnClick;
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
    
    delete commitButton.originalHTML;
    delete commitButton.originalOnClick;
}

// Z-7.5: Bring Down Grid Update (KEEPING ALL YOUR LOGIC)
function updateBringDownInGrid(stepNumber, nextDigit) {
    debug.log(`Updating bring down in grid for step ${stepNumber}`, {
        stepNumber,
        nextDigit
    });
    
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[stepNumber];
    
    if (row !== undefined) {
        let rightmostCol = 0;
        for (let col = 1; col <= 5; col++) {
            const cellId = `r${row}c${col}`;
            const cell = gridCells[cellId];
            if (cell && cell.textContent !== '') {
                rightmostCol = col;
            }
        }
        
        const targetCol = rightmostCol + 1;
        const cellId = `r${row}c${targetCol}`;
        const targetCell = gridCells[cellId];
        
        if (targetCell) {
            if (targetCell.textContent !== '') {
                debug.log(`Target cell ${cellId} already has value: ${targetCell.textContent}. Skipping animation.`);
                return Promise.resolve();
            }
            
            const sourceCol = stepNumber + 2;
            return animateBringDown(nextDigit, 1, sourceCol, row, targetCol).then(() => {
                targetCell.textContent = nextDigit;
                debug.log(`Appended brought down digit ${nextDigit} to ${cellId} via animation`);
            });
        }
    }
    return Promise.resolve();
}

// ============================================================================
// Z = -8: STYLE & CSS LAYER
// (All dynamic styles - KEEPING ALL YOUR STYLES)
// ============================================================================

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

// ============================================================================
// Z = -9: INITIALIZATION LAYER
// (Application startup - KEEPING ALL YOUR INIT LOGIC)
// ============================================================================

function resetCurrentProblem() {
    if (currentProblem) {
        debug.log(`Resetting current problem: ${currentProblem.dividend} ÷ ${currentProblem.divisor}`);
        initializeDivisionState(currentProblem.dividend, currentProblem.divisor);
    } else {
        debug.log('No current problem to reset');
    }
}

// MAIN INITIALIZATION (KEEPING YOUR EXACT LOGIC)
document.addEventListener('DOMContentLoaded', () => {
    debug.log('Division practice initialized');
    
    initializeGridReferences();
    addAnimationStyles();
    updateScoreDisplay();
    setupButtonHandlers();
    generateNewProblem();
});

// ============================================================================
// LINE COUNT: ~1600 LINES (SAME FUNCTIONALITY, ONLY DEBUG OPTIMIZED)
// ============================================================================
