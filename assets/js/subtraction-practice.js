// Subtraction Practice with Borrowing Decision Process
// Three-Question Borrowing System for 2nd-3rd Grade

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let currentStage = 1; // 1-4: Borrow decision stages
    
    // Scores tracking
    let scores = {
        total: 0,
        correct: 0,
        incorrect: 0,
        borrowingDecisions: {
            stage1: { correct: 0, total: 0 },
            stage2: { correct: 0, total: 0 },
            stage3: { correct: 0, total: 0 }
        },
        computations: { correct: 0, total: 0 }
    };
    
    // Borrowing decision state
    let borrowingDecision = {
        stage1: { userAnswer: null, correctAnswer: null },
        stage2: { userAnswer: null, correctAnswer: null },
        stage3: { userAnswer: null, correctAnswer: null },
        selectedSource: null,
        borrowingChain: []
    };
    
    // Animation state
    let isAnimating = false;
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const mainActionBtn = document.getElementById('mainActionBtn');
    const newProblemBtn = document.getElementById('newProblem');
    const showAllStepsBtn = document.getElementById('showAllSteps');
    const resetScoresBtn = document.getElementById('resetScores');
    
    // Stage elements
    const stage1 = document.getElementById('stage1');
    const stage2 = document.getElementById('stage2');
    const stage3 = document.getElementById('stage3');
    const stage4 = document.getElementById('stage4');
    
    // Stage 1 elements
    const stage1TopDigit = document.getElementById('stage1TopDigit');
    const stage1BottomDigit = document.getElementById('stage1BottomDigit');
    const comparisonHint = document.getElementById('comparisonHint');
    
    // Stage 2 elements
    const currentColumnDisplay = document.getElementById('currentColumnDisplay');
    const leftColumnDisplay = document.getElementById('leftColumnDisplay');
    const zeroWarning = document.getElementById('zeroWarning');
    const stage2Question = document.getElementById('stage2Question');
    
    // Stage 3 elements
    const allColumnsDisplay = document.getElementById('allColumnsDisplay');
    const sourceOptions = document.getElementById('sourceOptions');
    
    // Stage 4 elements
    const subProblemDisplay = document.getElementById('subProblemDisplay');
    const currentNumberEl = document.getElementById('currentNumber');
    const submitComputationBtn = document.getElementById('submitComputation');
    
    // Score display elements
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const totalCountEl = document.getElementById('totalCount');
    const accuracyRateEl = document.getElementById('accuracyRate');
    const step1CorrectEl = document.getElementById('step1Correct');
    const step2CorrectEl = document.getElementById('step2Correct');
    const step3CorrectEl = document.getElementById('step3Correct');
    const computationCorrectEl = document.getElementById('computationCorrect');
    
    // ===== PROBLEM GENERATION =====
    
    function generateSubtractionProblem() {
        let num1, num2;
        
        // Generate random 3-digit numbers ensuring num1 ≥ num2
        do {
            num1 = Math.floor(Math.random() * 900) + 100; // 100-999
            num2 = Math.floor(Math.random() * 900) + 100;
        } while (num1 < num2);
        
        const answer = num1 - num2;
        
        // Get digits
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
            currentState: {
                hundreds: { top: num1Digits.hundreds, bottom: num2Digits.hundreds },
                tens: { top: num1Digits.tens, bottom: num2Digits.tens },
                ones: { top: num1Digits.ones, bottom: num2Digits.ones }
            },
            columns: [],
            completedColumns: 0
        };
        
        // Initialize columns array
        ['ones', 'tens', 'hundreds'].forEach(column => {
            currentProblem.columns.push({
                column: column,
                topOriginal: currentProblem.currentState[column].top,
                bottom: currentProblem.currentState[column].bottom,
                topCurrent: currentProblem.currentState[column].top,
                needsBorrow: null,
                borrowed: false,
                answer: null,
                correct: null,
                completed: false
            });
        });
        
        // Reset state
        currentColumn = 'ones';
        currentStage = 1;
        borrowingDecision = {
            stage1: { userAnswer: null, correctAnswer: null },
            stage2: { userAnswer: null, correctAnswer: null },
            stage3: { userAnswer: null, correctAnswer: null },
            selectedSource: null,
            borrowingChain: []
        };
        
        renderMainGrid();
        setupStage1();
        clearFeedback();
        updateScoreDisplay();
        
        console.log('New problem:', currentProblem);
    }
    
    // ===== STAGE MANAGEMENT =====
    
    function setupStage1() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Update display
        stage1TopDigit.textContent = colData.topCurrent;
        stage1BottomDigit.textContent = colData.bottom;
        
        // Show comparison hint
        const needsBorrow = colData.topCurrent < colData.bottom;
        comparisonHint.textContent = needsBorrow ? 
            `${colData.topCurrent} < ${colData.bottom}` : 
            `${colData.topCurrent} ≥ ${colData.bottom}`;
        comparisonHint.className = needsBorrow ? 'comparison-hint needs-borrow' : 'comparison-hint no-borrow';
        
        // Set correct answer for validation
        borrowingDecision.stage1.correctAnswer = needsBorrow;
        
        // Show stage 1
        showStage(1);
        
        // Update stage 1 question buttons
        document.querySelectorAll('#stage1 .btn-decision').forEach(btn => {
            btn.onclick = function() {
                const userAnswer = this.dataset.decision === 'yes';
                handleStage1Decision(userAnswer);
            };
        });
    }
    
    function setupStage2() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Update display
        currentColumnDisplay.textContent = `${capitalize(currentColumn)}: ${colData.topCurrent} - ${colData.bottom}`;
        
        if (leftColData) {
            leftColumnDisplay.textContent = `${capitalize(leftColumn)}: ${leftColData.topCurrent} - ${leftColData.bottom}`;
            
            // Update question text
            stage2Question.textContent = `Is there enough to borrow from the ${leftColumn} column?`;
            
            // Show/hide zero warning
            if (leftColData.topCurrent === 0) {
                zeroWarning.style.display = 'block';
                zeroWarning.textContent = `⚠️ The ${leftColumn} column has 0. Can't borrow from 0!`;
            } else {
                zeroWarning.style.display = 'none';
            }
            
            // Set correct answer: enough if top ≥ 1
            borrowingDecision.stage2.correctAnswer = leftColData.topCurrent >= 1;
        } else {
            // No left column (shouldn't happen with ones)
            leftColumnDisplay.textContent = 'No column to the left';
            borrowingDecision.stage2.correctAnswer = false;
        }
        
        // Show stage 2
        showStage(2);
        
        // Update stage 2 question buttons
        document.querySelectorAll('#stage2 .btn-decision').forEach(btn => {
            btn.onclick = function() {
                const userAnswer = this.dataset.decision === 'yes';
                handleStage2Decision(userAnswer);
            };
        });
    }
    
    function setupStage3() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display all columns
        let columnsHtml = '';
        for (const col of columns) {
            const data = getColumnData(col);
            columnsHtml += `<div class="context-column ${col === currentColumn ? 'current' : ''}">
                <span class="column-name">${capitalize(col)}:</span>
                <span class="column-digits">${data.topCurrent} - ${data.bottom}</span>
            </div>`;
        }
        allColumnsDisplay.innerHTML = columnsHtml;
        
        // Find available sources
        const availableSources = findAvailableSources();
        
        // Create source options
        let optionsHtml = '';
        
        if (availableSources.length > 0) {
            availableSources.forEach(source => {
                const sourceData = getColumnData(source);
                optionsHtml += `
                <button class="source-option" data-source="${source}">
                    ${capitalize(source)} column (${sourceData.topCurrent} - ${sourceData.bottom})
                </button>`;
            });
        } else {
            optionsHtml = '<div class="no-sources">No columns available for borrowing</div>';
        }
        
        sourceOptions.innerHTML = optionsHtml;
        
        // Add event listeners
        document.querySelectorAll('.source-option').forEach(btn => {
            btn.onclick = function() {
                handleStage3Decision(this.dataset.source);
            };
        });
        
        // Show stage 3
        showStage(3);
    }
    
    function setupStage4() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display the actual subtraction to compute
        let displayHtml = '';
        
        if (colData.borrowed) {
            // Show with borrowing indicator
            displayHtml = `
            <div class="sub-problem-with-borrow">
                <div class="borrow-indicator">1</div>
                <div class="subtraction-display">
                    <div class="top-digit">${colData.topCurrent}</div>
                    <div class="operator">-</div>
                    <div class="bottom-digit">${colData.bottom}</div>
                </div>
            </div>
            <div class="equals-line">=</div>
            <div class="answer-placeholder">?</div>`;
        } else {
            // Simple subtraction
            displayHtml = `
            <div class="subtraction-display">
                <div class="top-digit">${colData.topCurrent}</div>
                <div class="operator">-</div>
                <div class="bottom-digit">${colData.bottom}</div>
            </div>
            <div class="equals-line">=</div>
            <div class="answer-placeholder">?</div>`;
        }
        
        subProblemDisplay.innerHTML = displayHtml;
        
        // Reset number controls
        resetNumberControls();
        
        // Show stage 4
        showStage(4);
    }
    
    function showStage(stageNumber) {
        // Hide all stages
        [stage1, stage2, stage3, stage4].forEach(stage => {
            stage.classList.remove('active');
        });
        
        // Show requested stage
        const stageToShow = document.getElementById(`stage${stageNumber}`);
        if (stageToShow) {
            stageToShow.classList.add('active');
        }
        
        currentStage = stageNumber;
    }
    
    // ===== DECISION HANDLERS =====
    
    function handleStage1Decision(userAnswer) {
        const correctAnswer = borrowingDecision.stage1.correctAnswer;
        const colData = getCurrentColumnData();
        
        // Track decision
        scores.borrowingDecisions.stage1.total++;
        borrowingDecision.stage1.userAnswer = userAnswer;
        
        if (userAnswer === correctAnswer) {
            // Correct decision
            scores.borrowingDecisions.stage1.correct++;
            
            if (correctAnswer) {
                // They correctly said "Yes, need to borrow"
                showFeedback("✓ Correct! We need to borrow because the top digit is smaller.", 'correct');
                setTimeout(() => setupStage2(), 1000);
            } else {
                // They correctly said "No, don't need to borrow"
                showFeedback("✓ Correct! No borrowing needed.", 'correct');
                // Skip to computation (since no borrowing needed)
                colData.needsBorrow = false;
                setTimeout(() => setupStage4(), 1000);
            }
        } else {
            // Incorrect decision
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We DO need to borrow because ${colData.topCurrent} < ${colData.bottom}` :
                    `No borrowing needed because ${colData.topCurrent} ≥ ${colData.bottom}`), 
                'incorrect');
            
            // Still proceed to next stage with correct info
            colData.needsBorrow = correctAnswer;
            setTimeout(() => {
                if (correctAnswer) {
                    setupStage2();
                } else {
                    setupStage4();
                }
            }, 1500);
        }
        
        updateScoreDisplay();
    }
    
    function handleStage2Decision(userAnswer) {
        const correctAnswer = borrowingDecision.stage2.correctAnswer;
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Track decision
        scores.borrowingDecisions.stage2.total++;
        borrowingDecision.stage2.userAnswer = userAnswer;
        
        if (userAnswer === correctAnswer) {
            // Correct decision
            scores.borrowingDecisions.stage2.correct++;
            
            if (correctAnswer) {
                // Enough in immediate column - proceed with borrowing
                showFeedback("✓ Correct! We can borrow from the " + leftColumn + " column.", 'correct');
                executeSimpleBorrow(leftColumn);
            } else {
                // Not enough in immediate column - find alternative
                showFeedback("✓ Right! Not enough in the " + leftColumn + " column.", 'correct');
                setTimeout(() => setupStage3(), 1000);
            }
        } else {
            // Incorrect decision
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We CAN borrow from ${leftColumn} because it has ${leftColData.topCurrent}` :
                    `We CAN'T borrow from ${leftColumn} because it has ${leftColData.topCurrent}`), 
                'incorrect');
            
            // Proceed with correct path
            setTimeout(() => {
                if (correctAnswer) {
                    executeSimpleBorrow(leftColumn);
                } else {
                    setupStage3();
                }
            }, 1500);
        }
        
        updateScoreDisplay();
    }
    
    function handleStage3Decision(selectedSource) {
        // Track decision
        scores.borrowingDecisions.stage3.total++;
        borrowingDecision.stage3.userAnswer = selectedSource;
        
        // Validate selection
        const colData = getColumnData(selectedSource);
        const isValid = colData && colData.topCurrent >= 1;
        
        if (isValid) {
            // Correct source selection
            scores.borrowingDecisions.stage3.correct++;
            borrowingDecision.selectedSource = selectedSource;
            
            showFeedback("✓ Good choice! We'll borrow from the " + selectedSource + " column.", 'correct');
            
            // Create borrowing chain
            const chain = createBorrowingChain(selectedSource);
            borrowingDecision.borrowingChain = chain;
            
            // Execute chain borrowing
            executeChainBorrowing(chain);
        } else {
            // Invalid selection
            showFeedback("✗ Can't borrow from that column. Choose a column with at least 1.", 'incorrect');
        }
        
        updateScoreDisplay();
    }
    
    // ===== BORROWING EXECUTION =====
    
    function executeSimpleBorrow(sourceColumn) {
        const targetColumn = currentColumn;
        const targetData = getCurrentColumnData();
        const sourceData = getColumnData(sourceColumn);
        
        if (!sourceData || sourceData.topCurrent < 1) {
            showFeedback("Error: Can't borrow from empty column", 'error');
            return;
        }
        
        // Update digits
        sourceData.topCurrent -= 1;
        targetData.topCurrent += 10;
        targetData.borrowed = true;
        
        // Show borrowing animation
        animateBorrow(sourceColumn, targetColumn, () => {
            showFeedback("✓ Borrowed 1 from " + sourceColumn + " column.", 'correct');
            renderMainGrid();
            setTimeout(() => setupStage4(), 1000);
        });
    }
    
    function executeChainBorrowing(chain) {
        // chain is array like ['hundreds', 'tens', 'ones']
        if (chain.length < 2) {
            showFeedback("Error: Invalid borrowing chain", 'error');
            return;
        }
        
        // Execute borrowing step by step
        const executeStep = (index) => {
            if (index >= chain.length - 1) {
                // All steps complete
                const targetData = getCurrentColumnData();
                targetData.borrowed = true;
                
                showFeedback("✓ Chain borrowing complete!", 'correct');
                renderMainGrid();
                setTimeout(() => setupStage4(), 1000);
                return;
            }
            
            const from = chain[index];
            const to = chain[index + 1];
            const fromData = getColumnData(from);
            const toData = getColumnData(to);
            
            // Update digits
            fromData.topCurrent -= 1;
            toData.topCurrent += 10;
            
            // Animate this step
            animateBorrow(from, to, () => {
                renderMainGrid();
                
                // Show progress message
                if (index < chain.length - 2) {
                    showFeedback(`Now borrowing from ${to} to ${chain[index + 2]}...`, 'info');
                }
                
                // Next step after delay
                setTimeout(() => executeStep(index + 1), 1000);
            });
        };
        
        showFeedback("Starting chain borrowing...", 'info');
        executeStep(0);
    }
    
    function createBorrowingChain(sourceColumn) {
        const chain = [sourceColumn];
        let current = sourceColumn;
        
        // Build chain from source to target
        while (current !== currentColumn) {
            const next = getRightColumn(current);
            if (next) {
                chain.push(next);
                current = next;
            } else {
                break;
            }
        }
        
        return chain;
    }
    
    // ===== COMPUTATION HANDLING =====
    
    function initNumberControls() {
        let currentNumber = 0;
        
        function updateDisplay() {
            currentNumberEl.textContent = currentNumber;
        }
        
        // Handle number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('clear')) {
                    currentNumber = 0;
                } else if (btn.classList.contains('increment') || btn.classList.contains('decrement')) {
                    const change = parseInt(btn.getAttribute('data-change'));
                    const newValue = currentNumber + change;
                    
                    // Limit to reasonable range for subtraction
                    if (newValue >= 0 && newValue <= 99) {
                        currentNumber = newValue;
                    }
                }
                
                updateDisplay();
            });
        });
        
        // Submit computation
        submitComputationBtn.addEventListener('click', checkComputation);
        
        // Reset function
        window.resetNumberControls = function() {
            currentNumber = 0;
            updateDisplay();
        };
        
        updateDisplay();
    }
    
    function checkComputation() {
        const userAnswer = parseInt(currentNumberEl.textContent) || 0;
        const colData = getCurrentColumnData();
        
        if (!colData) return;
        
        const correctAnswer = colData.topCurrent - colData.bottom;
        
        // Track computation
        scores.computations.total++;
        
        if (userAnswer === correctAnswer) {
            // Correct computation
            scores.computations.correct++;
            colData.answer = userAnswer;
            colData.correct = true;
            colData.completed = true;
            
            showFeedback(`✓ Perfect! ${colData.topCurrent} - ${colData.bottom} = ${correctAnswer}`, 'correct');
            
            // Animate answer to main grid
            animateAnswerToGrid(colData.column, userAnswer, () => {
                // Move to next column or complete problem
                if (moveToNextColumn()) {
                    setupStage1();
                } else {
                    completeProblem();
                }
            });
            
        } else {
            // Incorrect computation
            showFeedback(`✗ Incorrect. ${colData.topCurrent} - ${colData.bottom} = ${correctAnswer}`, 'incorrect');
            // Let them try again
        }
        
        updateScoreDisplay();
    }
    
    // ===== NAVIGATION =====
    
    function moveToNextColumn() {
        const currentIndex = columns.indexOf(currentColumn);
        
        for (let i = currentIndex + 1; i < columns.length; i++) {
            const nextCol = columns[i];
            const colData = getColumnData(nextCol);
            
            if (!colData.completed) {
                currentColumn = nextCol;
                currentStage = 1;
                
                // Reset decision state for new column
                borrowingDecision = {
                    stage1: { userAnswer: null, correctAnswer: null },
                    stage2: { userAnswer: null, correctAnswer: null },
                    stage3: { userAnswer: null, correctAnswer: null },
                    selectedSource: null,
                    borrowingChain: []
                };
                
                return true;
            }
        }
        
        return false; // No more columns
    }
    
    function completeProblem() {
        showFeedback("🎉 Problem Complete! Well done!", 'correct');
        
        // Show completion screen
        subProblemDisplay.innerHTML = `
        <div class="completion-screen">
            <h3>Problem Solved!</h3>
            <div class="final-result">
                ${currentProblem.num1} - ${currentProblem.num2} = ${currentProblem.answer}
            </div>
            <button id="nextProblem" class="combined-action-btn">Next Problem</button>
        </div>`;
        
        document.getElementById('nextProblem').addEventListener('click', generateSubtractionProblem);
    }
    
    // ===== HELPER FUNCTIONS =====
    
    function getCurrentColumnData() {
        return currentProblem.columns.find(c => c.column === currentColumn);
    }
    
    function getColumnData(column) {
        return currentProblem.columns.find(c => c.column === column);
    }
    
    function getLeftColumn(column) {
        const order = ['ones', 'tens', 'hundreds'];
        const index = order.indexOf(column);
        return index < order.length - 1 ? order[index + 1] : null;
    }
    
    function getRightColumn(column) {
        const order = ['ones', 'tens', 'hundreds'];
        const index = order.indexOf(column);
        return index > 0 ? order[index - 1] : null;
    }
    
    function findAvailableSources() {
        const available = [];
        let checking = getLeftColumn(currentColumn);
        
        while (checking) {
            const data = getColumnData(checking);
            if (data && data.topCurrent >= 1) {
                available.push(checking);
                break; // Only need the first available
            }
            checking = getLeftColumn(checking);
        }
        
        return available;
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // ===== ANIMATION FUNCTIONS =====
    
    function animateBorrow(fromColumn, toColumn, callback) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Simple animation - in a real implementation, you'd use CSS animations
        // similar to the addition version
        
        setTimeout(() => {
            isAnimating = false;
            if (callback) callback();
        }, 800);
    }
    
    function animateAnswerToGrid(column, answer, callback) {
        if (isAnimating) return;
        isAnimating = true;
        
        // Simple animation - in a real implementation, you'd use CSS animations
        // similar to the addition version
        
        setTimeout(() => {
            isAnimating = false;
            if (callback) callback();
        }, 800);
    }
    
    // ===== RENDERING FUNCTIONS =====
    
    function renderMainGrid() {
        problemGrid.innerHTML = '';
        
        // Create 5 rows × 4 columns grid (same as addition)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Determine cell content based on position
                if (row === 0) { // Borrow row
                    cell.className += ' borrow-cell';
                    cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : col === 3 ? 'ones' : '';
                    
                    if (cell.dataset.column) {
                        const colData = getColumnData(cell.dataset.column);
                        if (colData && colData.borrowed) {
                            // Show borrow indicator
                            const indicator = document.createElement('div');
                            indicator.className = 'borrow-indicator-small';
                            indicator.textContent = '1';
                            cell.appendChild(indicator);
                        }
                    }
                }
                else if (row === 1) { // First number row (minuend)
                    if (col === 0) {
                        cell.className += ' minus-column';
                    } else {
                        cell.className += ' number-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        const colData = getColumnData(cell.dataset.column);
                        if (colData) {
                            cell.textContent = colData.topCurrent;
                            
                            // Cross out if changed from original
                            if (colData.topCurrent !== colData.topOriginal) {
                                cell.classList.add('adjusted');
                            }
                        }
                    }
                }
                else if (row === 2) { // Second number row (subtrahend)
                    if (col === 0) {
                        cell.className += ' minus-column';
                        cell.textContent = '-';
                    } else {
                        cell.className += ' number-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        const colData = getColumnData(cell.dataset.column);
                        if (colData) {
                            cell.textContent = colData.bottom;
                        }
                    }
                }
                else if (row === 3) { // Line row
                    cell.className += ' line';
                }
                else if (row === 4) { // Answer row
                    if (col === 0) {
                        cell.className += ' minus-column answer-cell';
                    } else {
                        cell.className += ' answer-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        
                        const colData = getColumnData(cell.dataset.column);
                        if (colData && colData.completed) {
                            cell.textContent = colData.answer;
                            cell.classList.add(colData.correct ? 'correct' : 'incorrect');
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
    
    // ===== FEEDBACK FUNCTIONS =====
    
    function showFeedback(message, type) {
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = message;
            subFeedbackDiv.className = `sub-feedback ${type}`;
            
            // Auto-clear feedback after some time
            setTimeout(() => {
                if (subFeedbackDiv.textContent === message) {
                    subFeedbackDiv.textContent = '';
                    subFeedbackDiv.className = 'sub-feedback';
                }
            }, 3000);
        }
    }
    
    function clearFeedback() {
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = '';
            subFeedbackDiv.className = 'sub-feedback';
        }
    }
    
    // ===== SCORE MANAGEMENT =====
    
    function updateScoreDisplay() {
        // Basic scores
        if (correctCountEl) correctCountEl.textContent = scores.correct;
        if (incorrectCountEl) incorrectCountEl.textContent = scores.incorrect;
        if (totalCountEl) totalCountEl.textContent = scores.total;
        
        // Accuracy
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
        
        // Borrowing decision stats
        if (step1CorrectEl) {
            const rate1 = scores.borrowingDecisions.stage1.total > 0 ?
                Math.round((scores.borrowingDecisions.stage1.correct / scores.borrowingDecisions.stage1.total) * 100) : 0;
            step1CorrectEl.textContent = `${scores.borrowingDecisions.stage1.correct}/${scores.borrowingDecisions.stage1.total} (${rate1}%)`;
        }
        
        if (step2CorrectEl) {
            const rate2 = scores.borrowingDecisions.stage2.total > 0 ?
                Math.round((scores.borrowingDecisions.stage2.correct / scores.borrowingDecisions.stage2.total) * 100) : 0;
            step2CorrectEl.textContent = `${scores.borrowingDecisions.stage2.correct}/${scores.borrowingDecisions.stage2.total} (${rate2}%)`;
        }
        
        if (step3CorrectEl) {
            const rate3 = scores.borrowingDecisions.stage3.total > 0 ?
                Math.round((scores.borrowingDecisions.stage3.correct / scores.borrowingDecisions.stage3.total) * 100) : 0;
            step3CorrectEl.textContent = `${scores.borrowingDecisions.stage3.correct}/${scores.borrowingDecisions.stage3.total} (${rate3}%)`;
        }
        
        // Computation stats
        if (computationCorrectEl) {
            const compRate = scores.computations.total > 0 ?
                Math.round((scores.computations.correct / scores.computations.total) * 100) : 0;
            computationCorrectEl.textContent = `${scores.computations.correct}/${scores.computations.total} (${compRate}%)`;
        }
        
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
            scores = {
                total: 0,
                correct: 0,
                incorrect: 0,
                borrowingDecisions: {
                    stage1: { correct: 0, total: 0 },
                    stage2: { correct: 0, total: 0 },
                    stage3: { correct: 0, total: 0 }
                },
                computations: { correct: 0, total: 0 }
            };
            localStorage.removeItem('subtractionScores');
            updateScoreDisplay();
            generateSubtractionProblem();
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    newProblemBtn.addEventListener('click', generateSubtractionProblem);
    resetScoresBtn.addEventListener('click', resetScores);
    
    if (showAllStepsBtn) {
        showAllStepsBtn.addEventListener('click', function() {
            // Toggle showing all decision steps at once
            const stages = document.querySelectorAll('.decision-stage');
            stages.forEach(stage => {
                stage.style.display = stage.style.display === 'none' ? 'block' : 'none';
            });
        });
    }
    
    // ===== INITIALIZATION =====
    
    initNumberControls();
    loadScores();
    generateSubtractionProblem();
});
