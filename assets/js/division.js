// ============================================
// Enhanced Hide/Show Controller with Auto-Animation
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Division app - Enhanced Hide/Show controller with auto-animation loaded');
    
    // Get DOM elements
    const commitBtn = document.getElementById('commitGuessBtn');
    const currentStepContainer = document.querySelector('.current-step-container');
    const workFeedback = document.getElementById('workFeedback');
    const currentGuessDisplay = document.getElementById('currentGuessDisplay');
    const mainEquation = document.getElementById('mainEquation');
    
    // Initialize to show everything is working
    console.log('Elements found:', {
        commitBtn: commitBtn ? '✓' : '✗',
        currentStepContainer: currentStepContainer ? '✓' : '✗',
        workFeedback: workFeedback ? '✓' : '✗',
        currentGuessDisplay: currentGuessDisplay ? '✓' : '✗',
        mainEquation: mainEquation ? '✓' : '✗'
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
        
        console.log('Values copied to division table');
    }
    
    // Function to add CSS for animations
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Highlight animation for main equation */
            @keyframes highlightEquation {
                0% { 
                    transform: scale(1);
                    text-shadow: 0 0 0 rgba(33, 150, 243, 0);
                }
                50% { 
                    transform: scale(1.05);
                    text-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
                }
                100% { 
                    transform: scale(1);
                    text-shadow: 0 0 0 rgba(33, 150, 243, 0);
                }
            }
            
            /* Shake animation for elements */
            @keyframes shakeElement {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            /* Fly animation for moving numbers to table */
            @keyframes flyToTable {
                0% { 
                    opacity: 1;
                    transform: scale(1) translate(0, 0);
                }
                50% { 
                    opacity: 0.7;
                    transform: scale(0.8) translate(var(--tx, 0), var(--ty, 0));
                }
                100% { 
                    opacity: 0;
                    transform: scale(0.5) translate(var(--tx, 0), var(--ty, 0));
                }
            }
            
            /* Fade in animation for table cells */
            @keyframes fadeInTable {
                0% { opacity: 0; transform: scale(0.5); }
                100% { opacity: 1; transform: scale(1); }
            }
            
            /* Apply highlight to main equation */
            .large-equation.highlighted {
                animation: highlightEquation 1.5s ease-in-out;
                font-size: 1.5em !important; /* Increase font size by 0.5em from base */
            }
            
            /* Apply shake to elements */
            .divisor.shaking,
            .dividend.shaking {
                animation: shakeElement 0.5s ease-in-out;
                display: inline-block;
                color: #2196f3 !important;
            }
            
            /* Apply fly animation */
            .flying-number {
                position: fixed;
                z-index: 1000;
                font-size: 1.5em;
                font-weight: bold;
                color: #2196f3;
                pointer-events: none;
                animation: flyToTable 1s ease-in-out forwards;
            }
            
            /* Style for table cells after animation */
            .division-table.animated-in {
                animation: fadeInTable 0.5s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to create flying number animation
    function createFlyingNumber(element, target, index) {
        const rect = element.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        // Create flying number element
        const flyingNumber = document.createElement('div');
        flyingNumber.className = 'flying-number';
        flyingNumber.textContent = element.textContent;
        flyingNumber.style.left = `${rect.left + rect.width / 2}px`;
        flyingNumber.style.top = `${rect.top + rect.height / 2}px`;
        
        // Calculate movement direction
        const tx = targetRect.left - rect.left;
        const ty = targetRect.top - rect.top;
        
        // Set CSS custom properties for animation
        flyingNumber.style.setProperty('--tx', `${tx}px`);
        flyingNumber.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(flyingNumber);
        
        // Remove flying element after animation
        setTimeout(() => {
            if (flyingNumber.parentNode) {
                flyingNumber.parentNode.removeChild(flyingNumber);
            }
        }, 1000);
        
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Function to animate divisor moving to table
    async function animateDivisorToTable() {
        console.log('Animating divisor to table...');
        
        // Get divisor elements
        const divisorTens = document.querySelector('.large-equation .divisor.tens');
        const divisorOnes = document.querySelector('.large-equation .divisor.ones');
        
        const tableDivisorTens = document.querySelector('.division-table.divisor.tens');
        const tableDivisorOnes = document.querySelector('.division-table.divisor.ones');
        
        // Add shake animation to divisor
        if (divisorTens) divisorTens.classList.add('shaking');
        if (divisorOnes) divisorOnes.classList.add('shaking');
        
        // Wait for shake to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove shake classes
        if (divisorTens) divisorTens.classList.remove('shaking');
        if (divisorOnes) divisorOnes.classList.remove('shaking');
        
        // Animate tens digit if it exists and has content
        if (divisorTens && divisorTens.textContent.trim() && tableDivisorTens) {
            await createFlyingNumber(divisorTens, tableDivisorTens, 1);
            tableDivisorTens.textContent = divisorTens.textContent;
            tableDivisorTens.classList.add('animated-in');
        }
        
        // Animate ones digit
        if (divisorOnes && tableDivisorOnes) {
            await createFlyingNumber(divisorOnes, tableDivisorOnes, 2);
            tableDivisorOnes.textContent = divisorOnes.textContent;
            tableDivisorOnes.classList.add('animated-in');
        }
        
        console.log('Divisor animation complete');
    }
    
    // Function to animate dividend moving to table
    async function animateDividendToTable() {
        console.log('Animating dividend to table...');
        
        // Get dividend elements
        const dividendHundreds = document.querySelector('.large-equation .dividend.hundreds');
        const dividendTens = document.querySelector('.large-equation .dividend.tens');
        const dividendOnes = document.querySelector('.large-equation .dividend.ones');
        
        const tableDividendHundreds = document.querySelector('.division-table.dividend.hundreds');
        const tableDividendTens = document.querySelector('.division-table.dividend.tens');
        const tableDividendOnes = document.querySelector('.division-table.dividend.ones');
        
        // Add shake animation to dividend
        if (dividendHundreds) dividendHundreds.classList.add('shaking');
        if (dividendTens) dividendTens.classList.add('shaking');
        if (dividendOnes) dividendOnes.classList.add('shaking');
        
        // Wait for shake to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove shake classes
        if (dividendHundreds) dividendHundreds.classList.remove('shaking');
        if (dividendTens) dividendTens.classList.remove('shaking');
        if (dividendOnes) dividendOnes.classList.remove('shaking');
        
        // Animate hundreds digit if it exists and has content
        if (dividendHundreds && dividendHundreds.textContent.trim() && tableDividendHundreds) {
            await createFlyingNumber(dividendHundreds, tableDividendHundreds, 1);
            tableDividendHundreds.textContent = dividendHundreds.textContent;
            tableDividendHundreds.classList.add('animated-in');
        }
        
        // Animate tens digit if it exists and has content
        if (dividendTens && dividendTens.textContent.trim() && tableDividendTens) {
            await createFlyingNumber(dividendTens, tableDividendTens, 2);
            tableDividendTens.textContent = dividendTens.textContent;
            tableDividendTens.classList.add('animated-in');
        }
        
        // Animate ones digit
        if (dividendOnes && tableDividendOnes) {
            await createFlyingNumber(dividendOnes, tableDividendOnes, 3);
            tableDividendOnes.textContent = dividendOnes.textContent;
            tableDividendOnes.classList.add('animated-in');
        }
        
        console.log('Dividend animation complete');
    }
    
    // Main animation sequence
    async function runAnimationSequence() {
        console.log('Starting automatic animation sequence...');
        
        // Step 1: Highlight the main equation and increase font size
        if (mainEquation) {
            console.log('Step 1: Highlighting main equation...');
            mainEquation.classList.add('highlighted');
            
            // Wait for highlight animation to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Remove highlight class but keep increased font size
            mainEquation.classList.remove('highlighted');
            
            // Ensure the font size stays increased
            mainEquation.style.fontSize = '1.5em';
        }
        
        // Step 2: Animate divisor moving to table
        await animateDivisorToTable();
        
        // Step 3: Animate dividend moving to table
        await animateDividendToTable();
        
        // Step 4: Show the work feedback controls
        if (workFeedback && workFeedback.classList.contains('hidden')) {
            console.log('Step 4: Showing work feedback controls...');
            workFeedback.classList.remove('hidden');
        }
        
        // Step 5: Show current step container
        if (currentStepContainer && currentStepContainer.classList.contains('hidden')) {
            console.log('Step 5: Showing current step container...');
            currentStepContainer.classList.remove('hidden');
        }
        
        console.log('Animation sequence complete!');
    }
    
    // Handle commit button click (manual override)
    if (commitBtn) {
        commitBtn.addEventListener('click', function() {
            console.log('Commit button clicked manually!');
            
            // Copy values to division table
            copyValuesToDivisionTable();
            
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
    
    // Initialize everything
    function initialize() {
        // Add animation styles
        addAnimationStyles();
        
        // Start the automatic animation sequence after a brief delay
        setTimeout(() => {
            runAnimationSequence();
        }, 1000); // 1 second delay to ensure everything is loaded
        
        // Also copy values immediately (as backup)
        copyValuesToDivisionTable();
    }
    
    // Start initialization
    initialize();
});
