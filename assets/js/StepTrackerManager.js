// StepTrackerManager.js - Complete Implementation
export class StepTrackerManager {
    constructor() {
        this.element = document.querySelector('.step-tracker');
        if (!this.element) {
            console.error('Step tracker element not found!');
            return;
        }
        this.cache = {};
        this.isSetting = false; // ADD THIS FLAG
        this.initializeDefaultData();
    }
    
    
    // ========== CORE GETTER/SETTER ==========
    
    get(attr) {
        if (this.cache[attr] === undefined) {
            const value = this.element.getAttribute(`data-${attr}`);
            if (value && (value.startsWith('{') || value.startsWith('['))) {
                try {
                    this.cache[attr] = JSON.parse(value);
                } catch (e) {
                    console.warn(`Failed to parse JSON for ${attr}:`, e);
                    this.cache[attr] = value;
                }
            } else {
                this.cache[attr] = value;
            }
        }
        return this.cache[attr];
    }
    
    set(attr, value, silent = false) { // ADD 'silent' PARAMETER
        // Prevent infinite recursion
        if (this.isSetting) {
            console.warn(`Prevented recursive set for ${attr}`);
            return this;
        }
        
        this.isSetting = true;
        
        try {
            let stringValue;
            if (typeof value === 'object' || Array.isArray(value)) {
                stringValue = JSON.stringify(value);
            } else {
                stringValue = String(value);
            }
            
            this.element.setAttribute(`data-${attr}`, stringValue);
            this.cache[attr] = value;
            
            // Only dispatch event if not silent
            if (!silent) {
                document.dispatchEvent(new CustomEvent('step-tracker-updated', {
                    detail: { attribute: attr, value: value }
                }));
            }
        } finally {
            this.isSetting = false;
        }
        
        return this;
    }
    
    // ========== PROBLEM MANAGEMENT ==========
    
    setProblem(dividend, divisor) {
        // Calculate basic results
        const quotient = Math.floor(dividend / divisor);
        const remainder = dividend % divisor;
        const problemId = `div-${dividend}-${divisor}-${Date.now()}`;
        
        // Set basic problem data
        this.set('problem-id', problemId);
        this.set('dividend', dividend);
        this.set('divisor', divisor);
        this.set('quotient', quotient);
        this.set('remainder', remainder);
        this.set('needs-remainder', remainder > 0);
        this.set('problem-completed', false);
        
        // Initialize all data structures
        this.initializeDigitPositions(dividend, divisor, quotient, remainder);
        this.initializeStepAnswers(dividend, divisor, quotient, remainder);
        this.initializeGridMappings();
        this.initializeUserProgress();
        
        // Reset current state
        this.setCurrentStep(1);
        this.setCurrentGuess(0);
        this.set('is-correct', false);
        
        // Dispatch new problem event
        document.dispatchEvent(new CustomEvent('new-problem-set', {
            detail: { 
                dividend, 
                divisor, 
                quotient, 
                remainder,
                problemId 
            }
        }));
        
        return this;
    }
    
    initializeDigitPositions(dividend, divisor, quotient, remainder) {
        const dividendStr = String(dividend).padStart(3, '0');
        const divisorStr = String(divisor).padStart(2, '0');
        const quotientStr = String(quotient).padStart(3, '0');
        const remainderStr = String(remainder).padStart(2, '0');
        
        const positions = {
            dividend: {
                hundreds: dividendStr[0] === '0' ? null : parseInt(dividendStr[0]),
                tens: dividendStr[1] === '0' ? null : parseInt(dividendStr[1]),
                ones: parseInt(dividendStr[2]),
                string: dividendStr
            },
            divisor: {
                tens: divisorStr[0] === '0' ? null : parseInt(divisorStr[0]),
                ones: parseInt(divisorStr[1]),
                string: divisorStr
            },
            quotient: {
                hundreds: quotientStr[0] === '0' ? null : parseInt(quotientStr[0]),
                tens: quotientStr[1] === '0' ? null : parseInt(quotientStr[1]),
                ones: parseInt(quotientStr[2]),
                string: quotientStr
            },
            remainder: {
                tens: remainderStr[0] === '0' ? null : parseInt(remainderStr[0]),
                ones: parseInt(remainderStr[1]),
                string: remainderStr
            }
        };
        
        this.set('digit-positions', positions);
        return positions;
    }
    
