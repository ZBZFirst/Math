
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

I am looking at adding another functionality to this and changing the sequence of events.

RIght now when the page loads this is all we are doing.

But we have a "division-table" where we want the numbers to appear.

The html is coded so that the classes have equivalent names so that we can copy items to them

<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Division Practice - Math Practice</title>
    <link rel="stylesheet" href="/Math/assets/css/style.css">
    <link rel="stylesheet" href="/Math/assets/css/division.css">
    <link rel="stylesheet" href="/Math/assets/css/buttons.css">
    <meta name="operation" content="division">
</head>
<body class="desktop-view">
    <!-- _includes/header.html -->
<header class="site-header">
    <nav class="main-navigation">
        <ul>
            <li><a href="/Math/">Home</a></li>
            <li><a href="/Math/addition/">Addition</a></li>
            <li><a href="/Math/subtraction/">Subtraction</a></li>
            <li><a href="/Math/multiplication/">Multiplication</a></li>
            <li><a href="/Math/division/">Division</a></li>
        </ul>
    </nav>
</header>

    
    <main class="page-content">
        <!-- Division Worksheet -->
        <div class="division-container" "="">
            <!-- Title Container -->
            <div class="container title-container">
                <h1 class="page-title">Division Practice</h1>
                <p class="page-description">Practice division problems</p>
            </div>

            <!-- Main Workspace -->
            <div class="dual-container">
                <!-- LEFT CONTAINER -->
                <div class="main-problem-container">
                    <h3>Division Problem</h3>
                    <div class="main-problem" id="problemdisplay">
                        <div class="equation-display">
                            <div class="large-equation" id="mainEquation">
                                <!-- Dividend with digit containers -->
                                <span class="dividend hundreds">1</span>
                                <span class="dividend tens">2</span>
                                <span class="dividend ones">3</span>
                                
                                <!-- Division symbol -->
                                <span class="division-symbol"> ÷ </span>
                                
                                <!-- Divisor with digit containers -->
                                <span class="divisor tens"></span>
                                <span class="divisor ones">5</span>
                                
                                <!-- Equals sign (initially hidden) -->
                                <span class="equals-symbol"> = </span>
                                
                                <!-- Quotient answer area with placeholders -->
                                <span class="answer hundreds">?</span>
                                <span class="answer tens">?</span>
                                <span class="answer ones">?</span>
                                
                                <!-- Remainder answer area with placeholders -->
                                <span class="remainder R hidden"> R </span>
                                <span class="remainder tens hidden"></span>
                                <span class="remainder ones hidden"></span>
                            </div>
                        </div>
                        <div class="current-step-container hidden">
                            <div class="current-step-title">Current Step</div>
                            <div class="current-step-equation" id="currentStepEquation">1 ÷ 5 = ?</div>
                            <div class="current-instruction" id="currentInstruction">How many times does 5 go into 1?</div>
                            <div class="number-display">Current guess: <span id="currentGuessDisplay">0</span></div>
                        </div>
                    </div>
                    <div class="work-feedback hidden" id="workFeedback">
                        <div class="control-grid">
                            <button class="grid-btn decrement five">-5</button>
                            <button class="grid-btn decrement one">-1</button>
                            <button class="grid-btn clear">C</button>
                            <button class="grid-btn increment one">+1</button>
                            <button class="grid-btn increment five">+5</button>
                        </div>
                        <button id="commitGuessBtn" class="commit-btn">Confirm Current Guess</button>
                    </div>
                </div>
                
                <!-- RIGHT CONTAINER -->
                <div class="work-container">
                    <h3>Work Area</h3>
                    
                    <!-- Step Tracker (Hidden) -->
                    <div class="step-tracker" data-current-step="0" data-total-steps="3" style="display: none;"></div>
                    
                    <div class="Work-Container" id="workStageContainer">
                        <div class="division-work-layout">
                            
                            <!-- 12x9 Grid Structure -->
                            <div class="work-grid large-grid" id="divisionGrid">
                                
                                <!-- ROW 1 -->
                                <div class="work-row">
                                    <div id="r1c1" class="division-table unused transparent"></div>
                                    <div id="r1c2" class="division-table unused transparent"></div>
                                    <div id="r1c3" class="division-table unused transparent"></div>
                                    <div id="r1c4" class="division-table answer hundreds green"></div>
                                    <div id="r1c5" class="division-table answer tens green"></div>
                                    <div id="r1c6" class="division-table answer ones green"></div>
                                    <div id="r1c7" class="division-table answer remainder R green"></div>
                                    <div id="r1c8" class="division-table answer remainder tens green"></div>
                                    <div id="r1c9" class="division-table answer remainder ones green"></div>
                                </div>
                                
                                <!-- ROW 2 -->
                                <div class="work-row">
                                    <div id="r2c1" class="division-table unused transparent"></div>
                                    <div id="r2c2" class="division-table unused transparent"></div>
                                    <div id="r2c3" class="division-table corner-line transparent"></div>
                                    <div id="r2c4" class="division-table horizontal-line transparent"></div>
                                    <div id="r2c5" class="division-table horizontal-line transparent"></div>
                                    <div id="r2c6" class="division-table horizontal-line transparent"></div>
                                    <div id="r2c7" class="division-table unused transparent"></div>
                                    <div id="r2c8" class="division-table unused transparent"></div>
                                    <div id="r2c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 3 -->
                                <div class="work-row">
                                    <div id="r3c1" class="division-table divisor tens blue"></div>
                                    <div id="r3c2" class="division-table divisor ones blue"></div>
                                    <div id="r3c3" class="division-table vertical-line transparent"></div>
                                    <div id="r3c4" class="division-table dividend hundreds orange"></div>
                                    <div id="r3c5" class="division-table dividend tens orange"></div>
                                    <div id="r3c6" class="division-table dividend ones orange"></div>
                                    <div id="r3c7" class="division-table unused transparent"></div>
                                    <div id="r3c8" class="division-table unused transparent"></div>
                                    <div id="r3c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 4 -->
                                <div class="work-row">
                                    <div id="r4c1" class="division-table unused transparent"></div>
                                    <div id="r4c2" class="division-table unused transparent"></div>
                                    <div id="r4c3" class="division-table minus sign step1 transparent"></div>
                                    <div id="r4c4" class="division-table yellow hundreds step1"></div>
                                    <div id="r4c5" class="division-table yellow tens step1"></div>
                                    <div id="r4c6" class="division-table yellow ones step1"></div>
                                    <div id="r4c7" class="division-table unused transparent"></div>
                                    <div id="r4c8" class="division-table unused transparent"></div>
                                    <div id="r4c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 5 -->
                                <div class="work-row" "="">
                                    <div id="r5c1" class="division-table unused transparent"></div>
                                    <div id="r5c2" class="division-table unused transparent"></div>
                                    <div id="r5c3" class="division-table unused transparent"></div>
                                    <div id="r5c4" class="division-table horizontal-line step1 transparent"></div>
                                    <div id="r5c5" class="division-table horizontal-line step1 transparent"></div>
                                    <div id="r5c6" class="division-table horizontal-line step1 transparent"></div>
                                    <div id="r5c7" class="division-table unused transparent"></div>
                                    <div id="r5c8" class="division-table unused transparent"></div>
                                    <div id="r5c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 6 -->
                                <div class="work-row">
                                    <div id="r6c1" class="division-table unused transparent"></div>
                                    <div id="r6c2" class="division-table unused transparent"></div>
                                    <div id="r6c3" class="division-table unused transparent"></div>
                                    <div id="r6c4" class="division-table brown answer hundreds step1"></div>
                                    <div id="r6c5" class="division-table brown answer tens step1"></div>
                                    <div id="r6c6" class="division-table brown answer ones step1"></div>
                                    <div id="r6c7" class="division-table unused transparent"></div>
                                    <div id="r6c8" class="division-table unused transparent"></div>
                                    <div id="r6c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 7 -->
                                <div class="work-row">
                                    <div id="r7c1" class="division-table unused transparent"></div>
                                    <div id="r7c2" class="division-table unused transparent"></div>
                                    <div id="r7c3" class="division-table minus step2 transparent"></div>
                                    <div id="r7c4" class="division-table yellow hundreds step2"></div>
                                    <div id="r7c5" class="division-table yellow tens step2"></div>
                                    <div id="r7c6" class="division-table yellow ones step2"></div>
                                    <div id="r7c7" class="division-table unused transparent"></div>
                                    <div id="r7c8" class="division-table unused transparent"></div>
                                    <div id="r7c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 8 -->
                                <div class="work-row">
                                    <div id="r8c1" class="division-table unused transparent"></div>
                                    <div id="r8c2" class="division-table unused transparent"></div>
                                    <div id="r8c3" class="division-table unused transparent"></div>
                                    <div id="r8c4" class="division-table horizontal-line step2 transparent"></div>
                                    <div id="r8c5" class="division-table horizontal-line step2 transparent"></div>
                                    <div id="r8c6" class="division-table horizontal-line step2 transparent"></div>
                                    <div id="r8c7" class="division-table unused transparent"></div>
                                    <div id="r8c8" class="division-table unused transparent"></div>
                                    <div id="r8c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 9 -->
                                <div class="work-row">
                                    <div id="r9c1" class="division-table unused transparent"></div>
                                    <div id="r9c2" class="division-table unused transparent"></div>
                                    <div id="r9c3" class="division-table unused transparent"></div>
                                    <div id="r9c4" class="division-table brown answer hundreds step2"></div>
                                    <div id="r9c5" class="division-table brown answer tens step2"></div>
                                    <div id="r9c6" class="division-table brown answer ones step2"></div>
                                    <div id="r9c7" class="division-table unused transparent"></div>
                                    <div id="r9c8" class="division-table unused transparent"></div>
                                    <div id="r9c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 10 -->
                                <div class="work-row">
                                    <div id="r10c1" class="division-table unused transparent"></div>
                                    <div id="r10c2" class="division-table unused transparent"></div>
                                    <div id="r10c3" class="division-table minus step3 transparent"></div>
                                    <div id="r10c4" class="division-table yellow hundreds step3"></div>
                                    <div id="r10c5" class="division-table yellow tens step3"></div>
                                    <div id="r10c6" class="division-table yellow ones step3"></div>
                                    <div id="r10c7" class="division-table unused transparent"></div>
                                    <div id="r10c8" class="division-table unused transparent"></div>
                                    <div id="r10c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 11 -->
                                <div class="work-row">
                                    <div id="r11c1" class="division-table unused transparent"></div>
                                    <div id="r11c2" class="division-table unused transparent"></div>
                                    <div id="r11c3" class="division-table unused transparent"></div>
                                    <div id="r11c4" class="division-table horizontal-line step3 transparent"></div>
                                    <div id="r11c5" class="division-table horizontal-line step3 transparent"></div>
                                    <div id="r11c6" class="division-table horizontal-line step3 transparent"></div>
                                    <div id="r11c7" class="division-table unused transparent"></div>
                                    <div id="r11c8" class="division-table unused transparent"></div>
                                    <div id="r11c9" class="division-table unused transparent"></div>
                                </div>
                                
                                <!-- ROW 12 -->
                                <div class="work-row">
                                    <div id="r12c1" class="division-table unused transparent"></div>
                                    <div id="r12c2" class="division-table unused transparent"></div>
                                    <div id="r12c3" class="division-table unused transparent"></div>
                                    <div id="r12c4" class="division-table brown answer hundreds step3"></div>
                                    <div id="r12c5" class="division-table brown answer tens step3"></div>
                                    <div id="r12c6" class="division-table brown answer ones step3"></div>
                                    <div id="r12c7" class="division-table unused transparent"></div>
                                    <div id="r12c8" class="division-table unused transparent"></div>
                                    <div id="r12c9" class="division-table unused transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- New Problem/Reset Current Problem Controls -->
            <div class="division-controls">
                <div class="control-buttons">
                    <button id="newDivisionProblem" class="primary-btn">New Problem</button>
                    <button id="resetCurrentProblem" class="secondary-btn">Reset This Problem</button>
                </div>
            </div>
            
            <!-- Statistics for Work Container -->
            <div class="container enhanced-score-container">
                <div class="score-display">
                    <h3>Your Division Progress</h3>
                    <div class="score-stats">
                        <div class="stat correct">
                            <span class="stat-label">Problems Solved:</span>
                            <span class="stat-value" id="solvedCount">0</span>
                        </div>
                        <div class="stat incorrect">
                            <span class="stat-label">Mistakes:</span>
                            <span class="stat-value" id="mistakeCount">0</span>
                        </div>
                        <div class="stat accuracy">
                            <span class="stat-label">Accuracy:</span>
                            <span class="stat-value" id="divisionAccuracy">0%</span>
                        </div>
                        <div class="stat streak">
                            <span class="stat-label">Current Streak:</span>
                            <span class="stat-value" id="currentStreak">0</span>
                        </div>
                    </div>
                    
                    <button id="resetDivisionScores">Reset All Scores</button>
                </div>
            </div>
        </div>
    </main>
    <footer class="site-footer">
    <div class="footer-content">
        <p>Math Practice © 2026</p>
        <div class="debug-info">
            <p>View: <span id="viewMode">Desktop (Large)</span></p>
            <p>Screen: <span id="screenSize">1207×1243px @0.800000011920929x</span></p>
            <p>Active Query: <span id="activeQuery">≥1024px</span></p>
        </div>
    </div>
