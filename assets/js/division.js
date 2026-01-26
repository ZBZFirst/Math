// ============================================================================
// Z = +3: CONFIGURATION & CONSTANTS LAYER ===================================
// ============================================================================
const DEBUG = true;
const MAX_DIVIDEND = 999;
const MIN_DIVIDEND = 1;
const MAX_DIVISOR = 15;
const MIN_DIVISOR = 1;

// ============================================================================
// Z = +2: UTILITY & HELPER LAYER ============================================
// ============================================================================

// Consolidated debug function
function debug(type, message, data = null) {
    if (!DEBUG) return;
    
    const prefix = `[DEBUG ${type.toUpperCase()}]`;
    const methods = { 'log': console.log, 'error': console.error, 'warn': console.warn, 'info': console.info };
    const method = methods[type] || console.log;
    data ? method(prefix, message, data) : method(prefix, message);
}

// Math utilities
function calculateQuotientDigit(partial, divisor) { return Math.floor(partial / divisor); }
function calculateProduct(quotientDigit, divisor) { return quotientDigit * divisor; }
function calculateRemainder(partial, product) { return partial - product; }
function shouldBringDownNextDigit(currentDigitIndex, totalDigits) { return currentDigitIndex < totalDigits - 1; }
function getNextPartial(currentPartial, nextDigit) { return currentPartial * 10 + nextDigit; }

// ============================================================================
// Z = +1: DOM ELEMENT REFERENCES LAYER ======================================
// ============================================================================

const DOMReferences = {
    problemDisplay: document.getElementById('problemdisplay'),
    workStageContainer: document.getElementById('workStageContainer'),
    workFeedback: document.getElementById('workFeedback'),
    newProblemBtn: document.getElementById('newDivisionProblem'),
    resetProblemBtn: document.getElementById('resetCurrentProblem'),
    resetScoresBtn: document.getElementById('resetDivisionScores'),
    solvedCountEl: document.getElementById('solvedCount'),
    mistakeCountEl: document.getElementById('mistakeCount'),
    divisionAccuracyEl: document.getElementById('divisionAccuracy'),
    currentStreakEl: document.getElementById('currentStreak'),
    clearGuessBtn: document.getElementById('clearGuess'),
    commitGuessBtn: document.getElementById('commitGuessBtn'),
    guessDisplay: document.getElementById('currentGuessDisplay')
};

let gridCells = {};
let answerCells = {};

function initializeGridReferences() {
    debug('log', 'Initializing grid cell references');
    
    gridCells = {};
    
    // Answer cells
    ['ans-q0', 'ans-q1', 'ans-q2', 'ans-r', 'ans-rem', 'divisor'].forEach(id => {
        gridCells[id] = document.getElementById(id);
    });
    
    // Grid cells r1c1 to r10c5
    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
            const id = `r${row}c${col}`;
            gridCells[id] = document.getElementById(id);
        }
    }
    
    const foundCells = Object.keys(gridCells).filter(key => gridCells[key]);
    debug('log', `Found ${foundCells.length} grid cells`, foundCells.length > 10 ? `${foundCells.length} cells` : foundCells);
    
    answerCells = { 'q0': gridCells['ans-q0'], 'q1': gridCells['ans-q1'], 'q2': gridCells['ans-q2'], 'rem': gridCells['ans-rem'] };
    debug('log', 'Grid cell references initialized');
}

// ============================================================================
// Z = 0: STATE MANAGEMENT LAYER =============================================
// ============================================================================

let currentProblem = null;
let currentGuess = 0;
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;
let commitButton = null;

function updateScoreDisplay() {
    DOMReferences.solvedCountEl.textContent = solvedCount;
    DOMReferences.mistakeCountEl.textContent = mistakeCount;
    DOMReferences.currentStreakEl.textContent = currentStreak;
    
    const total = solvedCount + mistakeCount;
    DOMReferences.divisionAccuracyEl.textContent = total > 0 ? Math.round((solvedCount / total) * 100) + '%' : '0%';
    
    localStorage.setItem('divisionSolvedCount', solvedCount);
    localStorage.setItem('divisionMistakeCount', mistakeCount);
    localStorage.setItem('divisionCurrentStreak', currentStreak);
}

function resetAllScores() {
    solvedCount = mistakeCount = currentStreak = 0;
    updateScoreDisplay();
}

