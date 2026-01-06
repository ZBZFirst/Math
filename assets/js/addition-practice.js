// Addition Practice with Dual Container System - ANIMATED VERSION

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones'; // Start with ones column
    let columns = ['ones', 'tens', 'hundreds']; // Start with three, add thousands if needed
    let scores = {
        correct: 0,
        incorrect: 0,
        total: 0
    };
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const subProblemDiv = document.getElementById('subProblem');
    const subAnswerInput = document.getElementById('subAnswer');
    const submitSubBtn = document.getElementById('submitSubAnswer');
    const nextColumnBtn = document.getElementById('nextColumn');
    const newProblemBtn = document.getElementById('newProblem');
    const feedbackDiv = document.getElementById('feedback');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const totalCountEl = document.getElementById('totalCount');
    const accuracyRateEl = document.getElementById('accuracyRate');
    const resetScoresBtn = document.getElementById('resetScores');
    
    // ===== CORE FUNCTIONS =====
    
    // Generate a new addition problem (0-399)
    function generateProblem() {
        const num1 = Math.floor(Math.random() * 400);
        const num2 = Math.floor(Math.random() * 400);
        const answer = num1 + num2;
        
        // Convert to individual digits
        const getDigits = (num) => {
            const str = num.toString().padStart(3, '0');
            return {
                hundreds: parseInt(str[0]),
                tens: parseInt(str[1]),
                ones: parseInt(str[2])
            };
        };
        
        const num1Digits = getDigits(num1);
        const num2Digits = getDigits(num2);
        
        currentProblem = {
            num1: num1,
            num2: num2,
            answer: answer,
            num1Digits: num1Digits,
            num2Digits: num2Digits,
            columns: []
        };
        
        // Reset state
        currentColumn = 'ones';
        columns = ['ones', 'tens', 'hundreds'];
        
        // Calculate column problems
        calculateColumnProblems();
        
        // Add thousands column if needed
        const lastColumn = currentProblem.columns[currentProblem.columns.length - 1];
        if (lastColumn && lastColumn.nextCarry > 0) {
            columns.push('thousands');
            currentProblem.columns.push({
                column: 'thousands',
                digit1: 0,
                digit2: 0,
                carry: lastColumn.nextCarry,
                sum: lastColumn.nextCarry,
                result: lastColumn.nextCarry,
                nextCarry: 0,
                answered: false,
                correct: null,
                carryVisible: true // Carry is immediately visible for thousands
            });
        }
        
        // Update display
        renderMainGrid();
        renderSubProblem();
        clearAllFeedback();
        subAnswerInput.value = '';
        subAnswerInput.disabled = false;
        nextColumnBtn.disabled = true;
        subAnswerInput.focus();
    }
    
    // Calculate problems for each column
    function calculateColumnProblems() {
        const { num1Digits, num2Digits } = currentProblem;
        let carry = 0;
        
        ['ones', 'tens', 'hundreds'].forEach(column => {
            const digit1 = num1Digits[column];
            const digit2 = num2Digits[column];
            const sum = digit1 + digit2 + carry;
            const result = sum % 10;
            const nextCarry = Math.floor(sum / 10);
            
            currentProblem.columns.push({
                column: column,
                digit1: digit1,
                digit2: digit2,
                carry: carry,
                sum: sum,
                result: result,
                nextCarry: nextCarry,
                answered: false,
                correct: null,
                carryVisible: false // Carries become visible when generated
            });
            
            carry = nextCarry;
        });
    }
    
    // ===== ANIMATION FUNCTIONS =====
    
    // Create a flying ghost element
    function createGhostElement(value, sourceRect, color, type = 'number') {
        const ghost = document.createElement('div');
        ghost.className = 'flying-ghost';
        ghost.textContent = value;
        ghost.style.color = color;
        ghost.style.borderColor = color;
        ghost.style.backgroundColor = 'white';
        ghost.style.position = 'fixed';
        ghost.style.left = `${sourceRect.left}px`;
        ghost.style.top = `${sourceRect.top}px`;
        ghost.style.width = `${sourceRect.width}px`;
        ghost.style.height = `${sourceRect.height}px`;
        ghost.style.display = 'flex';
        ghost.style.alignItems = 'center';
        ghost.style.justifyContent = 'center';
        ghost.style.fontSize = type === 'carry' ? '1.2rem' : '1.8rem';
        ghost.style.fontWeight = 'bold';
        ghost.style.borderRadius = '4px';
        ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        ghost.style.zIndex = '10000';
        ghost.style.pointerEvents = 'none';
        return ghost;
    }
    
    // Animate element from source to target
    function animateElement(source, target, value, color, type = 'number') {
        if (!source || !target) return Promise.resolve();
        
        return new Promise((resolve) => {
            const sourceRect = source.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            
            // Create ghost element
            const ghost = createGhostElement(value, sourceRect, color, type);
            document.body.appendChild(ghost);
            
            // Calculate animation path
            const deltaX = targetRect.left - sourceRect.left;
            const deltaY = targetRect.top - sourceRect.top;
            
            // Animate
            setTimeout(() => {
                ghost.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.2)`;
                ghost.style.opacity = '0.8';
            }, 50);
            
            // Clean up and resolve
            setTimeout(() => {
                ghost.remove();
                
                // Add drop-in animation to target
                target.classList.add('animate-drop-in');
                setTimeout(() => {
                    target.classList.remove('animate-drop-in');
                }, 500);
                
                resolve();
            }, 850);
        });
    }
    
    // Animate numbers from Main Problem to Current Column
    async function animateToCurrentColumn() {
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        // Wait for sub-problem to render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get all grid cells (5 rows × 4 columns = 20 cells)
        const allGridCells = document.querySelectorAll('.grid-cell');
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        // Get source cells from main grid
        // Row indices: 0=carry, 1=num1, 2=num2, 3=line, 4=answer
        const firstNumCell = allGridCells[columnIndex + 4];  // Row 1
        const secondNumCell = allGridCells[columnIndex + 8]; // Row 2
        
        // Get target elements in sub-problem
        const subNumbers = document.querySelectorAll('.sub-number');
        const subCarry = document.querySelector('.sub-carry-value');
        
        // Animation sequence
        const animations = [];
        
        // Animate carry if present and visible
        if (currentColData.carry > 0 && currentColData.carryVisible) {
            const carryCell = allGridCells[columnIndex]; // Row 0
            if (carryCell && subCarry) {
                animations.push(() => 
                    animateElement(carryCell, subCarry, currentColData.carry, '#ff9800', 'carry')
                );
            }
        }
        
        // Animate first number
        if (firstNumCell && subNumbers[0]) {
            animations.push(() => 
                animateElement(firstNumCell, subNumbers[0], currentColData.digit1, '#2196f3', 'number')
            );
        }
        
        // Animate second number
        if (secondNumCell && subNumbers[1]) {
            animations.push(() => 
                animateElement(secondNumCell, subNumbers[1], currentColData.digit2, '#2196f3', 'number')
            );
        }
        
        // Execute animations sequentially
        for (let i = 0; i < animations.length; i++) {
            await animations[i]();
            await new Promise(resolve => setTimeout(resolve, 200)); // Pause between animations
        }
    }
    
    // Animate answer from Current Column to Main Problem
    async function animateAnswerToMain() {
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData || !currentColData.answered) return;
        
        // Get answer element from sub-problem
        const subAnswer = document.querySelector('.sub-answer.correct') || 
                          document.querySelector('.sub-answer.incorrect');
        if (!subAnswer) return;
        
        // Wait a bit for the answer to be visible
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get all grid cells
        const allGridCells = document.querySelectorAll('.grid-cell');
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        // Find target answer cell (row 4)
        const targetAnswerCell = allGridCells[columnIndex + 16];
        
        // Animate the result digit to main grid
        if (targetAnswerCell) {
            await animateElement(subAnswer, targetAnswerCell, currentColData.result, 
                               currentColData.correct ? '#4caf50' : '#f44336', 'answer');
        }
        
        // If there's a carry to next column, animate it too
        if (currentColData.nextCarry > 0) {
            const nextColumn = getNextColumn();
            if (nextColumn) {
                const nextColumnIndex = nextColumn === 'ones' ? 3 : 
                                      nextColumn === 'tens' ? 2 : 
                                      nextColumn === 'hundreds' ? 1 : -1;
                
                if (nextColumnIndex >= 0) {
                    const carryTargetCell = allGridCells[nextColumnIndex]; // Row 0 for next column
                    
                    // Wait a bit then animate carry
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (carryTargetCell) {
                        // Create a temporary element for the carry animation
                        const tempCarry = document.createElement('div');
                        tempCarry.textContent = currentColData.nextCarry;
                        tempCarry.style.opacity = '0';
                        document.body.appendChild(tempCarry);
                        
                        await animateElement(subAnswer, carryTargetCell, currentColData.nextCarry, '#ff9800', 'carry');
                        
                        tempCarry.remove();
                    }
                }
            }
        }
    }
    
    // Highlight source cells in main problem
    function highlightSourceColumn() {
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        
        // Highlight number cells
        const firstNumCell = allGridCells[columnIndex + 4];
        const secondNumCell = allGridCells[columnIndex + 8];
        
        [firstNumCell, secondNumCell].forEach(cell => {
            if (cell) {
                cell.classList.add('animate-source');
                setTimeout(() => {
                    cell.classList.remove('animate-source');
                }, 1000);
            }
        });
        
        // Highlight carry if visible
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (currentColData && currentColData.carry > 0 && currentColData.carryVisible) {
            const carryCell = allGridCells[columnIndex];
            if (carryCell) {
                carryCell.classList.add('animate-source');
                setTimeout(() => {
                    carryCell.classList.remove('animate-source');
                }, 1000);
            }
        }
    }
    
    // ===== RENDERING FUNCTIONS =====
    
    // Render main problem grid
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits, columns: colData } = currentProblem;
        
        // Create 5 rows × 4 columns grid
        const rows = 5;
        const cols = 4;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Determine cell content based on position
                if (row === 0) { // Carry row
                    cell.className += ' carry-cell';
                    cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : col === 3 ? 'ones' : '';
                    
                    // Add carry value if visible
                    if (cell.dataset.column) {
                        const colDataForThis = colData.find(c => c.column === cell.dataset.column);
                        if (colDataForThis && colDataForThis.carry > 0 && colDataForThis.carryVisible) {
                            cell.textContent = colDataForThis.carry;
                            cell.classList.add('active-carry');
                            
                            // Add strikethrough if used
                            if (colDataForThis.answered) {
                                const span = document.createElement('span');
                                span.textContent = colDataForThis.carry;
                                span.style.textDecoration = 'line-through';
                                span.style.opacity = '0.6';
                                cell.innerHTML = '';
                                cell.appendChild(span);
                            }
                        }
                    }
                }
                else if (row === 1) { // First number row
                    if (col === 0) {
                        cell.className += ' plus-column';
                    } else {
                        cell.className += ' number-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        cell.textContent = cell.dataset.column === 'hundreds' ? num1Digits.hundreds :
                                         cell.dataset.column === 'tens' ? num1Digits.tens : num1Digits.ones;
                    }
                }
                else if (row === 2) { // Second number row
                    if (col === 0) {
                        cell.className += ' plus-column';
                        cell.textContent = '+';
                    } else {
                        cell.className += ' number-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        cell.textContent = cell.dataset.column === 'hundreds' ? num2Digits.hundreds :
                                         cell.dataset.column === 'tens' ? num2Digits.tens : num2Digits.ones;
                    }
                }
                else if (row === 3) { // Line row
                    cell.className += ' line';
                }
                else if (row === 4) { // Answer row
                    if (col === 0) {
                        cell.className += ' plus-column answer-cell';
                    } else {
                        cell.className += ' answer-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        
                        const colDataForThis = colData.find(c => c.column === cell.dataset.column);
                        if (colDataForThis && colDataForThis.answered) {
                            cell.textContent = colDataForThis.result;
                            cell.classList.add(colDataForThis.correct ? 'correct' : 'incorrect');
                        } else {
                            cell.textContent = '_';
                        }
                    }
                }
                
                // Highlight current column
                if ((row === 1 || row === 2 || row === 4) && cell.dataset.column === currentColumn) {
                    cell.classList.add('active-column');
                }
                
                problemGrid.appendChild(cell);
            }
        }
    }
    
    // Render sub-problem container
    async function renderSubProblem() {
        subProblemDiv.innerHTML = '';
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) {
            const completeMsg = document.createElement('div');
            completeMsg.className = 'sub-complete';
            completeMsg.innerHTML = `
                <h4>🎉 Problem Complete!</h4>
                <p>${currentProblem.num1} + ${currentProblem.num2} = ${currentProblem.answer}</p>
            `;
            subProblemDiv.appendChild(completeMsg);
            return;
        }
        
        // Don't ask 0+0 questions
        if (currentColData.digit1 === 0 && currentColData.digit2 === 0 && currentColData.carry === 0) {
            nextColumn();
            return;
        }
        
        // Create sub-problem structure
        const subContainer = document.createElement('div');
        subContainer.className = 'sub-problem-container-inner';
        
        const subDisplay = document.createElement('div');
        subDisplay.className = 'sub-problem-display';
        
        // Numbers row
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-numbers-row';
        
        // Create empty placeholders (will be filled by animations)
        if (currentColData.carry > 0 && currentColData.carryVisible) {
            const carryDiv = document.createElement('div');
            carryDiv.className = 'sub-carry-value';
            carryDiv.textContent = ''; // Will be filled by animation
            numbersRow.appendChild(carryDiv);
            
            const carryPlus = document.createElement('div');
            carryPlus.className = 'sub-plus';
            carryPlus.textContent = '+';
            numbersRow.appendChild(carryPlus);
        }
        
        const num1Div = document.createElement('div');
        num1Div.className = 'sub-number';
        num1Div.textContent = ''; // Will be filled by animation
        numbersRow.appendChild(num1Div);
        
        const plusDiv = document.createElement('div');
        plusDiv.className = 'sub-plus';
        plusDiv.textContent = '+';
        numbersRow.appendChild(plusDiv);
        
        const num2Div = document.createElement('div');
        num2Div.className = 'sub-number';
        num2Div.textContent = ''; // Will be filled by animation
        numbersRow.appendChild(num2Div);
        
        subDisplay.appendChild(numbersRow);
        
        // Line
        const lineDiv = document.createElement('div');
        lineDiv.className = 'sub-line';
        subDisplay.appendChild(lineDiv);
        
        // Answer
        const answerDiv = document.createElement('div');
        answerDiv.className = currentColData.answered ? 
            `sub-answer ${currentColData.correct ? 'correct' : 'incorrect'}` : 
            'sub-answer-placeholder';
        answerDiv.textContent = currentColData.answered ? currentColData.sum : '?';
        subDisplay.appendChild(answerDiv);
        
        subContainer.appendChild(subDisplay);
        
        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'sub-instructions';
        
        let instructionText = `<p><strong>Step:</strong> Add the ${currentColumn} column</p>`;
        if (currentColData.carry > 0 && currentColData.carryVisible) {
            instructionText += `<p>${currentColData.carry} + ${currentColData.digit1} + ${currentColData.digit2}</p>`;
        } else {
            instructionText += `<p>${currentColData.digit1} + ${currentColData.digit2}</p>`;
        }
        instructionText += `<p>Enter the total sum below:</p>`;
        
        instructions.innerHTML = instructionText;
        subContainer.appendChild(instructions);
        
        subProblemDiv.appendChild(subContainer);
        
        // Start animations after a short delay
        setTimeout(async () => {
            highlightSourceColumn();
            await animateToCurrentColumn();
            
            // Fill in the numbers after animations complete
            setTimeout(() => {
                const subNumbers = document.querySelectorAll('.sub-number');
                const subCarry = document.querySelector('.sub-carry-value');
                
                if (subNumbers[0]) {
                    subNumbers[0].textContent = currentColData.digit1;
                    subNumbers[0].classList.add('animate-drop-in');
                }
                if (subNumbers[1]) {
                    subNumbers[1].textContent = currentColData.digit2;
                    subNumbers[1].classList.add('animate-drop-in');
                }
                if (subCarry && currentColData.carry > 0 && currentColData.carryVisible) {
                    subCarry.textContent = currentColData.carry;
                    subCarry.classList.add('animate-drop-in');
                }
                
                // Remove drop-in class after animation
                setTimeout(() => {
                    document.querySelectorAll('.animate-drop-in').forEach(el => {
                        el.classList.remove('animate-drop-in');
                    });
                }, 500);
            }, 300);
        }, 100);
    }
    
    // ===== GAME LOGIC FUNCTIONS =====
    
    // Check sub-answer
    async function checkSubAnswer() {
        const userAnswer = parseInt(subAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            showSubFeedback('Please enter a valid number', 'incorrect');
            return;
        }
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        scores.total++;
        
        if (userAnswer === currentColData.sum) {
            scores.correct++;
            currentColData.answered = true;
            currentColData.correct = true;
            
            // Make carry visible for next column if needed
            if (currentColData.nextCarry > 0) {
                const nextColumn = getNextColumn();
                if (nextColumn) {
                    const nextColData = currentProblem.columns.find(c => c.column === nextColumn);
                    if (nextColData) {
                        nextColData.carryVisible = true;
                    }
                }
            }
            
            showSubFeedback(`✓ Correct! ${currentColData.digit1} + ${currentColData.digit2} = ${currentColData.sum}`, 'correct');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
            // Update answer in sub-problem
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.sum;
                answerDiv.className = 'sub-answer correct';
            }
            
            // Animate answer to main problem
            await animateAnswerToMain();
            
        } else {
            scores.incorrect++;
            currentColData.answered = true;
            currentColData.correct = false;
            
            showSubFeedback(`✗ Incorrect. ${currentColData.digit1} + ${currentColData.digit2} = ${currentColData.sum}`, 'incorrect');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
            // Show correct answer
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.sum;
                answerDiv.className = 'sub-answer incorrect';
            }
        }
        
        updateScoreDisplay();
        
        // Update displays after animations
        setTimeout(() => {
            renderMainGrid();
            renderSubProblem();
        }, 1500);
        
        // Check if problem is complete
        if (isProblemComplete()) {
            setTimeout(() => {
                showFeedback('🎉 Problem solved! Well done!', 'correct');
            }, 2000);
        }
    }
    
    // Move to next column
    function nextColumn() {
        const nextCol = getNextColumn();
        if (nextCol) {
            currentColumn = nextCol;
            subAnswerInput.value = '';
            subAnswerInput.disabled = false;
            nextColumnBtn.disabled = true;
            renderMainGrid();
            renderSubProblem();
            subAnswerInput.focus();
            clearSubFeedback();
        } else {
            showSubFeedback('All columns completed!', 'correct');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = true;
        }
    }
    
    // Get next column that hasn't been answered
    function getNextColumn() {
        const currentIndex = columns.indexOf(currentColumn);
        for (let i = currentIndex + 1; i < columns.length; i++) {
            const col = columns[i];
            const colData = currentProblem.columns.find(c => c.column === col);
            if (colData && !colData.answered) {
                return col;
            }
        }
        return null;
    }
    
    // Check if entire problem is complete
    function isProblemComplete() {
        return currentProblem.columns.every(col => col.answered);
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
    }
    
    function showSubFeedback(message, type) {
        subFeedbackDiv.innerHTML = message;
        subFeedbackDiv.className = `sub-feedback ${type}`;
    }
    
    function clearAllFeedback() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
        subFeedbackDiv.textContent = '';
        subFeedbackDiv.className = 'sub-feedback';
    }
    
    function clearSubFeedback() {
        subFeedbackDiv.textContent = '';
        subFeedbackDiv.className = 'sub-feedback';
    }
    
    function updateScoreDisplay() {
        correctCountEl.textContent = scores.correct;
        incorrectCountEl.textContent = scores.incorrect;
        totalCountEl.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        accuracyRateEl.textContent = `${accuracy}%`;
        
        saveScores();
    }
    
    function loadScores() {
        const saved = localStorage.getItem('additionScores');
        if (saved) {
            scores = JSON.parse(saved);
            updateScoreDisplay();
        }
    }
    
    function saveScores() {
        localStorage.setItem('additionScores', JSON.stringify(scores));
    }
    
    function resetScores() {
        if (confirm('Reset all addition practice scores?')) {
            scores = { correct: 0, incorrect: 0, total: 0 };
            localStorage.removeItem('additionScores');
            updateScoreDisplay();
            generateProblem();
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    submitSubBtn.addEventListener('click', checkSubAnswer);
    subAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkSubAnswer();
    });
    nextColumnBtn.addEventListener('click', nextColumn);
    newProblemBtn.addEventListener('click', generateProblem);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
});
