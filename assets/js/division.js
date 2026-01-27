// ============================================================================
// Z = +3: CONFIGURATION & CONSTANTS LAYER
// ============================================================================
class Config {
    static DEBUG = true;
    static MAX_DIVIDEND = 999;
    static MIN_DIVIDEND = 100;
    static MAX_DIVISOR = 99;
    static MIN_DIVISOR = 2;
    static GRID_ROWS = 12;
    static GRID_COLS = 9;
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
    static calculateQuotientDigit(partial, divisor) { 
        return Math.floor(partial / divisor); 
    }
    
    static calculateProduct(quotientDigit, divisor) { 
        return quotientDigit * divisor; 
    }
    
    static calculateRemainder(partial, product) { 
        return partial - product; 
    }
    
    static shouldBringDownNextDigit(currentDigitIndex, totalDigits) { 
        return currentDigitIndex < totalDigits - 1; 
    }
    
    static getNextPartial(currentPartial, nextDigit) { 
        return currentPartial * 10 + nextDigit; 
    }
    
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// ============================================================================
// Z = +1: DOM ELEMENT REFERENCES LAYER (UPDATED FOR 12x9 GRID)
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
        guessDisplay: document.getElementById('currentGuessDisplay'),
        mainEquation: document.getElementById('mainEquation'),
        currentStepEquation: document.getElementById('currentStepEquation'),
        currentInstruction: document.getElementById('currentInstruction')
    };
    
    static gridCells = {};
    static workGrid = null;
    
    static initialize() {
        Debug.instance.log('Initializing DOM references for 12x9 grid');
        
        // Get the main grid
        this.workGrid = document.getElementById('divisionGrid');
        this.gridCells = {};
        
        // Initialize all grid cells r1c1 through r12c9
        for (let row = 1; row <= Config.GRID_ROWS; row++) {
            for (let col = 1; col <= Config.GRID_COLS; col++) {
                const cellId = `r${row}c${col}`;
                this.gridCells[cellId] = document.getElementById(cellId);
                
                // Debug logging for missing cells
                if (!this.gridCells[cellId] && Config.DEBUG) {
                    console.warn(`Missing cell: ${cellId}`);
                }
            }
        }
        
        Debug.instance.log(`Initialized ${Object.keys(this.gridCells).length} grid cells`);
        
        // Verify key elements exist
        const requiredElements = [
            'mainEquation',
            'currentStepEquation',
            'currentInstruction',
            'commitGuessBtn'
        ];
        
        requiredElements.forEach(id => {
            if (!this.elements[id]) {
                console.error(`Missing required element: ${id}`);
            }
        });
    }
    
    static getGridCell(row, col) {
        const cellId = `r${row}c${col}`;
        const cell = this.gridCells[cellId];
        if (!cell && Config.DEBUG) {
            console.warn(`Cell not found: ${cellId}`);
        }
        return cell;
    }
    
    static getQuotientCell(position) {
        // Quotient digits are in row 1, columns 1-3
        return this.getGridCell(1, position + 1);
    }
    
    static getDividendCell(position) {
        // Dividend digits are in row 3, columns 4-9
        return this.getGridCell(3, position + 4);
    }
    
    static getProductCell(step, position) {
        // Product rows are 4, 6, 8, 10 (even rows starting from 4)
        const row = 4 + (step * 2);
        return this.getGridCell(row, position + 4);
    }
    
    static getRemainderCell(step, position) {
        // Remainder rows are 5, 7, 9, 11 (odd rows starting from 5)
        const row = 5 + (step * 2);
        return this.getGridCell(row, position + 4);
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
        if (DOMReferences.elements.solvedCountEl) {
            DOMReferences.elements.solvedCountEl.textContent = this.solvedCount;
        }
        if (DOMReferences.elements.mistakeCountEl) {
            DOMReferences.elements.mistakeCountEl.textContent = this.mistakeCount;
        }
        if (DOMReferences.elements.currentStreakEl) {
            DOMReferences.elements.currentStreakEl.textContent = this.currentStreak;
        }
        
        if (DOMReferences.elements.divisionAccuracyEl) {
            const total = this.solvedCount + this.mistakeCount;
            const accuracy = total > 0 ? Math.round((this.solvedCount / total) * 100) : 0;
            DOMReferences.elements.divisionAccuracyEl.textContent = accuracy + '%';
        }
        
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
        Debug.instance.log('Generating new problem for 12x9 grid');
        
        let divisor = Math.floor(Math.random() * (Config.MAX_DIVISOR - Config.MIN_DIVISOR + 1)) + Config.MIN_DIVISOR;
        let dividend;
        
        do {
            dividend = Math.floor(Math.random() * (Config.MAX_DIVIDEND - Config.MIN_DIVIDEND + 1)) + Config.MIN_DIVIDEND;
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
        
        // Reset the grid
        GridManager.resetGrid();
        
        // Initialize problem state
        State.currentProblem = {
            dividend,
            divisor,
            digits,
            n,
            currentStep: 0,
            currentDigitIndex: 0,
            partial: digits[0],
            quotientDigits: [],
            steps: [],
            finished: false,
            maxDigits: 6  // C4-C9 can hold 6 digits
        };
        
        Debug.instance.log('Current problem state initialized', State.currentProblem);
        
        // Update the main display
        this.updateMainDisplay(dividend, divisor);
        
        // Update current step display
        this.updateCurrentStepDisplay();
        
        // Place initial values in grid
        GridManager.placeInitialValues(dividend, divisor);
        
        // Reset guess
        State.currentGuess = 0;
        UI.updateGuessDisplay();
        Feedback.clearFeedback();
        
        // Restore commit button
        ButtonManager.restoreCommitButton();
    }
    
    static updateMainDisplay(dividend, divisor) {
        if (DOMReferences.elements.mainEquation) {
            DOMReferences.elements.mainEquation.textContent = 
                `${MathUtils.formatNumber(dividend)} ÷ ${MathUtils.formatNumber(divisor)}`;
        }
    }
    
    static updateCurrentStepDisplay() {
        if (!State.currentProblem || !DOMReferences.elements.currentStepEquation) return;
        
        const p = State.currentProblem;
        
        if (p.finished) {
            const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
            const remainder = p.steps[p.steps.length - 1]?.subtraction || 0;
            this.setCurrentStep(
                `The answer is ${quotient} R ${remainder}`,
                'Problem completed!'
            );
        } else {
            switch (p.currentStep) {
                case 0:
                    this.setCurrentStep(
                        `${p.partial} ÷ ${p.divisor} = ?`,
                        `Find the largest multiple of ${p.divisor} ≤ ${p.partial}`
                    );
                    break;
                case 1:
                    const lastStep = p.steps[p.steps.length - 1];
                    if (lastStep) {
                        this.setCurrentStep(
                            `${lastStep.partialBefore} - ${lastStep.product} = ?`,
                            `Subtract: ${lastStep.partialBefore} - ${lastStep.product}`
                        );
                    }
                    break;
                case 2:
                    if (p.currentDigitIndex >= p.n - 1) {
                        this.setCurrentStep(
                            "Complete the problem",
                            "No more digits to bring down"
                        );
                    } else {
                        const nextDigit = p.digits[p.currentDigitIndex + 1];
                        this.setCurrentStep(
                            `Bring down ${nextDigit}`,
                            `Click "Bring Down" to bring down ${nextDigit}`
                        );
                    }
                    break;
            }
        }
    }
    
    static setCurrentStep(equation, instruction) {
        if (DOMReferences.elements.currentStepEquation) {
            DOMReferences.elements.currentStepEquation.textContent = equation;
        }
        if (DOMReferences.elements.currentInstruction) {
            DOMReferences.elements.currentInstruction.textContent = instruction;
        }
    }
}