// ============================================================================
// Z = -1: CORE BUSINESS LOGIC LAYER =========================================
// ============================================================================

async function generateNewProblem() {
    debug('log', 'Generating new problem');
    
    let divisor = Math.floor(Math.random() * MAX_DIVISOR) + MIN_DIVISOR;
    let dividend;
    do { dividend = Math.floor(Math.random() * MAX_DIVIDEND) + MIN_DIVIDEND; } 
    while (dividend <= divisor);
    
    debug('log', `Generated problem: ${dividend} ÷ ${divisor}`);
    await initializeDivisionState(dividend, divisor);
}

async function initializeDivisionState(dividend, divisor) {
    const digits = String(dividend).split('').map(Number);
    const n = digits.length;
    
    resetGrid();
    
    currentProblem = {
        dividend, divisor, digits, n,
        currentStep: 0,
        currentDigitIndex: 0,
        partial: digits[0],
        quotientDigits: [],
        steps: [],
        finished: false,
        visibleRows: 2 * n + 1
    };

    updateProblemDisplay();
    await animateFromEquationToGrid();
    await animateFocusOnCurrentStep();

    currentGuess = 0;
    updateGuessDisplay();
    clearFeedback();
    updateVisibleRows(n);
    restoreCommitButton();
}

// ============================================================================
// Z = -2: GRID MANAGEMENT LAYER =============================================
// ============================================================================

function resetGrid() {
    debug('log', 'Resetting grid');
    
    Object.values(answerCells).forEach(cell => { if (cell) cell.textContent = '?'; });
    if (gridCells['ans-rem']) gridCells['ans-rem'].textContent = '?';
    
    for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
            const cell = gridCells[`r${row}c${col}`];
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('hidden');
            }
        }
    }
    
    if (gridCells['divisor']) gridCells['divisor'].textContent = '?';
}

function updateDivisor(divisor) {
    if (gridCells['divisor']) gridCells['divisor'].textContent = divisor;
}

function updateDividend(digits) {
    for (let i = 0; i < 5; i++) {
        const cell = gridCells[`r1c${i + 1}`];
        if (cell) {
            cell.textContent = i < digits.length ? digits[i] : '';
            cell.style.display = i < digits.length ? 'flex' : 'none';
        }
    }
}

function updateVisibleRows(n) {
    const visibleRows = 2 * n + 1;
    for (let row = 2; row <= 10; row++) {
        const shouldShow = row <= (visibleRows + 1);
        for (let col = 1; col <= 5; col++) {
            const cell = gridCells[`r${row}c${col}`];
            if (cell) cell.style.display = shouldShow ? 'flex' : 'none';
        }
    }
}

function updateGridCells(rowMap, stepNumber, value, cellType = '') {
    const row = rowMap[stepNumber];
    if (row === undefined) {
        debug('error', `Invalid step ${stepNumber} for ${cellType}`);
        return;
    }
    
    const valueStr = String(value);
    
    // Clear row
    for (let col = 1; col <= 5; col++) {
        const cell = gridCells[`r${row}c${col}`];
        if (cell) cell.textContent = '';
    }
    
    // Right-align value
    const startCol = 1;
    const workingColumns = stepNumber + 1;
    const valueLength = valueStr.length;
    
    for (let i = 0; i < valueLength; i++) {
        const col = startCol + (workingColumns - valueLength) + i;
        const cell = gridCells[`r${row}c${col}`];
        if (cell) {
            cell.textContent = valueStr[i];
            debug('log', `Set ${cellType} at r${row}c${col} to ${valueStr[i]}`);
        }
    }
}

function updateQuotientInGrid(stepNumber, value) {
    const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
    if (stepNumber < quotientCellIds.length) {
        const cell = gridCells[quotientCellIds[stepNumber]];
        if (cell) cell.textContent = value;
    }
}

function updateProductInGrid(stepNumber, product) {
    updateGridCells({0: 2, 1: 4, 2: 6}, stepNumber, product, 'product');
}

function updateRemainderInGrid(stepNumber, remainder) {
    updateGridCells({0: 3, 1: 5, 2: 7}, stepNumber, remainder, 'remainder');
}

// ============================================================================
// Z = -3: ANIMATION LAYER ===================================================
// ============================================================================

