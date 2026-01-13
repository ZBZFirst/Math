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
        this.totalAnswered = 0;
        this.totalCells = 0;
        this.answerTable = [];
        this.currentMode = 'filled';

        this.init();
    }

    init() {
        this.tableSize = parseInt(this.tableSizeInput.value) || 10;

        this.tableSizeInput.addEventListener('change', () => this.handleSizeChange());
        this.showFilledBtn.addEventListener('click', () => this.showFilledTable());
        this.makeBlankBtn.addEventListener('click', () => this.makeBlankTable());
        this.resetPracticeBtn.addEventListener('click', () => this.resetPractice());

        this.showFilledTable();
    }

    handleSizeChange() {
        let value = parseInt(this.tableSizeInput.value);
        value = Math.min(Math.max(value || 1, 1), 20);
        this.tableSizeInput.value = value;
        this.tableSize = value;

        this.currentMode === 'filled'
            ? this.showFilledTable()
            : this.makeBlankTable();
    }

    generateAnswerTable() {
        this.answerTable = [];
        for (let i = 0; i <= this.tableSize; i++) {
            this.answerTable[i] = [];
            for (let j = 0; j <= this.tableSize; j++) {
                this.answerTable[i][j] = i * j;
            }
        }
        this.totalCells = this.tableSize * this.tableSize;
        this.updateStats();
    }

    showFilledTable() {
        this.currentMode = 'filled';
        this.generateAnswerTable();

        let html = '<table class="multiplication-table"><tr><td class="header">×</td>';
        for (let i = 1; i <= this.tableSize; i++) {
            html += `<td class="header">${i}</td>`;
        }
        html += '</tr>';

        for (let r = 1; r <= this.tableSize; r++) {
            html += `<tr><td class="header">${r}</td>`;
            for (let c = 1; c <= this.tableSize; c++) {
                html += `<td>${this.answerTable[r][c]}</td>`;
            }
            html += '</tr>';
        }

        html += '</table>';
        this.tableContainer.innerHTML = html;

        this.correctAnswers = 0;
        this.totalAnswered = 0;
        this.updateStats();
    }

    makeBlankTable() {
        this.currentMode = 'practice';
        this.generateAnswerTable();

        let html = '<table class="multiplication-table"><tr><td class="header">×</td>';
        for (let i = 1; i <= this.tableSize; i++) {
            html += `<td class="header">${i}</td>`;
        }
        html += '</tr>';

        for (let r = 1; r <= this.tableSize; r++) {
            html += `<tr><td class="header">${r}</td>`;
            for (let c = 1; c <= this.tableSize; c++) {
                html += `
                    <td>
                        <input
                            type="text"
                            inputmode="numeric"
                            enterkeyhint="done"
                            maxlength="4"
                            data-row="${r}"
                            data-col="${c}"
                        >
                    </td>`;
            }
            html += '</tr>';
        }

        html += '</table>';
        this.tableContainer.innerHTML = ` <div class="table-scroll-container">
        ${html}
    </div>
`;

        this.attachInputHandlers();

        this.correctAnswers = 0;
        this.totalAnswered = 0;
        this.updateStats();

        setTimeout(() => {
            const first = this.tableContainer.querySelector('input');
            if (first) first.focus();
        }, 100);
    }

    attachInputHandlers() {
        const inputs = this.tableContainer.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.checkAnswer(input);
                }
            });

            input.addEventListener('change', () => {
                if (!input.disabled && input.value !== '') {
                    this.checkAnswer(input);
                }
            });

            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^\d]/g, '');
            });

            input.addEventListener('focus', () => {
                input.parentElement.classList.add('current-cell');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('current-cell');
            });
        });
    }

    checkAnswer(input) {
        if (input.disabled) return;

        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const cell = input.parentElement;
        const userAnswer = parseInt(input.value);
        const correctAnswer = this.answerTable[row][col];

        if (isNaN(userAnswer)) return;

        this.totalAnswered++;

        if (userAnswer === correctAnswer) {
            cell.classList.add('correct-cell');
            input.disabled = true;
            this.correctAnswers++;
            this.playSuccessSound();
            this.focusNext(row, col);
        } else {
            cell.classList.add('shake');
            setTimeout(() => cell.classList.remove('shake'), 400);
            input.value = '';
            input.focus();
        }

        this.updateStats();
    }

    focusNext(row, col) {
        col++;
        if (col > this.tableSize) {
            col = 1;
            row++;
        }
        if (row > this.tableSize) return;

        const next = this.tableContainer.querySelector(
            `input[data-row="${row}"][data-col="${col}"]`
        );

        if (next && !next.disabled) {
            next.focus();
        } else {
            this.focusNext(row, col);
        }
    }

    updateStats() {
        this.correctCountEl.textContent = this.correctAnswers;
        this.totalCellsEl.textContent = this.totalCells;

        const progress = Math.round((this.correctAnswers / this.totalCells) * 100) || 0;
        const accuracy = Math.round((this.correctAnswers / this.totalAnswered) * 100) || 0;

        this.progressPercentEl.textContent = `${progress}%`;
        this.accuracyRateEl.textContent = `${accuracy}%`;
        this.progressFillEl.style.width = `${progress}%`;

        this.progressTextEl.textContent =
            progress === 100 ? '🎉 Perfect! Table Complete!' :
            progress >= 50 ? 'Great progress!' :
            'Keep going!';
    }

    resetPractice() {
        if (this.currentMode === 'practice' && confirm('Reset all answers?')) {
            this.makeBlankTable();
        }
    }

    playSuccessSound() {
        if (this.correctSound) {
            this.correctSound.currentTime = 0;
            this.correctSound.play().catch(() => {});
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationTable();
});