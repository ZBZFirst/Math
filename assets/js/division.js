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
        document.addEventListener('phase-changed', (e) => this.handlePhaseChange(e));

    }

    // Add the handlePhaseChange method:
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
        
        // First clear the grid
        this.clearGrid();
        
        // Format numbers based on their actual length
        const dividendStr = String(dividend);
        const divisorStr = String(divisor);
        
        // Handle 2-digit or 3-digit dividends
        const dividendDigits = dividendStr.split('');
        
        // RIGHT-ALIGN the dividend in columns 4-6
        // For 81: "", "8", "1" in columns 4,5,6
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
        
        // Handle divisor (always right-aligned in columns 1-2)
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
        const currentPhase = this.stepTracker.getCurrentPhase();
        const totalSteps = this.stepTracker.get('total-steps') || 3;
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        const divisor = this.stepTracker.get('divisor');
        
        if (!stepData) {
            console.warn(`No data for step ${currentStep}`);
            return;
        }
        
        console.log(`Showing step ${currentStep}, phase ${currentPhase}:`, stepData);
        
        // Show the step container
        this.currentStepContainer.classList.remove('hidden');
        
        // Update step title with phase info
        const stepTitle = document.querySelector('.current-step-title');
        if (stepTitle) {
            stepTitle.textContent = `Current Step - Step ${currentStep} (Phase ${currentPhase}/3)`;
        }
        
        // Update display based on current phase
        this.updateDisplayForPhase(currentStep, currentPhase, stepData, divisor);
        
        // ALWAYS show work feedback with controls
        this.workFeedback.classList.remove('hidden');
        
        // Highlight relevant grid cells for current phase
        this.highlightGridForPhase(currentPhase);
        
        // Reset current guess for this phase
        this.currentGuess = this.getGuessForPhase(currentStep, currentPhase, stepData);
        this.updateGuessDisplay();
        
        // If this is step 2 or 3 and phase 1, ensure the brought down digit is shown
        if (currentStep >= 2 && currentPhase === 1) {
            this.ensureBroughtDownDigit(currentStep);
        }
    }
    
    updateDisplayForPhase(step, phase, stepData, divisor) {
        switch(phase) {
            case 1: // QUOTIENT PHASE
                this.currentStepEquation.textContent = `${stepData.partialDividend} ÷ ${divisor} = ?`;
                this.currentInstruction.textContent = `How many times does ${divisor} go into ${stepData.partialDividend}?`;
                break;
                
            case 2: // PRODUCT PHASE
                // Use the guess from phase 1
                const guess = stepData.userGuess || 0;
                this.currentStepEquation.textContent = `${guess} × ${divisor} = ?`;
                this.currentInstruction.textContent = `Calculate the product of ${guess} × ${divisor}`;
                break;
                
            case 3: // REMAINDER PHASE
                const partialDividend = stepData.partialDividend;
                const product = stepData.userProduct || 0;
                this.currentStepEquation.textContent = `${partialDividend} - ${product} = ?`;
                this.currentInstruction.textContent = `Subtract to find the remainder`;
                break;
        }
    }
    
    getGuessForPhase(step, phase, stepData) {
        switch(phase) {
            case 1:
                return stepData.userGuess || 0;
            case 2:
                return stepData.userProduct || 0;
            case 3:
                return stepData.userRemainder || 0;
            default:
                return 0;
        }
    }
    
    highlightGridForPhase(phase) {
        // Clear previous highlights
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
            case 1: // QUOTIENT PHASE - highlight input area
                if (stepMapping.input && stepMapping.input.length > 0) {
                    stepMapping.input.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.classList.add('highlighted');
                        }
                    });
                }
                break;
                
            case 2: // PRODUCT PHASE - highlight product cells
                if (stepMapping.output && stepMapping.output.product) {
                    stepMapping.output.product.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.classList.add('highlighted');
                        }
                    });
                }
                break;
                
            case 3: // REMAINDER PHASE - highlight remainder cells
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


    
    
    // Helper method to ensure brought down digit is visible
    ensureBroughtDownDigit(step) {
        if (step === 2) {
            const broughtDownDigit2 = document.getElementById('r3c5').textContent;
            const bringDownCell2 = document.getElementById('r6c5');
            if (bringDownCell2 && broughtDownDigit2 && broughtDownDigit2 !== '') {
                // Only bring down if not already there
                if (!bringDownCell2.textContent || bringDownCell2.textContent === '') {
                    bringDownCell2.textContent = broughtDownDigit2;
                    bringDownCell2.classList.add('filled');
                }
            }
        } else if (step === 3) {
            const broughtDownDigit3 = document.getElementById('r3c6').textContent;
            const bringDownCell3 = document.getElementById('r9c6');
            if (bringDownCell3 && broughtDownDigit3 && broughtDownDigit3 !== '') {
                // Only bring down if not already there
                if (!bringDownCell3.textContent || bringDownCell3.textContent === '') {
                    bringDownCell3.textContent = broughtDownDigit3;
                    bringDownCell3.classList.add('filled');
                }
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
        // Just pass to handleCorrectGuess - it will check if it's correct
        this.handleCorrectGuess();
    }
    
    // Replace the handleCorrectGuess method with this:
    handleCorrectGuess() {
        const currentStep = this.stepTracker.getCurrentStep();
        const currentPhase = this.stepTracker.getCurrentPhase();
        const stepAnswers = this.stepTracker.get('step-answers');
        const stepData = stepAnswers[`step${currentStep}`];
        
        console.log(`Handling guess for step ${currentStep}, phase ${currentPhase}: guess=${this.currentGuess}`);
        
        // Check if the guess is correct for this phase
        const isCorrect = this.stepTracker.checkGuess(this.currentGuess);
        
        if (isCorrect) {
            // Store the value for the current phase
            switch(currentPhase) {
                case 1:
                    stepData.userGuess = this.currentGuess;
                    this.showTemporaryFeedback('Correct guess! Now calculate the product.', 'success');
                    break;
                case 2:
                    stepData.userProduct = this.currentGuess;
                    this.showTemporaryFeedback('Correct product! Now find the remainder.', 'success');
                    break;
                case 3:
                    stepData.userRemainder = this.currentGuess;
                    this.showTemporaryFeedback('Correct remainder! Step complete.', 'success');
                    break;
            }
            
            // Update step data
            this.stepTracker.set('step-answers', stepAnswers);
            
            // Update grid for this phase
            this.updateGridForPhase(currentStep, currentPhase, this.currentGuess);
            
            // If this was phase 3, complete the step
            if (currentPhase === 3) {
                // Complete the step
                const stepResult = {
                    guess: stepData.userGuess,
                    product: stepData.userProduct,
                    remainder: stepData.userRemainder,
                    isCorrect: true
                };
                
                this.stepTracker.completeStep(stepResult);
                
                // Update score
                this.updateScore(true);
                
                // Check if problem is complete
                if (this.stepTracker.get('problem-completed')) {
                    this.showCompletionMessage();
                } else {
                    // Prepare for next step
                    const nextStep = currentStep + 1;
                    this.prepareNextStep(nextStep);
                    
                    // Show next step after delay
                    setTimeout(() => {
                        this.showCurrentStep();
                    }, 1500);
                }
            } else {
                // Move to next phase
                this.stepTracker.nextPhase();
                
                // Update display for next phase
                setTimeout(() => {
                    this.showCurrentStep();
                }, 1000);
            }
        } else {
            this.handleIncorrectGuess();
        }
    }
    
    // Add these new helper methods:
    highlightGridForPhase(phase) {
        // Clear previous highlights
        document.querySelectorAll('.division-table.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        const currentStep = this.stepTracker.getCurrentStep();
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings[`step${currentStep}`];
        
        if (!stepMapping) return;
        
        // Highlight cells based on phase
        switch(phase) {
            case 1: // Guess phase - highlight input cells
                stepMapping.input.forEach(cellId => {
                    const cell = document.getElementById(cellId);
                    if (cell) cell.classList.add('highlighted');
                });
                break;
                
            case 2: // Product phase - highlight product cells
                if (stepMapping.output && stepMapping.output.product) {
                    stepMapping.output.product.forEach(cellId => {
                        const cell = document.getElementById(cellId);
                        if (cell) cell.classList.add('highlighted');
                    });
                }
                break;
                
            case 3: // Remainder phase - highlight remainder cells
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
        const gridMappings = this.stepTracker.get('grid-mappings');
        const stepMapping = gridMappings[`step${step}`];
        
        if (!stepMapping) {
            console.warn(`No grid mapping for step ${step}`);
            return;
        }
        
        const valueStr = String(value);
        
        switch(phase) {
            case 1: // Update quotient digit
                const quotientCell = document.getElementById(stepMapping.output.quotient);
                if (quotientCell) {
                    quotientCell.textContent = valueStr;
                    quotientCell.classList.add('filled');
                }
                break;
                
            case 2: // Update product
                const productCells = stepMapping.output.product || [];
                this.updateNumberInCells(productCells, value, step);
                break;
                
            case 3: // Update remainder
                const remainderCells = stepMapping.output.remainder || [];
                this.updateNumberInCells(remainderCells, value, step);
                break;
        }
    }
    
    prepareNextStep(nextStep) {
        switch(nextStep) {
            case 2:
                // Bring down the digit from r3c5 (tens) to r6c5
                const broughtDownDigit2 = document.getElementById('r3c5').textContent;
                const bringDownCell2 = document.getElementById('r6c5');
                if (bringDownCell2 && broughtDownDigit2 && broughtDownDigit2 !== '') {
                    // Get the remainder from step 1
                    const step1Remainder = document.getElementById('r6c4').textContent;
                    
                    // Combine remainder from step 1 with brought down digit
                    // This should form the partial dividend for step 2
                    if (step1Remainder !== '' && step1Remainder !== '0') {
                        // Show the partial dividend in r6c4 and r6c5
                        const r6c4 = document.getElementById('r6c4');
                        if (r6c4) {
                            // Keep the remainder from step 1
                            bringDownCell2.textContent = broughtDownDigit2;
                            bringDownCell2.classList.add('filled');
                            
                            // Ensure r6c4 still shows the remainder
                            if (!r6c4.textContent || r6c4.textContent === '') {
                                r6c4.textContent = step1Remainder;
                                r6c4.classList.add('filled');
                            }
                        }
                    } else {
                        // If remainder was 0, just show the brought down digit
                        bringDownCell2.textContent = broughtDownDigit2;
                        bringDownCell2.classList.add('filled');
                    }
                }
                break;
                
            case 3:
                // Bring down the digit from r3c6 (ones) to r9c6
                const broughtDownDigit3 = document.getElementById('r3c6').textContent;
                const bringDownCell3 = document.getElementById('r9c6');
                if (bringDownCell3 && broughtDownDigit3 && broughtDownDigit3 !== '') {
                    // Get the remainder from step 2
                    const step2RemainderTens = document.getElementById('r9c4').textContent;
                    const step2RemainderOnes = document.getElementById('r9c5').textContent;
                    
                    // Show the partial dividend for step 3
                    if (step2RemainderTens !== '' || step2RemainderOnes !== '') {
                        // Bring down the digit to complete the partial dividend
                        bringDownCell3.textContent = broughtDownDigit3;
                        bringDownCell3.classList.add('filled');
                        
                        // Ensure remainder from step 2 is still visible
                        const r9c4 = document.getElementById('r9c4');
                        const r9c5 = document.getElementById('r9c5');
                        
                        if (r9c4 && (!r9c4.textContent || r9c4.textContent === '')) {
                            r9c4.textContent = step2RemainderTens || '0';
                            r9c4.classList.add('filled');
                        }
                        if (r9c5 && (!r9c5.textContent || r9c5.textContent === '')) {
                            r9c5.textContent = step2RemainderOnes || '0';
                            r9c5.classList.add('filled');
                        }
                    } else {
                        // Just bring down the digit
                        bringDownCell3.textContent = broughtDownDigit3;
                        bringDownCell3.classList.add('filled');
                    }
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
                
            // In the updateGridForStep method, update the Step 3 case:
            case 3:
                // Step 3: Columns 4-6 (3-digit area for larger products)
                
                // Note: The digit was already "brought down" by prepareNextStep()
                // The partial dividend "507" is now visible in r9c4,r9c5,r9c6
                
                // For larger products (like 435), we need 3 columns
                const productStr3 = String(product);
                const remainderStr3 = String(remainder).padStart(3, '0'); // For 3-digit remainder
                
                console.log(`Step 3: product=${product}, productStr=${productStr3}, length=${productStr3.length}`);
                
                // Clear all product cells first
                ['r10c4', 'r10c5', 'r10c6'].forEach(cellId => {
                    const cell = document.getElementById(cellId);
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    }
                });
                
                // Place product digits RIGHT-ALIGNED in columns 4-6
                // For 435: "4" in r10c4, "3" in r10c5, "5" in r10c6
                for (let i = 0; i < productStr3.length; i++) {
                    const digit = productStr3[productStr3.length - 1 - i]; // Start from rightmost digit
                    const col = 6 - i; // Place right-to-left in columns 4-6
                    
                    if (col >= 4) {
                        const cellId = `r10c${col}`;
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.textContent = digit;
                            cell.classList.add('filled');
                        }
                    }
                }
                
                // Clear all remainder cells first
                ['r12c4', 'r12c5', 'r12c6'].forEach(cellId => {
                    const cell = document.getElementById(cellId);
                    if (cell) {
                        cell.textContent = '';
                        cell.classList.remove('filled');
                    }
                });
                
                // Place remainder digits RIGHT-ALIGNED in columns 4-6
                // For 72: "0" in r12c4, "7" in r12c5, "2" in r12c6
                for (let i = 0; i < remainderStr3.length; i++) {
                    const digit = remainderStr3[remainderStr3.length - 1 - i];
                    const col = 6 - i;
                    
                    if (col >= 4) {
                        const cellId = `r12c${col}`;
                        const cell = document.getElementById(cellId);
                        if (cell) {
                            cell.textContent = digit;
                            cell.classList.add('filled');
                        }
                    }
                }
                
                // Final remainder in answer area
                const finalRemainder = this.stepTracker.get('remainder');
                console.log(`Final remainder: ${finalRemainder}`);
                
                if (finalRemainder > 0) {
                    const finalRemainderStr = String(finalRemainder).padStart(2, '0'); // "72"
                    
                    // Update the remainder cells in the answer area
                    const r1c8 = document.getElementById('r1c8');
                    const r1c9 = document.getElementById('r1c9');
                    
                    if (r1c8 && r1c9) {
                        r1c8.textContent = finalRemainderStr[0]; // "7"
                        r1c8.classList.add('filled');
                        r1c9.textContent = finalRemainderStr[1]; // "2"
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
    
    updateNumberInCells(cellIds, number, stepNumber = 1) {
        const numStr = String(number);
        
        // Clear the cells first
        cellIds.forEach(cellId => {
            const cell = document.getElementById(cellId);
            if (cell) {
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        });
        
        // Place digits right-aligned
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
        
        // Fill empty cells with '0' if needed for multi-digit numbers
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
        
        // Get all non-transparent cells
        const allCells = document.querySelectorAll('.division-table:not(.transparent)');
        
        allCells.forEach(cell => {
            const id = cell.id;
            
            // Skip the "R" cell - it should always show "R"
            if (id === 'r1c7') {
                // Keep the "R" text and don't remove any classes
                return;
            }
            
            // Clear content from ALL other cells
            cell.textContent = '';
            
            // ONLY remove dynamic classes - never remove color classes!
            cell.classList.remove('filled', 'highlighted', 'brought-down');
            
            // DO NOT remove: green, yellow, brown, orange, blue, answer, remainder, etc.
            // These are static and should stay!
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
