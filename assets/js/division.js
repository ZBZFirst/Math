// division.js
import { StepTrackerManager } from './StepTrackerManager.js';

class DivisionApp {
    constructor() {
        this.stepTracker = new StepTrackerManager();
        this.currentGuess = 0;
        this.isActive = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeNewProblem();
    }
    
    initializeElements() {
        // Left container elements
        this.currentStepEquation = document.getElementById('currentStepEquation');
        this.currentInstruction = document.getElementById('currentInstruction');
        this.currentGuessDisplay = document.getElementById('currentGuessDisplay');
        this.currentStepContainer = document.querySelector('.current-step-container');
        this.workFeedback = document.getElementById('workFeedback');
        this.commitGuessBtn = document.getElementById('commitGuessBtn');
        this.mainEquation = document.getElementById('mainEquation');
        this.newProblemBtn = document.getElementById('newDivisionProblem');
        this.resetProblemBtn = document.getElementById('resetCurrentProblem');
        this.resetScoresBtn = document.getElementById('resetDivisionScores');
        this.solvedCount = document.getElementById('solvedCount');
        this.mistakeCount = document.getElementById('mistakeCount');
        this.divisionAccuracy = document.getElementById('divisionAccuracy');
        this.currentStreak = document.getElementById('currentStreak');
        
        // Grid control buttons
        this.gridButtons = {
            decrementFive: document.querySelector('.grid-btn.decrement.five'),
            decrementOne: document.querySelector('.grid-btn.decrement.one'),
            clear: document.querySelector('.grid-btn.clear'),
            incrementOne: document.querySelector('.grid-btn.increment.one'),
            incrementFive: document.querySelector('.grid-btn.increment.five')
        };
    }
    
    bindEvents() {
        // Control buttons
        this.newProblemBtn.addEventListener('click', () => this.generateNewProblem());
        this.resetProblemBtn.addEventListener('click', () => this.resetCurrentProblem());
        this.resetScoresBtn.addEventListener('click', () => this.resetScores());
        
        // Guess commitment
        this.commitGuessBtn.addEventListener('click', () => this.commitCurrentGuess());
        
        // Grid control buttons
        this.gridButtons.decrementFive.addEventListener('click', () => this.adjustGuess(-5));
        this.gridButtons.decrementOne.addEventListener('click', () => this.adjustGuess(-1));
        this.gridButtons.clear.addEventListener('click', () => this.clearGuess());
        this.gridButtons.incrementOne.addEventListener('click', () => this.adjustGuess(1));
        this.gridButtons.incrementFive.addEventListener('click', () => this.adjustGuess(5));
        
        // Listen to step tracker events
        document.addEventListener('step-tracker-updated', (e) => this.handleTrackerUpdate(e));
        document.addEventListener('new-problem-set', (e) => this.handleNewProblem(e));
        document.addEventListener('step-changed', (e) => this.handleStepChange(e));
        document.addEventListener('phase-changed', (e) => this.handlePhaseChange(e));

    }

    handlePhaseChange(event) {
        const { step, phase } = event.detail;
        console.log(`Phase changed to ${phase} for step ${step}`);
        this.showCurrentStep();
    }
    
    // ========== PROBLEM MANAGEMENT ==========
    
    generateNewProblem() {
        // Generate random 3-digit dividend and 2-digit divisor
        const dividend = Math.floor(Math.random() * 900) + 100; // 100-999 (ALWAYS 3 digits)
        const divisor = Math.floor(Math.random() * 10) + 7;    // 10-29 (ALWAYS 2 digits)
        
        console.log(`Generating new problem: ${dividend} ÷ ${divisor}`);
        
        this.stepTracker.setProblem(dividend, divisor);
        this.updateMainEquation();
        this.initializeGridDigits(dividend, divisor);
        this.currentGuess = 0;
        this.updateGuessDisplay();
        this.showCurrentStep();
        this.workFeedback.classList.remove('hidden');
        this.currentStepContainer.classList.remove('hidden');
    }
    