    initializeStepAnswers(dividend, divisor, quotient, remainder) {
        const dividendStr = String(dividend);
        const divisorNum = divisor;
        const quotientStr = String(quotient).padStart(3, '0');
        
        // Calculate step-by-step answers for 3-digit long division
        const steps = {};
        
        // Step 1: First digit only (hundreds place)
        const step1Partial = parseInt(dividendStr[0]); // Just the first digit
        const step1Guess = Math.floor(step1Partial / divisorNum);
        const step1Product = step1Guess * divisorNum;
        const step1Remainder = step1Partial - step1Product;
        
        steps.step1 = {
            partialDividend: step1Partial,
            expectedGuess: step1Guess,
            expectedProduct: step1Product,
            expectedRemainder: step1Remainder,
            answerDigit: parseInt(quotientStr[0]) || 0,
            userGuess: 0,
            userProduct: 0,
            userRemainder: 0,
            description: `Divide ${step1Partial} by ${divisorNum}`,
            isCorrect: false,
            completed: false
        };
        
        // Step 2: Bring down tens digit
        let step2Partial;
        if (dividendStr.length >= 2) {
            step2Partial = parseInt(step1Remainder.toString() + dividendStr[1]);
        } else {
            step2Partial = step1Remainder;
        }
        
        const step2Guess = Math.floor(step2Partial / divisorNum);
        const step2Product = step2Guess * divisorNum;
        const step2Remainder = step2Partial - step2Product;
        
        steps.step2 = {
            partialDividend: step2Partial,
            expectedGuess: step2Guess,
            expectedProduct: step2Product,
            expectedRemainder: step2Remainder,
            answerDigit: parseInt(quotientStr[1]) || 0,
            userGuess: 0,
            userProduct: 0,
            userRemainder: 0,
            description: `Bring down next digit: ${step2Partial} ÷ ${divisorNum}`,
            isCorrect: false,
            completed: false
        };
        
        // Step 3: Bring down ones digit
        let step3Partial;
        if (dividendStr.length >= 3) {
            step3Partial = parseInt(step2Remainder.toString() + dividendStr[2]);
        } else {
            step3Partial = step2Remainder;
        }
        
        const step3Guess = Math.floor(step3Partial / divisorNum);
        const step3Product = step3Guess * divisorNum;
        const step3Remainder = step3Partial - step3Product;
        
        steps.step3 = {
            partialDividend: step3Partial,
            expectedGuess: step3Guess,
            expectedProduct: step3Product,
            expectedRemainder: remainder, // Final remainder
            answerDigit: parseInt(quotientStr[2]) || 0,
            userGuess: 0,
            userProduct: 0,
            userRemainder: 0,
            description: `Final step: ${step3Partial} ÷ ${divisorNum}`,
            isCorrect: false,
            completed: false,
            isFinalStep: true
        };
        
        // Verify calculations match overall result
        if (step3Remainder !== remainder) {
            console.warn('Step calculations dont match final remainder:', { step3Remainder, remainder });
        }
        
        this.set('step-answers', steps);
        return steps;
    }
    
