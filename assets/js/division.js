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
let solvedCount = parseInt(localStorage.getItem('divisionSolvedCount')) || 0;
let mistakeCount = parseInt(localStorage.getItem('divisionMistakeCount')) || 0;
let currentStreak = parseInt(localStorage.getItem('divisionCurrentStreak')) || 0;

// Long division state
let currentStep = 0;
let currentRemainder = 0;
let currentPosition = 0;
let quotientDigits = [];
let subtractionResults = [];
let currentWorkingNumber = 0;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Division practice initialized');
    updateScoreDisplay();
    generateNewProblem();
    
    // Event listeners
    newProblemBtn.addEventListener('click', generateNewProblem);
    resetProblemBtn.addEventListener('click', resetCurrentProblem);
    resetScoresBtn.addEventListener('click', resetAllScores);
});

// Generate a new division problem
function generateNewProblem() {
    // Generate random divisor (1-99)
    let divisor = Math.floor(Math.random() * 99) + 1;
    
    // Generate random dividend (1-999) that's bigger than divisor
    let dividend;
    do {
        dividend = Math.floor(Math.random() * 999) + 1;
    } while (dividend <= divisor);
    
    // Create problem object
    currentProblem = {
        dividend: dividend,
        divisor: divisor,
        quotient: Math.floor(dividend / divisor),
        remainder: dividend % divisor,
        dividendDigits: dividend.toString().split('').map(Number)
    };
    
    // Reset long division state
    currentStep = 0;
    currentRemainder = 0;
    currentPosition = 0;
    quotientDigits = [];
    subtractionResults = [];
    currentWorkingNumber = 0;
    
    displayProblem();
    startLongDivision();
}

// Display ONLY the equation in the problem container
function displayProblem() {
    if (!currentProblem) return;
    
    const { dividend, divisor } = currentProblem;
    
    // Simple equation display only
    problemDisplay.innerHTML = `
        <div class="equation-display">
            <div class="large-equation">
                ${dividend} ÷ ${divisor} = ?
            </div>
        </div>
    `;
}

// Start the long division process
function startLongDivision() {
    if (!currentProblem) return;
    
    clearWorkArea();
    clearFeedback();
    
    const { dividend, divisor, dividendDigits } = currentProblem;
    
    // Initialize with first digit
    currentWorkingNumber = dividendDigits[0];
    currentPosition = 1;
    
    // Show initial setup
    workStageContainer.innerHTML = `
        <div class="long-division-setup">
            <h4>Long Division Setup</h4>
            <div class="division-layout">
                <div class="division-top">
                    <span class="quotient-space">${'&nbsp;'.repeat(quotientDigits.length * 2)}</span>
                    <span class="quotient-digits">${quotientDigits.join('')}</span>
                </div>
                <div class="division-main">
                    <span class="divisor">${divisor}</span>
                    <span class="division-symbol">⟌</span>
                    <span class="dividend">${dividend}</span>
                </div>
                ${currentStep > 0 ? `
                <div class="division-work">
                    ${renderDivisionWork()}
                </div>
                ` : ''}
            </div>
            
            <div class="current-step">
                <h5>Step ${currentStep + 1}: Start with first digit</h5>
                <p>We start with the first digit of the dividend: <strong>${currentWorkingNumber}</strong></p>
                <p>Ask: How many times does <strong>${divisor}</strong> go into <strong>${currentWorkingNumber}</strong>?</p>
                
                <div class="step-options">
                    <button class="step-btn" onclick="handleDivideStep(0)">0 times (${divisor} > ${currentWorkingNumber})</button>
                    ${generateDivideOptions()}
                </div>
            </div>
        </div>
    `;
}

// Generate options for the divide step
function generateDivideOptions() {
    if (!currentProblem) return '';
    const { divisor } = currentProblem;
    
    let options = '';
    let maxOption = Math.min(9, Math.floor(currentWorkingNumber / divisor));
    
    for (let i = 1; i <= maxOption; i++) {
        options += `<button class="step-btn" onclick="handleDivideStep(${i})">${i} time${i !== 1 ? 's' : ''} (${i} × ${divisor} = ${i * divisor})</button>`;
    }
    
    return options;
}

// Handle the divide step selection
function handleDivideStep(selectedQuotient) {
    if (!currentProblem) return;
    
    const { divisor } = currentProblem;
    const product = selectedQuotient * divisor;
    
    // Store the quotient digit
    quotientDigits.push(selectedQuotient);
    
    // Move to multiply step
    currentStep = 1;
    showMultiplyStep(selectedQuotient, product);
}

