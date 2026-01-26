// division-refactored.js - Clean Z-Layer Architecture

// ============================================================================
// Z = +2: CONFIGURATION LAYER (Global Constants & Configuration)
// ============================================================================
const CONFIG = {
    DEBUG: true,
    MAX_DIVIDEND: 999,
    MIN_DIVIDEND: 10,
    MAX_DIVISOR: 15,
    MIN_DIVISOR: 1,
    GRID_ROWS: 10,
    GRID_COLS: 5,
    ANIMATION_DURATION: 500,
    FEEDBACK_DELAYS: {
        error: 4000,
        success: 2000,
        info: 2000
    }
};

// ============================================================================
// Z = +1: ABSTRACTION LAYER (Pure Functions & Domain Logic)
// ============================================================================
class DivisionMath {
    static generateProblem() {
        let divisor = Math.floor(Math.random() * CONFIG.MAX_DIVISOR) + CONFIG.MIN_DIVISOR;
        let dividend;
        
        do {
            dividend = Math.floor(Math.random() * CONFIG.MAX_DIVIDEND) + CONFIG.MIN_DIVIDEND;
        } while (dividend <= divisor);
        
        return { dividend, divisor };
    }
    
    static calculateQuotientDigit(partial, divisor) {
        return Math.floor(partial / divisor);
    }
    
    static calculateProduct(quotientDigit, divisor) {
        return quotientDigit * divisor;
    }
    
    static calculateRemainder(partial, product) {
        return partial - product;
    }
    
    static shouldBringDown(digitIndex, totalDigits) {
        return digitIndex < totalDigits - 1;
    }
    
    static calculateNextPartial(currentPartial, nextDigit) {
        return currentPartial * 10 + nextDigit;
    }
}

class ProblemState {
    constructor(dividend, divisor) {
        this.dividend = dividend;
        this.divisor = divisor;
        this.digits = String(dividend).split('').map(Number);
        this.n = this.digits.length;
        
        this.currentStep = 0;           // 0: quotient, 1: subtract, 2: bring down
        this.currentDigitIndex = 0;
        this.partial = this.digits[0];
        this.quotientDigits = [];
        this.steps = [];
        this.finished = false;
    }
    
    getNextDigit() {
        return this.digits[this.currentDigitIndex + 1];
    }
    
    getCurrentStepNumber() {
        return this.steps.length;
    }
    
    addQuotientStep(guess, quotientDigit) {
        const stepNumber = this.getCurrentStepNumber();
        this.steps.push({
            stepNumber,
            digit: quotientDigit,
            partialBefore: this.partial,
            product: guess,
            subtraction: this.partial - guess
        });
        this.quotientDigits.push(quotientDigit);
    }
    
    completeSubtraction() {
        const lastStep = this.steps[this.steps.length - 1];
        this.partial = lastStep.subtraction;
    }
    
    bringDownNextDigit() {
        if (this.currentDigitIndex >= this.n - 1) return false;
        
        const nextDigit = this.getNextDigit();
        this.partial = DivisionMath.calculateNextPartial(this.partial, nextDigit);
        this.currentDigitIndex++;
        return true;
    }
    
    isComplete() {
        return this.finished || (this.currentDigitIndex >= this.n - 1 && this.currentStep === 2);
    }
    
    getFinalResult() {
        const quotient = this.quotientDigits.join('').replace(/^0+/, '') || '0';
        const remainder = this.partial;
        return { quotient, remainder };
    }
}

// ============================================================================
// Z = 0: BUSINESS LOGIC LAYER (Application Logic & Validation)
// ============================================================================
class GameLogic {
    constructor(stateManager, uiManager) {
        this.state = stateManager;
        this.ui = uiManager;
    }
    