    initializeGridMappings() {
        // Use the mappings from your HTML
        const mappings = {
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
        
        this.set('grid-mappings', mappings);
        return mappings;
    }
    
    initializeUserProgress() {
        const progress = {
            mistakes: 0,
            hintsUsed: 0,
            timeStarted: new Date().toISOString(),
            lastAction: "problem_started",
            step1: { 
                attempts: 0, 
                completed: false, 
                timeStarted: null,
                timeSpent: 0 
            },
            step2: { 
                attempts: 0, 
                completed: false, 
                timeStarted: null,
                timeSpent: 0 
            },
            step3: { 
                attempts: 0, 
                completed: false, 
                timeStarted: null,
                timeSpent: 0 
            },
            totalTimeSpent: 0
        };
        
        this.set('user-progress', progress);
        return progress;
    }
    
    // ========== STEP MANAGEMENT ==========
    
    getCurrentStep() {
        return parseInt(this.get('current-step')) || 0;
    }
    
    setCurrentStep(step) {
        const oldStep = this.getCurrentStep();
        const totalSteps = parseInt(this.get('total-steps')) || 3;
        
        // Validate step
        if (step < 0 || step > totalSteps) {
            console.warn(`Invalid step: ${step}. Must be between 0 and ${totalSteps}`);
            return this;
        }
        
        // Update progress timing for old step
        if (oldStep > 0 && oldStep <= totalSteps) {
            this.endStepTiming(oldStep);
        }
        
        // Set new step
        this.set('current-step', step);
        this.resetPhase(); // ← ADD THIS
        // Start timing for new step
        if (step > 0 && step <= totalSteps) {
            this.startStepTiming(step);
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('step-changed', {
            detail: { 
                oldStep, 
                newStep: step,
                totalSteps 
            }
        }));
        
        return this;
    }
    
    startStepTiming(step) {
        const progress = this.get('user-progress');
        if (progress && progress[`step${step}`]) {
            progress[`step${step}`].timeStarted = new Date().toISOString();
            this.set('user-progress', progress);
        }
    }
    
    endStepTiming(step) {
        const progress = this.get('user-progress');
        if (progress && progress[`step${step}`] && progress[`step${step}`].timeStarted) {
            const startTime = new Date(progress[`step${step}`].timeStarted);
            const endTime = new Date();
            const timeSpent = (endTime - startTime) / 1000; // in seconds
            
            progress[`step${step}`].timeSpent += timeSpent;
            progress.totalTimeSpent += timeSpent;
            progress[`step${step}`].timeStarted = null;
            
            this.set('user-progress', progress);
        }
    }
    
    // ========== GUESS MANAGEMENT ==========
    
    setCurrentGuess(guess, silent = false) { // ADD silent PARAMETER
        const numericGuess = parseInt(guess) || 0;
        
        // Use silent mode to prevent event dispatch
        this.set('current-guess', numericGuess, silent);
        
        // Update progress attempts (but don't trigger events)
        const currentStep = this.getCurrentStep();
        if (currentStep > 0) {
            const progress = this.get('user-progress');
            if (progress && progress[`step${currentStep}`]) {
                progress[`step${currentStep}`].attempts++;
                progress.lastAction = `guess_made_step${currentStep}`;
                this.set('user-progress', progress, true); // SILENT!
            }
        }
        
        return this;
    }
    
    getCurrentGuess() {
        return parseInt(this.get('current-guess')) || 0;
    }
    
    checkGuess(guess = null) {
        const guessToCheck = guess !== null ? parseInt(guess) : this.getCurrentGuess();
        const currentStep = this.getCurrentStep();
        const currentPhase = this.getCurrentPhase();
        const stepAnswers = this.get('step-answers');
    
        if (!stepAnswers || !stepAnswers[`step${currentStep}`]) {
            console.warn(`No step answers found for step ${currentStep}`);
            return false;
        }
    
        const stepData = stepAnswers[`step${currentStep}`];
        let isCorrect = false;
    
        // 🔀 PHASE-AWARE VALIDATION
        if (currentPhase === 1) {
            isCorrect = guessToCheck === stepData.expectedGuess;
            if (isCorrect) stepData.userGuess = guessToCheck;
        }
    
        if (currentPhase === 2) {
            isCorrect = guessToCheck === stepData.expectedProduct;
            if (isCorrect) stepData.userProduct = guessToCheck;
        }
    
        if (currentPhase === 3) {
            isCorrect = guessToCheck === stepData.expectedRemainder;
            if (isCorrect) stepData.userRemainder = guessToCheck;
        }
    
        // Update progress
        const progress = this.get('user-progress');
        if (progress && progress[`step${currentStep}`]) {
            if (!isCorrect) progress.mistakes++;
            progress.lastAction = `guess_checked_step${currentStep}_phase${currentPhase}`;
            this.set('user-progress', progress);
        }
    
        this.set('step-answers', stepAnswers);
    
        document.dispatchEvent(new CustomEvent('guess-checked', {
            detail: {
                step: currentStep,
                phase: currentPhase,
                guess: guessToCheck,
                isCorrect,
                expected:
                    currentPhase === 1 ? stepData.expectedGuess :
                    currentPhase === 2 ? stepData.expectedProduct :
                    stepData.expectedRemainder
            }
        }));
    
        // ⏭ ADVANCE PHASE OR COMPLETE STEP
        if (isCorrect) {
            if (currentPhase < 3) {
                this.nextPhase();
            } else {
                this.completeStep({
                    guess: stepData.userGuess,
                    product: stepData.userProduct,
                    remainder: stepData.userRemainder
                });
            }
        }
    
        return isCorrect;
    }


    getCurrentPhase() {
        return parseInt(this.get('current-phase')) || 1;
    }
    
    setCurrentPhase(phase, silent = false) {
        const total = parseInt(this.get('total-phases')) || 3;
    
        if (phase < 1 || phase > total) {
            console.warn(`Invalid phase ${phase}`);
            return this;
        }
    
        this.set('current-phase', phase, silent);
    
        document.dispatchEvent(new CustomEvent('phase-changed', {
            detail: {
                step: this.getCurrentStep(),
                phase
            }
        }));
    
        return this;
    }
    
    resetPhase() {
        return this.setCurrentPhase(1);
    }
    
    nextPhase() {
        return this.setCurrentPhase(this.getCurrentPhase() + 1);
    }

    
    // ========== STEP COMPLETION ==========
    
    completeStep(userData = {}) {
        const currentStep = this.getCurrentStep();
        const stepAnswers = this.get('step-answers');
    
        if (!stepAnswers || !stepAnswers[`step${currentStep}`]) {
            console.warn(`Cannot complete step ${currentStep}: no step data found`);
            return false;
        }
    
        const step = stepAnswers[`step${currentStep}`];
    
        // Pull correctness explicitly
        const isStepCorrect = userData.isCorrect === true;
    
        // Update step with user's actual values
        step.userGuess = userData.guess ?? step.userGuess;
        step.userProduct = userData.product ?? step.userProduct;
        step.userRemainder = userData.remainder ?? step.userRemainder;
        step.completed = true;
        step.completedAt = new Date().toISOString();
        step.isCorrect = isStepCorrect;
    
        if (userData.timeSpent !== undefined) {
            step.timeSpent = userData.timeSpent;
        }
    
        // Save step answers
        stepAnswers[`step${currentStep}`] = step;
        this.set('step-answers', stepAnswers);
    
        // Update progress
        const progress = this.get('user-progress');
        if (progress && progress[`step${currentStep}`]) {
            progress[`step${currentStep}`].completed = true;
            progress[`step${currentStep}`].isCorrect = isStepCorrect;
            progress.lastAction = `step_completed_${currentStep}`;
    
            if (userData.timeSpent !== undefined) {
                progress[`step${currentStep}`].timeSpent = userData.timeSpent;
            }
    
            this.set('user-progress', progress);
        }
    
        // End timing
        this.endStepTiming(currentStep);
    
        const allStepsCompleted = this.areAllStepsCompleted();
    
        // Advance state
        if (currentStep < 3 && !allStepsCompleted) {
            this.setCurrentStep(currentStep + 1);
        } else if (allStepsCompleted) {
            this.completeProblem();
        }
    
        // Dispatch completion event (NOW SAFE)
        document.dispatchEvent(new CustomEvent('step-completed', {
            detail: {
                step: currentStep,
                stepData: step,
                isCorrect: isStepCorrect,
                allStepsCompleted
            }
        }));
    
        return true;
    }

    
    areAllStepsCompleted() {
        const stepAnswers = this.get('step-answers');
        if (!stepAnswers) return false;
        
        return ['step1', 'step2', 'step3'].every(stepKey => 
            stepAnswers[stepKey] && stepAnswers[stepKey].completed === true
        );
    }
    
    completeProblem() {
        const allCorrect = this.areAllStepsCorrect();
        
        this.set('problem-completed', true);
        this.set('is-correct', allCorrect);
        
        // Update progress
        const progress = this.get('user-progress');
        if (progress) {
            progress.lastAction = 'problem_completed';
            progress.completedAt = new Date().toISOString();
            this.set('user-progress', progress);
        }
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('problem-completed', {
            detail: this.getAllData()
        }));
        
        return allCorrect;
    }
    
