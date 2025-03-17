/**
 * UI Controller for Cozy Artist Shop
 * 
 * A complete, stable implementation focused on:
 * - Safe DOM manipulation
 * - Proper initialization sequence
 * - Error containment
 * - State-driven updates
 */

const UI = {
    // DOM element references
    elements: {},
    
    // UI state
    state: {
        initialized: false,
        activeView: 'shopView',
        loadingProgress: 0,
        lastNotification: null
    },
    
    // Tutorial content
    tutorialSteps: [
        {
            title: "Welcome to Your Art Shop!",
            content: "Create custom artwork, apply it to products, and sell them to customers."
        },
        {
            title: "Creating Art",
            content: "Select a product, choose colors from the palette, and draw on the canvas."
        },
        {
            title: "Managing Inventory",
            content: "After creating a product, it goes to your Inventory where you can display it or modify its price."
        },
        {
            title: "Shop Displays",
            content: "Display your products to attract customers with different preferences."
        },
        {
            title: "Serving Customers",
            content: "Customers will visit your shop looking for products that match their tastes."
        }
    ],
    currentTutorialStep: 0,
    
    /**
     * Main initialization method
     */
    init() {
        try {
            console.log('Initializing UI system...');
            
            // Find and cache DOM elements
            this.findElements();
            
            // Setup event handlers
            this.setupEventListeners();
            
            // Set initial view
            this.showView(this.state.activeView);
            
            // Update displays
            this.updateCoinDisplay();
            this.updateDayDisplay();
            this.updateTheme();
            
            // Mark as initialized
            this.state.initialized = true;
            
            console.log('UI system initialized successfully');
            return true;
        } catch (error) {
            console.error('UI initialization failed:', error);
            return false;
        }
    },
    
    /**
     * Find and cache DOM elements
     */
    findElements() {
        // Main containers
        this.elements.gameContainer = this.getElement('#gameContainer');
        this.elements.loadingScreen = this.getElement('#loadingScreen');
        this.elements.errorScreen = this.getElement('#errorScreen');
        
        // Header elements
        this.elements.coinDisplay = this.getElement('#coinDisplay');
        this.elements.dayDisplay = this.getElement('#dayDisplay');
        
        // Views
        this.elements.views = {
            shop: this.getElement('#shopView'),
            studio: this.getElement('#studioView'),
            inventory: this.getElement('#inventoryView'),
            settings: this.getElement('#settingsView')
        };
        
        // Shop elements
        this.elements.shopDisplays = this.getElement('#shopDisplays');
        this.elements.customerArea = this.getElement('#customerArea');
        
        // Studio elements
        this.elements.canvas = this.getElement('canvas');
        this.elements.productSelector = this.getElement('select, #productSelector');
        this.elements.colorPalette = this.getElement('.colors, #colorPalette');
        
        // Inventory elements
        this.elements.inventoryItems = this.getElement('#inventoryItems');
        
        // Navigation
        this.elements.navButtons = document.querySelectorAll('.nav-button');
        
        // Action buttons
        this.elements.nextDayButton = this.getElement('#nextDayButton');
        this.elements.clearButton = this.findButtonByText('Clear');
        this.elements.createProductButton = this.findButtonByText('Create Product');
        
        console.log('UI elements found:', Object.keys(this.elements).length);
    },
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        try {
            // Navigation buttons
            this.elements.navButtons.forEach(button => {
                this.addSafeEventListener(button, 'click', () => {
                    const view = button.getAttribute('data-view');
                    if (view) this.showView(view);
                });
            });
            
            // Next day button
            if (this.elements.nextDayButton) {
                this.addSafeEventListener(this.elements.nextDayButton, 'click', () => {
                    this.startNewDay();
                });
            }
            
            // Create product button
            if (this.elements.createProductButton) {
                this.addSafeEventListener(this.elements.createProductButton, 'click', () => {
                    this.createProduct();
                });
            }
            
            // Clear button
            if (this.elements.clearButton) {
                this.addSafeEventListener(this.elements.clearButton, 'click', () => {
                    this.clearCanvas();
                });
            }
            
            // Setup canvas if it exists
            if (this.elements.canvas) {
                this.setupCanvas();
            }
            
            console.log('Event listeners set up successfully');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    },
    
    /**
     * Show a specific view
     */
    showView(viewName) {
        try {
            // Update active view in state
            this.state.activeView = viewName;
            
            // Update navigation buttons
            this.elements.navButtons.forEach(button => {
                const buttonView = button.getAttribute('data-view');
                button.classList.toggle('active', buttonView === viewName);
            });
            
            // Hide all views
            Object.values(this.elements.views).forEach(view => {
                if (view) view.classList.add('hidden');
            });
            
            // Show the selected view
            const view = this.elements.views[this.getViewKey(viewName)];
            if (view) {
                view.classList.remove('hidden');
                
                // Update view-specific content
                this.updateViewContent(viewName);
            }
            
            console.log('Showing view:', viewName);
        } catch (error) {
            console.error('Error showing view:', error, viewName);
        }
    },
    
    /**
     * Update content for a specific view
     */
    updateViewContent(viewName) {
        try {
            switch (viewName) {
                case 'shopView':
                    this.renderShopDisplays();
                    this.renderCustomers();
                    break;
                    
                case 'studioView':
                    // Make sure color palette and canvas are set up
                    if (this.elements.colorPalette && !this.elements.colorPalette.children.length) {
                        this.renderColorPalette();
                    }
                    break;
                    
                case 'inventoryView':
                    this.renderInventory();
                    break;
                    
                case 'settingsView':
                    this.updateSettingsUI();
                    break;
            }
        } catch (error) {
            console.error('Error updating view content:', error, viewName);
        }
    },
    
    /**
     * Set up canvas for drawing
     */
    setupCanvas() {
        try {
            const canvas = this.elements.canvas;
            if (!canvas) return;
            
            // Get context
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Could not get canvas context');
                return;
            }
            
            // Set initial canvas state
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Drawing state
            const state = {
                isDrawing: false,
                lastX: 0,
                lastY: 0,
                color: '#000000',
                brushSize: 5
            };
            
            // Drawing functions
            const startDrawing = (e) => {
                state.isDrawing = true;
                const rect = canvas.getBoundingClientRect();
                state.lastX = e.clientX - rect.left;
                state.lastY = e.clientY - rect.top;
            };
            
            const draw = (e) => {
                if (!state.isDrawing) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ctx.beginPath();
                ctx.strokeStyle = state.color;
                ctx.lineWidth = state.brushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                ctx.moveTo(state.lastX, state.lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                
                state.lastX = x;
                state.lastY = y;
            };
            
            const stopDrawing = () => {
                state.isDrawing = false;
            };
            
            // Add event listeners
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Touch events
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                startDrawing({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                draw({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
            
            canvas.addEventListener('touchend', stopDrawing);
            
            // Store canvas state for later access
            this.canvasState = state;
            this.canvasContext = ctx;
            
            // Render color palette
            this.renderColorPalette();
            
            console.log('Canvas set up successfully');
        } catch (error) {
            console.error('Error setting up canvas:', error);
        }
    },
    
    /**
     * Render color palette
     */
    renderColorPalette() {
        try {
            const palette = this.elements.colorPalette;
            if (!palette) return;
            
            // Clear existing content
            palette.innerHTML = '';
            
            // Add title if needed
            if (!palette.previousElementSibling || !palette.previousElementSibling.matches('h3')) {
                const title = document.createElement('h3');
                title.textContent = 'Colors';
                palette.parentNode.insertBefore(title, palette);
            }
            
            // Add colors
            const colors = [
                '#FF5252', // Red
                '#FF9800', // Orange
                '#FFEB3B', // Yellow
                '#4CAF50', // Green
                '#2196F3', // Blue
                '#9C27B0', // Purple
                '#F06292', // Pink
                '#795548', // Brown
                '#607D8B', // Gray
                '#000000', // Black
                '#FFFFFF'  // White
            ];
            
            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.setAttribute('data-color', color);
                
                // Select the first color by default
                if (color === this.canvasState?.color) {
                    swatch.classList.add('selected');
                }
                
                // Add click handler
                swatch.addEventListener('click', () => {
                    if (this.canvasState) {
                        this.canvasState.color = color;
                    }
                    
                    // Update selection UI
                    palette.querySelectorAll('.color-swatch').forEach(s => {
                        s.classList.remove('selected');
                    });
                    swatch.classList.add('selected');
                });
                
                palette.appendChild(swatch);
            });
            
            console.log('Color palette rendered successfully');
        } catch (error) {
            console.error('Error rendering color palette:', error);
        }
    },
    
    /**
     * Clear the canvas
     */
    clearCanvas() {
        try {
            if (!this.canvasContext || !this.elements.canvas) return;
            
            this.canvasContext.fillStyle = '#FFFFFF';
            this.canvasContext.fillRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
            
            console.log('Canvas cleared');
        } catch (error) {
            console.error('Error clearing canvas:', error);
        }
    },
    
    /**
     * Create a product from canvas drawing
     */
    createProduct() {
        try {
            if (!this.elements.canvas) {
                this.showNotification('Canvas not available');
                return;
            }
            
            // Get product type
            const productType = this.elements.productSelector?.value || 'mug';
            
            // Get canvas image data
            const artDataUrl = this.elements.canvas.toDataURL('image/png');
            
            // Create product object
            const basePrice = this.getProductBasePrice(productType);
            const finalPrice = basePrice + Math.floor(Math.random() * 10) + 3;
            
            const product = {
                id: 'product-' + Date.now(),
                templateId: productType,
                name: this.getProductDisplayName(productType),
                price: finalPrice,
                imageUrl: `assets/images/products/${productType}.png`,
                artUrl: artDataUrl,
                created: new Date().toISOString(),
                displayed: false
            };
            
            console.log('Product created:', product);
            
            // Show product preview
            this.showProductPreview(product);
        } catch (error) {
            console.error('Error creating product:', error);
            this.showNotification('Error creating product');
        }
    },
    
    /**
     * Show product preview modal
     */
    showProductPreview(product) {
        try {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal product-preview-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';
            
            // Get product template
            const template = this.getProductTemplate(product.templateId);
            
            // Create modal content
            modal.innerHTML = `
                <div class="modal-content" style="background-color: #ffeef2; border-radius: 15px; padding: 20px; max-width: 90%; width: 400px; position: relative;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h2 style="margin: 0;">Product Created!</h2>
                        <button class="close-button" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    
                    <div class="product-preview" style="position: relative; width: 200px; height: 200px; margin: 0 auto 20px;">
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image" style="max-width: 100%; max-height: 100%;">
                        <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: ${template?.artPosition?.width ? template.artPosition.width / 2 : 100}px;
                            height: ${template?.artPosition?.height ? template.artPosition.height / 2 : 100}px;
                        ">
                    </div>
                    
                    <div class="product-info" style="text-align: center; margin-bottom: 20px;">
                        <h3>${product.name}</h3>
                        <p>Price: ${product.price} coins</p>
                    </div>
                    
                    <div class="product-actions" style="display: flex; justify-content: space-between;">
                        <button class="add-to-shop-button" style="background-color: #ffb0c8; border: none; padding: 10px 20px; border-radius: 20px; color: white; cursor: pointer;">Add to Shop</button>
                        <button class="add-to-inventory-button" style="background-color: white; border: 1px solid #ddd; padding: 10px 20px; border-radius: 20px; cursor: pointer;">Add to Inventory</button>
                    </div>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(modal);
            
            // Set up event listeners
            modal.querySelector('.close-button').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.add-to-shop-button').addEventListener('click', () => {
                this.addProductToShop(product);
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.add-to-inventory-button').addEventListener('click', () => {
                this.addProductToInventory(product);
                document.body.removeChild(modal);
            });
            
            console.log('Product preview shown');
        } catch (error) {
            console.error('Error showing product preview:', error);
            this.showNotification('Error showing product preview');
        }
    },
    
    /**
     * Add product to inventory
     */
    addProductToInventory(product) {
        try {
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.inventory)) {
                console.error('Game state inventory not available');
                this.showNotification('Could not add to inventory');
                return false;
            }
            
            // Add to inventory
            window.gameState.data.inventory.push(product);
            
            // Save game
            if (typeof window.gameState.saveGame === 'function') {
                window.gameState.saveGame();
            }
            
            // Update UI
            this.renderInventory();
            
            this.showNotification('Product added to inventory');
            return true;
        } catch (error) {
            console.error('Error adding product to inventory:', error);
            this.showNotification('Error adding to inventory');
            return false;
        }
    },
    
    /**
     * Add product to shop
     */
    addProductToShop(product) {
        try {
            // First add to inventory
            if (!this.addProductToInventory(product)) {
                return false;
            }
            
            // Find empty shop display
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.shopDisplays)) {
                console.error('Game state shop displays not available');
                this.showNotification('Could not add to shop');
                return false;
            }
            
            const emptyDisplay = window.gameState.data.shopDisplays.find(d => !d.filled);
            
            if (!emptyDisplay) {
                this.showNotification('No empty display spots available');
                return false;
            }
            
            // Display product
            if (typeof window.gameState.displayProduct === 'function') {
                window.gameState.displayProduct(product.id, emptyDisplay.id);
                
                // Update UI
                this.renderShopDisplays();
                this.renderInventory();
                
                this.showNotification('Product added to shop');
                return true;
            } else {
                console.error('gameState.displayProduct function not available');
                this.showNotification('Could not display in shop');
                return false;
            }
        } catch (error) {
            console.error('Error adding product to shop:', error);
            this.showNotification('Error adding to shop');
            return false;
        }
    },
    
    /**
     * Render shop displays
     */
    renderShopDisplays() {
        try {
            const container = this.elements.shopDisplays;
            if (!container) return;
            
            container.innerHTML = '';
            
            // Check if shop displays exist
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.shopDisplays)) {
                container.innerHTML = '<div class="error-message">Shop displays not available</div>';
                return;
            }
            
            // Render each display
            window.gameState.data.shopDisplays.forEach(display => {
                const displayElement = document.createElement('div');
                displayElement.className = 'shop-display';
                displayElement.setAttribute('data-id', display.id);
                
                if (display.filled && display.productId) {
                    // Find product
                    const product = window.gameState.data.inventory.find(p => p.id === display.productId);
                    
                    if (product) {
                        const template = this.getProductTemplate(product.templateId);
                        
                        displayElement.classList.add('filled');
                        displayElement.innerHTML = `
                            <div class="display-product">
                                <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                                ${product.artUrl ? `
                                    <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                                        position: absolute;
                                        top: ${template?.artPosition?.y ? template.artPosition.y / 3 : 40}px;
                                        left: ${template?.artPosition?.x ? template.artPosition.x / 3 : 40}px;
                                        width: ${template?.artPosition?.width ? template.artPosition.width / 3 : 60}px;
                                        height: ${template?.artPosition?.height ? template.artPosition.height / 3 : 60}px;
                                    ">
                                ` : ''}
                                <div class="product-info">
                                    <div class="product-name">${product.name}</div>
                                    <div class="product-price">${product.price} coins</div>
                                </div>
                            </div>
                            <button class="remove-button" data-display-id="${display.id}">×</button>
                        `;
                        
                        // Add remove button handler
                        const removeButton = displayElement.querySelector('.remove-button');
                        if (removeButton) {
                            removeButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                const displayId = e.target.getAttribute('data-display-id');
                                
                                if (typeof window.gameState.removeFromDisplay === 'function') {
                                    window.gameState.removeFromDisplay(displayId);
                                    this.renderShopDisplays();
                                    this.renderInventory();
                                }
                            });
                        }
                    } else {
                        // Product not found
                        displayElement.innerHTML = '<div class="empty-display">Empty</div>';
                        
                        // Reset display in game state
                        if (typeof window.gameState.removeFromDisplay === 'function') {
                            window.gameState.removeFromDisplay(display.id);
                        }
                    }
                } else {
                    // Empty display
                    displayElement.innerHTML = '<div class="empty-display">Empty</div>';
                }
                
                // Add drag & drop for inventory items
                displayElement.addEventListener('dragover', (e) => {
                    if (!display.filled) {
                        e.preventDefault();
                        displayElement.classList.add('drag-over');
                    }
                });
                
                displayElement.addEventListener('dragleave', () => {
                    displayElement.classList.remove('drag-over');
                });
                
                displayElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    displayElement.classList.remove('drag-over');
                    
                    if (!display.filled) {
                        const productId = e.dataTransfer.getData('product-id');
                        
                        if (productId && typeof window.gameState.displayProduct === 'function') {
                            window.gameState.displayProduct(productId, display.id);
                            this.renderShopDisplays();
                            this.renderInventory();
                        }
                    }
                });
                
                container.appendChild(displayElement);
            });
            
            console.log('Shop displays rendered');
        } catch (error) {
            console.error('Error rendering shop displays:', error);
        }
    },
    
    /**
     * Render inventory
     */
    renderInventory() {
        try {
            const container = this.elements.inventoryItems;
            if (!container) return;
            
            container.innerHTML = '';
            
            // Check if inventory exists
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.inventory)) {
                container.innerHTML = '<div class="error-message">Inventory not available</div>';
                return;
            }
            
            // Check if inventory is empty
            if (window.gameState.data.inventory.length === 0) {
                container.innerHTML = '<div class="empty-inventory">Your inventory is empty. Create products in the Studio!</div>';
                return;
            }
            
            // Render each inventory item
            window.gameState.data.inventory.forEach(product => {
                const template = this.getProductTemplate(product.templateId);
                
                const itemElement = document.createElement('div');
                itemElement.className = 'inventory-item';
                itemElement.setAttribute('draggable', 'true');
                
                if (product.displayed) {
                    itemElement.classList.add('displayed');
                }
                
                itemElement.innerHTML = `
                    <div class="product-image-container">
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                        ${product.artUrl ? `
                            <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                                position: absolute;
                                top: ${template?.artPosition?.y ? template.artPosition.y / 2.5 : 40}px;
                                left: ${template?.artPosition?.x ? template.artPosition.x / 2.5 : 40}px;
                                width: ${template?.artPosition?.width ? template.artPosition.width / 2.5 : 60}px;
                                height: ${template?.artPosition?.height ? template.artPosition.height / 2.5 : 60}px;
                            ">
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">${product.price} coins</div>
                    </div>
                    <div class="product-actions">
                        ${product.displayed ? 
                            '<span class="displayed-badge">On Display</span>' : 
                            '<button class="display-button">Display</button>'}
                    </div>
                `;
                
                // Add drag start handler
                itemElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('product-id', product.id);
                });
                
                // Add display button handler
                const displayButton = itemElement.querySelector('.display-button');
                if (displayButton) {
                    displayButton.addEventListener('click', () => {
                        this.showDisplaySelection(product.id);
                    });
                }
                
                container.appendChild(itemElement);
            });
            
            console.log('Inventory rendered');
        } catch (error) {
            console.error('Error rendering inventory:', error);
        }
    },
    
    /**
     * Show display selection dialog
     */
    showDisplaySelection(productId) {
        try {
            // Check if game state is available
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.shopDisplays)) {
                this.showNotification('Shop displays not available');
                return;
            }
            
            // Find empty displays
            const emptyDisplays = window.gameState.data.shopDisplays.filter(d => !d.filled);
            
            if (emptyDisplays.length === 0) {
                this.showNotification('No empty display spots available');
                return;
            }
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal display-selection-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';
            
            // Create display options
            let optionsHTML = '';
            emptyDisplays.forEach(display => {
                optionsHTML += `
                    <div class="display-option" data-display-id="${display.id}" style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center;">
                        Display Spot ${display.id.split('-')[1]}
                    </div>
                `;
            });
            
            modal.innerHTML = `
                <div class="modal-content" style="background-color: #ffeef2; border-radius: 15px; padding: 20px; max-width: 90%; width: 400px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0;">Choose Display Location</h3>
                        <button class="close-button" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Select where to display your product:</p>
                        <div class="display-options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
                            ${optionsHTML}
                        </div>
                    </div>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(modal);
            
            // Add close button handler
            modal.querySelector('.close-button').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Add display option handlers
            modal.querySelectorAll('.display-option').forEach(option => {
                option.addEventListener('click', () => {
                    const displayId = option.getAttribute('data-display-id');
                    
                    if (typeof window.gameState.displayProduct === 'function') {
                        window.gameState.displayProduct(productId, displayId);
                        this.renderShopDisplays();
                        this.renderInventory();
                    }
                    
                    document.body.removeChild(modal);
                });
                
                // Add hover effect
                option.addEventListener('mouseenter', () => {
                    option.style.backgroundColor = '#ffb0c8';
                    option.style.color = 'white';
                });
                
                option.addEventListener('mouseleave', () => {
                    option.style.backgroundColor = '#f9f9f9';
                    option.style.color = 'inherit';
                });
            });
        } catch (error) {
            console.error('Error showing display selection:', error);
            this.showNotification('Error showing display options');
        }
    },
    
    /**
     * Render customers
     */
    renderCustomers() {
        try {
            const container = this.elements.customerArea;
            if (!container) return;
            
            container.innerHTML = '';
            
            // Check if customers exist
            if (!window.gameState || !window.gameState.data || !Array.isArray(window.gameState.data.activeCustomers)) {
                container.innerHTML = '<div class="no-customers">Customer data not available</div>';
                return;
            }
            
            // Check if there are no customers
            if (window.gameState.data.activeCustomers.length === 0) {
                container.innerHTML = '<div class="no-customers">No customers yet. Add products to your displays!</div>';
                return;
            }
            
            // Render each customer
            window.gameState.data.activeCustomers.forEach(customer => {
                const customerElement = document.createElement('div');
                customerElement.className = 'customer';
                customerElement.setAttribute('data-id', customer.id);
                
                // Calculate patience percentage
                const timeElapsed = (Date.now() - customer.enteredAt) / 1000;
                const patiencePercentage = Math.max(0, Math.min(100, 100 - (timeElapsed / customer.patience * 100)));
                
                customerElement.innerHTML = `
                    <img src="${customer.avatar}" alt="${customer.type}" class="customer-avatar">
                    <div class="customer-speech-bubble">
                        <p>I'm looking for something nice!</p>
                    </div>
                    <div class="patience-bar">
                        <div class="patience-fill" style="width: ${patiencePercentage}%;"></div>
                    </div>
                `;
                
                // Add click handler
                customerElement.addEventListener('click', () => {
                    if (typeof window.Customers !== 'undefined' && 
                        typeof window.Customers.showPreferences === 'function') {
                        window.Customers.showPreferences(customer);
                    } else {
                        this.showSimpleCustomerPreferences(customer);
                    }
                });
                
                container.appendChild(customerElement);
            });
            
            console.log('Customers rendered');
        } catch (error) {
            console.error('Error rendering customers:', error);
        }
    },
    
    /**
     * Show simple customer preferences
     */
    showSimpleCustomerPreferences(customer) {
        try {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal customer-preferences-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';
            
            // Get displayed products
            const displayedProducts = window.gameState.data.shopDisplays
                .filter(display => display.filled)
                .map(display => {
                    const product = window.gameState.data.inventory.find(p => p.id === display.productId);
                    return {
                        display,
                        product
                    };
                })
                .filter(item => item.product);
            
            // Create product list
            let productsHTML = '';
            if (displayedProducts.length > 0) {
                displayedProducts.forEach(item => {
                    productsHTML += `
                        <div class="product-item" data-product-id="${item.product.id}" data-display-id="${item.display.id}" style="display: flex; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; cursor: pointer;">
                            <img src="${item.product.imageUrl}" alt="${item.product.name}" style="width: 50px; height: 50px; margin-right: 10px;">
                            <div>
                                <div>${item.product.name}</div>
                                <div>${item.product.price} coins</div>
                            </div>
                        </div>
                    `;
                });
            } else {
                productsHTML = '<p>No products on display yet.</p>';
            }
            
            modal.innerHTML = `
                <div class="modal-content" style="background-color: #ffeef2; border-radius: 15px; padding: 20px; max-width: 90%; width: 400px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0;">Customer Preferences</h3>
                        <button class="close-button" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="customer-info" style="display: flex; margin-bottom: 20px;">
                            <img src="${customer.avatar}" alt="${customer.type}" style="width: 80px; height: 80px; margin-right: 15px;">
                            <div>
                                <p>Type: ${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}</p>
                                <p>Budget: ${customer.budget} coins</p>
                            </div>
                        </div>
                        <h4>Available Products:</h4>
                        <div class="product-list">
                            ${productsHTML}
                        </div>
                    </div>
                </div>
            `;
            
            // Add to document
            document.body.appendChild(modal);
            
            // Add close button handler
            modal.querySelector('.close-button').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Add product selection handlers
            modal.querySelectorAll('.product-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = item.getAttribute('data-product-id');
                    const displayId = item.getAttribute('data-display-id');
                    const product = window.gameState.data.inventory.find(p => p.id === productId);
                    
                    if (product) {
                        // Check if customer can afford it
                        if (product.price <= customer.budget) {
                            // Try to sell product
                            if (typeof window.gameState.sellProduct === 'function') {
                                window.gameState.sellProduct(productId, product.price);
                                
                                // Update UI
                                this.updateCoinDisplay();
                                this.renderShopDisplays();
                                this.renderInventory();
                                
                                // Remove customer from active customers
                                window.gameState.data.activeCustomers = window.gameState.data.activeCustomers.filter(c => c.id !== customer.id);
                                this.renderCustomers();
                                
                                this.showNotification(`${customer.type} customer bought ${product.name} for ${product.price} coins!`);
                            }
                        } else {
                            this.showNotification(`${customer.type} customer can't afford this item!`);
                        }
                    }
                    
                    document.body.removeChild(modal);
                });
                
                // Add hover effect
                item.addEventListener('mouseenter', () => {
                    item.style.backgroundColor = '#ffe6ec';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.backgroundColor = 'transparent';
                });
            });
        } catch (error) {
            console.error('Error showing customer preferences:', error);
            this.showNotification('Error showing customer preferences');
        }
    },
    
    /**
     * Update theme
     */
    updateTheme() {
        try {
            const theme = window.gameState?.data?.settings?.theme || 'pastel';
            document.body.setAttribute('data-theme', theme);
            
            console.log('Theme updated:', theme);
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    },
    
    /**
     * Update settings UI
     */
    updateSettingsUI() {
        try {
            // Find settings elements
            const musicVolume = document.getElementById('musicVolume');
            const sfxVolume = document.getElementById('sfxVolume');
            const themeButtons = document.querySelectorAll('.theme-button');
            
            // Update them if they exist
            if (musicVolume && window.gameState?.data?.settings) {
                musicVolume.value = window.gameState.data.settings.musicVolume || 50;
            }
            
            if (sfxVolume && window.gameState?.data?.settings) {
                sfxVolume.value = window.gameState.data.settings.sfxVolume || 70;
            }
            
            if (themeButtons.length && window.gameState?.data?.settings) {
                themeButtons.forEach(button => {
                    const buttonTheme = button.getAttribute('data-theme');
                    button.classList.toggle('active', buttonTheme === window.gameState.data.settings.theme);
                });
            }
            
            console.log('Settings UI updated');
        } catch (error) {
            console.error('Error updating settings UI:', error);
        }
    },
    
    /**
     * Start a new day
     */
    startNewDay() {
        try {
            if (!window.gameState || typeof window.gameState.startNewDay !== 'function') {
                this.showNotification('Cannot start new day');
                return;
            }
            
            const newDay = window.gameState.startNewDay();
            
            // Update UI
            this.updateDayDisplay();
            this.renderCustomers();
            
            this.showNotification(`Day ${newDay} has begun!`);
        } catch (error) {
            console.error('Error starting new day:', error);
            this.showNotification('Error starting new day');
        }
    },
    
    /**
     * Update coin display
     */
    updateCoinDisplay() {
        try {
            if (this.elements.coinDisplay && window.gameState?.data) {
                this.elements.coinDisplay.textContent = window.gameState.data.coins || 0;
            }
        } catch (error) {
            console.error('Error updating coin display:', error);
        }
    },
    
    /**
     * Update day display
     */
    updateDayDisplay() {
        try {
            if (this.elements.dayDisplay && window.gameState?.data) {
                this.elements.dayDisplay.textContent = window.gameState.data.day || 1;
            }
        } catch (error) {
            console.error('Error updating day display:', error);
        }
    },
    
    /**
     * Show notification
     */
    showNotification(message, duration = 3000) {
        try {
            // Check if we already have a notification element
            let notification = document.getElementById('notification');
            
            // Create one if it doesn't exist
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'notification';
                notification.style.position = 'fixed';
                notification.style.top = '80px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = '#ffffff';
                notification.style.color = '#333333';
                notification.style.padding = '10px 20px';
                notification.style.borderRadius = '20px';
                notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                notification.style.zIndex = '1000';
                notification.style.transition = 'opacity 0.3s, transform 0.3s';
                notification.style.opacity = '0';
                
                document.body.appendChild(notification);
            }
            
            // Update message
            notification.textContent = message;
            
            // Show notification
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
            
            // Hide after duration
            clearTimeout(this.state.lastNotification);
            this.state.lastNotification = setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(-50%) translateY(-10px)';
            }, duration);
            
            console.log('Notification shown:', message);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    },
    
    /**
     * Update all UI elements
     */
    updateAllUI() {
        this.updateCoinDisplay();
        this.updateDayDisplay();
        this.updateTheme();
        this.renderShopDisplays();
        this.renderInventory();
        this.renderCustomers();
        this.updateSettingsUI();
    },
    
    /**
     * Show error
     */
    showError(message) {
        console.error('Game Error:', message);
        
        // Find error elements
        const errorScreen = this.elements.errorScreen;
        const errorMessage = document.getElementById('errorMessage');
        
        // Show error screen if available
        if (errorScreen && errorMessage) {
            errorMessage.textContent = message;
            errorScreen.classList.remove('hidden');
            
            // Hide loading and game
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.classList.add('hidden');
            }
            
            if (this.elements.gameContainer) {
                this.elements.gameContainer.classList.add('hidden');
            }
        } else {
            // Fallback to alert
            alert('Game Error: ' + message);
        }
    },
    
    /**
     * Helper: Get view key from name
     */
    getViewKey(viewName) {
        const keyMap = {
            'shopView': 'shop',
            'studioView': 'studio',
            'inventoryView': 'inventory',
            'settingsView': 'settings'
        };
        
        return keyMap[viewName] || viewName;
    },
    
    /**
     * Helper: Safely get element by selector
     */
    getElement(selector) {
        try {
            // Try query selector first (more flexible)
            const element = document.querySelector(selector);
            
            // If not found, try getElementById if selector looks like an ID
            if (!element && selector.startsWith('#')) {
                return document.getElementById(selector.substring(1));
            }
            
            return element;
        } catch (error) {
            console.warn(`Error getting element ${selector}:`, error);
            return null;
        }
    },
    
    /**
     * Helper: Find button by text content
     */
    findButtonByText(text) {
        try {
            return Array.from(document.querySelectorAll('button'))
                .find(btn => btn.textContent.trim() === text);
        } catch (error) {
            console.warn(`Error finding button with text "${text}":`, error);
            return null;
        }
    },
    
    /**
     * Helper: Add safe event listener
     */
    addSafeEventListener(element, event, callback) {
        if (!element) return;
        
        try {
            element.addEventListener(event, callback);
        } catch (error) {
            console.warn(`Error adding ${event} listener:`, error);
        }
    },
    
    /**
     * Helper: Get product template
     */
    getProductTemplate(templateId) {
        if (window.gameState && typeof window.gameState.getProductTemplate === 'function') {
            return window.gameState.getProductTemplate(templateId);
        }
        
        // Fallback templates
        const templates = {
            'mug': { 
                id: 'mug',
                name: 'Mug', 
                basePrice: 8,
                artPosition: { x: 70, y: 70, width: 120, height: 120, rotation: 0 }
            },
            'tote': { 
                id: 'tote',
                name: 'Tote Bag', 
                basePrice: 12,
                artPosition: { x: 60, y: 50, width: 140, height: 140, rotation: 0 }
            },
            'shirt': { 
                id: 'shirt',
                name: 'T-Shirt', 
                basePrice: 15,
                artPosition: { x: 75, y: 60, width: 110, height: 110, rotation: 0 }
            },
            'poster': { 
                id: 'poster',
                name: 'Poster', 
                basePrice: 10,
                artPosition: { x: 40, y: 40, width: 180, height: 180, rotation: 0 }
            }
        };
        
        return templates[templateId] || templates['mug'];
    },
    
    /**
     * Helper: Get product base price
     */
    getProductBasePrice(productType) {
        const prices = {
            'mug': 8,
            'tote': 12,
            'shirt': 15,
            'poster': 10
        };
        
        return prices[productType] || 10;
    },
    
    /**
     * Helper: Get product display name
     */
    getProductDisplayName(productType) {
        const names = {
            'mug': 'Mug with Custom Art',
            'tote': 'Tote Bag with Custom Art',
            'shirt': 'T-Shirt with Custom Art',
            'poster': 'Poster with Custom Art'
        };
        
        return names[productType] || 'Custom Product';
    }
};

// For backward compatibility
const ui = UI;

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, initializing UI...');
    UI.init();
});

// Backup initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, initializing UI now');
    setTimeout(function() {
        UI.init();
    }, 200);
}

// Catch errors for diagnostic purposes
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
});
