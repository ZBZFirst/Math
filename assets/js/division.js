// ============================================
// Enhanced Hide/Show Controller for Division App
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Division app - Enhanced Hide/Show controller loaded');
    
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
    
    // Function to copy values from main equation to division table
    function copyValuesToDivisionTable() {
        console.log('Copying values to division table...');
        
        // Copy Dividend values (hundreds, tens, ones)
        const dividendHundreds = document.querySelector('.large-equation .dividend.hundreds');
        const dividendTens = document.querySelector('.large-equation .dividend.tens');
        const dividendOnes = document.querySelector('.large-equation .dividend.ones');
        
        const tableDividendHundreds = document.querySelector('.division-table.dividend.hundreds');
        const tableDividendTens = document.querySelector('.division-table.dividend.tens');
        const tableDividendOnes = document.querySelector('.division-table.dividend.ones');
        
        if (dividendHundreds && tableDividendHundreds) {
            tableDividendHundreds.textContent = dividendHundreds.textContent;
            console.log(`Dividend hundreds: ${dividendHundreds.textContent} → ${tableDividendHundreds.textContent}`);
        }
        
        if (dividendTens && tableDividendTens) {
            tableDividendTens.textContent = dividendTens.textContent;
            console.log(`Dividend tens: ${dividendTens.textContent} → ${tableDividendTens.textContent}`);
        }
        
        if (dividendOnes && tableDividendOnes) {
            tableDividendOnes.textContent = dividendOnes.textContent;
            console.log(`Dividend ones: ${dividendOnes.textContent} → ${tableDividendOnes.textContent}`);
        }
        
        // Copy Divisor values (tens, ones)
        const divisorTens = document.querySelector('.large-equation .divisor.tens');
        const divisorOnes = document.querySelector('.large-equation .divisor.ones');
        
        const tableDivisorTens = document.querySelector('.division-table.divisor.tens');
        const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
        
        if (divisorTens && tableDivisorTens) {
            tableDivisorTens.textContent = divisorTens.textContent;
            console.log(`Divisor tens: ${divisorTens.textContent} → ${tableDivisorTens.textContent}`);
        }
        
        if (divisorOnes && tableDivisorOnes) {
            tableDivisorOnes.textContent = divisorOnes.textContent;
            console.log(`Divisor ones: ${divisorOnes.textContent} → ${tableDivisorOnes.textContent}`);
        }
        
        // Copy Answer values if they exist in the main equation
        const answerHundreds = document.querySelector('.large-equation .answer.hundreds');
        const answerTens = document.querySelector('.large-equation .answer.tens');
        const answerOnes = document.querySelector('.large-equation .answer.ones');
        
        const tableAnswerHundreds = document.querySelector('.division-table.answer.hundreds.green');
        const tableAnswerTens = document.querySelector('.division-table.answer.tens.green');
        const tableAnswerOnes = document.querySelector('.division-table.answer.ones.green');
        
        if (answerHundreds && tableAnswerHundreds && answerHundreds.textContent !== '?') {
            tableAnswerHundreds.textContent = answerHundreds.textContent;
            console.log(`Answer hundreds: ${answerHundreds.textContent} → ${tableAnswerHundreds.textContent}`);
        }
        
        if (answerTens && tableAnswerTens && answerTens.textContent !== '?') {
            tableAnswerTens.textContent = answerTens.textContent;
            console.log(`Answer tens: ${answerTens.textContent} → ${tableAnswerTens.textContent}`);
        }
        
        if (answerOnes && tableAnswerOnes && answerOnes.textContent !== '?') {
            tableAnswerOnes.textContent = answerOnes.textContent;
            console.log(`Answer ones: ${answerOnes.textContent} → ${tableAnswerOnes.textContent}`);
        }
        
        // Copy Remainder values if they exist
        const remainderTens = document.querySelector('.large-equation .remainder.tens');
        const remainderOnes = document.querySelector('.large-equation .remainder.ones');
        
        const tableRemainderTens = document.querySelector('.division-table.answer.remainder.tens.green');
        const tableRemainderOnes = document.querySelector('.division-table.answer.remainder.ones.green');
        
        if (remainderTens && tableRemainderTens) {
            tableRemainderTens.textContent = remainderTens.textContent || '';
            console.log(`Remainder tens: ${remainderTens.textContent} → ${tableRemainderTens.textContent}`);
        }
        
        if (remainderOnes && tableRemainderOnes) {
            tableRemainderOnes.textContent = remainderOnes.textContent || '';
            console.log(`Remainder ones: ${remainderOnes.textContent} → ${tableRemainderOnes.textContent}`);
        }
        
        console.log('Values copied to division table');
    }
    
    // Handle commit button click
    if (commitBtn) {
        commitBtn.addEventListener('click', function() {
            console.log('Commit button clicked!');
            
            // FIRST: Copy values to division table
            copyValuesToDivisionTable();
            
            // SECOND: Toggle the current step container
            if (currentStepContainer) {
                if (currentStepContainer.classList.contains('hidden')) {
                    currentStepContainer.classList.remove('hidden');
                    console.log('Current step container: SHOWN');
                } else {
                    currentStepContainer.classList.add('hidden');
                    console.log('Current step container: HIDDEN');
                }
            }
            
            // THIRD: Toggle the work feedback (control buttons)
            if (workFeedback) {
                if (workFeedback.classList.contains('hidden')) {
                    workFeedback.classList.remove('hidden');
                    console.log('Work feedback: SHOWN');
                } else {
                    workFeedback.classList.add('hidden');
                    console.log('Work feedback: HIDDEN');
                }
            }
            
            // FOURTH: Reset the guess display to 0
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
    
    // Optional: Initialize the division table on page load
    console.log('Initializing division table on page load...');
    copyValuesToDivisionTable();
});
