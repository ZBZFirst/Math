
// ============================================
// Minimal Hide/Show Controller for Division App
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Division app - Hide/Show controller loaded');
    
    // Get DOM elements
    const commitBtn = document.getElementById('commitGuessBtn');
    const currentStepContainer = document.querySelector('.current-step-container');
    const workFeedback = document.getElementById('workFeedback');
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    
    // Initialize to show everything is working
    console.log('Elements found:', {
        commitBtn: commitBtn ? '✓' : '✗',
        currentStepContainer: currentStepContainer ? '✓' : '✗',
        workFeedback: workFeedback ? '✓' : '✗',
        currentGuessDisplay: currentGuessDisplay ? '✓' : '✗'
    });
    
    // Handle commit button click
    if (commitBtn) {
        commitBtn.addEventListener('click', function() {
            console.log('Commit button clicked!');
            
            // Toggle the current step container
            if (currentStepContainer) {
                if (currentStepContainer.classList.contains('hidden')) {
                    currentStepContainer.classList.remove('hidden');
                    console.log('Current step container: SHOWN');
                } else {
                    currentStepContainer.classList.add('hidden');
                    console.log('Current step container: HIDDEN');
                }
            }
            
            // Toggle the work feedback (control buttons)
            if (workFeedback) {
                if (workFeedback.classList.contains('hidden')) {
                    workFeedback.classList.remove('hidden');
                    console.log('Work feedback: SHOWN');
                } else {
                    workFeedback.classList.add('hidden');
                    console.log('Work feedback: HIDDEN');
                }
            }
            
            // Reset the guess display to 0
            if (currentGuessDisplay) {
                currentGuessDisplay.textContent = '0';
                console.log('Guess reset to 0');
            }
            
            // Add visual feedback to button
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    }
    
    // Optional: Add keyboard support for Enter key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && commitBtn) {
            commitBtn.click();
            console.log('Enter key pressed - triggered commit button');
        }
    });
});
