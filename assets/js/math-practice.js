// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a math practice page by looking for required elements
    const problemStatement = document.getElementById('problemStatement');
    const userAnswerInput = document.getElementById('userAnswer');
    
    // If we don't have the math practice elements, we're on the homepage
    if (!problemStatement || !userAnswerInput) {
        console.log('Homepage detected, math practice disabled');
        return; // Exit early, we're on homepage
    }
    
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
    
    // DOM elements - all should exist since we're on a practice page
    const submitButton = document.getElementById('submitAnswer');
    const newProblemButton = document.getElementById('newProblem');
    const feedbackDiv = document.getElementById('feedback');
    const correctCount = document.getElementById('correctCount');
    const incorrectCount = document.getElementById('incorrectCount');
    const totalCount = document.getElementById('totalCount');
    const accuracyRate = document.getElementById('accuracyRate');
    const resetScoresButton = document.getElementById('resetScores');
    
    // Verify all required elements exist
    if (!submitButton || !newProblemButton || !feedbackDiv) {
        console.error('Missing required elements for math practice');
        return;
    }
    
    // Load scores from localStorage
    function loadScores() {
        const saved = localStorage.getItem(`mathScores_${operation}`);
        if (saved) {
            try {
                scores = JSON.parse(saved);
                updateScoreDisplay();
            } catch (error) {
                console.error('Error loading scores:', error);
                resetScoresToDefault();
            }
        }
    }
    
    // Reset scores to default values
    function resetScoresToDefault() {
        scores = {
            correct: 0,
            incorrect: 0,
            total: 0
        };
        updateScoreDisplay();
    }
    
    // Save scores to localStorage
    function saveScores() {
        try {
            localStorage.setItem(`mathScores_${operation}`, JSON.stringify(scores));
        } catch (error) {
            console.error('Error saving scores:', error);
        }
    }
    
    // Update score display
    function updateScoreDisplay() {
        if (correctCount) correctCount.textContent = scores.correct;
        if (incorrectCount) incorrectCount.textContent = scores.incorrect;
        if (totalCount) totalCount.textContent = scores.total;
        
        const accuracy = scores.total > 0 ? 
            Math.round((scores.correct / scores.total) * 100) : 0;
        if (accuracyRate) accuracyRate.textContent = `${accuracy}%`;
        
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
        
        // Focus on input field after a brief delay
        setTimeout(() => {
            userAnswerInput.focus();
        }, 100);
    }
    
    // Check user's answer
    function checkAnswer() {
        if (!currentProblem) {
            feedbackDiv.textContent = 'Please generate a problem first';
            feedbackDiv.className = 'feedback incorrect';
            return;
        }
        
        const userAnswer = parseInt(userAnswerInput.value);
        
        if (isNaN(userAnswer)) {
            feedbackDiv.textContent = 'Please enter a valid number';
            feedbackDiv.className = 'feedback incorrect';
            return;
        }
        
        scores.total++;
        
        if (userAnswer === currentProblem.answer) {
            scores.correct++;
            feedbackDiv.textContent = '✅ Correct! Well done!';
            feedbackDiv.className = 'feedback correct';
            
            // Add celebratory animation
            problemStatement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                problemStatement.style.transform = 'scale(1)';
            }, 300);
        } else {
            scores.incorrect++;
            feedbackDiv.textContent = `❌ Incorrect. The answer was ${currentProblem.answer}.`;
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
        if (confirm('Are you sure you want to reset your scores for this operation?')) {
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
    
    // Handle keyboard shortcuts
    function handleKeyShortcuts(e) {
        // Ctrl+Enter or Cmd+Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            checkAnswer();
        }
        // N for new problem
        if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            generateProblem();
        }
    }
    
    // Initialize math practice
    function initializeMathPractice() {
        // Load saved scores
        loadScores();
        
        // Generate first problem
        generateProblem();
        
        // Add event listeners
        submitButton.addEventListener('click', checkAnswer);
        
        userAnswerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        newProblemButton.addEventListener('click', generateProblem);
        
        resetScoresButton.addEventListener('click', resetScores);
        
        // Add keyboard shortcut listener
        document.addEventListener('keydown', handleKeyShortcuts);
        
        // Add operation to body for CSS targeting if needed
        document.body.dataset.operation = operation;
        
        console.log(`Math practice initialized for: ${operation}`);
    }
    
    // Start the math practice
    initializeMathPractice();
});
