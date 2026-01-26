// ============================================================================
// Z = +3: CONFIGURATION & CONSTANTS LAYER
// ============================================================================
class Config {
    static DEBUG = true;
    static MAX_DIVIDEND = 999;
    static MIN_DIVIDEND = 1;
    static MAX_DIVISOR = 15;
    static MIN_DIVISOR = 1;
}

// ============================================================================
// Z = +2: UTILITY & HELPER LAYER  
// ============================================================================
class Debug {
    constructor(enabled) {
        this.enabled = enabled;
    }
    
    log(message, data = null) {
        if (!this.enabled) return;
        data ? console.log(`[DEBUG] ${message}:`, data) : console.log(`[DEBUG] ${message}`);
    }
    
    error(message, error = null) {
        if (!this.enabled) return;
        console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
}

class MathUtils {
    static calculateQuotientDigit(partial, divisor) { return Math.floor(partial / divisor); }
    static calculateProduct(quotientDigit, divisor) { return quotientDigit * divisor; }
    static calculateRemainder(partial, product) { return partial - product; }
    static shouldBringDownNextDigit(currentDigitIndex, totalDigits) { return currentDigitIndex < totalDigits - 1; }
    static getNextPartial(currentPartial, nextDigit) { return currentPartial * 10 + nextDigit; }
}

// ============================================================================
// Z = +1: DOM ELEMENT REFERENCES LAYER
// ============================================================================
class DOMReferences {
    static elements = {
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
    
    static gridCells = {};
    static answerCells = {};
    
    static initialize() {
        Debug.instance.log('Initializing grid cell references');
        
        // Initialize all grid cells
        this.gridCells = {};
        
        // Answer and divisor cells
        ['ans-q0', 'ans-q1', 'ans-q2', 'ans-r', 'ans-rem', 'divisor'].forEach(id => {
            this.gridCells[id] = document.getElementById(id);
        });
        
        // Grid cells r1c1 to r10c5
        for (let row = 1; row <= 10; row++) {
            for (let col = 1; col <= 5; col++) {
                this.gridCells[`r${row}c${col}`] = document.getElementById(`r${row}c${col}`);
            }
        }
        
        // Store answer cells for easy access
        this.answerCells = {
            'q0': this.gridCells['ans-q0'],
            'q1': this.gridCells['ans-q1'],
            'q2': this.gridCells['ans-q2'],
            'rem': this.gridCells['ans-rem']
        };
        
        Debug.instance.log('Grid cell references initialized');
    }
}

// ============================================================================
// Z = 0: STATE MANAGEMENT LAYER
// ============================================================================
class State {
    static currentProblem = null;
    static currentGuess = 0;
    static solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
    static mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
    static currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;
    static commitButton = null;
    
    static updateScoreDisplay() {
        DOMReferences.elements.solvedCountEl.textContent = this.solvedCount;
        DOMReferences.elements.mistakeCountEl.textContent = this.mistakeCount;
        DOMReferences.elements.currentStreakEl.textContent = this.currentStreak;
        
        const total = this.solvedCount + this.mistakeCount;
        const accuracy = total > 0 ? Math.round((this.solvedCount / total) * 100) : 0;
        DOMReferences.elements.divisionAccuracyEl.textContent = accuracy + '%';
        
        localStorage.setItem('divisionSolvedCount', this.solvedCount);
        localStorage.setItem('divisionMistakeCount', this.mistakeCount);
        localStorage.setItem('divisionCurrentStreak', this.currentStreak);
    }
    
    static resetAllScores() {
        this.solvedCount = this.mistakeCount = this.currentStreak = 0;
        this.updateScoreDisplay();
    }
}

// ============================================================================
// Z = -1: CORE BUSINESS LOGIC LAYER
// ============================================================================
class DivisionLogic {
    static async generateNewProblem() {
        Debug.instance.log('Generating new problem');
        
        let divisor = Math.floor(Math.random() * Config.MAX_DIVISOR) + Config.MIN_DIVISOR;
        let dividend;
        
        do {
            dividend = Math.floor(Math.random() * Config.MAX_DIVIDEND) + Config.MIN_DIVIDEND;
        } while (dividend <= divisor);
        
        Debug.instance.log(`Generated problem: ${dividend} ÷ ${divisor}`);
        await this.initializeDivisionState(dividend, divisor);
    }
    