// ============================================================================
// Z = -2: GRID MANAGEMENT LAYER (UPDATED FOR 12x9)
// ============================================================================
class GridManager {
    static resetGrid() {
        Debug.instance.log('Resetting 12x9 grid to initial state');
        
        // Clear all grid cells
        for (let row = 1; row <= Config.GRID_ROWS; row++) {
            for (let col = 1; col <= Config.GRID_COLS; col++) {
                const cell = DOMReferences.getGridCell(row, col);
                if (cell) {
                    cell.textContent = '';
                    cell.className = 'grid-cell'; // Reset to base class
                    
                    // Add color classes based on position
                    this.applyCellColor(cell, row, col);
                    
                    // Show all cells
                    cell.style.display = 'flex';
                }
            }
        }
        
        // Set remainder label
        const remainderLabel = DOMReferences.getGridCell(1, 7);
        if (remainderLabel) {
            remainderLabel.textContent = 'R';
            remainderLabel.className = 'grid-cell green';
        }
        
        // Set final remainder cell
        const finalRemainder = DOMReferences.getGridCell(1, 8);
        if (finalRemainder) {
            finalRemainder.textContent = '?';
            remainderLabel.className = 'grid-cell green';
        }
    }
    
    static applyCellColor(cell, row, col) {
        // Remove all color classes
        cell.classList.remove('blue', 'green', 'orange', 'pink', 'yellow', 'empty');
        
        // Apply colors based on position in the division layout
        if (row === 1) {
            // Answer row: columns 1-3 = quotient, 4-6 = lines, 7 = R, 8 = remainder, 9 = empty
            if (col <= 3 || col === 7 || col === 8) {
                cell.classList.add('green');
            } else if (col <= 6) {
                cell.classList.add('empty');
                cell.style.borderBottom = '2px solid #000';
            } else {
                cell.classList.add('empty');
            }
        } else if (row === 2) {
            // Line row
            cell.classList.add('empty');
            if (col >= 4 && col <= 6) {
                cell.style.borderBottom = '2px solid #000';
            }
        } else if (row === 3) {
            // Divisor and dividend row
            if (col <= 2) {
                cell.classList.add('blue'); // Divisor
            } else if (col === 3) {
                cell.classList.add('empty'); // Vertical/horizontal line cell
                cell.style.borderRight = '2px solid #000';
                cell.style.borderBottom = '2px solid #000';
            } else {
                cell.classList.add('orange'); // Dividend
            }
        } else if (row >= 4 && row <= 11) {
            // Calculation rows
            if (row % 2 === 0) {
                // Even rows: products (pink)
                cell.classList.add(col >= 4 ? 'pink' : 'empty');
            } else {
                // Odd rows: remainders (yellow)
                cell.classList.add(col >= 4 ? 'yellow' : 'empty');
            }
        } else if (row === 12) {
            // Final output row
            cell.classList.add(col >= 4 ? 'green' : 'empty');
        }
    }
    