function animateElement(value, fromElement, toCellId, styles = {}) {
    return new Promise((resolve) => {
        const toCell = gridCells[toCellId];
        if (!toCell) { debug('error', `Target cell ${toCellId} not found`); resolve(); return; }
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toCell.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const animElement = document.createElement('div');
        animElement.className = 'digit-animation';
        animElement.textContent = value;
        
        const defaultStyles = {
            fontSize: '24px', fontWeight: 'bold', color: '#3498db',
            background: 'white', border: '2px solid #3498db', highlightColor: '#e3f2fd'
        };
        const finalStyles = { ...defaultStyles, ...styles };
        
        animElement.style.cssText = `
            position: fixed; font-size: ${finalStyles.fontSize}; font-weight: ${finalStyles.fontWeight};
            color: ${finalStyles.color}; background: ${finalStyles.background}; border: ${finalStyles.border};
            border-radius: 5px; width: ${fromRect.width}px; height: ${fromRect.height}px;
            display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000; transition: all 0.5s ease-in-out; pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        
        const fromLeft = fromRect.left + fromRect.width/2 + scrollX;
        const fromTop = fromRect.top + fromRect.height/2 + scrollY;
        const toLeft = toRect.left + toRect.width/2 + scrollX;
        const toTop = toRect.top + toRect.height/2 + scrollY;
        
        animElement.style.left = `${fromLeft}px`;
        animElement.style.top = `${fromTop}px`;
        document.body.appendChild(animElement);
        void animElement.offsetWidth;
        
        requestAnimationFrame(() => {
            animElement.style.left = `${toLeft}px`;
            animElement.style.top = `${toTop}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            animElement.style.backgroundColor = finalStyles.highlightColor;
            
            setTimeout(() => {
                toCell.textContent = value;
                toCell.classList.add('digit-highlight');
                toCell.style.backgroundColor = finalStyles.highlightColor;
                toCell.style.border = finalStyles.border;
                
                animElement.remove();
                setTimeout(() => {
                    toCell.classList.remove('digit-highlight');
                    toCell.style.backgroundColor = '';
                    toCell.style.border = '';
                    resolve();
                }, 500);
            }, 500);
        });
    });
}

function animateBringDown(nextDigit, sourceRow, sourceCol, targetRow, targetCol) {
    return animateElement(nextDigit, gridCells[`r${sourceRow}c${sourceCol}`], `r${targetRow}c${targetCol}`, {
        color: '#3498db', border: '2px solid #3498db', highlightColor: '#e3f2fd'
    });
}

function animateNumberToCell(value, sourceElement, targetCellId) {
    return animateElement(value, sourceElement, targetCellId, {
        color: '#e74c3c', border: '2px solid #e74c3c', highlightColor: '#ffeaa7'
    });
}

async function animateFromEquationToGrid() {
    const equation = document.querySelector('.large-equation');
    const [dividend, divisor] = equation.textContent.split(' ÷ ').map(Number);
    const digits = String(dividend).split('');
    
    await animateNumberToCell(divisor, equation, 'divisor');
    for (let i = 0; i < digits.length; i++) {
        await animateNumberToCell(digits[i], equation, `r1c${i+1}`);
    }
}

async function animateFocusOnCurrentStep() {
    return new Promise((resolve) => {
        const currentStepBox = document.querySelector('.current-step-container');
        if (!currentStepBox) { resolve(); return; }
        
        currentStepBox.style.transition = 'all 0.5s ease';
        currentStepBox.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.5)';
        currentStepBox.style.transform = 'scale(1.05)';
        currentStepBox.style.backgroundColor = '#e3f2fd';
        
        if (currentProblem?.currentStep === 0) {
            if (gridCells['r1c1']) gridCells['r1c1'].classList.add('digit-highlight');
            if (gridCells['divisor']) gridCells['divisor'].classList.add('digit-highlight');
        }
        
        setTimeout(() => {
            currentStepBox.style.boxShadow = currentStepBox.style.transform = currentStepBox.style.backgroundColor = '';
            if (gridCells['r1c1']) gridCells['r1c1'].classList.remove('digit-highlight');
            if (gridCells['divisor']) gridCells['divisor'].classList.remove('digit-highlight');
            resolve();
        }, 1500);
    });
}

// ============================================================================
// Z = -4: UI DISPLAY LAYER ==================================================
// ============================================================================