    areAllStepsCorrect() {
        const stepAnswers = this.get('step-answers');
        if (!stepAnswers) return false;
        
        return ['step1', 'step2', 'step3'].every(stepKey => 
            stepAnswers[stepKey] && stepAnswers[stepKey].isCorrect === true
        );
    }
    
    // ========== RESET METHODS ==========
    
    resetCurrentStep() {
        const currentStep = this.getCurrentStep();
        const stepAnswers = this.get('step-answers');
        
        if (stepAnswers && stepAnswers[`step${currentStep}`]) {
            // Reset user data but keep expected values
            stepAnswers[`step${currentStep}`].userGuess = 0;
            stepAnswers[`step${currentStep}`].userProduct = 0;
            stepAnswers[`step${currentStep}`].userRemainder = 0;
            stepAnswers[`step${currentStep}`].completed = false;
            stepAnswers[`step${currentStep}`].isCorrect = false;
            
            this.set('step-answers', stepAnswers);
        }
        
        // Reset progress for this step
        const progress = this.get('user-progress');
        if (progress && progress[`step${currentStep}`]) {
            progress[`step${currentStep}`] = { 
                attempts: 0, 
                completed: false, 
                timeStarted: null,
                timeSpent: 0 
            };
            this.set('user-progress', progress);
        }
        
        // Reset current guess
        this.setCurrentGuess(0);
        this.resetPhase();
        return this;
    }
    
