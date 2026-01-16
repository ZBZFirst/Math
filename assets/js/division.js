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
        remainder: dividend % divisor
    };
    
    displayProblem();
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

// Clear the work area
function clearWorkArea() {
    workStageContainer.innerHTML = '';
}

// Clear feedback
function clearFeedback() {
    workFeedback.innerHTML = '';
    workFeedback.className = 'work-feedback';
}

// Reset current problem
function resetCurrentProblem() {
    if (currentProblem) {
        displayProblem();
        clearWorkArea();
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