    initializeGridDigits(dividend, divisor) {
        console.log(`Initializing grid digits: ${dividend} ÷ ${divisor}`);
        this.clearGrid();
        const dividendStr = String(dividend);
        const divisorStr = String(divisor);
        const dividendDigits = dividendStr.split('');
        const dividendCells = ['r3c4', 'r3c5', 'r3c6'];
        let digitIndex = dividendDigits.length - 1;
        for (let i = dividendCells.length - 1; i >= 0; i--) {
            const cellId = dividendCells[i];
            const cell = document.getElementById(cellId);
            if (cell) {
                if (digitIndex >= 0) {
                    cell.textContent = dividendDigits[digitIndex];
                } else {
                    cell.textContent = ''; // Leave empty for leading positions
                }
                digitIndex--;
            }
        }
        const divisorDigits = divisorStr.split('');
        const divisorCells = ['r3c1', 'r3c2'];
        digitIndex = divisorDigits.length - 1;
        for (let i = divisorCells.length - 1; i >= 0; i--) {
            const cellId = divisorCells[i];
            const cell = document.getElementById(cellId);
            if (cell) {
                if (digitIndex >= 0) {
                    cell.textContent = divisorDigits[digitIndex];
                } else {
                    cell.textContent = '';
                }
                digitIndex--;
            }
        }
        console.log('Grid initialized with right-aligned digits');
    }
    
    initializeNewProblem() {
        const defaultDividend = parseInt(this.stepTracker.get('dividend')) || 123;
        const defaultDivisor = parseInt(this.stepTracker.get('divisor')) || 5;
        console.log(`Initializing problem: ${defaultDividend} ÷ ${defaultDivisor}`);
        this.stepTracker.setProblem(defaultDividend, defaultDivisor);
        this.updateMainEquation();
        this.initializeGridDigits(defaultDividend, defaultDivisor);
        this.showCurrentStep();
        this.workFeedback.classList.remove('hidden');
    }

    resetCurrentProblem() {
        console.log('Resetting current problem');
        const dividend = this.stepTracker.get('dividend');
        const divisor = this.stepTracker.get('divisor');
        this.stepTracker.resetProblem();
        this.currentGuess = 0;
        this.updateGuessDisplay();
        this.clearGrid();
        this.initializeGridDigits(dividend, divisor);
        this.showCurrentStep();
    }
    
    // ========== STEP MANAGEMENT ==========
    
    showCurrentStep() {
        const currentStep = this.stepTracker.getCurrentStep();
        const currentPhase = this.stepTracker.getCurrentPhase();
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        const divisor = this.stepTracker.get('divisor');
        if (!stepData) {
            console.warn(`No data for step ${currentStep}`);
            return;
        }
        console.log(`Showing step ${currentStep}, phase ${currentPhase}:`, stepData);
        this.currentStepContainer.classList.remove('hidden');
        const stepTitle = document.querySelector('.current-step-title');
        if (stepTitle) {
            stepTitle.textContent = `Current Step - Step ${currentStep} (Phase ${currentPhase}/3)`;
        }
        this.updateDisplayForPhase(currentStep, currentPhase, stepData, divisor);
        this.workFeedback.classList.remove('hidden');
        this.highlightGridForPhase(currentPhase);
        this.currentGuess = this.getGuessForPhase(currentStep, currentPhase, stepData);
        this.updateGuessDisplay();
        if (currentStep >= 2 && currentPhase === 1) {
            this.ensureBroughtDownDigit(currentStep);
        }
    }
    
    updateDisplayForPhase(step, phase, stepData, divisor) {
        switch(phase) {
            case 1:
                this.currentStepEquation.textContent = `${stepData.partialDividend} ÷ ${divisor} = ?`;
                this.currentInstruction.textContent = `How many times does ${divisor} go into ${stepData.partialDividend}?`;
                break;
                
            case 2:
                const guess = stepData.userGuess || 0;
                this.currentStepEquation.textContent = `${guess} × ${divisor} = ?`;
                this.currentInstruction.textContent = `Calculate the product of ${guess} × ${divisor}`;
                break;
                
            case 3:
                const partialDividend = stepData.partialDividend;
                const product = stepData.userProduct || 0;
                this.currentStepEquation.textContent = `${partialDividend} - ${product} = ?`;
                this.currentInstruction.textContent = `Subtract to find the remainder`;
                break;
        }
    }
    
