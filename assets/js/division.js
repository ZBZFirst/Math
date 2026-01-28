// division.js - DEBUGGING VERSION WITH CELL TRACKING

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element not found: ${id}`);
  }
  return el;
}

function setCell(id, value) {
  const el = $(id);
  if (!el) return;
  
  const oldValue = el.textContent;
  
  if (value === '' || value === undefined || value === null) {
    el.textContent = '';
    el.classList.add('transparent');
  } else {
    el.textContent = value;
    el.classList.remove('transparent');
  }
  
  // Log the change
  if (oldValue !== String(value)) {
    console.log(`CELL UPDATE: ${id} = "${value}" (was: "${oldValue}")`);
    console.log(`  Cell classes: ${el.className}`);
    
    // Highlight the cell temporarily
    el.style.outline = '2px solid red';
    setTimeout(() => el.style.outline = '', 1000);
  }
}

// Track all cell updates
const cellUpdateLog = [];

// Calculate the COMPLETE division solution upfront
function calculateCompleteSolution() {
  const steps = [];
  let carry = 0;
  
  console.log("=== CALCULATING COMPLETE SOLUTION ===");
  console.log(`Problem: ${PROBLEM.dividendDigits.join('')} ÷ ${PROBLEM.divisor}`);
  
  PROBLEM.dividendDigits.forEach((digit, i) => {
    const bringDownValue = carry * 10 + digit;
    const quotientDigit = Math.floor(bringDownValue / PROBLEM.divisor);
    const multiplyValue = quotientDigit * PROBLEM.divisor;
    const subtractResult = bringDownValue - multiplyValue;
    
    console.log(`Step ${i}: ${carry}${digit} ÷ ${PROBLEM.divisor}`);
    console.log(`  Bring down: ${bringDownValue}`);
    console.log(`  Quotient digit: ${quotientDigit}`);
    console.log(`  Multiply: ${quotientDigit} × ${PROBLEM.divisor} = ${multiplyValue}`);
    console.log(`  Subtract: ${bringDownValue} - ${multiplyValue} = ${subtractResult}`);
    console.log(`  Carry to next step: ${subtractResult}`);
    
    // Map cells for this step
    const stepCells = {
      stepIndex: i,
      digit: digit,
      bringDownValue: bringDownValue,
      
      // CORRECT ANSWERS
      correctAnswer: quotientDigit,
      correctMultiply: multiplyValue,
      correctSubtract: subtractResult,
      
      // User's guesses
      userGuess: null,
      userMultiply: null,
      userSubtract: null,
      
      // CELL MAPPINGS (DEBUG THESE!)
      cells: {
        // QUOTIENT CELL (green answer cells in row 1)
        quotient: `r1c${4 + i}`,  // r1c4, r1c5, r1c6
        
        // MULTIPLICATION CELLS (yellow cells)
        multiply: {
          hundreds: `r${4 + i * 3}c4`,  // r4c4, r7c4, r10c4
          tens: `r${4 + i * 3}c5`,      // r4c5, r7c5, r10c5
          ones: `r${4 + i * 3}c6`       // r4c6, r7c6, r10c6
        },
        
        // HORIZONTAL LINES
        lines: {
          left: `r${5 + i * 3}c4`,      // r5c4, r8c4, r11c4
          middle: `r${5 + i * 3}c5`,    // r5c5, r8c5, r11c5
          right: `r${5 + i * 3}c6`      // r5c6, r8c6, r11c6
        },
        
        // SUBTRACTION CELLS (brown cells)
        subtract: {
          hundreds: `r${6 + i * 3}c4`,  // r6c4, r9c4, r12c4
          tens: `r${6 + i * 3}c5`,      // r6c5, r9c5, r12c5
          ones: `r${6 + i * 3}c6`       // r6c6, r9c6, r12c6
        }
      }
    };
    
    console.log(`  Cell mappings for step ${i}:`);
    console.log(`    Quotient: ${stepCells.cells.quotient}`);
    console.log(`    Multiply: ${stepCells.cells.multiply.hundreds}, ${stepCells.cells.multiply.tens}, ${stepCells.cells.multiply.ones}`);
    console.log(`    Lines: ${stepCells.cells.lines.left}, ${stepCells.cells.lines.middle}, ${stepCells.cells.lines.right}`);
    console.log(`    Subtract: ${stepCells.cells.subtract.hundreds}, ${stepCells.cells.subtract.tens}, ${stepCells.cells.subtract.ones}`);
    
    steps.push(stepCells);
    carry = subtractResult;
  });
  
  // Calculate final answer and remainder
  const finalAnswer = steps.map(s => s.correctAnswer).join('');
  const remainder = carry;
  
  console.log(`=== FINAL ANSWER: ${finalAnswer} R${remainder} ===`);
  
  return {
    steps: steps,
    finalAnswer: finalAnswer,
    remainder: remainder
  };
}

const PROBLEM = {
  dividendDigits: [1, 2, 3],
  divisor: 5
};

const SOLUTION = calculateCompleteSolution();

const STATE = {
  divisor: PROBLEM.divisor,
  steps: SOLUTION.steps,
  currentStepIndex: 0,
  currentPhase: 'DIVIDE',
  isWaitingForUserInput: true,
  isComplete: false
};

function initializeGrid() {
  console.log("=== INITIALIZING GRID ===");
  
  // Initialize main equation
  const dividendElements = [
    document.querySelector('.mainEquation.dividend.hundreds'),
    document.querySelector('.mainEquation.dividend.tens'),
    document.querySelector('.mainEquation.dividend.ones')
  ];
  
  dividendElements.forEach((el, i) => {
    if (el && PROBLEM.dividendDigits[i] !== undefined) {
      el.textContent = PROBLEM.dividendDigits[i];
    }
  });
  
  const divisorOnes = document.querySelector('.mainEquation.divisor.ones');
  if (divisorOnes) divisorOnes.textContent = PROBLEM.divisor;
  
  // Initialize division table
  const tableDividendElements = [
    document.querySelector('.division-table.dividend.hundreds'),
    document.querySelector('.division-table.dividend.tens'),
    document.querySelector('.division-table.dividend.ones')
  ];
  
  tableDividendElements.forEach((el, i) => {
    if (el && PROBLEM.dividendDigits[i] !== undefined) {
      el.textContent = PROBLEM.dividendDigits[i];
      el.classList.remove('transparent');
    }
  });
  
  const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
  if (tableDivisorOnes) {
    tableDivisorOnes.textContent = PROBLEM.divisor;
    tableDivisorOnes.classList.remove('transparent');
  }
  
  // Clear ALL work cells
  console.log("Clearing all work cells...");
  
  // Clear quotient cells (row 1)
  for (let i = 4; i <= 6; i++) {
    setCell(`r1c${i}`, '');
  }
  
  // Clear all step cells
  for (let step = 0; step < 3; step++) {
    const stepData = {
      cells: {
        multiply: {
          hundreds: `r${4 + step * 3}c4`,
          tens: `r${4 + step * 3}c5`,
          ones: `r${4 + step * 3}c6`
        },
        lines: {
          left: `r${5 + step * 3}c4`,
          middle: `r${5 + step * 3}c5`,
          right: `r${5 + step * 3}c6`
        },
        subtract: {
          hundreds: `r${6 + step * 3}c4`,
          tens: `r${6 + step * 3}c5`,
          ones: `r${6 + step * 3}c6`
        }
      }
    };
    
    // Clear multiplication cells
    Object.values(stepData.cells.multiply).forEach(id => setCell(id, ''));
    
    // Clear subtraction cells
    Object.values(stepData.cells.subtract).forEach(id => setCell(id, ''));
    
    // Hide lines
    Object.values(stepData.cells.lines).forEach(id => {
      const el = $(id);
      if (el) el.classList.add('transparent');
    });
  }
  
  console.log("Grid initialization complete");
}

function updateCurrentStepDisplay() {
  const currentStep = STATE.steps[STATE.currentStepIndex];
  const currentStepContainer = document.querySelector('.current-step-container');
  const workFeedback = document.getElementById('workFeedback');
  const currentGuessDisplay = document.getElementById('currentGuessDisplay');
  const currentInstruction = document.getElementById('currentInstruction');
  
  if (STATE.isComplete) {
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
    return;
  }
  
  if (STATE.isWaitingForUserInput) {
    if (currentStepContainer) currentStepContainer.classList.remove('hidden');
    if (workFeedback) workFeedback.classList.remove('hidden');
    if (currentGuessDisplay) currentGuessDisplay.textContent = '0';
    
    if (currentStep && currentInstruction) {
      if (STATE.currentStepIndex === 0) {
        currentInstruction.textContent = `How many times does ${STATE.divisor} go into ${currentStep.bringDownValue}?`;
      } else {
        const previousStep = STATE.steps[STATE.currentStepIndex - 1];
        currentInstruction.textContent = `Bring down: ${previousStep.correctSubtract}${currentStep.digit} ÷ ${STATE.divisor} = ?`;
      }
    }
    
    console.log(`=== STEP ${STATE.currentStepIndex + 1}/3 ===`);
    console.log(`Question: ${currentStep.bringDownValue} ÷ ${STATE.divisor} = ?`);
    console.log(`Correct answer: ${currentStep.correctAnswer}`);
    console.log(`Target quotient cell: ${currentStep.cells.quotient}`);
  } else {
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
  }
}

function renderCurrentPhase() {
  if (STATE.isComplete) return;
  
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) {
    console.error("No current step to render!");
    return;
  }
  
  console.log(`=== RENDERING ${STATE.currentPhase} PHASE ===`);
  console.log(`Step: ${STATE.currentStepIndex}, User guess: ${currentStep.userGuess}`);
  
  switch (STATE.currentPhase) {
    case 'DIVIDE':
      if (currentStep.userGuess !== null) {
        console.log(`Setting quotient cell ${currentStep.cells.quotient} to ${currentStep.userGuess}`);
        setCell(currentStep.cells.quotient, currentStep.userGuess);
      }
      break;
      
    case 'MULTIPLY':
      if (currentStep.userGuess !== null) {
        const multiplyValue = currentStep.userGuess * STATE.divisor;
        const multiplyDigits = multiplyValue.toString().padStart(3, '0').split('');
        
        console.log(`Multiplication: ${currentStep.userGuess} × ${STATE.divisor} = ${multiplyValue}`);
        console.log(`Digits: ${multiplyDigits}`);
        console.log(`Target cells: ${currentStep.cells.multiply.hundreds}, ${currentStep.cells.multiply.tens}, ${currentStep.cells.multiply.ones}`);
        
        setCell(currentStep.cells.multiply.hundreds, multiplyDigits[0]);
        setCell(currentStep.cells.multiply.tens, multiplyDigits[1]);
        setCell(currentStep.cells.multiply.ones, multiplyDigits[2]);
        
        // Show lines
        Object.values(currentStep.cells.lines).forEach(id => {
          const el = $(id);
          if (el) {
            el.classList.remove('transparent');
            console.log(`Showing line: ${id}`);
          }
        });
      }
      break;
      
    case 'SUBTRACT':
      if (currentStep.userGuess !== null) {
        const subtractResult = currentStep.bringDownValue - (currentStep.userGuess * STATE.divisor);
        const subtractDigits = subtractResult.toString().padStart(3, ' ').split('');
        
        console.log(`Subtraction: ${currentStep.bringDownValue} - ${currentStep.userGuess * STATE.divisor} = ${subtractResult}`);
        console.log(`Digits: ${subtractDigits}`);
        console.log(`Target cells: ${currentStep.cells.subtract.hundreds}, ${currentStep.cells.subtract.tens}, ${currentStep.cells.subtract.ones}`);
        
        setCell(currentStep.cells.subtract.hundreds, subtractDigits[0]);
        setCell(currentStep.cells.subtract.tens, subtractDigits[1]);
        setCell(currentStep.cells.subtract.ones, subtractDigits[2]);
      }
      break;
      
    case 'BRING_DOWN':
      console.log("BRING_DOWN phase - nothing to render");
      break;
  }
}

function advancePhase() {
  if (STATE.isComplete) return;
  
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) {
    console.error("No current step!");
    return;
  }
  
  console.log(`=== ADVANCING PHASE: ${STATE.currentPhase} -> ${STATE.currentPhase === 'DIVIDE' ? 'MULTIPLY' : 
                    STATE.currentPhase === 'MULTIPLY' ? 'SUBTRACT' :
                    STATE.currentPhase === 'SUBTRACT' ? (STATE.currentStepIndex < 2 ? 'BRING_DOWN' : 'COMPLETE') : 'DIVIDE'} ===`);
  
  if (STATE.currentPhase === 'DIVIDE') {
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    const userGuess = currentGuessDisplay ? parseInt(currentGuessDisplay.textContent) : 0;
    
    currentStep.userGuess = userGuess;
    
    console.log(`User guess recorded: ${userGuess}`);
    console.log(`Correct answer: ${currentStep.correctAnswer}`);
    console.log(userGuess === currentStep.correctAnswer ? "✓ Correct!" : "✗ Incorrect");
    
    STATE.currentPhase = 'MULTIPLY';
    STATE.isWaitingForUserInput = false;
    
  } else if (STATE.currentPhase === 'MULTIPLY') {
    STATE.currentPhase = 'SUBTRACT';
    
  } else if (STATE.currentPhase === 'SUBTRACT') {
    if (STATE.currentStepIndex < STATE.steps.length - 1) {
      STATE.currentPhase = 'BRING_DOWN';
      console.log(`Moving to BRING_DOWN, next step will be ${STATE.currentStepIndex + 1}`);
    } else {
      console.log("Last step complete - finishing division");
      completeDivision();
      return;
    }
    
  } else if (STATE.currentPhase === 'BRING_DOWN') {
    STATE.currentStepIndex++;
    STATE.currentPhase = 'DIVIDE';
    STATE.isWaitingForUserInput = true;
    console.log(`Moved to step ${STATE.currentStepIndex + 1}`);
  }
  
  renderCurrentPhase();
  updateCurrentStepDisplay();
}

function completeDivision() {
  console.log("=== DIVISION COMPLETE ===");
  
  STATE.isComplete = true;
  
  // Show final answer in main equation
  const answerElements = [
    document.querySelector('.mainEquation.answer.hundreds'),
    document.querySelector('.mainEquation.answer.tens'),
    document.querySelector('.mainEquation.answer.ones')
  ];
  
  const answerDigits = SOLUTION.finalAnswer.split('');
  
  answerElements.forEach((el, i) => {
    if (el && i < answerDigits.length) {
      el.textContent = answerDigits[i];
      console.log(`Set main equation answer digit ${i} to ${answerDigits[i]}`);
    }
  });
  
  // Show remainder if needed
  if (SOLUTION.remainder > 0) {
    const remainderDigits = SOLUTION.remainder.toString().padStart(2, '0').split('');
    
    document.querySelector('.mainEquation.remainder.R')?.classList.remove('hidden');
    
    const remainderTens = document.querySelector('.mainEquation.remainder.tens');
    const remainderOnes = document.querySelector('.mainEquation.remainder.ones');
    
    if (remainderTens) {
      remainderTens.textContent = remainderDigits[0];
      remainderTens.classList.remove('hidden');
      console.log(`Set remainder tens to ${remainderDigits[0]}`);
    }
    if (remainderOnes) {
      remainderOnes.textContent = remainderDigits[1];
      remainderOnes.classList.remove('hidden');
      console.log(`Set remainder ones to ${remainderDigits[1]}`);
    }
  }
  
  // Hide controls
  updateCurrentStepDisplay();
  
  console.log(`Final answer displayed: ${SOLUTION.finalAnswer} R${SOLUTION.remainder}`);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  console.log("=== DIVISION PRACTICE INITIALIZING ===");
  console.log("Problem: 123 ÷ 5");
  console.log("Expected quotient: 24");
  console.log("Expected remainder: 3");
  console.log("Step 1: 1 ÷ 5 = 0, 0 × 5 = 0, 1 - 0 = 1");
  console.log("Step 2: 12 ÷ 5 = 2, 2 × 5 = 10, 12 - 10 = 2");
  console.log("Step 3: 23 ÷ 5 = 4, 4 × 5 = 20, 23 - 20 = 3");
  
  // Initialize the grid
  initializeGrid();
  
  // Set up initial UI
  updateCurrentStepDisplay();
  
  // Set up commit button
  const commitBtn = document.getElementById('commitGuessBtn');
  if (commitBtn) {
    commitBtn.addEventListener('click', function() {
      console.log("--- COMMIT BUTTON CLICKED ---");
      advancePhase();
    });
  }
  
  // Set up control buttons
  const controlButtons = document.querySelectorAll('.grid-btn');
  controlButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const currentGuessDisplay = document.getElementById('currentGuessDisplay');
      if (!currentGuessDisplay) return;
      
      let current = parseInt(currentGuessDisplay.textContent) || 0;
      const oldValue = current;
      
      if (this.classList.contains('clear')) {
        current = 0;
      } else if (this.classList.contains('increment')) {
        if (this.classList.contains('one')) current += 1;
        if (this.classList.contains('five')) current += 5;
      } else if (this.classList.contains('decrement')) {
        if (this.classList.contains('one')) current = Math.max(0, current - 1);
        if (this.classList.contains('five')) current = Math.max(0, current - 5);
      }
      
      if (current !== oldValue) {
        console.log(`Guess changed: ${oldValue} -> ${current}`);
      }
      
      currentGuessDisplay.textContent = current;
    });
  });
  
  // Keyboard support
  document.addEventListener('keydown', function(e) {
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    if (!currentGuessDisplay) return;
    
    let current = parseInt(currentGuessDisplay.textContent) || 0;
    const oldValue = current;
    
    if (e.key === 'ArrowUp') {
      current += 1;
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      current = Math.max(0, current - 1);
      e.preventDefault();
    } else if (e.key === 'Enter' && commitBtn) {
      console.log("--- ENTER KEY PRESSED ---");
      commitBtn.click();
      e.preventDefault();
    }
    
    if (current !== oldValue) {
      console.log(`Guess changed via keyboard: ${oldValue} -> ${current}`);
      currentGuessDisplay.textContent = current;
    }
  });
  
  console.log("=== READY FOR USER INPUT ===");
});
