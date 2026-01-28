// division.js

const PHASES = ['DIVIDE', 'MULTIPLY', 'SUBTRACT', 'BRING_DOWN'];

function $(id) {
  return document.getElementById(id);
}

function setCell(id, value) {
  const el = $(id);
  if (!el) return;
  el.textContent = value ?? '';
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
}

function renderDivide(step) {
  setCell(step.dom.quotientCell, step.divide.correct);
}

function renderMultiply(step) {
  const digits = step.multiply.value.toString().padStart(3, ' ').split('');
  step.dom.multiplyRow.forEach((id, i) => setCell(id, digits[i]));
}

function renderSubtract(step) {
  const digits = step.subtract.result.toString().padStart(3, ' ').split('');
  step.dom.subtractRow.forEach((id, i) => setCell(id, digits[i]));
}

function renderPhase() {
  const step = STATE.steps[STATE.currentStepIndex];
  if (!step) return;

  switch (STATE.currentPhase) {
    case 'DIVIDE':    renderDivide(step); break;
    case 'MULTIPLY':  renderMultiply(step); break;
    case 'SUBTRACT':  renderSubtract(step); break;
    case 'BRING_DOWN': /* animation later */ break;
  }
}

function initDivision() {
  STATE.steps = generateSteps();
  STATE.currentStepIndex = 0;
  STATE.currentPhase = 'DIVIDE';
}

initDivision();