    static async initializeDivisionState(dividend, divisor) {
        const digits = String(dividend).split('').map(Number);
        const n = digits.length;
        
        Debug.instance.log(`Initializing division state`, {
            dividend,
            divisor,
            digits,
            n,
            currentGuess: State.currentGuess
        });
        
        GridManager.resetGrid();
        
        State.currentProblem = {
            dividend, divisor, digits, n,
            currentStep: 0,
            currentDigitIndex: 0,
            partial: digits[0],
            quotientDigits: [],
            steps: [],
            finished: false,
            visibleRows: 2 * n + 1
        };
        
        Debug.instance.log('Current problem state initialized', State.currentProblem);
    
        // Update the display structure first
        UI._updateDisplay(dividend, divisor, `${State.currentProblem.partial} ÷ ${divisor} = ?`, 
                         `Find the largest multiple of ${divisor} ≤ ${State.currentProblem.partial}`);
        
        // Animate numbers from equation to grid
        await Animations.animateFromEquationToGrid();
        
        // Update grid with divisor and dividend
        GridManager.updateDivisor(divisor);
        GridManager.updateDividend(digits);
        
        // Focus animation
        await Animations.animateFocusOnCurrentStep();
        
        // Update UI
        State.currentGuess = 0;
        UI.updateGuessDisplay();
        Feedback.clearFeedback(); // Fixed: Use Feedback class instead of UI
        
        // Show/hide rows based on n
        GridManager.updateVisibleRows(n);
        ButtonManager.restoreCommitButton();
        GridManager.debugRowStructure(n);
    }
}

// ============================================================================
// Z = -2: GRID MANAGEMENT LAYER
// ============================================================================
class GridManager {
    static resetGrid() {
        Debug.instance.log('Resetting grid to initial state');
        
        // Clear answer cells
        Object.values(DOMReferences.answerCells).forEach(cell => {
            if (cell) cell.textContent = '?';
        });
        
        // Clear all grid cells
        for (let key in DOMReferences.gridCells) {
            const cell = DOMReferences.gridCells[key];
            if (cell && key.startsWith('r')) {
                cell.textContent = '';
                cell.classList.remove('hidden');
            }
        }
        
        // Set initial values
        if (DOMReferences.gridCells['ans-rem']) DOMReferences.gridCells['ans-rem'].textContent = '?';
        if (DOMReferences.gridCells['divisor']) DOMReferences.gridCells['divisor'].textContent = '?';
    }
    
    static updateDivisor(divisor) {
        if (DOMReferences.gridCells['divisor']) {
            DOMReferences.gridCells['divisor'].textContent = divisor;
        }
    }
    
    static updateDividend(digits) {
        for (let i = 0; i < 5; i++) {
            const cell = DOMReferences.gridCells[`r1c${i + 1}`];
            if (cell) {
                cell.textContent = i < digits.length ? digits[i] : '';
                cell.style.display = i < digits.length ? 'flex' : 'none';
            }
        }
    }
    
    static updateVisibleRows(n) {
        const totalRowsNeeded = 2 * n + 1; // For 3 digits: 7 rows needed
        Debug.instance.log(`Updating visible rows: n=${n}, totalRowsNeeded=${totalRowsNeeded}`);
        
        // Show/hide rows based on the problem size
        for (let row = 1; row <= 10; row++) {
            const shouldShow = row <= totalRowsNeeded;
            
            // Get the row element
            const rowElement = document.querySelector(`.work-row:nth-child(${row})`);
            if (rowElement) {
                rowElement.style.display = shouldShow ? 'flex' : 'none';
            }
            
            // Also update individual cells
            for (let col = 1; col <= 5; col++) {
                const cell = DOMReferences.gridCells[`r${row}c${col}`];
                if (cell) {
                    cell.style.display = shouldShow ? 'flex' : 'none';
                    // Clear content for hidden rows
                    if (!shouldShow) cell.textContent = '';
                }
            }
        }
    }
    
