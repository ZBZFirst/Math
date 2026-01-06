// Addition Practice with Simplified Interface
// Answer row serves as input area

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones'; // Start with ones column
    let userAnswers = {
        ones: '',
        tens: '',
        hundreds: '',
        thousands: ''
    };
    let correctAnswers = {};
    let scores = {
        correct: 0,
        incorrect: 0,
        total: 0
    };
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const submitBtn = document.getElementById('submitAnswer');
    const newProblemBtn = document.getElementById('newProblem');
    const feedbackDiv = document.getElementById('feedback');
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
        
        // Calculate answer digits with carries
        const calculateWithCarries = (digits1, digits2) => {
            const onesSum = digits1.ones + digits2.ones;
            const onesResult = onesSum % 10;
            const tensCarry = Math.floor(onesSum / 10);
            
            const tensSum = digits1.tens + digits2.tens + tensCarry;
            const tensResult = tensSum % 10;
            const hundredsCarry = Math.floor(tensSum / 10);
            
            const hundredsSum = digits1.hundreds + digits2.hundreds + hundredsCarry;
            const hundredsResult = hundredsSum % 10;
            const thousandsCarry = Math.floor(hundredsSum / 10);
            
            return {
                ones: { result: onesResult, carry: tensCarry },
                tens: { result: tensResult, carry: hundredsCarry },
                hundreds: { result: hundredsResult, carry: thousandsCarry },
                thousands: { result: thousandsCarry, carry: 0 }
            };
        };
        
        const num1Digits = getDigits(num1);
        const num2Digits = getDigits(num2);
        const answerData = calculateWithCarries(num1Digits, num2Digits);
        
        currentProblem = {
            num1: num1,
            num2: num2,
            answer: answer,
            num1Digits: num1Digits,
            num2Digits: num2Digits,
            answerData: answerData
        };
        
        // Reset user answers
        userAnswers = { ones: '', tens: '', hundreds: '', thousands: '' };
        correctAnswers = {};
        currentColumn = 'ones';
        
        // Update display
        renderProblemGrid();
        clearFeedback();
        
        // Focus on ones input
        setTimeout(() => {
            const onesInput = document.querySelector('.answer-input[data-column="ones"]');
            if (onesInput) onesInput.focus();
        }, 100);
    }
    
    // Render the problem grid with input fields in answer row
    function renderProblemGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits, answerData } = currentProblem;
        
        // Grid structure: 5 rows × 4 columns
        // Columns: Plus Sign | Hundreds | Tens | Ones
        // Rows: Carry | Number 1 | Number 2 | Line | Answer Input
        
        const gridData = [
            // Row 0: Carry Row
            [
                { value: '', class: 'plus-column' }, // Empty plus column
                { value: '', class: 'carry-cell' },  // HP carry
                { value: '', class: 'carry-cell' },  // TP carry  
                { value: '', class: 'carry-cell' }   // OP carry
            ],
            // Row 1: First Number Row
            [
                { value: '+', class: 'plus-column' },
                { value: num1Digits.hundreds, class: 'number-cell' }, // HP
                { value: num1Digits.tens, class: 'number-cell' },     // TP
                { value: num1Digits.ones, class: 'number-cell' }      // OP
            ],
            // Row 2: Second Number Row  
            [
                { value: '', class: 'plus-column' },
                { value: num2Digits.hundreds, class: 'number-cell' }, // HP
                { value: num2Digits.tens, class: 'number-cell' },     // TP
                { value: num2Digits.ones, class: 'number-cell' }      // OP
            ],
            // Row 3: Horizontal Line
            [
                { value: '', class: 'line' },
                { value: '', class: 'line' },
                { value: '', class: 'line' },
                { value: '', class: 'line' }
            ],
            // Row 4: Answer Input Row
            [
                { value: '', class: 'plus-column' },
                { value: '', class: 'answer-input', column: 'hundreds' }, // HP input
                { value: '', class: 'answer-input', column: 'tens' },     // TP input
                { value: '', class: 'answer-input', column: 'ones' }      // OP input
            ]
        ];
        
        // Show carries based on current answers
        if (userAnswers.ones !== '') {
            // If ones is answered, show tens carry if needed
            if (answerData.ones.carry > 0) {
                gridData[0][2].value = answerData.ones.carry; // TP carry
                gridData[0][2].class += ' active-carry';
            }
        }
        
        if (userAnswers.tens !== '') {
            // If tens is answered, show hundreds carry if needed
            if (answerData.tens.carry > 0) {
                gridData[0][1].value = answerData.tens.carry; // HP carry
                gridData[0][1].class += ' active-carry';
            }
        }
        
        if (userAnswers.hundreds !== '') {
            // If hundreds is answered, show thousands if needed
            if (answerData.hundreds.carry > 0) {
                gridData[0][0].value = answerData.hundreds.carry; // Thousands in plus column
                gridData[0][0].class += ' active-carry';
            }
        }
        
        // Create and populate grid
        gridData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellEl = document.createElement('div');
                cellEl.className = `grid-cell ${cell.class}`;
                cellEl.dataset.row = rowIndex;
                cellEl.dataset.col = colIndex;
                
                if (cell.class.includes('answer-input')) {
                    // Create input field
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.className = 'answer-input-field';
                    input.dataset.column = cell.column;
                    input.value = userAnswers[cell.column] || '';
                    input.placeholder = '_';
                    input.min = '0';
                    input.max = '9';
                    
                    // Disable if already answered correctly
                    if (correctAnswers[cell.column]) {
                        input.disabled = true;
                        input.classList.add('correct-input');
                    } else if (cell.column === currentColumn) {
                        input.classList.add('current-input');
                    }
                    
                    // Add event listeners
                    input.addEventListener('input', handleAnswerInput);
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            checkAnswer();
                        }
                    });
                    input.addEventListener('focus', () => {
                        currentColumn = cell.column;
                        highlightCurrentColumn();
                    });
                    
                    cellEl.appendChild(input);
                } else {
                    // Regular cell
                    cellEl.textContent = cell.value;
                    
                    // Highlight active column
                    if (cell.column === currentColumn) {
                        cellEl.classList.add('active-column');
                    }
                }
                
                problemGrid.appendChild(cellEl);
            });
        });
        
        highlightCurrentColumn();
    }
    
    // Handle answer input
    function handleAnswerInput(e) {
        const input = e.target;
        const column = input.dataset.column;
        const value = input.value;
        
        // Only allow single digits
        if (value.length > 1) {
            input.value = value.slice(0, 1);
        }
        
        // Update user answer
        userAnswers[column] = input.value;
        
        // Auto-advance to next column if a digit is entered
        if (input.value !== '' && column !== 'thousands') {
            const columns = ['ones', 'tens', 'hundreds', 'thousands'];
            const currentIndex = columns.indexOf(column);
            if (currentIndex < columns.length - 1) {
                const nextColumn = columns[currentIndex + 1];
                const nextInput = document.querySelector(`.answer-input-field[data-column="${nextColumn}"]`);
                if (nextInput && !correctAnswers[nextColumn]) {
                    currentColumn = nextColumn;
                    nextInput.focus();
                    highlightCurrentColumn();
                }
            }
        }
    }
    
    // Highlight current column
    function highlightCurrentColumn() {
        // Remove all highlights
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('active-column');
        });
        document.querySelectorAll('.answer-input-field').forEach(input => {
            input.classList.remove('current-input');
        });
        
        // Add highlight to current column
        const colIndex = currentColumn === 'hundreds' ? 1 : 
                        currentColumn === 'tens' ? 2 : 
                        currentColumn === 'ones' ? 3 : 0;
        
        if (colIndex > 0) {
            // Highlight number cells
            document.querySelectorAll(`.grid-cell[data-col="${colIndex}"]`).forEach(cell => {
                if (cell.dataset.row === '1' || cell.dataset.row === '2') {
                    cell.classList.add('active-column');
                }
            });
            
            // Highlight input field
            const currentInput = document.querySelector(`.answer-input-field[data-column="${currentColumn}"]`);
            if (currentInput) {
                currentInput.classList.add('current-input');
            }
        }
    }
    
    // Check all answers
    function checkAnswer() {
        const { answerData } = currentProblem;
        let allCorrect = true;
        let anyAnswered = false;
        
        // Check each column
        ['ones', 'tens', 'hundreds', 'thousands'].forEach(column => {
            const userAnswer = userAnswers[column];
            const correctAnswer = answerData[column]?.result || 0;
            
            if (userAnswer !== '') {
                anyAnswered = true;
                if (parseInt(userAnswer) === correctAnswer) {
                    correctAnswers[column] = true;
                } else {
                    allCorrect = false;
                    correctAnswers[column] = false;
                }
            } else if (correctAnswer !== 0) {
                allCorrect = false;
            }
        });
        
        if (!anyAnswered) {
            showFeedback('Please enter at least one digit', 'incorrect');
            return;
        }
        
        scores.total++;
        
        if (allCorrect) {
            scores.correct++;
            showFeedback('✓ Correct! Well done!', 'correct');
            
            // Disable all inputs
            document.querySelectorAll('.answer-input-field').forEach(input => {
                input.disabled = true;
                input.classList.add('correct-input');
            });
            
        } else {
            scores.incorrect++;
            
            // Show which digits are wrong
            const wrongColumns = [];
            ['ones', 'tens', 'hundreds', 'thousands'].forEach(column => {
                if (userAnswers[column] !== '' && !correctAnswers[column]) {
                    wrongColumns.push(column);
                }
            });
            
            if (wrongColumns.length > 0) {
                showFeedback(`✗ Incorrect in ${wrongColumns.join(', ')} column(s)`, 'incorrect');
            } else {
                showFeedback('✗ Incorrect - some columns are missing', 'incorrect');
            }
            
            // Mark incorrect inputs
            document.querySelectorAll('.answer-input-field').forEach(input => {
                const column = input.dataset.column;
                if (userAnswers[column] !== '' && !correctAnswers[column]) {
                    input.classList.add('incorrect-input');
                }
            });
        }
        
        updateScoreDisplay();
        renderProblemGrid(); // Update carries based on answers
    }
    
    // Show feedback
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        
        if (!message.includes('✓') && !message.includes('✗')) {
            setTimeout(clearFeedback, 3000);
        }
    }
    
    // Clear feedback
    function clearFeedback() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
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
    submitBtn.addEventListener('click', checkAnswer);
    newProblemBtn.addEventListener('click', generateProblem);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
});
