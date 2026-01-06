// Addition Practice with Dual Container System - FIXED

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones'; // Start with ones column
    let columns = ['ones', 'tens', 'hundreds']; // Start with three, add thousands if needed
    let userAnswers = {};
    let correctAnswers = {};
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
    
    // Generate a new addition problem (0-399)
    function generateProblem() {
        const num1 = Math.floor(Math.random() * 400); // 0-399
        const num2 = Math.floor(Math.random() * 400); // 0-399
        const answer = num1 + num2;
        
        // Convert to individual digits [hundreds, tens, ones]
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
            columns: [],
            visibleCarries: {} // Track which carries are visible
        };
        
        // Reset state
        userAnswers = {};
        correctAnswers = {};
        currentColumn = 'ones';
        columns = ['ones', 'tens', 'hundreds']; // Reset columns
        
        // Calculate column problems
        calculateColumnProblems();
        
        // Add thousands column if needed (only if there's a carry)
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
                correct: null
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
    
    // Render main problem grid
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits, columns: colData } = currentProblem;
        
        // Grid structure: 5 rows × 4 columns
        // Columns: Plus Sign | Hundreds | Tens | Ones
        // Rows: Carry | Number 1 | Number 2 | Line | Answer
        
        const gridData = [
            // Row 0: Carry Row
            [
                { value: '', class: 'plus-column' }, // Thousands carry
                { value: '', class: 'carry-cell' },  // Hundreds carry
                { value: '', class: 'carry-cell' },  // Tens carry  
                { value: '', class: 'carry-cell' }   // Ones carry
            ],
            // Row 1: First Number Row
            [
                { value: '+', class: 'plus-column' },
                { value: num1Digits.hundreds, class: 'number-cell' }, // Hundreds
                { value: num1Digits.tens, class: 'number-cell' },     // Tens
                { value: num1Digits.ones, class: 'number-cell' }      // Ones
            ],
            // Row 2: Second Number Row  
            [
                { value: '', class: 'plus-column' },
                { value: num2Digits.hundreds, class: 'number-cell' }, // Hundreds
                { value: num2Digits.tens, class: 'number-cell' },     // Tens
                { value: num2Digits.ones, class: 'number-cell' }      // Ones
            ],
            // Row 3: Horizontal Line
            [
                { value: '', class: 'line' },
                { value: '', class: 'line' },
                { value: '', class: 'line' },
                { value: '', class: 'line' }
            ],
            // Row 4: Answer Row
            [
                { value: '', class: 'plus-column answer-cell', column: 'thousands' },
                { value: '', class: 'answer-cell', column: 'hundreds' },
                { value: '', class: 'answer-cell', column: 'tens' },
                { value: '', class: 'answer-cell', column: 'ones' }
            ]
        ];
        
        // Fill in carries and answers
        colData.forEach(col => {
            const colIndex = col.column === 'ones' ? 3 : 
                           col.column === 'tens' ? 2 : 
                           col.column === 'hundreds' ? 1 : 
                           col.column === 'thousands' ? 0 : -1;
            
            // Show carries in row 0 (only if they should be visible)
            if (col.carry > 0 && colIndex >= 0 && col.carryVisible) {
                gridData[0][colIndex].value = col.carry;
                gridData[0][colIndex].class += ' active-carry';
                
                // Strikethrough if used (answered)
                if (col.answered) {
                    gridData[0][colIndex].class += ' used-carry';
                }
            }
            
            // Show answers in row 4
            if (col.answered && colIndex >= 0) {
                gridData[4][colIndex].value = col.result;
                gridData[4][colIndex].class += col.correct ? ' correct' : ' incorrect';
            } else if (colIndex >= 0) {
                gridData[4][colIndex].value = '_';
            }
        });
        
        // Create and populate grid
        gridData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellEl = document.createElement('div');
                cellEl.className = `grid-cell ${cell.class}`;
                
                // Add strikethrough for used carries
                if (cell.class.includes('used-carry')) {
                    const span = document.createElement('span');
                    span.textContent = cell.value;
                    span.style.textDecoration = 'line-through';
                    span.style.opacity = '0.6';
                    cellEl.appendChild(span);
                } else {
                    cellEl.textContent = cell.value;
                }
                
                // Highlight current column
                if (cell.column === currentColumn) {
                    if (rowIndex === 1 || rowIndex === 2 || rowIndex === 4) {
                        cellEl.classList.add('active-column');
                    }
                }
                
                problemGrid.appendChild(cellEl);
            });
        });
    }
    
    // Render sub-problem container (side-by-side layout)
    function renderSubProblem() {
        subProblemDiv.innerHTML = '';
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) {
            // No more columns to solve
            const completeMsg = document.createElement('div');
            completeMsg.className = 'sub-complete';
            completeMsg.innerHTML = `
                <h4>🎉 Problem Complete!</h4>
                <p>${currentProblem.num1} + ${currentProblem.num2} = ${currentProblem.answer}</p>
                <p>All columns solved correctly!</p>
            `;
            subProblemDiv.appendChild(completeMsg);
            return;
        }
        
        // Don't ask 0+0 questions (for thousands place when it's just a carry)
        if (currentColData.digit1 === 0 && currentColData.digit2 === 0 && currentColData.carry === 0) {
            // Skip to next column or mark as complete
            nextColumn();
            return;
        }
        
        // Create sub-problem in side-by-side layout
        const subProblemContainer = document.createElement('div');
        subProblemContainer.className = 'sub-problem-container-inner';
        
        // Create the addition problem display
        const problemDisplay = document.createElement('div');
        problemDisplay.className = 'sub-problem-display';
        
        // Row 1: Numbers with plus sign (side-by-side)
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-numbers-row';
        
        // If there's a carry, show it
        if (currentColData.carry > 0) {
            const carryDiv = document.createElement('div');
            carryDiv.className = 'sub-carry-value';
            carryDiv.textContent = currentColData.carry;
            numbersRow.appendChild(carryDiv);
            
            const plus1 = document.createElement('div');
            plus1.className = 'sub-plus';
            plus1.textContent = '+';
            numbersRow.appendChild(plus1);
        }
        
        const num1Div = document.createElement('div');
        num1Div.className = 'sub-number';
        num1Div.textContent = currentColData.digit1;
        numbersRow.appendChild(num1Div);
        
        const plusDiv = document.createElement('div');
        plusDiv.className = 'sub-plus';
        plusDiv.textContent = '+';
        numbersRow.appendChild(plusDiv);
        
        const num2Div = document.createElement('div');
        num2Div.className = 'sub-number';
        num2Div.textContent = currentColData.digit2;
        numbersRow.appendChild(num2Div);
        
        problemDisplay.appendChild(numbersRow);
        
        // Line
        const lineDiv = document.createElement('div');
        lineDiv.className = 'sub-line';
        problemDisplay.appendChild(lineDiv);
        
        // Answer display (if answered)
        if (currentColData.answered) {
            const answerDiv = document.createElement('div');
            answerDiv.className = `sub-answer ${currentColData.correct ? 'correct' : 'incorrect'}`;
            answerDiv.textContent = currentColData.sum;
            problemDisplay.appendChild(answerDiv);
        } else {
            const answerPlaceholder = document.createElement('div');
            answerPlaceholder.className = 'sub-answer-placeholder';
            answerPlaceholder.textContent = '?';
            problemDisplay.appendChild(answerPlaceholder);
        }
        
        subProblemContainer.appendChild(problemDisplay);
        
        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'sub-instructions';
        
        let instructionText = `<strong>Add the ${currentColumn} column:</strong><br>`;
        
        if (currentColData.carry > 0) {
            instructionText += `${currentColData.carry} (carry) + ${currentColData.digit1} + ${currentColData.digit2}`;
        } else {
            instructionText += `${currentColData.digit1} + ${currentColData.digit2}`;
        }
        
        instructionText += `<br><em>Enter the total sum below:</em>`;
        
        instructions.innerHTML = instructionText;
        subProblemContainer.appendChild(instructions);
        
        subProblemDiv.appendChild(subProblemContainer);
    }
    
    // Check sub-answer
    function checkSubAnswer() {
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
            
            // Make the carry for the NEXT column visible
            if (currentColData.nextCarry > 0) {
                const nextColumn = getNextColumn();
                if (nextColumn) {
                    const nextColData = currentProblem.columns.find(c => c.column === nextColumn);
                    if (nextColData) {
                        nextColData.carryVisible = true;
                    }
                }
            }
            
            let feedbackMsg = `✓ Correct! `;
            if (currentColData.carry > 0) {
                feedbackMsg += `${currentColData.carry} + `;
            }
            feedbackMsg += `${currentColData.digit1} + ${currentColData.digit2} = ${currentColData.sum}`;
            
            if (currentColData.sum >= 10) {
                const nextColumn = getNextColumn();
                if (nextColumn) {
                    feedbackMsg += `<br>Write ${currentColData.result} below, carry ${currentColData.nextCarry} to ${nextColumn} column`;
                }
            }
            
            showSubFeedback(feedbackMsg, 'correct');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
        } else {
            scores.incorrect++;
            currentColData.answered = true;
            currentColData.correct = false;
            
            let feedbackMsg = `✗ Incorrect. `;
            if (currentColData.carry > 0) {
                feedbackMsg += `${currentColData.carry} + `;
            }
            feedbackMsg += `${currentColData.digit1} + ${currentColData.digit2} = ${currentColData.sum}`;
            
            showSubFeedback(feedbackMsg, 'incorrect');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
        }
        
        updateScoreDisplay();
        renderMainGrid();
        renderSubProblem();
        
        // Check if problem is complete
        if (isProblemComplete()) {
            showFeedback('🎉 Problem solved! Well done!', 'correct');
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
            // No more columns
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
            // Skip 0+0 columns
            if (colData && !colData.answered && !(colData.digit1 === 0 && colData.digit2 === 0 && colData.carry === 0)) {
                return col;
            }
        }
        return null;
    }
    
    // Check if entire problem is complete
    function isProblemComplete() {
        return currentProblem.columns.every(col => col.answered || (col.digit1 === 0 && col.digit2 === 0 && col.carry === 0));
    }
    
    // Show feedback in main area
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
    }
    
    // Show feedback in sub-problem area
    function showSubFeedback(message, type) {
        subFeedbackDiv.innerHTML = message;
        subFeedbackDiv.className = `sub-feedback ${type}`;
    }
    
    // Clear all feedback
    function clearAllFeedback() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
        subFeedbackDiv.textContent = '';
        subFeedbackDiv.className = 'sub-feedback';
    }
    
    // Clear sub-feedback
    function clearSubFeedback() {
        subFeedbackDiv.textContent = '';
        subFeedbackDiv.className = 'sub-feedback';
    }
    
    // Update score display
    function updateScoreDisplay() {
        correctCountEl.textContent = scores.correct;
        incorrectCountEl.textContent = scores.incorrect;
        totalCountEl.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        accuracyRateEl.textContent = `${accuracy}%`;
        
        saveScores();
    }
    
    // Load scores from localStorage
    function loadScores() {
        const saved = localStorage.getItem('additionScores');
        if (saved) {
            scores = JSON.parse(saved);
            updateScoreDisplay();
        }
    }
    
    // Save scores to localStorage
    function saveScores() {
        localStorage.setItem('additionScores', JSON.stringify(scores));
    }
    
    // Reset scores
    function resetScores() {
        if (confirm('Reset all addition practice scores?')) {
            scores = {
                correct: 0,
                incorrect: 0,
                total: 0
            };
            localStorage.removeItem('additionScores');
            updateScoreDisplay();
            generateProblem();
        }
    }
    
    // Event Listeners
    submitSubBtn.addEventListener('click', checkSubAnswer);
    subAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkSubAnswer();
        }
    });
    nextColumnBtn.addEventListener('click', nextColumn);
    newProblemBtn.addEventListener('click', generateProblem);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
});