    resetProblem() {
        // Reset step data (keep expected values)
        const stepAnswers = this.get('step-answers');
        if (stepAnswers) {
            Object.keys(stepAnswers).forEach(stepKey => {
                stepAnswers[stepKey].userGuess = 0;
                stepAnswers[stepKey].userProduct = 0;
                stepAnswers[stepKey].userRemainder = 0;
                stepAnswers[stepKey].completed = false;
                stepAnswers[stepKey].isCorrect = false;
            });
            this.set('step-answers', stepAnswers);
        }
        
        // Reset current state
        this.setCurrentStep(1);
        this.setCurrentGuess(0);
        this.set('is-correct', false);
        this.set('problem-completed', false);
        
        // Reinitialize user progress
        this.initializeUserProgress();
        
        // Dispatch reset event
        document.dispatchEvent(new CustomEvent('problem-reset', {
            detail: this.getAllData()
        }));
        
        this.resetPhase();
        return this;
    }
    
    // ========== HELPER METHODS ==========
    
    getStepData(stepNumber) {
        const stepAnswers = this.get('step-answers');
        return stepAnswers ? stepAnswers[`step${stepNumber}`] : null;
    }
    
    getGridMappingsForStep(stepNumber) {
        const mappings = this.get('grid-mappings');
        return mappings ? mappings[`step${stepNumber}`] : null;
    }
    
    getQuotientCellForStep(stepNumber) {
        const mappings = this.getGridMappingsForStep(stepNumber);
        return mappings && mappings.output ? mappings.output.quotient : null;
    }
    
    getProductCellsForStep(stepNumber) {
        const mappings = this.getGridMappingsForStep(stepNumber);
        return mappings && mappings.output ? mappings.output.product : [];
    }
    
