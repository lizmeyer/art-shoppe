/**
 * UI Controller for Cozy Artist Shop
 * Handles UI rendering and user interaction
 */

const UI = {
    // Store DOM element references
    elements: {},
    
    // Tutorial steps
    tutorialSteps: [
        {
            title: "Welcome to Your Art Shop!",
            content: "Hello! Welcome to your cozy art shop. Here you can create custom artwork, apply it to products, and sell them to customers."
        },
        {
            title: "Creating Art",
            content: "First, go to the Studio to create your artwork. Select a product, choose colors from the palette, and draw directly on the canvas."
        },
        {
            title: "Managing Inventory",
            content: "After creating a product, it goes to your Inventory. From there, you can display it in your shop or modify its price."
        },
        {
            title: "Shop Displays",
            content: "Your Shop has display spots where you can showcase your products. Drag items from your inventory to display them and attract customers."
        },
        {
            title: "Serving Customers",
            content: "Customers will visit your shop with specific preferences. Sell them products they like to earn coins!"
        },
        {
            title: "Day Cycle",
            content: "At the end of each day, click 'Next Day' to advance. New customers will arrive, and popular trends might change."
        }
    ],
    
    currentTutorialStep: 0,
    
    /**
     * Initialize the UI
     */
    init() {
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Add responsive meta tag if not present
            this.ensureResponsiveMeta();
            
            // Set up main event listeners
            this.setupEventListeners();
            
            // Add responsive styling
            this.addResponsiveStyles();
            
            // Show loading screen
            this.showLoading();
            
            // Initialize UI state
            this.updateCoinDisplay();
            this.updateDayDisplay();
            this.updateTheme();
            
            console.log('UI initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            this.showError('Failed to initialize UI: ' + error.message);
            return false;
        }
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        // Main containers
        this.elements.body = document.body;
        this.elements.gameContainer = document.getElementById('gameContainer');
        this.elements.loadingScreen = document.getElementById('loadingScreen');
        this.elements.errorScreen = document.getElementById('errorScreen');
        this.elements.shopView = document.getElementById('shopView');
        this.elements.studioView = document.getElementById('studioView');
        this.elements.inventoryView = document.getElementById('inventoryView');
        this.elements.settingsView = document.getElementById('settingsView');
        
        // Header elements
        this.elements.coinDisplay = document.getElementById('coinDisplay');
        this.elements.dayDisplay = document.getElementById('dayDisplay');
        this.elements.menuButton = document.getElementById('menuButton');
        
        // Navigation
        this.elements.navButtons = document.querySelectorAll('.nav-button');
        
        // Studio elements
        this.elements.productSelector = document.getElementById('productSelector');
        this.elements.canvas = document.getElementById('drawingCanvas') || document.querySelector('canvas');
        this.elements.colorPalette = document.getElementById('colorPalette') || document.querySelector('.colors');
        this.elements.brushSize = document.getElementById('brushSize');
        this.elements.clearButton = document.getElementById('clearButton');
        this.elements.createProductButton = document.getElementById('createProductButton');
        
        // Shop elements
        this.elements.shopDisplays = document.getElementById('shopDisplays');
        this.elements.customerArea = document.getElementById('customerArea');
        
        // Inventory elements
        this.elements.inventoryItems = document.getElementById('inventoryItems');
        
        // Action buttons
        this.elements.nextDayButton = document.getElementById('nextDayButton');
    },
    
    /**
     * Ensure meta viewport tag exists for responsiveness
     */
    ensureResponsiveMeta() {
        if (!document.querySelector('meta[name="viewport"]')) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);
            console.log('Added responsive viewport meta tag');
        }
    },
    
    /**
     * Add responsive styles to document
     */
    addResponsiveStyles() {
        const styleId = 'responsive-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Base responsive improvements */
            body {
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            /* Header styling */
            .game-header {
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            /* View containers */
            .game-view {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px;
                flex: 1;
                max-width: 900px;
                margin: 0 auto;
                width: 100%;
            }
            
            /* Art Studio specific styles */
            #studioView h2, #studioView .view-title {
                text-align: center;
                margin-bottom: 20px;
                color: #5a4a4c;
            }
            
            .product-selection {
                margin-bottom: 20px;
                width: 100%;
                max-width: 500px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
            }
            
            .product-selection select {
                padding: 8px 15px;
                border-radius: 5px;
                border: 1px solid #ccc;
                background-color: #f9f9f9;
                font-size: 16px;
                min-width: 150px;
            }
            
            /* Canvas container */
            .canvas-container {
                width: 100%;
                max-width: 600px;
                aspect-ratio: 1;
                margin: 0 auto 20px;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 3px 15px rgba(0,0,0,0.1);
                overflow: hidden;
                position: relative;
            }
            
            canvas {
                width: 100%;
                height: 100%;
                display: block;
                cursor: crosshair;
            }
            
            /* Color palette */
            .colors {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
                width: 100%;
                max-width: 500px;
            }
            
            .color-swatch {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.2s ease;
            }
            
            .color-swatch.selected, .color-swatch:active {
                transform: scale(1.15);
                border-color: #fff;
                box-shadow: 0 0 0 2px #888;
            }
            
            /* Brush size control */
            .brush-size {
                width: 100%;
                max-width: 400px;
                margin: 20px auto;
                text-align: center;
            }
            
            .brush-size input[type="range"] {
                width: 100%;
                margin: 10px 0;
            }
            
            /* Buttons row */
            .action-buttons {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
                width: 100%;
                max-width: 500px;
            }
            
            /* Product modal improvements */
            .product-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .product-modal-content {
                background-color: #ffeef2;
                border-radius: 15px;
                padding: 25px;
                max-width: 90%;
                width: 500px;
                position: relative;
                box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            }
            
            .product-preview {
                position: relative;
                width: 250px;
                height: 250px;
                margin: 0 auto 20px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .product-info {
                text-align: center;
                margin: 20px 0;
            }
            
            .product-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 25px;
            }
            
            /* Media queries */
            @media (max-width: 768px) {
                .canvas-container {
                    max-width: 100%;
                }
                
                .color-swatch {
                    width: 35px;
                    height: 35px;
                }
                
                .shop-displays {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .inventory-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 480px) {
                .action-buttons {
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                }
                
                button.action-button, button.nav-button {
                    width: 80%;
                }
                
                .color-swatch {
                    width: 30px;
                    height: 30px;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('Added responsive styles');
    },
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        if (this.elements.navButtons) {
            this.elements.navButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const view = button.getAttribute('data-view');
                    if (view) this.changeView(view);
                });
            });
        }
        
        // Next day button
        if (this.elements.nextDayButton) {
            this.elements.nextDayButton.addEventListener('click', () => {
                this.startNewDay();
            });
        }
        
        // Error retry button
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Create responsive art studio if on studio view
        this.setupStudioView();
    },
    
    /**
     * Create or update the studio view layout
     */
    setupStudioView() {
        if (!this.elements.studioView) return;
        
        // Check if the canvas container exists
        let canvasContainer = this.elements.studioView.querySelector('.canvas-container');
        if (!canvasContainer && this.elements.canvas) {
            // Create canvas container
            canvasContainer = document.createElement('div');
            canvasContainer.className = 'canvas-container';
            
            // Move canvas into container
            const canvas = this.elements.canvas;
            if (canvas.parentNode) {
                canvas.parentNode.replaceChild(canvasContainer, canvas);
            }
            canvasContainer.appendChild(canvas);
            
            this.elements.studioView.appendChild(canvasContainer);
        }
        
        // Make sure we have a product selector
        if (!this.elements.productSelector) {
            const productSelection = document.createElement('div');
            productSelection.className = 'product-selection';
            productSelection.innerHTML = `
                <label for="productSelector">Select Product:</label>
                <select id="productSelector">
                    <option value="mug">Mug</option>
                    <option value="tote">Tote Bag</option>
                    <option value="shirt">T-Shirt</option>
                    <option value="poster">Poster</option>
                </select>
            `;
            
            if (this.elements.studioView.firstChild) {
                this.elements.studioView.insertBefore(productSelection, this.elements.studioView.firstChild);
            } else {
                this.elements.studioView.appendChild(productSelection);
            }
            
            this.elements.productSelector = productSelection.querySelector('select');
        }
        
        // Ensure color palette is properly structured
        if (this.elements.colorPalette) {
            // Add title if needed
            if (!this.elements.colorPalette.querySelector('h3')) {
                const title = document.createElement('h3');
                title.textContent = 'Colors';
                this.elements.colorPalette.insertBefore(title, this.elements.colorPalette.firstChild);
            }
        }
        
        // Create brush size control if needed
        let brushSizeControl = this.elements.studioView.querySelector('.brush-size');
        if (!brushSizeControl) {
            brushSizeControl = document.createElement('div');
            brushSizeControl.className = 'brush-size';
            brushSizeControl.innerHTML = `
                <h3>Brush Size</h3>
                <input type="range" id="brushSize" min="1" max="20" value="5">
            `;
            
            if (this.elements.colorPalette) {
                this.elements.studioView.insertBefore(brushSizeControl, this.elements.colorPalette.nextSibling);
            } else {
                this.elements.studioView.appendChild(brushSizeControl);
            }
            
            this.elements.brushSize = brushSizeControl.querySelector('input');
        }
        
        // Create action buttons if needed
        let actionButtons = this.elements.studioView.querySelector('.action-buttons');
        if (!actionButtons) {
            actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            
            // Find existing buttons or create new ones
            const clearButton = document.getElementById('clearButton') || 
                Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Clear');
            
            const createButton = document.getElementById('createProductButton') || 
                Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Create Product');
            
            if (!clearButton) {
                const newClearButton = document.createElement('button');
                newClearButton.id = 'clearButton';
                newClearButton.className = 'clear-button';
                newClearButton.textContent = 'Clear';
                actionButtons.appendChild(newClearButton);
                this.elements.clearButton = newClearButton;
            } else {
                clearButton.className = 'clear-button';
                actionButtons.appendChild(clearButton);
            }
            
            if (!createButton) {
                const newCreateButton = document.createElement('button');
                newCreateButton.id = 'createProductButton';
                newCreateButton.className = 'create-button';
                newCreateButton.textContent = 'Create Product';
                actionButtons.appendChild(newCreateButton);
                this.elements.createProductButton = newCreateButton;
            } else {
                createButton.className = 'create-button';
                actionButtons.appendChild(createButton);
            }
            
            this.elements.studioView.appendChild(actionButtons);
        }
    },
    
    /**
     * Show loading screen
     */
    showLoading() {
        if (!this.elements.loadingScreen) return;
        
        this.elements.loadingScreen.classList.remove('hidden');
        
        let progress = 0;
        const loadingBar = document.getElementById('loadingBar');
        if (!loadingBar) return;
        
        const interval = setInterval(() => {
            progress += 5;
            loadingBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.hideLoading();
                    this.startGame();
                }, 500);
            }
        }, 100);
    },
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
        
        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.remove('hidden');
        }
    },
    
    /**
     * Show error screen
     */
    showError(message) {
        const errorScreen = document.getElementById('errorScreen');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        if (errorScreen) {
            errorScreen.classList.remove('hidden');
        }
        
        if (this.elements.gameContainer) {
            this.elements.gameContainer.classList.add('hidden');
        }
        
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
        
        console.error('Game Error:', message);
    },
    
    /**
     * Start the game after loading
     */
    startGame() {
        if (!gameState.data.settings.tutorialComplete) {
            this.showTutorial();
        }
        
        this.renderShopDisplays();
        this.renderInventory();
        
        // Generate initial customers
        if (typeof Customers !== 'undefined' && typeof Customers.generateInitialCustomers === 'function') {
            Customers.generateInitialCustomers();
        }
        this.renderCustomers();
        
        // Initialize canvas if in studio view
        if (this.elements.studioView && !this.elements.studioView.classList.contains('hidden')) {
            this.initializeCanvas();
        }
    },
    
    /**
     * Initialize the canvas
     */
    initializeCanvas() {
        if (typeof Canvas !== 'undefined' && typeof Canvas.init === 'function') {
            Canvas.init();
        } else if (typeof CanvasPainter !== 'undefined' && typeof CanvasPainter.init === 'function') {
            CanvasPainter.init();
        } else {
            console.warn('Canvas drawing system not found');
        }
    },
    
    /**
     * Show tutorial
     */
    showTutorial() {
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        if (!tutorialOverlay) return;
        
        this.currentTutorialStep = 0;
        this.updateTutorialStep();
        tutorialOverlay.classList.remove('hidden');
    },
    
    /**
     * Update tutorial step
     */
    updateTutorialStep() {
        const step = this.tutorialSteps[this.currentTutorialStep];
        const tutorialTitle = document.getElementById('tutorialTitle');
        const tutorialContent = document.getElementById('tutorialContent');
        const tutorialProgress = document.getElementById('tutorialProgress');
        const prevButton = document.getElementById('tutorialPrevButton');
        const nextButton = document.getElementById('tutorialNextButton');
        
        if (tutorialTitle) tutorialTitle.textContent = step.title;
        if (tutorialContent) tutorialContent.textContent = step.content;
        if (tutorialProgress) {
            tutorialProgress.textContent = `${this.currentTutorialStep + 1}/${this.tutorialSteps.length}`;
        }
        
        // Show/hide previous button
        if (prevButton) {
            prevButton.classList.toggle('hidden', this.currentTutorialStep === 0);
        }
        
        // Update next button text
        if (nextButton) {
            nextButton.textContent = this.currentTutorialStep === this.tutorialSteps.length - 1 ? 'Start Game' : 'Next';
        }
    },
    
    /**
     * Change active view
     */
    changeView(viewName) {
        const views = ['shopView', 'studioView', 'inventoryView', 'settingsView'];
        const viewElements = views.map(v => document.getElementById(v)).filter(Boolean);
        
        // Update navigation buttons
        this.elements.navButtons.forEach(button => {
            const targetView = button.getAttribute('data-view');
            button.classList.toggle('active', targetView === viewName);
        });
        
        // Hide all views
        viewElements.forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show the selected view
        const targetView = document.getElementById(viewName);
        if (targetView) {
            targetView.classList.remove('hidden');
            
            // Special handling for studio view
            if (viewName === 'studioView') {
                this.setupStudioView();
                this.initializeCanvas();
            }
        }
        
        // Update game state
        if (gameState) {
            gameState.activeView = viewName;
        }
        
        // Update view-specific content
        this.updateViewContent(viewName);
    },
    
    /**
     * Update view content
     */
    updateViewContent(viewName) {
        switch (viewName) {
            case 'shopView':
                this.renderShopDisplays();
                this.renderCustomers();
                break;
            case 'studioView':
                // Setup canvas and controls
                this.setupStudioView();
                break;
            case 'inventoryView':
                this.renderInventory();
                break;
            case 'settingsView':
                this.updateSettingsUI();
                break;
        }
    },
    
    /**
     * Update settings UI
     */
    updateSettingsUI() {
        const musicVolume = document.getElementById('musicVolume');
        const sfxVolume = document.getElementById('sfxVolume');
        const themeButtons = document.querySelectorAll('.theme-button');
        
        if (musicVolume) musicVolume.value = gameState.data.settings.musicVolume;
        if (sfxVolume) sfxVolume.value = gameState.data.settings.sfxVolume;
        
        if (themeButtons) {
            themeButtons.forEach(button => {
                button.classList.toggle('active', 
                    button.getAttribute('data-theme') === gameState.data.settings.theme);
            });
        }
    },
    
    /**
     * Update coin display
     */
    updateCoinDisplay() {
        if (this.elements.coinDisplay) {
            this.elements.coinDisplay.textContent = gameState.data.coins;
        }
    },
    
    /**
     * Update day display
     */
    updateDayDisplay() {
        if (this.elements.dayDisplay) {
            this.elements.dayDisplay.textContent = gameState.data.day;
        }
    },
    
    /**
     * Update theme
     */
    updateTheme() {
        document.body.setAttribute('data-theme', gameState.data.settings.theme);
        
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            button.classList.toggle('active', 
                button.getAttribute('data-theme') === gameState.data.settings.theme);
        });
    },
    
    /**
     * Render shop displays
     */
    renderShopDisplays() {
        if (!this.elements.shopDisplays) return;
        
        this.elements.shopDisplays.innerHTML = '';
        this.elements.shopDisplays.className = 'shop-displays';
        
        if (!gameState.data.shopDisplays || !gameState.data.shopDisplays.length) {
            console.warn('No shop displays defined in gameState');
            return;
        }
        
        gameState.data.shopDisplays.forEach(display => {
            const displayElement = document.createElement('div');
            displayElement.className = 'shop-display';
            displayElement.setAttribute('data-id', display.id);
            
            if (display.filled && display.productId) {
                // Find the product in inventory
                const product = gameState.data.inventory.find(p => p.id === display.productId);
                
                if (product) {
                    const template = gameState.getProductTemplate(product.templateId);
                    
                    displayElement.classList.add('filled');
                    displayElement.innerHTML = `
                        <div class="display-product" data-product-id="${product.id}">
                            <div class="product-image-container">
                                <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                                ${product.artUrl ? `<img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                                    position: absolute;
                                    left: ${template ? template.artPosition.x / 3 : 50}px;
                                    top: ${template ? template.artPosition.y / 3 : 50}px;
                                    width: ${template ? template.artPosition.width / 3 : 50}px;
                                    height: ${template ? template.artPosition.height / 3 : 50}px;
                                    transform: rotate(${template ? template.artPosition.rotation : 0}deg);
                                ">` : ''}
                            </div>
                            <div class="product-overlay">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">${product.price} coins</div>
                            </div>
                        </div>
                        <button class="remove-button" data-display-id="${display.id}">×</button>
                    `;
                    
                    // Add remove button event
                    const removeButton = displayElement.querySelector('.remove-button');
                    if (removeButton) {
                        removeButton.addEventListener('click', e => {
                            e.stopPropagation();
                            const displayId = removeButton.getAttribute('data-display-id');
                            gameState.removeFromDisplay(displayId);
                            this.renderShopDisplays();
                            this.renderInventory();
                        });
                    }
                } else {
                    // Product not found, reset display
                    displayElement.innerHTML = '<div class="empty-display">Empty Display</div>';
                    gameState.removeFromDisplay(display.id);
                }
            } else {
                // Empty display
                displayElement.innerHTML = '<div class="empty-display">Empty Display</div>';
            }
            
            // Set up drop zone for inventory items
            displayElement.addEventListener('dragover', e => {
                if (!display.filled) {
                    e.preventDefault();
                    displayElement.classList.add('drag-over');
                }
            });
            
            displayElement.addEventListener('dragleave', () => {
                displayElement.classList.remove('drag-over');
            });
            
            displayElement.addEventListener('drop', e => {
                e.preventDefault();
                displayElement.classList.remove('drag-over');
                
                const productId = e.dataTransfer.getData('product-id');
                if (productId && !display.filled) {
                    gameState.displayProduct(productId, display.id);
                    this.renderShopDisplays();
                    this.renderInventory();
                }
            });
            
            this.elements.shopDisplays.appendChild(displayElement);
        });
    },
    
    /**
     * Render customers
     */
    renderCustomers() {
        if (!this.elements.customerArea) return;
        
        this.elements.customerArea.innerHTML = '';
        
        if (!gameState.data.activeCustomers || gameState.data.activeCustomers.length === 0) {
            this.elements.customerArea.innerHTML = '<div class="no-customers">No customers yet. Add products to your displays!</div>';
            return;
        }
        
        gameState.data.activeCustomers.forEach(customer => {
            const customerElement = document.createElement('div');
            customerElement.className = 'customer';
            customerElement.setAttribute('data-customer-id', customer.id);
            
            // Calculate patience percentage
            const timeElapsed = (Date.now() - customer.enteredAt) / 1000;
            const patiencePercentage = Math.max(0, Math.min(100, 100 - (timeElapsed / customer.patience * 100)));
            
            customerElement.innerHTML = `
                <img src="${customer.avatar}" alt="${customer.type}" class="customer-avatar">
                <div class="customer-speech-bubble">
                    <p>I'm looking for something nice!</p>
                </div>
                <div class="patience-bar">
                    <div class="patience-fill" style="width: ${patiencePercentage}%"></div>
                </div>
            `;
            
            // Add click handler to show customer preferences
            customerElement.addEventListener('click', () => {
                if (typeof Customers !== 'undefined' && typeof Customers.showPreferences === 'function') {
                    Customers.showPreferences(customer);
                }
            });
            
            this.elements.customerArea.appendChild(customerElement);
        });
    },
    
    /**
     * Render inventory
     */
    renderInventory() {
        if (!this.elements.inventoryItems) return;
        
        this.elements.inventoryItems.innerHTML = '';
        this.elements.inventoryItems.className = 'inventory-grid';
        
        if (!gameState.data.inventory || gameState.data.inventory.length === 0) {
            this.elements.inventoryItems.innerHTML = '<div class="empty-inventory">Your inventory is empty. Create products in the Studio!</div>';
            return;
        }
        
        gameState.data.inventory.forEach(product => {
            const template = gameState.getProductTemplate(product.templateId);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.setAttribute('draggable', 'true');
            
            if (product.displayed) {
                itemElement.classList.add('displayed');
            }
            
            itemElement.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                    ${product.artUrl ? `<img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                        position: absolute;
                        left: ${template ? template.artPosition.x / 2.5 : 40}px;
                        top: ${template ? template.artPosition.y / 2.5 : 40}px;
                        width: ${template ? template.artPosition.width / 2.5 : 60}px;
                        height: ${template ? template.artPosition.height / 2.5 : 60}px;
                        transform: rotate(${template ? template.artPosition.rotation : 0}deg);
                    ">` : ''}
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
            
            // Set up drag and drop
            itemElement.addEventListener('dragstart', e => {
                e.dataTransfer.setData('product-id', product.id);
            });
            
            // Add display button event
            const displayButton = itemElement.querySelector('.display-button');
            if (displayButton) {
                displayButton.addEventListener('click', () => {
                    this.showDisplaySelection(product.id);
                });
            }
            
            this.elements.inventoryItems.appendChild(itemElement);
        });
    },
    
    /**
     * Show display selection dialog
     */
    showDisplaySelection(productId) {
        const emptyDisplays = gameState.data.shopDisplays.filter(d => !d.filled);
        
        if (emptyDisplays.length === 0) {
            alert('All display spots are full! Remove something first.');
            return;
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';
        
        // Create modal content
        let displayOptions = '';
        emptyDisplays.forEach(display => {
            displayOptions += `
                <div class="display-option" data-display-id="${display.id}">
                    <div class="display-spot">Display Spot ${display.id.split('-')[1]}</div>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Choose Display Location</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <p>Select where to display your product:</p>
                    <div class="display-options">
                        ${displayOptions}
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add close button event
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Add display option events
        modal.querySelectorAll('.display-option').forEach(option => {
            option.addEventListener('click', () => {
                const displayId = option.getAttribute('data-display-id');
                gameState.displayProduct(productId, displayId);
                this.renderShopDisplays();
                this.renderInventory();
                document.body.removeChild(modal);
            });
        });
    },
    
    /**
     * Show product preview
     */
    showProductPreview(product) {
        const template = gameState.getProductTemplate(product.templateId);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        
        modal.innerHTML = `
            <div class="product-modal-content">
                <h2>Product Created!</h2>
                <button class="close-button">×</button>
                
                <div class="product-preview">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image" style="max-width: 80%; max-height: 80%;">
                    <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%) rotate(${template ? template.artPosition.rotation : 0}deg);
                        width: ${template ? template.artPosition.width / 1.5 : 100}px;
                        height: ${template ? template.artPosition.height / 1.5 : 100}px;
                    ">
                </div>
                
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Price: ${product.price} coins</p>
                </div>
                
                <div class="product-actions">
                    <button class="shop-button">Add to Shop</button>
                    <button class="inventory-button">Add to Inventory</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add close button event
        modal.querySelector('.close-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Add shop button event
        modal.querySelector('.shop-button').addEventListener('click', () => {
            // Find empty display spot
            const emptySpot = gameState.data.shopDisplays.find(spot => !spot.filled);
            
            if (emptySpot) {
                // Add to inventory first
                gameState.data.inventory.push(product);
                
                // Display in shop
                gameState.displayProduct(product.id, emptySpot.id);
                
                // Update UI
                this.renderShopDisplays();
                this.renderInventory();
                
                // Close modal
                document.body.removeChild(modal);
            } else {
                alert('No empty display spots available. Please remove some items first.');
            }
        });
        
        // Add inventory button event
        modal.querySelector('.inventory-button').addEventListener('click', () => {
            // Add to inventory
            gameState.data.inventory.push(product);
            
            // Update UI
            this.renderInventory();
            
            // Close modal
            document.body.removeChild(modal);
        });
    },
    
    /**
     * Start a new day
     */
    startNewDay() {
        gameState.startNewDay();
        this.updateDayDisplay();
        
        // Generate new customers
        if (typeof Customers !== 'undefined' && typeof Customers.generateInitialCustomers === 'function') {
            Customers.generateInitialCustomers();
        }
        this.renderCustomers();
        
        this.showNotification(`Day ${gameState.data.day} has begun!`);
    },
    
    /**
     * Show notification
     */
    showNotification(message, duration = 3000) {
        // Create or get notification element
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        // Hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, duration);
    },
    
    /**
     * Update all UI elements
     */
    updateAllUI() {
        this.updateCoinDisplay();
        this.updateDayDisplay();
        this.updateTheme();
        this.renderShopDisplays();
        this.renderCustomers();
        this.renderInventory();
        this.updateSettingsUI();
    }
};

// For compatibility with older code
const ui = UI;