    async processQuotientInput(guess) {
        const problem = this.state.getCurrentProblem();
        
        // Validate guess
        const validation = this.validateQuotientGuess(guess, problem);
        if (!validation.valid) {
            await this.ui.showFeedback(validation.message, 'error');
            this.state.recordMistake();
            return;
        }
        
        // Calculate and record
        const quotientDigit = DivisionMath.calculateQuotientDigit(problem.partial, problem.divisor);
        const product = DivisionMath.calculateProduct(quotientDigit, problem.divisor);
        
        problem.addQuotientStep(product, quotientDigit);
        problem.currentStep = 1;
        
        await this.ui.showFeedback(`✓ ${quotientDigit} × ${problem.divisor} = ${product}`, 'success');
        await this.ui.updateQuotientDisplay(problem.getCurrentStepNumber(), quotientDigit);
        await this.ui.updateProductDisplay(problem.getCurrentStepNumber(), product);
        
        this.ui.updateProblemDisplay(problem);
    }
    
    async processSubtraction(guess) {
        const problem = this.state.getCurrentProblem();
        const lastStep = problem.steps[problem.steps.length - 1];
        
        if (guess !== lastStep.subtraction) {
            await this.ui.showFeedback(`✗ ${lastStep.partialBefore} - ${lastStep.product} ≠ ${guess}`, 'error');
            this.state.recordMistake();
            return;
        }
        
        problem.completeSubtraction();
        problem.currentStep = 2;
        
        await this.ui.showFeedback(`✓ ${lastStep.partialBefore} - ${lastStep.product} = ${guess}`, 'success');
        await this.ui.updateRemainderDisplay(problem.getCurrentStepNumber(), guess);
        
        if (DivisionMath.shouldBringDown(problem.currentDigitIndex, problem.n)) {
            const nextDigit = problem.getNextDigit();
            await this.ui.prepareBringDown(nextDigit);
            await this.ui.showFeedback(`Bring down ${nextDigit}`, 'info');
        } else {
            await this.completeProblem();
        }
        
        this.ui.updateProblemDisplay(problem);
    }
    
    async processBringDown() {
        const problem = this.state.getCurrentProblem();
        const nextDigit = problem.getNextDigit();
        
        if (!problem.bringDownNextDigit()) {
            await this.completeProblem();
            return;
        }
        
        await this.ui.animateBringDown(
            nextDigit,
            1, // source row (dividend)
            problem.currentDigitIndex + 1, // source column
            this.calculateTargetRow(problem.getCurrentStepNumber()),
            this.calculateTargetCol(problem.getCurrentStepNumber())
        );
        
        await this.ui.showFeedback(`✓ Brought down ${nextDigit}. New number: ${problem.partial}`, 'success');
        
        problem.currentStep = 0;
        this.ui.updateProblemDisplay(problem);
        this.ui.restoreCommitButton();
    }
    
    async completeProblem() {
        const problem = this.state.getCurrentProblem();
        problem.finished = true;
        
        const result = problem.getFinalResult();
        await this.ui.showFinalResult(result);
        
        this.state.recordSuccess();
        this.ui.updateProblemDisplay(problem);
    }
    
    validateQuotientGuess(guess, problem) {
        if (guess % problem.divisor !== 0) {
            return { valid: false, message: `${guess} is not a multiple of ${problem.divisor}` };
        }
        
        if (guess > problem.partial) {
            return { valid: false, message: `Cannot use ${guess} (greater than ${problem.partial})` };
        }
        
        const correctProduct = DivisionMath.calculateProduct(
            DivisionMath.calculateQuotientDigit(problem.partial, problem.divisor),
            problem.divisor
        );
        
        if (guess !== correctProduct) {
            return { valid: false, message: 'Incorrect.' };
        }
        
        return { valid: true, message: '' };
    }
    
    calculateTargetRow(stepNumber) {
        const rowMap = { 0: 3, 1: 5, 2: 7 };
        return rowMap[stepNumber] || 3;
    }
    
    calculateTargetCol(stepNumber) {
        return stepNumber + 2; // Adjust based on layout
    }
}

