
// Multiplication Table Practice
// Main application logic

class MultiplicationTable {
    constructor() {
        // DOM Elements
        this.tableContainer = document.getElementById('tableContainer');
        this.tableSizeInput = document.getElementById('tableSize');
        this.showFilledBtn = document.getElementById('showFilledBtn');
        this.makeBlankBtn = document.getElementById('makeBlankBtn');
        this.resetPracticeBtn = document.getElementById('resetPracticeBtn');
        
        // Stats elements
        this.correctCountEl = document.getElementById('correctCount');
        this.totalCellsEl = document.getElementById('totalCells');
        this.progressPercentEl = document.getElementById('progressPercent');
        this.accuracyRateEl = document.getElementById('accuracyRate');
        this.progressFillEl = document.getElementById('progressFill');
        this.progressTextEl = document.getElementById('progressText');
        
        // Audio
        this.correctSound = document.getElementById('correctSound');
        
        // State
        this.tableSize = 10;
        this.correctAnswers = 0;
        this.totalCells = 0;
        this.totalAnswered = 0;
        this.answerTable = [];
        this.currentMode = 'filled'; // 'filled' or 'practice'
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set initial table size
        this.tableSize = parseInt(this.tableSizeInput.value) || 10;
        
        // Event Listeners
        this.tableSizeInput.addEventListener('change', () => this.handleSizeChange());
        this.tableSizeInput.addEventListener('input', () => this.showSizeWarning());
        
        this.showFilledBtn.addEventListener('click', () => this.showFilledTable());
        this.makeBlankBtn.addEventListener('click', () => this.makeBlankTable());
        this.resetPracticeBtn.addEventListener('click', () => this.resetPractice());
        
        // Initial table display
        this.showFilledTable();
    }
    
    handleSizeChange() {
        let value = parseInt(this.tableSizeInput.value);
        
        // Validate input
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 20) {
            value = 20;
        }
        
        this.tableSizeInput.value = value;
        this.tableSize = value;
        
