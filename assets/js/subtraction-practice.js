// Subtraction Practice with Borrowing Decision Process - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Subtraction Practice: Initializing...');
    
    // Check for required elements
    const requiredElements = ['problemGrid', 'stage1', 'stage2', 'stage3', 'stage4', 
                             'stage1TopDigit', 'stage1BottomDigit', 'comparisonHint',
                             'currentColumnDisplay', 'leftColumnDisplay', 'zeroWarning',
                             'stage2Question', 'allColumnsDisplay', 'sourceOptions',
                             'subProblemDisplay', 'currentNumber', 'submitComputation',
                             'newProblem', 'resetScores', 'subFeedback'];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Missing required element: #${id}`);
        }
    });
    
    // State management
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let currentStage = 1;
    
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
    
    // DOM elements (with null checks)
    const problemGrid = document.getElementById('problemGrid');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const newProblemBtn = document.getElementById('newProblem');
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
    
    // ===== INITIALIZATION =====
    
    function initialize() {
        console.log('Initializing subtraction practice...');
        
        // Initialize number controls
        initNumberControls();
        
        // Load saved scores
        loadScores();
        
        // Generate first problem
        generateSubtractionProblem();
        
        // Set up event listeners
        if (newProblemBtn) {
            newProblemBtn.addEventListener('click', generateSubtractionProblem);
        }
        
        if (resetScoresBtn) {
            resetScoresBtn.addEventListener('click', resetScores);
        }
        
        // Setup stage 1 button handlers
        setupStage1ButtonHandlers();
        
        console.log('Initialization complete');
    }
    
    // ===== PROBLEM GENERATION =====
    
    function generateSubtractionProblem() {
        console.log('Generating new subtraction problem...');
        
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
        
        // Update UI
        renderMainGrid();
        setupStage1();
        clearFeedback();
        updateScoreDisplay();
        
        console.log('New problem generated:', currentProblem);
    }
    
    // ===== STAGE MANAGEMENT =====
    
    function setupStage1() {
        console.log('Setting up stage 1');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Update display
        if (stage1TopDigit) stage1TopDigit.textContent = colData.topCurrent;
        if (stage1BottomDigit) stage1BottomDigit.textContent = colData.bottom;
        
        // Show comparison hint
        const needsBorrow = colData.topCurrent < colData.bottom;
        if (comparisonHint) {
            comparisonHint.textContent = needsBorrow ? 
                `${colData.topCurrent} < ${colData.bottom}` : 
                `${colData.topCurrent} ≥ ${colData.bottom}`;
            comparisonHint.className = needsBorrow ? 'comparison-hint needs-borrow' : 'comparison-hint no-borrow';
        }
        
        // Set correct answer for validation
        borrowingDecision.stage1.correctAnswer = needsBorrow;
        
        // Show stage 1
        showStage(1);
    }
    
    function setupStage1ButtonHandlers() {
        // Setup Yes/No buttons for stage 1
        const stage1YesBtn = document.querySelector('#stage1 .btn-yes');
        const stage1NoBtn = document.querySelector('#stage1 .btn-no');
        
        if (stage1YesBtn) {
            stage1YesBtn.onclick = function() {
                handleStage1Decision(true);
            };
        }
        
        if (stage1NoBtn) {
            stage1NoBtn.onclick = function() {
                handleStage1Decision(false);
            };
        }
    }
    
    function setupStage2() {
        console.log('Setting up stage 2');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Update display
        if (currentColumnDisplay) {
            currentColumnDisplay.textContent = `${capitalize(currentColumn)}: ${colData.topCurrent} - ${colData.bottom}`;
        }
        
        if (leftColumnDisplay && leftColData) {
            leftColumnDisplay.textContent = `${capitalize(leftColumn)}: ${leftColData.topCurrent} - ${leftColData.bottom}`;
            
            // Update question text
            if (stage2Question) {
                stage2Question.textContent = `Is there enough to borrow from the ${leftColumn} column?`;
            }
            
            // Show/hide zero warning
            if (zeroWarning) {
                if (leftColData.topCurrent === 0) {
                    zeroWarning.style.display = 'block';
                    zeroWarning.textContent = `⚠️ The ${leftColumn} column has 0. Can't borrow from 0!`;
                } else {
                    zeroWarning.style.display = 'none';
                }
            }
            
            // Set correct answer: enough if top ≥ 1
            borrowingDecision.stage2.correctAnswer = leftColData.topCurrent >= 1;
        }
        
        // Setup stage 2 button handlers
        const stage2YesBtn = document.querySelector('#stage2 .btn-yes');
        const stage2NoBtn = document.querySelector('#stage2 .btn-no');
        
        if (stage2YesBtn) {
            stage2YesBtn.onclick = function() {
                handleStage2Decision(true);
            };
        }
        
        if (stage2NoBtn) {
            stage2NoBtn.onclick = function() {
                handleStage2Decision(false);
            };
        }
        
        // Show stage 2
        showStage(2);
    }
    
    function setupStage3() {
        console.log('Setting up stage 3');
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
        
        if (allColumnsDisplay) {
            allColumnsDisplay.innerHTML = columnsHtml;
        }
        
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
        
        if (sourceOptions) {
            sourceOptions.innerHTML = optionsHtml;
            
            // Add event listeners
            document.querySelectorAll('.source-option').forEach(btn => {
                btn.onclick = function() {
                    handleStage3Decision(this.dataset.source);
                };
            });
        }
        
        // Show stage 3
        showStage(3);
    }
    
    function setupStage4() {
        console.log('Setting up stage 4');
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
        
        if (subProblemDisplay) {
            subProblemDisplay.innerHTML = displayHtml;
        }
        
        // Reset number controls
        if (window.resetNumberControls) {
            window.resetNumberControls();
        }
        
        // Show stage 4
        showStage(4);
    }
    
    function showStage(stageNumber) {
        console.log(`Showing stage ${stageNumber}`);
        // Hide all stages
        [stage1, stage2, stage3, stage4].forEach(stage => {
            if (stage) {
                stage.classList.remove('active');
                stage.style.display = 'none';
            }
        });
        
        // Show requested stage
        const stageToShow = document.getElementById(`stage${stageNumber}`);
        if (stageToShow) {
            stageToShow.classList.add('active');
            stageToShow.style.display = 'block';
        }
        
        currentStage = stageNumber;
    }
    
    // ===== DECISION HANDLERS (SIMPLIFIED) =====
    
    function handleStage1Decision(userAnswer) {
        console.log(`Stage 1 decision: ${userAnswer ? 'Yes' : 'No'}`);
        const correctAnswer = borrowingDecision.stage1.correctAnswer;
        const colData = getCurrentColumnData();
        
        // Track decision
        scores.borrowingDecisions.stage1.total++;
        borrowingDecision.stage1.userAnswer = userAnswer;
        
        if (userAnswer === correctAnswer) {
            // Correct decision
            scores.borrowingDecisions.stage1.correct++;
            
            if (correctAnswer) {
                showFeedback("✓ Correct! We need to borrow because the top digit is smaller.", 'correct');
                setTimeout(() => setupStage2(), 1000);
            } else {
                showFeedback("✓ Correct! No borrowing needed.", 'correct');
                colData.needsBorrow = false;
                setTimeout(() => setupStage4(), 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We DO need to borrow because ${colData.topCurrent} < ${colData.bottom}` :
                    `No borrowing needed because ${colData.topCurrent} ≥ ${colData.bottom}`), 
                'incorrect');
            
            // Still proceed with correct info
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
        console.log(`Stage 2 decision: ${userAnswer ? 'Yes' : 'No'}`);
        const correctAnswer = borrowingDecision.stage2.correctAnswer;
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Track decision
        scores.borrowingDecisions.stage2.total++;
        borrowingDecision.stage2.userAnswer = userAnswer;
        
        if (userAnswer === correctAnswer) {
            scores.borrowingDecisions.stage2.correct++;
            
            if (correctAnswer) {
                showFeedback("✓ Correct! We can borrow from the " + leftColumn + " column.", 'correct');
                executeSimpleBorrow(leftColumn);
            } else {
                showFeedback("✓ Right! Not enough in the " + leftColumn + " column.", 'correct');
                setTimeout(() => setupStage3(), 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We CAN borrow from ${leftColumn} because it has ${leftColData.topCurrent}` :
                    `We CAN'T borrow from ${leftColumn} because it has ${leftColData.topCurrent}`), 
                'incorrect');
            
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
        console.log(`Stage 3 decision: ${selectedSource}`);
        scores.borrowingDecisions.stage3.total++;
        borrowingDecision.stage3.userAnswer = selectedSource;
        
        // Validate selection
        const colData = getColumnData(selectedSource);
        const isValid = colData && colData.topCurrent >= 1;
        
        if (isValid) {
            scores.borrowingDecisions.stage3.correct++;
            borrowingDecision.selectedSource = selectedSource;
            
            showFeedback("✓ Good choice! We'll borrow from the " + selectedSource + " column.", 'correct');
            
            // Create borrowing chain
            const chain = createBorrowingChain(selectedSource);
            borrowingDecision.borrowingChain = chain;
            
            // Execute chain borrowing
            executeChainBorrowing(chain);
        } else {
            showFeedback("✗ Can't borrow from that column. Choose a column with at least 1.", 'incorrect');
        }
        
        updateScoreDisplay();
    }
    
    // ===== SIMPLIFIED BORROWING FUNCTIONS =====
    
    function executeSimpleBorrow(sourceColumn) {
        console.log(`Executing simple borrow from ${sourceColumn}`);
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
        
        showFeedback("✓ Borrowed 1 from " + sourceColumn + " column.", 'correct');
        renderMainGrid();
        setTimeout(() => setupStage4(), 1000);
    }
    
    function executeChainBorrowing(chain) {
        console.log('Executing chain borrowing:', chain);
        if (chain.length < 2) {
            showFeedback("Error: Invalid borrowing chain", 'error');
            return;
        }
        
        // Simple implementation without animation for now
        chain.forEach((col, index) => {
            if (index < chain.length - 1) {
                const from = col;
                const to = chain[index + 1];
                const fromData = getColumnData(from);
                const toData = getColumnData(to);
                
                fromData.topCurrent -= 1;
                toData.topCurrent += 10;
            }
        });
        
        const targetData = getCurrentColumnData();
        targetData.borrowed = true;
        
        showFeedback("✓ Chain borrowing complete!", 'correct');
        renderMainGrid();
        setTimeout(() => setupStage4(), 1000);
    }
    
    function createBorrowingChain(sourceColumn) {
        const chain = [sourceColumn];
        let current = sourceColumn;
        
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
    
    // ===== NUMBER CONTROLS =====
    
    function initNumberControls() {
        console.log('Initializing number controls');
        let currentNumber = 0;
        
        function updateDisplay() {
            if (currentNumberEl) {
                currentNumberEl.textContent = currentNumber;
            }
        }
        
        // Handle number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('clear')) {
                    currentNumber = 0;
                } else if (btn.classList.contains('increment') || btn.classList.contains('decrement')) {
                    const change = parseInt(btn.getAttribute('data-change'));
                    const newValue = currentNumber + change;
                    
                    if (newValue >= 0 && newValue <= 99) {
                        currentNumber = newValue;
                    }
                }
                
                updateDisplay();
            });
        });
        
        // Submit computation
        if (submitComputationBtn) {
            submitComputationBtn.addEventListener('click', checkComputation);
        }
        
        // Reset function
        window.resetNumberControls = function() {
            currentNumber = 0;
            updateDisplay();
        };
        
        updateDisplay();
    }
    
    function checkComputation() {
        console.log('Checking computation');
        const userAnswer = currentNumberEl ? parseInt(currentNumberEl.textContent) || 0 : 0;
        const colData = getCurrentColumnData();
        
        if (!colData) return;
        
        const correctAnswer = colData.topCurrent - colData.bottom;
        
        // Track computation
        scores.computations.total++;
        
        if (userAnswer === correctAnswer) {
            scores.computations.correct++;
            colData.answer = userAnswer;
            colData.correct = true;
            colData.completed = true;
            
            showFeedback(`✓ Perfect! ${colData.topCurrent} - ${colData.bottom} = ${correctAnswer}`, 'correct');
            
            // Move to next column or complete problem
            if (moveToNextColumn()) {
                setupStage1();
            } else {
                completeProblem();
            }
            
        } else {
            showFeedback(`✗ Incorrect. ${colData.topCurrent} - ${colData.bottom} = ${correctAnswer}`, 'incorrect');
        }
        
        updateScoreDisplay();
    }
    
    // ===== HELPER FUNCTIONS =====
    
    function getCurrentColumnData() {
        return currentProblem ? currentProblem.columns.find(c => c.column === currentColumn) : null;
    }
    
    function getColumnData(column) {
        return currentProblem ? currentProblem.columns.find(c => c.column === column) : null;
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
                break;
            }
            checking = getLeftColumn(checking);
        }
        
        return available;
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    function moveToNextColumn() {
        const currentIndex = columns.indexOf(currentColumn);
        
        for (let i = currentIndex + 1; i < columns.length; i++) {
            const nextCol = columns[i];
            const colData = getColumnData(nextCol);
            
            if (!colData.completed) {
                currentColumn = nextCol;
                currentStage = 1;
                
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
        
        return false;
    }
    
    function completeProblem() {
        console.log('Problem complete!');
        showFeedback("🎉 Problem Complete! Well done!", 'correct');
        
        if (subProblemDisplay) {
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
    }
    
    // ===== RENDERING =====
    
    function renderMainGrid() {
        if (!problemGrid) return;
        
        problemGrid.innerHTML = '';
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (row === 0) { // Borrow row
                    cell.className += ' borrow-cell';
                    cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : col === 3 ? 'ones' : '';
                    
                    if (cell.dataset.column) {
                        const colData = getColumnData(cell.dataset.column);
                        if (colData && colData.borrowed) {
                            const indicator = document.createElement('div');
                            indicator.className = 'borrow-indicator-small';
                            indicator.textContent = '1';
                            cell.appendChild(indicator);
                        }
                    }
                }
                else if (row === 1) { // Minuend row
                    if (col === 0) {
                        cell.className += ' minus-column';
                    } else {
                        cell.className += ' number-cell';
                        cell.dataset.column = col === 1 ? 'hundreds' : col === 2 ? 'tens' : 'ones';
                        const colData = getColumnData(cell.dataset.column);
                        if (colData) {
                            cell.textContent = colData.topCurrent;
                            if (colData.topCurrent !== colData.topOriginal) {
                                cell.classList.add('adjusted');
                            }
                        }
                    }
                }
                else if (row === 2) { // Subtrahend row
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
                
                if ((row === 1 || row === 2 || row === 4) && cell.dataset.column === currentColumn) {
                    cell.classList.add('active-column');
                }
                
                problemGrid.appendChild(cell);
            }
        }
    }
    
    // ===== FEEDBACK =====
    
    function showFeedback(message, type) {
        console.log(`Feedback: ${message}`);
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = message;
            subFeedbackDiv.className = `sub-feedback ${type}`;
            
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
            try {
                scores = JSON.parse(saved);
                updateScoreDisplay();
            } catch (e) {
                console.error('Error loading scores:', e);
            }
        }
    }
    
    function saveScores() {
        try {
            localStorage.setItem('subtractionScores', JSON.stringify(scores));
        } catch (e) {
            console.error('Error saving scores:', e);
        }
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
    
    // ===== START THE APPLICATION =====
    initialize();
});
