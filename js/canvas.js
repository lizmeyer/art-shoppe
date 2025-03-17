// canvas.js
const Canvas = {
    canvas: null,
    ctx: null,
    currentColor: '#000000',
    brushSize: 5,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    
    init: function() {
        console.log('Canvas.init called');
        try {
            // Get the canvas element
            this.canvas = document.getElementById('artCanvas');
            if (!this.canvas) {
                console.error('Canvas element not found');
                return false;
            }
            
            // Get the context
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                console.error('Could not get canvas context');
                return false;
            }
            
            // Initialize with white background
            this.clearCanvas();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize color palette
            this.setupColorPalette();
            
            // Initialize brush size
            this.setupBrushSize();
            
            console.log('Canvas initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Canvas:', error);
            return false;
        }
    },
    
    setupEventListeners: function() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Clear button
        const clearButton = document.getElementById('clearArtButton');
        if (clearButton) {
            clearButton.addEventListener('click', this.clearCanvas.bind(this));
        }
        
        // Save button
        const saveButton = document.getElementById('saveArtButton');
        if (saveButton) {
            saveButton.addEventListener('click', this.saveArtwork.bind(this));
        }
    },
    
    setupColorPalette: function() {
        const colorPalette = document.getElementById('colorPalette');
        if (!colorPalette) return;
        
        // Clear existing palette
        colorPalette.innerHTML = '';
        
        // Add colors from product data
        if (window.ProductData && window.ProductData.colorPalette) {
            window.ProductData.colorPalette.forEach(color => {
                const colorSwatch = document.createElement('div');
                colorSwatch.className = 'color-swatch';
                colorSwatch.style.backgroundColor = color;
                colorSwatch.addEventListener('click', () => {
                    this.setColor(color);
                    
                    // Update UI for selected color
                    document.querySelectorAll('.color-swatch').forEach(swatch => {
                        swatch.classList.remove('selected');
                    });
                    colorSwatch.classList.add('selected');
                });
                
                colorPalette.appendChild(colorSwatch);
            });
            
            // Select the first color
            if (colorPalette.firstChild) {
                colorPalette.firstChild.classList.add('selected');
            }
        }
    },
    
    setupBrushSize: function() {
        const brushSizeSlider = document.getElementById('brushSize');
        if (brushSizeSlider) {
            brushSizeSlider.value = this.brushSize;
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
            });
        }
    },
    
    startDrawing: function(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    },
    
    draw: function(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.lastX = x;
        this.lastY = y;
    },
    
    handleTouchStart: function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.startDrawing({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    },
    
    handleTouchMove: function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.draw({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    },
    
    stopDrawing: function() {
        this.isDrawing = false;
    },
    
    clearCanvas: function() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    setColor: function(color) {
        this.currentColor = color;
    },
    
    getCanvasImage: function() {
        if (!this.canvas) return null;
        return this.canvas.toDataURL('image/png');
    },
    
    saveArtwork: function() {
        console.log('Canvas.saveArtwork called');
        try {
            // Get selected product template
            const productSelector = document.getElementById('productSelector');
            const selectedTemplate = productSelector ? productSelector.value : 'mug';
            
            // Get product template data
            const template = window.gameState.getProductTemplate(selectedTemplate);
            if (!template) {
                console.error('Product template not found');
                return;
            }
            
            // Get canvas image
            const artworkUrl = this.getCanvasImage();
            if (!artworkUrl) {
                console.error('Failed to get canvas image');
                return;
            }
            
            // Create product object
            const product = {
                id: 'product-' + Date.now(),
                templateId: template.id,
                name: template.name + ' with Custom Art',
                basePrice: template.basePrice,
                price: template.basePrice + 5, // Add profit margin
                imageUrl: template.image,
                artUrl: artworkUrl,
                created: new Date().toISOString(),
                displayed: false
            };
            
            // Show product preview
            this.showProductPreview(product);
        } catch (error) {
            console.error('Error saving artwork:', error);
            alert('Failed to create product. Please try again.');
        }
    },
    
    showProductPreview: function(product) {
        console.log('Showing product preview for:', product);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal product-preview-modal';
        
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
                    <button class="button secondary-button" id="addToInventoryBtn">Add to Inventory</button>
                    <button class="button accent-button" id="addToShopBtn">Add to Shop</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Close button
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Add to inventory button
        const addToInventoryBtn = modal.querySelector('#addToInventoryBtn');
        addToInventoryBtn.addEventListener('click', () => {
            // Add to inventory
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
                
                // Show notification
                alert('Product added to inventory!');
                
                // Close modal
                document.body.removeChild(modal);
            } else {
                console.error('gameState or inventory not available');
                alert('Failed to add to inventory. Please try again.');
            }
        });
        
        // Add to shop button
        const addToShopBtn = modal.querySelector('#addToShopBtn');
        addToShopBtn.addEventListener('click', () => {
            // Find empty display spot
            let emptySpot = null;
            if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.shopDisplays)) {
                emptySpot = window.gameState.data.shopDisplays.find(spot => !spot.filled);
            }
            
            if (emptySpot) {
                // Add to inventory first
                if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.inventory)) {
                    // Add to inventory
                    window.gameState.data.inventory.push(product);
                    
                    // Add to display
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
                        
                        // Show notification
                        alert('Product added to shop display!');
                    } else {
                        console.error('gameState.displayProduct function not available');
                        alert('Failed to display in shop. Please try again.');
                    }
                } else {
                    console.error('gameState or inventory not available');
                    alert('Failed to add to inventory. Please try again.');
                }
            } else {
                alert('No empty display spots available! Remove something first.');
            }
            
            // Close modal
            document.body.removeChild(modal);
        });
    }
};

// Ensure Canvas is available globally
window.Canvas = Canvas;
