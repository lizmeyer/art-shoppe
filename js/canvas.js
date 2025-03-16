/**
 * Canvas Controller for Cozy Artist Shop
 * Handles the drawing canvas for creating art
 */

const Canvas = {
    // Canvas element and context
    element: null,
    ctx: null,
    
    // Canvas state
    state: {
        isDrawing: false,
        currentColor: '#000000',
        brushSize: 5,
        lastX: 0,
        lastY: 0,
        selectedProduct: null
    },
    
    /**
     * Initialize the canvas
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
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize product selector and color palette
            this.populateProductSelector();
            this.populateColorPalette();
            
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
        
        // Touch events for mobile
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
    },
    
    /**
     * Start drawing on canvas
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
     */
    draw(event) {
        if (!this.ctx || !this.state.isDrawing) return;
        
        const rect = this.element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.state.currentColor;
        this.ctx.lineWidth = this.state.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
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
     * Select a color for drawing
     */
    selectColor(color) {
        this.state.currentColor = color;
        
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (swatch.getAttribute('data-color') === color) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });
    },
    
    /**
     * Save artwork and create a product
     */
    saveArtwork() {
        if (!this.element || !this.state.selectedProduct) {
            Utils.showNotification('Please select a product first');
            return;
        }
        
        try {
            // Get the art data URL
            const artDataUrl = this.element.toDataURL('image/png');
            
            // Calculate price based on template
            const basePrice = this.state.selectedProduct.basePrice;
            const price = basePrice + Math.floor(Math.random() * 10) + 5;
            
            // Create the product
            const newProduct = {
                templateId: this.state.selectedProduct.id,
                name: `${this.state.selectedProduct.name} with Custom Art`,
                price: price,
                imageUrl: this.state.selectedProduct.image,
                artUrl: artDataUrl
            };
            
            // Add to inventory
            const addedProduct = gameState.addToInventory(newProduct);
            
            if (addedProduct) {
                Utils.showNotification(`Created new ${this.state.selectedProduct.name}!`);
                this.clear();
                UI.showProductPreview(addedProduct);
            }
        } catch (error) {
            console.error('Failed to save artwork:', error);
            Utils.showNotification('Failed to save artwork');
        }
    },
    
    /**
     * Populate the product selector
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
        if (ProductData.templates.length > 0) {
            this.selectProduct(ProductData.templates[0].id);
        }
    },
    
    /**
     * Populate the color palette
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
            
            swatch.addEventListener('click', () => {
                this.selectColor(color);
            });
            
            palette.appendChild(swatch);
        });
    },
    
    /**
     * Select a product template
     */
    selectProduct(productId) {
        const template = gameState.getProductTemplate(productId);
        if (!template) return;
        
        this.state.selectedProduct = template;
        
        // Update product preview
        const productPreview = document.getElementById('productPreview');
        if (productPreview) {
            productPreview.innerHTML = `
                <img src="${template.image}" alt="${template.name}" class="product-template" 
                    style="max-width: 80%; max-height: 80%; opacity: 0.3;">
            `;
        }
        
        // Clear canvas for new product
        this.clear();
    }
};
