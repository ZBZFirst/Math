// Subtraction Practice - REFACTORED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // ================= STATE =================
    let currentProblem = null;
    let currentColumn = 'ones';
    let columns = ['ones', 'tens', 'hundreds'];
    let currentStage = 1;
    
    let scores = {
        total: 0,
        correct: 0,
        incorrect: 0
    };
    
    // ================= DOM ELEMENTS =================
    const problemGrid = document.getElementById('problemGrid');
    const subFeedbackDiv = document.getElementById('subFeedback');
    const newProblemBtn = document.getElementById('newProblem');
    const resetScoresBtn = document.getElementById('resetScores');
    const submitComputationBtn = document.getElementById('submitComputation');
    const currentNumberEl = document.getElementById('currentNumber');
    
    const correctCountEl = document.getElementById('correctCount');
    const incorrectCountEl = document.getElementById('incorrectCount');
    const totalCountEl = document.getElementById('totalCount');
    const accuracyRateEl = document.getElementById('accuracyRate');
    
    // ================= INITIALIZATION =================
    function initialize() {
        // Event listeners
        newProblemBtn?.addEventListener('click', generateSubtractionProblem);
        resetScoresBtn?.addEventListener('click', resetScores);
        submitComputationBtn?.addEventListener('click', checkComputation);
        
        initNumberControls();
        loadScores();
        generateSubtractionProblem();
    }
    
    // ================= PROBLEM GENERATION =================
    function generateSubtractionProblem() {
        let num1, num2;
        
        // Generate 3-digit numbers with num1 ≥ num2
        do {
            num1 = Math.floor(Math.random() * 900) + 100;
            num2 = Math.floor(Math.random() * 900) + 100;
        } while (num1 < num2);
        
        const answer = num1 - num2;
        
        // Helper to extract digits
        const getDigits = (num) => {
            const str = num.toString().padStart(3, '0');
            return {
                hundreds: +str[0],
                tens: +str[1],
                ones: +str[2]
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
        
        // Initialize columns
        columns.forEach(column => {
            currentProblem.columns.push({
                column: column,
                topDigit: num1Digits[column],
                bottomDigit: num2Digits[column],
                currentTopDigit: num1Digits[column],
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
    }
    
    // ================= GRID RENDERING =================
function renderMainGrid() {
    if (!problemGrid) return;
    
    problemGrid.innerHTML = '';
    
    // 4 rows now (was 5): minuend, subtrahend, line, answer
    // 4 columns: empty, hundreds, tens, ones
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            let columnName = '';
            if (col === 1) columnName = 'hundreds';
            else if (col === 2) columnName = 'tens';
            else if (col === 3) columnName = 'ones';
            
            const colData = columnName ? getColumnData(columnName) : null;
            
            // Row 0: Minuend (top number) - WAS Row 1
            if (row === 0) {
                if (col === 0) {
                    cell.className += ' empty-cell';
                } else {
                    cell.className += ' minuend-cell';
                    if (colData) {
                        // Show original digit with strikethrough if borrowed
                        if (colData.currentTopDigit !== colData.topDigit) {
                            cell.innerHTML = `
                                <span class="original-digit" style="text-decoration: line-through; opacity: 0.5; margin-right: 5px">
                                    ${colData.topDigit}
                                </span>
                                <span class="current-digit">${colData.currentTopDigit}</span>
                            `;
                        } else {
                            cell.textContent = colData.currentTopDigit;
                        }
                    }
                }
            }
            // Row 1: Subtrahend (bottom number) - WAS Row 2
            else if (row === 1) {
                if (col === 0) {
                    cell.className += ' minus-cell';
                    cell.textContent = '−';
                } else {
                    cell.className += ' subtrahend-cell';
                    if (colData) {
                        cell.textContent = colData.bottomDigit;
                    }
                }
            }
            // Row 2: Line - WAS Row 3
            else if (row === 2) {
                if (col === 0) {
                    cell.className += ' empty-cell';
                } else {
                    cell.className += ' line-cell';
                    cell.style.borderBottom = '3px solid #333';
                }
            }
            // Row 3: Answer - WAS Row 4
            else if (row === 3) {
                if (col === 0) {
                    cell.className += ' empty-cell';
                } else {
                    cell.className += ' answer-cell';
                    if (colData?.completed) {
                        cell.textContent = colData.answer;
                        cell.classList.add(colData.correct ? 'correct' : 'incorrect');
                    } else {
                        cell.textContent = '_';
                    }
                }
            }
            
            // Highlight current column
            if (columnName === currentColumn && [0, 1, 3].includes(row)) {
                cell.classList.add('active-column');
            }
            
            problemGrid.appendChild(cell);
        }
    }
}
    
    // ================= STAGE MANAGEMENT =================
    function setupStage1() {
        const colData = getCurrentColumnData();
        if (!colData) return;
    
        // Update display elements
        const stage1TopDigit = document.getElementById('stage1TopDigit');
        const stage1BottomDigit = document.getElementById('stage1BottomDigit');
        
        if (stage1TopDigit) stage1TopDigit.textContent = colData.currentTopDigit;
        if (stage1BottomDigit) stage1BottomDigit.textContent = colData.bottomDigit;
        
        // Check if borrowing is needed
        const needsBorrow = colData.currentTopDigit < colData.bottomDigit;
        
        showStage(1);
        
        // Setup decision buttons
        document.querySelectorAll('#stage1 .btn-decision').forEach(btn => {
            btn.onclick = () => {
                const userAnswer = btn.dataset.decision === 'yes';
                handleStage1Decision(userAnswer, needsBorrow);
            };
        });
    }
    
    function setupStage2() {
        const leftColumn = getLeftColumn(currentColumn);
        const leftColData = leftColumn ? getColumnData(leftColumn) : null;
        
        // Simplified check: Can we borrow from the next column?
        const canBorrow = leftColData && leftColData.currentTopDigit >= 1;
        
        // No need to update any display elements since we removed them
        showStage(2);
        
        // Setup decision buttons
        document.querySelectorAll('#stage2 .btn-decision').forEach(btn => {
            btn.onclick = () => {
                const userAnswer = btn.dataset.decision === 'yes';
                handleStage2Decision(userAnswer, canBorrow);
            };
        });
    }
    
    function setupStage3() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
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
                            <strong>${capitalize(source)} Column</strong><br>
                        </button>
                    `;
                });
            } else {
                optionsHtml = '<div class="no-sources">No columns available for borrowing</div>';
            }
            
            sourceOptions.innerHTML = optionsHtml;
            
            // Setup source selection
            document.querySelectorAll('.source-option').forEach(btn => {
                btn.onclick = () => handleStage3Decision(btn.dataset.source);
            });
        }
        
        showStage(3);
    }
    
    function setupStage4() {
        const colData = getCurrentColumnData();
        if (!colData) return;
        
        // Display the subtraction problem
        const subProblemDisplay = document.getElementById('subProblemDisplay');
        if (subProblemDisplay) {
            const displayHtml = colData.borrowed ? 
                `<div class="sub-problem-with-borrow">
                    <div class="borrow-indicator-large">1</div>
                    <div class="subtraction-display">
                        <div class="top-digit">${colData.currentTopDigit}</div>
                        <div class="operator">-</div>
                        <div class="bottom-digit">${colData.bottomDigit}</div>
                    </div>
                </div>
                <div class="equals-line">=</div>
                <div class="answer-placeholder">?</div>` :
                `<div class="subtraction-display">
                    <div class="top-digit">${colData.currentTopDigit}</div>
                    <div class="operator">-</div>
                    <div class="bottom-digit">${colData.bottomDigit}</div>
                </div>
                <div class="equals-line">=</div>
                <div class="answer-placeholder">?</div>`;
            
            subProblemDisplay.innerHTML = displayHtml;
        }
        
        // Reset number controls
        if (window.resetNumberControls) {
            window.resetNumberControls();
        }
        
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
        
        // Show requested stage
        const stageToShow = document.getElementById(`stage${stageNumber}`);
        if (stageToShow) {
            stageToShow.classList.add('active');
            stageToShow.style.display = 'block';
        }
        
        currentStage = stageNumber;
    }
    
    // ================= DECISION HANDLERS =================
    function handleStage1Decision(userAnswer, needsBorrow) {
        if (userAnswer === needsBorrow) {
            showFeedback(
                needsBorrow ? 
                "✓ Correct! Need to borrow because top digit is smaller." : 
                "✓ Correct! No borrowing needed.",
                'correct'
            );
            
            setTimeout(() => {
                needsBorrow ? setupStage2() : setupStage4();
            }, 1000);
        } else {
            showFeedback(
                needsBorrow ? 
                `✗ Actually need to borrow because ${getCurrentColumnData().currentTopDigit} < ${getCurrentColumnData().bottomDigit}` :
                `✗ No borrowing needed because ${getCurrentColumnData().currentTopDigit} ≥ ${getCurrentColumnData().bottomDigit}`,
                'incorrect'
            );
            
            setTimeout(() => {
                needsBorrow ? setupStage2() : setupStage4();
            }, 1500);
        }
    }
    
    function handleStage2Decision(userAnswer, canBorrow) {
        if (userAnswer === canBorrow) {
            showFeedback(
                canBorrow ? 
                "✓ Yes! You can borrow from the next column." : 
                "✓ Correct. Need to look farther left.",
                'correct'
            );
            
            if (canBorrow) {
                // Check if next column has at least 1 (not 0)
                const leftColumn = getLeftColumn(currentColumn);
                const leftColData = getColumnData(leftColumn);
                
                if (leftColData && leftColData.currentTopDigit >= 1) {
                    executeSimpleBorrow(leftColumn);
                } else {
                    // Even though we said "yes" to borrowing, if it's 0, we need chain
                    setupStage3();
                }
            } else {
                setupStage3();
            }
        } else {
            showFeedback(
                canBorrow ? 
                "✗ Actually, you CAN borrow from the next column." : 
                "✗ Actually, you CANNOT borrow from the next column.",
                'incorrect'
            );
            
            setTimeout(() => {
                if (canBorrow) {
                    const leftColumn = getLeftColumn(currentColumn);
                    const leftColData = getColumnData(leftColumn);
                    
                    if (leftColData && leftColData.currentTopDigit >= 1) {
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
        const sourceData = getColumnData(selectedSource);
        if (sourceData && sourceData.currentTopDigit >= 1) {
            showFeedback(`✓ Borrowing from ${selectedSource} column...`, 'correct');
            executeChainBorrowing(selectedSource);
        } else {
            showFeedback("✗ Cannot borrow from that column.", 'incorrect');
        }
    }
    
    // ================= BORROWING EXECUTION =================
    function executeSimpleBorrow(sourceColumn) {
        const targetData = getCurrentColumnData();
        const sourceData = getColumnData(sourceColumn);
        
        if (!sourceData || sourceData.currentTopDigit < 1) {
            showFeedback("Error: Cannot borrow from this column", 'error');
            setTimeout(() => setupStage3(), 1000);
            return;
        }
        
        // Perform the borrow
        sourceData.currentTopDigit -= 1;
        targetData.currentTopDigit += 10;
        targetData.borrowed = true;
        
        showFeedback(`✓ Borrowed 1 from ${sourceColumn}`, 'correct');
        renderMainGrid();
        setTimeout(() => setupStage4(), 1000);
    }
    
    function executeChainBorrowing(sourceColumn) {
        try {
            console.log("=== START executeChainBorrowing ===");
            console.log("Source column:", sourceColumn);
            console.log("Current column:", currentColumn);
            
            // Log initial state
            console.log("Initial state:");
            columns.forEach(col => {
                const data = getColumnData(col);
                console.log(`  ${col}: ${data.currentTopDigit} (original: ${data.topDigit})`);
            });
            
            // Create chain from source to current column
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
            
            console.log("Chain:", chain);
            
            // NEW LOGIC: Process each column in the chain
            // Source column: -1
            // Intermediate columns: +9 each
            // Target column: +10
            
            console.log("Processing chain with new logic...");
            
            // Process source column (first in chain)
            const sourceData = getColumnData(sourceColumn);
            sourceData.currentTopDigit -= 1;
            console.log(`Source column (${sourceColumn}): -1 = ${sourceData.currentTopDigit}`);
            
            // Process intermediate columns (all except first and last)
            for (let i = 1; i < chain.length - 1; i++) {
                const colName = chain[i];
                const colData = getColumnData(colName);
                
                if (colData) {
                    const oldValue = colData.currentTopDigit;
                    colData.currentTopDigit += 9; // 10 - 1
                    console.log(`Intermediate column (${colName}): ${oldValue} + 9 = ${colData.currentTopDigit}`);
                }
            }
            
            // Process target column (last in chain)
            const targetData = getCurrentColumnData();
            const oldTargetValue = targetData.currentTopDigit;
            targetData.currentTopDigit += 10;
            targetData.borrowed = true;
            console.log(`Target column (${currentColumn}): ${oldTargetValue} + 10 = ${targetData.currentTopDigit}`);
            
            console.log("\nFinal state:");
            columns.forEach(col => {
                const data = getColumnData(col);
                console.log(`  ${col}: ${data.currentTopDigit}`);
            });
            
            console.log("=== END executeChainBorrowing ===");
            
            showFeedback(`✓ Borrowed from ${sourceColumn}`, 'correct');
            renderMainGrid();
            setTimeout(() => setupStage4(), 1000);
            
        } catch (error) {
            console.error("Error in executeChainBorrowing:", error);
            showFeedback(`✗ Error: ${error.message}`, 'error');
            setTimeout(() => setupStage3(), 1500);
        }
    }
    
    // ================= NUMBER CONTROLS =================
    function initNumberControls() {
        let currentNumber = 0;
        
        function updateDisplay() {
            if (currentNumberEl) {
                currentNumberEl.textContent = currentNumber;
            }
        }
        
        // Setup number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.onclick = function() {
                if (this.classList.contains('clear')) {
                    currentNumber = 0;
                } else {
                    const change = +this.dataset.change;
                    const newValue = currentNumber + change;
                    
                    // Limit range to 0-18 (valid subtraction results)
                    if (newValue >= 0 && newValue <= 18) {
                        currentNumber = newValue;
                    }
                }
                
                updateDisplay();
            };
        });
        
        // Create reset function
        window.resetNumberControls = function() {
            currentNumber = 0;
            updateDisplay();
        };
        
        updateDisplay();
    }
        
    function checkComputation() {
        const colData = getCurrentColumnData();
        
        // Check if this column is already completed
        if (colData?.completed) {
            showFeedback("✗ This column is already completed!", 'incorrect');
            return; // Exit early - don't process again
        }
        
        const userAnswer = currentNumberEl ? +currentNumberEl.textContent || 0 : 0;
        
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
            
            renderMainGrid();
            
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
    
    // ================= HELPER FUNCTIONS =================
    function getCurrentColumnData() {
        return currentProblem?.columns.find(c => c.column === currentColumn);
    }
    
    function getColumnData(column) {
        return currentProblem?.columns.find(c => c.column === column);
    }
    
    function getLeftColumn(column) {
        const index = columns.indexOf(column);
        return index < columns.length - 1 ? columns[index + 1] : null;
    }
    
    function getRightColumn(column) {
        const index = columns.indexOf(column);
        return index > 0 ? columns[index - 1] : null;
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
                </div>
            `;
            
            setTimeout(() => {
                const nextProblemBtn = document.getElementById('nextProblem');
                if (nextProblemBtn) {
                    nextProblemBtn.onclick = generateSubtractionProblem;
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
        if (correctCountEl) correctCountEl.textContent = scores.correct;
        if (incorrectCountEl) incorrectCountEl.textContent = scores.incorrect;
        if (totalCountEl) totalCountEl.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
        
        saveScores();
    }
    
    function loadScores() {
        try {
            const saved = localStorage.getItem('subtractionScores');
            if (saved) {
                const parsed = JSON.parse(saved);
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
            scores = { total: 0, correct: 0, incorrect: 0 };
            localStorage.removeItem('subtractionScores');
            updateScoreDisplay();
            generateSubtractionProblem();
        }
    }
    
    // Start the application
    initialize();
});
