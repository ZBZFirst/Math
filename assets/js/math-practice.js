// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get current operation from page metadata
    const operation = document.querySelector('meta[name="operation"]')?.content || 
                     document.body.dataset.operation || 'addition';
    
    // State management
    let currentProblem = null;
    let scores = {
        correct: 0,
        incorrect: 0,
        total: 0
    };
    
    // DOM elements
    const problemStatement = document.getElementById('problemStatement');
    const userAnswerInput = document.getElementById('userAnswer');
    const submitButton = document.getElementById('submitAnswer');
    const newProblemButton = document.getElementById('newProblem');
    const feedbackDiv = document.getElementById('feedback');
    const correctCount = document.getElementById('correctCount');
    const incorrectCount = document.getElementById('incorrectCount');
    const totalCount = document.getElementById('totalCount');
    const accuracyRate = document.getElementById('accuracyRate');
    const resetScoresButton = document.getElementById('resetScores');
    
    // Load scores from localStorage
    function loadScores() {
        const saved = localStorage.getItem(`mathScores_${operation}`);
        if (saved) {
            scores = JSON.parse(saved);
            updateScoreDisplay();
        }
    }
    
    // Save scores to localStorage
    function saveScores() {
        localStorage.setItem(`mathScores_${operation}`, JSON.stringify(scores));
    }
    
    // Update score display
    function updateScoreDisplay() {
        correctCount.textContent = scores.correct;
        incorrectCount.textContent = scores.incorrect;
        totalCount.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        accuracyRate.textContent = `${accuracy}%`;
        
        saveScores();
    }
    
    // Generate a new math problem based on operation
    function generateProblem() {
        let num1, num2, answer, problemText;
        
        switch(operation) {
            case 'addition':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                problemText = `${num1} + ${num2} = ?`;
                break;
                
            case 'subtraction':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                problemText = `${num1} - ${num2} = ?`;
                break;
                
            case 'multiplication':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                problemText = `${num1} × ${num2} = ?`;
                break;
                
            case 'division':
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = Math.floor(Math.random() * 12) + 1;
                num1 = num2 * answer;
                problemText = `${num1} ÷ ${num2} = ?`;
                break;
                
            default:
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                problemText = `${num1} + ${num2} = ?`;
        }
        
        currentProblem = {
            num1: num1,
            num2: num2,
            answer: answer,
            text: problemText,
            operation: operation
        };
        
        problemStatement.textContent = problemText;
        userAnswerInput.value = '';
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'feedback';
        userAnswerInput.focus();
    }
    
    // Check user's answer
    function checkAnswer() {
        if (!currentProblem) return;
        
        const userAnswer = parseInt(userAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            feedbackDiv.textContent = 'Please enter a valid number';
            feedbackDiv.className = 'feedback incorrect';
            return;
        }
        
        scores.total++;
        
        if (userAnswer === currentProblem.answer) {
            scores.correct++;
            feedbackDiv.textContent = 'Correct! Well done!';
            feedbackDiv.className = 'feedback correct';
        } else {
            scores.incorrect++;
            feedbackDiv.textContent = `Incorrect. The answer was ${currentProblem.answer}.`;
            feedbackDiv.className = 'feedback incorrect';
        }
        
        updateScoreDisplay();
        
        // Auto-generate new problem after delay
        setTimeout(() => {
            generateProblem();
        }, 2000);
    }
    
    // Reset scores
    function resetScores() {
        if (confirm('Are you sure you want to reset your scores?')) {
            scores = {
                correct: 0,
                incorrect: 0,
                total: 0
            };
            localStorage.removeItem(`mathScores_${operation}`);
            updateScoreDisplay();
            generateProblem();
        }
    }
    
    // Event Listeners
    submitButton.addEventListener('click', checkAnswer);
    
    userAnswerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    newProblemButton.addEventListener('click', generateProblem);
    
    resetScoresButton.addEventListener('click', resetScores);
    
    // Initialize
    loadScores();
    generateProblem();
    
    // Add operation to body for CSS targeting if needed
    document.body.dataset.operation = operation;
});