    static updateQuotientInGrid(stepNumber, value) {
        const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
        if (stepNumber < quotientCellIds.length) {
            const cell = DOMReferences.gridCells[quotientCellIds[stepNumber]];
            if (cell) cell.textContent = value;
        }
    }
    
    static updateProductInGrid(stepNumber, product) {
        this._updateGridRow(stepNumber, product, true);
    }
    
    static updateRemainderInGrid(stepNumber, remainder) {
        this._updateGridRow(stepNumber, remainder, false);
    }
    
    static _updateGridRow(stepNumber, value, isProduct) {
        const rowMap = isProduct ? {0: 2, 1: 4, 2: 6} : {0: 3, 1: 5, 2: 7};
        const row = rowMap[stepNumber];
        if (row === undefined) return;
        
        const valueStr = String(value);
        const valueLength = valueStr.length;
        
        // Clear the entire row first
        for (let col = 1; col <= 5; col++) {
            const cell = DOMReferences.gridCells[`r${row}c${col}`];
            if (cell) cell.textContent = '';
        }
        
        // For single-digit products/remainders, place them in the correct column
        if (valueLength === 1) {
            // Single digit: place in column stepNumber + 1 for product, stepNumber + 2 for remainder
            const col = isProduct ? stepNumber + 1 : stepNumber + 2;
            const cell = DOMReferences.gridCells[`r${row}c${col}`];
            if (cell) cell.textContent = valueStr;
        } else {
            // Multi-digit: align right
            const startCol = stepNumber + 1; // Start at column matching step number
            
            if (isProduct) {
                // Product row: align right starting from startCol
                for (let i = 0; i < valueLength; i++) {
                    const col = startCol - (valueLength - 1) + i;
                    const cell = DOMReferences.gridCells[`r${row}c${col}`];
                    if (cell && col >= 1 && col <= 5) {
                        cell.textContent = valueStr[i];
                    }
                }
            } else {
                // Remainder row: align right starting from startCol + 1
                for (let i = 0; i < valueLength; i++) {
                    const col = (startCol + 1) - (valueLength - 1) + i;
                    const cell = DOMReferences.gridCells[`r${row}c${col}`];
                    if (cell && col >= 1 && col <= 5) {
                        cell.textContent = valueStr[i];
                    }
                }
            }
        }
    }

    static debugRowStructure(n) {
        Debug.instance.log('Current grid structure:', {
            totalRows: 2 * n + 1,
            expectedRows: {
                'Row 1 (dividend)': 'data-step="0"',
                'Row 2 (product step 0)': 'data-step="1"',
                'Row 3 (remainder step 0)': 'data-step="1"',
                'Row 4 (product step 1)': 'data-step="2"',
                'Row 5 (remainder step 1)': 'data-step="2"',
                'Row 6 (product step 2)': 'data-step="3"',
                'Row 7 (remainder step 2)': 'data-step="3"'
            }
        });
        
        // Log which rows are actually visible
        for (let row = 1; row <= 10; row++) {
            const rowElement = document.querySelector(`[id^="r${row}c"]`)?.parentElement;
            if (rowElement) {
                Debug.instance.log(`Row ${row}:`, {
                    visible: rowElement.style.display !== 'none',
                    class: rowElement.className,
                    'data-step': rowElement.dataset.step
                });
            }
        }
    }
}

// ============================================================================
// Z = -3: ANIMATION LAYER (Simplified Version)
// ============================================================================
class Animations {
    static async _animateDigit(value, sourceElement, targetElement, animationType = 'bring-down') {
        return new Promise((resolve) => {
            if (!sourceElement || !targetElement) return resolve();
            
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            const animElement = document.createElement('div');
            animElement.className = 'digit-animation';
            animElement.textContent = value;
            
            // Calculate positions
            const fromLeft = sourceRect.left + sourceRect.width/2 + scrollX;
            const fromTop = sourceRect.top + sourceRect.height/2 + scrollY;
            const toLeft = targetRect.left + targetRect.width/2 + scrollX;
            const toTop = targetRect.top + targetRect.height/2 + scrollY;
            
            animElement.style.cssText = `
                left: ${fromLeft}px;
                top: ${fromTop}px;
                width: ${sourceRect.width}px;
                height: ${sourceRect.height}px;
            `;
            
            if (animationType === 'number-move') {
                animElement.style.color = '#e74c3c';
                animElement.style.borderColor = '#e74c3c';
            }
            
            document.body.appendChild(animElement);
            void animElement.offsetWidth;
            
            requestAnimationFrame(() => {
                animElement.style.left = `${toLeft}px`;
                animElement.style.top = `${toTop}px`;
                animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
                
                targetElement.classList.add('digit-highlight');
                
                setTimeout(() => {
                    // Only update target if it's a cell (not current step text)
                    if (targetElement.classList.contains('grid-cell')) {
                        targetElement.textContent = value;
                    }
                    
                    animElement.remove();
                    
                    setTimeout(() => {
                        targetElement.classList.remove('digit-highlight');
                        resolve();
                    }, 500);
                }, 500);
            });
        });
    }
    
