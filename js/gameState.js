/**
 * Game State Management for Cozy Artist Shop
 * Handles all game data, saving, and loading
 */

// Main game state object
const gameState = {
    // Player stats
    coins: 100,
    day: 1,
    
    // Collections
    inventory: [],
    shopDisplays: [],
    customerPreferences: {
        popular: ['mug', 'tote'],
        colors: ['#FF5252', '#4CAF50']
    },
    
    // Customer management
    activeCustomers: [],
    customersServed: 0,
    
    // Settings & status
    settings: {
        theme: 'pastel',
        musicVolume: 50,
        sfxVolume: 70,
        tutorialComplete: false
    },
    
    // Active view state
    activeView: 'shop',
    activeTab: 'create',
    
    // Initialize game state
    init() {
        this.loadGame();
        if (this.shopDisplays.length === 0) {
            this.initializeShopDisplays();
        }
        return this;
    },
    
    // Initialize shop displays
    initializeShopDisplays() {
        // Create 6 empty display spots
        this.shopDisplays = Array(6).fill(null).map((_, i) => ({
            id: `display-${i}`,
            productId: null,
            filled: false
        }));
    },
    
    // Save game to localStorage
    saveGame() {
        try {
            const saveData = {
                coins: this.coins,
                day: this.day,
                inventory: this.inventory,
                shopDisplays: this.shopDisplays,
                customerPreferences: this.customerPreferences,
                customersServed: this.customersServed,
                settings: this.settings
            };
            
            localStorage.setItem('cozyArtistShop', JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    },
    
    // Load game from localStorage
    loadGame() {
        try {
            const savedData = localStorage.getItem('cozyArtistShop');
            
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Update game state with saved data
                this.coins = parsedData.coins || 100;
                this.day = parsedData.day || 1;
                this.inventory = parsedData.inventory || [];
                this.shopDisplays = parsedData.shopDisplays || [];
                this.customerPreferences = parsedData.customerPreferences || {
                    popular: ['mug', 'tote'],
                    colors: ['#FF5252', '#4CAF50']
                };
                this.customersServed = parsedData.customersServed || 0;
                
                // Load settings with defaults for missing properties
                if (parsedData.settings) {
                    this.settings = {
                        ...this.settings,
                        ...parsedData.settings
                    };
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error loading game:', error);
            return false;
        }
    },
    
    // Reset game to initial state
    resetGame() {
        this.coins = 100;
        this.day = 1;
        this.inventory = [];
        this.shopDisplays = [];
        this.customerPreferences = {
            popular: ['mug', 'tote'],
            colors: ['#FF5252', '#4CAF50']
        };
        this.activeCustomers = [];
        this.customersServed = 0;
        this.settings.tutorialComplete = false;
        
        this.initializeShopDisplays();
        localStorage.removeItem('cozyArtistShop');
        return true;
    },
    
    // Add a created product to inventory
    addToInventory(product) {
        // Generate a unique ID for the product
        const productId = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
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
        
        this.inventory.push(newProduct);
        this.saveGame();
        return newProduct;
    },
    
    // Display a product in the shop
    displayProduct(productId, displayId) {
        // Find the product in inventory
        const productIndex = this.inventory.findIndex(p => p.id === productId);
        if (productIndex === -1) return false;
        
        // Find the display spot
        const displayIndex = this.shopDisplays.findIndex(d => d.id === displayId);
        if (displayIndex === -1) return false;
        
        // Update the display with the product
        this.shopDisplays[displayIndex] = {
            ...this.shopDisplays[displayIndex],
            productId,
            filled: true
        };
        
        // Mark the product as displayed
        this.inventory[productIndex].displayed = true;
        this.saveGame();
        
        return true;
    },
    
    // Remove a product from display
    removeFromDisplay(displayId) {
        // Find the display spot
        const displayIndex = this.shopDisplays.findIndex(d => d.id === displayId);
        if (displayIndex === -1) return false;
        
        // Get the product ID before removing it
        const productId = this.shopDisplays[displayIndex].productId;
        
        // Update the display to be empty
        this.shopDisplays[displayIndex] = {
            ...this.shopDisplays[displayIndex],
            productId: null,
            filled: false
        };
        
        // If we had a product, mark it as not displayed
        if (productId) {
            const productIndex = this.inventory.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                this.inventory[productIndex].displayed = false;
            }
        }
        
        this.saveGame();
        return true;
    },
    
    // Sell a product to a customer
    sellProduct(productId, price) {
        // Find the product in inventory
        const productIndex = this.inventory.findIndex(p => p.id === productId);
        if (productIndex === -1) return false;
        
        // Find if it's on display
        const displayIndex = this.shopDisplays.findIndex(d => d.productId === productId);
        
        // Remove from display if it was displayed
        if (displayIndex !== -1) {
            this.shopDisplays[displayIndex] = {
                ...this.shopDisplays[displayIndex],
                productId: null,
                filled: false
            };
        }
        
        // Add coins
        this.coins += price;
        
        // Remove from inventory
        this.inventory.splice(productIndex, 1);
        
        // Increment customers served
        this.customersServed++;
        
        this.saveGame();
        return true;
    },
    
    // Generate a customer with preferences
    generateCustomer() {
        // Select a random customer type
        const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
        
        // Create the customer
        const customer = {
            id: `customer-${Date.now()}`,
            type: customerType.type,
            avatar: customerType.avatar,
            preferences: customerType.preferences,
            budget: Math.floor(Math.random() * (customerType.budget.max - customerType.budget.min + 1)) + customerType.budget.min,
            patience: customerType.patience,
            enteredAt: Date.now(),
            satisfied: false
        };
        
        this.activeCustomers.push(customer);
        return customer;
    },
    
    // Start a new day
    startNewDay() {
        this.day += 1;
        
        // Clear active customers
        this.activeCustomers = [];
        
        // Update customer preferences to keep the game interesting
        const randomColor = colorPalette[Math.floor(Math.random() * (colorPalette.length - 1))];
        const randomProduct = productTemplates[Math.floor(Math.random() * productTemplates.length)].id;
        
        this.customerPreferences = {
            popular: [randomProduct, this.customerPreferences.popular[0]],
            colors: [randomColor, this.customerPreferences.colors[0]]
        };
        
        this.saveGame();
        return this.day;
    },
    
    // Get a product template by ID
    getProductTemplate(templateId) {
        return productTemplates.find(p => p.id === templateId);
    },
    
    // Get displayed products
    getDisplayedProducts() {
        return this.shopDisplays
            .filter(display => display.filled)
            .map(display => {
                const product = this.inventory.find(p => p.id === display.productId);
                return {
                    displayId: display.id,
                    product: product
                };
            });
    },
    
    // Calculate customer interest in a product
    calculateCustomerInterest(customer, product) {
        let interest = 0;
        
        // Base interest if the product type matches preference
        const template = this.getProductTemplate(product.templateId);
        if (customer.preferences.products.includes(template.id)) {
            interest += 30;
        }
        
        // Add interest if the product uses colors they like
        // This would require analyzing the art's colors
        // For now, we'll use a random factor
        interest += Math.floor(Math.random() * 40) + 10;
        
        // Reduce interest if price is above budget
        if (product.price > customer.budget) {
            interest -= (product.price - customer.budget) * 5;
        }
        
        return Math.max(0, Math.min(100, interest));
    }
};

// Product templates with improved art positioning
const productTemplates = [
    { 
        id: 'mug',
        name: 'Mug', 
        basePrice: 8,
        image: 'images/products/mug.png',
        artPosition: { x: 70, y: 70, width: 120, height: 120, rotation: 0 }
    },
    { 
        id: 'tote',
        name: 'Tote Bag', 
        basePrice: 12,
        image: 'images/products/tote.png',
        artPosition: { x: 60, y: 50, width: 140, height: 140, rotation: 0 }
    },
    { 
        id: 'shirt',
        name: 'T-Shirt', 
        basePrice: 15,
        image: 'images/products/tshirt.png',
        artPosition: { x: 75, y: 60, width: 110, height: 110, rotation: 0 }
    },
    { 
        id: 'poster',
        name: 'Poster', 
        basePrice: 10,
        image: 'images/products/poster.png',
        artPosition: { x: 40, y: 40, width: 180, height: 180, rotation: 0 }
    }
];

// Color palette for the painting canvas
const colorPalette = [
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

// Customer types
const customerTypes = [
    {
        type: 'trendy',
        avatar: 'images/customers/trendy.png',
        preferences: {
            products: ['tote', 'shirt'],
            colors: ['#FF5252', '#9C27B0', '#F06292']
        },
        budget: { min: 15, max: 25 },
        patience: 15 // seconds
    },
    {
        type: 'artsy',
        avatar: 'images/customers/artsy.png',
        preferences: {
            products: ['poster', 'mug'],
            colors: ['#2196F3', '#4CAF50', '#607D8B']
        },
        budget: { min: 10, max: 20 },
        patience: 20 // seconds
    },
    {
        type: 'casual',
        avatar: 'images/customers/casual.png',
        preferences: {
            products: ['mug', 'tote', 'shirt', 'poster'],
            colors: ['#FF9800', '#FFEB3B', '#795548']
        },
        budget: { min: 8, max: 18 },
        patience: 12 // seconds
    }
];