// ============================================================================
// Z = -1: STATE MANAGEMENT LAYER (Data & Persistence)
// ============================================================================
class GameStateManager {
    constructor() {
        this.currentProblem = null;
        this.currentGuess = 0;
        this.solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
        this.mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
        this.currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;
    }
    
    createNewProblem(dividend, divisor) {
        this.currentProblem = new ProblemState(dividend, divisor);
        this.currentGuess = 0;
        return this.currentProblem;
    }
    
    getCurrentProblem() {
        return this.currentProblem;
    }
    
    setCurrentGuess(guess) {
        if (guess >= 0 && guess <= 99) {
            this.currentGuess = guess;
        }
    }
    
    getCurrentGuess() {
        return this.currentGuess;
    }
    
    clearGuess() {
        this.currentGuess = 0;
    }
    
    adjustGuess(delta) {
        this.setCurrentGuess(this.currentGuess + delta);
    }
    
    recordSuccess() {
        this.solvedCount++;
        this.currentStreak++;
        this.persistScores();
    }
    
    recordMistake() {
        this.mistakeCount++;
        this.currentStreak = 0;
        this.persistScores();
    }
    
    getScoreStats() {
        const total = this.solvedCount + this.mistakeCount;
        const accuracy = total > 0 ? Math.round((this.solvedCount / total) * 100) : 0;
        
        return {
            solvedCount: this.solvedCount,
            mistakeCount: this.mistakeCount,
            currentStreak: this.currentStreak,
            accuracy
        };
    }
    
    resetScores() {
        this.solvedCount = 0;
        this.mistakeCount = 0;
        this.currentStreak = 0;
        this.persistScores();
    }
    
    persistScores() {
        localStorage.setItem('divisionSolvedCount', this.solvedCount);
        localStorage.setItem('divisionMistakeCount', this.mistakeCount);
        localStorage.setItem('divisionCurrentStreak', this.currentStreak);
    }
}

// ============================================================================
// Z = -2: UI/ANIMATION LAYER (DOM Manipulation & Visual Effects)
// ============================================================================
class UIManager {
    constructor() {
        this.gridCells = new Map();
        this.commitButton = null;
        this.initializeSelectors();
    }
    
    initializeSelectors() {
        this.selectors = {
            problemDisplay: '#problemdisplay',
            workStageContainer: '#workStageContainer',
            workFeedback: '#workFeedback',
            newProblemBtn: '#newDivisionProblem',
            resetProblemBtn: '#resetCurrentProblem',
            solvedCountEl: '#solvedCount',
            mistakeCountEl: '#mistakeCount',
            divisionAccuracyEl: '#divisionAccuracy',
            currentStreakEl: '#currentStreak',
            resetScoresBtn: '#resetDivisionScores',
            guessDisplay: '#currentGuessDisplay',
            clearGuessBtn: '#clearGuess',
            commitGuessBtn: '#commitGuessBtn'
        };
    }
    
    async initialize() {
        await this.cacheDOMElements();
        this.addAnimationStyles();
        this.setupGridReferences();
    }
    
