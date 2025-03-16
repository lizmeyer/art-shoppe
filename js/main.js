/**
 * Main application controller for Cozy Artist Shop
 */

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
        if (!gameState.init()) {
            throw new Error('Failed to initialize game state');
        }
        
        // Initialize UI controller
        if (!UI.init()) {
            throw new Error('Failed to initialize UI');
        }
        
        // Initialize Canvas controller
        Canvas.init();
        
        // Initialize Customers controller
        Customers.init();
        
        console.log('Game initialization complete!');
    } catch (error) {
        console.error('Game initialization failed:', error);
        Utils.showError('Failed to start the game: ' + error.message);
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
        
        Utils.showError(`Your browser doesn't support required features: ${missingFeatures}`);
    }
    
    return compatible;
}

// Add a global error handler
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
    Utils.showError('An unexpected error occurred: ' + (event.error?.message || event.message));
    event.preventDefault();
});