    static placeInitialValues(dividend, divisor) {
        // Place divisor in C1-C2 of row 3
        const divisorStr = divisor.toString().padStart(2, ' ');
        for (let i = 0; i < 2; i++) {
            const cell = DOMReferences.getGridCell(3, i + 1);
            if (cell) {
                cell.textContent = divisorStr[i] !== ' ' ? divisorStr[i] : '';
            }
        }
        
        // Place dividend in C4-C9 of row 3
        const dividendStr = dividend.toString().padStart(6, ' ');
        for (let i = 0; i < 6; i++) {
            const cell = DOMReferences.getGridCell(3, i + 4);
            if (cell) {
                cell.textContent = dividendStr[i] !== ' ' ? dividendStr[i] : '';
            }
        }
    }
    
    static updateQuotientDigit(step, value) {
        const cell = DOMReferences.getQuotientCell(step);
        if (cell) {
            cell.textContent = value;
        }
    }
    
    static updateProduct(step, product) {
        const productStr = product.toString();
        const startCol = 9 - productStr.length; // Align right in columns 4-9
        
        for (let i = 0; i < productStr.length; i++) {
            const cell = DOMReferences.getProductCell(step, startCol - 4 + i);
            if (cell) {
                cell.textContent = productStr[i];
            }
        }
    }
    
    static updateRemainder(step, remainder) {
        const remainderStr = remainder.toString();
        const startCol = 9 - remainderStr.length; // Align right in columns 4-9
        
        for (let i = 0; i < remainderStr.length; i++) {
            const cell = DOMReferences.getRemainderCell(step, startCol - 4 + i);
            if (cell) {
                cell.textContent = remainderStr[i];
            }
        }
    }
    
    static updateFinalRemainder(remainder) {
        const cell = DOMReferences.getGridCell(1, 8);
        if (cell) {
            cell.textContent = remainder;
        }
    }
    
