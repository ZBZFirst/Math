// Subtraction Practice with Borrowing Decision Process - SIMPLIFIED WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Subtraction Practice: Script loaded successfully');
    
    // Initialize immediately
    initialize();
    
    function initialize() {
        console.log('Initializing subtraction practice...');
        
        // First, set up ALL event listeners
        setupAllEventListeners();
        
        // Initialize number controls
        initNumberControls();
        
        // Load scores
        loadScores();
        
        // Generate first problem
        generateSubtractionProblem();
        
        console.log('Initialization complete');
    }
    
    // ===== EVENT LISTENER SETUP =====
    
    function setupAllEventListeners() {
        console.log('Setting up event listeners...');
        
        // New Problem button
        const newProblemBtn = document.getElementById('newProblem');
        if (newProblemBtn) {
            console.log('Found newProblem button');
            newProblemBtn.addEventListener('click', generateSubtractionProblem);
        } else {
            console.error('Missing newProblem button');
        }
        
        // Reset Scores button
        const resetScoresBtn = document.getElementById('resetScores');
        if (resetScoresBtn) {
            console.log('Found resetScores button');
            resetScoresBtn.addEventListener('click', resetScores);
        }
        
        // Submit Computation button
        const submitComputationBtn = document.getElementById('submitComputation');
        if (submitComputationBtn) {
            console.log('Found submitComputation button');
            submitComputationBtn.addEventListener('click', checkComputation);
        }
        
        // Show All Steps button
        const showAllStepsBtn = document.getElementById('showAllSteps');
        if (showAllStepsBtn) {
            showAllStepsBtn.addEventListener('click', function() {
                const stages = document.querySelectorAll('.decision-stage');
                stages.forEach(stage => {
                    stage.style.display = stage.style.display === 'none' ? 'block' : 'none';
                });
            });
        }
        
        console.log('Event listeners setup complete');
    }
    
    // ===== STATE MANAGEMENT =====
    
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let currentStage = 1;
    
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
    
    let borrowingDecision = {
        stage1: { userAnswer: null, correctAnswer: null },
        stage2: { userAnswer: null, correctAnswer: null },
        stage3: { userAnswer: null, correctAnswer: null },
        selectedSource: null,
        borrowingChain: []
    };
    
    // ===== PROBLEM GENERATION =====
    
    function generateSubtractionProblem() {
        console.log('Generating new subtraction problem...');
        
        let num1, num2;
        
        // Generate random 3-digit numbers ensuring num1 ≥ num2
        do {
            num1 = Math.floor(Math.random() * 400) + 100; // 100-499
            num2 = Math.floor(Math.random() * 400) + 100;
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
            columns: []
        };
        
        // Initialize columns
        ['ones', 'tens', 'hundreds'].forEach(column => {
            currentProblem.columns.push({
                column: column,
                topOriginal: num1Digits[column],
                bottom: num2Digits[column],
                topCurrent: num1Digits[column],
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
        
        console.log('New problem:', `${num1} - ${num2} = ${answer}`);
    }
    
    // ===== STAGE MANAGEMENT =====
    
    function setupStage1() {
        console.log('Setting up Stage 1');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Update display
        const stage1TopDigit = document.getElementById('stage1TopDigit');
        const stage1BottomDigit = document.getElementById('stage1BottomDigit');
        const comparisonHint = document.getElementById('comparisonHint');
        
        if (stage1TopDigit) stage1TopDigit.textContent = colData.topCurrent;
        if (stage1BottomDigit) stage1BottomDigit.textContent = colData.bottom;
        
        // Determine if borrowing is needed
        const needsBorrow = colData.topCurrent < colData.bottom;
        if (comparisonHint) {
            comparisonHint.textContent = needsBorrow ? 
                `${colData.topCurrent} < ${colData.bottom}` : 
                `${colData.topCurrent} ≥ ${colData.bottom}`;
            comparisonHint.className = needsBorrow ? 'comparison-hint needs-borrow' : 'comparison-hint no-borrow';
        }
        
        // Store correct answer
        borrowingDecision.stage1.correctAnswer = needsBorrow;
        
        // Show this stage
        showStage(1);
        
        // Setup button handlers for THIS stage only
        setupStage1Buttons();
    }
    
    function setupStage1Buttons() {
        console.log('Setting up Stage 1 buttons');
        
        // Remove any existing event listeners
        const yesBtn = document.querySelector('#stage1 .btn-yes');
        const noBtn = document.querySelector('#stage1 .btn-no');
        
        if (yesBtn) {
            yesBtn.onclick = null; // Remove old listener
            yesBtn.addEventListener('click', function() {
                console.log('Stage 1: Yes clicked');
                handleStage1Decision(true);
            });
        }
        
        if (noBtn) {
            noBtn.onclick = null; // Remove old listener
            noBtn.addEventListener('click', function() {
                console.log('Stage 1: No clicked');
                handleStage1Decision(false);
            });
        }
    }
    
    function setupStage2() {
        console.log('Setting up Stage 2');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Update display
        const currentColumnDisplay = document.getElementById('currentColumnDisplay');
        const leftColumnDisplay = document.getElementById('leftColumnDisplay');
        const stage2Question = document.getElementById('stage2Question');
        const zeroWarning = document.getElementById('zeroWarning');
        
        if (currentColumnDisplay) {
            currentColumnDisplay.textContent = `${capitalize(currentColumn)}: ${colData.topCurrent} - ${colData.bottom}`;
        }
        
        if (leftColumnDisplay && leftColData) {
            leftColumnDisplay.textContent = `${capitalize(leftColumn)}: ${leftColData.topCurrent} - ${leftColData.bottom}`;
            
            if (stage2Question) {
                stage2Question.textContent = `Is there enough to borrow from the ${leftColumn} column?`;
            }
            
            if (zeroWarning) {
                if (leftColData.topCurrent === 0) {
                    zeroWarning.style.display = 'block';
                    zeroWarning.textContent = `⚠️ The ${leftColumn} column has 0. Can't borrow from 0!`;
                } else {
                    zeroWarning.style.display = 'none';
                }
            }
            
            borrowingDecision.stage2.correctAnswer = leftColData.topCurrent >= 1;
        }
        
        // Setup button handlers for this stage
        setupStage2Buttons();
        
        // Show this stage
        showStage(2);
    }
    
    function setupStage2Buttons() {
        console.log('Setting up Stage 2 buttons');
        
        const yesBtn = document.querySelector('#stage2 .btn-yes');
        const noBtn = document.querySelector('#stage2 .btn-no');
        
        if (yesBtn) {
            yesBtn.onclick = null;
            yesBtn.addEventListener('click', function() {
                console.log('Stage 2: Yes clicked');
                handleStage2Decision(true);
            });
        }
        
        if (noBtn) {
            noBtn.onclick = null;
            noBtn.addEventListener('click', function() {
                console.log('Stage 2: No clicked');
                handleStage2Decision(false);
            });
        }
    }
    
    function setupStage3() {
        console.log('Setting up Stage 3');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display all columns
        const allColumnsDisplay = document.getElementById('allColumnsDisplay');
        if (allColumnsDisplay) {
            let columnsHtml = '';
            for (const col of columns) {
                const data = getColumnData(col);
                columnsHtml += `<div class="context-column ${col === currentColumn ? 'current' : ''}">
                    <span class="column-name">${capitalize(col)}:</span>
                    <span class="column-digits">${data.topCurrent} - ${data.bottom}</span>
                </div>`;
            }
            allColumnsDisplay.innerHTML = columnsHtml;
        }
        
        // Find and display available sources
        const sourceOptions = document.getElementById('sourceOptions');
        if (sourceOptions) {
            const availableSources = findAvailableSources();
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
            
            // Setup source option buttons
            document.querySelectorAll('.source-option').forEach(btn => {
                btn.onclick = function() {
                    console.log('Stage 3: Source selected:', this.dataset.source);
                    handleStage3Decision(this.dataset.source);
                };
            });
        }
        
        // Show this stage
        showStage(3);
    }
    
    function setupStage4() {
        console.log('Setting up Stage 4');
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display the subtraction problem
        const subProblemDisplay = document.getElementById('subProblemDisplay');
        if (subProblemDisplay) {
            let displayHtml = '';
            
            if (colData.borrowed) {
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
        }
        
        // Reset number controls
        if (window.resetNumberControls) {
            window.resetNumberControls();
        }
        
        // Show this stage
        showStage(4);
    }
    
    function showStage(stageNumber) {
        console.log(`Showing stage ${stageNumber}`);
        
        // Hide all stages
        for (let i = 1; i <= 4; i++) {
            const stage = document.getElementById(`stage${i}`);
            if (stage) {
                stage.classList.remove('active');
                stage.style.display = 'none';
            }
        }
        
        // Show the requested stage
        const stageToShow = document.getElementById(`stage${stageNumber}`);
        if (stageToShow) {
            stageToShow.classList.add('active');
            stageToShow.style.display = 'block';
        }
        
        currentStage = stageNumber;
    }
    
    // ===== DECISION HANDLERS =====
    
    function handleStage1Decision(userAnswer) {
        console.log(`Stage 1 decision: ${userAnswer ? 'Yes' : 'No'}`);
        const correctAnswer = borrowingDecision.stage1.correctAnswer;
        const colData = getCurrentColumnData();
        
        if (!colData) return;
        
        // Track decision
        scores.borrowingDecisions.stage1.total++;
        borrowingDecision.stage1.userAnswer = userAnswer;
        
        if (userAnswer === correctAnswer) {
            scores.borrowingDecisions.stage1.correct++;
            
            if (correctAnswer) {
                showFeedback("✓ Correct! We need to borrow because the top digit is smaller.", 'correct');
                setTimeout(() => {
                    setupStage2();
                }, 1000);
            } else {
                showFeedback("✓ Correct! No borrowing needed.", 'correct');
                colData.needsBorrow = false;
                setTimeout(() => {
                    setupStage4();
                }, 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We DO need to borrow because ${colData.topCurrent} < ${colData.bottom}` :
                    `No borrowing needed because ${colData.topCurrent} ≥ ${colData.bottom}`), 
                'incorrect');
            
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
                setTimeout(() => {
                    setupStage3();
                }, 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + 
                (correctAnswer ? 
                    `We CAN borrow from ${leftColumn}` :
                    `We CAN'T borrow from ${leftColumn}`), 
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
        
        // Track decision
        scores.borrowingDecisions.stage3.total++;
        borrowingDecision.stage3.userAnswer = selectedSource;
        
        // Validate selection
        const colData = getColumnData(selectedSource);
        const isValid = colData && colData.topCurrent >= 1;
        
        if (isValid) {
            scores.borrowingDecisions.stage3.correct++;
            borrowingDecision.selectedSource = selectedSource;
            
            showFeedback("✓ Good choice! We'll borrow from the " + selectedSource + " column.", 'correct');
            
            // Execute chain borrowing
            const chain = createBorrowingChain(selectedSource);
            executeChainBorrowing(chain);
        } else {
            showFeedback("✗ Can't borrow from that column. Choose a column with at least 1.", 'incorrect');
        }
        
        updateScoreDisplay();
    }
    
    // ===== BORROWING EXECUTION =====
    
    function executeSimpleBorrow(sourceColumn) {
        console.log(`Borrowing from ${sourceColumn} to ${currentColumn}`);
        
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
        setTimeout(() => {
            setupStage4();
        }, 1000);
    }
    
    function executeChainBorrowing(chain) {
        console.log('Executing chain borrowing:', chain);
        
        // Simple implementation: update all digits at once
        for (let i = 0; i < chain.length - 1; i++) {
            const from = chain[i];
            const to = chain[i + 1];
            const fromData = getColumnData(from);
            const toData = getColumnData(to);
            
            fromData.topCurrent -= 1;
            toData.topCurrent += 10;
        }
        
        const targetData = getCurrentColumnData();
        targetData.borrowed = true;
        
        showFeedback("✓ Chain borrowing complete!", 'correct');
        renderMainGrid();
        setTimeout(() => {
            setupStage4();
        }, 1000);
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
    
    // ===== NUMBER CONTROLS =====
    
    function initNumberControls() {
        console.log('Initializing number controls');
        
        let currentNumber = 0;
        
        function updateDisplay() {
            const currentNumberEl = document.getElementById('currentNumber');
            if (currentNumberEl) {
                currentNumberEl.textContent = currentNumber;
            }
        }
        
        // Setup number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('clear')) {
                    currentNumber = 0;
                } else {
                    const change = parseInt(this.getAttribute('data-change'));
                    const newValue = currentNumber + change;
                    
                    // Limit to reasonable range
                    if (newValue >= 0 && newValue <= 99) {
                        currentNumber = newValue;
                    }
                }
                
                updateDisplay();
            });
        });
        
        // Create reset function
        window.resetNumberControls = function() {
            currentNumber = 0;
            updateDisplay();
        };
        
        updateDisplay();
    }
    
    function checkComputation() {
        console.log('Checking computation');
        
        const currentNumberEl = document.getElementById('currentNumber');
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
            setTimeout(() => {
                if (moveToNextColumn()) {
                    setupStage1();
                } else {
                    completeProblem();
                }
            }, 1000);
            
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
                
                // Reset decision state
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
        
        const subProblemDisplay = document.getElementById('subProblemDisplay');
        if (subProblemDisplay) {
            subProblemDisplay.innerHTML = `
            <div class="completion-screen">
                <h3>Problem Solved!</h3>
                <div class="final-result">
                    ${currentProblem.num1} - ${currentProblem.num2} = ${currentProblem.answer}
                </div>
                <button id="nextProblem" class="combined-action-btn">Next Problem</button>
            </div>`;
            
            // Add event listener for next problem button
            setTimeout(() => {
                const nextProblemBtn = document.getElementById('nextProblem');
                if (nextProblemBtn) {
                    nextProblemBtn.addEventListener('click', generateSubtractionProblem);
                }
            }, 100);
        }
    }
    
    // ===== RENDERING =====
    
    function renderMainGrid() {
        const problemGrid = document.getElementById('problemGrid');
        if (!problemGrid) return;
        
        problemGrid.innerHTML = '';
        
        // Create 5 rows × 4 columns
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Column 0: Labels or operators
                // Columns 1-3: Hundreds, Tens, Ones
                
                if (row === 0) { // Borrow row
                    if (col > 0) {
                        const columnNames = ['', 'hundreds', 'tens', 'ones'];
                        cell.dataset.column = columnNames[col];
                        
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
                        // Empty cell for alignment
                    } else {
                        const columnNames = ['', 'hundreds', 'tens', 'ones'];
                        cell.dataset.column = columnNames[col];
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
                        cell.textContent = '-';
                        cell.className += ' minus-column';
                    } else {
                        const columnNames = ['', 'hundreds', 'tens', 'ones'];
                        cell.dataset.column = columnNames[col];
                        const colData = getColumnData(cell.dataset.column);
                        if (colData) {
                            cell.textContent = colData.bottom;
                        }
                    }
                }
                else if (row === 3) { // Line
                    cell.className += ' line';
                    cell.style.gridColumn = '1 / span 4';
                }
                else if (row === 4) { // Answer row
                    if (col === 0) {
                        // Empty cell for alignment
                    } else {
                        const columnNames = ['', 'hundreds', 'tens', 'ones'];
                        cell.dataset.column = columnNames[col];
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
                const columnNames = ['', 'hundreds', 'tens', 'ones'];
                if (col > 0 && columnNames[col] === currentColumn && (row === 1 || row === 2 || row === 4)) {
                    cell.classList.add('active-column');
                }
                
                problemGrid.appendChild(cell);
            }
        }
    }
    
    // ===== FEEDBACK =====
    
    function showFeedback(message, type) {
        console.log(`Feedback [${type}]: ${message}`);
        const subFeedbackDiv = document.getElementById('subFeedback');
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = message;
            subFeedbackDiv.className = `sub-feedback ${type}`;
            
            // Auto-clear after 3 seconds
            setTimeout(() => {
                if (subFeedbackDiv.textContent === message) {
                    subFeedbackDiv.textContent = '';
                    subFeedbackDiv.className = 'sub-feedback';
                }
            }, 3000);
        }
    }
    
    function clearFeedback() {
        const subFeedbackDiv = document.getElementById('subFeedback');
        if (subFeedbackDiv) {
            subFeedbackDiv.textContent = '';
            subFeedbackDiv.className = 'sub-feedback';
        }
    }
    
    // ===== SCORE MANAGEMENT =====
    
    function updateScoreDisplay() {
        // Basic scores
        const correctCountEl = document.getElementById('correctCount');
        const incorrectCountEl = document.getElementById('incorrectCount');
        const totalCountEl = document.getElementById('totalCount');
        const accuracyRateEl = document.getElementById('accuracyRate');
        
        if (correctCountEl) correctCountEl.textContent = scores.correct;
        if (incorrectCountEl) incorrectCountEl.textContent = scores.incorrect;
        if (totalCountEl) totalCountEl.textContent = scores.total;
        
        // Accuracy
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
        
        // Borrowing decision stats
        const step1CorrectEl = document.getElementById('step1Correct');
        const step2CorrectEl = document.getElementById('step2Correct');
        const step3CorrectEl = document.getElementById('step3Correct');
        const computationCorrectEl = document.getElementById('computationCorrect');
        
        if (step1CorrectEl) {
            step1CorrectEl.textContent = `${scores.borrowingDecisions.stage1.correct}/${scores.borrowingDecisions.stage1.total}`;
        }
        
        if (step2CorrectEl) {
            step2CorrectEl.textContent = `${scores.borrowingDecisions.stage2.correct}/${scores.borrowingDecisions.stage2.total}`;
        }
        
        if (step3CorrectEl) {
            step3CorrectEl.textContent = `${scores.borrowingDecisions.stage3.correct}/${scores.borrowingDecisions.stage3.total}`;
        }
        
        if (computationCorrectEl) {
            computationCorrectEl.textContent = `${scores.computations.correct}/${scores.computations.total}`;
        }
        
        // Save to localStorage
        saveScores();
    }
    
    function loadScores() {
        try {
            const saved = localStorage.getItem('subtractionScores');
            if (saved) {
                scores = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading scores:', e);
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
});
