// Initialize the StepTrackerManager (we'll create this as a separate module)
import { StepTrackerManager } from './StepTrackerManager.js';

// Or if not using modules:
// const stepTracker = new StepTrackerManager();

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
        
        // Main equation elements
        this.mainEquation = document.getElementById('mainEquation');
        
        // Control buttons
        this.newProblemBtn = document.getElementById('newDivisionProblem');
        this.resetProblemBtn = document.getElementById('resetCurrentProblem');
        this.resetScoresBtn = document.getElementById('resetDivisionScores');
        
        // Score elements
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
    }
    
    // ========== PROBLEM MANAGEMENT ==========
    
    generateNewProblem() {
        // Generate random 3-digit dividend and 1-2 digit divisor
        const dividend = Math.floor(Math.random() * 900) + 100; // 100-999
        const divisor = Math.floor(Math.random() * 90) + 10;    // 10-99
        
        // Set problem in tracker
        this.stepTracker.setProblem(dividend, divisor);
        
        // Update visual display
        this.updateMainEquation();
        this.showCurrentStep();
        
        // Reset UI state
        this.currentGuess = 0;
        this.updateGuessDisplay();
        this.workFeedback.classList.add('hidden');
    }

    initializeGridMappings() {
        // Use the mappings from your HTML
        const mappings = {
            // Add these mappings for the initial display
            dividend: {
                hundreds: "r3c4",
                tens: "r3c5",
                ones: "r3c6"
            },
            divisor: {
                tens: "r3c1",
                ones: "r3c2"
            },
            quotient: {
                hundreds: "r1c4",
                tens: "r1c5",
                ones: "r1c6"
            },
            remainder: {
                tens: "r1c8",
                ones: "r1c9"
            },
            step1: {
                columnFocus: "c4",
                input: ["r3c4"],
                output: {
                    product: ["r4c4", "r4c5"],
                    remainder: ["r6c4", "r6c5"],
                    quotient: "r1c4"
                }
            },
            step2: {
                columnFocus: "c5",
                input: ["r6c4", "r3c5"],
                output: {
                    product: ["r7c4", "r7c5", "r7c6"],
                    remainder: ["r9c4", "r9c5", "r9c6"],
                    quotient: "r1c5"
                }
            },
            step3: {
                columnFocus: "c6",
                input: ["r9c5", "r3c6"],
                output: {
                    product: ["r10c4", "r10c5", "r10c6"],
                    remainder: ["r12c4", "r12c5", "r12c6"],
                    quotient: "r1c6",
                    finalRemainder: ["r1c8", "r1c9"]
                }
            }
        };
        
        this.set('grid-mappings', mappings, true); // Silent
        return mappings;
    }
    
