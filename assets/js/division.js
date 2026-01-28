// division.js

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  return document.getElementById(id);
}

function setCell(id, value) {
  const el = $(id);
  if (!el) return;
  
  // Handle empty values by making cell transparent
  if (value === '' || value === undefined || value === null) {
    el.textContent = '';
    el.classList.add('transparent');
  } else {
    el.textContent = value;
    el.classList.remove('transparent');
  }
}

// Clear a specific cell
function clearCell(id) {
  const el = $(id);
  if (el) {
    el.textContent = '';
    el.classList.add('transparent');
  }
}

const PROBLEM = {
  dividendDigits: [1, 2, 3],
  divisor: 5
};

function createStep(stepIndex, digit, carry) {
  const bringDownValue = carry * 10 + digit;
  const quotientDigit = Math.floor(bringDownValue / PROBLEM.divisor);
  const multiplyValue = quotientDigit * PROBLEM.divisor;
  const subtractResult = bringDownValue - multiplyValue;

  return {
    stepIndex,
    digit,
    bringDownValue,

    divide: {
      correct: quotientDigit,
      userGuess: null,
      isCorrect: null
    },

    multiply: {
      value: multiplyValue
    },

    subtract: {
      result: subtractResult
    },

    carry: subtractResult,

    dom: {
      quotientCell: `r1c${4 + stepIndex}`,
      multiplyRow: [`r${4 + stepIndex * 3}c4`, `r${4 + stepIndex * 3}c5`, `r${4 + stepIndex * 3}c6`],
      lineRow:     [`r${5 + stepIndex * 3}c4`, `r${5 + stepIndex * 3}c5`, `r${5 + stepIndex * 3}c6`],
      subtractRow: [`r${6 + stepIndex * 3}c4`, `r${6 + stepIndex * 3}c5`, `r${6 + stepIndex * 3}c6`]
    },
    
    // Track which phases have been completed for this step
    completedPhases: {
      DIVIDE: false,
      MULTIPLY: false,
      SUBTRACT: false,
      BRING_DOWN: false
    }
  };
}

function generateSteps() {
  const steps = [];
  let carry = 0;

  PROBLEM.dividendDigits.forEach((digit, i) => {
    const step = createStep(i, digit, carry);
    carry = step.carry;
    steps.push(step);
  });

  return steps;
}

const STATE = {
  divisor: PROBLEM.divisor,
  steps: [],
  currentStepIndex: 0,
  currentPhase: 'DIVIDE',
  isWaitingForUserInput: true
};

function advancePhase() {
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) return;
  
  // If we're in DIVIDE phase, we need to check the user's guess
  if (STATE.currentPhase === 'DIVIDE') {
    const userGuess = parseInt(document.getElementById('currentGuessDisplay').textContent);
    
    // Store the user's guess
    currentStep.divide.userGuess = userGuess;
    currentStep.divide.isCorrect = (userGuess === currentStep.divide.correct);
    
    // Only proceed if the guess is correct (or for now, let's allow any guess)
    if (!currentStep.divide.isCorrect) {
      console.log(`Incorrect guess: ${userGuess}. Correct answer: ${currentStep.divide.correct}`);
      // For now, we'll continue anyway, but you could add error handling here
    }
    
    // Mark DIVIDE as completed
    currentStep.completedPhases.DIVIDE = true;
    
    // Move to MULTIPLY phase
    STATE.currentPhase = 'MULTIPLY';
    STATE.isWaitingForUserInput = false;
    
  } else if (STATE.currentPhase === 'MULTIPLY') {
    // Calculate multiplication based on user's guess
    const multiplyValue = currentStep.divide.userGuess * STATE.divisor;
    currentStep.multiply.value = multiplyValue;
    
    // Mark MULTIPLY as completed
    currentStep.completedPhases.MULTIPLY = true;
    
    // Move to SUBTRACT phase
    STATE.currentPhase = 'SUBTRACT';
    
  } else if (STATE.currentPhase === 'SUBTRACT') {
    // Calculate subtraction
    currentStep.subtract.result = currentStep.bringDownValue - currentStep.multiply.value;
    
    // Mark SUBTRACT as completed
    currentStep.completedPhases.SUBTRACT = true;
    
    // Update carry for next step
    currentStep.carry = currentStep.subtract.result;
    
    // Check if we have more steps
    if (STATE.currentStepIndex < STATE.steps.length - 1) {
      // Move to BRING_DOWN phase
      STATE.currentPhase = 'BRING_DOWN';
    } else {
      // This is the last step, we're done
      completeDivision();
      return;
    }
    
  } else if (STATE.currentPhase === 'BRING_DOWN') {
    // Mark BRING_DOWN as completed
    currentStep.completedPhases.BRING_DOWN = true;
    
    // Move to next step
    STATE.currentStepIndex++;
    
    // If there are more steps, start with DIVIDE
    if (STATE.currentStepIndex < STATE.steps.length) {
      STATE.currentPhase = 'DIVIDE';
      STATE.isWaitingForUserInput = true;
    } else {
      completeDivision();
      return;
    }
  }
  
  // Render the current phase
  renderCurrentPhase();
  updateCurrentStepDisplay();
}

function completeDivision() {
  console.log('Division complete!');
  
  // Hide controls
  const currentStepContainer = document.querySelector('.current-step-container');
  const workFeedback = document.getElementById('workFeedback');
  
  if (currentStepContainer) currentStepContainer.classList.add('hidden');
  if (workFeedback) workFeedback.classList.add('hidden');
  
  // Calculate and display final answer
  const answer = STATE.steps.map(step => step.divide.userGuess).join('');
  const remainder = STATE.steps[STATE.steps.length - 1].carry;
  
  console.log(`Answer: ${answer} R${remainder}`);
  
  // You could update the main equation with the answer here
  updateFinalAnswer(answer, remainder);
}

