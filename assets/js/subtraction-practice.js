// Subtraction Practice - SIMPLIFIED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Subtraction Practice: Simplified version loaded');
    
    // State management
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let currentStage = 1;
    
    // Simplified scores - only track total, correct, incorrect
    let scores = {
        total: 0,
        correct: 0,
        incorrect: 0
    };
    
    // DOM elements
    const problemGrid = document.getElementById('problemGrid');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const newProblemBtn = document.getElementById('newProblem');
    const resetScoresBtn = document.getElementById('resetScores');
    const submitComputationBtn = document.getElementById('submitComputation');
    const currentNumberEl = document.getElementById('currentNumber');
    
    // Score display elements
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const totalCountEl = document.getElementById('totalCount');
    const accuracyRateEl = document.getElementById('accuracyRate');
    
    // Initialize
    initialize();
    
    function initialize() {
        console.log('Initializing simplified subtraction practice...');
        
        // Set up event listeners
        if (newProblemBtn) newProblemBtn.addEventListener('click', generateSubtractionProblem);
        if (resetScoresBtn) resetScoresBtn.addEventListener('click', resetScores);
        if (submitComputationBtn) submitComputationBtn.addEventListener('click', checkComputation);
        
        // Initialize number controls
        initNumberControls();
        
        // Load scores
        loadScores();
        
        // Generate first problem
        generateSubtractionProblem();
        
        console.log('Initialization complete');
    }
    
    // ===== PROBLEM GENERATION =====
    
    function generateSubtractionProblem() {
        console.log('Generating new subtraction problem...');
        
        let num1, num2;
        
        // Generate random 3-digit numbers ensuring num1 ≥ num2
        do {
            num1 = Math.floor(Math.random() * 900) + 100; // 100-999
            num2 = Math.floor(Math.random() * 900) + 100; // Use same range for better problems
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
            columns: []
        };
        
        // Initialize columns with clear structure
        ['ones', 'tens', 'hundreds'].forEach(column => {
            currentProblem.columns.push({
                column: column,
                topDigit: num1Digits[column],      // Minuend digit
                bottomDigit: num2Digits[column],   // Subtrahend digit
                currentTopDigit: num1Digits[column], // Current (may change with borrowing)
                borrowed: false,
                answer: null,
                correct: null,
                completed: false
            });
        });
        
        // Reset state
        currentColumn = 'ones';
        currentStage = 1;
        
        // Update UI
        renderMainGrid();
        setupStage1();
        clearFeedback();
        updateScoreDisplay();
        
        console.log('New problem:', `${num1} - ${num2} = ${answer}`);
    }
    
    // ===== SIMPLIFIED GRID RENDERING =====
    
    function renderMainGrid() {
        const problemGrid = document.getElementById('problemGrid');
        if (!problemGrid) {
            console.error('Problem grid not found!');
            return;
        }
        
        // Clear grid
        problemGrid.innerHTML = '';
        
        // Create a simple 5x4 grid for subtraction
        // Columns: [Empty, Hundreds, Tens, Ones]
        // Rows: [Borrow, Minuend, Subtrahend, Line, Answer]
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Determine column name
                let columnName = '';
                if (col === 1) columnName = 'hundreds';
                else if (col === 2) columnName = 'tens';
                else if (col === 3) columnName = 'ones';
                
                // Get column data if we have a column
                const colData = columnName ? getColumnData(columnName) : null;
                
                // Row 0: Borrow indicators (empty or show borrowed 1)
                if (row === 0) {
                    if (col === 0) {
                        // Empty cell in column 0
                        cell.className += ' empty-cell';
                    } else {
                        cell.className += ' borrow-cell';
                        if (colData && colData.borrowed) {
                            // Show a small "1" above the column
                            cell.innerHTML = '<div class="borrow-indicator">1</div>';
                        }
                    }
                }
                // Row 1: Minuend (top number)
                else if (row === 1) {
                    if (col === 0) {
                        // Empty cell for alignment
                        cell.className += ' empty-cell';
                    } else {
                        cell.className += ' minuend-cell';
                        if (colData) {
                            cell.textContent = colData.currentTopDigit;
                            
                            // If the digit was changed by borrowing, show the original with strikethrough
                            if (colData.currentTopDigit !== colData.topDigit) {
                                const originalSpan = document.createElement('span');
                                originalSpan.className = 'original-digit';
                                originalSpan.textContent = colData.topDigit;
                                originalSpan.style.textDecoration = 'line-through';
                                originalSpan.style.opacity = '0.5';
                                originalSpan.style.marginRight = '5px';
                                
                                const currentSpan = document.createElement('span');
                                currentSpan.className = 'current-digit';
                                currentSpan.textContent = colData.currentTopDigit;
                                
                                cell.innerHTML = '';
                                cell.appendChild(originalSpan);
                                cell.appendChild(currentSpan);
                            }
                        }
                    }
                }
                // Row 2: Subtrahend (bottom number) with minus sign
                else if (row === 2) {
                    if (col === 0) {
                        // Minus sign in column 0
                        cell.className += ' minus-cell';
                        cell.textContent = '−';
                    } else {
                        cell.className += ' subtrahend-cell';
                        if (colData) {
                            cell.textContent = colData.bottomDigit;
                        }
                    }
                }
                // Row 3: Line
                else if (row === 3) {
                    if (col === 0) {
                        // Empty cell in column 0
                        cell.className += ' empty-cell';
                    } else {
                        // Line across the number columns
                        cell.className += ' line-cell';
                        cell.style.borderBottom = '3px solid #333';
                    }
                }
                // Row 4: Answer
                else if (row === 4) {
                    if (col === 0) {
                        // Empty cell for alignment
                        cell.className += ' empty-cell';
                    } else {
                        cell.className += ' answer-cell';
                        if (colData && colData.completed) {
                            cell.textContent = colData.answer;
                            cell.classList.add(colData.correct ? 'correct' : 'incorrect');
                        } else {
                            cell.textContent = '_';
                        }
                    }
                }
                
                // Highlight current column
                if (columnName === currentColumn) {
                    if (row === 1 || row === 2 || row === 4) {
                        cell.classList.add('active-column');
                    }
                }
                
                problemGrid.appendChild(cell);
            }
        }
        
        console.log('Grid rendered successfully');
    }
    
    // ===== STAGE MANAGEMENT =====
    
    function setupStage1() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        if (colData.currentTopDigit !== colData.topDigit) {
            console.log(`Skipping borrow check for ${currentColumn}: ` +
                       `digit changed from ${colData.topDigit} to ${colData.currentTopDigit}`);
            setupStage4();
            return;
        }

        // Update display
        const stage1TopDigit = document.getElementById('stage1TopDigit');
        const stage1BottomDigit = document.getElementById('stage1BottomDigit');
        const comparisonHint = document.getElementById('comparisonHint');
        
        if (stage1TopDigit) stage1TopDigit.textContent = colData.currentTopDigit;
        if (stage1BottomDigit) stage1BottomDigit.textContent = colData.bottomDigit;
        
        // Determine if borrowing is needed
        const needsBorrow = colData.currentTopDigit < colData.bottomDigit;
        if (comparisonHint) {
            comparisonHint.textContent = needsBorrow ? 
                `${colData.currentTopDigit} < ${colData.bottomDigit}` : 
                `${colData.currentTopDigit} ≥ ${colData.bottomDigit}`;
            comparisonHint.className = needsBorrow ? 'comparison-hint needs-borrow' : 'comparison-hint no-borrow';
        }
        
        // Show this stage
        showStage(1);
        
        // Setup button handlers
        document.querySelectorAll('#stage1 .btn-decision').forEach(btn => {
            btn.onclick = function() {
                const userAnswer = this.dataset.decision === 'yes';
                handleStage1Decision(userAnswer, needsBorrow);
            };
        });
    }
    
    function setupStage2() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // FIXED: Check if we can SAFELY borrow
        // Can safely borrow if: (currentTopDigit - 1) >= bottomDigit
        const hasEnough = leftColData && 
                         leftColData.currentTopDigit >= 1 && 
                         (leftColData.currentTopDigit - 1) >= leftColData.bottomDigit;
        
        // Update display
        const currentColumnDisplay = document.getElementById('currentColumnDisplay');
        const leftColumnDisplay = document.getElementById('leftColumnDisplay');
        const stage2Question = document.getElementById('stage2Question');
        const zeroWarning = document.getElementById('zeroWarning');
        
        if (currentColumnDisplay) {
            currentColumnDisplay.textContent = `${capitalize(currentColumn)}: ${colData.currentTopDigit} - ${colData.bottomDigit}`;
        }
        
        if (leftColumnDisplay && leftColData) {
            leftColumnDisplay.textContent = `${capitalize(leftColumn)}: ${leftColData.currentTopDigit} - ${leftColData.bottomDigit}`;
            
            if (stage2Question) {
                // Make the question clearer
                stage2Question.textContent = `After lending 1 to ${currentColumn}, can ${leftColumn} still subtract ${leftColData.bottomDigit}?`;
                
                // Add explanation
                const explanation = document.createElement('div');
                explanation.className = 'explanation';
                explanation.style.fontSize = '0.9em';
                explanation.style.marginTop = '5px';
                explanation.style.color = '#666';
                explanation.innerHTML = `(${leftColData.currentTopDigit} - 1 = ${leftColData.currentTopDigit - 1}, then ${leftColData.currentTopDigit - 1} - ${leftColData.bottomDigit} = ${leftColData.currentTopDigit - 1 - leftColData.bottomDigit})`;
                
                // Remove any existing explanation first
                const existingExplanation = stage2Question.querySelector('.explanation');
                if (existingExplanation) {
                    existingExplanation.remove();
                }
                stage2Question.appendChild(explanation);
            }
            
            if (zeroWarning) {
                zeroWarning.style.display = leftColData.currentTopDigit === 0 ? 'block' : 'none';
            }
        }
        
        // Show this stage
        showStage(2);
        
        // Setup button handlers
        document.querySelectorAll('#stage2 .btn-decision').forEach(btn => {
            btn.onclick = function() {
                const userAnswer = this.dataset.decision === 'yes';
                handleStage2Decision(userAnswer, hasEnough);
            };
        });
    }
    
    function setupStage3() {
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
                    <span class="column-digits">${data.currentTopDigit} - ${data.bottomDigit}</span>
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
                        ${capitalize(source)} column (${sourceData.currentTopDigit} - ${sourceData.bottomDigit})
                    </button>`;
                });
            } else {
                optionsHtml = '<div class="no-sources">No columns available for borrowing</div>';
            }
            
            sourceOptions.innerHTML = optionsHtml;
            
            // Setup source option buttons
            document.querySelectorAll('.source-option').forEach(btn => {
                btn.onclick = function() {
                    handleStage3Decision(this.dataset.source);
                };
            });
        }
        
        // Show this stage
        showStage(3);
    }
    
    function setupStage4() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display the subtraction problem
        const subProblemDisplay = document.getElementById('subProblemDisplay');
        if (subProblemDisplay) {
            let displayHtml = '';
            
            if (colData.borrowed) {
                displayHtml = `
                <div class="sub-problem-with-borrow">
                    <div class="borrow-indicator-large">1</div>
                    <div class="subtraction-display">
                        <div class="top-digit">${colData.currentTopDigit}</div>
                        <div class="operator">-</div>
                        <div class="bottom-digit">${colData.bottomDigit}</div>
                    </div>
                </div>
                <div class="equals-line">=</div>
                <div class="answer-placeholder">?</div>`;
            } else {
                displayHtml = `
                <div class="subtraction-display">
                    <div class="top-digit">${colData.currentTopDigit}</div>
                    <div class="operator">-</div>
                    <div class="bottom-digit">${colData.bottomDigit}</div>
                </div>
                <div class="equals-line">=</div>
                <div class="answer-placeholder">?</div>`;
            }
            
            subProblemDisplay.innerHTML = displayHtml;
        }
        
        // Reset number controls to 0
        if (window.resetNumberControls) {
            window.resetNumberControls();
        }
        
        // Show this stage
        showStage(4);
    }
    
    function showStage(stageNumber) {
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

    function canBorrowFromColumn(column) {
        const columnData = getColumnData(column);
        if (!columnData) return false;
        
        // Can't borrow from the current column
        if (column === currentColumn) return false;
        
        // Must have at least 1 to borrow
        if (columnData.currentTopDigit < 1) return false;
        
        // NEW: After lending 1, will this column still be able to handle its own subtraction?
        return (columnData.currentTopDigit - 1) >= columnData.bottomDigit;
    }
    
    // Also, let's update the findAvailableSources function to be more robust:
    function findAvailableSources() {
        const available = [];
        
        // Check all columns to the left
        let checking = getLeftColumn(currentColumn);
        while (checking) {
            const data = getColumnData(checking);
            if (data && canBorrowFromColumn(checking)) {
                available.push(checking);
            }
            checking = getLeftColumn(checking);
        }
        
        return available;
    }
    
    function handleStage1Decision(userAnswer, needsBorrow) {
        console.log(`Stage 1: User said ${userAnswer ? 'Yes' : 'No'}, actually ${needsBorrow ? 'needs borrow' : 'no borrow needed'}`);
        
        if (userAnswer === needsBorrow) {
            showFeedback("✓ Correct! " + (needsBorrow ? 
                "We need to borrow because the top digit is smaller." : 
                "No borrowing needed."), 'correct');
            
            if (needsBorrow) {
                setTimeout(() => setupStage2(), 1000);
            } else {
                setTimeout(() => setupStage4(), 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + (needsBorrow ? 
                `We DO need to borrow because ${getCurrentColumnData().currentTopDigit} < ${getCurrentColumnData().bottomDigit}` :
                `No borrowing needed because ${getCurrentColumnData().currentTopDigit} ≥ ${getCurrentColumnData().bottomDigit}`), 
                'incorrect');
            
            setTimeout(() => {
                if (needsBorrow) {
                    setupStage2();
                } else {
                    setupStage4();
                }
            }, 1500);
        }
    }
    
    function handleStage2Decision(userAnswer, hasEnough) {
        console.log(`Stage 2: User said ${userAnswer ? 'Yes' : 'No'}, actually ${hasEnough ? 'has enough' : 'not enough'}`);
        
        if (userAnswer === hasEnough) {
            showFeedback("✓ Correct! " + (hasEnough ? 
                "We can borrow from this column." : 
                "Not enough to borrow from this column."), 'correct');
            
            if (hasEnough) {
                const leftColumn = getLeftColumn(currentColumn);
                // ADD VALIDATION HERE
                if (canBorrowFromColumn(leftColumn)) {
                    executeSimpleBorrow(leftColumn);
                } else {
                    showFeedback("Error: Cannot borrow from this column", 'error');
                    setTimeout(() => setupStage3(), 1000);
                }
            } else {
                setTimeout(() => setupStage3(), 1000);
            }
        } else {
            showFeedback("✗ Incorrect. " + (hasEnough ? 
                "This column has enough to borrow from." :
                "This column doesn't have enough to borrow from."), 'incorrect');
            
            setTimeout(() => {
                if (hasEnough) {
                    const leftColumn = getLeftColumn(currentColumn);
                    // ADD VALIDATION HERE TOO
                    if (canBorrowFromColumn(leftColumn)) {
                        executeSimpleBorrow(leftColumn);
                    } else {
                        setupStage3();
                    }
                } else {
                    setupStage3();
                }
            }, 1500);
        }
    }
    
    function handleStage3Decision(selectedSource) {
        console.log(`Stage 3: User selected ${selectedSource}`);
        
        const sourceData = getColumnData(selectedSource);
        if (sourceData && sourceData.currentTopDigit >= 1) {
            showFeedback("✓ Good choice! We'll borrow from the " + selectedSource + " column.", 'correct');
            executeChainBorrowing(selectedSource);
        } else {
            showFeedback("✗ Can't borrow from that column. Choose a column with at least 1.", 'incorrect');
        }
    }
    
    // ===== BORROWING EXECUTION =====
    
    function executeSimpleBorrow(sourceColumn) {
        const targetData = getCurrentColumnData();
        const sourceData = getColumnData(sourceColumn);
        
        if (!sourceData || sourceData.currentTopDigit < 1) {
            showFeedback("Error: Can't borrow from empty column", 'error');
            // Move to stage 3 to find alternative
            setTimeout(() => setupStage3(), 1000);
            return;
        }
        
        // Update digits
        sourceData.currentTopDigit -= 1;
        targetData.currentTopDigit += 10;
        targetData.borrowed = true;
        
        showFeedback("✓ Borrowed 1 from " + sourceColumn + " column.", 'correct');
        renderMainGrid();
        setTimeout(() => setupStage4(), 1000);
    }
    
    function executeChainBorrowing(sourceColumn) {
        try {
            console.log(`[DEBUG] executeChainBorrowing called with source: ${sourceColumn}`);
            console.log(`[DEBUG] Current column: ${currentColumn}`);
            
            // Validate source first
            const sourceData = getColumnData(sourceColumn);
            console.log(`[DEBUG] Source data:`, sourceData);
            
            if (!sourceData) {
                throw new Error(`No data for source column: ${sourceColumn}`);
            }
            
            if (sourceData.currentTopDigit < 1) {
                throw new Error(`Source column ${sourceColumn} has ${sourceData.currentTopDigit}, need at least 1`);
            }
            
            // Create chain from source to target
            const chain = [sourceColumn];
            let current = sourceColumn;
            console.log(`[DEBUG] Building chain starting from ${current}`);
            
            while (current !== currentColumn) {
                const next = getRightColumn(current);
                console.log(`[DEBUG]   Current: ${current}, Next: ${next}`);
                if (next) {
                    chain.push(next);
                    current = next;
                } else {
                    console.log(`[DEBUG]   No next column found`);
                    break;
                }
            }
            
            console.log(`[DEBUG] Complete chain:`, chain);
            
            if (chain.length < 2) {
                throw new Error(`Invalid chain length: ${chain.length}`);
            }
            
            if (chain[chain.length - 1] !== currentColumn) {
                throw new Error(`Chain doesn't end at current column. Chain: ${chain}, Current: ${currentColumn}`);
            }
            
            // Execute borrowing through the chain
            for (let i = 0; i < chain.length - 1; i++) {
                const from = chain[i];
                const to = chain[i + 1];
                const fromData = getColumnData(from);
                const toData = getColumnData(to);
                
                console.log(`[DEBUG] Processing link ${i}: ${from} -> ${to}`);
                console.log(`[DEBUG]   Before: ${from}=${fromData?.currentTopDigit}, ${to}=${toData?.currentTopDigit}`);
                
                if (!fromData || !toData) {
                    throw new Error(`Missing data for ${from} -> ${to}`);
                }
                
                // Update the digits
                fromData.currentTopDigit -= 1;
                toData.currentTopDigit += 10;
                
                console.log(`[DEBUG]   After: ${from}=${fromData.currentTopDigit}, ${to}=${toData.currentTopDigit}`);
                
                // Mark the final column as borrowed
                if (to === currentColumn) {
                    const targetData = getCurrentColumnData();
                    if (targetData) {
                        targetData.borrowed = true;
                        console.log(`[DEBUG]   Marked ${to} as borrowed`);
                    }
                }
            }
            
            console.log(`[DEBUG] Borrowing complete, rendering grid...`);
            
            showFeedback(`✓ Successfully borrowed from ${sourceColumn} column!`, 'correct');
            
            // Update the grid
            renderMainGrid();
            
            // Move to stage 4
            setTimeout(() => {
                console.log(`[DEBUG] Moving to stage 4`);
                setupStage4();
            }, 1000);
            
        } catch (error) {
            console.error(`Error in executeChainBorrowing:`, error);
            showFeedback(`✗ Error: ${error.message}`, 'error');
            setTimeout(() => setupStage3(), 1500);
        }
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
        
        // Setup number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('clear')) {
                    currentNumber = 0;
                } else {
                    const change = parseInt(this.getAttribute('data-change'));
                    const newValue = currentNumber + change;
                    
                    // Limit to reasonable range (0-18 for subtraction)
                    if (newValue >= 0 && newValue <= 18) {
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
        const userAnswer = currentNumberEl ? parseInt(currentNumberEl.textContent) || 0 : 0;
        const colData = getCurrentColumnData();
        
        if (!colData) return;
        
        const correctAnswer = colData.currentTopDigit - colData.bottomDigit;
        
        // Update scores
        scores.total++;
        
        if (userAnswer === correctAnswer) {
            scores.correct++;
            colData.answer = userAnswer;
            colData.correct = true;
            colData.completed = true;
            
            showFeedback(`✓ Perfect! ${colData.currentTopDigit} - ${colData.bottomDigit} = ${correctAnswer}`, 'correct');
            
            // Update the grid with the answer
            renderMainGrid();
            
            // Move to next column or complete problem
            setTimeout(() => {
                if (moveToNextColumn()) {
                    setupStage1();
                } else {
                    completeProblem();
                }
            }, 1000);
            
        } else {
            scores.incorrect++;
            showFeedback(`✗ Incorrect. ${colData.currentTopDigit} - ${colData.bottomDigit} = ${correctAnswer}`, 'incorrect');
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
            if (data && data.currentTopDigit >= 1) {
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
                return true;
            }
        }
        
        return false;
    }
    
    function completeProblem() {
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
    
    function showFeedback(message, type) {
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
    
    function updateScoreDisplay() {
        // Update score displays
        if (correctCountEl) correctCountEl.textContent = scores.correct;
        if (incorrectCountEl) incorrectCountEl.textContent = scores.incorrect;
        if (totalCountEl) totalCountEl.textContent = scores.total;
        
        // Calculate accuracy
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
        
        // Save to localStorage
        saveScores();
    }
    
    function loadScores() {
        try {
            const saved = localStorage.getItem('subtractionScores');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Only load the simple scores
                scores.total = parsed.total || 0;
                scores.correct = parsed.correct || 0;
                scores.incorrect = parsed.incorrect || 0;
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
                incorrect: 0
            };
            
            localStorage.removeItem('subtractionScores');
            updateScoreDisplay();
            generateSubtractionProblem();
        }
    }
});
