// division-practice.js

// DOM Elements
const problemDisplay = document.getElementById('problemdisplay');
const workStageContainer = document.getElementById('workStageContainer');
const workFeedback = document.getElementById('workFeedback');
const newProblemBtn = document.getElementById('newDivisionProblem');
const resetProblemBtn = document.getElementById('resetCurrentProblem');
const solvedCountEl = document.getElementById('solvedCount');
const mistakeCountEl = document.getElementById('mistakeCount');
const divisionAccuracyEl = document.getElementById('divisionAccuracy');
const currentStreakEl = document.getElementById('currentStreak');
const resetScoresBtn = document.getElementById('resetDivisionScores');

// State variables
let currentProblem = null;
let currentGuess = 0;
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Division practice initialized');
    updateScoreDisplay();
    generateNewProblem();
    
    // Event listeners
    newProblemBtn.addEventListener('click', generateNewProblem);
    resetProblemBtn.addEventListener('click', resetCurrentProblem);
    resetScoresBtn.addEventListener('click', resetAllScores);
    
    // Create number buttons after DOM is loaded
    createNumberButtons();
});

// Generate a new division problem
function generateNewProblem() {
    let divisor = Math.floor(Math.random() * 15) + 1;
    let dividend;
    
    do {
        dividend = Math.floor(Math.random() * 999) + 1;
    } while (dividend <= divisor);
    
    initializeDivisionState(dividend, divisor);
    displayProblem();
}

// Initialize the division state machine
function initializeDivisionState(dividend, divisor) {
    currentProblem = {
        dividend: dividend,
        divisor: divisor,
        digits: String(dividend).split('').map(Number),
        stepIndex: 0,
        partial: 0,
        quotientDigits: [],
        steps: [], // Array to store each step for display
        finished: false
    };
    
    // Initialize with first digit
    currentProblem.partial = currentProblem.digits[0];
    currentGuess = 0;
    renderWorkArea();
    renderNumberButtons();
    clearFeedback();
}

// Display the problem
function displayProblem() {
    if (!currentProblem) return;
    
    const dividend = currentProblem.dividend;
    const divisor = currentProblem.divisor;
    
    problemDisplay.innerHTML = `
        <div class="equation-display">
            <div class="large-equation">
                ${dividend} ÷ ${divisor}
            </div>
        </div>
    `;
}

// Create number buttons in the feedback area
function createNumberButtons() {
    const numberButtonsHTML = `
        <div class="number-buttons-container">
            <div class="number-buttons-row">
                <button class="number-btn" data-change="1">+1</button>
                <button class="number-btn" data-change="-1">-1</button>
                <button class="number-btn clear">Clear</button>
            </div>
            <div class="number-display">
                Current guess: <span id="currentGuessDisplay">0</span>
            </div>
            <button id="commitGuessBtn" class="commit-btn">✓ Confirm This Digit</button>
        </div>
    `;
    
    // Clear existing content
    workFeedback.innerHTML = numberButtonsHTML;
    
    // Add event listeners to number buttons
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentProblem || currentProblem.finished) return;
            
            if (btn.classList.contains('clear')) {
                clearGuess();
                return;
            }
            
            const delta = parseInt(btn.dataset.change, 10);
            adjustGuess(delta);
        });
    });
    
    // Add event listener to commit button
    document.getElementById('commitGuessBtn').addEventListener('click', commitGuess);
}

// Render number buttons (show/hide based on state)
function renderNumberButtons() {
    const container = document.querySelector('.number-buttons-container');
    if (!currentProblem || currentProblem.finished) {
        if (container) container.style.display = 'none';
    } else {
        if (container) container.style.display = 'block';
        updateGuessDisplay();
    }
}

// Adjust the current guess
function adjustGuess(delta) {
    if (!currentProblem || currentProblem.finished) return;
    
    const newGuess = currentGuess + delta;
    const maxPossible = Math.floor(currentProblem.partial / currentProblem.divisor);
    
    if (newGuess >= 0 && newGuess <= maxPossible) {
        currentGuess = newGuess;
        updateGuessDisplay();
    } else if (newGuess > maxPossible) {
        showFeedback(`Too high! Maximum possible is ${maxPossible}`);
    }
}

// Clear the current guess
function clearGuess() {
    currentGuess = 0;
    updateGuessDisplay();
}

// Update the guess display
function updateGuessDisplay() {
    const display = document.getElementById('currentGuessDisplay');
    if (display) {
        display.textContent = currentGuess;
    }
}