    static debugGridStructure() {
        Debug.instance.log('Grid structure:', {
            totalRows: Config.GRID_ROWS,
            totalCols: Config.GRID_COLS,
            layout: {
                'Row 1': 'Answer row (quotient + remainder)',
                'Row 2': 'Horizontal line row',
                'Row 3': 'Divisor (C1-C2) + Dividend (C4-C9)',
                'Rows 4-11': 'Calculation steps (product/remainder pairs)',
                'Row 12': 'Final output'
            }
        });
        
        // Log which cells have content
        const cellsWithContent = [];
        for (let row = 1; row <= Config.GRID_ROWS; row++) {
            for (let col = 1; col <= Config.GRID_COLS; col++) {
                const cell = DOMReferences.getGridCell(row, col);
                if (cell && cell.textContent.trim()) {
                    cellsWithContent.push(`${row},${col}: "${cell.textContent}"`);
                }
            }
        }
        
        Debug.instance.log('Cells with content:', cellsWithContent);
    }
}

// ============================================================================
// Z = -3: ANIMATION LAYER (Simplified for now)
// ============================================================================
class Animations {
    static async animateFocusOnCurrentStep() {
        return new Promise((resolve) => {
            const currentStepBox = document.querySelector('.current-step-container');
            if (!currentStepBox) {
                resolve();
                return;
            }
            
            currentStepBox.classList.add('current-step-highlight');
            
            setTimeout(() => {
                currentStepBox.classList.remove('current-step-highlight');
                resolve();
            }, 1500);
        });
    }
    
    static async animateDigitMove(value, sourceCell, targetCell) {
        return new Promise((resolve) => {
            if (!sourceCell || !targetCell) return resolve();
            
            // Simple highlight animation for now
            targetCell.classList.add('digit-highlight');
            
            setTimeout(() => {
                targetCell.classList.remove('digit-highlight');
                resolve();
            }, 500);
        });
    }
}

// ============================================================================
// Z = -4: UI DISPLAY LAYER
// ============================================================================
class UI {
    static updateGuessDisplay() {
        if (DOMReferences.elements.guessDisplay) {
            DOMReferences.elements.guessDisplay.textContent = State.currentGuess;
        }
    }
    