</footer>

<style>
/* Debug info styling - ensure it's visible */
.debug-info {
    margin-top: 10px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    font-size: 0.85rem;
    font-family: monospace;
    display: block !important; /* Force display */
    visibility: visible !important; /* Force visibility */
    opacity: 1 !important; /* Force opacity */
}

.debug-info p {
    margin: 3px 0;
    color: #666;
}

#viewMode, #screenSize, #activeQuery {
    font-weight: bold;
    color: #2196f3;
}

/* Color coding for different views */
.mobile-view #viewMode { color: #ff9800; }
.tablet-view #viewMode { color: #9c27b0; }
.desktop-view #viewMode { color: #4caf50; }
</style>

<script>
// Self-contained script that runs after footer loads
(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebug);
    } else {
        initDebug();
    }
    
    function initDebug() {
        console.log('Debug script initialized');
        
        function updateViewInfo() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const pixelRatio = window.devicePixelRatio || 1;
            
            let viewType = 'Desktop';
            let sizeLabel = 'Large';
            let activeBreakpoint = '≥1024px';
            
            // Your exact CSS breakpoints
            if (width < 360) {
                viewType = 'Mobile';
                sizeLabel = 'X-Small';
                activeBreakpoint = '<360px';
            } else if (width < 480) {
                viewType = 'Mobile';
                sizeLabel = 'Small';
                activeBreakpoint = '360-479px';
            } else if (width < 768) {
                viewType = 'Mobile';
                sizeLabel = 'Medium';
                activeBreakpoint = '480-767px';
            } else if (width < 1024) {
                viewType = 'Tablet';
                sizeLabel = 'Medium';
                activeBreakpoint = '768-1023px';
            } else {
                viewType = 'Desktop';
                sizeLabel = 'Large';
                activeBreakpoint = '≥1024px';
            }
            
            // Update the display
            const viewModeElement = document.getElementById('viewMode');
            const screenSizeElement = document.getElementById('screenSize');
            const activeQueryElement = document.getElementById('activeQuery');
            
            if (viewModeElement) {
                viewModeElement.textContent = `${viewType} (${sizeLabel})`;
            }
            
            if (screenSizeElement) {
                screenSizeElement.textContent = `${width}×${height}px @${pixelRatio}x`;
            }
            
            if (activeQueryElement) {
                activeQueryElement.textContent = activeBreakpoint;
            }
            
            // Add class to body for CSS targeting
            document.body.className = document.body.className.replace(/\b(mobile|tablet|desktop)-view\b/g, '');
            document.body.classList.add(`${viewType.toLowerCase()}-view`);
            
            // Log for debugging
            console.log(`View: ${viewType} ${sizeLabel}, Screen: ${width}×${height}, Active: ${activeBreakpoint}`);
        }
        
        // Initial update
        setTimeout(updateViewInfo, 100); // Small delay to ensure elements exist
        
        // Update on resize (with debouncing)
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateViewInfo, 250);
        });
        
        // Also update when orientation changes (for mobile)
        window.addEventListener('orientationchange', function() {
            setTimeout(updateViewInfo, 500);
        });
    }
})();
</script>

    <script src="/Math/assets/js/division.js"></script>


</body></html>
