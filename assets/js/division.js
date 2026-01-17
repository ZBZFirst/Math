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

// Adjust the current guess - NO RESTRICTIONS
function adjustGuess(delta) {
    if (!currentProblem || currentProblem.finished) return;
    
    const newGuess = currentGuess + delta;
    
    // Allow any digit from 0-9 (single digit only)
    if (newGuess >= 0 && newGuess <= 9) {
        currentGuess = newGuess;
        updateGuessDisplay();
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

// Show feedback message with type
function showFeedback(message, type = 'error') {
    const feedbackArea = document.querySelector('.number-buttons-container');
    if (feedbackArea) {
        // Remove any existing feedback
        const existingFeedback = feedbackArea.querySelector('.feedback-message');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedbackMsg = document.createElement('div');
        feedbackMsg.className = `feedback-message feedback-${type}`;
        feedbackMsg.textContent = message;
        
        feedbackArea.appendChild(feedbackMsg);
        
        // Auto-remove after appropriate time
        const removeTime = type === 'error' ? 4000 : 3000;
        setTimeout(() => {
            if (feedbackMsg.parentNode) {
                feedbackMsg.remove();
            }
        }, removeTime);
    }
}

// Clear feedback
function clearFeedback() {
    const feedbackMsg = document.querySelector('.feedback-message');
    if (feedbackMsg) {
        feedbackMsg.remove();
    }
}

// Commit the current guess as the next quotient digit
function commitGuess() {
    if (!currentProblem || currentProblem.finished) return;
    
    const p = currentProblem;
    
    // Calculate the CORRECT digit for this step
    const correctDigit = Math.floor(p.partial / p.divisor);
    const product = currentGuess * p.divisor;
    
    // Check if guess is mathematically valid (product <= partial)
    if (product > p.partial) {
        mistakeCount++;
        currentStreak = 0;
        showFeedback(`Cannot multiply ${p.divisor} × ${currentGuess} = ${product} because it's greater than ${p.partial}. Try a smaller digit.`, 'error');
        updateScoreDisplay();
        return;
    }
    
    // Check if guess equals the correct digit
    if (currentGuess === correctDigit) {
        // CORRECT! Create step record
        const step = {
            digit: currentGuess,
            partialBefore: p.partial,
            product: product,
            subtraction: p.partial - product,
            broughtDown: null,
            isCorrect: true
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
            
            showFeedback(`Correct! ${p.divisor} × ${currentGuess} = ${product}. ${step.partialBefore} - ${product} = ${step.subtraction}. Bringing down ${nextDigit} gives ${step.subtraction}${nextDigit}.`, 'success');
        } else {
            p.finished = true;
            // Problem completed successfully
            solvedCount++;
            currentStreak++;
            showFeedback(`Perfect! ${p.dividend} ÷ ${p.divisor} = ${p.quotientDigits.join('').replace(/^0+/, '') || '0'} remainder ${step.subtraction}`, 'success');
            updateScoreDisplay();
        }
        
        currentGuess = 0;
        renderWorkArea();
        renderNumberButtons();
        
    } else {
        // INCORRECT - but mathematically valid (product <= partial)
        mistakeCount++;
        currentStreak = 0;
        
        showFeedback(`Incorrect. ${p.partial} ÷ ${p.divisor} = ${correctDigit}, not ${currentGuess}. The calculation ${p.divisor} × ${currentGuess} = ${product} is valid, but ${correctDigit} would give ${p.divisor} × ${correctDigit} = ${correctDigit * p.divisor}. Try again.`, 'error');
        
        updateScoreDisplay();
        
        // Clear guess but don't progress
        currentGuess = 0;
        updateGuessDisplay();
    }
}

function renderWorkArea() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    
    // Display the problem
    displayProblem();
    
    // Generate clean HTML long division
    const divisionHTML = generateCleanDivisionHTML(p);
    
    // Display in work area
    workStageContainer.innerHTML = `
        <div class="clean-long-division">
            ${divisionHTML}
        </div>
    `;
}

// Generate clean HTML for long division
function generateCleanDivisionHTML(p) {
    let html = '';
    
    // Step 1: Show quotient at top (if any digits have been revealed)
    if (p.quotientDigits.length > 0) {
        const quotient = p.quotientDigits.join('');
        html += `<div class="quotient-line">${quotient}</div>`;
    }
    
    // Step 2: Create the division symbol
    html += `<div class="division-setup">`;
    html += `<span class="divisor">${p.divisor}</span>`;
    html += `<span class="division-symbol">)</span>`;
    html += `<span class="dividend">${p.dividend}</span>`;
    html += `</div>`;
    
    // Step 3: Show completed steps
    for (let i = 0; i < p.steps.length; i++) {
        const step = p.steps[i];
        
        // Create a step container
        html += `<div class="division-step step-${i}">`;
        
        // Show the subtraction line
        const indent = i * 20; // pixels of indentation
        html += `<div class="subtraction-line" style="margin-left: ${indent}px">`;
        html += `<span class="minus">-</span>`;
        html += `<span class="product">${step.product}</span>`;
        html += `</div>`;
        
        // Show the horizontal bar
        const barLength = Math.max(
            step.product.toString().length + 1,
            step.subtraction.toString().length
        );
        html += `<div class="horizontal-bar" style="margin-left: ${indent}px; width: ${barLength * 0.8}em">`;
        html += `――`;
        html += `</div>`;
        
        // Show the remainder
        html += `<div class="remainder" style="margin-left: ${indent}px">`;
        html += `${step.subtraction}`;
        
        // If bringing down next digit
        if (step.broughtDown !== null) {
            html += `<span class="brought-down">${step.broughtDown}</span>`;
        }
        html += `</div>`;
        
        html += `</div>`; // Close division-step
    }
    
    // Step 4: If not finished, show current working number
    if (!p.finished && p.partial > 0) {
        html += `<div class="current-step">`;
        html += `<div class="current-label">Currently working with:</div>`;
        html += `<div class="current-number">${p.partial}</div>`;
        html += `<div class="current-question">How many times does ${p.divisor} go into ${p.partial}?</div>`;
        html += `</div>`;
    }
    
    // Step 5: If finished, show final answer
    if (p.finished && p.steps.length > 0) {
        const lastStep = p.steps[p.steps.length - 1];
        const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
        
        html += `<div class="final-answer">`;
        html += `<div class="answer-line">${p.dividend} ÷ ${p.divisor} = ${quotient} remainder ${lastStep.subtraction}</div>`;
        html += `</div>`;
    }
    
    return html;
}

// Generate MathJax code with revealed steps
function generateMathJaxDivision(p) {
    const quotient = p.quotientDigits.join('').replace(/^0+/, '') || '0';
    const dividendStr = p.dividend.toString();
    const divisorStr = p.divisor.toString();
    
    // Start building the LaTeX
    let latex = '\\[';
    
    // Build step by step based on what's been revealed
    if (p.steps.length === 0) {
        // Stage 0: Just show the setup
        latex += `\\begin{array}{r}
\\ph{${quotient}} \\\\
${divisorStr}\\big)\\overline{\\ph{${dividendStr}}}
\\end{array}`;
    } else {
        // We have some steps - build them
        latex += `\\begin{array}{r}`;
        
        // Quotient (revealed digits)
        const revealedQuotient = p.quotientDigits.slice(0, p.steps.length).join('');
        const hiddenQuotient = '\\ph{' + '0'.repeat(p.digits.length - p.steps.length) + '}';
        latex += `${revealedQuotient}${hiddenQuotient} \\\\`;
        latex += `\\hline`;
        latex += `${divisorStr}\\big)\\overline{${dividendStr}} \\\\`;
        
        // Add each revealed step
        for (let i = 0; i < p.steps.length; i++) {
            const step = p.steps[i];
            
            if (i === 0) {
                // First step: first digit of dividend
                const firstDigit = dividendStr[0];
                const indent = ' '.repeat(i * 2);
                latex += `\\ph{${divisorStr}}\\big)\\underline{${indent}${step.product}} \\\\`;
                latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}${step.subtraction}} \\\\`;
                
                if (step.broughtDown !== null) {
                    latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}${step.subtraction}${step.broughtDown}} \\\\`;
                }
            } else {
                // Subsequent steps
                const indent = ' '.repeat(i * 2);
                const workingNum = step.partialBefore;
                latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}${workingNum}} \\\\`;
                latex += `\\ph{${divisorStr}}\\big)\\underline{${indent}${step.product}} \\\\`;
                latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}${step.subtraction}} \\\\`;
                
                if (step.broughtDown !== null) {
                    latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}${step.subtraction}${step.broughtDown}} \\\\`;
                }
            }
        }
        
        // If finished, show remainder
        if (p.finished) {
            const lastStep = p.steps[p.steps.length - 1];
            const indent = ' '.repeat(p.steps.length * 2);
            latex += `\\ph{${divisorStr}}\\big)\\underline{${indent}${lastStep.product}} \\\\`;
            latex += `\\ph{${divisorStr}}\\big)\\overline{${indent}\\color{red}{${lastStep.subtraction}}} \\\\`;
        }
        
        latex += `\\end{array}`;
    }
    
    latex += '\\]';
    return latex;
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
