/**
 * Main Game Logic for Cozy Artist Shop
 * Entry point for the game, initializes all modules
 */

// Initialize the game when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Start loading screen
    initializeLoadingScreen();
    
    // Initialize game state
    initGame();
    
    // Apply saved theme
    setTheme(gameState.activeTheme);
    
    // Update UI components
    updateCoins();
    updateDayCounter();
    
    // Set up UI event listeners
    setupUIEvents();
    
    // Initialize game components
    initializeShop();
    initializeInventory();
    initializePainter();
    
    // Create placeholder image paths
    createPlaceholderImagePaths();
});

// Create placeholder image paths
function createPlaceholderImagePaths() {
    // In a real game, we'd have proper assets
    // For this demo, we'll create the folder structure and set up dummy image paths
    
    // Create image folders in localStorage for simulating file structure
    const imageFolders = {
        'images/ui': ['coin.png', 'paint-brush.png', 'app-icon.png'],
        'images/customers': ['default.png', 'trendy.png', 'artsy.png', 'casual.png'],
        'images/products': ['mug.png', 'tshirt.png', 'tote.png', 'poster.png']
    };
    
    // Simulate image paths
    Object.keys(imageFolders).forEach(folder => {
        imageFolders[folder].forEach(image => {
            // In a real game, we'd use actual images
            // Here we're just setting up the structure
        });
    });
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
        if (shopState && shopState.dayInProgress) {
            // In a full game, we'd pause the day timer here
        }
    } else {
        // Game is visible again, resume if needed
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust canvas size or other responsive elements if needed
    // In a real game, we'd handle responsiveness more thoroughly
});

// iOS specific adjustments
function setupIOSSpecifics() {
    // Add iOS specific behaviors here
    // For example, handling PWA installation, preventing bounce effects, etc.
    
    // Prevent Safari from bouncing the page when scrolling past the edges
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) return; // Allow pinch zoom
        
        // Check if scrollable
        const element = e.target;
        const isScrollable = 
            element.scrollHeight > element.clientHeight &&
            ['auto', 'scroll'].indexOf(getComputedStyle(element).overflowY) >= 0;
        
        if (!isScrollable) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Add to home screen (PWA) support
    if (window.navigator.standalone) {
        document.body.classList.add('ios-pwa');
    }
}

// Check if running on iOS
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    setupIOSSpecifics();
}