    getGuessForPhase(step, phase, stepData) {
        switch(phase) {
            case 1: return stepData.userGuess || 0;
            case 2: return stepData.userProduct || 0;
            case 3: return stepData.userRemainder || 0;
            default: return 0;
        }
    }
    
    highlightGridForPhase(phase) {
        document.querySelectorAll('.division-table.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        const currentStep = this.stepTracker.getCurrentStep();
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings[`step${currentStep}`];
        if (!stepMapping) {
            console.warn(`No grid mapping for step ${currentStep}`);
            return;
        }
        switch(phase) {
            case 1: 
                if (stepMapping.input && stepMapping.input.length > 0) {
                    stepMapping.input.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.classList.add('highlighted');
                        }
                    });
                }
                break;
            case 2:
                if (stepMapping.output && stepMapping.output.product) {
                    stepMapping.output.product.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.classList.add('highlighted');
                        }
                    });
                }
                break;
            case 3:
                if (stepMapping.output && stepMapping.output.remainder) {
                    stepMapping.output.remainder.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.classList.add('highlighted');
                        }
                    });
                }
                break;
        }
    }
    
    ensureBroughtDownDigit(step) {
        const stepMapping = this.stepTracker.getGridMappingsForStep(step);
        if (!stepMapping || !stepMapping.bringdown || !stepMapping.bringdownTarget) {
            return;
        }
        const broughtDownDigit = document.getElementById(stepMapping.bringdown).textContent;
        const bringDownCell = document.getElementById(stepMapping.bringdownTarget);
        if (bringDownCell && broughtDownDigit && broughtDownDigit !== '') {
            if (!bringDownCell.textContent || bringDownCell.textContent === '') {
                bringDownCell.textContent = broughtDownDigit;
                bringDownCell.classList.add('filled', 'brought-down');
            }
        }
    }
    
    // ========== GUESS MANAGEMENT ==========
    
    adjustGuess(amount) {
        this.currentGuess = Math.max(0, this.currentGuess + amount);
        this.updateGuessDisplay();
    }
    
    clearGuess() {
        this.currentGuess = 0;
        this.updateGuessDisplay();
    }
    
    updateGuessDisplay() {
        this.currentGuessDisplay.textContent = this.currentGuess;
        this.stepTracker.setCurrentGuess(this.currentGuess, true);
    }
    
    commitCurrentGuess() {
        this.handleCorrectGuess();
    }
    
    handleCorrectGuess() {
        const currentStep = this.stepTracker.getCurrentStep();
        const currentPhase = this.stepTracker.getCurrentPhase();
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        console.log(`Handling guess for step ${currentStep}, phase ${currentPhase}: guess=${this.currentGuess}`);
        switch(currentPhase) {
            case 1:
                stepData.userGuess = this.currentGuess;
                break;
            case 2:
                stepData.userProduct = this.currentGuess;
                break;
            case 3:
                stepData.userRemainder = this.currentGuess;
                break;
        }
        this.stepTracker.set('step-answers', stepAnswers);
        this.updateGridForPhase(currentStep, currentPhase, this.currentGuess);
        const isCorrect = this.stepTracker.checkGuess(this.currentGuess);
        if (isCorrect) {
            this.showTemporaryFeedback('Correct!', 'success');
            if (currentPhase === 3) {
                this.updateScore(true);
                if (this.stepTracker.get('problem-completed')) {
                    this.showCompletionMessage();
                } else {
                    const nextStep = currentStep + 1;
                    setTimeout(() => {
                        this.prepareNextStep(nextStep);
                        this.showCurrentStep();
                    }, 1500);
                }
            } else {
                setTimeout(() => {
                    this.showCurrentStep();
                }, 1000);
            }
        } else {
            this.handleIncorrectGuess();
        }
    }
    
    highlightGridForPhase(phase) {
        document.querySelectorAll('.division-table.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        const currentStep = this.stepTracker.getCurrentStep();
        const stepMapping = this.stepTracker.getGridMappingsForStep(currentStep);
        if (!stepMapping) {
            console.warn(`No grid mapping for step ${currentStep}`);
            return;
        }
        switch(phase) {
            case 1:
                if (stepMapping.input && stepMapping.input.length > 0) {
                    stepMapping.input.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) cell.classList.add('highlighted');
                    });
                }
                break;
            case 2:
                if (stepMapping.output && stepMapping.output.product) {
                    stepMapping.output.product.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) cell.classList.add('highlighted');
                    });
                }
                break;
            case 3:
                if (stepMapping.output && stepMapping.output.remainder) {
                    stepMapping.output.remainder.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) cell.classList.add('highlighted');
                    });
                }
                break;
        }
    }
    
    updateGridForPhase(step, phase, value) {
        const stepMapping = this.stepTracker.getGridMappingsForStep(step);
        if (!stepMapping) {
            console.warn(`No grid mapping for step ${step}`);
            return;
        }
        console.log(`Updating grid for step ${step}, phase ${phase} with value: ${value}`);
        const valueStr = String(value);
        switch(phase) {
            case 1:
                const quotientCell = document.getElementById(stepMapping.output.quotient);
                if (quotientCell) {
                    quotientCell.textContent = valueStr;
                    quotientCell.classList.add('filled');
                    console.log(`Updated quotient cell ${stepMapping.output.quotient} to ${valueStr}`);
                }
                break;
            case 2:
                const productCells = stepMapping.output.product || [];
                this.updateNumberInCells(productCells, value);
                console.log(`Updated product cells: ${productCells.join(', ')} to ${valueStr}`);
                break;
            case 3:
                const remainderCells = stepMapping.output.remainder || [];
                this.updateNumberInCells(remainderCells, value);
                console.log(`Updated remainder cells: ${remainderCells.join(', ')} to ${valueStr}`);
                break;
        }
    }
    
    prepareNextStep(nextStep) {
        const stepMapping = this.stepTracker.getGridMappingsForStep(nextStep);
        if (!stepMapping) {
            console.warn(`No grid mapping for step ${nextStep}`);
            return;
        }
        if (stepMapping.bringdown && stepMapping.bringdownTarget) {
            const sourceCell = document.getElementById(stepMapping.bringdown);
            const targetCell = document.getElementById(stepMapping.bringdownTarget);
            if (sourceCell && targetCell && sourceCell.textContent) {
                if (!targetCell.textContent || targetCell.textContent.trim() === '') {
                    targetCell.textContent = sourceCell.textContent;
                    targetCell.classList.add('filled', 'brought-down');
                }
            }
        }
        if (nextStep === 3) {
            const finalRemainder = this.stepTracker.get('remainder');
            if (finalRemainder > 0) {
                const step3Mapping = this.stepTracker.getGridMappingsForStep(3);
                if (step3Mapping.output && step3Mapping.output.finalRemainder) {
                    const remainderStr = String(finalRemainder).padStart(2, '0');
                    const finalRemainderCells = step3Mapping.output.finalRemainder;
                    finalRemainderCells.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.textContent = '';
                            cell.classList.remove('filled');
                        }
                    });
                    this.updateNumberInCells(finalRemainderCells, finalRemainder);
                    document.querySelectorAll('.mainEquation.remainder').forEach(el => {
                        el.classList.remove('hidden');
                    });
                }
            }
        }
        setTimeout(() => {
            this.highlightGridForStep(nextStep);
        }, 100);
    }
    
    handleIncorrectGuess() {
        this.updateScore(false);
        this.showTemporaryFeedback('Try again!', 'error');
        this.currentGuess = 0;
        this.updateGuessDisplay();
    }
    
    // ========== GRID MANAGEMENT ==========
    
    highlightGridForStep(step) {
        document.querySelectorAll('.division-table.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        const stepMapping = this.stepTracker.getGridMappingsForStep(step);
        if (!stepMapping) return;
        stepMapping.input.forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) cell.classList.add('highlighted');
        });
    }
    
    updateNumberInCells(cellIds, number) {
        const numStr = String(number);
        cellIds.forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        });
        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[numStr.length - 1 - i];
            const cellIndex = cellIds.length - 1 - i;
            if (cellIndex >= 0) {
                const cellId = cellIds[cellIndex];
                const cell = document.getElementById(cellId);
                if (cell) {
                    cell.textContent = digit;
                    cell.classList.add('filled');
                }
            }
        }
        if (cellIds.length > numStr.length) {
            const leadingZeros = cellIds.length - numStr.length;
            for (let i = 0; i < leadingZeros; i++) {
                const cellId = cellIds[i];
                const cell = document.getElementById(cellId);
                if (cell && !cell.textContent) {
                    cell.textContent = '0';
                    cell.classList.add('filled');
                }
            }
        }
    }
    
    
    clearGrid() {
        console.log('Clearing grid');
        const allCells = document.querySelectorAll('.division-table:not(.transparent)');
        allCells.forEach(cell => {
            const id = cell.id;
            if (id === 'r1c7') {
                return;
            }
            cell.textContent = '';
            cell.classList.remove('filled', 'highlighted', 'brought-down');
        });
        document.querySelectorAll('.mainEquation.remainder').forEach(el => {
            el.classList.add('hidden');
        });
    }
    
    // ========== DISPLAY UPDATES ==========
    
    updateMainEquation() {
        const dividend = this.stepTracker.get('dividend');
        const divisor = this.stepTracker.get('divisor');
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        const dividendStr = String(dividend).padStart(3, '0');
        document.querySelector('.mainEquation.dividend.hundreds').textContent = dividendStr[0];
        document.querySelector('.mainEquation.dividend.tens').textContent = dividendStr[1];
        document.querySelector('.mainEquation.dividend.ones').textContent = dividendStr[2];
        const gridMappings = this.stepTracker.get('grid-mappings');
        if (gridMappings && gridMappings.dividend) {
            const cells = ['r3c4', 'r3c5', 'r3c6'];
            cells.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    cell.textContent = dividendStr[index];
                }
            });
        } else {
            const r3c4 = document.getElementById('r3c4');
            const r3c5 = document.getElementById('r3c5');
            const r3c6 = document.getElementById('r3c6');
            if (r3c4) r3c4.textContent = dividendStr[0];
            if (r3c5) r3c5.textContent = dividendStr[1];
            if (r3c6) r3c6.textContent = dividendStr[2];
        }
        const divisorStr = String(divisor).padStart(2, '0');
        const tensCell = document.querySelector('.mainEquation.divisor.tens');
        const onesCell = document.querySelector('.mainEquation.divisor.ones');
        tensCell.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
        onesCell.textContent = divisorStr[1];
        const r3c1 = document.getElementById('r3c1');
        const r3c2 = document.getElementById('r3c2');
        if (r3c1) r3c1.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
        if (r3c2) r3c2.textContent = divisorStr[1];
        document.querySelectorAll('.mainEquation.answer').forEach(el => {
            el.textContent = '?';
        });
        document.querySelectorAll('.mainEquation.remainder').forEach(el => {
            el.classList.add('hidden');
        });
        this.clearGrid();
        document.querySelector('.mainEquation.equals-symbol').style.visibility = 'visible';
    }
    
    // ========== SCORE MANAGEMENT ==========
    
    updateScore(isCorrect) {
        let solved = parseInt(this.solvedCount.textContent) || 0;
        let mistakes = parseInt(this.mistakeCount.textContent) || 0;
        let streak = parseInt(this.currentStreak.textContent) || 0;
        if (isCorrect) {
            solved++;
            streak++;
            if (this.stepTracker.get('problem-completed')) {
                this.showTemporaryFeedback('Problem solved!', 'success');
            } else {
                this.showTemporaryFeedback('Correct!', 'success');
            }
        } else {
            mistakes++;
            streak = 0;
        }
        this.solvedCount.textContent = solved;
        this.mistakeCount.textContent = mistakes;
        this.currentStreak.textContent = streak;
        const totalAttempts = solved + mistakes;
        const accuracy = totalAttempts > 0 ? Math.round((solved / totalAttempts) * 100) : 0;
        this.divisionAccuracy.textContent = `${accuracy}%`;
        this.saveScores({ solved, mistakes, streak, accuracy });
    }
    
    saveScores(scores) {
        localStorage.setItem('divisionScores', JSON.stringify(scores));
    }
    
    loadScores() {
        const saved = localStorage.getItem('divisionScores');
        if (saved) {
            const scores = JSON.parse(saved);
            this.solvedCount.textContent = scores.solved || 0;
            this.mistakeCount.textContent = scores.mistakes || 0;
            this.currentStreak.textContent = scores.streak || 0;
            this.divisionAccuracy.textContent = `${scores.accuracy || 0}%`;
        }
    }
    
    resetScores() {
        localStorage.removeItem('divisionScores');
        this.solvedCount.textContent = '0';
        this.mistakeCount.textContent = '0';
        this.currentStreak.textContent = '0';
        this.divisionAccuracy.textContent = '0%';
    }
    
    // ========== EVENT HANDLERS ==========
    
    handleTrackerUpdate(event) {
        const { attribute, value } = event.detail;
        console.log(`Tracker updated: ${attribute} = ${value}`);
        switch(attribute) {
            case 'current-step':
            case 'current-phase':
                this.showCurrentStep();
                break;
            case 'current-guess':
                // Only update if it's different from our current value
                const newGuess = parseInt(value) || 0;
                if (newGuess !== this.currentGuess) {
                    this.currentGuess = newGuess;
                    this.currentGuessDisplay.textContent = this.currentGuess;
                }
                break;
        }
    }
    
    handleNewProblem(event) {
        const { dividend, divisor } = event.detail;
        console.log(`New problem: ${dividend} ÷ ${divisor}`);
        // Additional initialization if needed
    }
    
    handleStepChange(event) {
        const { step } = event.detail;
        console.log(`Step changed to: ${step}`);
        this.showCurrentStep();
    }
    
    // ========== UI FEEDBACK ==========
    
    showTemporaryFeedback(message, type) {
        // Create or update feedback element
        let feedbackEl = document.getElementById('temporaryFeedback');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'temporaryFeedback';
            feedbackEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(feedbackEl);
        }
        feedbackEl.textContent = message;
        feedbackEl.style.background = type === 'success' ? '#4CAF50' : '#f44336';
        feedbackEl.style.opacity = '1';
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
            setTimeout(() => feedbackEl.remove(), 300);
        }, 2000);
    }
    
    showCompletionMessage() {
        const dividend = this.stepTracker.get('dividend');
        const divisor = this.stepTracker.get('divisor');
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        let message = `Correct! ${dividend} ÷ ${divisor} = ${quotient}`;
        if (remainder > 0) {
            message += ` R${remainder}`;
        }
        this.showTemporaryFeedback(message, 'success');
        this.currentStepContainer.classList.add('hidden');
        this.workFeedback.classList.add('hidden');
        this.updateFinalAnswerInEquation();
    }
    
    updateFinalAnswerInEquation() {
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        const quotientStr = String(quotient).padStart(3, '0');
        const remainderStr = String(remainder).padStart(2, '0');
        const hundreds = document.querySelector('.mainEquation.answer.hundreds');
        const tens = document.querySelector('.mainEquation.answer.tens');
        const ones = document.querySelector('.mainEquation.answer.ones');
        if (hundreds) hundreds.textContent = quotientStr[0] === '0' ? '' : quotientStr[0];
        if (tens) tens.textContent = quotientStr[1] === '0' ? '' : quotientStr[1];
        if (ones) ones.textContent = quotientStr[2];
        if (remainder > 0) {
            const remainderTens = document.querySelector('.mainEquation.remainder.tens');
            const remainderOnes = document.querySelector('.mainEquation.remainder.ones');
            if (remainderTens && remainderOnes) {
                remainderTens.textContent = remainderStr[0] === '0' ? '' : remainderStr[0];
                remainderOnes.textContent = remainderStr[1];
                document.querySelectorAll('.mainEquation.remainder').forEach(el => {
                    el.classList.remove('hidden');
                });
            }
        }
    }
    
    // ========== INITIALIZATION ==========
    
    init() {
        this.loadScores();
        this.initializeNewProblem();
        console.log('Division App initialized');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const divisionApp = new DivisionApp();
    divisionApp.init();
    window.divisionApp = divisionApp;
});
