// division.js

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

// Color constants matching your scheme
const COLORS = {
    BLUE: 'blue',     // divisor
    ORANGE: 'orange', // dividend digits
    YELLOW: 'yellow', // deterministic values
    PINK: 'pink',     // user input
    GREEN: 'green'    // answer
};

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
    const digits = String(dividend).split('').map(Number);
    const n = digits.length;
    
    currentProblem = {
        dividend: dividend,
        divisor: divisor,
        digits: digits,
        n: n, // number of digits
        stepIndex: 0,
        partial: 0,
        quotientDigits: [],
        steps: [], // Array to store each step for display
        finished: false,
        // Grid state
        workGrid: createEmptyWorkGrid(n),
        answerGrid: createEmptyAnswerGrid(n)
    };
    
    // Initialize grid with deterministic values
    initializeDeterministicGrid(currentProblem);
    
    // Initialize with first digit
    currentProblem.partial = digits[0];
    currentGuess = 0;
    renderWorkArea();
    renderNumberButtons();
    clearFeedback();
}

// Create empty work grid with 2n + 3 rows
function createEmptyWorkGrid(n) {
    const rows = 2 * n + 3;
    const cols = n;
    const grid = [];
    
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            grid[row][col] = {
                value: '',
                color: '',
                isDeterministic: false,
                isUserInput: false,
                isAnswer: false,
                colSpan: 1
            };
        }
    }
    
    return grid;
}

// Create empty answer grid with n + 2 columns
function createEmptyAnswerGrid(n) {
    const cols = n + 2; // n quotient digits + "R" + remainder
    const grid = [];
    
    // Answer grid has only 1 row
    grid[0] = [];
    for (let col = 0; col < cols; col++) {
        grid[0][col] = {
            value: '',
            color: COLORS.GREEN,
            isDeterministic: true,
            isAnswer: true
        };
    }
    
    return grid;
}