        // Refresh current view
        if (this.currentMode === 'filled') {
            this.showFilledTable();
        } else {
            this.makeBlankTable();
        }
    }
    
    showSizeWarning() {
        const value = parseInt(this.tableSizeInput.value);
        // You could add a warning display here if needed
        if (value > 15) {
            console.log('Large table selected - may require scrolling');
        }
    }
    
    generateAnswerTable() {
        // Create 2D array for correct answers
        const size = this.tableSize;
        this.answerTable = [];
        
        for (let i = 0; i <= size; i++) {
            this.answerTable[i] = [];
            for (let j = 0; j <= size; j++) {
                this.answerTable[i][j] = i * j;
            }
        }
        
        this.totalCells = size * size;
        this.updateStats();
    }
    
    showFilledTable() {
        this.currentMode = 'filled';
        this.generateAnswerTable();
        
        let html = '<table class="multiplication-table">';
        
        // Header row
        html += '<tr>';
        html += '<td class="header">×</td>';
        for (let i = 1; i <= this.tableSize; i++) {
            html += `<td class="header">${i}</td>`;
        }
        html += '</tr>';
        
        // Table body with all answers
        for (let row = 1; row <= this.tableSize; row++) {
            html += '<tr>';
            html += `<td class="header">${row}</td>`;
            
            for (let col = 1; col <= this.tableSize; col++) {
                const product = this.answerTable[row][col];
                html += `<td>${product}</td>`;
            }
            
            html += '</tr>';
        }
        
        html += '</table>';
        this.tableContainer.innerHTML = html;
        
        // Reset practice stats but keep total cells
        this.correctAnswers = 0;
        this.totalAnswered = 0;
        this.updateStats();
    }
    
    makeBlankTable() {
        this.currentMode = 'practice';
        this.generateAnswerTable();
        
        let html = '<table class="multiplication-table">';
        
        // Header row
        html += '<tr>';
        html += '<td class="header">×</td>';
        for (let i = 1; i <= this.tableSize; i++) {
            html += `<td class="header">${i}</td>`;
        }
        html += '</tr>';
        
        // Table with input boxes
        for (let row = 1; row <= this.tableSize; row++) {
            html += '<tr>';
            html += `<td class="header">${row}</td>`;
            
            for (let col = 1; col <= this.tableSize; col++) {
                const cellId = `cell-${row}-${col}`;
                const inputId = `input-${row}-${col}`;
                
                html += `<td id="${cellId}">`;
                html += `<input type="text" id="${inputId}" 
                         data-row="${row}" 
                         data-col="${col}"
                         maxlength="4"
                         inputmode="numeric">`;
                html += '</td>';
            }
            
            html += '</tr>';
        }
        
        html += '</table>';
        this.tableContainer.innerHTML = html;
        
        // Add event listeners to inputs
        this.addInputEventListeners();
        
        // Reset practice stats
        this.correctAnswers = 0;
        this.totalAnswered = 0;
        this.updateStats();
        
        // Auto-focus first cell
        setTimeout(() => {
            const firstInput = document.getElementById('input-1-1');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    addInputEventListeners() {
        // Add event listeners to all input cells
        const inputs = this.tableContainer.querySelectorAll('input');
        
        inputs.forEach(input => {
            // Remove any existing listeners to avoid duplicates
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Add new listeners
            newInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
            newInput.addEventListener('focus', (e) => this.handleFocus(e));
            newInput.addEventListener('blur', (e) => this.handleBlur(e));
            newInput.addEventListener('input', (e) => this.handleInput(e));
        });
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.checkAnswer(event.target);
        }
        
        // Allow only numbers and backspace
        if (!/[\d\b]/.test(event.key) && event.key !== 'Enter') {
            event.preventDefault();
        }
    }
    
    handleFocus(event) {
        const input = event.target;
        const cell = input.parentElement;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        // Add highlight to current cell
        cell.classList.add('current-cell');
        
        // Update any relevant UI if needed
        // (e.g., show current position in stats)
    }
    
    handleBlur(event) {
        const input = event.target;
        const cell = input.parentElement;
        
        // Remove highlight
        cell.classList.remove('current-cell');
    }
    
    handleInput(event) {
        // Clean input - only allow numbers
        const input = event.target;
        input.value = input.value.replace(/[^\d]/g, '');
    }
    
    checkAnswer(inputElement) {
        const row = parseInt(inputElement.dataset.row);
        const col = parseInt(inputElement.dataset.col);
        const cell = inputElement.parentElement;
        const userAnswer = parseInt(inputElement.value);
        const correctAnswer = this.answerTable[row][col];
        
        if (isNaN(userAnswer) || inputElement.value === '') {
            return; // Empty input, do nothing
        }
        
        this.totalAnswered++;
        
        if (userAnswer === correctAnswer) {
            // CORRECT
            cell.classList.add('correct-cell');
            cell.classList.remove('current-cell');
            inputElement.blur();
            inputElement.disabled = true;
            
            this.correctAnswers++;
            this.playSuccessSound();
            
            // Auto-focus next cell
            setTimeout(() => {
                this.focusNextCell(row, col);
            }, 200);
            
        } else {
            // INCORRECT
            cell.classList.add('shake');
            setTimeout(() => {
                cell.classList.remove('shake');
            }, 500);
            
            // Clear for retry
            inputElement.value = '';
            inputElement.focus();
        }
        
        this.updateStats();
    }
    
    focusNextCell(currentRow, currentCol) {
        let nextRow = currentRow;
        let nextCol = currentCol + 1;
        
        if (nextCol > this.tableSize) {
            nextCol = 1;
            nextRow++;
            
            if (nextRow > this.tableSize) {
                // Reached the end - check if complete
                if (this.correctAnswers === this.totalCells) {
                    this.showCompletionMessage();
                }
                return;
            }
        }
        
        const nextInputId = `input-${nextRow}-${nextCol}`;
        const nextInput = document.getElementById(nextInputId);
        
        if (nextInput && !nextInput.disabled) {
            nextInput.focus();
        } else {
            // Skip to next available cell
            this.focusNextCell(nextRow, nextCol);
        }
    }
    
    updateStats() {
        // Update counts
        this.correctCountEl.textContent = this.correctAnswers;
        this.totalCellsEl.textContent = this.totalCells;
        
        // Calculate percentages
        const progressPercent = this.totalCells > 0 
            ? Math.round((this.correctAnswers / this.totalCells) * 100) 
            : 0;
        
        const accuracyRate = this.totalAnswered > 0 
            ? Math.round((this.correctAnswers / this.totalAnswered) * 100) 
            : 0;
        
        // Update percentage displays
        this.progressPercentEl.textContent = `${progressPercent}%`;
        this.accuracyRateEl.textContent = `${accuracyRate}%`;
        
        // Update progress bar
        this.progressFillEl.style.width = `${progressPercent}%`;
        
        // Update progress text
        if (progressPercent === 100) {
            this.progressTextEl.innerHTML = '🎉 Perfect! You completed the entire table! 🎉';
            this.progressTextEl.style.color = '#28a745';
        } else if (progressPercent >= 75) {
            this.progressTextEl.textContent = 'Almost there! Keep going!';
            this.progressTextEl.style.color = '';
        } else if (progressPercent >= 50) {
            this.progressTextEl.textContent = 'Great progress! Halfway done!';
            this.progressTextEl.style.color = '';
        } else if (progressPercent >= 25) {
            this.progressTextEl.textContent = 'Good start! Keep practicing!';
            this.progressTextEl.style.color = '';
        } else {
            this.progressTextEl.textContent = 'Fill in the table to see your progress!';
            this.progressTextEl.style.color = '';
        }
    }
    
    resetPractice() {
        if (this.currentMode === 'practice') {
            if (confirm('Reset all answers and start over?')) {
                this.makeBlankTable();
            }
        } else {
            alert('Switch to practice mode first by clicking "Make Blank for Practice"');
        }
    }
    
    showCompletionMessage() {
        setTimeout(() => {
            alert(`🎉 Congratulations! You've completed the ${this.tableSize}×${this.tableSize} multiplication table perfectly! 🎉`);
        }, 300);
    }
    
    playSuccessSound() {
        if (this.correctSound) {
            this.correctSound.currentTime = 0;
            this.correctSound.play().catch(e => {
                // Silent fallback if audio fails
                console.log('Audio play failed:', e);
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationTable();
});
