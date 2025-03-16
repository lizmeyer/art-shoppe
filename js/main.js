/**
 * Main application controller for Cozy Artist Shop
 * Handles initialization and startup sequence
 */

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGame);

/**
 * Initialize the game
 * Sets up all components and handles error cases
 */
function initializeGame() {
    try {
        console.log('Initializing Cozy Artist Shop...');
        
        // Initialize game state
        if (!GameState.init()) {
            throw new Error('Failed to initialize game state');
        }
        
        // Initialize UI
        if (!UI.init()) {
            throw new Error('Failed to initialize UI');
        }
        
        // Initialize canvas
        if (!Canvas.init()) {
            console.warn('Canvas initialization failed or not available');
            // This is not critical, so don't throw an error
        }
        
        // Initialize customer system
        if (!Customers.init()) {
            console.warn('Customer system initialization failed');
            // This is not critical, so don't throw an error
        }
        
        // Set up error handling for uncaught errors
        window.addEventListener('error', handleGlobalError);
        
        console.log('Game initialization complete!');
    } catch (error) {
        console.error('Game initialization failed:', error);
        Utils.showError('Failed to start the game: ' + error.message);
    }
}

/**
 * Handle global errors
 * @param {ErrorEvent} event - Error event
 */
function handleGlobalError(event) {
    console.error('Uncaught error:', event.error || event.message);
    
    // Prevent showing multiple errors
    if (document.getElementById('errorScreen').classList.contains('hidden')) {
        Utils.showError('An unexpected error occurred: ' + (event.error?.message || event.message));
    }
    
    event.preventDefault();
}

/**
 * Detect if browser is compatible with the game
 * @returns {boolean} Whether the browser is compatible
 */
function checkBrowserCompatibility() {
    const requirements = {
        localStorage: !!window.localStorage,
        canvas: !!document.createElement('canvas').getContext,
        json: !!window.JSON,
        es6: (function() {
            try {
                new Function('(a = 0) => a');
                return true;
            } catch (e) {
                return false;
            }
        })()
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

// Debugging utility for development
window.debug = {
    gameState: GameState,
    ui: UI,
    canvas: Canvas,
    customers: Customers,
    addCoins: (amount) => {
        GameState.data.coins += amount;
        UI.updateCoinDisplay();
        return GameState.data.coins;
    },
    printState: () => {
        console.log('Game State:', JSON.parse(JSON.stringify(GameState.data)));
    }
};