// Show multiply step
function showMultiplyStep(quotientDigit, product) {
    if (!currentProblem) return;
    
    const { divisor } = currentProblem;
    
    workStageContainer.innerHTML = `
        <div class="long-division-step">
            <h4>Step ${currentStep + 1}: Multiply</h4>
            
            <div class="division-layout">
                <div class="division-top">
                    <span class="quotient-space">${'&nbsp;'.repeat(quotientDigits.length * 2)}</span>
                    <span class="quotient-digits">${quotientDigits.join('')}</span>
                </div>
                <div class="division-main">
                    <span class="divisor">${divisor}</span>
                    <span class="division-symbol">⟌</span>
                    <span class="dividend">${currentProblem.dividend}</span>
                </div>
                <div class="division-work">
                    ${renderDivisionWork()}
                    <div class="current-subtraction">
                        <span class="subtract-number">${product}</span>
                        <span class="subtract-line"></span>
                    </div>
                </div>
            </div>
            
            <div class="step-instruction">
                <p>You selected: <strong>${quotientDigit}</strong> as the quotient digit</p>
                <p>Now multiply: <strong>${quotientDigit} × ${divisor} = ?</strong></p>
                
                <div class="multiplication-input">
                    <input type="number" id="multiplicationResult" placeholder="Enter product" min="0" max="${quotientDigit * divisor + 10}">
                    <button class="step-btn" onclick="checkMultiplication(${quotientDigit}, ${product})">Check Multiplication</button>
                </div>
            </div>
        </div>
    `;
}

// Check multiplication result
function checkMultiplication(quotientDigit, expectedProduct) {
    const input = document.getElementById('multiplicationResult');
    const userAnswer = parseInt(input.value);
    
    if (userAnswer === expectedProduct) {
        showFeedback('Correct! ✓', true);
        subtractionResults.push(expectedProduct);
        currentStep = 2;
        setTimeout(() => showSubtractStep(quotientDigit, expectedProduct), 1000);
    } else {
        showFeedback(`Incorrect. ${quotientDigit} × ${currentProblem.divisor} = ${expectedProduct}`, false);
        input.value = '';
        input.focus();
    }
}

// Show subtract step
function showSubtractStep(quotientDigit, product) {
    if (!currentProblem) return;
    
    workStageContainer.innerHTML = `
        <div class="long-division-step">
            <h4>Step ${currentStep + 1}: Subtract</h4>
            
            <div class="division-layout">
                ${renderDivisionLayout()}
            </div>
            
            <div class="step-instruction">
                <p>Now subtract: <strong>${currentWorkingNumber} - ${product} = ?</strong></p>
                
                <div class="subtraction-input">
                    <input type="number" id="subtractionResult" placeholder="Enter difference" min="0" max="${currentWorkingNumber}">
                    <button class="step-btn" onclick="checkSubtraction(${currentWorkingNumber}, ${product})">Check Subtraction</button>
                </div>
            </div>
        </div>
    `;
}

// Check subtraction result
function checkSubtraction(minuend, subtrahend) {
    const input = document.getElementById('subtractionResult');
    const userAnswer = parseInt(input.value);
    const expectedDifference = minuend - subtrahend;
    
    if (userAnswer === expectedDifference) {
        showFeedback('Correct! ✓', true);
        currentRemainder = expectedDifference;
        currentStep = 3;
        
        // Check if we have more digits
        if (currentPosition < currentProblem.dividendDigits.length) {
            setTimeout(() => showBringDownStep(), 1000);
        } else {
            setTimeout(() => showFinalAnswer(), 1000);
        }
    } else {
        showFeedback(`Incorrect. ${minuend} - ${subtrahend} = ${expectedDifference}`, false);
        input.value = '';
        input.focus();
    }
}

// Show bring down step
function showBringDownStep() {
    if (!currentProblem) return;
    
    const nextDigit = currentProblem.dividendDigits[currentPosition];
    const newWorkingNumber = parseInt(currentRemainder.toString() + nextDigit.toString());
    
    workStageContainer.innerHTML = `
        <div class="long-division-step">
            <h4>Step ${currentStep + 1}: Bring Down</h4>
            
            <div class="division-layout">
                ${renderDivisionLayout()}
                <div class="bring-down-indicator">
                    ↓ Bringing down ${nextDigit}
                </div>
            </div>
            
            <div class="step-instruction">
                <p>Bring down the next digit: <strong>${nextDigit}</strong></p>
                <p>New number to work with: <strong>${currentRemainder}${nextDigit} = ${newWorkingNumber}</strong></p>
                
                <button class="step-btn" onclick="continueDivision(${newWorkingNumber})">Continue to Next Digit</button>
            </div>
        </div>
    `;
}