// Commit the current guess as the next quotient digit
function commitGuess() {
    if (!currentProblem || currentProblem.finished) return;
    
    const p = currentProblem;
    const product = currentGuess * p.divisor;
    
    if (product > p.partial) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Product ${product} is greater than ${p.partial}. Try a smaller digit.`);
        updateScoreDisplay();
        return;
    }
    
    // Create step record
    const step = {
        digit: currentGuess,
        partialBefore: p.partial,
        product: product,
        subtraction: p.partial - product,
        broughtDown: null
    };
    
    p.quotientDigits.push(currentGuess);
    p.steps.push(step);
    
    // Update partial
    p.partial = step.subtraction;
    
    // Bring down next digit if available
    if (p.stepIndex < p.digits.length - 1) {
        p.stepIndex++;
        const nextDigit = p.digits[p.stepIndex];
        p.partial = p.partial * 10 + nextDigit;
        step.broughtDown = nextDigit;
    } else {
        p.finished = true;
        // Problem completed successfully
        solvedCount++;
        currentStreak++;
        updateScoreDisplay();
    }
    
    currentGuess = 0;
    renderWorkArea();
    renderNumberButtons();
    clearFeedback();
}

// Render the work area with LaTeX-style long division
function renderWorkArea() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    let html = '<div class="latex-division">';
    
    // Traditional long division layout
    html += '<div class="division-layout">';
    
    // Quotient at the top
    const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
    html += '<div class="quotient">' + quotient;
    if (p.finished && p.steps.length > 0) {
        html += ' R ' + p.steps[p.steps.length - 1].subtraction;
    }
    html += '</div>';
    
    // Divisor and dividend
    html += '<div class="divisor-box">' + p.divisor + '</div>';
    html += '<div class="dividend-box">' + p.dividend + '</div>';
    
    // Draw the long division symbol
    html += '<div class="division-symbol"></div>';
    
    html += '</div>'; // Close division-layout
    
    // Step-by-step calculations
    html += '<div class="calculation-steps">';
    
    let currentNumber = '';
    let resultLines = [];
    
    // Build the calculation step by step
    for (let i = 0; i < p.steps.length; i++) {
        const step = p.steps[i];
        const stepNum = i + 1;
        
        html += '<div class="step">';
        html += '<div class="step-header">Step ' + stepNum + ':</div>';
        
        // Show the current working number
        if (i === 0) {
            currentNumber = '' + p.digits[0];
        } else if (step.broughtDown !== null) {
            currentNumber = step.subtraction + '' + step.broughtDown;
        }
        
        html += '<div class="step-details">';
        html += '<div><strong>' + currentNumber + '</strong> ÷ ' + p.divisor + ' = ' + step.digit + '</div>';
        html += '<div>' + p.divisor + ' × ' + step.digit + ' = ' + step.product + '</div>';
        html += '<div>' + currentNumber + ' − ' + step.product + ' = ' + step.subtraction + '</div>';
        
        if (step.broughtDown !== null) {
            html += '<div>Bring down next digit (' + step.broughtDown + ') → ' + step.subtraction + step.broughtDown + '</div>';
        } else if (p.finished && i === p.steps.length - 1) {
            html += '<div class="final-remainder">Remainder: ' + step.subtraction + '</div>';
        }
        
        html += '</div></div>';
        
        // Store for the visual representation
        resultLines.push({
            number: currentNumber,
            product: step.product,
            remainder: step.subtraction,
            broughtDown: step.broughtDown
        });
    }
    
    // If not finished, show current state
    if (!p.finished && p.partial > 0) {
        html += '<div class="current-step">';
        html += '<div class="step-header">Current:</div>';
        html += '<div class="step-details">';
        html += '<div>Working with: <strong>' + p.partial + '</strong></div>';
        html += '<div>How many times does ' + p.divisor + ' go into ' + p.partial + '?</div>';
        html += '<div>Current guess: ' + currentGuess + '</div>';
        html += '</div></div>';
    }
    
    html += '</div>'; // Close calculation-steps
    
    // Visual representation of the division
    html += '<div class="visual-representation">';
    html += '<div class="visual-title">Long Division Process:</div>';
    
    let visualHtml = '';
    let indent = 0;
    
    for (let i = 0; i < resultLines.length; i++) {
        const line = resultLines[i];
        
        if (i > 0) {
            visualHtml += '<div class="visual-line" style="margin-left: ' + indent + 'px">';
            visualHtml += line.number;
            visualHtml += '</div>';
            
            visualHtml += '<div class="visual-subtract" style="margin-left: ' + indent + 'px">';
            visualHtml += '−' + line.product;
            visualHtml += '</div>';
            
            visualHtml += '<div class="visual-hr" style="margin-left: ' + indent + 'px">';
            visualHtml += '―――';
            visualHtml += '</div>';
            
            visualHtml += '<div class="visual-remainder" style="margin-left: ' + indent + 'px">';
            visualHtml += line.remainder;
            if (line.broughtDown !== null) {
                visualHtml += line.broughtDown;
                indent += 20;
            }
            visualHtml += '</div>';
        }
    }
    
    html += visualHtml;
    html += '</div>'; // Close visual-representation
    
    html += '</div>'; // Close latex-division
    
    workStageContainer.innerHTML = html;
}

// Show feedback message
function showFeedback(message) {
    const feedbackArea = document.querySelector('.number-buttons-container');
    if (feedbackArea) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        errorMsg.style.color = '#dc3545';
        errorMsg.style.marginTop = '10px';
        errorMsg.style.padding = '5px';
        errorMsg.style.borderRadius = '4px';
        errorMsg.style.backgroundColor = '#f8d7da';
        
        // Remove any existing error message
        const existingError = feedbackArea.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        feedbackArea.appendChild(errorMsg);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 3000);
    }
}

// Clear feedback
function clearFeedback() {
    const errorMsg = document.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Reset current problem
function resetCurrentProblem() {
    if (currentProblem) {
        initializeDivisionState(currentProblem.dividend, currentProblem.divisor);
    }
}

// Update score display
function updateScoreDisplay() {
    solvedCountEl.textContent = solvedCount;
    mistakeCountEl.textContent = mistakeCount;
    
    const total = solvedCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    divisionAccuracyEl.textContent = accuracy + '%';
    currentStreakEl.textContent = currentStreak;
    
    // Save to localStorage
    localStorage.setItem('divisionSolvedCount', solvedCount);
    localStorage.setItem('divisionMistakeCount', mistakeCount);
    localStorage.setItem('divisionCurrentStreak', currentStreak);
}

// Reset all scores
function resetAllScores() {
    solvedCount = 0;
    mistakeCount = 0;
    currentStreak = 0;
    updateScoreDisplay();
}
