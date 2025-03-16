/**
 * UI Controller for Cozy Artist Shop
 * Handles UI rendering and user interaction
 */

const UI = {
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
            // Set up event listeners
            this.setupEventListeners();
            
            // Show loading screen
            this.showLoading();
            
            // Initialize UI state
            this.updateCoinDisplay();
            this.updateDayDisplay();
            this.updateTheme();
            
            return true;
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            Utils.showError('Failed to initialize UI: ' + error.message);
            return false;
        }
    },
    
    /**
     * Show loading screen with progress
     */
    showLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;
        
        loadingScreen.classList.remove('hidden');
        
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
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.remove('hidden');
        }
    },
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation buttons
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.getAttribute('data-view');
                this.changeView(view);
            });
        });
        
        // Theme buttons
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.getAttribute('data-theme');
                this.changeTheme(theme);
            });
        });
        
        // Next day button
        const nextDayButton = document.getElementById('nextDayButton');
        if (nextDayButton) {
            nextDayButton.addEventListener('click', () => {
                this.startNewDay();
            });
        }
        
        // Settings buttons
        const saveGameButton = document.getElementById('saveGameButton');
        if (saveGameButton) {
            saveGameButton.addEventListener('click', () => {
                if (gameState.saveGame()) {
                    Utils.showNotification('Game saved!');
                } else {
                    Utils.showNotification('Failed to save game');
                }
            });
        }
        
        const resetGameButton = document.getElementById('resetGameButton');
        if (resetGameButton) {
            resetGameButton.addEventListener('click', () => {
                Utils.createModal({
                    title: 'Reset Game',
                    content: 'Are you sure you want to reset the game? All progress will be lost.',
                    buttons: [
                        {
                            text: 'Cancel',
                            type: 'secondary-button',
                            action: 'cancel'
                        },
                        {
                            text: 'Reset Game',
                            type: 'danger-button',
                            action: 'reset',
                            onClick: () => {
                                if (gameState.resetGame()) {
                                    Utils.showNotification('Game reset successfully');
                                    this.updateAllUI();
                                    
                                    // Show tutorial again
                                    this.showTutorial();
                                } else {
                                    Utils.showNotification('Failed to reset game');
                                }
                            }
                        }
                    ]
                });
            });
        }
        
        const showTutorialButton = document.getElementById('showTutorialButton');
        if (showTutorialButton) {
            showTutorialButton.addEventListener('click', () => {
                this.showTutorial();
            });
        }
        
        // Tutorial navigation
        const tutorialNextButton = document.getElementById('tutorialNextButton');
        if (tutorialNextButton) {
            tutorialNextButton.addEventListener('click', () => {
                this.showNextTutorialStep();
            });
        }
        
        const tutorialPrevButton = document.getElementById('tutorialPrevButton');
        if (tutorialPrevButton) {
            tutorialPrevButton.addEventListener('click', () => {
                this.showPreviousTutorialStep();
            });
        }
        
        // Error screen retry button
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Volume sliders
        const musicVolume = document.getElementById('musicVolume');
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                gameState.data.settings.musicVolume = parseInt(e.target.value);
                gameState.saveGame();
            });
        }
        
        const sfxVolume = document.getElementById('sfxVolume');
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                gameState.data.settings.sfxVolume = parseInt(e.target.value);
                gameState.saveGame();
            });
        }
    },
    
    /**
     * Start the game after loading
     */
    startGame() {
        // Show tutorial if it's first time
        if (!gameState.data.settings.tutorialComplete) {
            this.showTutorial();
        }
        
        // Render initial UI
        this.renderShopDisplays();
        this.renderInventory();
        
        // Generate initial customers
        Customers.generateInitialCustomers();
        this.renderCustomers();
        
        // Start animation loop
        this.startAnimationLoop();
    },
    
    /**
     * Start animation loop for updating UI elements
     */
    startAnimationLoop() {
        const updateUI = () => {
            // Update customer patience bars
            Customers.updateCustomerPatience();
            
            // Request next frame
            requestAnimationFrame(updateUI);
        };
        
        // Start the loop
        updateUI();
    },
    
    /**
     * Show tutorial overlay
     */
    showTutorial() {
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        if (!tutorialOverlay) return;
        
        this.currentTutorialStep = 0;
        this.updateTutorialStep();
        tutorialOverlay.classList.remove('hidden');
    },
    
    /**
     * Update tutorial step content
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
        if (tutorialProgress) tutorialProgress.textContent = `${this.currentTutorialStep + 1}/${this.tutorialSteps.length}`;
        
        // Toggle prev button visibility
        if (prevButton) {
            if (this.currentTutorialStep > 0) {
                prevButton.classList.remove('hidden');
            } else {
                prevButton.classList.add('hidden');
            }
        }
        
        // Update next button text
        if (nextButton) {
            if (this.currentTutorialStep === this.tutorialSteps.length - 1) {
                nextButton.textContent = 'Start Game';
            } else {
                nextButton.textContent = 'Next';
            }
        }
    },
    
    /**
     * Show next tutorial step
     */
    showNextTutorialStep() {
        this.currentTutorialStep++;
        
        if (this.currentTutorialStep < this.tutorialSteps.length) {
            this.updateTutorialStep();
        } else {
            // End tutorial
            const tutorialOverlay = document.getElementById('tutorialOverlay');
            if (tutorialOverlay) {
                tutorialOverlay.classList.add('hidden');
            }
            
            // Mark tutorial as completed
            gameState.data.settings.tutorialComplete = true;
            gameState.saveGame();
        }
    },
    
    /**
     * Show previous tutorial step
     */
    showPreviousTutorialStep() {
        if (this.currentTutorialStep > 0) {
            this.currentTutorialStep--;
            this.updateTutorialStep();
        }
    },
    
    /**
     * Change active view
     * @param {string} viewName - The view ID to show
     */
    changeView(viewName) {
        // Update nav buttons
        const navButtons = document.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            if (button.getAttribute('data-view') === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update views
        const views = document.querySelectorAll('.game-view');
        views.forEach(view => {
            if (view.id === viewName) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
        
        // Update content for the view
        this.updateViewContent(viewName);
    },
    
   /**
     * Update content for a specific view
     * @param {string} viewName - The view ID
     */
    updateViewContent(viewName) {
        switch (viewName) {
            case 'shopView':
                this.renderShopDisplays();
                this.renderCustomers();
                break;
            case 'studioView':
                Canvas.populateProductSelector();
                Canvas.populateColorPalette();
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
     * Update settings UI elements with current values
     */
    updateSettingsUI() {
        const musicVolume = document.getElementById('musicVolume');
        const sfxVolume = document.getElementById('sfxVolume');
        const themeButtons = document.querySelectorAll('.theme-button');
        
        if (musicVolume) musicVolume.value = gameState.data.settings.musicVolume;
        if (sfxVolume) sfxVolume.value = gameState.data.settings.sfxVolume;
        
        themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === gameState.data.settings.theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },
    
    /**
     * Update the coin display
     */
    updateCoinDisplay() {
        const coinDisplay = document.getElementById('coinDisplay');
        if (coinDisplay) {
            coinDisplay.textContent = Utils.formatNumber(gameState.data.coins);
        }
    },
    
    /**
     * Update the day display
     */
    updateDayDisplay() {
        const dayDisplay = document.getElementById('dayDisplay');
        if (dayDisplay) {
            dayDisplay.textContent = gameState.data.day;
        }
    },
    
    /**
     * Update theme
     */
    updateTheme() {
        document.body.setAttribute('data-theme', gameState.data.settings.theme);
        
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === gameState.data.settings.theme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },
    
    /**
     * Change theme
     * @param {string} theme - The theme name
     */
    changeTheme(theme) {
        gameState.data.settings.theme = theme;
        this.updateTheme();
        gameState.saveGame();
    },
    
    /**
     * Render shop displays
     */
    renderShopDisplays() {
        const shopDisplays = document.getElementById('shopDisplays');
        if (!shopDisplays) return;
        
        shopDisplays.innerHTML = '';
        
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
                                    left: ${template.artPosition.x / 3}px;
                                    top: ${template.artPosition.y / 3}px;
                                    width: ${template.artPosition.width / 3}px;
                                    height: ${template.artPosition.height / 3}px;
                                    transform: rotate(${template.artPosition.rotation}deg);
                                ">` : ''}
                            </div>
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
            
            // Add drop zone for drag and drop
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
                    if (gameState.displayProduct(productId, display.id)) {
                        Utils.showNotification('Product displayed!');
                        this.renderShopDisplays();
                        this.renderInventory();
                        
                        // Start customer spawning if this is the first product
                        const filledDisplays = gameState.data.shopDisplays.filter(d => d.filled).length;
                        if (filledDisplays === 1) {
                            gameState.startCustomerSpawning();
                        }
                        
                        // Generate a customer if we have none
                        if (gameState.data.activeCustomers.length === 0) {
                            Customers.generateInitialCustomers();
                            this.renderCustomers();
                        }
                    }
                }
            });
            
            // Add remove button event
            const removeButton = displayElement.querySelector('.remove-button');
            if (removeButton) {
                removeButton.addEventListener('click', e => {
                    e.stopPropagation();
                    const displayId = removeButton.getAttribute('data-display-id');
                    if (gameState.removeFromDisplay(displayId)) {
                        Utils.showNotification('Product removed from display');
                        this.renderShopDisplays();
                        this.renderInventory();
                    }
                });
            }
            
            shopDisplays.appendChild(displayElement);
        });
    },
    
    /**
     * Render customers
     */
    renderCustomers() {
        const customerArea = document.getElementById('customerArea');
        if (!customerArea) return;
        
        customerArea.innerHTML = '';
        
        if (gameState.data.activeCustomers.length === 0) {
            customerArea.innerHTML = '<div class="no-customers">No customers yet. Add products to your displays!</div>';
            return;
        }
        
        gameState.data.activeCustomers.forEach(customer => {
            const customerElement = document.createElement('div');
            customerElement.className = 'customer';
            customerElement.setAttribute('data-customer-id', customer.id);
            
            // Calculate patience percentage
            const timeElapsed = (Date.now() - customer.enteredAt) / 1000;
            const patiencePercentage = Math.max(0, Math.min(100, 100 - (timeElapsed / customer.patience * 100)));
            
            const speechText = this.getCustomerSpeechText(customer);
            
            customerElement.innerHTML = `
                <img src="${customer.avatar}" alt="${customer.type}" class="customer-avatar">
                <div class="customer-speech-bubble">
                    <p>${speechText}</p>
                </div>
                <div class="patience-bar">
                    <div class="patience-fill" style="width: ${patiencePercentage}%"></div>
                </div>
            `;
            
            // Add click handler to show customer preferences
            customerElement.addEventListener('click', () => {
                Customers.showPreferences(customer);
            });
            
            customerArea.appendChild(customerElement);
        });
    },
    
    /**
     * Get random speech text for a customer
     * @param {Object} customer - The customer object
     * @returns {string} A speech bubble text
     */
    getCustomerSpeechText(customer) {
        const speechOptions = [
            "I'm looking for something nice!",
            "Do you have anything I'd like?",
            "I want to buy something!",
            "Show me what you've got!",
            `I love ${customer.preferences.products[0]} designs!`
        ];
        
        return Utils.randomItem(speechOptions);
    },
    
    /**
     * Render inventory
     */
    renderInventory() {
        const inventoryItems = document.getElementById('inventoryItems');
        if (!inventoryItems) return;
        
        inventoryItems.innerHTML = '';
        
        if (gameState.data.inventory.length === 0) {
            inventoryItems.innerHTML = '<div class="empty-inventory">Your inventory is empty. Create products in the Studio!</div>';
            return;
        }
        
        gameState.data.inventory.forEach(product => {
            const template = gameState.getProductTemplate(product.templateId);
            if (!template) return;
            
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
                        left: ${template.artPosition.x / 2.5}px;
                        top: ${template.artPosition.y / 2.5}px;
                        width: ${template.artPosition.width / 2.5}px;
                        height: ${template.artPosition.height / 2.5}px;
                        transform: rotate(${template.artPosition.rotation}deg);
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
            
            inventoryItems.appendChild(itemElement);
        });
    },
    
    /**
     * Show display selection modal
     * @param {string} productId - The product ID to display
     */
    showDisplaySelection(productId) {
        // Check if there are any empty displays
        const emptyDisplays = gameState.data.shopDisplays.filter(d => !d.filled);
        
        if (emptyDisplays.length === 0) {
            Utils.showNotification('All display spots are full! Remove something first.');
            return;
        }
        
        // Create modal with display options
        Utils.createModal({
            title: 'Choose Display Location',
            content: `
                <p>Select where to display your product:</p>
                <div class="display-options">
                    ${emptyDisplays.map(display => `
                        <div class="display-option" data-display-id="${display.id}">
                            <div class="display-spot">Display Spot ${display.id.split('-')[1]}</div>
                        </div>
                    `).join('')}
                </div>
            `,
            buttons: []
        });
        
        // Add click handlers for display options
        document.querySelectorAll('.display-option').forEach(option => {
            option.addEventListener('click', () => {
                const displayId = option.getAttribute('data-display-id');
                if (gameState.displayProduct(productId, displayId)) {
                    Utils.showNotification('Product displayed!');
                    this.renderShopDisplays();
                    this.renderInventory();
                    
                    // Remove the modal
                    const modal = option.closest('.modal');
                    if (modal) document.body.removeChild(modal);
                    
                    // Start customer spawning if this is the first product
                    const filledDisplays = gameState.data.shopDisplays.filter(d => d.filled).length;
                    if (filledDisplays === 1) {
                        gameState.startCustomerSpawning();
                    }
                    
                    // Generate a customer if we have none
                    if (gameState.data.activeCustomers.length === 0) {
                        Customers.generateInitialCustomers();
                        this.renderCustomers();
                    }
                }
            });
        });
    },
    
    /**
     * Show product preview after creation
     * @param {Object} product - The newly created product
     */
    showProductPreview(product) {
        const template = gameState.getProductTemplate(product.templateId);
        if (!template) return;
        
        Utils.createModal({
            title: 'Product Created!',
            content: `
                <div class="product-preview">
                    <div class="product-image-container" style="width: 200px; height: 200px; margin: 0 auto;">
                        <img src="${product.imageUrl}" alt="${product.name}" class="product-base-image">
                        <img src="${product.artUrl}" alt="Custom Art" class="product-art-image" style="
                            left: ${template.artPosition.x / 1.5}px;
                            top: ${template.artPosition.y / 1.5}px;
                            width: ${template.artPosition.width / 1.5}px;
                            height: ${template.artPosition.height / 1.5}px;
                            transform: rotate(${template.artPosition.rotation}deg);
                        ">
                    </div>
                    <div class="product-info" style="text-align: center; margin-top: 1rem;">
                        <h4>${product.name}</h4>
                        <p>Price: ${product.price} coins</p>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Display in Shop',
                    type: 'accent-button',
                    action: 'display',
                    onClick: () => {
                        this.showDisplaySelection(product.id);
                    }
                },
                {
                    text: 'Add to Inventory',
                    type: 'secondary-button',
                    action: 'inventory'
                }
            ]
        });
    },
    
    /**
     * Start a new day
     */
    startNewDay() {
        const newDay = gameState.startNewDay();
        
        this.updateDayDisplay();
        
        // Generate new customers
        Customers.generateInitialCustomers();
        this.renderCustomers();
        
        Utils.showNotification(`Day ${newDay} has begun!`);
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
        
        Canvas.populateProductSelector();
        Canvas.populateColorPalette();
    }
};