    static async animateBringDown(nextDigit, sourceRow, sourceCol, targetRow, targetCol) {
        const sourceCell = DOMReferences.gridCells[`r${sourceRow}c${sourceCol}`];
        const targetCell = DOMReferences.gridCells[`r${targetRow}c${targetCol}`];
        
        if (!sourceCell || !targetCell) return;
        
        return this._animateDigit(nextDigit, sourceCell, targetCell, 'bring-down');
    }
    
    static async animateNumberToCell(value, sourceElement, targetCellId) {
        const targetCell = DOMReferences.gridCells[targetCellId];
        if (!targetCell) return;
        
        return this._animateDigit(value, sourceElement, targetCell, 'number-move');
    }
    
    static async animateNumberToCurrentStep(value, sourceElement) {
        // Find the current step equation element
        const equationEl = document.getElementById('currentStepEquation');
        if (!equationEl) return;
        
        // Create a temporary target span inside the equation
        const tempTarget = document.createElement('span');
        tempTarget.style.display = 'inline-block';
        tempTarget.style.padding = '2px';
        tempTarget.textContent = value;
        
        // Insert at the beginning of the equation
        equationEl.insertBefore(tempTarget, equationEl.firstChild);
        
        // Animate to it
        await this._animateDigit(value, sourceElement, tempTarget, 'number-move');
        
        // Remove the temporary span after animation
        setTimeout(() => tempTarget.remove(), 100);
    }
    
    static async animateFromEquationToGrid() {
        const equation = document.querySelector('.large-equation');
        if (!equation) return;
        
        const text = equation.textContent;
        const [dividend, divisor] = text.split(' ÷ ').map(num => parseInt(num));
        const digits = String(dividend).split('');
        
        // Animate divisor to divisor cell
        await this.animateNumberToCell(divisor, equation, 'divisor');
        
        // Animate each dividend digit to dividend row
        for (let i = 0; i < digits.length; i++) {
            await this.animateNumberToCell(digits[i], equation, `r1c${i+1}`);
        }
    }
    
    static async animateFocusOnCurrentStep() {
        return new Promise((resolve) => {
            const currentStepBox = document.querySelector('.current-step-container');
            if (!currentStepBox) {
                resolve();
                return;
            }
            
            // Use existing CSS for highlighting
            currentStepBox.classList.add('current-step-highlight');
            
            // Also highlight relevant grid cells for step 0
            if (State.currentProblem?.currentStep === 0) {
                if (DOMReferences.gridCells['r1c1']) DOMReferences.gridCells['r1c1'].classList.add('digit-highlight');
                if (DOMReferences.gridCells['divisor']) DOMReferences.gridCells['divisor'].classList.add('digit-highlight');
            }
            
            setTimeout(() => {
                currentStepBox.classList.remove('current-step-highlight');
                if (DOMReferences.gridCells['r1c1']) DOMReferences.gridCells['r1c1'].classList.remove('digit-highlight');
                if (DOMReferences.gridCells['divisor']) DOMReferences.gridCells['divisor'].classList.remove('digit-highlight');
                resolve();
            }, 1500);
        });
    }
    