    getRemainderCellsForStep(stepNumber) {
        const mappings = this.getGridMappingsForStep(stepNumber);
        return mappings && mappings.output ? mappings.output.remainder : [];
    }
    
    // ========== DATA EXPORT/DEBUG ==========
    
    getAllData() {
        return {
            problem: {
                id: this.get('problem-id'),
                dividend: this.get('dividend'),
                divisor: this.get('divisor'),
                quotient: this.get('quotient'),
                remainder: this.get('remainder'),
                needsRemainder: this.get('needs-remainder') === 'true'
            },
            state: {
                currentStep: this.getCurrentStep(),
                currentGuess: this.getCurrentGuess(),
                isCorrect: this.get('is-correct') === 'true',
                problemCompleted: this.get('problem-completed') === 'true',
                totalSteps: parseInt(this.get('total-steps')) || 3
            },
            steps: this.get('step-answers'),
            positions: this.get('digit-positions'),
            grid: this.get('grid-mappings'),
            progress: this.get('user-progress'),
            timestamp: new Date().toISOString()
        };
    }
    
    exportForDebug() {
        return JSON.stringify(this.getAllData(), null, 2);
    }
    
    logDebugInfo() {
        console.group('StepTracker Debug Info');
        console.log('Current State:', {
            step: this.getCurrentStep(),
            guess: this.getCurrentGuess(),
            isCorrect: this.get('is-correct'),
            completed: this.get('problem-completed')
        });
        
        const stepData = this.getStepData(this.getCurrentStep());
        if (stepData) {
            console.log(`Current Step (${this.getCurrentStep()}):`, stepData);
        }
        
        console.log('Grid Mappings:', this.get('grid-mappings'));
        console.groupEnd();
    }
    
    // ========== INITIALIZATION ==========
    
    initializeDefaultData() {
        // If no data is set, initialize with defaults from HTML
        if (!this.get('problem-id')) {
            const defaultDividend = 123;
            const defaultDivisor = 5;
            const defaultQuotient = Math.floor(defaultDividend / defaultDivisor);
            const defaultRemainder = defaultDividend % defaultDivisor;
            
            this.set('problem-id', 'default-123div5');
            this.set('dividend', defaultDividend);
            this.set('divisor', defaultDivisor);
            this.set('quotient', defaultQuotient);
            this.set('remainder', defaultRemainder);
            this.set('needs-remainder', defaultRemainder > 0);
            
            this.initializeDigitPositions(defaultDividend, defaultDivisor, defaultQuotient, defaultRemainder);
            this.initializeStepAnswers(defaultDividend, defaultDivisor, defaultQuotient, defaultRemainder);
            this.initializeGridMappings();
            this.initializeUserProgress();
        }
    }
    
    // ========== VALIDATION ==========
    
    validateStepAnswers() {
        const stepAnswers = this.get('step-answers');
        if (!stepAnswers) return false;
        
        // Check that all required steps exist
        const requiredSteps = ['step1', 'step2', 'step3'];
        const hasAllSteps = requiredSteps.every(step => stepAnswers[step]);
        
        if (!hasAllSteps) {
            console.warn('Missing required steps');
            return false;
        }
        
        // Validate step calculations
        const dividend = this.get('dividend');
        const divisor = this.get('divisor');
        
        // Recalculate to verify
        const recalculated = this.initializeStepAnswers(
            dividend, 
            divisor, 
            this.get('quotient'), 
            this.get('remainder')
        );
        
        // Compare with current
        let isValid = true;
        requiredSteps.forEach(step => {
            const current = stepAnswers[step];
            const recalc = recalculated[step];
            
            if (current.expectedGuess !== recalc.expectedGuess ||
                current.expectedProduct !== recalc.expectedProduct ||
                current.expectedRemainder !== recalc.expectedRemainder) {
                console.warn(`Step ${step} validation failed`);
                isValid = false;
            }
        });
        
        return isValid;
    }
}

// Optional: Create a global instance if not using modules
if (typeof window !== 'undefined' && !window.stepTracker) {
    window.stepTracker = new StepTrackerManager();
}
