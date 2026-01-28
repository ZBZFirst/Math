// division.js

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  return document.getElementById(id);
}

function setCell(id, value) {
  const el = $(id);
  if (!el) return;
  el.textContent = value !== undefined && value !== null ? value : '';
  el.classList.remove('transparent');
}

const PROBLEM = {
  dividendDigits: [1, 2, 3],
  divisor: 5
};

function createStep(stepIndex, digit, carry) {
  const bringDownValue = carry * 10 + digit;
  const quotientDigit = Math.floor(bringDownValue / STATE.divisor);
  const multiplyValue = quotientDigit * STATE.divisor;
  const subtractResult = bringDownValue - multiplyValue;

  return {
    stepIndex,
    digit,
    bringDownValue,

    divide: {
      correct: quotientDigit,
      guess: null
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
  currentPhase: 'DIVIDE'
};

function advancePhase() {
  const phaseIndex = PHASES.indexOf(STATE.currentPhase);

  if (STATE.currentPhase === 'BRING_DOWN') {
    STATE.currentStepIndex++;
    STATE.currentPhase = 'DIVIDE';
  } else {
    STATE.currentPhase = PHASES[phaseIndex + 1];
  }
  
  renderPhase();
  updateCurrentStepDisplay();
}

function renderDivide(step) {
  setCell(step.dom.quotientCell, step.divide.correct);
}

function renderMultiply(step) {
  const digits = step.multiply.value.toString().padStart(3, '0').split('');
  step.dom.multiplyRow.forEach((id, i) => setCell(id, digits[i]));
}

function renderSubtract(step) {
  const digits = step.subtract.result.toString().padStart(3, ' ').split('');
  step.dom.subtractRow.forEach((id, i) => setCell(id, digits[i]));
}

function renderPhase() {
  const step = STATE.steps[STATE.currentStepIndex];
  if (!step) return;

  // Clear previous step cells first
  clearStepCells(step);

  switch (STATE.currentPhase) {
    case 'DIVIDE':    renderDivide(step); break;
    case 'MULTIPLY':  renderMultiply(step); break;
    case 'SUBTRACT':  renderSubtract(step); break;
    case 'BRING_DOWN': /* animation later */ break;
  }
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
  
  if (STATE.currentPhase === 'DIVIDE') {
    // Show the controls for guessing
    if (currentStepContainer) currentStepContainer.classList.remove('hidden');
    if (workFeedback) workFeedback.classList.remove('hidden');
    if (currentGuessDisplay) currentGuessDisplay.textContent = '0';
    
    // Update instruction text
    const step = STATE.steps[STATE.currentStepIndex];
    if (step) {
      const instruction = document.getElementById('currentInstruction');
      if (instruction) {
        instruction.textContent = `How many times does ${STATE.divisor} go into ${step.bringDownValue}?`;
      }
    }
  } else {
    // Hide controls during other phases
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
  }
}

function initializeMainEquation() {
  // Set dividend in main equation
  const dividendHundreds = document.querySelector('.mainEquation.dividend.hundreds');
  const dividendTens = document.querySelector('.mainEquation.dividend.tens');
  const dividendOnes = document.querySelector('.mainEquation.dividend.ones');
  
  if (dividendHundreds) dividendHundreds.textContent = PROBLEM.dividendDigits[0];
  if (dividendTens) dividendTens.textContent = PROBLEM.dividendDigits[1];
  if (dividendOnes) dividendOnes.textContent = PROBLEM.dividendDigits[2];
  
  // Set divisor in main equation
  const divisorOnes = document.querySelector('.mainEquation.divisor.ones');
  if (divisorOnes) divisorOnes.textContent = PROBLEM.divisor;
  
  // Initialize division table with values
  const tableDividendHundreds = document.querySelector('.division-table.dividend.hundreds');
  const tableDividendTens = document.querySelector('.division-table.dividend.tens');
  const tableDividendOnes = document.querySelector('.division-table.dividend.ones');
  const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
  
  if (tableDividendHundreds) tableDividendHundreds.textContent = PROBLEM.dividendDigits[0];
  if (tableDividendTens) tableDividendTens.textContent = PROBLEM.dividendDigits[1];
  if (tableDividendOnes) tableDividendOnes.textContent = PROBLEM.dividendDigits[2];
  if (tableDivisorOnes) tableDivisorOnes.textContent = PROBLEM.divisor;
}

function initDivision() {
  STATE.steps = generateSteps();
  STATE.currentStepIndex = 0;
  STATE.currentPhase = 'DIVIDE';
  
  initializeMainEquation();
  updateCurrentStepDisplay();
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
});