    static async animateDigitToCurrentStep(digitValue, sourceCell) {
        const equationEl = document.getElementById('currentStepEquation');
        if (!equationEl || !sourceCell) return;
        
        // Create a highlight box in the current step
        const highlightBox = document.createElement('div');
        highlightBox.className = 'digit-highlight';
        highlightBox.style.cssText = `
            display: inline-block;
            padding: 5px 10px;
            margin: 0 5px;
            border-radius: 4px;
            font-size: 1.2em;
            font-weight: bold;
        `;
        highlightBox.textContent = digitValue;
        
        // Find where to insert it (before the "?" or at the end)
        const equationText = equationEl.textContent;
        if (equationText.includes('?')) {
            // Replace "?" with our highlighted digit
            const newText = equationText.replace('?', highlightBox.outerHTML);
            equationEl.innerHTML = newText;
            
            // Get the newly created element
            const insertedElement = equationEl.querySelector('.digit-highlight');
            if (insertedElement) {
                // Animate from source cell to this element
                await this._animateDigit(digitValue, sourceCell, insertedElement, 'number-move');
            }
        }
    }
}
// ============================================================================
// Z = -4: UI DISPLAY LAYER
// ============================================================================
class UI {
    static async updateProblemDisplay() {
        if (!State.currentProblem) return;
        
        const p = State.currentProblem;
        const dividend = p.dividend;
        const divisor = p.divisor;
        
        let currentStep = '', instruction = '';
        
        if (p.finished) {
            const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
            const remainder = p.steps[p.steps.length - 1]?.subtraction || 0;
            currentStep = `The answer is ${quotient} R ${remainder}`;
            instruction = 'Problem completed!';
        } else {
            switch (p.currentStep) {
                case 0:
                    currentStep = `${p.partial} ÷ ${divisor} = ?`;
                    instruction = `Find the largest multiple of ${divisor} ≤ ${p.partial}`;
                    
                    // Trigger animation for quotient step
                    if (p.partial > 0) {
                        setTimeout(() => this._animateQuotientStep(p), 100);
                    }
                    break;
                case 1:
                    const lastStep = p.steps[p.steps.length - 1];
                    if (lastStep) {
                        currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                        instruction = `Subtract: ${lastStep.partialBefore} - ${lastStep.product}`;
                        
                        // Trigger animation for subtraction step
                        setTimeout(() => this._animateSubtractionStep(p, lastStep), 100);
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
        
        // Update the display
        this._updateDisplay(dividend, divisor, currentStep, instruction);
    }
    
    static _updateDisplay(dividend, divisor, currentStep, instruction) {
        // Get or create elements
        let equationDisplay = DOMReferences.elements.problemDisplay.querySelector('.equation-display');
        let currentStepContainer = DOMReferences.elements.problemDisplay.querySelector('.current-step-container');
        
        if (!equationDisplay || !currentStepContainer) {
            DOMReferences.elements.problemDisplay.innerHTML = `
                <div class="equation-display">
                    <div class="large-equation">${dividend} ÷ ${divisor}</div>
                </div>
                <div class="current-step-container">
                    <div class="current-step-title">Current Step</div>
                    <div class="current-step-equation" id="currentStepEquation">${currentStep}</div>
                    <div class="current-instruction" id="currentInstruction">${instruction}</div>
                </div>
            `;
        } else {
            const largeEquation = equationDisplay.querySelector('.large-equation');
            const equationEl = document.getElementById('currentStepEquation');
            const instructionEl = document.getElementById('currentInstruction');
            
            if (largeEquation) largeEquation.textContent = `${dividend} ÷ ${divisor}`;
            if (equationEl) equationEl.textContent = currentStep;
            if (instructionEl) instructionEl.textContent = instruction;
        }
    }
    
    static async _animateQuotientStep(problem) {
        // Find the source cell (first digit of partial in dividend row)
        const partialStr = String(problem.partial);
        const firstDigit = partialStr[0];
        
        let sourceCell = null;
        for (let col = 1; col <= 5; col++) {
            const cell = DOMReferences.gridCells[`r1c${col}`];
            if (cell && cell.textContent === firstDigit) {
                sourceCell = cell;
                break;
            }
        }
        
        if (sourceCell) {
            // Wait a moment for display to update, then animate
            setTimeout(async () => {
                await Animations.animateDigitToCurrentStep(firstDigit, sourceCell);
            }, 300);
        }
    }

    static clearFeedback() {
        // Remove any feedback messages
        const feedbackMsg = document.querySelector('.feedback-message');
        if (feedbackMsg) feedbackMsg.remove();
        
        // Restore original number display if it exists
        const numberDisplay = document.querySelector('.number-display');
        if (numberDisplay) {
            if (numberDisplay.originalHTML) {
                numberDisplay.innerHTML = numberDisplay.originalHTML;
            }
            numberDisplay.classList.remove('showing-feedback');
        }
        
        // Clear any feedback classes
        document.querySelectorAll('.feedback-error, .feedback-success, .feedback-info').forEach(el => {
            el.remove();
        });
    }
    
    static async _animateSubtractionStep(problem, lastStep) {
        // Find the source cell (partialBefore in remainder row)
        const row = 3 + (lastStep.stepNumber * 2); // Row 3, 5, or 7
        const sourceCell = DOMReferences.gridCells[`r${row}c${lastStep.stepNumber + 1}`];
        
        if (sourceCell && sourceCell.textContent) {
            setTimeout(async () => {
                await Animations.animateDigitToCurrentStep(lastStep.partialBefore, sourceCell);
            }, 300);
        }
    }
    
    static updateGuessDisplay() {
        const guessDisplayElement = document.getElementById('currentGuessDisplay');
        if (guessDisplayElement) {
            guessDisplayElement.textContent = State.currentGuess;
        }
    }
    
    static adjustGuess(delta) {
        if (!State.currentProblem || State.currentProblem.finished) return;
        const newGuess = State.currentGuess + delta;
        if (newGuess >= 0 && newGuess <= 99) {
            State.currentGuess = newGuess;
            this.updateGuessDisplay();
        }
    }
    
    static clearGuess() {
        State.currentGuess = 0;
        this.updateGuessDisplay();
    }
}

// ============================================================================
// Z = -5: GAME LOGIC LAYER
// ============================================================================
class GameLogic {
    static async processQuotientInput() {
        const problem = State.currentProblem;
        const correctDigit = MathUtils.calculateQuotientDigit(problem.partial, problem.divisor);
        const correctProduct = MathUtils.calculateProduct(correctDigit, problem.divisor);
        
        if (State.currentGuess % problem.divisor !== 0) {
            State.mistakeCount++; State.currentStreak = 0;
            await Feedback.showFeedback(`${State.currentGuess} not a multiple of ${problem.divisor}`, 'error');
            State.updateScoreDisplay(); return;
        }
        
        if (State.currentGuess > problem.partial) {
            State.mistakeCount++; State.currentStreak = 0;
            await Feedback.showFeedback(`${State.currentGuess} > ${problem.partial}`, 'error');
            State.updateScoreDisplay(); return;
        }
        
        if (State.currentGuess !== correctProduct) {
            State.mistakeCount++; State.currentStreak = 0;
            await Feedback.showFeedback(`Incorrect.`, 'error');
            State.updateScoreDisplay(); return;
        }

        const quotientDigit = State.currentGuess / problem.divisor;
        const stepNumber = problem.quotientDigits.length;
        
        problem.quotientDigits.push(quotientDigit);
        problem.steps.push({
            stepNumber,
            digit: quotientDigit,
            partialBefore: problem.partial,
            product: State.currentGuess,
            subtraction: problem.partial - State.currentGuess,
            digitIndex: problem.currentDigitIndex
        });
        
        GridManager.updateQuotientInGrid(stepNumber, quotientDigit);
        GridManager.updateProductInGrid(stepNumber, State.currentGuess);
        await Feedback.showFeedback(`✓ ${quotientDigit} × ${problem.divisor} = ${State.currentGuess}`, 'success');
        
        problem.currentStep = 1;
        State.currentGuess = 0;
        UI.updateProblemDisplay();
        UI.updateGuessDisplay();
    }
    
    static async processSubtraction() {
        const problem = State.currentProblem;
        const lastStep = problem.steps[problem.steps.length - 1];
        if (!lastStep) return;
        
        const expectedRemainder = MathUtils.calculateRemainder(lastStep.partialBefore, lastStep.product);
        const stepNumber = lastStep.stepNumber;
        
        if (State.currentGuess !== expectedRemainder) {
            State.mistakeCount++; State.currentStreak = 0;
            await Feedback.showFeedback(`✗ ${lastStep.partialBefore} - ${lastStep.product} ≠ ${State.currentGuess}`, 'error');
            State.updateScoreDisplay(); return;
        }
        
        GridManager.updateRemainderInGrid(stepNumber, expectedRemainder);
        problem.partial = expectedRemainder;
        await Feedback.showFeedback(`✓ ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'success');
        
        problem.currentStep = 2;
        State.currentGuess = 0;
        
        if (MathUtils.shouldBringDownNextDigit(problem.currentDigitIndex, problem.n)) {
            const nextDigit = problem.digits[problem.currentDigitIndex + 1];
            ButtonManager.transformToBringDownButton(nextDigit);
            await Feedback.showFeedback(`Bring down ${nextDigit}`, 'info');
        } else {
            await this.completeProblem();
        }
        
        UI.updateProblemDisplay();
        UI.updateGuessDisplay();
    }
    
    static async executeBringDown(nextDigit) {
        const problem = State.currentProblem;
        if (problem.currentDigitIndex >= problem.n - 1) { await this.completeProblem(); return; }
        if (problem.currentStep !== 2) return;
        
        const expectedDigit = problem.digits[problem.currentDigitIndex + 1];
        if (nextDigit !== expectedDigit) return;
        
        ButtonManager.hideBringDownButton();
        problem.partial = MathUtils.getNextPartial(problem.partial, nextDigit);
        
        const stepNumber = problem.steps.length - 1;
        await ButtonManager.updateBringDownInGrid(stepNumber, nextDigit);
        await Feedback.showFeedback(`✓ Brought down ${nextDigit}. New: ${problem.partial}`, 'success');
        
        problem.currentStep = 0;
        problem.currentDigitIndex++;
        State.currentGuess = 0;
        ButtonManager.restoreCommitButton();
        UI.updateProblemDisplay();
        UI.updateGuessDisplay();
    }
    
    static async completeProblem() {
        const problem = State.currentProblem;
        problem.finished = true;
        const finalRemainder = problem.partial;
        
        if (DOMReferences.gridCells['ans-rem']) DOMReferences.gridCells['ans-rem'].textContent = finalRemainder;
        
        State.solvedCount++; State.currentStreak++;
        const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
        await Feedback.showFeedback(`🎉 Complete! ${problem.dividend} ÷ ${problem.divisor} = ${quotient} R ${finalRemainder}`, 'success');
        State.updateScoreDisplay();
        UI.updateProblemDisplay();
    }
}

// ============================================================================
// Z = -6: FEEDBACK & MESSAGING LAYER
// ============================================================================
class Feedback {
    static async showFeedback(message, type = 'error') {
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
    
    static clearFeedback() {
        // Clear all feedback elements
        const feedbackElements = document.querySelectorAll('.feedback-error, .feedback-success, .feedback-info');
        feedbackElements.forEach(el => el.remove());
        
        // Restore number display
        const numberDisplay = document.querySelector('.number-display');
        if (numberDisplay && numberDisplay.originalHTML) {
            numberDisplay.innerHTML = numberDisplay.originalHTML;
            numberDisplay.classList.remove('showing-feedback');
        }
    }
}

// ============================================================================
// Z = -7: BUTTON & CONTROL LAYER
// ============================================================================
class ButtonManager {
    static setupButtonHandlers() {
        DOMReferences.elements.newProblemBtn.addEventListener('click', async () => {
            await DivisionLogic.generateNewProblem();
        });
        DOMReferences.elements.resetProblemBtn.addEventListener('click', this.resetCurrentProblem);
        DOMReferences.elements.resetScoresBtn.addEventListener('click', State.resetAllScores);
        
        this.createControlButtons();
    }
    
    static createControlButtons() {
        this.setupControlButtonListeners();
        UI.updateGuessDisplay();
        State.commitButton = DOMReferences.elements.commitGuessBtn;
    }
    
    static setupControlButtonListeners() {
        document.querySelectorAll('[data-change]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!State.currentProblem || State.currentProblem.finished) return;
                const delta = parseInt(btn.dataset.change);
                UI.adjustGuess(delta);
            });
        });
        
        DOMReferences.elements.clearGuessBtn.addEventListener('click', UI.clearGuess);
        DOMReferences.elements.commitGuessBtn.addEventListener('click', this.commitGuess);
    }
    
    static async commitGuess() {
        if (!State.currentProblem) {
            Feedback.showFeedback('No problem loaded. Click "New Problem"', 'error');
            return;
        }
        if (State.currentProblem.finished) {
            Feedback.showFeedback('Problem already completed!', 'info');
            return;
        }
        
        const p = State.currentProblem;
        if (p.currentStep === 0) await GameLogic.processQuotientInput();
        else if (p.currentStep === 1) await GameLogic.processSubtraction();
        else if (p.currentStep === 2) Debug.instance.log('In bring down phase');
    }
    
    static transformToBringDownButton(nextDigit) {
        if (!State.commitButton) return;
        State.commitButton.disabled = true;
        
        if (!State.commitButton.originalHTML) {
            State.commitButton.originalHTML = State.commitButton.innerHTML;
            State.commitButton.originalOnClick = State.commitButton.onclick;
        }
        
        State.commitButton.innerHTML = `<span class="bring-down-icon">↓</span><span class="bring-down-text">Bring Down ${nextDigit}</span>`;
        State.commitButton.style.cssText = `background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none;
            border-radius: 8px; padding: 12px 24px; font-size: 18px; font-weight: bold; cursor: pointer; display: flex;
            align-items: center; justify-content: center; gap: 10px; margin: 10px auto; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3); width: 100%;`;
        
        State.commitButton.onclick = () => { State.commitButton.disabled = true; GameLogic.executeBringDown(nextDigit); };
        setTimeout(() => { State.commitButton.disabled = false; }, 300);
    }
    
    static restoreCommitButton() {
        if (!State.commitButton || !State.commitButton.originalHTML) return;
        State.commitButton.disabled = false;
        State.commitButton.innerHTML = State.commitButton.originalHTML;
        State.commitButton.onclick = State.commitButton.originalOnClick;
        State.commitButton.style.cssText = `width: 100%; padding: 15px; background-color: #007bff; color: white; border: none;
            border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;`;
        delete State.commitButton.originalHTML;
        delete State.commitButton.originalOnClick;
    }
    
    static hideBringDownButton() {
        const existingBtn = document.getElementById('bringDownBtn');
        if (existingBtn) existingBtn.remove();
    }
    
    static async updateBringDownInGrid(stepNumber, nextDigit) {
        const rowMap = {0: 3, 1: 5, 2: 7};
        const row = rowMap[stepNumber];
        if (row === undefined) return Promise.resolve();
        
        // Find the target column: it should be in the next available column
        // after the current remainder
        const targetCol = stepNumber + 2; // One column to the right of current working area
        
        const sourceRow = 1; // Dividend row
        const sourceCol = stepNumber + 2; // Next digit in dividend
        
        // Check if target cell exists and is empty
        const targetCell = DOMReferences.gridCells[`r${row}c${targetCol}`];
        if (!targetCell || targetCell.style.display === 'none') {
            return Promise.resolve();
        }
        
        // Clear any existing content in target cell
        targetCell.textContent = '';
        
        // Animate the digit
        return Animations.animateBringDown(nextDigit, sourceRow, sourceCol, row, targetCol).then(() => {
            targetCell.textContent = nextDigit;
        });
    }
    
    static resetCurrentProblem() {
        if (State.currentProblem) {
            DivisionLogic.initializeDivisionState(State.currentProblem.dividend, State.currentProblem.divisor);
        }
    }
}

// ============================================================================
// Z = -8: STYLE & CSS LAYER
// ============================================================================
class Styles {
    static addAnimationStyles() {
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
}


// ============================================================================
// Z = -9: INITIALIZATION LAYER
// ============================================================================
class App {
    static init() {
        // Initialize debug first
        Debug.instance = new Debug(Config.DEBUG);
        Debug.instance.log('Division practice initialized');
        
        // Initialize all components
        DOMReferences.initialize();
        // Note: We removed Styles.addAnimationStyles() since CSS is in separate file
        State.updateScoreDisplay();
        ButtonManager.setupButtonHandlers();
        DivisionLogic.generateNewProblem();  // This should work now
    }
}

// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', App.init);
