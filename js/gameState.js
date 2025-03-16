/**
 * Game State Management for Cozy Artist Shop
 * Handles game data, saving/loading, and game mechanics
 */

const GameState = {
    // Game data
    data: {
        coins: 100,
        day: 1,
        inventory: [],
        shopDisplays: [],
        activeCustomers: [],
        customersServed: 0,
        customerPreferences: {
            popular: ['mug', 'tote'],
            colors: ['#FF5252', '#4CAF50']
        },
        settings: {
            theme: 'pastel',
            musicVolume: 50,
            sfxVolume: 70,
            tutorialComplete: false
        }
    },
    
    // Constants and reference data
    constants: {
        SAVE_KEY: 'cozyArtistShopSave',
        MAX_CUSTOMERS: 3,
        MAX_DISPLAYS: 6,
        CUSTOMER_SPAWN_INTERVAL: 30000 // 30 seconds
    },
    
    // Track timers and intervals
    timers: {
        customerSpawn: null,
        customerPatience: {}
    },
    
    /**
     * Initialize the game state
     * Sets up initial data and loads any saved game
     */
    init() {
        try {
            // Try to load saved game
            const loaded = this.loadGame();
            
            // If no saved game, initialize shop displays
            if (!loaded) {
                this.initializeShopDisplays();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize game state:', error);
            Utils.showError('Failed to initialize game state: ' + error.message);
            return false;
        }
    },
    
    /**
     * Initialize shop displays
     * Creates empty display spots
     */
    initializeShopDisplays() {
        // Create display spots (default to 6)
        this.data.shopDisplays = Array(this.constants.MAX_DISPLAYS).fill(null).map((_, i) => ({
            id: `display-${i}`,
            productId: null,
            filled: false
        }));
    },
    
    /**
     * Save game to localStorage
     * @returns {boolean} Success status
     */
    saveGame() {
        try {
            if (!Utils.isLocalStorageAvailable()) {
                console.warn('localStorage is not available, game progress won\'t be saved');
                return false;
            }
            
            const saveData = {
                coins: this.data.coins,
                day: this.data.day,
                inventory: this.data.inventory,
                shopDisplays: this.data.shopDisplays,
                customersServed: this.data.customersServed,
                customerPreferences: this.data.customerPreferences,
                settings: this.data.settings
            };
            
            localStorage.setItem(this.constants.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    },
    
    /**
     * Load game from localStorage
     * @returns {boolean} Whether a game was loaded
     */
    loadGame() {
        try {
            if (!Utils.isLocalStorageAvailable()) {
                console.warn('localStorage is not available, cannot load saved game');
                return false;
            }
            
            const savedData = localStorage.getItem(this.constants.SAVE_KEY);
            
            if (!savedData) {
                return false; // No saved game
            }
            
            const parsedData = Utils.safeJSONParse(savedData, null);
            
            if (!parsedData) {
                return false; // Invalid save data
            }
            
            // Update game state with saved data
            this.data.coins = parsedData.coins ?? 100;
            this.data.day = parsedData.day ?? 1;
            this.data.inventory = parsedData.inventory ?? [];
            this.data.shopDisplays = parsedData.shopDisplays ?? [];
            this.data.customersServed = parsedData.customersServed ?? 0;
            
            if (parsedData.customerPreferences) {
                this.data.customerPreferences = parsedData.customerPreferences;
            }
            
            if (parsedData.settings) {
                this.data.settings = {
                    ...this.data.settings,
                    ...parsedData.settings
                };
            }
            
            // If shop displays weren't saved or are invalid, initialize them
            if (!this.data.shopDisplays.length) {
                this.initializeShopDisplays();
            }
            
            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    },
    
    /**
     * Reset game to initial state
     * @returns {boolean} Success status
     */
    resetGame() {
        try {
            // Reset to initial values
            this.data.coins = 100;
            this.data.day = 1;
            this.data.inventory = [];
            this.data.shopDisplays = [];
            this.data.activeCustomers = [];
            this.data.customersServed = 0;
            this.data.customerPreferences = {
                popular: ['mug', 'tote'],
                colors: ['#FF5252', '#4CAF50']
            };
            this.data.settings.tutorialComplete = false;
            
            // Re-initialize displays
            this.initializeShopDisplays();
            
            // Clear any active timers
            this.clearAllTimers();
            
            // Clear saved data
            if (Utils.isLocalStorageAvailable()) {
                localStorage.removeItem(this.constants.SAVE_KEY);
            }
            
            return true;
        } catch (error) {
            console.error('Failed to reset game:', error);
            return false;
        }
    },
    
    /**
     * Add a created product to inventory
     * @param {Object} product - The product to add
     * @returns {Object} The added product with ID
     */
    addToInventory(product) {
        try {
            // Generate a unique ID for the product
            const productId = Utils.generateId('product');
            
            const newProduct = {
                id: productId,
                templateId: product.templateId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                artUrl: product.artUrl,
                created: new Date().toISOString(),
                displayed: false
            };
            
            this.data.inventory.push(newProduct);
            this.saveGame();
            return newProduct;
        } catch (error) {
            console.error('Failed to add product to inventory:', error);
            return null;
        }
    },
    
    /**
     * Display a product in the shop
     * @param {string} productId - The product ID
     * @param {string} displayId - The display ID
     * @returns {boolean} Success status
     */
    displayProduct(productId, displayId) {
        try {
            // Find the product in inventory
            const productIndex = this.data.inventory.findIndex(p => p.id === productId);
            if (productIndex === -1) return false;
            
            // Find the display spot
            const displayIndex = this.data.shopDisplays.findIndex(d => d.id === displayId);
            if (displayIndex === -1) return false;
            
            // Update the display with the product
            this.data.shopDisplays[displayIndex] = {
                ...this.data.shopDisplays[displayIndex],
                productId,
                filled: true
            };
            
            // Mark the product as displayed
            this.data.inventory[productIndex].displayed = true;
            
            this.saveGame();
            return true;
        } catch (error) {
            console.error('Failed to display product:', error);
            return false;
        }
    },
    
    /**
     * Remove a product from display
     * @param {string} displayId - The display ID
     * @returns {boolean} Success status
     */
    removeFromDisplay(displayId) {
        try {
            // Find the display spot
            const displayIndex = this.data.shopDisplays.findIndex(d => d.id === displayId);
            if (displayIndex === -1) return false;
            
            // Get the product ID before removing it
            const productId = this.data.shopDisplays[displayIndex].productId;
            
            // Update the display to be empty
            this.data.shopDisplays[displayIndex] = {
                ...this.data.shopDisplays[displayIndex],
                productId: null,
                filled: false
            };
            
            // If we had a product, mark it as not displayed
            if (productId) {
                const productIndex = this.data.inventory.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    this.data.inventory[productIndex].displayed = false;
                }
            }
            
            this.saveGame();
            return true;
        } catch (error) {
            console.error('Failed to remove product from display:', error);
            return false;
        }
    },
    
    /**
     * Sell a product to a customer
     * @param {string} productId - The product ID
     * @param {number} price - The selling price
     * @returns {boolean} Success status
     */
    sellProduct(productId, price) {
        try {
            // Find the product in inventory
            const productIndex = this.data.inventory.findIndex(p => p.id === productId);
            if (productIndex === -1) return false;
            
            // Find if it's on display
            const displayIndex = this.data.shopDisplays.findIndex(d => d.productId === productId);
            
            // Remove from display if it was displayed
            if (displayIndex !== -1) {
                this.data.shopDisplays[displayIndex] = {
                    ...this.data.shopDisplays[displayIndex],
                    productId: null,
                    filled: false
                };
            }
            
            // Add coins
            this.data.coins += price;
            
            // Remove from inventory
            this.data.inventory.splice(productIndex, 1);
            
            // Increment customers served
            this.data.customersServed++;
            
            this.saveGame();
            return true;
        } catch (error) {
            console.error('Failed to sell product:', error);
            return false;
        }
    },
    
    /**
     * Start a new day
     * @returns {number} The new day number
     */
    startNewDay() {
        try {
            this.data.day += 1;
            
            // Clear active customers
            this.data.activeCustomers = [];
            this.clearAllTimers();
            
            // Update customer preferences to keep the game interesting
            const randomColor = ProductData.colorPalette[Math.floor(Math.random() * ProductData.colorPalette.length)];
            const randomProduct = ProductData.templates[Math.floor(Math.random() * ProductData.templates.length)].id;
            
            this.data.customerPreferences = {
                popular: [randomProduct, this.data.customerPreferences.popular[0]],
                colors: [randomColor, this.data.customerPreferences.colors[0]]
            };
            
            this.saveGame();
            return this.data.day;
        } catch (error) {
            console.error('Failed to start new day:', error);
            return this.data.day;
        }
    },
    
    /**
     * Generate a customer with preferences
     * @returns {Object} The generated customer
     */
    generateCustomer() {
        try {
            // Don't generate more than MAX_CUSTOMERS
            if (this.data.activeCustomers.length >= this.constants.MAX_CUSTOMERS) {
                return null;
            }
            
            // Select a random customer type
            const customerType = Utils.randomItem(CustomerData.types);
            
            // Create the customer
            const customerId = Utils.generateId('customer');
            const customer = {
                id: customerId,
                type: customerType.type,
                avatar: customerType.avatar,
                preferences: customerType.preferences,
                budget: Utils.randomNumber(customerType.budget.min, customerType.budget.max),
                patience: customerType.patience,
                enteredAt: Date.now(),
                satisfied: false
            };
            
            this.data.activeCustomers.push(customer);
            
            // Set up patience timer for this customer
            this.timers.customerPatience[customerId] = setTimeout(() => {
                this.customerLeaves(customerId, false);
            }, customer.patience * 1000);
            
            return customer;
        } catch (error) {
            console.error('Failed to generate customer:', error);
            return null;
        }
    },
    
    /**
     * Handle a customer leaving
     * @param {string} customerId - The customer ID
     * @param {boolean} satisfied - Whether they were satisfied
     */
    customerLeaves(customerId, satisfied = false) {
        try {
            // Find customer
            const customerIndex = this.data.activeCustomers.findIndex(c => c.id === customerId);
            if (customerIndex === -1) return;
            
            // If they were satisfied, count them
            if (satisfied) {
                this.data.customersServed++;
            }
            
            // Remove from active customers
            this.data.activeCustomers.splice(customerIndex, 1);
            
            // Clear their timer
            if (this.timers.customerPatience[customerId]) {
                clearTimeout(this.timers.customerPatience[customerId]);
                delete this.timers.customerPatience[customerId];
            }
        } catch (error) {
            console.error('Error handling customer leaving:', error);
        }
    },
    
    /**
     * Start spawning customers periodically
     */
    startCustomerSpawning() {
        this.stopCustomerSpawning();
        
        this.timers.customerSpawn = setInterval(() => {
            // Only spawn if we have room and products on display
            const filledDisplays = this.data.shopDisplays.filter(d => d.filled).length;
            if (filledDisplays > 0 && this.data.activeCustomers.length < this.constants.MAX_CUSTOMERS) {
                this.generateCustomer();
                
                // Notify UI to update
                if (typeof UI !== 'undefined') {
                    UI.renderCustomers();
                }
            }
        }, this.constants.CUSTOMER_SPAWN_INTERVAL);
    },
    
    /**
     * Stop spawning customers
     */
    stopCustomerSpawning() {
        if (this.timers.customerSpawn) {
            clearInterval(this.timers.customerSpawn);
            this.timers.customerSpawn = null;
        }
    },
    
    /**
     * Clear all active timers
     */
    clearAllTimers() {
        this.stopCustomerSpawning();
        
        // Clear all customer patience timers
        Object.keys(this.timers.customerPatience).forEach(customerId => {
            clearTimeout(this.timers.customerPatience[customerId]);
            delete this.timers.customerPatience[customerId];
        });
    },
    
    /**
     * Get a product template by ID
     * @param {string} templateId - The template ID
     * @returns {Object} The product template
     */
    getProductTemplate(templateId) {
        return ProductData.templates.find(p => p.id === templateId);
    },
    
    /**
     * Get all products currently on display
     * @returns {Array} Array of displayed products with their display IDs
     */
    getDisplayedProducts() {
        return this.data.shopDisplays
            .filter(display => display.filled)
            .map(display => {
                const product = this.data.inventory.find(p => p.id === display.productId);
                return {
                    displayId: display.id,
                    product: product
                };
            });
    },
    
    /**
     * Calculate customer interest in a product
     * @param {Object} customer - The customer
     * @param {Object} product - The product
     * @returns {number} Interest level (0-100)
     */
    calculateCustomerInterest(customer, product) {
        try {
            let interest = 0;
            
            // Base interest if the product type matches preference
            const template = this.getProductTemplate(product.templateId);
            if (customer.preferences.products.includes(template.id)) {
                interest += 30;
            }
            
            // Add interest if the product uses colors they like
            // For now, use a random factor
            interest += Utils.randomNumber(10, 40);
            
            // Reduce interest if price is above budget
            if (product.price > customer.budget) {
                interest -= (product.price - customer.budget) * 5;
            }
            
            return Math.max(0, Math.min(100, interest));
        } catch (error) {
            console.error('Error calculating customer interest:', error);
            return 0;
        }
    }
};

/**
 * Product Data
 * Contains templates and color information
 */
const ProductData = {
    // Product templates with art positioning
    templates: [
        { 
            id: 'mug',
            name: 'Mug', 
            basePrice: 8,
            image: 'assets/images/products/mug.png',
            artPosition: { x: 70, y: 70, width: 120, height: 120, rotation: 0 }
        },
        { 
            id: 'tote',
            name: 'Tote Bag', 
            basePrice: 12,
            image: 'assets/images/products/tote.png',
            artPosition: { x: 60, y: 50, width: 140, height: 140, rotation: 0 }
        },
        { 
            id: 'shirt',
            name: 'T-Shirt', 
            basePrice: 15,
            image: 'assets/images/products/tshirt.png',
            artPosition: { x: 75, y: 60, width: 110, height: 110, rotation: 0 }
        },
        { 
            id: 'poster',
            name: 'Poster', 
            basePrice: 10,
            image: 'assets/images/products/poster.png',
            artPosition: { x: 40, y: 40, width: 180, height: 180, rotation: 0 }
        }
    ],
    
    // Color palette for the painting canvas
    colorPalette: [
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
    ]
};

/**
 * Customer Data
 * Contains customer types and preferences
 */
const CustomerData = {
    // Customer types
    types: [
        {
            type: 'trendy',
            avatar: 'assets/images/customers/trendy.png',
            preferences: {
                products: ['tote', 'shirt'],
                colors: ['#FF5252', '#9C27B0', '#F06292']
            },
            budget: { min: 15, max: 25 },
            patience: 15 // seconds
        },
        {
            type: 'artsy',
            avatar: 'assets/images/customers/artsy.png',
            preferences: {
                products: ['poster', 'mug'],
                colors: ['#2196F3', '#4CAF50', '#607D8B']
            },
            budget: { min: 10, max: 20 },
            patience: 20 // seconds
        },
        {
            type: 'casual',
            avatar: 'assets/images/customers/casual.png',
            preferences: {
                products: ['mug', 'tote', 'shirt', 'poster'],
                colors: ['#FF9800', '#FFEB3B', '#795548']
            },
            budget: { min: 8, max: 18 },
            patience: 12 // seconds
        }
    ]
};

// For backward compatibility with the old code
const gameState = GameState;
