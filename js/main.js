/**
 * Main application controller for Cozy Artist Shop
 */
// Add this to the beginning of your main.js
window.addEventListener('error', function(e) {
  if (e.message && e.message.includes('runtime.lastError')) {
    e.stopPropagation();
    console.warn('Runtime error intercepted:', e.message);
    // Prevent it from breaking your game
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
        if (typeof gameState === 'undefined' || !gameState.init) {
            throw new Error('Game state system not available');
        }
        
        if (!gameState.init()) {
            throw new Error('Failed to initialize game state');
        }
        
        // Initialize UI controller
        if (typeof UI === 'undefined' || !UI.init) {
            throw new Error('UI system not available');
        }
        
        if (!UI.init()) {
            throw new Error('Failed to initialize UI');
        }
        
        // Initialize Canvas controller
        if (typeof Canvas === 'undefined' || !Canvas.init) {
            console.warn('Canvas system not available, creating fallback');
            createFallbackCanvas();
        } else {
            Canvas.init();
        }
        
        // Initialize Customers controller
        if (typeof Customers !== 'undefined' && typeof Customers.init === 'function') {
            Customers.init();
        }
        
        console.log('Game initialization complete!');
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.add('hidden');
        }
        
        // Show game container
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.display = 'flex';
            gameContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Game initialization failed:', error);
        Utils.showError('Failed to start the game: ' + error.message);
    }
}

/**
 * Create a fallback Canvas implementation
 */
