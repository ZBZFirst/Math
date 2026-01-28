// ============================================
// Enhanced Hide/Show Controller with Group Animation
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Division app - Enhanced Hide/Show controller with group animation loaded');
    
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
            
            /* Shake animation for groups */
            @keyframes shakeGroup {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                20%, 40%, 60%, 80% { transform: translateX(8px); }
            }
            
            /* Fly animation for moving groups to table */
            @keyframes flyGroupToTable {
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
            
            /* Fade in animation for table groups */
            @keyframes fadeInGroup {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            /* Apply highlight to main equation */
            .large-equation.highlighted {
                animation: highlightEquation 1.5s ease-in-out;
                font-size: 1.5em !important; /* Increase font size by 0.5em from base */
            }
            
            /* Apply shake to groups */
            .divisor-group.shaking,
            .dividend-group.shaking {
                animation: shakeGroup 0.6s ease-in-out;
                display: inline-block;
                position: relative;
            }
            
            /* Apply fly animation to groups */
            .flying-group {
                position: fixed;
                z-index: 1000;
                font-size: 1.5em;
                font-weight: bold;
                color: #2196f3;
                pointer-events: none;
                animation: flyGroupToTable 1s ease-in-out forwards;
                background: rgba(255, 255, 255, 0.9);
                padding: 5px 10px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                white-space: nowrap;
            }
            
            /* Style for table groups after animation */
            .division-table-group.animated-in {
                animation: fadeInGroup 0.5s ease-out forwards;
            }
            
            /* Group wrapper styles */
            .group-wrapper {
                display: inline-block;
                position: relative;
            }
            
            /* Add colored backgrounds for visual grouping */
            .divisor-group .divisor {
                background-color: rgba(33, 150, 243, 0.1);
                padding: 2px 4px;
                border-radius: 4px;
                margin: 0 1px;
            }
            
            .dividend-group .dividend {
                background-color: rgba(255, 152, 0, 0.1);
                padding: 2px 4px;
                border-radius: 4px;
                margin: 0 1px;
            }
            
            /* Highlight table cells when group arrives */
            .division-table.highlight-arrival {
                background-color: rgba(76, 175, 80, 0.2) !important;
                transition: background-color 0.5s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to get group wrapper element
    function createGroupWrapper(elements, className) {
        const wrapper = document.createElement('div');
        wrapper.className = `group-wrapper ${className}`;
        
        // Create a deep clone of each element to preserve styling
        elements.forEach(el => {
            if (el) {
                const clone = el.cloneNode(true);
                // Remove specific positioning classes if they exist
                clone.className = clone.className.replace(/\b(hundreds|tens|ones)\b/g, '').trim();
                wrapper.appendChild(clone);
            }
        });
        
        return wrapper;
    }
    
    // Function to create flying group animation
    function createFlyingGroup(sourceElements, targetElements, groupName) {
        // Create a container for the source elements' positions
        const sourceRect = {
            left: Math.min(...sourceElements.map(el => el.getBoundingClientRect().left)),
            top: Math.min(...sourceElements.map(el => el.getBoundingClientRect().top)),
            right: Math.max(...sourceElements.map(el => el.getBoundingClientRect().right)),
            bottom: Math.max(...sourceElements.map(el => el.getBoundingClientRect().bottom)),
        };
        
        const targetRect = {
            left: Math.min(...targetElements.map(el => el.getBoundingClientRect().left)),
            top: Math.min(...targetElements.map(el => el.getBoundingClientRect().top)),
            right: Math.max(...targetElements.map(el => el.getBoundingClientRect().right)),
            bottom: Math.max(...targetElements.map(el => el.getBoundingClientRect().bottom)),
        };
        
        // Create flying group element
        const flyingGroup = document.createElement('div');
        flyingGroup.className = 'flying-group';
        
        // Add the combined text content
        const groupText = sourceElements.map(el => el.textContent).join('');
        flyingGroup.textContent = groupText;
        
        // Calculate center positions
        const sourceCenterX = sourceRect.left + (sourceRect.right - sourceRect.left) / 2;
        const sourceCenterY = sourceRect.top + (sourceRect.bottom - sourceRect.top) / 2;
        
        const targetCenterX = targetRect.left + (targetRect.right - targetRect.left) / 2;
        const targetCenterY = targetRect.top + (targetRect.bottom - targetRect.top) / 2;
        
        // Calculate movement
        const tx = targetCenterX - sourceCenterX;
        const ty = targetCenterY - sourceCenterY;
        
        // Position the flying group at the source center
        flyingGroup.style.left = `${sourceCenterX}px`;
        flyingGroup.style.top = `${sourceCenterY}px`;
        flyingGroup.style.transform = 'translate(-50%, -50%)';
        
        // Set CSS custom properties for animation
        flyingGroup.style.setProperty('--tx', `${tx}px`);
        flyingGroup.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(flyingGroup);
        
        // Remove flying element after animation
        setTimeout(() => {
            if (flyingGroup.parentNode) {
                flyingGroup.parentNode.removeChild(flyingGroup);
            }
        }, 1000);
        
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Function to animate divisor group moving to table
    async function animateDivisorToTable() {
        console.log('Animating divisor group to table...');
        
        // Get divisor elements from main equation
        const divisorElements = [
            document.querySelector('.large-equation .divisor.tens'),
            document.querySelector('.large-equation .divisor.ones')
        ].filter(el => el && el.textContent.trim());
        
        if (divisorElements.length === 0) {
            console.log('No divisor elements found');
            return;
        }
        
        // Get divisor table cells
        const tableDivisorElements = [
            document.querySelector('.division-table.divisor.tens'),
            document.querySelector('.division-table.divisor.ones')
        ].filter(el => el);
        
        if (tableDivisorElements.length === 0) {
            console.log('No divisor table cells found');
            return;
        }
        
        // Wrap the divisor elements in the main equation for shaking
        const divisorWrapper = createGroupWrapper(divisorElements, 'divisor-group');
        const divisorContainer = divisorElements[0].parentNode;
        
        // Replace individual elements with wrapper
        divisorElements.forEach((el, index) => {
            if (index === 0) {
                el.parentNode.insertBefore(divisorWrapper, el);
            }
            divisorWrapper.appendChild(el);
        });
        
        // Add shake animation to the whole group
        divisorWrapper.classList.add('shaking');
        
        // Wait for shake to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove shake class
        divisorWrapper.classList.remove('shaking');
        
        // Animate the group flying to the table
        await createFlyingGroup(divisorElements, tableDivisorElements, 'divisor');
        
        // Update table cells with values
        divisorElements.forEach((el, index) => {
            if (tableDivisorElements[index]) {
                tableDivisorElements[index].textContent = el.textContent;
                tableDivisorElements[index].classList.add('highlight-arrival');
            }
        });
        
        // Remove highlight after a moment
        setTimeout(() => {
            tableDivisorElements.forEach(cell => {
                if (cell) cell.classList.remove('highlight-arrival');
            });
        }, 1000);
        
        console.log('Divisor group animation complete');
    }
    
    // Function to animate dividend group moving to table
    async function animateDividendToTable() {
        console.log('Animating dividend group to table...');
        
        // Get dividend elements from main equation
        const dividendElements = [
            document.querySelector('.large-equation .dividend.hundreds'),
            document.querySelector('.large-equation .dividend.tens'),
            document.querySelector('.large-equation .dividend.ones')
        ].filter(el => el && el.textContent.trim());
        
        if (dividendElements.length === 0) {
            console.log('No dividend elements found');
            return;
        }
        
        // Get dividend table cells
        const tableDividendElements = [
            document.querySelector('.division-table.dividend.hundreds'),
            document.querySelector('.division-table.dividend.tens'),
            document.querySelector('.division-table.dividend.ones')
        ].filter(el => el);
        
        if (tableDividendElements.length === 0) {
            console.log('No dividend table cells found');
            return;
        }
        
        // Wrap the dividend elements in the main equation for shaking
        const dividendWrapper = createGroupWrapper(dividendElements, 'dividend-group');
        const dividendContainer = dividendElements[0].parentNode;
        
        // Replace individual elements with wrapper
        dividendElements.forEach((el, index) => {
            if (index === 0) {
                el.parentNode.insertBefore(dividendWrapper, el);
            }
            dividendWrapper.appendChild(el);
        });
        
        // Add shake animation to the whole group
        dividendWrapper.classList.add('shaking');
        
        // Wait for shake to complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove shake class
        dividendWrapper.classList.remove('shaking');
        
        // Animate the group flying to the table
        await createFlyingGroup(dividendElements, tableDividendElements, 'dividend');
        
        // Update table cells with values
        dividendElements.forEach((el, index) => {
            if (tableDividendElements[index]) {
                tableDividendElements[index].textContent = el.textContent;
                tableDividendElements[index].classList.add('highlight-arrival');
            }
        });
        
        // Remove highlight after a moment
        setTimeout(() => {
            tableDividendElements.forEach(cell => {
                if (cell) cell.classList.remove('highlight-arrival');
            });
        }, 1000);
        
        console.log('Dividend group animation complete');
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
        
        // Step 2: Animate divisor group moving to table
        await animateDivisorToTable();
        
        // Step 3: Animate dividend group moving to table
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
