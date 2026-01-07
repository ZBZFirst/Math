// Addition Practice with Dual Container System - ANIMATED VERSION (FIXED) 
// WITH SIMPLE NUMBER CONTROLS FOR ALL SCREENS

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let scores = {
        correct: 0,
        incorrect: 0,
        total: 0
    };
    
    // Animation state to prevent re-animation
    let isAnimating = false;
    let hasCurrentColumnValues = false;
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const subProblemDiv = document.getElementById('subProblem');
    const subAnswerInput = document.getElementById('subAnswer');
    const mainActionBtn = document.getElementById('mainActionBtn');
    const feedbackDiv = document.getElementById('feedback');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const totalCountEl = document.getElementById('totalCount');
    const accuracyRateEl = document.getElementById('accuracyRate');
    const resetScoresBtn = document.getElementById('resetScores');
    
    // ===== SIMPLE NUMBER CONTROLS FUNCTIONS =====
    
    function initNumberControls() {
        const currentNumberEl = document.getElementById('currentNumber');
        const subAnswerInput = document.getElementById('subAnswer');
        const numberButtons = document.querySelectorAll('.number-btn');
        
        if (!currentNumberEl || !subAnswerInput) return;
        
        let currentNumber = 0;
        
        function updateDisplay() {
            const oldValue = parseInt(currentNumberEl.textContent) || 0;
            const newValue = currentNumber;
            
            currentNumberEl.textContent = newValue;
            // Update the hidden input for compatibility with existing code
            subAnswerInput.value = newValue;
            
            // Only animate if the number actually changed
            if (oldValue !== newValue) {
                // Create a temporary element for the animation
                const tempSpan = document.createElement('span');
                tempSpan.textContent = newValue;
                tempSpan.className = 'animate-drop-in';
                tempSpan.style.display = 'inline-block';
                
                // Replace content with animated version
                currentNumberEl.innerHTML = '';
                currentNumberEl.appendChild(tempSpan);
                
                // Clean up after animation
                setTimeout(() => {
                    tempSpan.classList.remove('animate-drop-in');
                    // Restore normal text
                    currentNumberEl.textContent = newValue;
                }, 300);
            }
        }
        
        // Handle all number buttons
        numberButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('clear')) {
                    currentNumber = 0;
                } else if (btn.classList.contains('increment') || btn.classList.contains('decrement')) {
                    const change = parseInt(btn.getAttribute('data-change'));
                    const newValue = currentNumber + change;
                    
                    // Only update if within valid range (0-99)
                    if (newValue >= 0 && newValue <= 99) {
                        currentNumber = newValue;
                    }
                }
                
                updateDisplay();
            });
        });
        
        // Reset function to call when starting new problem
        function resetNumberControls() {
            currentNumber = 0;
            updateDisplay();
        }
        
        // Make reset function available globally
        window.resetNumberControls = resetNumberControls;
        
        // Initialize
        updateDisplay();
        
        console.log('Number controls initialized');
    }
    
    // Function to get current answer from our number controls
    function getCurrentAnswer() {
        const subAnswerInput = document.getElementById('subAnswer');
        return subAnswerInput ? parseInt(subAnswerInput.value) || 0 : 0;
    }
    
    // ===== CORE FUNCTIONS =====
    function generateProblem() {
        const num1 = Math.floor(Math.random() * 400);
        const num2 = Math.floor(Math.random() * 400);
        const answer = num1 + num2;
        
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
        hasCurrentColumnValues = false;
        
        calculateColumnProblems();
        
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
                carryVisible: true
            });
        }
        
        renderMainGrid();
        renderSubProblem();
        clearAllFeedback();
        subAnswerInput.value = '';
        subAnswerInput.disabled = false;
        
        // Reset number controls
        if (typeof window.resetNumberControls === 'function') {
            window.resetNumberControls();
        }
        
        // Update the main action button to "Submit Answer"
        updateMainButton();
    }
    
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
                carryVisible: false
            });
            
            carry = nextCarry;
        });
    }
    
    // ===== ANIMATION FUNCTIONS =====
    
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
    
    // Animate element and immediately display value in target
    async function animateElement(source, target, value, color, type = 'number') {
        if (!source || !target) return;
        
        // Display the value in target immediately (before animation)
        target.textContent = value;
        target.classList.add('animate-drop-in');
        
        return new Promise((resolve) => {
            if (isAnimating) {
                resolve();
                return;
            }
            
            isAnimating = true;
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
                ghost.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.2)`;
                ghost.style.opacity = '0.7';
            }, 50);
            
            // Clean up
            setTimeout(() => {
                ghost.remove();
                isAnimating = false;
                resolve();
            }, 650);
        });
    }
    
    // Animate numbers from Main Problem to Current Column
    async function animateToCurrentColumn() {
        if (hasCurrentColumnValues || isAnimating) return;
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        // Wait for sub-problem to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        // Get source cells from main grid
        const firstNumCell = allGridCells[columnIndex + 4];
        const secondNumCell = allGridCells[columnIndex + 8];
        
        // Get target elements in sub-problem
        const subNumbers = document.querySelectorAll('.sub-number');
        const subCarry = document.querySelector('.sub-carry-value');
        
        // Animation sequence
        const animations = [];
        
        // Animate carry first (if present and visible)
        if (currentColData.carry > 0 && currentColData.carryVisible) {
            const carryCell = allGridCells[columnIndex];
            if (carryCell && subCarry) {
                animations.push(async () => {
                    await animateElement(carryCell, subCarry, currentColData.carry, '#ff9800', 'carry');
                    await new Promise(resolve => setTimeout(resolve, 100));
                });
            }
        }
        
        // Animate first number
        if (firstNumCell && subNumbers[0]) {
            animations.push(async () => {
                await animateElement(firstNumCell, subNumbers[0], currentColData.digit1, '#2196f3', 'number');
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        }
        
        // Animate second number
        if (secondNumCell && subNumbers[1]) {
            animations.push(async () => {
                await animateElement(secondNumCell, subNumbers[1], currentColData.digit2, '#2196f3', 'number');
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        }
        
        // Execute animations sequentially
        for (const animation of animations) {
            await animation();
        }
        
        hasCurrentColumnValues = true;
        
        // Remove drop-in classes after animations
        setTimeout(() => {
            document.querySelectorAll('.animate-drop-in').forEach(el => {
                el.classList.remove('animate-drop-in');
            });
        }, 500);
    }
    
    // Animate answer from Current Column to Main Problem
    async function animateAnswerToMain() {
        if (isAnimating) return;
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData || !currentColData.answered) return;
        
        // Get answer element from sub-problem
        const subAnswer = document.querySelector('.sub-answer.correct') || 
                          document.querySelector('.sub-answer.incorrect');
        if (!subAnswer) return;
        
        // Don't re-animate values to current column after answer
        hasCurrentColumnValues = true;
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        // Find target answer cell
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
                    const carryTargetCell = allGridCells[nextColumnIndex];
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    if (carryTargetCell) {
                        await animateElement(subAnswer, carryTargetCell, currentColData.nextCarry, '#ff9800', 'carry');
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
    
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        const { num1Digits, num2Digits, columns: colData } = currentProblem;
        
        // Create 5 rows × 4 columns grid
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Determine cell content based on position
                if (row === 0) { // Carry row
                    cell.className += ' carry-cell';
                    cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : col === 3 ? 'ones' : '';
                    
                    if (cell.dataset.column) {
                        const colDataForThis = colData.find(c => c.column === cell.dataset.column);
                        if (colDataForThis && colDataForThis.carry > 0 && colDataForThis.carryVisible) {
                            cell.textContent = colDataForThis.carry;
                            cell.classList.add('active-carry');
                            
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
        
        // Reset animation state when rendering new column
        if (!currentColData.answered) {
            hasCurrentColumnValues = false;
        }
        
        // Create sub-problem structure with values already displayed
        const subContainer = document.createElement('div');
        subContainer.className = 'sub-problem-container-inner';
        
        const subDisplay = document.createElement('div');
        subDisplay.className = 'sub-problem-display';
        
        // Numbers row - display values immediately
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-numbers-row';
        
        // Create elements with values already set (but initially invisible)
        if (currentColData.carry > 0 && currentColData.carryVisible) {
            const carryDiv = document.createElement('div');
            carryDiv.className = 'sub-carry-value';
            carryDiv.textContent = currentColData.carry;
            carryDiv.style.opacity = '0'; // Start invisible
            numbersRow.appendChild(carryDiv);
            
            const carryPlus = document.createElement('div');
            carryPlus.className = 'sub-plus';
            carryPlus.textContent = '+';
            numbersRow.appendChild(carryPlus);
        }
        
        const num1Div = document.createElement('div');
        num1Div.className = 'sub-number';
        num1Div.textContent = currentColData.digit1;
        num1Div.style.opacity = '0'; // Start invisible
        numbersRow.appendChild(num1Div);
        
        const plusDiv = document.createElement('div');
        plusDiv.className = 'sub-plus';
        plusDiv.textContent = '+';
        numbersRow.appendChild(plusDiv);
        
        const num2Div = document.createElement('div');
        num2Div.className = 'sub-number';
        num2Div.textContent = currentColData.digit2;
        num2Div.style.opacity = '0'; // Start invisible
        numbersRow.appendChild(num2Div);
        
        subDisplay.appendChild(numbersRow);
        
        // Line
        const lineDiv = document.createElement('div');
        lineDiv.className = 'sub-line';
        subDisplay.appendChild(lineDiv);
        
        // Answer - if already answered, show the sum, otherwise show placeholder
        const answerDiv = document.createElement('div');
        if (currentColData.answered) {
            answerDiv.className = `sub-answer ${currentColData.correct ? 'correct' : 'incorrect'}`;
            answerDiv.textContent = currentColData.sum;
        } else {
            answerDiv.className = 'sub-answer-placeholder';
            answerDiv.textContent = '?';
        }
        subDisplay.appendChild(answerDiv);
        
        subContainer.appendChild(subDisplay);
        
        subProblemDiv.appendChild(subContainer);
        
        // If column hasn't been answered yet, animate values from main to current
        if (!currentColData.answered && !hasCurrentColumnValues) {
            // Start animations after DOM is ready
            setTimeout(async () => {
                highlightSourceColumn();
                await animateToCurrentColumn();
                
                // Make values visible after animation starts
                setTimeout(() => {
                    document.querySelectorAll('.sub-number, .sub-carry-value').forEach(el => {
                        el.style.opacity = '1';
                        el.classList.add('animate-drop-in');
                    });
                }, 50);
            }, 100);
        } else {
            // If already answered or values already shown, just make visible
            setTimeout(() => {
                document.querySelectorAll('.sub-number, .sub-carry-value').forEach(el => {
                    el.style.opacity = '1';
                });
            }, 100);
        }
    }
    
    // ===== GAME LOGIC FUNCTIONS =====

    function updateMainButton() {
        const mainActionBtn = document.getElementById('mainActionBtn');
        
        if (isProblemComplete()) {
            mainActionBtn.textContent = 'New Problem';
            mainActionBtn.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
            mainActionBtn.onclick = function() {
                generateProblem();
                updateMainButton();
            };
        } else {
            const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
            if (currentColData && currentColData.answered) {
                mainActionBtn.textContent = 'Next Column';
                mainActionBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)';
                mainActionBtn.onclick = function() {
                    nextColumn();
                    updateMainButton();
                };
            } else {
                mainActionBtn.textContent = 'Submit Answer';
                mainActionBtn.style.background = 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
                mainActionBtn.onclick = function() {
                    checkSubAnswer();
                    // Update button after checking answer
                    setTimeout(updateMainButton, 500);
                };
            }
        }
    }
    
    // Modified checkSubAnswer to use getCurrentAnswer()
    async function checkSubAnswer() {
        const userAnswer = getCurrentAnswer();
        
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
            
            // Update answer in sub-problem immediately
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.sum;
                answerDiv.className = 'sub-answer correct';
                answerDiv.classList.add('animate-drop-in');
            }
            
            // Animate answer to main problem
            await animateAnswerToMain();
            
        } else {
            scores.incorrect++;
            currentColData.answered = true;
            currentColData.correct = false;
            
            showSubFeedback(`✗ Incorrect. ${currentColData.digit1} + ${currentColData.digit2} = ${currentColData.sum}`, 'incorrect');
            subAnswerInput.disabled = true;
            
            // Show correct answer
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.sum;
                answerDiv.className = 'sub-answer incorrect';
            }
        }
        
        updateScoreDisplay();
        
        // Only update main grid (sub-problem will update on next column)
        setTimeout(() => {
            renderMainGrid();
            updateMainButton(); // Update button after rendering
        }, 1000);
        
        if (isProblemComplete()) {
            setTimeout(() => {
                showFeedback('🎉 Problem solved! Well done!', 'correct');
                updateMainButton();
            }, 1500);
        }
    }
    
    // Modified nextColumn function:
    function nextColumn() {
        const nextCol = getNextColumn();
        if (nextCol) {
            currentColumn = nextCol;
            subAnswerInput.value = '';
            subAnswerInput.disabled = false;
            renderMainGrid();
            renderSubProblem();
            
            // Reset number controls
            if (typeof window.resetNumberControls === 'function') {
                window.resetNumberControls();
            }
            
            clearSubFeedback();
            updateMainButton();
        }
    }
    
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
    
    function isProblemComplete() {
        return currentProblem.columns.every(col => col.answered);
    }
    
    // ===== UTILITY FUNCTIONS =====
    
    function showFeedback(message, type) {
        if (feedbackDiv) {
            feedbackDiv.textContent = message;
            feedbackDiv.className = `feedback ${type}`;
        }
    }
    
    function showSubFeedback(message, type) {
        if (subFeedbackDiv) {
            subFeedbackDiv.innerHTML = message;
            subFeedbackDiv.className = `sub-feedback ${type}`;
        }
    }
    
    function clearAllFeedback() {
        if (feedbackDiv) {
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'feedback';
        }
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = '';
            subFeedbackDiv.className = 'sub-feedback';
        }
    }
    
    function clearSubFeedback() {
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = '';
            subFeedbackDiv.className = 'sub-feedback';
        }
    }
    
    function updateScoreDisplay() {
        if (correctCountEl) correctCountEl.textContent = scores.correct;
        if (incorrectCountEl) incorrectCountEl.textContent = scores.incorrect;
        if (totalCountEl) totalCountEl.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
        
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
    
    resetScoresBtn.addEventListener('click', resetScores);
    
    // Initialize number controls and game
    initNumberControls();
    loadScores();
    generateProblem();
});