function updateFinalAnswer(answer, remainder) {
  // Update the main equation with the answer
  const answerElements = document.querySelectorAll('.mainEquation.answer');
  const answerDigits = answer.split('');
  
  answerElements.forEach((el, index) => {
    if (index < answerDigits.length) {
      el.textContent = answerDigits[index];
    }
  });
  
  // Show remainder if needed
  if (remainder > 0) {
    const remainderElements = document.querySelectorAll('.mainEquation.remainder');
    const remainderDigits = remainder.toString().padStart(2, '0').split('');
    
    document.querySelector('.mainEquation.remainder.R')?.classList.remove('hidden');
    remainderElements.forEach((el, index) => {
      if (index < remainderDigits.length) {
        el.textContent = remainderDigits[index];
        el.classList.remove('hidden');
      }
    });
  }
}

function renderCurrentPhase() {
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) return;
  
  // Clear previous step cells
  clearStepCells(currentStep);
  
  switch (STATE.currentPhase) {
    case 'DIVIDE':
      // Don't render anything yet - waiting for user input
      break;
      
    case 'MULTIPLY':
      renderMultiply(currentStep);
      break;
      
    case 'SUBTRACT':
      renderSubtract(currentStep);
      break;
      
    case 'BRING_DOWN':
      // Nothing to render for BRING_DOWN
      break;
  }
}

function renderDivide(step) {
  // Only render after user has made a guess
  if (step.divide.userGuess !== null) {
    setCell(step.dom.quotientCell, step.divide.userGuess);
  }
}

function renderMultiply(step) {
  const multiplyValue = step.divide.userGuess * STATE.divisor;
  const digits = multiplyValue.toString().padStart(3, '0').split('');
  
  step.dom.multiplyRow.forEach((id, i) => {
    setCell(id, digits[i]);
  });
  
  // Also show the horizontal lines
  step.dom.lineRow.forEach(id => {
    const el = $(id);
    if (el) el.classList.remove('transparent');
  });
}

function renderSubtract(step) {
  const subtractResult = step.bringDownValue - (step.divide.userGuess * STATE.divisor);
  const digits = subtractResult.toString().padStart(3, ' ').split('');
  
  step.dom.subtractRow.forEach((id, i) => {
    setCell(id, digits[i]);
  });
}

function clearStepCells(step) {
  // Clear all cells for this step
  setCell(step.dom.quotientCell, '');
  step.dom.multiplyRow.forEach(id => setCell(id, ''));
  step.dom.lineRow.forEach(id => {
    const el = $(id);
    if (el) el.classList.add('transparent');
  });
  step.dom.subtractRow.forEach(id => setCell(id, ''));
}

function updateCurrentStepDisplay() {
  const currentStepContainer = document.querySelector('.current-step-container');
  const workFeedback = document.getElementById('workFeedback');
  const currentGuessDisplay = document.getElementById('currentGuessDisplay');
  const currentInstruction = document.getElementById('currentInstruction');
  
  if (STATE.isWaitingForUserInput) {
    // Show controls for user input
    if (currentStepContainer) currentStepContainer.classList.remove('hidden');
    if (workFeedback) workFeedback.classList.remove('hidden');
    if (currentGuessDisplay) currentGuessDisplay.textContent = '0';
    
    // Update instruction
    const currentStep = STATE.steps[STATE.currentStepIndex];
    if (currentStep && currentInstruction) {
      if (STATE.currentStepIndex === 0) {
        currentInstruction.textContent = `How many times does ${STATE.divisor} go into ${currentStep.bringDownValue}?`;
      } else {
        const previousStep = STATE.steps[STATE.currentStepIndex - 1];
        currentInstruction.textContent = `Bring down: ${previousStep.carry}${currentStep.digit} ÷ ${STATE.divisor} = ?`;
      }
    }
  } else {
    // Hide controls during automatic phases
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
  }
}

function initializeMainEquation() {
  // Set dividend in main equation
  const dividendElements = document.querySelectorAll('.mainEquation.dividend');
  dividendElements.forEach((el, index) => {
    if (index < PROBLEM.dividendDigits.length) {
      el.textContent = PROBLEM.dividendDigits[index];
    }
  });
  
  // Set divisor in main equation
  const divisorOnes = document.querySelector('.mainEquation.divisor.ones');
  if (divisorOnes) divisorOnes.textContent = PROBLEM.divisor;
  
  // Initialize division table with values
  const tableDividendElements = document.querySelectorAll('.division-table.dividend');
  tableDividendElements.forEach((el, index) => {
    if (index < PROBLEM.dividendDigits.length) {
      el.textContent = PROBLEM.dividendDigits[index];
      el.classList.remove('transparent');
    }
  });
  
  const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
  if (tableDivisorOnes) {
    tableDivisorOnes.textContent = PROBLEM.divisor;
    tableDivisorOnes.classList.remove('transparent');
  }
}

function initDivision() {
  STATE.steps = generateSteps();
  STATE.currentStepIndex = 0;
  STATE.currentPhase = 'DIVIDE';
  STATE.isWaitingForUserInput = true;
  
  initializeMainEquation();
  updateCurrentStepDisplay();
  
  // Clear all work cells
  STATE.steps.forEach(step => {
    clearStepCells(step);
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  initDivision();
  
  // Setup commit button
  const commitBtn = document.getElementById('commitGuessBtn');
  if (commitBtn) {
    commitBtn.addEventListener('click', function() {
      advancePhase();
    });
  }
  
  // Setup control buttons
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
  
  // Optional: Add keyboard support
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
});
