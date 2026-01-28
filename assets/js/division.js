// division.js - FIXED VERSION

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  return document.getElementById(id);
}

function setCell(id, value, isDebug = false) {
  const el = $(id);
  if (!el) return;
  
  if (value === '' || value === undefined || value === null) {
    el.textContent = '';
    el.classList.add('transparent');
  } else {
    el.textContent = value;
    el.classList.remove('transparent');
  }
  
  if (isDebug) {
    console.log(`SET CELL: ${id} = "${value}"`);
  }
}

const PROBLEM = {
  dividendDigits: [1, 2, 3],
  divisor: 5
};

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
    console.log(`  Quotient digit: ${quotientDigit} (${quotientDigit} × ${PROBLEM.divisor} = ${multiplyValue})`);
    console.log(`  Subtract: ${bringDownValue} - ${multiplyValue} = ${subtractResult}`);
    console.log(`  Carry to next step: ${subtractResult}`);
    
    steps.push({
      stepIndex: i,
      digit: digit,
      bringDownValue: bringDownValue,
      
      // CORRECT ANSWERS (pre-calculated)
      correctAnswer: quotientDigit,
      correctMultiply: multiplyValue,
      correctSubtract: subtractResult,
      
      // User's guesses (start empty)
      userGuess: null,
      userMultiply: null,
      userSubtract: null,
      
      // Cell mappings
      dom: {
        quotientCell: `r1c${4 + i}`,  // Row 1, columns 4,5,6
        multiplyRow: [`r${4 + i * 3}c4`, `r${4 + i * 3}c5`, `r${4 + i * 3}c6`],
        lineRow: [`r${5 + i * 3}c4`, `r${5 + i * 3}c5`, `r${5 + i * 3}c6`],
        subtractRow: [`r${6 + i * 3}c4`, `r${6 + i * 3}c5`, `r${6 + i * 3}c6`]
      }
    });
    
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
  const dividendHundreds = document.querySelector('.mainEquation.dividend.hundreds');
  const dividendTens = document.querySelector('.mainEquation.dividend.tens');
  const dividendOnes = document.querySelector('.mainEquation.dividend.ones');
  
  if (dividendHundreds) dividendHundreds.textContent = PROBLEM.dividendDigits[0];
  if (dividendTens) dividendTens.textContent = PROBLEM.dividendDigits[1];
  if (dividendOnes) dividendOnes.textContent = PROBLEM.dividendDigits[2];
  
  const divisorOnes = document.querySelector('.mainEquation.divisor.ones');
  if (divisorOnes) divisorOnes.textContent = PROBLEM.divisor;
  
  // Initialize division table (just show the problem, not the solution)
  const tableDividendHundreds = document.querySelector('.division-table.dividend.hundreds');
  const tableDividendTens = document.querySelector('.division-table.dividend.tens');
  const tableDividendOnes = document.querySelector('.division-table.dividend.ones');
  const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
  
  if (tableDividendHundreds) {
    tableDividendHundreds.textContent = PROBLEM.dividendDigits[0];
    tableDividendHundreds.classList.remove('transparent');
  }
  if (tableDividendTens) {
    tableDividendTens.textContent = PROBLEM.dividendDigits[1];
    tableDividendTens.classList.remove('transparent');
  }
  if (tableDividendOnes) {
    tableDividendOnes.textContent = PROBLEM.dividendDigits[2];
    tableDividendOnes.classList.remove('transparent');
  }
  if (tableDivisorOnes) {
    tableDivisorOnes.textContent = PROBLEM.divisor;
    tableDivisorOnes.classList.remove('transparent');
  }
  
  // Hide all answer cells initially
  const answerCells = document.querySelectorAll('.division-table.answer');
  answerCells.forEach(cell => {
    cell.textContent = '';
    cell.classList.add('transparent');
  });
  
  // Clear all work cells
  for (let i = 0; i < 3; i++) {
    const multiplyCells = [
      `r${4 + i * 3}c4`, `r${4 + i * 3}c5`, `r${4 + i * 3}c6`
    ];
    const lineCells = [
      `r${5 + i * 3}c4`, `r${5 + i * 3}c5`, `r${5 + i * 3}c6`
    ];
    const subtractCells = [
      `r${6 + i * 3}c4`, `r${6 + i * 3}c5`, `r${6 + i * 3}c6`
    ];
    
    [...multiplyCells, ...subtractCells].forEach(id => setCell(id, ''));
    lineCells.forEach(id => {
      const el = $(id);
      if (el) el.classList.add('transparent');
    });
  }
  
  console.log("Grid initialized - showing problem only");
}

function updateCurrentStepDisplay() {
  const currentStep = STATE.steps[STATE.currentStepIndex];
  const currentStepContainer = document.querySelector('.current-step-container');
  const workFeedback = document.getElementById('workFeedback');
  const currentGuessDisplay = document.getElementById('currentGuessDisplay');
  const currentInstruction = document.getElementById('currentInstruction');
  
  if (STATE.isComplete) {
    // Division is complete
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
    return;
  }
  
  if (STATE.isWaitingForUserInput) {
    // Show UI for user input
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
    console.log(`Correct answer digit: ${currentStep.correctAnswer}`);
  } else {
    // Hide UI during automatic phases
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
  }
}

