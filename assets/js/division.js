// division.js - DEBUG VERSION

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  return document.getElementById(id);
}

function setCell(id, value, debug = false) {
  const el = $(id);
  if (!el) return;
  
  if (value === '' || value === undefined || value === null) {
    el.textContent = '';
    el.classList.add('transparent');
  } else {
    el.textContent = value;
    el.classList.remove('transparent');
    // Add debug styling
    if (debug) {
      el.style.outline = '2px solid red';
      el.style.backgroundColor = '#ffcccc';
      setTimeout(() => {
        el.style.outline = '';
        el.style.backgroundColor = '';
      }, 1000);
    }
  }
}

// Debug logging function
function debugLog(stepIndex, phase, message, data = null) {
  console.log(`[Step ${stepIndex}][${phase}] ${message}`, data || '');
  
  // Also update a debug display if available
  const debugDiv = document.getElementById('debug-info') || createDebugDisplay();
  const entry = document.createElement('div');
  entry.innerHTML = `<strong>Step ${stepIndex} - ${phase}:</strong> ${message}`;
  if (data) entry.innerHTML += ` <em>${JSON.stringify(data)}</em>`;
  debugDiv.appendChild(entry);
  debugDiv.scrollTop = debugDiv.scrollHeight;
}

function createDebugDisplay() {
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-info';
  debugDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 400px;
    height: 300px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    overflow-y: auto;
    z-index: 9999;
    border: 2px solid yellow;
    border-radius: 5px;
  `;
  document.body.appendChild(debugDiv);
  return debugDiv;
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

  debugLog(stepIndex, 'CREATE_STEP', `Creating step ${stepIndex}`, {
    digit,
    carry,
    bringDownValue,
    quotientDigit,
    multiplyValue,
    subtractResult
  });

  // DEBUG: Check what cells we're targeting
  const quotientCellId = `r1c${4 + stepIndex}`;
  const multiplyRowStart = 4 + stepIndex * 3;
  const lineRowStart = 5 + stepIndex * 3;
  const subtractRowStart = 6 + stepIndex * 3;
  
  debugLog(stepIndex, 'CELL_MAPPING', 'Cell IDs:', {
    quotientCell: quotientCellId,
    multiplyRow: [`r${multiplyRowStart}c4`, `r${multiplyRowStart}c5`, `r${multiplyRowStart}c6`],
    lineRow: [`r${lineRowStart}c4`, `r${lineRowStart}c5`, `r${lineRowStart}c6`],
    subtractRow: [`r${subtractRowStart}c4`, `r${subtractRowStart}c5`, `r${subtractRowStart}c6`]
  });

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
      quotientCell: quotientCellId,
      multiplyRow: [`r${multiplyRowStart}c4`, `r${multiplyRowStart}c5`, `r${multiplyRowStart}c6`],
      lineRow:     [`r${lineRowStart}c4`, `r${lineRowStart}c5`, `r${lineRowStart}c6`],
      subtractRow: [`r${subtractRowStart}c4`, `r${subtractRowStart}c5`, `r${subtractRowStart}c6`]
    },
    
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

  debugLog('INIT', 'GENERATE_STEPS', 'Starting to generate steps from dividend digits:', PROBLEM.dividendDigits);

  PROBLEM.dividendDigits.forEach((digit, i) => {
    debugLog(i, 'GENERATE', `Processing digit ${digit} at position ${i}, carry = ${carry}`);
    const step = createStep(i, digit, carry);
    carry = step.carry;
    steps.push(step);
    debugLog(i, 'GENERATE', `Step created. New carry = ${carry}`);
  });

  debugLog('INIT', 'GENERATE_STEPS', `Generated ${steps.length} steps total`);
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
  if (!currentStep) {
    debugLog('ERROR', 'ADVANCE', 'No current step!');
    return;
  }
  
  debugLog(STATE.currentStepIndex, 'ADVANCE', `Advancing from ${STATE.currentPhase} phase`);

  if (STATE.currentPhase === 'DIVIDE') {
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    const userGuess = currentGuessDisplay ? parseInt(currentGuessDisplay.textContent) : 0;
    
    debugLog(STATE.currentStepIndex, 'DIVIDE', `User guess: ${userGuess}, Correct: ${currentStep.divide.correct}`);
    
    currentStep.divide.userGuess = userGuess;
    currentStep.divide.isCorrect = (userGuess === currentStep.divide.correct);
    
    if (!currentStep.divide.isCorrect) {
      debugLog(STATE.currentStepIndex, 'DIVIDE', `INCORRECT! User guessed ${userGuess} but correct is ${currentStep.divide.correct}`);
    }
    
    currentStep.completedPhases.DIVIDE = true;
    STATE.currentPhase = 'MULTIPLY';
    STATE.isWaitingForUserInput = false;
    
  } else if (STATE.currentPhase === 'MULTIPLY') {
    const multiplyValue = currentStep.divide.userGuess * STATE.divisor;
    currentStep.multiply.value = multiplyValue;
    
    debugLog(STATE.currentStepIndex, 'MULTIPLY', 
      `${currentStep.divide.userGuess} × ${STATE.divisor} = ${multiplyValue}`);
    
    currentStep.completedPhases.MULTIPLY = true;
    STATE.currentPhase = 'SUBTRACT';
    
  } else if (STATE.currentPhase === 'SUBTRACT') {
    const subtractResult = currentStep.bringDownValue - currentStep.multiply.value;
    currentStep.subtract.result = subtractResult;
    
    debugLog(STATE.currentStepIndex, 'SUBTRACT', 
      `${currentStep.bringDownValue} - ${currentStep.multiply.value} = ${subtractResult}`);
    
    currentStep.completedPhases.SUBTRACT = true;
    currentStep.carry = subtractResult;
    
    if (STATE.currentStepIndex < STATE.steps.length - 1) {
      STATE.currentPhase = 'BRING_DOWN';
      debugLog(STATE.currentStepIndex, 'SUBTRACT', `Moving to BRING_DOWN phase`);
    } else {
      debugLog(STATE.currentStepIndex, 'SUBTRACT', `Last step complete, finishing division`);
      completeDivision();
      return;
    }
    
  } else if (STATE.currentPhase === 'BRING_DOWN') {
    debugLog(STATE.currentStepIndex, 'BRING_DOWN', 
      `Bringing down remainder ${currentStep.carry} to next digit`);
    
    currentStep.completedPhases.BRING_DOWN = true;
    STATE.currentStepIndex++;
    
    if (STATE.currentStepIndex < STATE.steps.length) {
      STATE.currentPhase = 'DIVIDE';
      STATE.isWaitingForUserInput = true;
      debugLog(STATE.currentStepIndex, 'BRING_DOWN', 
        `Moving to step ${STATE.currentStepIndex} (digit: ${STATE.steps[STATE.currentStepIndex].digit})`);
    } else {
      completeDivision();
      return;
    }
  }
  
  renderCurrentPhase();
  updateCurrentStepDisplay();
}

function completeDivision() {
  debugLog('FINAL', 'COMPLETE', 'Division complete!');
  
  const answer = STATE.steps.map(step => step.divide.userGuess).join('');
  const remainder = STATE.steps[STATE.steps.length - 1].carry;
  
  debugLog('FINAL', 'COMPLETE', `Calculated answer: ${answer} R${remainder}`);
  debugLog('FINAL', 'COMPLETE', `Steps detail:`, STATE.steps.map((s, i) => ({
    step: i,
    digit: s.digit,
    bringDown: s.bringDownValue,
    guess: s.divide.userGuess,
    multiply: s.multiply.value,
    subtract: s.subtract.result,
    carry: s.carry
  })));
  
  // Hide controls
  const currentStepContainer = document.querySelector('.current-step-container');
  const workFeedback = document.getElementById('workFeedback');
  
  if (currentStepContainer) currentStepContainer.classList.add('hidden');
  if (workFeedback) workFeedback.classList.add('hidden');
  
  updateFinalAnswer(answer, remainder);
}

function updateFinalAnswer(answer, remainder) {
  debugLog('FINAL', 'ANSWER', `Setting final answer: ${answer} R${remainder}`);
  
  const answerElements = document.querySelectorAll('.mainEquation.answer');
  const answerDigits = answer.split('');
  
  answerElements.forEach((el, index) => {
    if (index < answerDigits.length) {
      el.textContent = answerDigits[index];
      el.classList.add('answered');
    }
  });
  
  if (remainder > 0) {
    const remainderDigits = remainder.toString().padStart(2, '0').split('');
    
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
}

function renderCurrentPhase() {
  const currentStep = STATE.steps[STATE.currentStepIndex];
  if (!currentStep) {
    debugLog('ERROR', 'RENDER', 'No current step to render!');
    return;
  }
  
  debugLog(STATE.currentStepIndex, 'RENDER', `Rendering ${STATE.currentPhase} phase`);
  
  switch (STATE.currentPhase) {
    case 'DIVIDE':
      renderDivide(currentStep);
      break;
    case 'MULTIPLY':
      renderMultiply(currentStep);
      break;
    case 'SUBTRACT':
      renderSubtract(currentStep);
      break;
    case 'BRING_DOWN':
      // Nothing to render
      break;
  }
}

function renderDivide(step) {
  debugLog(step.stepIndex, 'RENDER_DIVIDE', 
    `Setting quotient cell ${step.dom.quotientCell} to ${step.divide.userGuess}`);
  
  setCell(step.dom.quotientCell, step.divide.userGuess, true);
}

function renderMultiply(step) {
  const multiplyValue = step.divide.userGuess * STATE.divisor;
  const digits = multiplyValue.toString().padStart(3, '0').split('');
  
  debugLog(step.stepIndex, 'RENDER_MULTIPLY', 
    `Setting multiply cells ${step.dom.multiplyRow} to ${digits} (value: ${multiplyValue})`);
  
  step.dom.multiplyRow.forEach((id, i) => {
    setCell(id, digits[i], true);
  });
  
  step.dom.lineRow.forEach(id => {
    const el = $(id);
    if (el) {
      el.classList.remove('transparent');
      el.style.outline = '2px solid blue';
      setTimeout(() => el.style.outline = '', 1000);
    }
  });
}

function renderSubtract(step) {
  const subtractResult = step.bringDownValue - (step.divide.userGuess * STATE.divisor);
  const digits = subtractResult.toString().padStart(3, ' ').split('');
  
  debugLog(step.stepIndex, 'RENDER_SUBTRACT', 
    `Setting subtract cells ${step.dom.subtractRow} to ${digits} (value: ${subtractResult})`);
  
  step.dom.subtractRow.forEach((id, i) => {
    setCell(id, digits[i], true);
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
    if (currentStepContainer) currentStepContainer.classList.remove('hidden');
    if (workFeedback) workFeedback.classList.remove('hidden');
    if (currentGuessDisplay) currentGuessDisplay.textContent = '0';
    
    const currentStep = STATE.steps[STATE.currentStepIndex];
    if (currentStep && currentInstruction) {
      if (STATE.currentStepIndex === 0) {
        currentInstruction.textContent = `How many times does ${STATE.divisor} go into ${currentStep.bringDownValue}?`;
      } else {
        const previousStep = STATE.steps[STATE.currentStepIndex - 1];
        currentInstruction.textContent = `Bring down: ${previousStep.carry}${currentStep.digit} ÷ ${STATE.divisor} = ?`;
      }
    }
    
    debugLog(STATE.currentStepIndex, 'UI_UPDATE', 
      `Showing UI for step ${STATE.currentStepIndex}, bringDownValue: ${currentStep.bringDownValue}`);
  } else {
    if (currentStepContainer) currentStepContainer.classList.add('hidden');
    if (workFeedback) workFeedback.classList.add('hidden');
  }
}

function initializeMainEquation() {
  debugLog('INIT', 'MAIN_EQ', 'Initializing main equation display');
  
  const dividendHundreds = document.querySelector('.mainEquation.dividend.hundreds');
  const dividendTens = document.querySelector('.mainEquation.dividend.tens');
  const dividendOnes = document.querySelector('.mainEquation.dividend.ones');
  
  if (dividendHundreds) {
    dividendHundreds.textContent = PROBLEM.dividendDigits[0];
    debugLog('INIT', 'MAIN_EQ', `Set hundreds digit to ${PROBLEM.dividendDigits[0]}`);
  }
  if (dividendTens) {
    dividendTens.textContent = PROBLEM.dividendDigits[1];
    debugLog('INIT', 'MAIN_EQ', `Set tens digit to ${PROBLEM.dividendDigits[1]}`);
  }
  if (dividendOnes) {
    dividendOnes.textContent = PROBLEM.dividendDigits[2];
    debugLog('INIT', 'MAIN_EQ', `Set ones digit to ${PROBLEM.dividendDigits[2]}`);
  }
  
  const divisorOnes = document.querySelector('.mainEquation.divisor.ones');
  if (divisorOnes) {
    divisorOnes.textContent = PROBLEM.divisor;
    debugLog('INIT', 'MAIN_EQ', `Set divisor to ${PROBLEM.divisor}`);
  }
  
  // Initialize division table
  const tableDividendHundreds = document.querySelector('.division-table.dividend.hundreds');
  const tableDividendTens = document.querySelector('.division-table.dividend.tens');
  const tableDividendOnes = document.querySelector('.division-table.dividend.ones');
  const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
  
  if (tableDividendHundreds) {
    tableDividendHundreds.textContent = PROBLEM.dividendDigits[0];
    tableDividendHundreds.classList.remove('transparent');
    debugLog('INIT', 'TABLE', `Set table hundreds to ${PROBLEM.dividendDigits[0]}`);
  }
  if (tableDividendTens) {
    tableDividendTens.textContent = PROBLEM.dividendDigits[1];
    tableDividendTens.classList.remove('transparent');
    debugLog('INIT', 'TABLE', `Set table tens to ${PROBLEM.dividendDigits[1]}`);
  }
  if (tableDividendOnes) {
    tableDividendOnes.textContent = PROBLEM.dividendDigits[2];
    tableDividendOnes.classList.remove('transparent');
    debugLog('INIT', 'TABLE', `Set table ones to ${PROBLEM.dividendDigits[2]}`);
  }
  if (tableDivisorOnes) {
    tableDivisorOnes.textContent = PROBLEM.divisor;
    tableDivisorOnes.classList.remove('transparent');
    debugLog('INIT', 'TABLE', `Set table divisor to ${PROBLEM.divisor}`);
  }
}

function initDivision() {
  debugLog('INIT', 'APP', 'Initializing division app');
  debugLog('INIT', 'PROBLEM', `Problem: ${PROBLEM.dividendDigits.join('')} ÷ ${PROBLEM.divisor}`);
  
  STATE.steps = generateSteps();
  STATE.currentStepIndex = 0;
  STATE.currentPhase = 'DIVIDE';
  STATE.isWaitingForUserInput = true;
  
  debugLog('INIT', 'STATE', `Initial state: step ${STATE.currentStepIndex}, phase ${STATE.currentPhase}`);
  
  initializeMainEquation();
  updateCurrentStepDisplay();
  
  // Clear all work cells initially
  STATE.steps.forEach(step => {
    clearStepCells(step);
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  debugLog('INIT', 'DOM', 'DOM fully loaded, starting division app');
  
  initDivision();
  
  const commitBtn = document.getElementById('commitGuessBtn');
  if (commitBtn) {
    commitBtn.addEventListener('click', function() {
      debugLog('EVENT', 'BUTTON', 'Commit button clicked');
      advancePhase();
    });
  }
  
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
      
      debugLog('EVENT', 'CONTROL', `Guess changed: ${oldValue} → ${current}`);
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
      debugLog('EVENT', 'KEYBOARD', 'Enter key pressed');
      commitBtn.click();
      e.preventDefault();
    } else if (e.key === ' ') {
      // Space bar to toggle debug
      const debugDiv = document.getElementById('debug-info');
      if (debugDiv) {
        debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
      }
      e.preventDefault();
    }
    
    if (current !== oldValue) {
      debugLog('EVENT', 'KEYBOARD', `Guess changed via keyboard: ${oldValue} → ${current}`);
      currentGuessDisplay.textContent = current;
    }
  });
  
  // Add a debug toggle button
  const debugToggle = document.createElement('button');
  debugToggle.textContent = 'Debug';
  debugToggle.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    padding: 5px 10px;
    background: #ffcc00;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    z-index: 10000;
  `;
  debugToggle.onclick = function() {
    const debugDiv = document.getElementById('debug-info');
    if (debugDiv) {
      debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
    }
  };
  document.body.appendChild(debugToggle);
  
  debugLog('INIT', 'APP', 'Division app fully initialized');
});