    static adjustGuess(delta) {
        if (!State.currentProblem || State.currentProblem.finished) return;
        const newGuess = State.currentGuess + delta;
        if (newGuess >= 0 && newGuess <= 999) {
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
        if (!problem) return;
        
        const correctDigit = MathUtils.calculateQuotientDigit(problem.partial, problem.divisor);
        const correctProduct = MathUtils.calculateProduct(correctDigit, problem.divisor);
        
        // Validate input
        if (State.currentGuess % problem.divisor !== 0) {
            State.mistakeCount++;
            State.currentStreak = 0;
            await Feedback.showFeedback(`${State.currentGuess} not a multiple of ${problem.divisor}`, 'error');
            State.updateScoreDisplay();
            return;
        }
        
        if (State.currentGuess > problem.partial) {
            State.mistakeCount++;
            State.currentStreak = 0;
            await Feedback.showFeedback(`${State.currentGuess} > ${problem.partial}`, 'error');
            State.updateScoreDisplay();
            return;
        }
        
        if (State.currentGuess !== correctProduct) {
            State.mistakeCount++;
            State.currentStreak = 0;
            await Feedback.showFeedback(`Incorrect. Try again.`, 'error');
            State.updateScoreDisplay();
            return;
        }

        // Correct answer
        const quotientDigit = State.currentGuess / problem.divisor;
        const stepNumber = problem.quotientDigits.length;
        
        // Update problem state
        problem.quotientDigits.push(quotientDigit);
        problem.steps.push({
            stepNumber,
            digit: quotientDigit,
            partialBefore: problem.partial,
            product: State.currentGuess,
            subtraction: problem.partial - State.currentGuess,
            digitIndex: problem.currentDigitIndex
        });
        
        // Update grid
        GridManager.updateQuotientDigit(stepNumber, quotientDigit);
        GridManager.updateProduct(stepNumber, State.currentGuess);
        
        // Show feedback
        await Feedback.showFeedback(`✓ ${quotientDigit} × ${problem.divisor} = ${State.currentGuess}`, 'success');
        
        // Move to next step
        problem.currentStep = 1;
        State.currentGuess = 0;
        
        // Update displays
        DivisionLogic.updateCurrentStepDisplay();
        UI.updateGuessDisplay();
    }
    
    static async processSubtraction() {
        const problem = State.currentProblem;
        if (!problem) return;
        
        const lastStep = problem.steps[problem.steps.length - 1];
        if (!lastStep) return;
        
        const expectedRemainder = MathUtils.calculateRemainder(lastStep.partialBefore, lastStep.product);
        const stepNumber = lastStep.stepNumber;
        
        if (State.currentGuess !== expectedRemainder) {
            State.mistakeCount++;
            State.currentStreak = 0;
            await Feedback.showFeedback(`✗ ${lastStep.partialBefore} - ${lastStep.product} ≠ ${State.currentGuess}`, 'error');
            State.updateScoreDisplay();
            return;
        }
        
        // Correct subtraction
        GridManager.updateRemainder(stepNumber, expectedRemainder);
        problem.partial = expectedRemainder;
        
        await Feedback.showFeedback(`✓ ${lastStep.partialBefore} - ${lastStep.product} = ${expectedRemainder}`, 'success');
        
        // Move to next step
        problem.currentStep = 2;
        State.currentGuess = 0;
        
        if (MathUtils.shouldBringDownNextDigit(problem.currentDigitIndex, problem.n)) {
            const nextDigit = problem.digits[problem.currentDigitIndex + 1];
            ButtonManager.transformToBringDownButton(nextDigit);
            await Feedback.showFeedback(`Bring down ${nextDigit}`, 'info');
        } else {
            await this.completeProblem();
        }
        
        DivisionLogic.updateCurrentStepDisplay();
        UI.updateGuessDisplay();
    }
    
    static async executeBringDown(nextDigit) {
        const problem = State.currentProblem;
        if (!problem) return;
        
        if (problem.currentDigitIndex >= problem.n - 1) {
            await this.completeProblem();
            return;
        }
        
        if (problem.currentStep !== 2) return;
        
        const expectedDigit = problem.digits[problem.currentDigitIndex + 1];
        if (nextDigit !== expectedDigit) return;
        
        ButtonManager.hideBringDownButton();
        problem.partial = MathUtils.getNextPartial(problem.partial, nextDigit);
        
        // For now, just show feedback - we can add animation later
        await Feedback.showFeedback(`✓ Brought down ${nextDigit}. New partial: ${problem.partial}`, 'success');
        
        problem.currentStep = 0;
        problem.currentDigitIndex++;
        State.currentGuess = 0;
        
        ButtonManager.restoreCommitButton();
        DivisionLogic.updateCurrentStepDisplay();
        UI.updateGuessDisplay();
    }
    
    static async completeProblem() {
        const problem = State.currentProblem;
        if (!problem) return;
        
        problem.finished = true;
        const finalRemainder = problem.partial;
        
        // Update grid with final remainder
        GridManager.updateFinalRemainder(finalRemainder);
        
        // Update scores
        State.solvedCount++;
        State.currentStreak++;
        
        const quotient = problem.quotientDigits.join('').replace(/^0+/, '') || '0';
        await Feedback.showFeedback(
            `🎉 Complete! ${problem.dividend} ÷ ${problem.divisor} = ${quotient} R ${finalRemainder}`,
            'success'
        );
        
        State.updateScoreDisplay();
        DivisionLogic.updateCurrentStepDisplay();
    }
}

// ============================================================================
// Z = -6: FEEDBACK & MESSAGING LAYER
// ============================================================================
class Feedback {
    static async showFeedback(message, type = 'error') {
        const workFeedback = DOMReferences.elements.workFeedback;
        if (!workFeedback) return new Promise(resolve => resolve());
        
        // Create feedback element
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-${type}`;
        feedbackEl.textContent = message;
        feedbackEl.style.cssText = `
            padding: var(--space-sm);
            margin: var(--space-sm) 0;
            border-radius: 6px;
            animation: fadeIn 0.3s ease-in;
        `;
        
        // Add to work feedback area
        workFeedback.prepend(feedbackEl);
        
        return new Promise(resolve => setTimeout(() => {
            feedbackEl.remove();
            resolve();
        }, type === 'error' ? 4000 : 2000));
    }
    
    static clearFeedback() {
        const feedbackElements = document.querySelectorAll('.feedback-error, .feedback-success, .feedback-info');
        feedbackElements.forEach(el => el.remove());
    }
}

// ============================================================================
// Z = -7: BUTTON & CONTROL LAYER
// ============================================================================
class ButtonManager {
    static setupButtonHandlers() {
        if (DOMReferences.elements.newProblemBtn) {
            DOMReferences.elements.newProblemBtn.addEventListener('click', async () => {
                await DivisionLogic.generateNewProblem();
            });
        }
        
        if (DOMReferences.elements.resetProblemBtn) {
            DOMReferences.elements.resetProblemBtn.addEventListener('click', () => {
                if (State.currentProblem) {
                    DivisionLogic.initializeDivisionState(
                        State.currentProblem.dividend,
                        State.currentProblem.divisor
                    );
                }
            });
        }
        
        if (DOMReferences.elements.resetScoresBtn) {
            DOMReferences.elements.resetScoresBtn.addEventListener('click', State.resetAllScores);
        }
        
        this.createControlButtons();
    }
    
    static createControlButtons() {
        this.setupControlButtonListeners();
        UI.updateGuessDisplay();
        State.commitButton = DOMReferences.elements.commitGuessBtn;
    }
    
    static setupControlButtonListeners() {
        // Number adjustment buttons
        document.querySelectorAll('[data-change]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!State.currentProblem || State.currentProblem.finished) return;
                const delta = parseInt(btn.dataset.change);
                UI.adjustGuess(delta);
            });
        });
        
        // Clear button
        if (DOMReferences.elements.clearGuessBtn) {
            DOMReferences.elements.clearGuessBtn.addEventListener('click', UI.clearGuess);
        }
        
        // Commit button
        if (DOMReferences.elements.commitGuessBtn) {
            DOMReferences.elements.commitGuessBtn.addEventListener('click', this.commitGuess);
        }
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
        if (p.currentStep === 0) {
            await GameLogic.processQuotientInput();
        } else if (p.currentStep === 1) {
            await GameLogic.processSubtraction();
        } else if (p.currentStep === 2) {
            Debug.instance.log('In bring down phase');
        }
    }
    
    static transformToBringDownButton(nextDigit) {
        if (!State.commitButton) return;
        
        // Save original state
        if (!State.commitButton.originalHTML) {
            State.commitButton.originalHTML = State.commitButton.innerHTML;
            State.commitButton.originalOnClick = State.commitButton.onclick;
        }
        
        // Update button
        State.commitButton.innerHTML = `↓ Bring Down ${nextDigit}`;
        State.commitButton.style.backgroundColor = '#3498db';
        
        // Set new click handler
        State.commitButton.onclick = () => {
            GameLogic.executeBringDown(nextDigit);
        };
    }
    
    static hideBringDownButton() {
        // We'll handle this differently - just restore the button
        this.restoreCommitButton();
    }
    
    static restoreCommitButton() {
        if (!State.commitButton || !State.commitButton.originalHTML) return;
        
        State.commitButton.innerHTML = State.commitButton.originalHTML;
        State.commitButton.style.backgroundColor = '';
        State.commitButton.onclick = State.commitButton.originalOnClick;
        
        delete State.commitButton.originalHTML;
        delete State.commitButton.originalOnClick;
    }
}

// ============================================================================
// Z = -8: STYLE & CSS LAYER
// ============================================================================
class Styles {
    static addAnimationStyles() {
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
            
            .current-step-highlight {
                animation: digitPulse 1.5s ease-in-out;
                background-color: #e3f2fd !important;
                border: 2px solid #3498db !important;
            }
            
            .feedback-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .feedback-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .feedback-info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================================================
// Z = -9: INITIALIZATION LAYER
// ============================================================================
class App {
    static init() {
        // Initialize debug
        Debug.instance = new Debug(Config.DEBUG);
        Debug.instance.log('Division Practice Initialized - 12x9 Grid Version');
        
        // Initialize all components
        DOMReferences.initialize();
        Styles.addAnimationStyles();
        State.updateScoreDisplay();
        ButtonManager.setupButtonHandlers();
        
        // Generate initial problem
        setTimeout(() => {
            DivisionLogic.generateNewProblem();
            GridManager.debugGridStructure();
        }, 500);
    }
}

// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', App.init);
