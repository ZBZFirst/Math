// Addition Practice with Step-by-Step Teaching

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
    
    // Generate a new addition problem
    function generateProblem() {
        const num1 = Math.floor(Math.random() * 400); // 0-399
        const num2 = Math.floor(Math.random() * 400); // 0-399
        const answer = num1 + num2;
        
        currentProblem = {
            num1: num1,
            num2: num2,
            answer: answer,
            num1Str: num1.toString().padStart(3, '0'),
            num2Str: num2.toString().padStart(3, '0'),
            answerStr: answer.toString()
        };
        
        // Reset steps
        currentStep = 0;
        steps = generateSteps(currentProblem);
        
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
    
    // Generate step-by-step instructions for addition
    function generateSteps(problem) {
        const steps = [];
        const num1Digits = problem.num1Str.split('').reverse(); // ones, tens, hundreds
        const num2Digits = problem.num2Str.split('').reverse();
        
        let carry = 0;
        let stepNumber = 1;
        let columnNames = ['ones', 'tens', 'hundreds'];
        
        // Process each column
        for (let i = 0; i < 3; i++) {
            const digit1 = parseInt(num1Digits[i] || '0');
            const digit2 = parseInt(num2Digits[i] || '0');
            const columnSum = digit1 + digit2 + carry;
            const columnResult = columnSum % 10;
            const nextCarry = Math.floor(columnSum / 10);
            
            steps.push({
                step: stepNumber++,
                column: columnNames[i],
                digit1: digit1,
                digit2: digit2,
                carry: carry,
                sum: columnSum,
                result: columnResult,
                nextCarry: nextCarry,
                description: `Add ${columnNames[i]} column: ${digit1} + ${digit2}${carry > 0 ? ' + ' + carry + ' (carry)' : ''} = ${columnSum}`
            });
            
            carry = nextCarry;
        }
        
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
                description: `Bring down the carry: ${carry}`
            });
        }
        
        return steps;
    }
    
    // Render the problem in a 4x4 grid
    function renderProblemGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Str, num2Str, answerStr } = currentProblem;
        
        // Create grid cells
        const gridCells = [
            // Row 1: Hundreds, Tens, Ones labels
            { value: 'H', class: 'placeholder' },
            { value: 'T', class: 'placeholder' },
            { value: 'O', class: 'placeholder' },
            { value: '', class: 'placeholder' },
            
            // Row 2: First number
            { value: num1Str[0] || '0', class: '' },
            { value: num1Str[1] || '0', class: '' },
            { value: num1Str[2] || '0', class: '' },
            { value: '', class: 'placeholder' },
            
            // Row 3: Second number with plus sign
            { value: '+', class: 'operator', rowspan: 2 },
            { value: num2Str[0] || '0', class: '' },
            { value: num2Str[1] || '0', class: '' },
            { value: num2Str[2] || '0', class: '' },
            
            // Row 4: Line
            { value: '', class: 'line', colspan: 4 },
            
            // Row 5: Answer (initially empty)
            { value: '_', class: 'placeholder' },
            { value: '_', class: 'placeholder' },
            { value: '_', class: 'placeholder' },
            { value: '_', class: 'placeholder' }
        ];
        
        // Add carry cells
        if (currentStep > 0) {
            const currentStepData = steps[currentStep - 1];
            if (currentStepData.nextCarry > 0 && currentStep < steps.length) {
                // Add carry cell above appropriate column
                const carryPosition = 8 + (2 - steps[currentStep].columnIndex); // Adjust based on column
                gridCells[carryPosition] = { 
                    value: currentStepData.nextCarry, 
                    class: 'carry' 
                };
            }
        }
        
        // Create and append grid cells
        gridCells.forEach((cell, index) => {
            const cellEl = document.createElement('div');
            cellEl.className = `grid-cell ${cell.class || ''}`;
            cellEl.textContent = cell.value;
            
            if (cell.rowspan) cellEl.style.gridRow = `span ${cell.rowspan}`;
            if (cell.colspan) cellEl.style.gridColumn = `span ${cell.colspan}`;
            
            // Highlight current step cells
            if (currentStep > 0 && currentStep <= steps.length) {
                const stepData = steps[currentStep - 1];
                if (cell.value !== '' && cell.value !== '_' && cell.value !== '+' && 
                    !cell.class.includes('placeholder') && !cell.class.includes('operator') &&
                    !cell.class.includes('line')) {
                    
                    // Check if this cell is part of current step
                    const digitIndex = index % 4;
                    const columnMapping = { ones: 2, tens: 1, hundreds: 0, thousands: -1 };
                    if (digitIndex === columnMapping[stepData.column]) {
                        cellEl.classList.add('active');
                    }
                }
            }
            
            problemGrid.appendChild(cellEl);
        });
    }
    
    // Render the step list
    function renderStepList() {
        stepList.innerHTML = '';
        
        steps.forEach((step, index) => {
            const li = document.createElement('li');
            li.textContent = step.description;
            
            if (index < currentStep) {
                li.classList.add('completed');
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
        } else {
            stepDescription.textContent = 'All steps completed! Great job!';
            document.querySelector('.step-label').textContent = 'Complete!';
        }
        
        // Update grid highlighting
        renderProblemGrid();
    }
    
    // Check step answer
    function checkStepAnswer() {
        if (currentStep >= steps.length) return;
        
        const userAnswer = parseInt(stepAnswerInput.value);
        const stepData = steps[currentStep];
        
        if (isNaN(userAnswer)) {
            showFeedback('Please enter a valid number', 'incorrect');
            return;
        }
        
        scores.totalSteps++;
        
        if (userAnswer === stepData.sum) {
            scores.correctSteps++;
            showFeedback(`✓ Correct! ${stepData.digit1} + ${stepData.digit2}${stepData.carry > 0 ? ' + ' + stepData.carry : ''} = ${stepData.sum}`, 'correct');
            
            // Mark step as completed
            stepData.completed = true;
            stepData.correct = true;
            
            // Enable next step button
            nextStepBtn.disabled = false;
            
            // Update answer in grid
            updateAnswerInGrid(stepData);
            
        } else {
            scores.incorrectSteps++;
            showFeedback(`✗ Incorrect. The correct answer is ${stepData.sum}`, 'incorrect');
            stepData.completed = true;
            stepData.correct = false;
        }
        
        updateScoreDisplay();
        renderStepList();
    }
    
    // Update answer in grid
    function updateAnswerInGrid(stepData) {
        const answerCells = document.querySelectorAll('.grid-cell.placeholder');
        const columnMapping = { ones: 3, tens: 2, hundreds: 1, thousands: 0 };
        const answerIndex = columnMapping[stepData.column];
        
        if (answerCells[answerIndex]) {
            answerCells[answerIndex].textContent = stepData.result;
            answerCells[answerIndex].classList.remove('placeholder');
            answerCells[answerIndex].classList.add('correct');
        }
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
            }
        });
        
        currentStep = steps.length;
        scores.problemsSolved++;
        
        // Fill in all answers
        const answerStr = currentProblem.answerStr.padStart(4, '0');
        const answerCells = document.querySelectorAll('.grid-cell.placeholder');
        answerStr.split('').reverse().forEach((digit, index) => {
            if (answerCells[index]) {
                answerCells[index].textContent = digit;
                answerCells[index].classList.remove('placeholder');
                answerCells[index].classList.add('incorrect');
            }
        });
        
        showFeedback('Answer revealed: ' + currentProblem.answer, 'incorrect');
        updateStepDisplay();
        updateScoreDisplay();
        renderStepList();
        nextStepBtn.disabled = true;
        showAnswerBtn.disabled = true;
    }
    
    // Show feedback
    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        
        // Auto-clear after 3 seconds unless it's a completion message
        if (!message.includes('🎉') && !message.includes('Answer revealed')) {
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
        if (confirm('Are you sure you want to reset your addition practice scores?')) {
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
    
    stepAnswerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkStepAnswer();
        }
    });
    
    nextStepBtn.addEventListener('click', nextStep);
    
    showAnswerBtn.addEventListener('click', showAnswer);
    
    newProblemBtn.addEventListener('click', generateProblem);
    
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
});