function createFallbackCanvas() {
    console.log('Creating fallback Canvas implementation');
    
    window.Canvas = {
        init: function() {
            console.log('Fallback Canvas.init called');
            
            // Get canvas element
            const canvas = document.getElementById('artCanvas');
            if (!canvas) {
                console.error('Canvas element not found');
                return false;
            }
            
            // Set up basic drawing
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Set up variables
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            let currentColor = '#000000';
            let brushSize = 5;
            
            // Set up event listeners
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Touch support
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
                const touch = e.touches[0];
                startDrawing({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
            
            canvas.addEventListener('touchmove', function(e) {
                e.preventDefault();
                const touch = e.touches[0];
                draw({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
            
            canvas.addEventListener('touchend', stopDrawing);
            
            // Drawing functions
            function startDrawing(e) {
                isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                lastX = e.clientX - rect.left;
                lastY = e.clientY - rect.top;
            }
            
            function draw(e) {
                if (!isDrawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = brushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                lastX = x;
                lastY = y;
            }
            
            function stopDrawing() {
                isDrawing = false;
            }
            
            // Set up color swatches
            const colorPalette = document.getElementById('colorPalette');
            if (colorPalette && window.ProductData && window.ProductData.colorPalette) {
                // Clear existing palette
                colorPalette.innerHTML = '';
                
                // Add colors
                window.ProductData.colorPalette.forEach(color => {
                    const swatch = document.createElement('div');
                    swatch.className = 'color-swatch';
                    swatch.style.backgroundColor = color;
                    
                    swatch.addEventListener('click', function() {
                        currentColor = color;
                        
                        // Update selected state
                        document.querySelectorAll('.color-swatch').forEach(el => {
                            el.classList.remove('selected');
                        });
                        swatch.classList.add('selected');
                    });
                    
                    colorPalette.appendChild(swatch);
                });
                
                // Select first color
                if (colorPalette.firstChild) {
                    colorPalette.firstChild.classList.add('selected');
                }
            }
            
            // Set up brush size slider
            const brushSlider = document.getElementById('brushSize');
            if (brushSlider) {
                brushSlider.addEventListener('input', function() {
                    brushSize = parseInt(this.value);
                });
            }
            
            // Set up clear button
            const clearButton = document.getElementById('clearArtButton');
            if (clearButton) {
                clearButton.addEventListener('click', function() {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                });
            }
            
            // Set up save button
            const saveButton = document.getElementById('saveArtButton');
            if (saveButton) {
                saveButton.addEventListener('click', saveArtwork);
            }
            
            // Save artwork function
            function saveArtwork() {
                try {
                    console.log('Saving artwork');
                    
                    // Get product type
                    const productSelector = document.getElementById('productSelector');
                    const productType = productSelector ? productSelector.value : 'mug';
                    
                    // Get canvas data URL
                    const imageData = canvas.toDataURL('image/png');
                    
                    // Create product
                    const product = {
                        id: 'product-' + Date.now(),
                        templateId: productType,
                        name: productType.charAt(0).toUpperCase() + productType.slice(1) + ' with Custom Art',
                        price: 10 + Math.floor(Math.random() * 10), // Random price between 10-19
                        imageUrl: 'assets/images/products/' + productType + '.png',
                        artUrl: imageData,
                        created: new Date().toISOString(),
                        displayed: false
                    };
                    
                    // Show product preview dialog
                    showProductPreview(product);
                } catch (error) {
                    console.error('Error saving artwork:', error);
                    alert('Failed to save artwork. Please try again.');
                }
            }
            
            // Show product preview function
            function showProductPreview(product) {
                // Create modal
                const modal = document.createElement('div');
                modal.className = 'modal';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Product Created!</h3>
                            <button class="close-button">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="product-preview">
                                <div class="product-image" style="background-image: url('${product.imageUrl}')">
                                    <img src="${product.artUrl}" alt="Custom Art" class="product-art-image">
                                </div>
                                <h4>${product.name}</h4>
                                <p>Price: ${product.price} coins</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="button secondary-button">Add to Inventory</button>
                            <button class="button accent-button">Add to Shop</button>
                        </div>
                    </div>
                `;
                
                // Add to document
                document.body.appendChild(modal);
                
                // Set up button handlers
                const closeButton = modal.querySelector('.close-button');
                closeButton.addEventListener('click', function() {
                    document.body.removeChild(modal);
                });
                
                const addToInventoryButton = modal.querySelector('.secondary-button');
                addToInventoryButton.addEventListener('click', function() {
                    if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.inventory)) {
                        window.gameState.data.inventory.push(product);
                        
                        // Save game
                        if (typeof window.gameState.saveGame === 'function') {
                            window.gameState.saveGame();
                        }
                        
                        // Update UI
                        if (window.UI && typeof window.UI.renderInventory === 'function') {
                            window.UI.renderInventory();
                        }
                        
                        alert('Product added to inventory!');
                    } else {
                        alert('Could not add to inventory (gameState not available)');
                    }
                    
                    document.body.removeChild(modal);
                });
                
                const addToShopButton = modal.querySelector('.accent-button');
                addToShopButton.addEventListener('click', function() {
                    // Find empty display spot
                    let emptySpot = null;
                    if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.shopDisplays)) {
                        emptySpot = window.gameState.data.shopDisplays.find(spot => !spot.filled);
                    }
                    
                    if (emptySpot) {
                        // Add to inventory first
                        if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.inventory)) {
                            window.gameState.data.inventory.push(product);
                            
                            // Display in shop
                            if (typeof window.gameState.displayProduct === 'function') {
                                window.gameState.displayProduct(product.id, emptySpot.id);
                                
                                // Save game
                                if (typeof window.gameState.saveGame === 'function') {
                                    window.gameState.saveGame();
                                }
                                
                                // Update UI
                                if (window.UI) {
                                    if (typeof window.UI.renderShopDisplays === 'function') {
                                        window.UI.renderShopDisplays();
                                    }
                                    if (typeof window.UI.renderInventory === 'function') {
                                        window.UI.renderInventory();
                                    }
                                }
                                
                                alert('Product added to shop!');
                            } else {
                                alert('Could not display in shop (function not available)');
                            }
                        } else {
                            alert('Could not add to inventory (gameState not available)');
                        }
                    } else {
                        alert('No empty display spots available! Remove something first.');
                    }
                    
                    document.body.removeChild(modal);
                });
            }
            
            console.log('Fallback Canvas initialized');
            return true;
        },
        
        saveArtwork: function() {
            const canvas = document.getElementById('artCanvas');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }
            
            // Save artwork logic similar to above
            // This dummy implementation just logs the call
            console.log('Fallback Canvas.saveArtwork called');
            
            // Get product type
            const productSelector = document.getElementById('productSelector');
            const productType = productSelector ? productSelector.value : 'mug';
            
            // Get canvas data URL
            const imageData = canvas.toDataURL('image/png');
            
            // Create product
            const product = {
                id: 'product-' + Date.now(),
                templateId: productType,
                name: productType.charAt(0).toUpperCase() + productType.slice(1) + ' with Custom Art',
                price: 10 + Math.floor(Math.random() * 10), // Random price between 10-19
                imageUrl: 'assets/images/products/' + productType + '.png',
                artUrl: imageData,
                created: new Date().toISOString(),
                displayed: false
            };
            
            // Show product preview
            this.showProductPreview(product);
        },
        
        showProductPreview: function(product) {
            // Create modal similar to above
            console.log('Showing product preview:', product);
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Product Created!</h3>
                        <button class="close-button">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="product-preview">
                            <div class="product-image" style="background-image: url('${product.imageUrl}')">
                                <img src="${product.artUrl}" alt="Custom Art" class="product-art-image">
                            </div>
                            <h4>${product.name}</h4>
                            <p>Price: ${product.price} coins</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="button secondary-button">Add to Inventory</button>
                        <button class="button accent-button">Add to Shop</button>
                    </div>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(modal);
            
            // Button handlers similar to above
            // This is just a simplified version
            const buttons = modal.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    document.body.removeChild(modal);
                });
            });
        }
    };
    
    return window.Canvas.init();
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