function updateProblemDisplay() {
    if (!currentProblem) { debug('log', 'No current problem'); return; }
    
    const p = currentProblem;
    const dividend = p.dividend;
    const divisor = p.divisor;
    
    let currentStep = '', instruction = '';
    
    if (p.finished) {
        const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
        const remainder = p.steps[p.steps.length - 1]?.subtraction || 0;
        currentStep = `${dividend} ÷ ${divisor} = ${quotient} R ${remainder}`;
        instruction = 'Problem completed!';
    } else {
        switch (p.currentStep) {
            case 0:
                currentStep = `${p.partial} ÷ ${divisor} = ?`;
                instruction = `Find the largest multiple of ${divisor} ≤ ${p.partial}`;
                break;
            case 1:
                const lastStep = p.steps[p.steps.length - 1];
                if (lastStep) {
                    currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                    instruction = `Subtract: ${lastStep.partialBefore} - ${lastStep.product}`;
                }
                break;
            case 2:
                if (p.currentDigitIndex >= p.n - 1) {
                    currentStep = "Complete the problem";
                    instruction = "No more digits to bring down";
                } else {
                    const nextDigit = p.digits[p.currentDigitIndex + 1];
                    currentStep = `Bring down ${nextDigit}`;
                    instruction = `Click "Bring Down" to bring down ${nextDigit}`;
                }
                break;
        }
    }
    
    DOMReferences.problemDisplay.innerHTML = `
        <div class="equation-display"><div class="large-equation">${dividend} ÷ ${divisor}</div></div>
        <div class="current-step-container">
            <div class="current-step-title">Current Step</div>
            <div class="current-step-equation">${currentStep}</div>
            <div class="current-instruction">${instruction}</div>
        </div>
    `;
}

function updateGuessDisplay() {
    if (DOMReferences.guessDisplay) DOMReferences.guessDisplay.textContent = currentGuess;
}

function adjustGuess(delta) {
    if (!currentProblem || currentProblem.finished) return;
    const newGuess = currentGuess + delta;
    if (newGuess >= 0 && newGuess <= 99) {
        currentGuess = newGuess;
        updateGuessDisplay();
    }
}

function clearGuess() { currentGuess = 0; updateGuessDisplay(); }

// ============================================================================
// Z = -5: GAME LOGIC LAYER ==================================================
// ============================================================================