// Continue with next digit
function continueDivision(newWorkingNumber) {
    currentWorkingNumber = newWorkingNumber;
    currentPosition++;
    currentStep = 0;
    
    workStageContainer.innerHTML = `
        <div class="long-division-step">
            <h4>Continue Division</h4>
            
            <div class="division-layout">
                ${renderDivisionLayout()}
            </div>
            
            <div class="step-instruction">
                <p>Now working with: <strong>${currentWorkingNumber}</strong></p>
                <p>Ask: How many times does <strong>${currentProblem.divisor}</strong> go into <strong>${currentWorkingNumber}</strong>?</p>
                
                <div class="step-options">
                    ${generateDivideOptions()}
                </div>
            </div>
        </div>
    `;
}

// Show final answer
function showFinalAnswer() {
    if (!currentProblem) return;
    
    const { quotient, remainder } = currentProblem;
    const quotientString = quotientDigits.join('');
    
    workStageContainer.innerHTML = `
        <div class="final-answer">
            <h4>Division Complete! ✓</h4>
            
            <div class="division-layout final">
                ${renderDivisionLayout()}
            </div>
            
            <div class="answer-summary">
                <div class="answer-box">
                    <h5>Your Answer:</h5>
                    <div class="final-equation">
                        ${currentProblem.dividend} ÷ ${currentProblem.divisor} = 
                        <span class="quotient-final">${quotientString}</span>
                        <span class="remainder-final">R ${currentRemainder}</span>
                    </div>
                </div>
                
                <div class="correct-answer-box">
                    <h5>Correct Answer:</h5>
                    <div class="final-equation">
                        ${currentProblem.dividend} ÷ ${currentProblem.divisor} = 
                        <span class="quotient-final">${quotient}</span>
                        <span class="remainder-final">R ${remainder}</span>
                    </div>
                </div>
                
                <div class="comparison">
                    ${quotientString == quotient && currentRemainder == remainder ? 
                        '<p class="correct-message">✓ Perfect! Your answer is correct!</p>' :
                        '<p class="incorrect-message">✗ Not quite right. Keep practicing!</p>'
                    }
                </div>
                
                <button class="step-btn primary-btn" onclick="completeProblem(${quotientString == quotient && currentRemainder == remainder})">
                    ${quotientString == quotient && currentRemainder == remainder ? 'Great Job! Try Another' : 'Try Again'}
                </button>
            </div>
        </div>
    `;
}

// Complete the problem
function completeProblem(isCorrect) {
    if (isCorrect) {
        solvedCount++;
        currentStreak++;
        showFeedback('Correct answer! Well done!', true);
    } else {
        mistakeCount++;
        currentStreak = 0;
        showFeedback('Incorrect answer. Try another problem!', false);
    }
    
    updateScoreDisplay();
    setTimeout(() => generateNewProblem(), 2000);
}

// Helper functions
function renderDivisionWork() {
    if (!currentProblem || quotientDigits.length === 0) return '';
    
    let workHTML = '';
    for (let i = 0; i < quotientDigits.length; i++) {
        workHTML += `
            <div class="work-step">
                <div class="product">${subtractionResults[i] || ''}</div>
                <div class="subtract-line"></div>
            </div>
        `;
    }
    return workHTML;
}

function renderDivisionLayout() {
    if (!currentProblem) return '';
    
    const { dividend, divisor } = currentProblem;
    return `
        <div class="division-top">
            <span class="quotient-space">${'&nbsp;'.repeat(quotientDigits.length * 2)}</span>
            <span class="quotient-digits">${quotientDigits.join('')}</span>
        </div>
        <div class="division-main">
            <span class="divisor">${divisor}</span>
            <span class="division-symbol">⟌</span>
            <span class="dividend">${dividend}</span>
        </div>
        ${renderDivisionWork()}
    `;
}

// Clear the work area
function clearWorkArea() {
    workStageContainer.innerHTML = '';
}

// Clear feedback
function clearFeedback() {
    workFeedback.innerHTML = '';
    workFeedback.className = 'work-feedback';
}

// Show feedback
function showFeedback(message, isCorrect) {
    workFeedback.innerHTML = message;
    workFeedback.className = `work-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    
    if (!isCorrect) {
        workFeedback.classList.add('shake');
        setTimeout(() => workFeedback.classList.remove('shake'), 500);
    }
}

// Reset current problem
function resetCurrentProblem() {
    if (currentProblem) {
        // Reset long division state
        currentStep = 0;
        currentRemainder = 0;
        currentPosition = 0;
        quotientDigits = [];
        subtractionResults = [];
        currentWorkingNumber = 0;
        
        displayProblem();
        startLongDivision();
        clearFeedback();
    }
}

// Update score display
function updateScoreDisplay() {
    solvedCountEl.textContent = solvedCount;
    mistakeCountEl.textContent = mistakeCount;
    
    const total = solvedCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
    divisionAccuracyEl.textContent = `${accuracy}%`;
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