// Initialize deterministic cells in work grid
function initializeDeterministicGrid(problem) {
    const { workGrid, answerGrid, n, digits, divisor } = problem;
    
    // Row calculations
    const totalRows = 2 * n + 3;
    
    // Step 1: Original dividend (Orange - row 0)
    for (let col = 0; col < n; col++) {
        workGrid[0][col] = {
            value: digits[col],
            color: COLORS.ORANGE,
            isDeterministic: true
        };
    }
    
    // Step 2: Placeholder for quotient digits in answer grid
    for (let col = 0; col < n; col++) {
        answerGrid[0][col] = {
            value: '?',
            color: COLORS.GREEN,
            isDeterministic: false,
            isAnswer: true
        };
    }
    
    // "R" in answer grid
    answerGrid[0][n] = {
        value: 'R',
        color: COLORS.GREEN,
        isDeterministic: true,
        isAnswer: true
    };
    
    // Remainder placeholder
    answerGrid[0][n + 1] = {
        value: '?',
        color: COLORS.GREEN,
        isDeterministic: false,
        isAnswer: true
    };
    
    // Step 3: Deterministic intermediate rows (Yellow)
    // These will be populated as the user progresses
    // The pattern: rows 2, 4, 6... up to 2n-2 are deterministic
    
    for (let digitIdx = 1; digitIdx < n; digitIdx++) {
        const deterministicRow = 2 * digitIdx;
        workGrid[deterministicRow][digitIdx] = {
            value: '', // Will be filled when brought down
            color: COLORS.YELLOW,
            isDeterministic: true
        };
    }
    
    // Step 4: Final remainder rows (last 3 rows)
    const remainderRow = totalRows - 3; // Row 2n
    const validationRow = totalRows - 2; // Row 2n + 1
    const answerBaselineRow = totalRows - 1; // Row 2n + 2
    
    // Remainder formation
    workGrid[remainderRow][n - 1] = {
        value: '', // Will be final remainder
        color: COLORS.YELLOW,
        isDeterministic: true
    };
    
    // Remainder validation
    workGrid[validationRow][n - 1] = {
        value: '', // User inputs final check
        color: COLORS.PINK,
        isDeterministic: false,
        isUserInput: true
    };
    
    // Answer baseline (empty row for visual alignment)
    // This row stays empty
    
    return workGrid;
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
            isCorrect: true,
            stepIndex: p.stepIndex,
            rowIndex: p.stepIndex * 2 // Each step takes 2 rows
        };
        
        p.quotientDigits.push(currentGuess);
        p.steps.push(step);
        
        // Update the grid with this step
        updateGridWithStep(p, step);
        
        // Update partial
        p.partial = step.subtraction;
        
        // Bring down next digit if available
        if (p.stepIndex < p.digits.length - 1) {
            p.stepIndex++;
            const nextDigit = p.digits[p.stepIndex];
            p.partial = p.partial * 10 + nextDigit;
            step.broughtDown = nextDigit;
            
            // Update grid with brought down digit
            updateGridWithBroughtDownDigit(p, step);
            
            showFeedback(`Correct! ${p.divisor} × ${currentGuess} = ${product}. ${step.partialBefore} - ${product} = ${step.subtraction}. Bringing down ${nextDigit} gives ${step.subtraction}${nextDigit}.`, 'success');
        } else {
            // No more digits to bring down - problem is finished
            p.finished = true;
            completeProblem(p);
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

// Update grid with completed step
function updateGridWithStep(problem, step) {
    const { workGrid, answerGrid, stepIndex } = problem;
    const rowBase = stepIndex * 2; // 0, 2, 4, ...
    
    // 1. Update quotient digit in answer grid
    answerGrid[0][stepIndex].value = step.digit;
    answerGrid[0][stepIndex].isDeterministic = true;
    
    // 2. Update product row (user input - PINK)
    // Product goes in row (rowBase + 1), columns aligned based on partialBefore length
    const partialStr = String(step.partialBefore);
    const startCol = problem.n - partialStr.length + stepIndex;
    
    // Write product digits
    const productStr = String(step.product);
    for (let i = 0; i < productStr.length; i++) {
        const col = startCol + i;
        if (col < problem.n) {
            workGrid[rowBase + 1][col] = {
                value: productStr[i],
                color: COLORS.PINK,
                isDeterministic: false,
                isUserInput: true
            };
        }
    }
    
    // 3. Update subtraction result row (deterministic - YELLOW)
    // This goes in row (rowBase + 2)
    const subtractionStr = String(step.subtraction);
    for (let i = 0; i < subtractionStr.length; i++) {
        const col = startCol + i;
        if (col < problem.n) {
            workGrid[rowBase + 2][col] = {
                value: subtractionStr[i],
                color: COLORS.YELLOW,
                isDeterministic: true
            };
        }
    }
}

// Update grid with brought down digit
function updateGridWithBroughtDownDigit(problem, step) {
    if (!step.broughtDown) return;
    
    const { workGrid, stepIndex } = problem;
    const rowBase = stepIndex * 2; // Next row to fill
    
    // Find where to place the brought down digit
    // It goes in the deterministic row for this step
    workGrid[rowBase][stepIndex] = {
        value: step.broughtDown,
        color: COLORS.YELLOW,
        isDeterministic: true
    };
}

// Complete the problem (all digits processed)
function completeProblem(problem) {
    const lastStep = problem.steps[problem.steps.length - 1];
    
    // Update final remainder in grid
    const remainderRow = 2 * problem.n; // Row 2n
    const remainderStr = String(lastStep.subtraction);
    
    // Place remainder in last columns
    for (let i = 0; i < remainderStr.length; i++) {
        const col = problem.n - remainderStr.length + i;
        problem.workGrid[remainderRow][col] = {
            value: remainderStr[i],
            color: COLORS.YELLOW,
            isDeterministic: true
        };
    }
    
    // Update answer grid remainder
    problem.answerGrid[0][problem.n + 1].value = lastStep.subtraction;
    problem.answerGrid[0][problem.n + 1].isDeterministic = true;
    
    // Problem completed successfully
    solvedCount++;
    currentStreak++;
    showFeedback(`Perfect! ${problem.dividend} ÷ ${problem.divisor} = ${problem.quotientDigits.join('').replace(/^0+/, '') || '0'} remainder ${lastStep.subtraction}`, 'success');
    updateScoreDisplay();
}

// Render the work area with grid layout
function renderWorkArea() {
    if (!currentProblem) return;
    
    const p = currentProblem;
    
    // Display the problem
    displayProblem();
    
    // Generate grid-based HTML
    const gridHTML = generateGridHTML(p);
    
    // Display in work area
    workStageContainer.innerHTML = `
        <div class="grid-long-division">
            ${gridHTML}
        </div>
    `;
}

// Generate HTML for the grid-based layout
function generateGridHTML(problem) {
    const { divisor, workGrid, answerGrid, n } = problem;
    const totalRows = 2 * n + 3;
    
    let html = '<div class="division-grid-wrapper">';
    
    // Add CSS for grid
    html += `<style>
        .division-grid {
            display: grid;
            grid-template-columns: repeat(${n + 1}, 50px);
            grid-template-rows: repeat(${totalRows + 1}, 50px);
            gap: 2px;
            position: relative;
        }
        .grid-cell {
            width: 50px;
            height: 50px;
            border: 2px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
        }
        .blue { background-color: #00a6e6; color: white; }
        .orange { background-color: #ff8c2a; }
        .yellow { background-color: #ffee00; }
        .pink { background-color: #ffb6c1; }
        .green { background-color: #2db84d; color: white; }
        .empty { background-color: transparent; }
        
        .division-symbol {
            position: absolute;
            left: 45px;
            top: 50px;
            width: 5px;
            height: ${(totalRows - 2) * 50}px;
            background: black;
        }
        .division-symbol::before {
            content: "";
            position: absolute;
            top: -5px;
            left: -20px;
            right: 0;
            height: 5px;
            background: black;
        }
    </style>`;
    
    // Start grid container
    html += '<div class="division-grid">';
    
    // Column 0: Divisor column
    html += `<div class="grid-cell blue" style="grid-row: 1 / span ${totalRows};">${divisor}</div>`;
    
    // Columns 1-n: Answer and work grids
    // Row 0: Answer grid
    for (let col = 0; col < n + 2; col++) {
        const cell = answerGrid[0][col];
        html += `<div class="grid-cell ${cell.color}" 
                style="grid-column: ${col + 2}; grid-row: 1;">
                ${cell.value}
            </div>`;
    }
    
    // Rows 1-totalRows: Work grid
    for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < n; col++) {
            const cell = workGrid[row][col];
            const gridRow = row + 2; // +1 for answer row, +1 for 1-indexed grid
            
            if (cell.value !== '' || cell.color !== '') {
                html += `<div class="grid-cell ${cell.color}" 
                        style="grid-column: ${col + 2}; grid-row: ${gridRow};">
                        ${cell.value}
                    </div>`;
            } else {
                // Empty cell (for spacing)
                html += `<div class="grid-cell empty" 
                        style="grid-column: ${col + 2}; grid-row: ${gridRow};">
                    </div>`;
            }
        }
    }
    
    // Division symbol overlay
    html += '<div class="division-symbol"></div>';
    
    html += '</div>'; // Close division-grid
    html += '</div>'; // Close division-grid-wrapper
    
    return html;
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