// In division.js - add this new method
    initializeGridDigits(dividend, divisor) {
        // Clear any existing values first
        this.clearGrid();
        
        // Set dividend in grid (r3c4, r3c5, r3c6)
        const dividendStr = String(dividend).padStart(3, '0');
        const r3c4 = document.getElementById('r3c4');
        const r3c5 = document.getElementById('r3c5');
        const r3c6 = document.getElementById('r3c6');
        
        if (r3c4) r3c4.textContent = dividendStr[0];
        if (r3c5) r3c5.textContent = dividendStr[1];
        if (r3c6) r3c6.textContent = dividendStr[2];
        
        // Set divisor in grid (r3c1, r3c2)
        const divisorStr = String(divisor).padStart(2, '0');
        const r3c1 = document.getElementById('r3c1');
        const r3c2 = document.getElementById('r3c2');
        
        if (r3c1) r3c1.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
        if (r3c2) r3c2.textContent = divisorStr[1];
        
        // Clear all other non-transparent cells
        document.querySelectorAll('.division-table:not(.transparent)').forEach(cell => {
            const id = cell.id;
            // Skip cells we just set
            if (!['r3c1', 'r3c2', 'r3c4', 'r3c5', 'r3c6'].includes(id)) {
                cell.textContent = '';
                cell.classList.remove('filled', 'highlighted');
            }
        });
    }
    
    initializeNewProblem() {
        // Use the default problem from HTML (123 ÷ 5)
        const defaultDividend = parseInt(this.stepTracker.get('dividend')) || 123;
        const defaultDivisor = parseInt(this.stepTracker.get('divisor')) || 5;
        
        this.stepTracker.setProblem(defaultDividend, defaultDivisor);
        this.updateMainEquation();
        this.showCurrentStep();
        
        // Ensure grid is properly initialized
        this.initializeGridDigits(defaultDividend, defaultDivisor);
    }

    resetCurrentProblem() {
        this.stepTracker.resetProblem();
        this.currentGuess = 0;
        this.updateGuessDisplay();
        this.clearGrid();
        this.showCurrentStep();
    }
    
    // ========== STEP MANAGEMENT ==========
    
    showCurrentStep() {
        const currentStep = this.stepTracker.getCurrentStep();
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        
        if (!stepData) return;
        
        // Show the step container
        this.currentStepContainer.classList.remove('hidden');
        
        // Update step info
        document.querySelector('.current-step-title').textContent = `Current Step - Step ${currentStep}`;
        this.currentStepEquation.textContent = `${stepData.partialDividend} ÷ ${this.stepTracker.get('divisor')} = ?`;
        this.currentInstruction.textContent = `How many times does ${this.stepTracker.get('divisor')} go into ${stepData.partialDividend}?`;
        
        // Show work feedback area
        this.workFeedback.classList.remove('hidden');
        
        // Highlight relevant grid cells
        this.highlightGridForStep(currentStep);
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
        this.stepTracker.setCurrentGuess(this.currentGuess, true); // SILENT!
    }
    
    commitCurrentGuess() {
        const currentStep = this.stepTracker.getCurrentStep();
        const isCorrect = this.stepTracker.checkGuess(this.currentGuess);
        
        if (isCorrect) {
            this.handleCorrectGuess(currentStep);
        } else {
            this.handleIncorrectGuess();
        }
    }
    
    handleCorrectGuess(step) {
        // Get step data
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${step}`];
        const divisor = this.stepTracker.get('divisor');
        
        // Calculate product and remainder
        const product = this.currentGuess * divisor;
        const remainder = stepData.partialDividend - product;
        
        // Update grid with calculations
        this.updateGridForStep(step, this.currentGuess, product, remainder);
        
        // Update step tracker
        this.stepTracker.completeStep({
            guess: this.currentGuess,
            product: product,
            remainder: remainder,
            timeSpent: 0 // Could track actual time
        });
        
        // Update score
        this.updateScore(true);
        
        // Reset guess for next step
        this.currentGuess = 0;
        this.updateGuessDisplay();
        
        // Check if problem is complete
        if (this.stepTracker.get('problem-completed')) {
            this.showCompletionMessage();
        }
    }
    
    handleIncorrectGuess() {
        // Update mistake count
        this.updateScore(false);
        
        // Show error feedback
        this.showTemporaryFeedback('Try again!', 'error');
        
        // Reset guess
        this.currentGuess = 0;
        this.updateGuessDisplay();
    }
    
    // ========== GRID MANAGEMENT ==========
    
    highlightGridForStep(step) {
        // Clear previous highlights
        document.querySelectorAll('.division-table.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Get grid mappings for this step
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings[`step${step}`];
        
        if (!stepMapping) return;
        
        // Highlight input cells
        stepMapping.input.forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) cell.classList.add('highlighted');
        });
    }
    
    updateGridForStep(step, guess, product, remainder) {
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings[`step${step}`];
        
        if (!stepMapping) return;
        
        // Update quotient cell
        const quotientCell = document.getElementById(stepMapping.output.quotient);
        if (quotientCell) {
            quotientCell.textContent = guess;
            quotientCell.classList.add('filled');
        }
        
        // Update product cells WITH STEP NUMBER
        if (stepMapping.output.product) {
            this.updateNumberInCells(stepMapping.output.product, product, step);
        }
        
        // Update remainder cells WITH STEP NUMBER  
        if (stepMapping.output.remainder) {
            this.updateNumberInCells(stepMapping.output.remainder, remainder, step);
        }
        
        // Update final remainder in answer area if step 3
        if (step === 3 && stepMapping.output.finalRemainder) {
            const finalRemainder = this.stepTracker.get('remainder');
            // For final remainder (03), show in r1c8,r1c9
            this.updateNumberInCells(stepMapping.output.finalRemainder, finalRemainder, step);
            
            // Show remainder in main equation
            document.querySelectorAll('.mainEquation.remainder').forEach(el => {
                el.classList.remove('hidden');
            });
        }
    }
    
    updateNumberInCells(cellIds, number, stepNumber = 1) {
        // Get the step mapping to know which column to focus on
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings ? gridMappings[`step${stepNumber}`] : null;
        
        if (!stepMapping) {
            // Fallback: use original logic
            const numStr = String(number).padStart(cellIds.length, '0');
            cellIds.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    const digit = numStr.length > index ? numStr[numStr.length - cellIds.length + index] : '0';
                    cell.textContent = digit;
                    if (digit !== '') cell.classList.add('filled');
                }
            });
            return;
        }
        
        // Special handling based on step number and column focus
        const columnFocus = stepMapping.columnFocus;
        
        if (stepNumber === 1 && columnFocus === "c4") {
            // STEP 1: Only fill the FIRST cell (r4c4 for product, r6c4 for remainder)
            // Product "0" should only go in r4c4
            // Remainder "1" should only go in r6c4
            cellIds.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    if (index === 0) {
                        // First cell gets the number
                        cell.textContent = String(number);
                        cell.classList.add('filled');
                    } else {
                        // Other cells remain empty
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    }
                }
            });
        } else if (stepNumber === 2 && columnFocus === "c5") {
            // STEP 2: Center on C5 (product "10" should fill r7c4,r7c5)
            const numStr = String(number).padStart(cellIds.length, '0');
            cellIds.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    const digit = numStr.length > index ? numStr[numStr.length - cellIds.length + index] : '0';
                    cell.textContent = digit;
                    if (digit !== '' && digit !== '0') {
                        cell.classList.add('filled');
                    } else if (digit === '0' && cellId.includes('c4') && stepNumber === 2) {
                        // For step 2, leading zero in c4 should be shown
                        cell.textContent = '0';
                        cell.classList.add('filled');
                    }
                }
            });
        } else if (stepNumber === 3 && columnFocus === "c6") {
            // STEP 3: Center on C6 (product "20" should fill r10c5,r10c6)
            const numStr = String(number).padStart(cellIds.length, '0');
            cellIds.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    const digit = numStr.length > index ? numStr[numStr.length - cellIds.length + index] : '0';
                    // For step 3, "20" should appear in columns 5-6 (c5-c6)
                    if (cellId.includes('c4') && number < 100) {
                        // Leave c4 empty for two-digit products
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    } else {
                        cell.textContent = digit;
                        if (digit !== '') cell.classList.add('filled');
                    }
                }
            });
        } else {
            // Default: pad and fill all cells
            const numStr = String(number).padStart(cellIds.length, '0');
            cellIds.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    const digit = numStr.length > index ? numStr[numStr.length - cellIds.length + index] : '0';
                    cell.textContent = digit;
                    if (digit !== '') cell.classList.add('filled');
                }
            });
        }
    }
    
    clearGrid() {
        // Clear all non-transparent cells
        document.querySelectorAll('.division-table:not(.transparent)').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('filled', 'highlighted');
        });
        
        // Hide remainder in main equation
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
        
        // Update dividend digits in BOTH main equation AND grid
        const dividendStr = String(dividend).padStart(3, '0');
        
        // Main equation
        document.querySelector('.mainEquation.dividend.hundreds').textContent = dividendStr[0];
        document.querySelector('.mainEquation.dividend.tens').textContent = dividendStr[1];
        document.querySelector('.mainEquation.dividend.ones').textContent = dividendStr[2];
        
        // Grid cells (r3c4, r3c5, r3c6)
        const gridMappings = this.stepTracker.get('grid-mappings');
        if (gridMappings && gridMappings.dividend) {
            // If we have dividend mapping in grid-mappings, use it
            const cells = ['r3c4', 'r3c5', 'r3c6'];
            cells.forEach((cellId, index) => {
                const cell = document.getElementById(cellId);
                if (cell) {
                    cell.textContent = dividendStr[index];
                }
            });
        } else {
            // Fallback: direct cell assignment
            const r3c4 = document.getElementById('r3c4');
            const r3c5 = document.getElementById('r3c5');
            const r3c6 = document.getElementById('r3c6');
            if (r3c4) r3c4.textContent = dividendStr[0];
            if (r3c5) r3c5.textContent = dividendStr[1];
            if (r3c6) r3c6.textContent = dividendStr[2];
        }
        
        // Update divisor digits
        const divisorStr = String(divisor).padStart(2, '0');
        
        // Main equation
        const tensCell = document.querySelector('.mainEquation.divisor.tens');
        const onesCell = document.querySelector('.mainEquation.divisor.ones');
        
        tensCell.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
        onesCell.textContent = divisorStr[1];
        
        // Grid cells (r3c1, r3c2)
        const r3c1 = document.getElementById('r3c1');
        const r3c2 = document.getElementById('r3c2');
        if (r3c1) r3c1.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
        if (r3c2) r3c2.textContent = divisorStr[1];
        
        // Clear quotient and remainder in main equation
        document.querySelectorAll('.mainEquation.answer').forEach(el => {
            el.textContent = '?';
        });
        
        // Hide remainder in main equation
        document.querySelectorAll('.mainEquation.remainder').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Clear grid cells for quotient and remainder
        this.clearGrid();
        
        // Show equals sign
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
            
            // Check if problem is fully completed
            if (this.stepTracker.get('problem-completed')) {
                this.showTemporaryFeedback('Problem solved!', 'success');
            } else {
                this.showTemporaryFeedback('Correct!', 'success');
            }
        } else {
            mistakes++;
            streak = 0;
        }
        
        // Update displays
        this.solvedCount.textContent = solved;
        this.mistakeCount.textContent = mistakes;
        this.currentStreak.textContent = streak;
        
        // Calculate accuracy
        const totalAttempts = solved + mistakes;
        const accuracy = totalAttempts > 0 ? Math.round((solved / totalAttempts) * 100) : 0;
        this.divisionAccuracy.textContent = `${accuracy}%`;
        
        // Save to localStorage
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
        
        // Set message and style
        feedbackEl.textContent = message;
        feedbackEl.style.background = type === 'success' ? '#4CAF50' : '#f44336';
        feedbackEl.style.opacity = '1';
        
        // Hide after delay
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
            setTimeout(() => feedbackEl.remove(), 300);
        }, 2000);
    }
    
    showCompletionMessage() {
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        
        let message = `Correct! ${this.stepTracker.get('dividend')} ÷ ${this.stepTracker.get('divisor')} = ${quotient}`;
        if (remainder > 0) {
            message += ` R${remainder}`;
        }
        
        this.showTemporaryFeedback(message, 'success');
        
        // Hide step container
        this.currentStepContainer.classList.add('hidden');
        this.workFeedback.classList.add('hidden');
    }
    
    // ========== INITIALIZATION ==========
    
    init() {
        this.loadScores();
        this.initializeNewProblem();
        console.log('Division App initialized');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const divisionApp = new DivisionApp();
    divisionApp.init();
    
    // Make available for debugging
    window.divisionApp = divisionApp;
});