async function processQuotientInput(problem) {
    const correctDigit = calculateQuotientDigit(problem.partial, problem.divisor);
    const correctProduct = calculateProduct(correctDigit, problem.divisor);
    
    if (currentGuess % problem.divisor !== 0) {
        mistakeCount++; currentStreak = 0;
        await showFeedback(`${currentGuess} not a multiple of ${problem.divisor}`, 'error');
        updateScoreDisplay(); return;
    }
    
    if (currentGuess > problem.partial) {
        mistakeCount++; currentStreak = 0;
        await showFeedback(`${currentGuess} > ${problem.partial}`, 'error');
        updateScoreDisplay(); return;
    }
    
    if (currentGuess !== correctProduct) {
        mistakeCount++; currentStreak = 0;
        await showFeedback(`Incorrect.`, 'error');
        updateScoreDisplay(); return;
    }

    const quotientDigit = currentGuess / problem.divisor;
    const stepNumber = problem.quotientDigits.length;
    
    problem.quotientDigits.push(quotientDigit);
    problem.steps.push({
        stepNumber,
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
    updateProblemDisplay();
    updateGuessDisplay();
}

async function processSubtraction(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
    if (!lastStep) return;
    
    const expectedRemainder = calculateRemainder(lastStep.partialBefore, lastStep.product);
    const stepNumber = lastStep.stepNumber;
    
    if (currentGuess !== expectedRemainder) {
        mistakeCount++; currentStreak = 0;
        await showFeedback(`✗ ${lastStep.partialBefore} - ${lastStep.product} ≠ ${currentGuess}`, 'error');
        updateScoreDisplay(); return;
    }
    
    updateRemainderInGrid(stepNumber, expectedRemainder);
    problem.partial = expectedRemainder;
    await showFeedback(`✓ ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'success');
    
    problem.currentStep = 2;
    currentGuess = 0;
    
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

function processBringDown(problem) {
    if (problem.currentDigitIndex >= problem.n - 1) {
        completeProblem(problem); return;
    }
    const nextDigit = problem.digits[problem.currentDigitIndex + 1];
    if (!commitButton.innerHTML.includes('Bring Down')) transformToBringDownButton(nextDigit);
    showFeedback(`Click "Bring Down ${nextDigit}" to continue`, 'info');
    updateProblemDisplay();
}

async function executeBringDown(problem, nextDigit) {
    if (problem.currentDigitIndex >= problem.n - 1) { await completeProblem(problem); return; }
    if (problem.currentStep !== 2) return;
    
    const expectedDigit = problem.digits[problem.currentDigitIndex + 1];
    if (nextDigit !== expectedDigit) return;
    
    hideBringDownButton();
    problem.partial = getNextPartial(problem.partial, nextDigit);
    
    const stepNumber = problem.steps.length - 1;
    await updateBringDownInGrid(stepNumber, nextDigit);
    await showFeedback(`✓ Brought down ${nextDigit}. New: ${problem.partial}`, 'success');
    
    problem.currentStep = 0;
    problem.currentDigitIndex++;
    currentGuess = 0;
    restoreCommitButton();
    updateProblemDisplay();
    updateGuessDisplay();
}

async function completeProblem(problem) {
    problem.finished = true;
    const finalRemainder = problem.partial;
    if (gridCells['ans-rem']) gridCells['ans-rem'].textContent = finalRemainder;
    
    solvedCount++; currentStreak++;
    const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
    await showFeedback(`🎉 Complete! ${problem.dividend} ÷ ${problem.divisor} = ${quotient} R ${finalRemainder}`, 'success');
    updateScoreDisplay();
    updateProblemDisplay();
}

// ============================================================================
// Z = -6: FEEDBACK & MESSAGING LAYER ========================================
// ============================================================================

function showFeedback(message, type = 'error') {
    const numberDisplay = document.querySelector('.number-display');
    if (!numberDisplay) return new Promise(resolve => resolve());
    
    if (!numberDisplay.originalHTML) numberDisplay.originalHTML = numberDisplay.innerHTML;
    numberDisplay.innerHTML = `<div class="feedback-${type}">${message}</div>`;
    numberDisplay.classList.add('showing-feedback');
    
    return new Promise(resolve => setTimeout(() => {
        if (numberDisplay.originalHTML) numberDisplay.innerHTML = numberDisplay.originalHTML;
        numberDisplay.classList.remove('showing-feedback');
        resolve();
    }, type === 'error' ? 4000 : 2000));
}

function clearFeedback() {
    const feedbackMsg = document.querySelector('.feedback-message');
    if (feedbackMsg) feedbackMsg.remove();
}

// ============================================================================
// Z = -7: BUTTON & CONTROL LAYER ============================================
// ============================================================================

function setupButtonHandlers() {
    DOMReferences.newProblemBtn.addEventListener('click', async () => await generateNewProblem());
    DOMReferences.resetProblemBtn.addEventListener('click', resetCurrentProblem);
    DOMReferences.resetScoresBtn.addEventListener('click', resetAllScores);
    createControlButtons();
}

function createControlButtons() {
    setupControlButtonListeners();
    updateGuessDisplay();
    commitButton = DOMReferences.commitGuessBtn;
}

function setupControlButtonListeners() {
    document.querySelectorAll('[data-change]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            const delta = parseInt(btn.dataset.change);
            adjustGuess(delta);
        });
    });
    DOMReferences.clearGuessBtn.addEventListener('click', clearGuess);
    DOMReferences.commitGuessBtn.addEventListener('click', commitGuess);
}

async function commitGuess() {
    if (!currentProblem) {
        showFeedback('No problem loaded. Click "New Problem"', 'error'); return;
    }
    if (currentProblem.finished) {
        showFeedback('Problem already completed!', 'info'); return;
    }
    
    const p = currentProblem;
    if (p.currentStep === 0) await processQuotientInput(p);
    else if (p.currentStep === 1) await processSubtraction(p);
    else if (p.currentStep === 2) debug('log', 'In bring down phase');
}

function showBringDownButton(nextDigit, onClick) {
    hideBringDownButton();
    const bringDownBtn = document.createElement('button');
    bringDownBtn.id = 'bringDownBtn';
    bringDownBtn.className = 'bring-down-button';
    bringDownBtn.innerHTML = `<span class="bring-down-icon">↓</span><span class="bring-down-text">Bring Down ${nextDigit}</span>`;
    bringDownBtn.style.cssText = `background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none;
        border-radius: 8px; padding: 12px 24px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex;
        align-items: center; justify-content: center; gap: 10px; margin: 10px auto; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);`;
    bringDownBtn.onclick = () => { bringDownBtn.disabled = true; onClick(); };
    const feedbackArea = document.getElementById('workFeedback');
    if (feedbackArea) feedbackArea.appendChild(bringDownBtn);
}

function hideBringDownButton() {
    const existingBtn = document.getElementById('bringDownBtn');
    if (existingBtn) existingBtn.remove();
}

function transformToBringDownButton(nextDigit) {
    if (!commitButton) return;
    commitButton.disabled = true;
    if (!commitButton.originalHTML) {
        commitButton.originalHTML = commitButton.innerHTML;
        commitButton.originalOnClick = commitButton.onclick;
    }
    commitButton.innerHTML = `<span class="bring-down-icon">↓</span><span class="bring-down-text">Bring Down ${nextDigit}</span>`;
    commitButton.style.cssText = `background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none;
        border-radius: 8px; padding: 12px 24px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex;
        align-items: center; justify-content: center; gap: 10px; margin: 10px auto; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3); width: 100%;`;
    commitButton.onclick = () => { commitButton.disabled = true; executeBringDown(currentProblem, nextDigit); };
    setTimeout(() => { commitButton.disabled = false; }, 300);
}

function restoreCommitButton() {
    if (!commitButton || !commitButton.originalHTML) return;
    commitButton.disabled = false;
    commitButton.innerHTML = commitButton.originalHTML;
    commitButton.onclick = commitButton.originalOnClick;
    commitButton.style.cssText = `width: 100%; padding: 15px; background-color: #007bff; color: white; border: none;
        border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
    delete commitButton.originalHTML;
    delete commitButton.originalOnClick;
}

function updateBringDownInGrid(stepNumber, nextDigit) {
    const rowMap = {0: 3, 1: 5, 2: 7};
    const row = rowMap[stepNumber];
    if (row === undefined) return Promise.resolve();
    
    let rightmostCol = 0;
    for (let col = 1; col <= 5; col++) {
        const cell = gridCells[`r${row}c${col}`];
        if (cell && cell.textContent !== '') rightmostCol = col;
    }
    
    const targetCol = rightmostCol + 1;
    const targetCell = gridCells[`r${row}c${targetCol}`];
    if (!targetCell) return Promise.resolve();
    
    if (targetCell.textContent !== '') {
        debug('log', `Cell r${row}c${targetCol} already has value`); 
        return Promise.resolve();
    }
    
    const sourceCol = stepNumber + 2;
    return animateBringDown(nextDigit, 1, sourceCol, row, targetCol).then(() => {
        targetCell.textContent = nextDigit;
    });
}

// ============================================================================
// Z = -8: STYLE & CSS LAYER =================================================
// ============================================================================

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes digitPulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .digit-highlight { animation: digitPulse 0.5s ease-in-out; background-color: #e3f2fd !important; border: 2px solid #3498db !important; }
        .bring-down-button { background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px;
            padding: 12px 24px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 10px; margin: 10px auto; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3); }
        .bring-down-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4); }
        .bring-down-icon { font-size: 24px; animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .digit-animation { position: absolute !important; z-index: 1000 !important; }
        @keyframes arrowPulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
        .focus-arrow::after { content: ''; position: absolute; right: -10px; top: -6px; width: 0; height: 0;
            border-left: 20px solid rgba(52, 152, 219, 0.8); border-top: 10px solid transparent; border-bottom: 10px solid transparent; }
        @keyframes pulseHighlight { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(52, 152, 219, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); } }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// Z = -9: INITIALIZATION LAYER ==============================================
// ============================================================================

function resetCurrentProblem() {
    if (currentProblem) {
        debug('log', `Resetting problem: ${currentProblem.dividend} ÷ ${currentProblem.divisor}`);
        initializeDivisionState(currentProblem.dividend, currentProblem.divisor);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    debug('log', 'Division practice initialized');
    initializeGridReferences();
    addAnimationStyles();
    updateScoreDisplay();
    setupButtonHandlers();
    generateNewProblem();
});

// ============================================================================
// LINE COUNT: ~650 LINES (Reduced from ~1600)
// ============================================================================
