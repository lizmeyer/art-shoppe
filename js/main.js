/**
 * Main Game Logic for Cozy Artist Shop
 * Entry point for the game, initializes all modules
 */

// Initialize the game when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    gameState.init();
    UI.init();
    console.log("Document loaded, starting game initialization...");
    
    // Start loading screen
    initializeLoadingScreen();
    
    // Verify script loading
    checkScriptsLoaded();
    
    // Initialize game with appropriate timing
    setTimeout(initializeGame, 500);
});

// Check if all required scripts are properly loaded
function checkScriptsLoaded() {
    const requiredFunctions = {
        'initGame': 'gameState.js',
        'updateCoins': 'ui.js',
        'initializePainter': 'painter.js',
        'initializeShop': 'shop.js',
        'initializeInventory': 'inventory.js'
    };
    
    const missingScripts = [];
    
    for (const [func, script] of Object.entries(requiredFunctions)) {
        if (typeof window[func] !== 'function') {
            console.error(`Required function "${func}" from "${script}" is not loaded`);
            missingScripts.push(script);
        }
    }
    
    if (missingScripts.length > 0) {
        console.warn(`Missing scripts: ${missingScripts.join(', ')}. Some functionality may not work.`);
    }
}

// Initialize the game components
function initializeGame() {
    console.log("Initializing game components...");
    
    try {
        // Initialize game state
        gameState.init();
    UI.init();
        
        // Apply saved theme
        if (typeof setTheme === 'function') {
            setTheme(gameState.activeTheme);
        }
        
        // Update UI components
        updateCoins();
        updateDayCounter();
        
        // Set up UI event listeners
        setupUIEvents();
        
        // Initialize game components with retry mechanism
        initializeWithRetry('shop', initializeShop);
        initializeWithRetry('inventory', initializeInventory);
        initializeWithRetry('painter', initializePainter);
        
        // Create placeholder image paths if needed
        if (typeof createPlaceholderImagePaths === 'function') {
            createPlaceholderImagePaths();
        }
        
        // Default to Art Studio tab for new players
        if (!gameState.tutorialComplete) {
            // Will be switched to studio after tutorial
            console.log("New player - tutorial will show");
        } else {
            // For returning players, switch to studio
            console.log("Returning player - switching to studio tab");
            if (typeof switchTab === 'function') {
                switchTab('studio');
            }
        }
        
        // Hide loading screen
        setTimeout(function() {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                setTimeout(function() {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        }, 1000);
        
        console.log("Game initialization complete");
    } catch (e) {
        console.error("Game initialization failed:", e);
        showStartupError(e);
    }
}

// Initialize component with retry mechanism
function initializeWithRetry(name, initFunction, maxRetries = 3) {
    let retries = 0;
    
    function tryInit() {
        try {
            console.log(`Initializing ${name}...`);
            initFunction();
            console.log(`${name} initialized successfully`);
        } catch (e) {
            console.error(`Error initializing ${name}:`, e);
            retries++;
            
            if (retries < maxRetries) {
                console.log(`Retrying ${name} initialization (${retries}/${maxRetries})...`);
                setTimeout(tryInit, 300 * retries);
            } else {
                console.error(`Failed to initialize ${name} after ${maxRetries} attempts`);
            }
        }
    }
    
    tryInit();
}

// Loading screen functions
function initializeLoadingScreen() {
    const loadingBar = document.getElementById('loadingBar');
    if (!loadingBar) return;
    
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += 5;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
}

// Display error message if startup fails
function showStartupError(error) {
    // Create error message if not exists
    let errorEl = document.getElementById('startupError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'startupError';
        errorEl.style.position = 'fixed';
        errorEl.style.top = '50%';
        errorEl.style.left = '50%';
        errorEl.style.transform = 'translate(-50%, -50%)';
        errorEl.style.backgroundColor = 'rgba(255, 200, 200, 0.95)';
        errorEl.style.padding = '20px';
        errorEl.style.borderRadius = '10px';
        errorEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
        errorEl.style.zIndex = '9999';
        errorEl.style.maxWidth = '80%';
        
        document.body.appendChild(errorEl);
    }
    
    errorEl.innerHTML = `
        <h3 style="color: #d32f2f; margin-top: 0;">Startup Error</h3>
        <p>There was a problem starting the game:</p>
        <pre style="background: #fff; padding: 10px; overflow: auto; max-height: 200px; font-size: 12px;">${error.toString()}</pre>
        <p>Try refreshing the page. If the problem persists, check the console for more details.</p>
        <button onclick="location.reload()" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Refresh Page</button>
    `;
    
    // Hide loading screen
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Handle errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Game error:', message, 'at', source, lineno, colno);
    
    // Show user-friendly error
    showNotification('Something went wrong. Please try reloading the page.');
    
    return true; // Prevents default error handling
};

// Handle visibility change (for when the user switches tabs/apps)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Game is hidden, pause any animations or timers
        if (typeof shopState !== 'undefined' && shopState && shopState.dayInProgress) {
            // In a full game, we'd pause the day timer here
            console.log("Game paused");
        }
    } else {
        // Game is visible again, resume if needed
        console.log("Game resumed");
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust canvas size or other responsive elements if needed
    console.log("Window resized");
});

// Emergency recovery functions
window.emergencyReset = function() {
    console.log("Performing emergency reset...");
    localStorage.removeItem('cozyArtistShop');
    location.reload();
    return "Resetting game...";
};

window.emergencyFixPainter = function() {
    console.log("Attempting emergency painter fix...");
    
    try {
        // Re-initialize painter
        if (typeof initializePainter === 'function') {
            initializePainter();
            return "Painter reinitialized!";
        } else {
            return "initializePainter function not found!";
        }
    } catch (e) {
        console.error("Emergency fix failed:", e);
        return "Fix failed: " + e.message;
    }
};
