// Addition Practice with Traditional Carry Method
// Based on Wikipedia: https://en.wikipedia.org/wiki/Carry_(arithmetic)

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
    
    // Generate a new addition problem (0-399)
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
            answerStr: answer.toString().padStart(4, '0') // Up to 4 digits for 399+399
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
        
        console.log('New problem:', currentProblem);
        console.log('Steps:', steps);
    }
    
    // Generate step-by-step instructions using traditional carry method
    function generateSteps(problem) {
        const steps = [];
        const num1Digits = problem.num1Str.split('').reverse(); // [ones, tens, hundreds]
        const num2Digits = problem.num2Str.split('').reverse(); // [ones, tens, hundreds]
        
        let carry = 0;
        let stepNumber = 1;
        let columnNames = ['ones', 'tens', 'hundreds'];
        let placeValues = ['1', '10', '100'];
        
        // Process each column from right to left (ones → tens → hundreds)
        for (let i = 0; i < 3; i++) {
            const digit1 = parseInt(num1Digits[i] || '0');
            const digit2 = parseInt(num2Digits[i] || '0');
            const columnSum = digit1 + digit2 + carry;
            const columnResult = columnSum % 10;
            const nextCarry = Math.floor(columnSum / 10);
            
            steps.push({
                step: stepNumber++,
                column: columnNames[i],
                placeValue: placeValues[i],
                digit1: digit1,
                digit2: digit2,
                carry: carry,
                sum: columnSum,
                result: columnResult,
                nextCarry: nextCarry,
                columnIndex: i,
                description: `Add ${columnNames[i]} place (${placeValues[i]}): ${digit1} + ${digit2}${carry > 0 ? ' + ' + carry + ' (carry from previous)' : ''} = ${columnSum}`
            });
            
            carry = nextCarry;
        }
        
        // Final step if there's a carry to thousands place
        if (carry > 0) {
            steps.push({
                step: stepNumber,
                column: 'thousands',
                placeValue: '1000',
                digit1: 0,
                digit2: 0,
                carry: carry,
                sum: carry,
                result: carry,
                nextCarry: 0,
                columnIndex: 3,
                description: `Write the final carry: ${carry} (thousands place)`
            });
        } else {
            // No thousands place needed
            steps.push({
                step: stepNumber,
                column: 'complete',
                placeValue: 'complete',
                digit1: 0,
                digit2: 0,
                carry: 0,
                sum: 0,
                result: 0,
                nextCarry: 0,
                columnIndex: -1,
                description: 'Problem complete! No thousands place needed.'
            });
        }
        
        return steps;
    }
    
    // Render the problem in a grid showing the traditional columnar format
    function renderProblemGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Str, num2Str, answerStr } = currentProblem;
        
        // Create a 6x4 grid to show carries properly
        const gridCells = [];
        
        // Row 0: Column labels
        gridCells.push({ value: '1000s', class: 'column-label', row: 0, col: 0 });
        gridCells.push({ value: '100s', class: 'column-label', row: 0, col: 1 });
        gridCells.push({ value: '10s', class: 'column-label', row: 0, col: 2 });
        gridCells.push({ value: '1s', class: 'column-label', row: 0, col: 3 });
        
        // Row 1: Carry row (initially empty)
        const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null;
        const nextCarry = currentStepData ? currentStepData.nextCarry : 0;
        
        // Show carries in appropriate positions based on current step
        for (let col = 0; col < 4; col++) {
            let carryValue = '';
            let carryClass = 'carry-cell';
            
            if (currentStepData) {
                // Show current carry if it exists for this column
                if (currentStepData.carry > 0 && col === (3 - currentStepData.columnIndex)) {
                    carryValue = currentStepData.carry;
                    carryClass += ' active-carry';
                }
                // Show next carry if calculated
                if (nextCarry > 0 && col === (2 - currentStepData.columnIndex) && currentStepData.columnIndex < 2) {
                    // Next carry goes to the left column
                    carryValue = nextCarry;
                    carryClass += ' next-carry';
                }
            }
            
            gridCells.push({ value: carryValue, class: carryClass, row: 1, col: col });
        }
        
        // Row 2: First number with place value alignment
        gridCells.push({ value: num1Str.length > 3 ? num1Str[0] : '', class: 'number-digit', row: 2, col: 0 });
        gridCells.push({ value: num1Str[0] || '0', class: 'number-digit', row: 2, col: 1 });
        gridCells.push({ value: num1Str[1] || '0', class: 'number-digit', row: 2, col: 2 });
        gridCells.push({ value: num1Str[2] || '0', class: 'number-digit', row: 2, col: 3 });
        
        // Row 3: Plus sign and second number
        gridCells.push({ value: '+', class: 'operator', row: 3, col: 0, rowspan: 2 });
        gridCells.push({ value: num2Str.length > 3 ? num2Str[0] : '', class: 'number-digit', row: 3, col: 1 });
        gridCells.push({ value: num2Str[0] || '0', class: 'number-digit', row: 3, col: 2 });
        gridCells.push({ value: num2Str[1] || '0', class: 'number-digit', row: 3, col: 3 });
        
        // Row 4: Line (horizontal rule)
        gridCells.push({ value: '', class: 'line', row: 4, col: 0, colspan: 4 });
        
        // Row 5: Answer row (show completed digits)
        const answerDigits = answerStr.split('').reverse(); // Reverse for [1s, 10s, 100s, 1000s]
        for (let col = 0; col < 4; col++) {
            let value = '_';
            let cellClass = 'answer-digit';
            
            // Fill in completed steps
            if (currentStep > 0) {
                const completedSteps = steps.slice(0, currentStep);
                const stepForThisColumn = completedSteps.find(step => {
                    const colMapping = { 0: 'thousands', 1: 'hundreds', 2: 'tens', 3: 'ones' };
                    return step.column === colMapping[col];
                });
                
                if (stepForThisColumn && stepForThisColumn.completed) {
                    value = stepForThisColumn.result;
                    cellClass += stepForThisColumn.correct ? ' correct' : ' incorrect';
                } else if (col === 3 && currentStep > steps.length - 1) {
                    // All steps done, show all digits
                    value = answerDigits[col] || '0';
                }
            }
            
            gridCells.push({ value: value, class: cellClass, row: 5, col: col });
        }
        
        // Apply grid positioning and create cells
        gridCells.forEach(cell => {
            const cellEl = document.createElement('div');
            cellEl.className = `grid-cell ${cell.class}`;
            cellEl.textContent = cell.value;
            cellEl.dataset.row = cell.row;
            cellEl.dataset.col = cell.col;
            
            // Apply grid positioning
            cellEl.style.gridRow = cell.row + 1; // +1 because CSS grid is 1-indexed
            cellEl.style.gridColumn = cell.col + 1;
            
            if (cell.rowspan) cellEl.style.gridRow = `span ${cell.rowspan}`;
            if (cell.colspan) cellEl.style.gridColumn = `span ${cell.colspan}`;
            
            // Highlight active column for current step
            if (currentStepData && currentStepData.columnIndex >= 0) {
                const activeCol = 3 - currentStepData.columnIndex; // Map to grid columns
                if (cell.col === activeCol && cell.row >= 1 && cell.row <= 3) {
                    cellEl.classList.add('active-column');
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
            li.textContent = `${step.step}. ${step.description}`;
            li.dataset.step = step.step;
            
            if (index < currentStep) {
                li.classList.add('completed');
                li.innerHTML += step.correct ? ' ✓' : ' ✗';
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
            
            // Update input placeholder based on step type
            if (stepData.column === 'complete') {
                stepAnswerInput.placeholder = 'Press Next for new problem';
                stepAnswerInput.disabled = true;
            } else {
                stepAnswerInput.placeholder = `Enter sum for ${stepData.column} place`;
                stepAnswerInput.disabled = false;
            }
        } else {
            stepDescription.textContent = 'All steps completed! Great job!';
            document.querySelector('.step-label').textContent = 'Complete!';
            stepAnswerInput.disabled = true;
        }
        
        // Update grid highlighting
        renderProblemGrid();
    }
    
    // Check step answer
    function checkStepAnswer() {
        if (currentStep >= steps.length) return;
        
        const stepData = steps[currentStep];
        
        // Skip checking for completion step
        if (stepData.column === 'complete') {
            nextStep();
            return;
        }
        
        const userAnswer = parseInt(stepAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            showFeedback('Please enter a valid number', 'incorrect');
            return;
        }
        
        scores.totalSteps++;
        
        if (userAnswer === stepData.sum) {
            scores.correctSteps++;
            showFeedback(`✓ Correct! ${stepData.digit1} + ${stepData.digit2}${stepData.carry > 0 ? ' + ' + stepData.carry + ' (carry)' : ''} = ${stepData.sum}`, 'correct');
            
            // Mark step as completed correctly
            stepData.completed = true;
            stepData.correct = true;
            stepData.userAnswer = userAnswer;
            
            // Enable next step button
            nextStepBtn.disabled = false;
            
            // Show the result digit in answer row
            updateAnswerInGrid(stepData);
            
            // If there's a next carry, show it in the carry row
            if (stepData.nextCarry > 0 && stepData.columnIndex < 3) {
                showFeedback(`✓ Correct! Write ${stepData.result} below, carry ${stepData.nextCarry} to the next column`, 'correct');
            }
            
        } else {
            scores.incorrectSteps++;
            showFeedback(`✗ Incorrect. ${stepData.digit1} + ${stepData.digit2}${stepData.carry > 0 ? ' + ' + stepData.carry : ''} = ${stepData.sum}`, 'incorrect');
            stepData.completed = true;
            stepData.correct = false;
            stepData.userAnswer = userAnswer;
            
            // Still enable next step but mark as incorrect
            nextStepBtn.disabled = false;
            updateAnswerInGrid(stepData);
        }
        
        updateScoreDisplay();
        renderStepList();
        
        // Auto-focus on next step button
        setTimeout(() => nextStepBtn.focus(), 500);
    }
    
    // Update answer in grid
    function updateAnswerInGrid(stepData) {
        // The answer will be updated in the next render
        // This function triggers a re-render
        renderProblemGrid();
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
        // Mark all steps as completed (incorrectly)
        steps.forEach(step => {
            if (!step.completed) {
                step.completed = true;
                step.correct = false;
                step.userAnswer = 'shown';
            }
        });
        
        currentStep = steps.length;
        scores.problemsSolved++;
        
        showFeedback(`Answer revealed: ${currentProblem.num1} + ${currentProblem.num2} = ${currentProblem.answer}`, 'incorrect');
        updateStepDisplay();
        updateScoreDisplay();
        renderStepList();
        renderProblemGrid(); // Show all digits
        nextStepBtn.disabled = true;
        showAnswerBtn.disabled = true;
        stepAnswerInput.disabled = true;
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