    async cacheDOMElements() {
        for (const [key, selector] of Object.entries(this.selectors)) {
            this[key] = document.querySelector(selector);
        }
        
        // Cache grid cells
        for (let row = 1; row <= CONFIG.GRID_ROWS; row++) {
            for (let col = 1; col <= CONFIG.GRID_COLS; col++) {
                const id = `r${row}c${col}`;
                const element = document.getElementById(id);
                if (element) {
                    this.gridCells.set(id, element);
                }
            }
        }
        
        // Cache answer cells
        ['ans-q0', 'ans-q1', 'ans-q2', 'ans-r', 'ans-rem', 'divisor'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.gridCells.set(id, element);
            }
        });
    }
    
    setupGridReferences() {
        // Store answer cells for easy access
        this.answerCells = {
            q0: this.gridCells.get('ans-q0'),
            q1: this.gridCells.get('ans-q1'),
            q2: this.gridCells.get('ans-q2'),
            rem: this.gridCells.get('ans-rem')
        };
    }
    
    async animateFromEquationToGrid(equationText) {
        const [dividend, divisor] = equationText.split(' ÷ ').map(num => parseInt(num));
        const digits = String(dividend).split('');
        
        // Animate divisor
        await this.animateNumberToCell(divisor, this.gridCells.get('divisor'));
        
        // Animate each dividend digit
        for (let i = 0; i < digits.length; i++) {
            await this.animateNumberToCell(digits[i], this.gridCells.get(`r1c${i + 1}`));
        }
    }
    
    async animateBringDown(nextDigit, sourceRow, sourceCol, targetRow, targetCol) {
        return new Promise((resolve) => {
            const sourceCell = this.gridCells.get(`r${sourceRow}c${sourceCol}`);
            const targetCell = this.gridCells.get(`r${targetRow}c${targetCol}`);
            
            if (!sourceCell || !targetCell) {
                resolve();
                return;
            }
            
            const animElement = this.createAnimationElement(nextDigit, sourceCell);
            document.body.appendChild(animElement);
            
            const targetPos = this.calculateCenterPosition(targetCell);
            animElement.style.left = `${targetPos.x}px`;
            animElement.style.top = `${targetPos.y}px`;
            animElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
            
            setTimeout(() => {
                targetCell.textContent = nextDigit;
                targetCell.classList.add('digit-highlight');
                animElement.remove();
                
                setTimeout(() => {
                    targetCell.classList.remove('digit-highlight');
                    resolve();
                }, CONFIG.ANIMATION_DURATION);
            }, CONFIG.ANIMATION_DURATION);
        });
    }
    
    async animateNumberToCell(value, targetCell) {
        return new Promise((resolve) => {
            if (!targetCell) {
                resolve();
                return;
            }
            
            const animElement = this.createAnimationElement(value, targetCell);
            document.body.appendChild(animElement);
            
            const targetPos = this.calculateCenterPosition(targetCell);
            animElement.style.left = `${targetPos.x}px`;
            animElement.style.top = `${targetPos.y}px`;
            
            setTimeout(() => {
                targetCell.textContent = value;
                targetCell.classList.add('digit-highlight');
                animElement.remove();
                
                setTimeout(() => {
                    targetCell.classList.remove('digit-highlight');
                    resolve();
                }, CONFIG.ANIMATION_DURATION);
            }, CONFIG.ANIMATION_DURATION);
        });
    }
    
    createAnimationElement(value, sourceElement) {
        const rect = sourceElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        const animElement = document.createElement('div');
        animElement.className = 'digit-animation';
        animElement.textContent = value;
        animElement.style.cssText = `
            position: fixed;
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            background: white;
            border: 2px solid #3498db;
            border-radius: 5px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            transition: all ${CONFIG.ANIMATION_DURATION}ms ease-in-out;
            pointer-events: none;
            transform: translate(-50%, -50%);
            left: ${rect.left + rect.width/2 + scrollX}px;
            top: ${rect.top + rect.height/2 + scrollY}px;
        `;
        
        return animElement;
    }
    
    calculateCenterPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        return {
            x: rect.left + rect.width/2 + scrollX,
            y: rect.top + rect.height/2 + scrollY
        };
    }
    
    updateProblemDisplay(problem) {
        if (!problem) return;
        
        let mainEquation = `${problem.dividend} ÷ ${problem.divisor}`;
        let currentStep = '';
        let instruction = '';
        
        if (problem.finished) {
            const result = problem.getFinalResult();
            currentStep = `${problem.dividend} ÷ ${problem.divisor} = ${result.quotient} R ${result.remainder}`;
            instruction = 'Problem completed!';
        } else {
            switch (problem.currentStep) {
                case 0:
                    currentStep = `${problem.partial} ÷ ${problem.divisor} = ?`;
                    instruction = `Find the largest multiple of ${problem.divisor} without going over ${problem.partial}`;
                    break;
                case 1:
                    const lastStep = problem.steps[problem.steps.length - 1];
                    if (lastStep) {
                        currentStep = `${lastStep.partialBefore} - ${lastStep.product} = ?`;
                        instruction = `What is ${lastStep.partialBefore} minus ${lastStep.product}`;
                    }
                    break;
                case 2:
                    if (problem.currentDigitIndex >= problem.n - 1) {
                        currentStep = "Complete the problem";
                        instruction = "No more digits to bring down";
                    } else {
                        const nextDigit = problem.getNextDigit();
                        currentStep = `Bring down ${nextDigit}`;
                        instruction = `Click "Bring Down" button to bring down ${nextDigit}`;
                    }
                    break;
            }
        }
        
        if (this.problemDisplay) {
            this.problemDisplay.innerHTML = `
                <div class="equation-display">
                    <div class="large-equation">${mainEquation}</div>
                </div>
                <div class="current-step-container">
                    <div class="current-step-title">Current Step</div>
                    <div class="current-step-equation">${currentStep}</div>
                    <div class="current-instruction">${instruction}</div>
                </div>
            `;
        }
    }
    
    async showFeedback(message, type = 'info') {
        const numberDisplay = document.querySelector('.number-display');
        if (!numberDisplay) return;
        
        if (!numberDisplay.originalHTML) {
            numberDisplay.originalHTML = numberDisplay.innerHTML;
        }
        
        numberDisplay.innerHTML = `<div class="feedback-${type}">${message}</div>`;
        numberDisplay.classList.add('showing-feedback');
        
        const delay = CONFIG.FEEDBACK_DELAYS[type] || 2000;
        
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
    
    async showFinalResult(result) {
        await this.showFeedback(
            `🎉 Complete! ${result.quotient} R ${result.remainder}`,
            'success'
        );
    }
    
    updateGuessDisplay(guess) {
        if (this.guessDisplay) {
            this.guessDisplay.textContent = guess;
        }
    }
    
    updateScoreDisplay(stats) {
        if (this.solvedCountEl) this.solvedCountEl.textContent = stats.solvedCount;
        if (this.mistakeCountEl) this.mistakeCountEl.textContent = stats.mistakeCount;
        if (this.currentStreakEl) this.currentStreakEl.textContent = stats.currentStreak;
        if (this.divisionAccuracyEl) this.divisionAccuracyEl.textContent = stats.accuracy + '%';
    }
    
    resetGrid() {
        // Clear all grid cells
        this.gridCells.forEach((cell, id) => {
            if (id.startsWith('r') || id.startsWith('ans')) {
                cell.textContent = '';
            }
        });
        
        // Clear answer cells
        Object.values(this.answerCells).forEach(cell => {
            if (cell) cell.textContent = '?';
        });
        
        // Reset divisor
        const divisorCell = this.gridCells.get('divisor');
        if (divisorCell) divisorCell.textContent = '?';
    }
    
    updateDividend(digits) {
        for (let i = 0; i < CONFIG.GRID_COLS; i++) {
            const cell = this.gridCells.get(`r1c${i + 1}`);
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
    
    updateVisibleRows(n) {
        const visibleRows = 2 * n + 1;
        
        for (let row = 1; row <= CONFIG.GRID_ROWS; row++) {
            const shouldShow = row <= (visibleRows + 1);
            
            for (let col = 1; col <= CONFIG.GRID_COLS; col++) {
                const cell = this.gridCells.get(`r${row}c${col}`);
                if (cell && row >= 2) {
                    cell.style.display = shouldShow ? 'flex' : 'none';
                }
            }
        }
    }
    
    updateQuotientDisplay(stepNumber, value) {
        const quotientCellIds = ['ans-q0', 'ans-q1', 'ans-q2'];
        if (stepNumber < quotientCellIds.length) {
            const cell = this.gridCells.get(quotientCellIds[stepNumber]);
            if (cell) cell.textContent = value;
        }
    }
    
    updateProductDisplay(stepNumber, product) {
        const rowMap = { 0: 2, 1: 4, 2: 6 };
        const row = rowMap[stepNumber];
        
        if (row !== undefined) {
            const productStr = String(product);
            
            // Clear row
            for (let col = 1; col <= CONFIG.GRID_COLS; col++) {
                const cell = this.gridCells.get(`r${row}c${col}`);
                if (cell) cell.textContent = '';
            }
            
            // Right-align product
            const workingColumns = stepNumber + 1;
            const productLength = productStr.length;
            
            for (let i = 0; i < productLength; i++) {
                const col = 1 + (workingColumns - productLength) + i;
                const cell = this.gridCells.get(`r${row}c${col}`);
                if (cell) cell.textContent = productStr[i];
            }
        }
    }
    
    updateRemainderDisplay(stepNumber, remainder) {
        const rowMap = { 0: 3, 1: 5, 2: 7 };
        const row = rowMap[stepNumber];
        
        if (row !== undefined) {
            const remainderStr = String(remainder);
            
            // Clear row
            for (let col = 1; col <= CONFIG.GRID_COLS; col++) {
                const cell = this.gridCells.get(`r${row}c${col}`);
                if (cell) cell.textContent = '';
            }
            
            // Right-align remainder
            const workingColumns = stepNumber + 1;
            const remainderLength = remainderStr.length;
            
            for (let i = 0; i < remainderLength; i++) {
                const col = 1 + (workingColumns - remainderLength) + i;
                const cell = this.gridCells.get(`r${row}c${col}`);
                if (cell) cell.textContent = remainderStr[i];
            }
        }
    }
    
    prepareBringDown(nextDigit) {
        if (!this.commitButton) return;
        
        this.commitButton.originalHTML = this.commitButton.innerHTML;
        this.commitButton.innerHTML = `
            <span class="bring-down-icon">↓</span>
            <span class="bring-down-text">Bring Down ${nextDigit}</span>
        `;
        
        this.commitButton.style.cssText = `
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
    }
    
    restoreCommitButton() {
        if (!this.commitButton || !this.commitButton.originalHTML) return;
        
        this.commitButton.innerHTML = this.commitButton.originalHTML;
        this.commitButton.style.cssText = `
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
        
        delete this.commitButton.originalHTML;
    }
    
    addAnimationStyles() {
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
}

// ============================================================================
// Z = -3: EVENT HANDLING LAYER (DOM Events & User Interactions)
// ============================================================================
class EventManager {
    constructor(stateManager, uiManager, gameLogic) {
        this.state = stateManager;
        this.ui = uiManager;
        this.game = gameLogic;
    }
    
    setupEventListeners() {
        // Button handlers
        if (this.ui.newProblemBtn) {
            this.ui.newProblemBtn.addEventListener('click', () => this.handleNewProblem());
        }
        
        if (this.ui.resetProblemBtn) {
            this.ui.resetProblemBtn.addEventListener('click', () => this.handleResetProblem());
        }
        
        if (this.ui.resetScoresBtn) {
            this.ui.resetScoresBtn.addEventListener('click', () => this.handleResetScores());
        }
        
        if (this.ui.clearGuessBtn) {
            this.ui.clearGuessBtn.addEventListener('click', () => this.handleClearGuess());
        }
        
        if (this.ui.commitGuessBtn) {
            this.ui.commitGuessBtn.addEventListener('click', () => this.handleCommitGuess());
            this.ui.commitButton = this.ui.commitGuessBtn;
        }
        
        // Number adjustment buttons
        document.querySelectorAll('[data-change]').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseInt(btn.dataset.change);
                this.handleAdjustGuess(delta);
            });
        });
    }
    
    async handleNewProblem() {
        const problem = DivisionMath.generateProblem();
        await this.initializeNewProblem(problem.dividend, problem.divisor);
    }
    
    async handleResetProblem() {
        const currentProblem = this.state.getCurrentProblem();
        if (currentProblem) {
            await this.initializeNewProblem(currentProblem.dividend, currentProblem.divisor);
        }
    }
    
    handleResetScores() {
        this.state.resetScores();
        const stats = this.state.getScoreStats();
        this.ui.updateScoreDisplay(stats);
    }
    
    handleAdjustGuess(delta) {
        const problem = this.state.getCurrentProblem();
        if (!problem || problem.finished) return;
        
        this.state.adjustGuess(delta);
        const guess = this.state.getCurrentGuess();
        this.ui.updateGuessDisplay(guess);
    }
    
    handleClearGuess() {
        this.state.clearGuess();
        this.ui.updateGuessDisplay(0);
    }
    
    async handleCommitGuess() {
        const problem = this.state.getCurrentProblem();
        if (!problem || problem.finished) return;
        
        const guess = this.state.getCurrentGuess();
        
        if (problem.currentStep === 0) {
            await this.game.processQuotientInput(guess);
        } else if (problem.currentStep === 1) {
            await this.game.processSubtraction(guess);
        } else if (problem.currentStep === 2) {
            await this.game.processBringDown();
        }
        
        this.state.clearGuess();
        this.ui.updateGuessDisplay(0);
        
        // Update scores
        const stats = this.state.getScoreStats();
        this.ui.updateScoreDisplay(stats);
    }
    
    async initializeNewProblem(dividend, divisor) {
        const problem = this.state.createNewProblem(dividend, divisor);
        
        // Reset UI
        this.ui.resetGrid();
        this.ui.updateDividend(problem.digits);
        this.ui.updateVisibleRows(problem.n);
        this.ui.restoreCommitButton();
        
        // Update displays
        this.ui.updateProblemDisplay(problem);
        this.ui.updateGuessDisplay(0);
        
        // Animate
        await this.ui.animateFromEquationToGrid(`${dividend} ÷ ${divisor}`);
        
        // Update scores (in case they changed)
        const stats = this.state.getScoreStats();
        this.ui.updateScoreDisplay(stats);
    }
}

