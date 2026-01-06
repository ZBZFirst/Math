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
    
    // Render main problem grid - FIXED for carrying cell formatting
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits, columns: colData } = currentProblem;
        
        // Grid structure: 5 rows × 4 columns
        // Columns: Plus Sign | Hundreds | Tens | Ones
        // Rows: Carry | Number 1 | Number 2 | Line | Answer
        
        const gridData = [
            // Row 0: Carry Row
            [
                { value: '', class: 'plus-column' },
                { value: '', class: 'carry-cell' },  // Hundreds carry
                { value: '', class: 'carry-cell' },  // Tens carry  
                { value: '', class: 'carry-cell' }   // Ones carry
            ],
            // Row 1: First Number Row
            [
                { value: '+', class: 'plus-column' },
                { value: num1Digits.hundreds, class: 'number-cell' },
                { value: num1Digits.tens, class: 'number-cell' },
                { value: num1Digits.ones, class: 'number-cell' }
            ],
            // Row 2: Second Number Row  
            [
                { value: '', class: 'plus-column' },
                { value: num2Digits.hundreds, class: 'number-cell' },
                { value: num2Digits.tens, class: 'number-cell' },
                { value: num2Digits.ones, class: 'number-cell' }
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
                { value: '', class: 'plus-column answer-cell' },
                { value: '', class: 'answer-cell' },
                { value: '', class: 'answer-cell' },
                { value: '', class: 'answer-cell' }
            ]
        ];
        
        // Fill in carries and answers
        colData.forEach(col => {
            const colIndex = col.column === 'ones' ? 3 : 
                           col.column === 'tens' ? 2 : 
                           col.column === 'hundreds' ? 1 : -1;
            
            if (colIndex < 0) return; // Skip thousands for now
            
            // Show carries in row 0 (only if they should be visible)
            if (col.carry > 0 && col.carryVisible) {
                gridData[0][colIndex].value = col.carry;
                gridData[0][colIndex].class = 'grid-cell carry-cell active-carry';
            } else if (col.carry > 0) {
                // Carry exists but not visible yet
                gridData[0][colIndex].class = 'grid-cell carry-cell';
            }
            
            // Show answers in row 4
            if (col.answered) {
                gridData[4][colIndex].value = col.result;
                gridData[4][colIndex].class = `grid-cell answer-cell ${col.correct ? 'correct' : 'incorrect'}`;
            } else {
                gridData[4][colIndex].value = '_';
            }
        });
        
        // Highlight current column
        const currentColIndex = currentColumn === 'ones' ? 3 : 
                               currentColumn === 'tens' ? 2 : 
                               currentColumn === 'hundreds' ? 1 : -1;
        
        if (currentColIndex >= 0) {
            gridData[1][currentColIndex].class += ' active-column';
            gridData[2][currentColIndex].class += ' active-column';
            gridData[4][currentColIndex].class += ' active-column';
        }
        
        // Create and populate grid
        gridData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellEl = document.createElement('div');
                cellEl.className = `grid-cell ${cell.class}`;
                
                // Handle carries with strikethrough if they've been used
                if (cell.class.includes('carry-cell') && cell.value !== '') {
                    const colName = colIndex === 3 ? 'ones' : 
                                  colIndex === 2 ? 'tens' : 
                                  'hundreds';
                    const colDataForThis = currentProblem.columns.find(c => c.column === colName);
                    
                    if (colDataForThis && colDataForThis.answered) {
                        // This carry has been used - show strikethrough
                        const span = document.createElement('span');
                        span.textContent = cell.value;
                        span.style.textDecoration = 'line-through';
                        span.style.opacity = '0.6';
                        cellEl.appendChild(span);
                    } else {
                        // Active carry not yet used
                        cellEl.textContent = cell.value;
                    }
                } else {
                    cellEl.textContent = cell.value;
                }
                
                problemGrid.appendChild(cellEl);
            });
        });
        
        // Add thousands column if needed
        const thousandsCol = colData.find(c => c.column === 'thousands');
        if (thousandsCol) {
            // This is a bit more complex - you'd need to restructure the grid
            // For now, we'll just handle up to hundreds
        }
    }
    
    // Render sub-problem container (side-by-side layout)
    // Render sub-problem container (using your existing CSS classes)
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
        
        // Don't ask 0+0 questions
        if (currentColData.digit1 === 0 && currentColData.digit2 === 0 && currentColData.carry === 0) {
            nextColumn();
            return;
        }
        
        // Use your existing CSS structure
        const subContainer = document.createElement('div');
        subContainer.className = 'sub-problem-container-inner';
        
        const subDisplay = document.createElement('div');
        subDisplay.className = 'sub-problem-display';
        
        // Numbers row with side-by-side layout
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-numbers-row';
        
        // Add carry if present
        if (currentColData.carry > 0) {
            const carryDiv = document.createElement('div');
            carryDiv.className = 'sub-carry-value';
            carryDiv.textContent = currentColData.carry;
            numbersRow.appendChild(carryDiv);
            
            const carryPlus = document.createElement('div');
            carryPlus.className = 'sub-plus';
            carryPlus.textContent = '+';
            numbersRow.appendChild(carryPlus);
        }
        
        // First number
        const num1Div = document.createElement('div');
        num1Div.className = 'sub-number';
        num1Div.textContent = currentColData.digit1;
        numbersRow.appendChild(num1Div);
        
        // Main plus sign
        const plusDiv = document.createElement('div');
        plusDiv.className = 'sub-plus';
        plusDiv.textContent = '+';
        numbersRow.appendChild(plusDiv);
        
        // Second number
        const num2Div = document.createElement('div');
        num2Div.className = 'sub-number';
        num2Div.textContent = currentColData.digit2;
        numbersRow.appendChild(num2Div);
        
        subDisplay.appendChild(numbersRow);
        
        // Line
        const lineDiv = document.createElement('div');
        lineDiv.className = 'sub-line';
        subDisplay.appendChild(lineDiv);
        
        // Answer display
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
        
        if (currentColData.carry > 0) {
            instructionText += `<p>${currentColData.carry} + ${currentColData.digit1} + ${currentColData.digit2}</p>`;
        } else {
            instructionText += `<p>${currentColData.digit1} + ${currentColData.digit2}</p>`;
        }
        
        instructionText += `<p>Enter the total sum below:</p>`;
        
        instructions.innerHTML = instructionText;
        subContainer.appendChild(instructions);
        
        subProblemDiv.appendChild(subContainer);
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