function renderCurrentPhase() {
  if (STATE.isComplete) return;
  
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) return;
  
  console.log(`Rendering ${STATE.currentPhase} for step ${STATE.currentStepIndex}`);
  
  switch (STATE.currentPhase) {
    case 'DIVIDE':
      // Show user's guess in quotient cell
      if (currentStep.userGuess !== null) {
        setCell(currentStep.dom.quotientCell, currentStep.userGuess);
      }
      break;
      
    case 'MULTIPLY':
      // Show multiplication result
      const multiplyValue = currentStep.userGuess * STATE.divisor;
      const multiplyDigits = multiplyValue.toString().padStart(3, '0').split('');
      
      currentStep.dom.multiplyRow.forEach((id, i) => {
        setCell(id, multiplyDigits[i]);
      });
      
      // Show lines
      currentStep.dom.lineRow.forEach(id => {
        const el = $(id);
        if (el) el.classList.remove('transparent');
      });
      break;
      
    case 'SUBTRACT':
      // Show subtraction result
      const subtractResult = currentStep.bringDownValue - (currentStep.userGuess * STATE.divisor);
      const subtractDigits = subtractResult.toString().padStart(3, ' ').split('');
      
      currentStep.dom.subtractRow.forEach((id, i) => {
        setCell(id, subtractDigits[i]);
      });
      break;
      
    case 'BRING_DOWN':
      // Nothing to render
      break;
  }
}

function advancePhase() {
  if (STATE.isComplete) return;
  
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) return;
  
  console.log(`Advancing from ${STATE.currentPhase} phase`);
  
  if (STATE.currentPhase === 'DIVIDE') {
    // Get user's guess
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    const userGuess = currentGuessDisplay ? parseInt(currentGuessDisplay.textContent) : 0;
    
    currentStep.userGuess = userGuess;
    
    console.log(`User guessed: ${userGuess}`);
    console.log(`Correct answer: ${currentStep.correctAnswer}`);
    
    // Check if correct
    if (userGuess === currentStep.correctAnswer) {
      console.log("✓ Correct!");
    } else {
      console.log("✗ Incorrect!");
    }
    
    // Move to MULTIPLY phase
    STATE.currentPhase = 'MULTIPLY';
    STATE.isWaitingForUserInput = false;
    
  } else if (STATE.currentPhase === 'MULTIPLY') {
    // Move to SUBTRACT phase
    STATE.currentPhase = 'SUBTRACT';
    
  } else if (STATE.currentPhase === 'SUBTRACT') {
    // Check if this is the last step
    if (STATE.currentStepIndex < STATE.steps.length - 1) {
      // Move to BRING_DOWN phase
      STATE.currentPhase = 'BRING_DOWN';
    } else {
      // This is the last step - complete the division
      completeDivision();
      return;
    }
    
  } else if (STATE.currentPhase === 'BRING_DOWN') {
    // Move to next step
    STATE.currentStepIndex++;
    STATE.currentPhase = 'DIVIDE';
    STATE.isWaitingForUserInput = true;
  }
  
  // Render the current phase and update UI
  renderCurrentPhase();
  updateCurrentStepDisplay();
}

function completeDivision() {
  console.log("=== DIVISION COMPLETE ===");
  
  STATE.isComplete = true;
  
  // Show final answer in main equation
  const answerElements = document.querySelectorAll('.mainEquation.answer');
  const answerDigits = SOLUTION.finalAnswer.split('');
  
  answerElements.forEach((el, i) => {
    if (i < answerDigits.length) {
      el.textContent = answerDigits[i];
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
    }
    if (remainderOnes) {
      remainderOnes.textContent = remainderDigits[1];
      remainderOnes.classList.remove('hidden');
    }
  }
  
  // Hide controls
  updateCurrentStepDisplay();
  
  console.log(`Final answer: ${SOLUTION.finalAnswer} R${SOLUTION.remainder}`);
  console.log("All steps completed!");
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  console.log("=== DIVISION PRACTICE INITIALIZING ===");
  
  // Initialize the grid
  initializeGrid();
  
  // Set up initial UI
  updateCurrentStepDisplay();
  
  // Set up commit button
  const commitBtn = document.getElementById('commitGuessBtn');
  if (commitBtn) {
    commitBtn.addEventListener('click', function() {
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
      
      if (this.classList.contains('clear')) {
        current = 0;
      } else if (this.classList.contains('increment')) {
        if (this.classList.contains('one')) current += 1;
        if (this.classList.contains('five')) current += 5;
      } else if (this.classList.contains('decrement')) {
        if (this.classList.contains('one')) current = Math.max(0, current - 1);
        if (this.classList.contains('five')) current = Math.max(0, current - 5);
      }
      
      currentGuessDisplay.textContent = current;
    });
  });
  
  // Keyboard support
  document.addEventListener('keydown', function(e) {
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    if (!currentGuessDisplay) return;
    
    let current = parseInt(currentGuessDisplay.textContent) || 0;
    
    if (e.key === 'ArrowUp') {
      current += 1;
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      current = Math.max(0, current - 1);
      e.preventDefault();
    } else if (e.key === 'Enter' && commitBtn) {
      commitBtn.click();
      e.preventDefault();
    }
    
    currentGuessDisplay.textContent = current;
  });
  
  console.log("=== READY FOR USER INPUT ===");
  console.log("Problem: 123 ÷ 5");
  console.log("Full solution calculated and ready");
  console.log("Expected steps:");
  console.log("1. 1 ÷ 5 = 0 (0 × 5 = 0, 1 - 0 = 1, carry down 2)");
  console.log("2. 12 ÷ 5 = 2 (2 × 5 = 10, 12 - 10 = 2, carry down 3)");
  console.log("3. 23 ÷ 5 = 4 (4 × 5 = 20, 23 - 20 = 3)");
  console.log("Final answer: 24 R3");
});
