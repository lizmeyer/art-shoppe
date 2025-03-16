/**
 * Canvas Controller for Cozy Artist Shop
 * Handles the drawing canvas for creating art
 */

const Canvas = {
    // Canvas DOM element
    element: null,
    
    // Drawing context
    ctx: null,
    
    // Canvas state
    state: {
        isDrawing: false,
        currentColor: '#000000',
        brushSize: 5,
        lastX: 0,
        lastY: 0,
        selectedProduct: null,
        artDataUrl: null
    },
    
    /**
     * Initialize the canvas
     * @returns {boolean} Success status
     */
    init() {
        try {
            this.element = document.getElementById('artCanvas');
            if (!this.element) {
                console.warn('Canvas element not found');
                return false;
            }
            
            this.ctx = this.element.getContext('2d');
            
            // Clear canvas with white background
            this.clear();
            
            // Set initial brush properties
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            // Set up event listeners
            this.setupEventListeners();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize canvas:', error);
            return false;
        }
    },
    
    /**
     * Set up canvas event listeners
     */
    setupEventListeners() {
        if (!this.element) return;
        
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.element.addEventListener('mousemove', (e) => this.draw(e));
        this.element.addEventListener('mouseup', () => this.stopDrawing());
        this.element.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        this.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        });
        
        this.element.addEventListener('touchend', () => this.stopDrawing());
        
        // Color palette
        const colorPalette = document.getElementById('colorPalette');
        if (colorPalette) {
            colorPalette.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-swatch')) {
                    const color = e.target.getAttribute('data-color');
                    this.selectColor(color);
                }
            });
        }
        
        // Brush size
        const brushSizeInput = document.getElementById('brushSize');
        if (brushSizeInput) {
            brushSizeInput.addEventListener('input', (e) => {
                this.setBrushSize(parseInt(e.target.value));
            });
        }
        
        // Clear button
        const clearButton = document.getElementById('clearArtButton');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clear());
        }
        
        // Save button
        const saveButton = document.getElementById('saveArtButton');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveArtwork());
        }
        
        // Product selector
        const productSelector = document.getElementById('productSelector');
        if (productSelector) {
            productSelector.addEventListener('change', (e) => {
                this.selectProduct(e.target.value);
            });
        }
    },
    
    /**
     * Start drawing on canvas
     * @param {Object} event - Mouse or touch event
     */
    startDrawing(event) {
        if (!this.ctx) return;
        
        this.state.isDrawing = true;
        
        const rect = this.element.getBoundingClientRect();
        this.state.lastX = event.clientX - rect.left;
        this.state.lastY = event.clientY - rect.top;
    },
    
    /**
     * Draw on canvas
     * @param {Object} event - Mouse or touch event
     */
    draw(event) {
        if (!this.ctx || !this.state.isDrawing) return;
        
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.state.currentColor;
        this.ctx.lineWidth = this.state.brushSize;
        
        this.ctx.moveTo(this.state.lastX, this.state.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
        this.state.lastX = x;
        this.state.lastY = y;
    },
    
    /**
     * Stop drawing
     */
    stopDrawing() {
        this.state.isDrawing = false;
    },
    
    /**
     * Clear the canvas
     */
    clear() {
        if (!this.ctx || !this.element) return;
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.element.width, this.element.height);
    },
    
    /**
     * Select a color
     * @param {string} color - Hex color code
     */
    selectColor(color) {
        this.state.currentColor = color;
        
        // Update UI
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            if (swatch.getAttribute('data-color') === color) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });
    },
    
    /**
     * Set brush size
     * @param {number} size - Brush size in pixels
     */
    setBrushSize(size) {
        this.state.brushSize = size;
    },
    
    /**
     * Select a product template
     * @param {string} productId - Product template ID
     */
    selectProduct(productId) {
        const template = gameState.getProductTemplate(productId);
        if (!template) return;
        
        this.state.selectedProduct = template;
        
        // Show product template on canvas background
        const productPreview = document.getElementById('productPreview');
        if (productPreview) {
            productPreview.innerHTML = `
                <img src="${template.image}" alt="${template.name}" class="product-template"
                    style="max-width: 90%; max-height: 90%; opacity: 0.3;">
            `;
        }
        
        // Clear canvas
        this.clear();
    },
    
    /**
     * Save artwork and create a product
     */
    saveArtwork() {
        if (!this.ctx || !this.state.selectedProduct) {
            Utils.showNotification('Please select a product first');
            return;
        }
        
        try {
            // Get the art data URL
            this.state.artDataUrl = this.element.toDataURL('image/png');
            
            // Calculate price based on template
            const basePrice = this.state.selectedProduct.basePrice;
            const price = basePrice + Utils.randomNumber(5, 15);
            
            // Create the product
            const newProduct = {
                templateId: this.state.selectedProduct.id,
                name: `${this.state.selectedProduct.name} with Custom Art`,
                price: price,
                imageUrl: this.state.selectedProduct.image,
                artUrl: this.state.artDataUrl
            };
            
            // Add to inventory
            const addedProduct = gameState.addToInventory(newProduct);
            
            if (addedProduct) {
                Utils.showNotification(`Created new ${this.state.selectedProduct.name}!`);
                
                // Clear canvas
                this.clear();
                
                // Show product preview
                UI.showProductPreview(addedProduct);
            }
        } catch (error) {
            console.error('Failed to save artwork:', error);
            Utils.showNotification('Failed to save artwork');
        }
    },
    
    /**
     * Populate color palette with available colors
     */
    populateColorPalette() {
        const palette = document.getElementById('colorPalette');
        if (!palette) return;
        
        palette.innerHTML = '';
        
        ProductData.colorPalette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.setAttribute('data-color', color);
            
            if (color === this.state.currentColor) {
                swatch.classList.add('selected');
            }
            
            palette.appendChild(swatch);
        });
    },
    
    /**
     * Populate product selector with available templates
     */
    populateProductSelector() {
        const selector = document.getElementById('productSelector');
        if (!selector) return;
        
        selector.innerHTML = '';
        
        ProductData.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            selector.appendChild(option);
        });
        
        // Select the first product by default
        if (ProductData.templates.length > 0 && !this.state.selectedProduct) {
            this.selectProduct(ProductData.templates[0].id);
        }
    }
};