// ============================================================================
// Z = +3: APPLICATION BOOTSTRAP LAYER (Main Entry Point)
// ============================================================================
class DivisionApplication {
    constructor() {
        this.debugger = new DebugLogger(CONFIG.DEBUG);
        this.stateManager = new GameStateManager();
        this.uiManager = new UIManager();
        this.gameLogic = new GameLogic(this.stateManager, this.uiManager);
        this.eventManager = new EventManager(this.stateManager, this.uiManager, this.gameLogic);
    }
    
    async initialize() {
        try {
            this.debugger.log('Application initializing...');
            
            // Initialize UI
            await this.uiManager.initialize();
            
            // Setup event listeners
            this.eventManager.setupEventListeners();
            
            // Load initial scores
            const stats = this.stateManager.getScoreStats();
            this.uiManager.updateScoreDisplay(stats);
            
            // Generate first problem
            await this.eventManager.handleNewProblem();
            
            this.debugger.log('Application initialized successfully');
        } catch (error) {
            this.debugger.error('Failed to initialize application', error);
        }
    }
}

// Debug logger (can be at any layer, but conceptually Z=+1)
class DebugLogger {
    constructor(enabled) {
        this.enabled = enabled;
    }
    
    log(message, data = null) {
        if (this.enabled) {
            if (data) {
                console.log(`[DEBUG] ${message}:`, data);
            } else {
                console.log(`[DEBUG] ${message}`);
            }
        }
    }
    
    error(message, error = null) {
        if (this.enabled) {
            console.error(`[DEBUG ERROR] ${message}`, error || '');
        }
    }
}

// ============================================================================
// BOOTSTRAP: Start the application
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    const app = new DivisionApplication();
    await app.initialize();
});
