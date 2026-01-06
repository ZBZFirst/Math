// Addition Practice with Traditional Columnar Layout
// Layout: Plus Column | Hundreds | Tens | Ones

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentStep = 0;
    let steps = [];
    let scores = {
        correctSteps: 0,
        incorrectSteps: 0,
        totalSteps: 0,
        problemsSolved: 0
    };
    let carries = {}; // Track carries by column
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const stepList = document.getElementById('stepList');
    const stepDescription = document.getElementById('stepDescription');
    const stepAnswerInput = document.getElementById('stepAnswer');
    const submitStepBtn = document.getElementById('submitStep');
    const nextStepBtn = document.getElementById('nextStep');
    const showAnswerBtn = document.getElementById('showAnswer');
    const newProblemBtn = document.getElementById('newProblem');
    const feedbackDiv = document.getElementById('feedback');
    const correctStepsEl = document.getElementById('correctSteps');
    const incorrectStepsEl = document.getElementById('incorrectSteps');
    const totalStepsEl = document.getElementById('totalSteps');
    const accuracyRateEl = document.getElementById('accuracyRate');
    const problemsSolvedEl = document.getElementById('problemsSolved');
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
        
        currentProblem = {
            num1: num1,
            num2: num2,
            answer: answer,
            num1Digits: getDigits(num1),
            num2Digits: getDigits(num2),
            answerDigits: getDigits(answer)
        };
        
        // Reset steps and carries
        currentStep = 0;
        steps = generateSteps(currentProblem);
        carries = {}; // Clear carries
        
        // Update display
        renderProblemGrid();
        renderStepList();
        updateStepDisplay();
        clearFeedback();
        stepAnswerInput.value = '';
        stepAnswerInput.focus();
        
        // Disable next step button initially
        nextStepBtn.disabled = true;
        showAnswerBtn.disabled = false;
    }
    
    // Generate step-by-step instructions
    function generateSteps(problem) {
        const steps = [];
        const columns = ['ones', 'tens', 'hundreds'];
        let carry = 0;
        let stepNumber = 1;
        
        // Process ones column first, then tens, then hundreds
        columns.forEach(column => {
            const digit1 = problem.num1Digits[column];
            const digit2 = problem.num2Digits[column];
            const columnSum = digit1 + digit2 + carry;
            const columnResult = columnSum % 10;
            const nextCarry = Math.floor(columnSum / 10);
            
            steps.push({
                step: stepNumber++,
                column: column,
                digit1: digit1,
                digit2: digit2,
                carry: carry, // Carry FROM previous column (to use)
                sum: columnSum,
                result: columnResult,
                nextCarry: nextCarry, // Carry TO next column (to show)
                columnIndex: columns.indexOf(column), // 0=ones, 1=tens, 2=hundreds
                description: `Add ${column} column: ${digit1} + ${digit2}${carry > 0 ? ' + ' + carry + ' (carry)' : ''} = ${columnSum}`,
                completed: false,
                correct: null,
                carryUsed: false // Track if carry was used
            });
            
            // Store the next carry for the following column
            if (nextCarry > 0) {
                const nextColumn = columns[columns.indexOf(column) + 1] || 'thousands';
                carries[nextColumn] = {
                    value: nextCarry,
                    from: column,
                    used: false
                };
            }
            
            carry = nextCarry;
        });
        
        // Final step if there's a carry to thousands place
        if (carry > 0) {
            steps.push({
                step: stepNumber,
                column: 'thousands',
                digit1: 0,
                digit2: 0,
                carry: carry,
                sum: carry,
                result: carry,
                nextCarry: 0,
                columnIndex: 3,
                description: `Write final carry: ${carry} (thousands place)`,
                completed: false,
                correct: null,
                carryUsed: false
            });
        }
        
        return steps;
    }
    
    // Render the problem grid according to CSV layout
    function renderProblemGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits } = currentProblem;
        
        // Grid structure: 5 rows × 4 columns
        // Columns: Plus Sign | Hundreds | Tens | Ones
        // Rows: Carry | Number 1 | Number 2 | Line | Answer
        
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
            // Row 4: Answer Row
            [
                { value: '', class: 'plus-column' },
                { value: '_', class: 'answer-cell' }, // HP answer
                { value: '_', class: 'answer-cell' }, // TP answer
                { value: '_', class: 'answer-cell' }  // OP answer
            ]
        ];
        
        // Show all active carries (not used yet)
        Object.keys(carries).forEach(column => {
            const carry = carries[column];
            if (!carry.used) {
                const colIndex = column === 'hundreds' ? 1 : 
                               column === 'tens' ? 2 : 
                               column === 'ones' ? 3 : 0;
                
                if (colIndex > 0) {
                    gridData[0][colIndex].value = carry.value;
                    gridData[0][colIndex].class += ' active-carry';
                    
                    // If this carry is from the current step's column, highlight it
                    if (currentStep > 0 && currentStep <= steps.length) {
                        const stepData = steps[currentStep - 1];
                        if (stepData.column === carry.from) {
                            gridData[0][colIndex].class += ' just-generated';
                        }
                    }
                }
            } else {
                // Show used carries as strikethrough
                const colIndex = column === 'hundreds' ? 1 : 
                               column === 'tens' ? 2 : 
                               column === 'ones' ? 3 : 0;
                
                if (colIndex > 0) {
                    gridData[0][colIndex].value = carry.value;
                    gridData[0][colIndex].class += ' used-carry';
                }
            }
        });
        
        // Fill in completed answers
        const completedSteps = steps.filter(step => step.completed);
        completedSteps.forEach(step => {
            const answerCol = step.column === 'hundreds' ? 1 : 
                            step.column === 'tens' ? 2 : 
                            step.column === 'ones' ? 3 : 
                            step.column === 'thousands' ? 0 : -1;
            
            if (answerCol > 0) {
                gridData[4][answerCol].value = step.result;
                gridData[4][answerCol].class += step.correct ? ' correct' : ' incorrect';
                
                // Mark the carry as used for this step
                if (step.carry > 0) {
                    const carryFrom = step.column === 'tens' ? 'ones' : 
                                    step.column === 'hundreds' ? 'tens' : 
                                    step.column === 'thousands' ? 'hundreds' : null;
                    
                    if (carryFrom && carries[step.column]) {
                        carries[step.column].used = true;
                    }
                }
            } else if (answerCol === 0 && step.column === 'thousands') {
                // Handle thousands place (left of hundreds)
                gridData[0][0].value = step.result; // Show in plus column? Or need extra column
                gridData[0][0].class += step.correct ? ' correct' : ' incorrect';
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
                
                cellEl.dataset.row = rowIndex;
                cellEl.dataset.col = colIndex;
                
                // Highlight active column
                if (currentStep > 0 && currentStep <= steps.length) {
                    const stepData = steps[currentStep - 1];
                    const activeCol = stepData.column === 'hundreds' ? 1 : 
                                    stepData.column === 'tens' ? 2 : 
                                    stepData.column === 'ones' ? 3 : 0;
                    
                    if (colIndex === activeCol) {
                        if (rowIndex === 1 || rowIndex === 2) {
                            cellEl.classList.add('active-column');
                        }
                    }
                    
                    // Highlight the carry that should be used
                    if (stepData.carry > 0) {
                        const carryCol = stepData.column === 'tens' ? 3 : 
                                       stepData.column === 'hundreds' ? 2 : 
                                       stepData.column === 'thousands' ? 1 : 0;
                        
                        if (colIndex === carryCol && rowIndex === 0) {
                            cellEl.classList.add('carry-to-use');
                        }
                    }
                }
                
                problemGrid.appendChild(cellEl);
            });
        });
    }
    
    // Render the step list
    function renderStepList() {
        stepList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = `${step.step}. ${step.description}`;
            
            if (step.completed) {
                li.classList.add('completed');
                if (step.correct !== null) {
                    li.innerHTML += step.correct ? ' ✓' : ' ✗';
                }
            } else if (index === currentStep) {
                li.classList.add('active');
            }
            
            stepList.appendChild(li);
        });
    }
    
    // Update step display
    function updateStepDisplay() {
        if (currentStep < steps.length) {
            const stepData = steps[currentStep];
            stepDescription.textContent = stepData.description;
            document.querySelector('.step-label').textContent = `Step ${stepData.step}:`;
            stepAnswerInput.placeholder = `Enter sum for ${stepData.column} column`;
            stepAnswerInput.disabled = false;
            
            // Highlight which carry to use
            if (stepData.carry > 0) {
                const carryFrom = stepData.column === 'tens' ? 'ones' : 
                                stepData.column === 'hundreds' ? 'tens' : 
                                stepData.column === 'thousands' ? 'hundreds' : null;
                
                if (carryFrom) {
                    stepDescription.textContent += ` (use carry ${stepData.carry} from ${carryFrom} column)`;
                }
            }
        } else {
            stepDescription.textContent = 'All steps completed! Great job!';
            document.querySelector('.step-label').textContent = 'Complete!';
            stepAnswerInput.placeholder = 'Problem solved!';
            stepAnswerInput.disabled = true;
        }
        
        renderProblemGrid();
    }
    
    // Check step answer
    function checkStepAnswer() {
        if (currentStep >= steps.length) return;
        
        const stepData = steps[currentStep];
        const userAnswer = parseInt(stepAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            showFeedback('Please enter a valid number', 'incorrect');
            return;
        }
        
        scores.totalSteps++;
        
        if (userAnswer === stepData.sum) {
            scores.correctSteps++;
            
            // Mark step as completed
            stepData.completed = true;
            stepData.correct = true;
            
            // Mark the carry as used
            if (stepData.carry > 0) {
                const carryFrom = stepData.column === 'tens' ? 'ones' : 
                                stepData.column === 'hundreds' ? 'tens' : 
                                stepData.column === 'thousands' ? 'hundreds' : null;
                
                if (carryFrom && carries[stepData.column]) {
                    carries[stepData.column].used = true;
                }
            }
            
            // Show success message
            let feedbackMsg = `✓ Correct! ${stepData.digit1} + ${stepData.digit2}`;
            if (stepData.carry > 0) {
                feedbackMsg += ` + ${stepData.carry} (carry)`;
            }
            feedbackMsg += ` = ${stepData.sum}`;
            
            if (stepData.nextCarry > 0) {
                const nextColumn = stepData.column === 'ones' ? 'tens' : 
                                 stepData.column === 'tens' ? 'hundreds' : 'thousands';
                feedbackMsg += `. Write ${stepData.result} below, carry ${stepData.nextCarry} to ${nextColumn} column.`;
            } else {
                feedbackMsg += `. Write ${stepData.result} below.`;
            }
            
            showFeedback(feedbackMsg, 'correct');
            nextStepBtn.disabled = false;
            
        } else {
            scores.incorrectSteps++;
            
            // Mark step as completed (but incorrect)
            stepData.completed = true;
            stepData.correct = false;
            
            // Still mark carry as used even if wrong
            if (stepData.carry > 0 && carries[stepData.column]) {
                carries[stepData.column].used = true;
            }
            
            // Show correct answer
            let feedbackMsg = `✗ Incorrect. ${stepData.digit1} + ${stepData.digit2}`;
            if (stepData.carry > 0) {
                feedbackMsg += ` + ${stepData.carry} (carry)`;
            }
            feedbackMsg += ` = ${stepData.sum}`;
            
            showFeedback(feedbackMsg, 'incorrect');
            nextStepBtn.disabled = false;
        }
        
        updateScoreDisplay();
        renderStepList();
        renderProblemGrid();
        
        // Auto-focus on next step button
        setTimeout(() => nextStepBtn.focus(), 500);
    }
    
    // Move to next step
    function nextStep() {
        if (currentStep < steps.length) {
            currentStep++;
            
            if (currentStep === steps.length) {
                // Problem completed
                scores.problemsSolved++;
                showFeedback('🎉 Problem solved! Well done!', 'correct');
                nextStepBtn.disabled = true;
                showAnswerBtn.disabled = true;
                stepAnswerInput.value = '';
            } else {
                stepAnswerInput.value = '';
                stepAnswerInput.focus();
                nextStepBtn.disabled = true;
            }
            
            updateStepDisplay();
            updateScoreDisplay();
        }
    }
    
    // Show full answer
    function showAnswer() {
        steps.forEach(step => {
            if (!step.completed) {
                step.completed = true;
                step.correct = false;
                
                // Mark associated carries as used
                if (step.carry > 0 && carries[step.column]) {
                    carries[step.column].used = true;
                }
            }
        });
        
        currentStep = steps.length;
        scores.problemsSolved++;
        
        showFeedback(`Answer: ${currentProblem.num1} + ${currentProblem.num2} = ${currentProblem.answer}`, 'incorrect');
        updateStepDisplay();
        updateScoreDisplay();
        renderStepList();
        renderProblemGrid();
        nextStepBtn.disabled = true;
        showAnswerBtn.disabled = true;
        stepAnswerInput.disabled = true;
    }
    
    // Show feedback
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        
        if (!message.includes('🎉') && !message.includes('Answer:')) {
            setTimeout(clearFeedback, 4000);
        }
    }
    
    // Clear feedback
    function clearFeedback() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
    }
    
    // Update score display
    function updateScoreDisplay() {
        correctStepsEl.textContent = scores.correctSteps;
        incorrectStepsEl.textContent = scores.incorrectSteps;
        totalStepsEl.textContent = scores.totalSteps;
        problemsSolvedEl.textContent = scores.problemsSolved;
        
        const accuracy = scores.totalSteps > 0 ? 
            Math.round((scores.correctSteps / scores.totalSteps) * 100) : 0;
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
                correctSteps: 0,
                incorrectSteps: 0,
                totalSteps: 0,
                problemsSolved: 0
            };
            localStorage.removeItem('additionScores');
            updateScoreDisplay();
            generateProblem();
        }
    }
    
    // Event Listeners
    submitStepBtn.addEventListener('click', checkStepAnswer);
    stepAnswerInput.addEventListener('keypress', (e) => e.key === 'Enter' && checkStepAnswer());
    nextStepBtn.addEventListener('click', nextStep);
    showAnswerBtn.addEventListener('click', showAnswer);
    newProblemBtn.addEventListener('click', generateProblem);
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
});
