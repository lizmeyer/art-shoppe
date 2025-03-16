/**
 * UI Controller for Cozy Artist Shop
 * Handles all UI rendering and user interactions
 */

const UI = {
    // Store DOM element references
    elements: {
        // Main containers
        gameContainer: document.getElementById('gameContainer'),
        mainContent: document.getElementById('mainContent'),
        shopView: document.getElementById('shopView'),
        studioView: document.getElementById('studioView'),
        inventoryView: document.getElementById('inventoryView'),
        
        // Header elements
        coinDisplay: document.getElementById('coinDisplay'),
        dayDisplay: document.getElementById('dayDisplay'),
        
        // Navigation
        navButtons: document.querySelectorAll('.nav-button'),
        tabButtons: document.querySelectorAll('.tab-button'),
        
        // Shop elements
        shopDisplays: document.getElementById('shopDisplays'),
        customerArea: document.getElementById('customerArea'),
        
        // Studio elements
        productSelector: document.getElementById('productSelector'),
        canvas: document.getElementById('artCanvas'),
        colorPalette: document.getElementById('colorPalette'),
        saveArtButton: document.getElementById('saveArtButton'),
        
        // Inventory elements
        inventoryItems: document.getElementById('inventoryItems'),
        
        // Overlays
        loadingOverlay: document.getElementById('loadingOverlay'),
        tutorialOverlay: document.getElementById('tutorialOverlay'),
        productModal: document.getElementById('productModal'),
        
        // Action buttons
        nextDayButton: document.getElementById('nextDayButton'),
        saveGameButton: document.getElementById('saveGameButton'),
        
        // Settings elements
        themeButtons: document.querySelectorAll('.theme-button'),
        musicVolumeSlider: document.getElementById('musicVolumeSlider'),
        sfxVolumeSlider: document.getElementById('sfxVolumeSlider')
    },
    
    // Track current canvas state
    canvasState: {
        ctx: null,
        isDrawing: false,
        currentColor: '#000000',
        brushSize: 5,
        lastX: 0,
        lastY: 0,
        selectedProduct: null,
        artDataUrl: null
    },
    
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
            content: "Your Shop has 6 display spots. Drag products from your inventory to display them and attract customers."
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
    
    // Initialize UI
    init() {
        // Set up canvas
        this.initializeCanvas();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI based on game state
        this.updateCoinsDisplay();
        this.updateDayDisplay();
        this.updateTheme();
        
        // Show loading screen
        this.showLoading();
        
        // Return for chaining
        return this;
    },
    
    // Initialize the canvas
    initializeCanvas() {
        const canvas = this.elements.canvas;
        if (!canvas) return;
        
        this.canvasState.ctx = canvas.getContext('2d');
        
        // Set white background
        this.canvasState.ctx.fillStyle = '#FFFFFF';
        this.canvasState.ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    
    // Set up all event listeners
    setupEventListeners() {
        // Navigation
        this.elements.navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.getAttribute('data-view');
                this.changeView(view);
            });
        });
        
        // Tab navigation
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.changeTab(tab);
            });
        });
        
        // Product selection in studio
        if (this.elements.productSelector) {
            this.elements.productSelector.addEventListener('change', (e) => {
                this.selectProduct(e.target.value);
            });
        }
        
        // Color palette selection
        if (this.elements.colorPalette) {
            this.elements.colorPalette.addEventListener('click', (e) => {
                if (e.target.classList.contains('color-swatch')) {
                    const color = e.target.getAttribute('data-color');
                    this.selectColor(color);
                }
            });
        }
        
        // Canvas drawing
        if (this.elements.canvas) {
            const canvas = this.elements.canvas;
            
            canvas.addEventListener('mousedown', (e) => {
                this.startDrawing(e);
            });
            
            canvas.addEventListener('mousemove', (e) => {
                this.draw(e);
            });
            
            canvas.addEventListener('mouseup', () => {
                this.stopDrawing();
            });
            
            canvas.addEventListener('mouseout', () => {
                this.stopDrawing();
            });
            
            // Touch support for mobile
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            });
            
            canvas.addEventListener('touchend', () => {
                const mouseEvent = new MouseEvent('mouseup');
                canvas.dispatchEvent(mouseEvent);
            });
        }
        
        // Save art button
        if (this.elements.saveArtButton) {
            this.elements.saveArtButton.addEventListener('click', () => {
                this.saveArtwork();
            });
        }
        
        // Next day button
        if (this.elements.nextDayButton) {
            this.elements.nextDayButton.addEventListener('click', () => {
                this.startNewDay();
            });
        }
        
        // Save game button
        if (this.elements.saveGameButton) {
            this.elements.saveGameButton.addEventListener('click', () => {
                this.saveGame();
            });
        }
        
        // Theme buttons
        this.elements.themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.getAttribute('data-theme');
                this.changeTheme(theme);
            });
        });
        
        // Volume sliders
        if (this.elements.musicVolumeSlider) {
            this.elements.musicVolumeSlider.addEventListener('change', (e) => {
                gameState.settings.musicVolume = parseInt(e.target.value);
                gameState.saveGame();
            });
        }
        
        if (this.elements.sfxVolumeSlider) {
            this.elements.sfxVolumeSlider.addEventListener('change', (e) => {
                gameState.settings.sfxVolume = parseInt(e.target.value);
                gameState.saveGame();
            });
        }
        
        // Tutorial next button
        const tutorialNextButton = document.getElementById('tutorialNextButton');
        if (tutorialNextButton) {
            tutorialNextButton.addEventListener('click', () => {
                this.showNextTutorialStep();
            });
        }
    },
    
    // Show loading screen
    showLoading() {
        if (!this.elements.loadingOverlay) return;
        
        this.elements.loadingOverlay.classList.remove('hidden');
        
        // Simulate loading progress
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
    
    // Hide loading screen
    hideLoading() {
        if (!this.elements.loadingOverlay) return;
        this.elements.loadingOverlay.classList.add('hidden');
    },
    
    // Start the game
    startGame() {
        if (!gameState.settings.tutorialComplete) {
            this.showTutorial();
        }
        
        this.renderShopDisplays();
        this.generateCustomers();
        this.renderInventory();
    },
    
    // Show tutorial
    showTutorial() {
        if (!this.elements.tutorialOverlay) return;
        
        this.currentTutorialStep = 0;
        this.showTutorialStep(0);
        this.elements.tutorialOverlay.classList.remove('hidden');
    },
    
    // Show specific tutorial step
    showTutorialStep(stepIndex) {
        const step = this.tutorialSteps[stepIndex];
        const tutorialContent = document.getElementById('tutorialContent');
        if (!tutorialContent) return;
        
        tutorialContent.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
        `;
    },
    
    // Show next tutorial step
    showNextTutorialStep() {
        this.currentTutorialStep++;
        
        if (this.currentTutorialStep < this.tutorialSteps.length) {
            this.showTutorialStep(this.currentTutorialStep);
        } else {
            // End tutorial
            if (this.elements.tutorialOverlay) {
                this.elements.tutorialOverlay.classList.add('hidden');
            }
            gameState.settings.tutorialComplete = true;
            gameState.saveGame();
        }
    },
    
    // Show notification
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, duration);
    },
    
    // Change active view
    changeView(viewName) {
        const views = ['shopView', 'studioView', 'inventoryView', 'settingsView'];
        
        // Update active view in game state
        gameState.activeView = viewName;
        
        // Update navigation buttons
        this.elements.navButtons.forEach(button => {
            if (button.getAttribute('data-view') === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Hide all views
        views.forEach(view => {
            const element = document.getElementById(view);
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Show the selected view
        const activeView = document.getElementById(viewName);
        if (activeView) {
            activeView.classList.remove('hidden');
        }
        
        // Update content for the view
        this.updateViewContent(viewName);
    },
    
    // Change active tab
    changeTab(tabName) {
        // Update active tab in game state
        gameState.activeTab = tabName;
        
        // Update tab buttons
        this.elements.tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Get all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show the selected tab content
        const activeTabContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
        if (activeTabContent) {
            activeTabContent.classList.remove('hidden');
        }
    },
    
    // Update view-specific content
    updateViewContent(viewName) {
        switch (viewName) {
            case 'shopView':
                this.renderShopDisplays();
                this.renderCustomers();
                break;
            case 'studioView':
                this.renderProductSelector();
                this.renderColorPalette();
                break;
            case 'inventoryView':
                this.renderInventory();
                break;
            case 'settingsView':
                this.updateSettingsUI();
                break;
        }
    },
    
    // Update coins display
    updateCoinsDisplay() {
        if (this.elements.coinDisplay) {
            this.elements.coinDisplay.textContent = gameState.coins;
        }
    },
    
    // Update day display
    updateDayDisplay() {
        if (this.elements.dayDisplay) {
            this.elements.dayDisplay.textContent = gameState.day;
        }
    },
    
    // Update theme
    updateTheme() {
        document.body.setAttribute('data-theme', gameState.settings.theme);
        
        // Update theme buttons
        this.elements.themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === gameState.settings.theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },
    
    // Change theme
    changeTheme(theme) {
        gameState.settings.theme = theme;
        this.updateTheme();
        gameState.saveGame();
    },
    
    // Update settings UI
    updateSettingsUI() {
        // Update volume sliders
        if (this.elements.musicVolumeSlider) {
            this.elements.musicVolumeSlider.value = gameState.settings.musicVolume;
        }
        
        if (this.elements.sfxVolumeSlider) {
            this.elements.sfxVolumeSlider.value = gameState.settings.sfxVolume;
        }
    },
    
    // Render shop displays
    renderShopDisplays() {
        const displaysContainer = this.elements.shopDisplays;
        if (!displaysContainer) return;
        
        displaysContainer.innerHTML = '';
        
        gameState.shopDisplays.forEach(display => {
            const displayElement = document.createElement('div');
            displayElement.className = 'shop-display';
            displayElement.setAttribute('data-id', display.id);
            
            if (display.filled && display.productId) {
                // Find the product in inventory
                const product = gameState.inventory.find(p => p.id === display.productId);
                
                if (product) {
                    displayElement.classList.add('filled');
                    displayElement.innerHTML = `
                        <div class="display-product" data-product-id="${product.id}">
                            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
                            <div class="product-overlay">
                                <div class="product-name">${product.name}</div>
                                <div class="product-price">${product.price} coins</div>
                            </div>
                        </div>
                        <button class="remove-button" data-display-id="${display.id}">×</button>
                    `;
                } else {
                    // Product not found in inventory, reset display
                    displayElement.innerHTML = '<div class="empty-display">Empty Display</div>';
                    gameState.removeFromDisplay(display.id);
                }
            } else {
                // Empty display
                displayElement.innerHTML = '<div class="empty-display">Empty Display</div>';
            }
            
            // Add drop functionality for products
            displayElement.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!display.filled) {
                    displayElement.classList.add('drag-over');
                }
            });
            
            displayElement.addEventListener('dragleave', () => {
                displayElement.classList.remove('drag-over');
            });
            
            displayElement.addEventListener('drop', (e) => {
                e.preventDefault();
                displayElement.classList.remove('drag-over');
                
                const productId = e.dataTransfer.getData('product-id');
                if (productId && !display.filled) {
                    this.displayProduct(productId, display.id);
                }
            });
            
            // Add remove button event
            const removeButton = displayElement.querySelector('.remove-button');
            if (removeButton) {
                removeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const displayId = removeButton.getAttribute('data-display-id');
                    gameState.removeFromDisplay(displayId);
                    this.renderShopDisplays();
                });
            }
            
            displaysContainer.appendChild(displayElement);
        });
    },
    
    // Render customers
    renderCustomers() {
        const customerArea = this.elements.customerArea;
        if (!customerArea) return;
        
        customerArea.innerHTML = '';
        
        gameState.activeCustomers.forEach(customer => {
            const customerElement = document.createElement('div');
            customerElement.className = 'customer';
            customerElement.setAttribute('data-id', customer.id);
            
            // Calculate remaining patience (as a percentage)
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
                this.showCustomerPreferences(customer);
            });
            
            customerArea.appendChild(customerElement);
        });
        
        // If no customers, show a message
        if (gameState.activeCustomers.length === 0) {
            customerArea.innerHTML = '<div class="no-customers">No customers right now. Try adding more products to your displays!</div>';
        }
    },
    
    // Show customer preferences
    showCustomerPreferences(customer) {
        const modal = document.createElement('div');
        modal.className = 'modal customer-modal';
        
        // Get displayed products
        const displayedProducts = gameState.getDisplayedProducts();
        
        // Calculate interest for each product
        const productInterest = displayedProducts.map(item => {
            const interest = gameState.calculateCustomerInterest(customer, item.product);
            return {
                ...item,
                interest
            };
        }).sort((a, b) => b.interest - a.interest);
        
        // Create product list HTML
        let productsHTML = '';
        productInterest.forEach(item => {
            const interestClass = item.interest > 70 ? 'high-interest' : 
                                  item.interest > 40 ? 'medium-interest' : 'low-interest';
            
            productsHTML += `
                <div class="preference-product ${interestClass}" data-display-id="${item.displayId}" data-product-id="${item.product.id}">
                    <img src="${item.product.imageUrl}" alt="${item.product.name}" class="product-image">
                    <div class="product-details">
                        <div class="product-name">${item.product.name}</div>
                        <div class="product-price">${item.product.price} coins</div>
                        <div class="interest-bar" title="${item.interest}% interest">
                            <div class="interest-fill" style="width: ${item.interest}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (productsHTML === '') {
            productsHTML = '<p>I don\'t see anything I like yet. Maybe display some products in your shop?</p>';
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)} Customer</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="customer-info">
                        <img src="${customer.avatar}" alt="${customer.type}" class="customer-avatar">
                        <div class="customer-details">
                            <p>Budget: ${customer.budget} coins</p>
                            <p>Looking for: ${customer.preferences.products.map(p => {
                                const template = gameState.getProductTemplate(p);
                                return template ? template.name : p;
                            }).join(', ')}</p>
                        </div>
                    </div>
                    <h4>What I think of your products:</h4>
                    <div class="preference-products">
                        ${productsHTML}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for product selection
        modal.querySelectorAll('.preference-product').forEach(product => {
            product.addEventListener('click', () => {
                const productId = product.getAttribute('data-product-id');
                const displayId = product.getAttribute('data-display-id');
                const selectedProduct = gameState.inventory.find(p => p.id === productId);
                
                if (selectedProduct) {
                    // Check if customer can afford it
                    if (selectedProduct.price <= customer.budget) {
                        // Sell the product
                        if (gameState.sellProduct(productId, selectedProduct.price)) {
                            this.showNotification(`Sold ${selectedProduct.name} for ${selectedProduct.price} coins!`);
                            this.updateCoinsDisplay();
                            this.renderShopDisplays();
                            
                            // Remove customer from active customers
                            gameState.activeCustomers = gameState.activeCustomers.filter(c => c.id !== customer.id);
                            this.renderCustomers();
                            
                            // Close modal
                            document.body.removeChild(modal);
                        }
                    } else {
                        this.showNotification("That's too expensive for this customer!");
                    }
                }
            });
        });
        
        // Add close button event
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.body.appendChild(modal);
    },
    
    // Generate customers
    generateCustomers() {
        // Clear existing customers
        gameState.activeCustomers = [];
        
        // Calculate how many customers based on display count
        const filledDisplays = gameState.shopDisplays.filter(d => d.filled).length;
        const maxCustomers = Math.min(3, Math.max(1, Math.floor(filledDisplays / 2)));
        
        // Generate customers
        for (let i = 0; i < maxCustomers; i++) {
            gameState.generateCustomer();
        }
        
        this.renderCustomers();
    },
    
    // Render product selector in studio
    renderProductSelector() {
        const selector = this.elements.productSelector;
        if (!selector) return;
        
        selector.innerHTML = '';
        
        // Add an option for each product template
        productTemplates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            selector.appendChild(option);
        });
        
        // Select the first product by default if none selected
        if (!this.canvasState.selectedProduct) {
            this.selectProduct(productTemplates[0].id);
        }
    },
    
    // Render color palette
    renderColorPalette() {
        const palette = this.elements.colorPalette;
        if (!palette) return;
        
        palette.innerHTML = '';
        
        // Add a swatch for each color
        colorPalette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.setAttribute('data-color', color);
            
            if (color === this.canvasState.currentColor) {
                swatch.classList.add('selected');
            }
            
            palette.appendChild(swatch);
        });
    },
    
    // Select a product for the studio
    selectProduct(productId) {
        const template = gameState.getProductTemplate(productId);
        if (!template) return;
        
        this.canvasState.selectedProduct = template;
        
        // Show product template on canvas background
        const productPreview = document.getElementById('productPreview');
        if (productPreview) {
            productPreview.innerHTML = `
                <img src="${template.image}" alt="${template.name}" class="product-template">
                <div class="art-area" style="
                    left: ${template.artPosition.x}px;
                    top: ${template.artPosition.y}px;
                    width: ${template.artPosition.width}px;
                    height: ${template.artPosition.height}px;
                    transform: rotate(${template.artPosition.rotation}deg);
                "></div>
            `;
        }
        
        // Clear canvas
        this.clearCanvas();
    },
    
    // Select a color for drawing
    selectColor(color) {
        this.canvasState.currentColor = color;
        
        // Update selected swatch in the UI
        const swatches = document.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            if (swatch.getAttribute('data-color') === color) {
                swatch.classList.add('selected');
            } else {
                swatch.classList.remove('selected');
            }
        });
    },
    
    // Clear the canvas
    clearCanvas() {
        const canvas = this.elements.canvas;
        if (!canvas) return;
        
        const ctx = this.canvasState.ctx;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    
    // Start drawing on canvas
    startDrawing(event) {
        const canvas = this.elements.canvas;
        if (!canvas) return;
        
        this.canvasState.isDrawing = true;
        
        const rect = canvas.getBoundingClientRect();
        this.canvasState.lastX = event.clientX - rect.left;
        this.canvasState.lastY = event.clientY - rect.top;
    },
    
    // Draw on canvas
    draw(event) {
        if (!this.canvasState.isDrawing) return;
        
        const canvas = this.elements.canvas;
        if (!canvas) return;
        
        const ctx = this.canvasState.ctx;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ctx.beginPath();
        ctx.strokeStyle = this.canvasState.currentColor;
        ctx.lineWidth = this.canvasState.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.moveTo(this.canvasState.lastX, this.canvasState.lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        this.canvasState.lastX = x;
        this.canvasState.lastY = y;
    },
    
    // Stop drawing
    stopDrawing() {
        this.canvasState.isDrawing = false;
    },
    
    // Save artwork and create product
    saveArtwork() {
        const canvas = this.elements.canvas;
        if (!canvas || !this.canvasState.selectedProduct) return;
        
        // Get the art data URL
        this.canvasState.artDataUrl = canvas.toDataURL('image/png');
        
        // Calculate price based on template
        const basePrice = this.canvasState.selectedProduct.basePrice;
        const price = basePrice + Math.floor(Math.random() * 10) + 5; // Random additional value
        
        // Create the product
        const newProduct = {
            templateId: this.canvasState.selectedProduct.id,
            name: `${this.canvasState.selectedProduct.name} with Custom Art`,
            price: price,
            imageUrl: this.canvasState.selectedProduct.image,
            artUrl: this.canvasState.artDataUrl
        };
        
        // Add to inventory
        const addedProduct = gameState.addToInventory(newProduct);
        
        if (addedProduct) {
            this.showNotification(`Created new ${this.canvasState.selectedProduct.name}!`);
            
            // Clear canvas
            this.clearCanvas();
            
            // Show product preview
            this.showProductPreview(addedProduct);
        }
    },
    
    // Show product preview modal
    showProductPreview(product) {
        const modal = document.createElement('div');
        modal.className = 'modal product-preview-modal';
        
        const template = gameState.getProductTemplate(product.templateId);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Product Created!</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="product-preview">
                        <div class="product-image-container">
                            <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                            <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                                left: ${template.artPosition.x}px;
                                top: ${template.artPosition.y}px;
                                width: ${template.artPosition.width}px;
                                height: ${template.artPosition.height}px;
                                transform: rotate(${template.artPosition.rotation}deg);
                            ">
                        </div>
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>Price: ${product.price} coins</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="view-inventory-button">View in Inventory</button>
                        <button class="create-another-button">Create Another</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add close button event
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Add view inventory button event
        modal.querySelector('.view-inventory-button').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.changeView('inventoryView');
        });
        
        // Add create another button event
        modal.querySelector('.create-another-button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.body.appendChild(modal);
    },
    
    // Render inventory
    renderInventory() {
        const inventoryContainer = this.elements.inventoryItems;
        if (!inventoryContainer) return;
        
        inventoryContainer.innerHTML = '';
        
        if (gameState.inventory.length === 0) {
            inventoryContainer.innerHTML = '<div class="empty-inventory">Your inventory is empty. Create some products in the Studio!</div>';
            return;
        }
        
        gameState.inventory.forEach(product => {
            const template = gameState.getProductTemplate(product.templateId);
            
            const productElement = document.createElement('div');
            productElement.className = 'inventory-item';
            productElement.setAttribute('data-id', product.id);
            productElement.setAttribute('draggable', 'true');
            
            if (product.displayed) {
                productElement.classList.add('displayed');
            }
            
            productElement.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                    <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                        left: ${template.artPosition.x / 2}px;
                        top: ${template.artPosition.y / 2}px;
                        width: ${template.artPosition.width / 2}px;
                        height: ${template.artPosition.height / 2}px;
                        transform: rotate(${template.artPosition.rotation}deg);
                    ">
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
            
            // Add drag event
            productElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('product-id', product.id);
            });
            
            // Add display button event
            const displayButton = productElement.querySelector('.display-button');
            if (displayButton) {
                displayButton.addEventListener('click', () => {
                    this.showDisplaySelection(product.id);
                });
            }
            
            inventoryContainer.appendChild(productElement);
        });
    },
    
    // Show display selection for a product
    showDisplaySelection(productId) {
        // Check if there are any empty displays
        const emptyDisplays = gameState.shopDisplays.filter(d => !d.filled);
        
        if (emptyDisplays.length === 0) {
            this.showNotification('All display spots are full! Remove something first.');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal display-selection-modal';
        
        let displaysHTML = '';
        emptyDisplays.forEach(display => {
            displaysHTML += `
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
                        ${displaysHTML}
                    </div>
                </div>
            </div>
        `;
        
        // Add display selection events
        modal.querySelectorAll('.display-option').forEach(option => {
            option.addEventListener('click', () => {
                const displayId = option.getAttribute('data-display-id');
                this.displayProduct(productId, displayId);
                document.body.removeChild(modal);
            });
        });
        
        // Add close button event
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.body.appendChild(modal);
    },
    
    // Display a product
    displayProduct(productId, displayId) {
        if (gameState.displayProduct(productId, displayId)) {
            this.showNotification('Product added to display!');
            this.renderShopDisplays();
            this.renderInventory();
            
            // Generate new customers if we have few or none
            if (gameState.activeCustomers.length < 2) {
                this.generateCustomers();
            }
        } else {
            this.showNotification('Failed to display product');
        }
    },
    
    // Start a new day
    startNewDay() {
        const newDay = gameState.startNewDay();
        this.updateDayDisplay();
        this.generateCustomers();
        this.showNotification(`Day ${newDay} has begun!`);
    },
    
    // Save game
    saveGame() {
        if (gameState.saveGame()) {
            this.showNotification('Game saved successfully!');
        } else {
            this.showNotification('Failed to save game');
        }
    },
    
    // Update all UI elements
    updateAllUI() {
        this.updateCoinsDisplay();
        this.updateDayDisplay();
        this.updateTheme();
        this.renderShopDisplays();
        this.renderCustomers();
        this.renderInventory();
    }
};
