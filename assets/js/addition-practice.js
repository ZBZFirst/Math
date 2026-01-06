// Addition Practice with Dual Container System

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones'; // Start with ones column
    let columns = ['ones', 'tens', 'hundreds', 'thousands'];
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
                thousands: 0, // Will be filled if needed
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
        userAnswers = {};
        correctAnswers = {};
        currentColumn = 'ones';
        
        // Calculate column problems
        calculateColumnProblems();
        
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
        
        columns.forEach(column => {
            const digit1 = num1Digits[column] || 0;
            const digit2 = num2Digits[column] || 0;
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
                correct: null
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
                           col.column === 'hundreds' ? 1 : 0;
            
            // Show carries in row 0
            if (col.carry > 0 && colIndex > 0) {
                gridData[0][colIndex].value = col.carry;
                gridData[0][colIndex].class += ' active-carry';
                
                // Strikethrough if used
                if (col.answered) {
                    gridData[0][colIndex].class += ' used-carry';
                }
            }
            
            // Show answers in row 4
            if (col.answered) {
                gridData[4][colIndex].value = col.result;
                gridData[4][colIndex].class += col.correct ? ' correct' : ' incorrect';
            } else {
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
    
    // Render sub-problem container
    function renderSubProblem() {
        subProblemDiv.innerHTML = '';
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        // Create sub-problem grid (3 rows: carry, numbers, answer)
        const subGrid = document.createElement('div');
        subGrid.className = 'sub-problem-grid';
        
        // Row 0: Carry (if any)
        const carryRow = document.createElement('div');
        carryRow.className = 'sub-row carry-row';
        const carryCell = document.createElement('div');
        carryCell.className = 'sub-cell';
        carryCell.textContent = currentColData.carry > 0 ? currentColData.carry : '';
        carryRow.appendChild(carryCell);
        subGrid.appendChild(carryRow);
        
        // Row 1: Numbers with plus sign
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-row numbers-row';
        
        const num1Cell = document.createElement('div');
        num1Cell.className = 'sub-cell';
        num1Cell.textContent = currentColData.digit1;
        numbersRow.appendChild(num1Cell);
        
        const plusCell = document.createElement('div');
        plusCell.className = 'sub-cell plus-cell';
        plusCell.textContent = '+';
        numbersRow.appendChild(plusCell);
        
        const num2Cell = document.createElement('div');
        num2Cell.className = 'sub-cell';
        num2Cell.textContent = currentColData.digit2;
        numbersRow.appendChild(num2Cell);
        
        subGrid.appendChild(numbersRow);
        
        // Row 2: Line
        const lineRow = document.createElement('div');
        lineRow.className = 'sub-row line-row';
        const lineCell = document.createElement('div');
        lineCell.className = 'sub-cell line-cell';
        lineCell.textContent = '';
        lineRow.appendChild(lineCell);
        subGrid.appendChild(lineRow);
        
        // Row 3: Answer (if answered)
        const answerRow = document.createElement('div');
        answerRow.className = 'sub-row answer-row';
        const answerCell = document.createElement('div');
        answerCell.className = 'sub-cell answer-cell';
        
        if (currentColData.answered) {
            answerCell.textContent = currentColData.sum;
            answerCell.classList.add(currentColData.correct ? 'correct' : 'incorrect');
        } else {
            answerCell.textContent = '?';
        }
        
        answerRow.appendChild(answerCell);
        subGrid.appendChild(answerRow);
        
        subProblemDiv.appendChild(subGrid);
        
        // Update instructions
        const instructions = document.createElement('div');
        instructions.className = 'sub-instructions';
        instructions.innerHTML = `
            <p><strong>Step:</strong> Add the ${currentColumn} column</p>
            <p>${currentColData.digit1} + ${currentColData.digit2}${currentColData.carry > 0 ? ' + ' + currentColData.carry + ' (carry)' : ''}</p>
            <p>Enter the total sum below:</p>
        `;
        subProblemDiv.appendChild(instructions);
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
            
            showSubFeedback(`✓ Correct! ${currentColData.digit1} + ${currentColData.digit2}${currentColData.carry > 0 ? ' + ' + currentColData.carry : ''} = ${currentColData.sum}`, 'correct');
            
            // If sum >= 10, there's a carry
            if (currentColData.sum >= 10) {
                const nextColumn = getNextColumn();
                if (nextColumn) {
                    showSubFeedback(`✓ Write ${currentColData.result} below, carry ${currentColData.nextCarry} to ${nextColumn} column`, 'correct');
                }
            }
            
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
        } else {
            scores.incorrect++;
            currentColData.answered = true;
            currentColData.correct = false;
            
            showSubFeedback(`✗ Incorrect. ${currentColData.digit1} + ${currentColData.digit2}${currentColData.carry > 0 ? ' + ' + currentColData.carry : ''} = ${currentColData.sum}`, 'incorrect');
            
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
    
    // Show feedback in main area
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
    }
    
    // Show feedback in sub-problem area
    function showSubFeedback(message, type) {
        subFeedbackDiv.textContent = message;
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
