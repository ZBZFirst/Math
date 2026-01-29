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
        
        console.log(`Generating new problem: ${dividend} ÷ ${divisor}`);
        
        // Set problem in tracker
        this.stepTracker.setProblem(dividend, divisor);
        
        // Update visual display
        this.updateMainEquation();
        
        // Initialize grid with new problem digits
        this.initializeGridDigits(dividend, divisor);
        
        // Reset UI state
        this.currentGuess = 0;
        this.updateGuessDisplay();
        
        // Show the current step (this will also show the work feedback)
        this.showCurrentStep();
        
        // Ensure work feedback is visible
        this.workFeedback.classList.remove('hidden');
        this.currentStepContainer.classList.remove('hidden');
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
    
    initializeGridDigits(dividend, divisor) {
        console.log(`Initializing grid digits: ${dividend} ÷ ${divisor}`);
        
        // Clear all non-transparent cells
        this.clearGrid();
        
        // Set dividend in grid (r3c4, r3c5, r3c6)
        const dividendStr = String(dividend).padStart(3, '0');
        const r3c4 = document.getElementById('r3c4');
        const r3c5 = document.getElementById('r3c5');
        const r3c6 = document.getElementById('r3c6');
        
        if (r3c4) {
            r3c4.textContent = dividendStr[0];
            r3c4.classList.add('orange');
        }
        if (r3c5) {
            r3c5.textContent = dividendStr[1];
            r3c5.classList.add('orange');
        }
        if (r3c6) {
            r3c6.textContent = dividendStr[2];
            r3c6.classList.add('orange');
        }
        
        // Set divisor in grid (r3c1, r3c2)
        const divisorStr = String(divisor).padStart(2, '0');
        const r3c1 = document.getElementById('r3c1');
        const r3c2 = document.getElementById('r3c2');
        
        if (r3c1) {
            r3c1.textContent = divisorStr[0] === '0' ? '' : divisorStr[0];
            if (divisorStr[0] !== '0') {
                r3c1.classList.add('blue');
            }
        }
        if (r3c2) {
            r3c2.textContent = divisorStr[1];
            r3c2.classList.add('blue');
        }
        
        // Clear quotient cells in row 1
        ['r1c4', 'r1c5', 'r1c6', 'r1c8', 'r1c9'].forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('filled', 'green');
            }
        });
        
        // Hide remainder in main equation
        document.querySelectorAll('.mainEquation.remainder').forEach(el => {
            el.classList.add('hidden');
        });
    }
    
    initializeNewProblem() {
        // Use the default problem from HTML (123 ÷ 5)
        const defaultDividend = parseInt(this.stepTracker.get('dividend')) || 123;
        const defaultDivisor = parseInt(this.stepTracker.get('divisor')) || 5;
        
        console.log(`Initializing problem: ${defaultDividend} ÷ ${defaultDivisor}`);
        
        this.stepTracker.setProblem(defaultDividend, defaultDivisor);
        this.updateMainEquation();
        this.initializeGridDigits(defaultDividend, defaultDivisor);
        this.showCurrentStep();
        
        // Ensure work feedback is visible
        this.workFeedback.classList.remove('hidden');
    }

    resetCurrentProblem() {
        console.log('Resetting current problem');
        
        const dividend = this.stepTracker.get('dividend');
        const divisor = this.stepTracker.get('divisor');
        
        // Reset the step tracker
        this.stepTracker.resetProblem();
        
        // Reset UI state
        this.currentGuess = 0;
        this.updateGuessDisplay();
        
        // Clear and reinitialize the grid
        this.clearGrid();
        this.initializeGridDigits(dividend, divisor);
        
        // Show the current step (which will show controls)
        this.showCurrentStep();
    }
    
    // ========== STEP MANAGEMENT ==========
    
    showCurrentStep() {
        const currentStep = this.stepTracker.getCurrentStep();
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        
        if (!stepData) return;
        
        console.log(`Showing step ${currentStep}`);
        
        // Show the step container
        this.currentStepContainer.classList.remove('hidden');
        
        // Update step info
        document.querySelector('.current-step-title').textContent = `Current Step - Step ${currentStep}`;
        this.currentStepEquation.textContent = `${stepData.partialDividend} ÷ ${this.stepTracker.get('divisor')} = ?`;
        this.currentInstruction.textContent = `How many times does ${this.stepTracker.get('divisor')} go into ${stepData.partialDividend}?`;
        
        // ALWAYS show work feedback with controls
        this.workFeedback.classList.remove('hidden');
        
        // Highlight relevant grid cells
        this.highlightGridForStep(currentStep);
        
        // If this is step 2 or 3, ensure the brought down digit is shown
        if (currentStep === 2 || currentStep === 3) {
            this.ensureBroughtDownDigit(currentStep);
        }
    }
    
    // Helper method to ensure brought down digit is visible
    ensureBroughtDownDigit(step) {
        if (step === 2) {
            const broughtDownDigit2 = document.getElementById('r3c5').textContent;
            const bringDownCell2 = document.getElementById('r6c5');
            if (bringDownCell2 && broughtDownDigit2 && !bringDownCell2.textContent) {
                bringDownCell2.textContent = broughtDownDigit2;
                bringDownCell2.classList.add('filled');
            }
        } else if (step === 3) {
            const broughtDownDigit3 = document.getElementById('r3c6').textContent;
            const bringDownCell3 = document.getElementById('r9c6');
            if (bringDownCell3 && broughtDownDigit3 && !bringDownCell3.textContent) {
                bringDownCell3.textContent = broughtDownDigit3;
                bringDownCell3.classList.add('filled');
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
        
        // Update grid with current step's calculations (product and remainder)
        this.updateGridForStep(step, this.currentGuess, product, remainder);
        
        // Update step tracker
        this.stepTracker.completeStep({
            guess: this.currentGuess,
            product: product,
            remainder: remainder,
            timeSpent: 0
        });
        
        // If we're moving to next step, prepare it (bring down digit)
        const nextStep = step + 1;
        if (nextStep <= 3 && !this.stepTracker.get('problem-completed')) {
            this.prepareNextStep(nextStep);
        }
        
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
    
    // NEW METHOD: Prepare next step (bring down digit)
    prepareNextStep(nextStep) {
        switch(nextStep) {
            case 2:
                // Bring down the digit from r3c5 to r6c5
                const broughtDownDigit2 = document.getElementById('r3c5').textContent;
                const bringDownCell2 = document.getElementById('r6c5');
                if (bringDownCell2 && broughtDownDigit2) {
                    bringDownCell2.textContent = broughtDownDigit2; // Bring down the "2"
                    bringDownCell2.classList.add('filled');
                }
                break;
                
            case 3:
                // Bring down the digit from r3c6 to r9c6
                const broughtDownDigit3 = document.getElementById('r3c6').textContent;
                const bringDownCell3 = document.getElementById('r9c6');
                if (bringDownCell3 && broughtDownDigit3) {
                    bringDownCell3.textContent = broughtDownDigit3; // Bring down the "3"
                    bringDownCell3.classList.add('filled');
                }
                break;
        }
        
        // Update the highlighted cells for the next step
        setTimeout(() => {
            this.highlightGridForStep(nextStep);
        }, 100);
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
        console.log(`Updating grid for step ${step}: guess=${guess}, product=${product}, remainder=${remainder}`);
        
        // Update quotient cell
        const quotientCellId = `r1c${step + 3}`; // r1c4, r1c5, or r1c6
        const quotientCell = document.getElementById(quotientCellId);
        if (quotientCell) {
            quotientCell.textContent = guess;
            quotientCell.classList.add('filled');
        }
        
        // Handle each step differently based on column requirements
        switch(step) {
            case 1:
                // Step 1: Only column 4
                
                // Product "0" → ONLY r4c4 (not "00")
                const productCell1 = document.getElementById('r4c4');
                if (productCell1) {
                    productCell1.textContent = String(product);
                    productCell1.classList.add('filled');
                }
                // Clear r4c5, r4c6
                ['r4c5', 'r4c6'].forEach(cellId => {
                    const cell = document.getElementById(cellId);
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    }
                });
                
                // Remainder "1" → ONLY r6c4
                const remainderCell1 = document.getElementById('r6c4');
                if (remainderCell1) {
                    remainderCell1.textContent = String(remainder);
                    remainderCell1.classList.add('filled');
                }
                // Clear r6c5, r6c6
                ['r6c5', 'r6c6'].forEach(cellId => {
                    const cell = document.getElementById(cellId);
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    }
                });
                break;
                
            case 2:
                // Step 2: Columns 4-5 (2-digit area, right-aligned)
                
                // Note: The digit was already "brought down" by prepareNextStep()
                // The partial dividend "12" is now visible in r6c4,r6c5
                
                // Show the product "10" → "10" in r7c4,r7c5
                const productStr2 = String(product).padStart(2, '0'); // "10"
                const productCell2a = document.getElementById('r7c4');
                const productCell2b = document.getElementById('r7c5');
                if (productCell2a && productCell2b) {
                    productCell2a.textContent = productStr2[0]; // "1"
                    productCell2a.classList.add('filled');
                    productCell2b.textContent = productStr2[1]; // "0"
                    productCell2b.classList.add('filled');
                }
                // Clear r7c6
                const productCell2c = document.getElementById('r7c6');
                if (productCell2c) {
                    productCell2c.textContent = '';
                    productCell2c.classList.remove('filled');
                }
                
                // Remainder "2" → "02" in r9c4,r9c5
                const remainderStr2 = String(remainder).padStart(2, '0'); // "02"
                const remainderCell2a = document.getElementById('r9c4');
                const remainderCell2b = document.getElementById('r9c5');
                if (remainderCell2a && remainderCell2b) {
                    remainderCell2a.textContent = remainderStr2[0]; // "0"
                    remainderCell2a.classList.add('filled');
                    remainderCell2b.textContent = remainderStr2[1]; // "2"
                    remainderCell2b.classList.add('filled');
                }
                // Clear r9c6
                const remainderCell2c = document.getElementById('r9c6');
                if (remainderCell2c) {
                    remainderCell2c.textContent = '';
                    remainderCell2c.classList.remove('filled');
                }
                break;
                
            case 3:
                // Step 3: Columns 5-6 (2-digit area, right-aligned)
                
                // Note: The digit was already "brought down" by prepareNextStep()
                // The partial dividend "23" is now visible in r9c5,r9c6
                
                // Show the product "20" → "20" in r10c5,r10c6
                const productStr3 = String(product).padStart(2, '0'); // "20"
                // Clear r10c4 first
                const productCell3a = document.getElementById('r10c4');
                if (productCell3a) {
                    productCell3a.textContent = '';
                    productCell3a.classList.remove('filled');
                }
                
                const productCell3b = document.getElementById('r10c5');
                const productCell3c = document.getElementById('r10c6');
                if (productCell3b && productCell3c) {
                    productCell3b.textContent = productStr3[0]; // "2"
                    productCell3b.classList.add('filled');
                    productCell3c.textContent = productStr3[1]; // "0"
                    productCell3c.classList.add('filled');
                }
                
                // Remainder "3" → "03" in r12c5,r12c6
                const remainderStr3 = String(remainder).padStart(2, '0'); // "03"
                // Clear r12c4 first
                const remainderCell3a = document.getElementById('r12c4');
                if (remainderCell3a) {
                    remainderCell3a.textContent = '';
                    remainderCell3a.classList.remove('filled');
                }
                
                const remainderCell3b = document.getElementById('r12c5');
                const remainderCell3c = document.getElementById('r12c6');
                if (remainderCell3b && remainderCell3c) {
                    remainderCell3b.textContent = remainderStr3[0]; // "0"
                    remainderCell3b.classList.add('filled');
                    remainderCell3c.textContent = remainderStr3[1]; // "3"
                    remainderCell3c.classList.add('filled');
                }
                
                // Final remainder in answer area
                const finalRemainder = this.stepTracker.get('remainder');
                console.log(`Final remainder: ${finalRemainder}`);
                
                if (finalRemainder > 0) {
                    const finalRemainderStr = String(finalRemainder).padStart(2, '0'); // "03"
                    
                    // Update the remainder cells in the answer area
                    const r1c8 = document.getElementById('r1c8');
                    const r1c9 = document.getElementById('r1c9');
                    
                    if (r1c8 && r1c9) {
                        r1c8.textContent = finalRemainderStr[0]; // "0"
                        r1c8.classList.add('filled');
                        r1c9.textContent = finalRemainderStr[1]; // "3"
                        r1c9.classList.add('filled');
                    }
                    
                    // Show remainder in main equation
                    document.querySelectorAll('.mainEquation.remainder').forEach(el => {
                        el.classList.remove('hidden');
                    });
                }
                break;
        }
    }
    
    // In division.js - COMPLETELY REVISED updateNumberInCells method
    updateNumberInCells(cellIds, number, stepNumber = 1) {
        // Get step mapping to understand column focus
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings ? gridMappings[`step${stepNumber}`] : null;
        
        if (!stepMapping || !stepMapping.columnFocus) {
            console.warn(`No mapping for step ${stepNumber}`);
            return;
        }
        
        const columnFocus = stepMapping.columnFocus; // "c4", "c5", or "c6"
        const numStr = String(number);
        
        // Determine which columns are actually used for this step
        let startCol, endCol;
        
        switch(stepNumber) {
            case 1:
                // Step 1: Only use column 4
                startCol = 4;
                endCol = 4;
                break;
            case 2:
                // Step 2: Use columns 4-5 (2-digit area)
                startCol = 4;
                endCol = 5;
                break;
            case 3:
                // Step 3: Use columns 5-6 (2-digit area)
                startCol = 5;
                endCol = 6;
                break;
            default:
                startCol = 4;
                endCol = 6;
        }
        
        // Clear all cells in the range first
        for (let col = startCol; col <= endCol; col++) {
            const row = this.getRowForStep(stepNumber, cellIds[0].includes('yellow') ? 'product' : 'remainder');
            const cellId = `r${row}c${col}`;
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        }
        
        // Place the number RIGHT-ALIGNED within the column range
        const numDigits = numStr.length;
        const availableColumns = endCol - startCol + 1;
        
        for (let i = 0; i < numDigits; i++) {
            const digit = numStr[numStr.length - 1 - i]; // Start from rightmost digit
            const col = endCol - i; // Place right-to-left
            
            if (col >= startCol) {
                const row = this.getRowForStep(stepNumber, cellIds[0].includes('yellow') ? 'product' : 'remainder');
                const cellId = `r${row}c${col}`;
                const cell = document.getElementById(cellId);
                
                if (cell) {
                    cell.textContent = digit;
                    cell.classList.add('filled');
                }
            }
        }
        
        // Fill leading zeros for 2-digit numbers when needed
        if (availableColumns === 2 && numDigits === 1) {
            // Single digit in 2-column area: add leading zero
            const leadingZeroCol = startCol;
            const row = this.getRowForStep(stepNumber, cellIds[0].includes('yellow') ? 'product' : 'remainder');
            const cellId = `r${row}c${leadingZeroCol}`;
            const cell = document.getElementById(cellId);
            
            if (cell) {
                cell.textContent = '0';
                cell.classList.add('filled');
            }
        }
    }
    
    // Helper method to get the correct row for each step
    getRowForStep(stepNumber, type = 'product') {
        switch(stepNumber) {
            case 1:
                return type === 'product' ? 4 : 6;
            case 2:
                return type === 'product' ? 7 : 9;
            case 3:
                return type === 'product' ? 10 : 12;
            default:
                return 0;
        }
    }
    
    clearGrid() {
        console.log('Clearing grid');
        
        // Clear all non-transparent cells except the dividend/divisor cells
        document.querySelectorAll('.division-table:not(.transparent)').forEach(cell => {
            const id = cell.id;
            
            // Don't clear the original problem cells (they will be set by initializeGridDigits)
            if (!['r3c1', 'r3c2', 'r3c4', 'r3c5', 'r3c6'].includes(id)) {
                cell.textContent = '';
                cell.classList.remove('filled', 'highlighted', 'brought-down', 'yellow', 'brown', 'green');
                
                // Restore original classes based on cell position
                if (id.includes('yellow')) cell.classList.add('yellow');
                if (id.includes('brown')) cell.classList.add('brown');
                if (id.includes('green')) cell.classList.add('green');
                if (id.includes('orange')) cell.classList.add('orange');
                if (id.includes('blue')) cell.classList.add('blue');
            }
        });
        
        // Clear highlight from dividend cells
        ['r3c4', 'r3c5', 'r3c6'].forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) cell.classList.remove('highlighted');
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
        const dividend = this.stepTracker.get('dividend');
        const divisor = this.stepTracker.get('divisor');
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        
        let message = `Correct! ${dividend} ÷ ${divisor} = ${quotient}`;
        if (remainder > 0) {
            message += ` R${remainder}`;
        }
        
        this.showTemporaryFeedback(message, 'success');
        
        // Hide step container
        this.currentStepContainer.classList.add('hidden');
        this.workFeedback.classList.add('hidden');
        
        // Update main equation with final answer
        this.updateFinalAnswerInEquation();
    }
    
    // Add this new method
    updateFinalAnswerInEquation() {
        const quotient = this.stepTracker.get('quotient');
        const remainder = this.stepTracker.get('remainder');
        const quotientStr = String(quotient).padStart(3, '0');
        const remainderStr = String(remainder).padStart(2, '0');
        
        // Update quotient in main equation
        const hundreds = document.querySelector('.mainEquation.answer.hundreds');
        const tens = document.querySelector('.mainEquation.answer.tens');
        const ones = document.querySelector('.mainEquation.answer.ones');
        
        if (hundreds) hundreds.textContent = quotientStr[0] === '0' ? '' : quotientStr[0];
        if (tens) tens.textContent = quotientStr[1] === '0' ? '' : quotientStr[1];
        if (ones) ones.textContent = quotientStr[2];
        
        // Update remainder in main equation if needed
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const divisionApp = new DivisionApp();
    divisionApp.init();
    
    // Make available for debugging
    window.divisionApp = divisionApp;
});
