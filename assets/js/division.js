// division.js - FIXED RENDER SEQUENCE

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
    // DON'T add transparent class to answer or problem cells
    if (!el.classList.contains('answer') && !el.classList.contains('dividend') && !el.classList.contains('divisor')) {
      el.classList.add('transparent');
    }
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
      
      // CELL MAPPINGS
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
  
  // Initialize division table - DON'T clear answer cells!
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
  
  // Initialize answer row cells (quotient digits)
  console.log("Initializing answer row cells...");
  const answerCells = [
    document.getElementById('r1c4'),
    document.getElementById('r1c5'), 
    document.getElementById('r1c6')
  ];
  
  // Set answer cells to "?" initially
  answerCells.forEach(cell => {
    if (cell) {
      cell.textContent = '?';
      cell.classList.remove('transparent');
    }
  });
  
  // Initialize remainder cells
  const remainderCells = [
    document.getElementById('r1c7'),
    document.getElementById('r1c8'),
    document.getElementById('r1c9')
  ];
  
  remainderCells.forEach(cell => {
    if (cell) {
      cell.textContent = '';
      cell.classList.add('transparent');
    }
  });
  
  // Clear ONLY the work area cells (yellow and brown cells)
  console.log("Clearing work area cells (yellow and brown cells)...");
  
  // Clear all step cells (multiplication and subtraction)
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
    
    // Clear multiplication cells (yellow)
    Object.values(stepData.cells.multiply).forEach(id => {
      const el = $(id);
      if (el) {
        el.textContent = '';
        el.classList.add('transparent');
      }
    });
    
    // Clear subtraction cells (brown)
    Object.values(stepData.cells.subtract).forEach(id => {
      const el = $(id);
      if (el) {
        el.textContent = '';
        el.classList.add('transparent');
      }
    });
    
    // Hide lines
    Object.values(stepData.cells.lines).forEach(id => {
      const el = $(id);
      if (el) {
        el.classList.add('transparent');
      }
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
    // Division is complete - show a completion message
    if (currentStepContainer) {
      currentStepContainer.classList.remove('hidden');
      currentStepContainer.style.background = '#d4edda';
      currentStepContainer.style.borderColor = '#28a745';
    }
    if (currentInstruction) {
      currentInstruction.textContent = `Division complete! Answer: ${SOLUTION.finalAnswer} R${SOLUTION.remainder}`;
    }
    if (workFeedback) workFeedback.classList.add('hidden');
    return;
  }
  
  if (STATE.isWaitingForUserInput) {
    // Show UI for user input
    if (currentStepContainer) {
      currentStepContainer.classList.remove('hidden');
      currentStepContainer.style.background = '#e3f2fd';
      currentStepContainer.style.borderColor = '#2196f3';
    }
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
    // Hide controls during automatic phases, but show them again after a delay
    setTimeout(() => {
      STATE.isWaitingForUserInput = true;
      updateCurrentStepDisplay();
    }, 500); // Small delay before showing next input
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
  
  console.log(`=== ADVANCING PHASE ===`);
  console.log(`Current phase: ${STATE.currentPhase}`);
  
  if (STATE.currentPhase === 'DIVIDE') {
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    const userGuess = currentGuessDisplay ? parseInt(currentGuessDisplay.textContent) : 0;
    
    currentStep.userGuess = userGuess;
    
    console.log(`User guess recorded: ${userGuess}`);
    console.log(`Correct answer: ${currentStep.correctAnswer}`);
    console.log(userGuess === currentStep.correctAnswer ? "✓ Correct!" : "✗ Incorrect");
    
    // FIRST: Render the DIVIDE phase result (show guess in quotient cell)
    console.log("Rendering DIVIDE phase result...");
    renderCurrentPhase(); // This will render the DIVIDE phase with the user's guess
    
    // THEN: Advance to MULTIPLY phase
    STATE.currentPhase = 'MULTIPLY';
    STATE.isWaitingForUserInput = false;
    
    // Wait a moment, then render the MULTIPLY phase
    setTimeout(() => {
      console.log("Now rendering MULTIPLY phase...");
      renderCurrentPhase();
      updateCurrentStepDisplay();
    }, 300);
    
  } else if (STATE.currentPhase === 'MULTIPLY') {
    STATE.currentPhase = 'SUBTRACT';
    
    // Render the SUBTRACT phase
    setTimeout(() => {
      renderCurrentPhase();
      updateCurrentStepDisplay();
    }, 300);
    
  } else if (STATE.currentPhase === 'SUBTRACT') {
    if (STATE.currentStepIndex < STATE.steps.length - 1) {
      STATE.currentPhase = 'BRING_DOWN';
      console.log(`Moving to BRING_DOWN, next step will be ${STATE.currentStepIndex + 1}`);
      
      // After a delay, move to next step
      setTimeout(() => {
        STATE.currentStepIndex++;
        STATE.currentPhase = 'DIVIDE';
        STATE.isWaitingForUserInput = true;
        console.log(`Moved to step ${STATE.currentStepIndex + 1}`);
        updateCurrentStepDisplay();
      }, 500);
      
    } else {
      console.log("Last step complete - finishing division");
      completeDivision();
      return;
    }
    
  } else if (STATE.currentPhase === 'BRING_DOWN') {
    // This shouldn't happen since we handle BRING_DOWN in the SUBTRACT case
    STATE.currentStepIndex++;
    STATE.currentPhase = 'DIVIDE';
    STATE.isWaitingForUserInput = true;
    console.log(`Moved to step ${STATE.currentStepIndex + 1}`);
    updateCurrentStepDisplay();
  }
}

function completeDivision() {
  console.log("=== DIVISION COMPLETE ===");
  
  STATE.isComplete = true;
  
  // Update answer row with final answer (remove the "?" placeholder)
  const answerDigits = SOLUTION.finalAnswer.split('');
  const answerCells = ['r1c4', 'r1c5', 'r1c6'];
  
  answerCells.forEach((id, i) => {
    if (i < answerDigits.length) {
      setCell(id, answerDigits[i]);
    }
  });
  
  // Show remainder cells
  if (SOLUTION.remainder > 0) {
    const remainderDigits = SOLUTION.remainder.toString().padStart(2, '0').split('');
    
    // Show "R" cell
    const rCell = document.getElementById('r1c7');
    if (rCell) {
      rCell.textContent = 'R';
      rCell.classList.remove('transparent');
    }
    
    // Show remainder tens
    const remainderTensCell = document.getElementById('r1c8');
    if (remainderTensCell && remainderDigits[0] !== '0') {
      remainderTensCell.textContent = remainderDigits[0];
      remainderTensCell.classList.remove('transparent');
    }
    
    // Show remainder ones
    const remainderOnesCell = document.getElementById('r1c9');
    if (remainderOnesCell) {
      remainderOnesCell.textContent = remainderDigits[1];
      remainderOnesCell.classList.remove('transparent');
    }
  }
  
  // Update UI to show completion
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
