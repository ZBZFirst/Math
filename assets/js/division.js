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

// Render the work area with proper long division visualization
function renderWorkArea() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
    
    // Create the main long division structure
    let html = '<div class="long-division-display">';
    
    // Build the quotient at the top
    html += '<div class="quotient-top">' + quotient;
    if (!p.finished && p.quotientDigits.length > 0) {
        html += '...';
    }
    html += '</div>';
    
    // Create the division symbol and dividend
    html += '<div class="division-symbol">';
    html += '<span class="divisor">' + p.divisor + '</span>';
    html += '<span class="dividend">' + p.dividend + '</span>';
    html += '</div>';
    
    // Render each step with proper alignment
    html += '<div class="division-steps">';
    
    let currentPartial = 0;
    let workingNumber = '';
    let indent = 0;
    
    for (let i = 0; i < p.steps.length; i++) {
        const step = p.steps[i];
        const digitIndex = i;
        
        // Calculate the number to bring down
        if (i === 0) {
            currentPartial = p.digits[0];
        } else {
            currentPartial = step.subtraction;
        }
        
        // Create the step visualization
        html += '<div class="step-visualization">';
        
        // Show what we're working with
        if (i === 0) {
            // First digit of dividend
            html += '<div class="working-number" style="margin-left: ' + indent + 'px">';
            html += p.digits[0];
            html += '</div>';
        } else if (step.broughtDown !== null) {
            // Show the brought down number
            html += '<div class="brought-down" style="margin-left: ' + indent + 'px">';
            html += step.subtraction + step.broughtDown;
            html += '</div>';
            workingNumber = step.subtraction + step.broughtDown;
        }
        
        // Show the multiplication and subtraction
        html += '<div class="calculation" style="margin-left: ' + indent + 'px">';
        html += '−' + step.product;
        html += '</div>';
        
        // Draw the subtraction line
        html += '<div class="subtraction-line" style="margin-left: ' + indent + 'px">';
        html += '―';
        html += '</div>';
        
        // Show the remainder
        html += '<div class="remainder-display" style="margin-left: ' + indent + 'px">';
        html += step.subtraction;
        html += '</div>';
        
        html += '</div>'; // Close step-visualization
        
        // Update indentation for next step
        if (step.broughtDown !== null) {
            indent += 20; // Add some indentation
        }
    }
    
    // Show current working number if not finished
    if (!p.finished && p.partial > 0) {
        html += '<div class="current-working">';
        html += '<div class="current-label">Current working number:</div>';
        html += '<div class="current-value">' + p.partial + '</div>';
        html += '</div>';
    }
    
    // If finished, show final remainder
    if (p.finished && p.steps.length > 0) {
        const lastStep = p.steps[p.steps.length - 1];
        html += '<div class="final-result">';
        html += '<div class="final-answer">' + quotient + ' R ' + lastStep.subtraction + '</div>';
        html += '<div class="explanation">' + p.dividend + ' ÷ ' + p.divisor + ' = ' + quotient + ' remainder ' + lastStep.subtraction + '</div>';
        html += '</div>';
    }
    
    html += '</div>'; // Close division-steps
    html += '</div>'; // Close long-division-display
    
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
