// Subtraction Practice with Dual Container System

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
    
    // Animation state
    let isAnimating = false;
    let hasCurrentColumnValues = false;
    
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
    
    function generateProblem() {
        // Generate minuend (always greater than subtrahend)
        let minuend, subtrahend;
        do {
            minuend = Math.floor(Math.random() * 400) + 100; // At least 100 to allow borrowing
            subtrahend = Math.floor(Math.random() * minuend); // Always less than minuend
            
            // Ensure we have interesting borrowing scenarios
            const minStr = minuend.toString().padStart(3, '0');
            const subStr = subtrahend.toString().padStart(3, '0');
            
            // Check if borrowing is needed (makes problem interesting)
            let needsBorrowing = false;
            for (let i = 2; i >= 0; i--) {
                if (parseInt(minStr[i]) < parseInt(subStr[i])) {
                    needsBorrowing = true;
                    break;
                }
            }
            
            // If no borrowing at all, regenerate (too easy)
            if (!needsBorrowing) {
                // Make subtrahend larger in some digits to force borrowing
                const digitPos = Math.floor(Math.random() * 3);
                const newSub = subtrahend + Math.pow(10, digitPos) * (Math.floor(Math.random() * 5) + 1);
                if (newSub < minuend) {
                    subtrahend = newSub;
                    needsBorrowing = true;
                }
            }
            
        } while (subtrahend >= minuend || subtrahend === 0);
        
        const answer = minuend - subtrahend;
        
        const getDigits = (num) => {
            const str = num.toString().padStart(3, '0');
            return {
                hundreds: parseInt(str[0]),
                tens: parseInt(str[1]),
                ones: parseInt(str[2])
            };
        };
        
        const minDigits = getDigits(minuend);
        const subDigits = getDigits(subtrahend);
        
        currentProblem = {
            minuend: minuend,
            subtrahend: subtrahend,
            answer: answer,
            minDigits: minDigits,
            subDigits: subDigits,
            columns: []
        };
        
        // Reset state
        currentColumn = 'ones';
        columns = ['ones', 'tens', 'hundreds'];
        hasCurrentColumnValues = false;
        
        calculateColumnProblems();
        
        renderMainGrid();
        renderSubProblem();
        clearAllFeedback();
        subAnswerInput.value = '';
        subAnswerInput.disabled = false;
        nextColumnBtn.disabled = true;
        subAnswerInput.focus();
    }
    
    function calculateColumnProblems() {
        const { minDigits, subDigits } = currentProblem;
        let borrowFromNext = false;
        let borrowedValue = 0;
        
        // Process from ones to hundreds
        const columnOrder = ['ones', 'tens', 'hundreds'];
        
        columnOrder.forEach((column, index) => {
            let minDigit = minDigits[column];
            const subDigit = subDigits[column];
            
            // Apply any pending borrow from previous column
            if (borrowFromNext) {
                minDigit = borrowedValue;
                borrowFromNext = false;
            }
            
            // Check if we need to borrow
            let needsBorrow = minDigit < subDigit;
            let borrowedFrom = null;
            let originalMinDigit = minDigit;
            
            // If we need to borrow, find where to borrow from
            if (needsBorrow && column !== 'hundreds') {
                const nextColumn = columnOrder[index + 1];
                let nextMinDigit = minDigits[nextColumn];
                
                // Check if we can borrow directly
                if (nextMinDigit > 0) {
                    // Borrow from immediate next column
                    borrowedFrom = nextColumn;
                    nextMinDigit -= 1;
                    minDigit += 10;
                    minDigits[nextColumn] = nextMinDigit;
                } else {
                    // Need to borrow across multiple columns (cascade borrowing)
                    for (let j = index + 1; j < columnOrder.length; j++) {
                        const checkColumn = columnOrder[j];
                        if (minDigits[checkColumn] > 0) {
                            // Found a column to borrow from
                            borrowedFrom = checkColumn;
                            minDigits[checkColumn] -= 1;
                            
                            // Add 10 to all intermediate zeros
                            for (let k = j - 1; k > index; k--) {
                                const interColumn = columnOrder[k];
                                minDigits[interColumn] = 9; // After borrowing through
                            }
                            
                            minDigit += 10;
                            break;
                        }
                    }
                }
            }
            
            const result = minDigit - subDigit;
            
            currentProblem.columns.push({
                column: column,
                minDigit: originalMinDigit,
                subDigit: subDigit,
                actualMinDigit: minDigit, // After borrowing
                result: result,
                needsBorrow: needsBorrow,
                borrowedFrom: borrowedFrom,
                answered: false,
                correct: null,
                borrowVisible: false,
                intermediateZeros: [] // Track zeros that became 9s
            });
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
        ghost.style.fontSize = type === 'borrow' ? '1.2rem' : '1.8rem';
        ghost.style.fontWeight = 'bold';
        ghost.style.borderRadius = '4px';
        ghost.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        ghost.style.zIndex = '10000';
        ghost.style.pointerEvents = 'none';
        return ghost;
    }
    
    async function animateElement(source, target, value, color, type = 'number') {
        if (!source || !target) return;
        
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
            
            const ghost = createGhostElement(value, sourceRect, color, type);
            document.body.appendChild(ghost);
            
            const deltaX = targetRect.left - sourceRect.left;
            const deltaY = targetRect.top - sourceRect.top;
            
            setTimeout(() => {
                ghost.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.2)`;
                ghost.style.opacity = '0.7';
            }, 50);
            
            setTimeout(() => {
                ghost.remove();
                isAnimating = false;
                resolve();
            }, 650);
        });
    }
    
    // Animate borrowing from one column to another
    async function animateBorrow(fromColumn, toColumn, value) {
        if (isAnimating) return;
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        const fromIndex = fromColumn === 'hundreds' ? 1 : 
                         fromColumn === 'tens' ? 2 : 
                         fromColumn === 'ones' ? 3 : -1;
        const toIndex = toColumn === 'hundreds' ? 1 : 
                       toColumn === 'tens' ? 2 : 
                       toColumn === 'ones' ? 3 : -1;
        
        if (fromIndex < 0 || toIndex < 0) return;
        
        // Source is the minuend digit being borrowed from
        const sourceCell = allGridCells[fromIndex + 4];
        // Target is the borrow indicator in the minuend row
        const targetCell = allGridCells[toIndex + 8]; // Borrow row cell
        
        if (sourceCell && targetCell) {
            // Show borrow mark in source
            const originalValue = sourceCell.textContent;
            sourceCell.textContent = (parseInt(originalValue) - 1).toString();
            sourceCell.classList.add('borrowed-from');
            
            await animateElement(sourceCell, targetCell, '10', '#ff6b6b', 'borrow');
        }
    }
    
    async function animateToCurrentColumn() {
        if (hasCurrentColumnValues || isAnimating) return;
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        // Get source cells from main grid
        const minuendCell = allGridCells[columnIndex + 4];
        const subtrahendCell = allGridCells[columnIndex + 8];
        
        // Get target elements in sub-problem
        const subNumbers = document.querySelectorAll('.sub-number');
        const subBorrow = document.querySelector('.sub-borrow-value');
        
        // Animation sequence
        const animations = [];
        
        // Animate borrow if needed (comes first in subtraction)
        if (currentColData.needsBorrow && currentColData.borrowedFrom) {
            // First animate the borrowing action
            await animateBorrow(currentColData.borrowedFrom, currentColumn, 10);
            
            // Wait and then update the minuend cell to show it's been borrowed from
            setTimeout(() => {
                // Update the borrowed-from cell to show it's reduced
                const borrowFromIndex = currentColData.borrowedFrom === 'hundreds' ? 1 : 
                                      currentColData.borrowedFrom === 'tens' ? 2 : 3;
                const borrowedCell = allGridCells[borrowFromIndex + 4];
                if (borrowedCell) {
                    borrowedCell.classList.add('borrow-changed');
                }
            }, 300);
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Animate minuend (with borrowed value if applicable)
        if (minuendCell && subNumbers[0]) {
            animations.push(async () => {
                const value = currentColData.actualMinDigit;
                await animateElement(minuendCell, subNumbers[0], value, '#4caf50', 'number');
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        }
        
        // Animate subtrahend
        if (subtrahendCell && subNumbers[1]) {
            animations.push(async () => {
                await animateElement(subtrahendCell, subNumbers[1], currentColData.subDigit, '#2196f3', 'number');
                await new Promise(resolve => setTimeout(resolve, 100));
            });
        }
        
        // Execute animations sequentially
        for (const animation of animations) {
            await animation();
        }
        
        hasCurrentColumnValues = true;
        
        setTimeout(() => {
            document.querySelectorAll('.animate-drop-in').forEach(el => {
                el.classList.remove('animate-drop-in');
            });
        }, 500);
    }
    
    async function animateAnswerToMain() {
        if (isAnimating) return;
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData || !currentColData.answered) return;
        
        const subAnswer = document.querySelector('.sub-answer.correct') || 
                          document.querySelector('.sub-answer.incorrect');
        if (!subAnswer) return;
        
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
    }
    
    function highlightSourceColumn() {
        const columnIndex = currentColumn === 'ones' ? 3 : 
                           currentColumn === 'tens' ? 2 : 
                           currentColumn === 'hundreds' ? 1 : -1;
        
        if (columnIndex < 0) return;
        
        const allGridCells = document.querySelectorAll('.grid-cell');
        
        // Highlight minuend and subtrahend cells
        const minuendCell = allGridCells[columnIndex + 4];
        const subtrahendCell = allGridCells[columnIndex + 8];
        
        [minuendCell, subtrahendCell].forEach(cell => {
            if (cell) {
                cell.classList.add('animate-source');
                setTimeout(() => {
                    cell.classList.remove('animate-source');
                }, 1000);
            }
        });
    }
    
    // ===== RENDERING FUNCTIONS =====
    
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        const { minDigits, subDigits, columns: colData } = currentProblem;
        
        // Create 5 rows × 4 columns grid for subtraction
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Determine cell content based on position
                if (row === 0) { // Minuend row
                    if (col === 0) {
                        cell.className += ' operation-column';
                    } else {
                        cell.className += ' minuend-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        
                        // Show current minuend digit (may be modified by borrowing)
                        const colDataForThis = colData.find(c => c.column === cell.dataset.column);
                        if (colDataForThis && colDataForThis.answered) {
                            // Show the actual digit used (after borrowing)
                            cell.textContent = colDataForThis.actualMinDigit;
                            if (colDataForThis.needsBorrow) {
                                cell.classList.add('borrowed-digit');
                                if (colDataForThis.borrowedFrom) {
                                    cell.title = `Borrowed from ${colDataForThis.borrowedFrom} column`;
                                }
                            }
                        } else {
                            cell.textContent = cell.dataset.column === 'hundreds' ? minDigits.hundreds :
                                             cell.dataset.column === 'tens' ? minDigits.tens : minDigits.ones;
                        }
                    }
                }
                else if (row === 1) { // Borrow indicator row
                    if (col === 0) {
                        cell.className += ' operation-column';
                    } else {
                        cell.className += ' borrow-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        
                        const colDataForThis = colData.find(c => c.column === cell.dataset.column);
                        if (colDataForThis && colDataForThis.needsBorrow && colDataForThis.borrowVisible) {
                            cell.textContent = '¹⁰'; // Show borrow indicator
                            cell.classList.add('active-borrow');
                        }
                    }
                }
                else if (row === 2) { // Subtrahend row
                    if (col === 0) {
                        cell.className += ' operation-column';
                        cell.textContent = '−';
                    } else {
                        cell.className += ' subtrahend-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        cell.textContent = cell.dataset.column === 'hundreds' ? subDigits.hundreds :
                                         cell.dataset.column === 'tens' ? subDigits.tens : subDigits.ones;
                    }
                }
                else if (row === 3) { // Line row
                    cell.className += ' line';
                }
                else if (row === 4) { // Answer row
                    if (col === 0) {
                        cell.className += ' operation-column answer-cell';
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
                if ((row === 0 || row === 2 || row === 4) && cell.dataset.column === currentColumn) {
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
                <p>${currentProblem.minuend} − ${currentProblem.subtrahend} = ${currentProblem.answer}</p>
            `;
            subProblemDiv.appendChild(completeMsg);
            return;
        }
        
        // Reset animation state when rendering new column
        if (!currentColData.answered) {
            hasCurrentColumnValues = false;
        }
        
        // Create sub-problem structure
        const subContainer = document.createElement('div');
        subContainer.className = 'sub-problem-container-inner';
        
        const subDisplay = document.createElement('div');
        subDisplay.className = 'sub-problem-display';
        
        // Numbers row
        const numbersRow = document.createElement('div');
        numbersRow.className = 'sub-numbers-row';
        
        // Borrow indicator (if needed)
        if (currentColData.needsBorrow && currentColData.borrowVisible) {
            const borrowDiv = document.createElement('div');
            borrowDiv.className = 'sub-borrow-value';
            borrowDiv.textContent = '10';
            borrowDiv.style.opacity = '0';
            numbersRow.appendChild(borrowDiv);
            
            const borrowPlus = document.createElement('div');
            borrowPlus.className = 'sub-plus';
            borrowPlus.textContent = '+';
            numbersRow.appendChild(borrowPlus);
        }
        
        // Minuend digit (after borrowing if applicable)
        const minuendDiv = document.createElement('div');
        minuendDiv.className = 'sub-number minuend';
        minuendDiv.textContent = currentColData.actualMinDigit;
        minuendDiv.style.opacity = '0';
        numbersRow.appendChild(minuendDiv);
        
        // Minus sign
        const minusDiv = document.createElement('div');
        minusDiv.className = 'sub-minus';
        minusDiv.textContent = '−';
        numbersRow.appendChild(minusDiv);
        
        // Subtrahend digit
        const subtrahendDiv = document.createElement('div');
        subtrahendDiv.className = 'sub-number subtrahend';
        subtrahendDiv.textContent = currentColData.subDigit;
        subtrahendDiv.style.opacity = '0';
        numbersRow.appendChild(subtrahendDiv);
        
        subDisplay.appendChild(numbersRow);
        
        // Line
        const lineDiv = document.createElement('div');
        lineDiv.className = 'sub-line';
        subDisplay.appendChild(lineDiv);
        
        // Answer
        const answerDiv = document.createElement('div');
        if (currentColData.answered) {
            answerDiv.className = `sub-answer ${currentColData.correct ? 'correct' : 'incorrect'}`;
            answerDiv.textContent = currentColData.result;
        } else {
            answerDiv.className = 'sub-answer-placeholder';
            answerDiv.textContent = '?';
        }
        subDisplay.appendChild(answerDiv);
        
        subContainer.appendChild(subDisplay);
        
        // Instructions
        const instructions = document.createElement('div');
        instructions.className = 'sub-instructions';
        
        let instructionText = `<p><strong>Step:</strong> Subtract the ${currentColumn} column</p>`;
        
        if (currentColData.needsBorrow) {
            instructionText += `<p class="borrow-explanation">First borrow 10 from ${currentColData.borrowedFrom} column:</p>`;
            instructionText += `<p>${currentColData.actualMinDigit} − ${currentColData.subDigit}</p>`;
        } else {
            instructionText += `<p>${currentColData.minDigit} − ${currentColData.subDigit}</p>`;
        }
        
        instructionText += `<p>Enter the difference below:</p>`;
        
        instructions.innerHTML = instructionText;
        subContainer.appendChild(instructions);
        
        subProblemDiv.appendChild(subContainer);
        
        // If column hasn't been answered yet, animate values
        if (!currentColData.answered && !hasCurrentColumnValues) {
            setTimeout(async () => {
                highlightSourceColumn();
                await animateToCurrentColumn();
                
                setTimeout(() => {
                    document.querySelectorAll('.sub-number, .sub-borrow-value').forEach(el => {
                        el.style.opacity = '1';
                        el.classList.add('animate-drop-in');
                    });
                }, 50);
            }, 100);
        } else {
            setTimeout(() => {
                document.querySelectorAll('.sub-number, .sub-borrow-value').forEach(el => {
                    el.style.opacity = '1';
                });
            }, 100);
        }
    }
    
    // ===== GAME LOGIC FUNCTIONS =====
    
    async function checkSubAnswer() {
        const userAnswer = parseInt(subAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            showSubFeedback('Please enter a valid number', 'incorrect');
            return;
        }
        
        const currentColData = currentProblem.columns.find(c => c.column === currentColumn);
        if (!currentColData) return;
        
        scores.total++;
        
        if (userAnswer === currentColData.result) {
            scores.correct++;
            currentColData.answered = true;
            currentColData.correct = true;
            
            // Make borrow visible for this column
            if (currentColData.needsBorrow) {
                currentColData.borrowVisible = true;
            }
            
            showSubFeedback(`✓ Correct! ${currentColData.actualMinDigit} − ${currentColData.subDigit} = ${currentColData.result}`, 'correct');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
            // Update answer in sub-problem
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.result;
                answerDiv.className = 'sub-answer correct';
                answerDiv.classList.add('animate-drop-in');
            }
            
            // Animate answer to main problem
            await animateAnswerToMain();
            
        } else {
            scores.incorrect++;
            currentColData.answered = true;
            currentColData.correct = false;
            
            showSubFeedback(`✗ Incorrect. ${currentColData.actualMinDigit} − ${currentColData.subDigit} = ${currentColData.result}`, 'incorrect');
            subAnswerInput.disabled = true;
            nextColumnBtn.disabled = false;
            nextColumnBtn.focus();
            
            const answerDiv = document.querySelector('.sub-answer-placeholder, .sub-answer');
            if (answerDiv) {
                answerDiv.textContent = currentColData.result;
                answerDiv.className = 'sub-answer incorrect';
            }
        }
        
        updateScoreDisplay();
        
        setTimeout(() => {
            renderMainGrid();
        }, 1000);
        
        if (isProblemComplete()) {
            setTimeout(() => {
                showFeedback('🎉 Problem solved! Well done!', 'correct');
            }, 1500);
        }
    }
    
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
        const saved = localStorage.getItem('subtractionScores');
        if (saved) {
            scores = JSON.parse(saved);
            updateScoreDisplay();
        }
    }
    
    function saveScores() {
        localStorage.setItem('subtractionScores', JSON.stringify(scores));
    }
    
    function resetScores() {
        if (confirm('Reset all subtraction practice scores?')) {
            scores = { correct: 0, incorrect: 0, total: 0 };
            localStorage.removeItem('subtractionScores');
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
