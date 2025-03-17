/**
 * Main application controller for Cozy Artist Shop
 */

// Runtime error handler for Chrome extension errors (prevents them from breaking the game)
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('runtime.lastError')) {
    e.stopPropagation();
    console.warn('Runtime error intercepted:', e.message);
    return true;
  }
});

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGame);

/**
 * Initialize the game
 */
function initializeGame() {
    try {
        console.log('Initializing Cozy Artist Shop...');
        
        // Check browser compatibility
        if (!checkBrowserCompatibility()) {
            return;
        }
        
        // Initialize game state
        if (typeof gameState !== 'undefined' && !gameState.init()) {
            throw new Error('Failed to initialize game state');
        }
        
        // Initialize UI controller
        if (typeof UI !== 'undefined' && !UI.init()) {
            throw new Error('Failed to initialize UI');
        }
        
        // Initialize Canvas controller - THIS IS THE PROBLEM LINE
        // Make sure the Canvas object is defined before using it
        if (typeof Canvas !== 'undefined') {
            Canvas.init();
        } else {
            // Initialize canvas manually if Canvas object doesn't exist
            initializeCanvas();
        }
        
        // Initialize Customers controller
        if (typeof Customers !== 'undefined') {
            Customers.init();
        }
        
        console.log('Game initialization complete!');
    } catch (error) {
        console.error('Game initialization failed:', error);
        if (typeof Utils !== 'undefined') {
            Utils.showError('Failed to start the game: ' + error.message);
        } else {
            alert('Failed to start the game: ' + error.message);
        }
    }
}

/**
 * Fallback canvas initialization if Canvas object doesn't exist
 */
function initializeCanvas() {
    const canvas = document.getElementById('gameCanvas'); // Make sure this ID matches your canvas element
    if (canvas) {
        console.log('Canvas element found, initializing manually');
        // Basic canvas setup
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Store canvas and context in global variable for access elsewhere
            window.canvasContext = ctx;
            window.canvasElement = canvas;
            console.log('Canvas initialized manually');
        } else {
            console.error('Failed to get canvas context');
        }
    } else {
        console.warn('Canvas element not found, skipping canvas initialization');
    }
}

/**
 * Check if browser is compatible with the game
 */
function checkBrowserCompatibility() {
    const requirements = {
        localStorage: !!window.localStorage,
        canvas: !!document.createElement('canvas').getContext,
        json: !!window.JSON
    };
    
    const compatible = Object.values(requirements).every(Boolean);
    
    if (!compatible) {
        const missingFeatures = Object.entries(requirements)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature)
            .join(', ');
        
        if (typeof Utils !== 'undefined') {
            Utils.showError(`Your browser doesn't support required features: ${missingFeatures}`);
        } else {
            alert(`Your browser doesn't support required features: ${missingFeatures}`);
        }
    }
    
    return compatible;
}

// Add a global error handler
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
    if (typeof Utils !== 'undefined') {
        Utils.showError('An unexpected error occurred: ' + (event.error?.message || event.message));
    } else {
        console.error('An unexpected error occurred: ' + (event.error?.message || event.message));
    }
    event.preventDefault();
});
