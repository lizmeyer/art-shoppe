/**
 * Game State Management for Cozy Artist Shop
 * Handles all game data, saving, and loading
 */

// Main game state object
const gameState = {
    coins: 100,
    day: 1,
    inventory: [],
    shopDisplays: [],
    customerPreferences: {
        popular: ['mug', 'tote'],
        colors: ['#FF5252', '#4CAF50']
    },
    tutorialComplete: false,
    activeTheme: 'pastel'
};

// Product templates
const productTemplates = [
    { 
        id: 'mug',
        name: 'Mug', 
        basePrice: 8,
        image: 'images/products/mug.png',
        artPosition: { x: 40, y: 40, width: 100, height: 100, rotation: 0 }
    },
    { 
        id: 'tote',
        name: 'Tote Bag', 
        basePrice: 12,
        image: 'images/products/tote.png',
        artPosition: { x: 50, y: 60, width: 80, height: 80, rotation: 0 }
    },
    { 
        id: 'shirt',
        name: 'T-Shirt', 
        basePrice: 15,
        image: 'images/products/tshirt.png',
        artPosition: { x: 60, y: 50, width: 70, height: 70, rotation: 0 }
    },
    { 
        id: 'poster',
        name: 'Poster', 
        basePrice: 10,
        image: 'images/products/poster.png',
        artPosition: { x: 30, y: 30, width: 140, height: 140, rotation: 0 }
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

// Initialize shop displays
function initializeShopDisplays() {
    // Create 6 empty display spots
    gameState.shopDisplays = Array(6).fill(null).map((_, i) => ({
        id: `display-${i}`,
        productId: null,
        filled: false
    }));
}

// Save game to localStorage
function saveGame() {
    try {
        const saveData = {
            coins: gameState.coins,
            day: gameState.day,
            inventory: gameState.inventory,
            shopDisplays: gameState.shopDisplays,
            tutorialComplete: gameState.tutorialComplete,
            activeTheme: gameState.activeTheme
        };
        
        localStorage.setItem('cozyArtistShop', JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('Error saving game:', error);
        return false;
    }
}

// Load game from localStorage
function loadGame() {
    try {
        const savedData = localStorage.getItem('cozyArtistShop');
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Update game state with saved data
            gameState.coins = parsedData.coins || 100;
            gameState.day = parsedData.day || 1;
            gameState.inventory = parsedData.inventory || [];
            gameState.shopDisplays = parsedData.shopDisplays || [];
            gameState.tutorialComplete = parsedData.tutorialComplete || false;
            gameState.activeTheme = parsedData.activeTheme || 'pastel';
            
            // If shop displays weren't saved or are invalid, initialize them
            if (!gameState.shopDisplays.length) {
                initializeShopDisplays();
            }
            
            return true;
        }
        
        // No saved data found, initialize new game
        initializeShopDisplays();
        return false;
    } catch (error) {
        console.error('Error loading game:', error);
        initializeShopDisplays();
        return false;
    }
}

// Add a created product to inventory
function addToInventory(product) {
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
    
    gameState.inventory.push(newProduct);
    return newProduct;
}

// Display a product in the shop
function displayProduct(productId, displayId) {
    // Find the product in inventory
    const productIndex = gameState.inventory.findIndex(p => p.id === productId);
    if (productIndex === -1) return false;
    
    // Find the display spot
    const displayIndex = gameState.shopDisplays.findIndex(d => d.id === displayId);
    if (displayIndex === -1) return false;
    
    // Update the display with the product
    gameState.shopDisplays[displayIndex] = {
        ...gameState.shopDisplays[displayIndex],
        productId,
        filled: true
    };
    
    // Mark the product as displayed
    gameState.inventory[productIndex].displayed = true;
    
    return true;
}

// Remove a product from display
function removeFromDisplay(displayId) {
    // Find the display spot
    const displayIndex = gameState.shopDisplays.findIndex(d => d.id === displayId);
    if (displayIndex === -1) return false;
    
    // Get the product ID before removing it
    const productId = gameState.shopDisplays[displayIndex].productId;
    
    // Update the display to be empty
    gameState.shopDisplays[displayIndex] = {
        ...gameState.shopDisplays[displayIndex],
        productId: null,
        filled: false
    };
    
    // If we had a product, mark it as not displayed
    if (productId) {
        const productIndex = gameState.inventory.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            gameState.inventory[productIndex].displayed = false;
        }
    }
    
    return true;
}

// Sell a product
function sellProduct(productId, price) {
    // Find the product in inventory
    const productIndex = gameState.inventory.findIndex(p => p.id === productId);
    if (productIndex === -1) return false;
    
    // Find if it's on display
    const displayIndex = gameState.shopDisplays.findIndex(d => d.productId === productId);
    
    // Remove from display if it was displayed
    if (displayIndex !== -1) {
        gameState.shopDisplays[displayIndex] = {
            ...gameState.shopDisplays[displayIndex],
            productId: null,
            filled: false
        };
    }
    
    // Add coins
    gameState.coins += price;
    
    // Remove from inventory
    gameState.inventory.splice(productIndex, 1);
    
    return true;
}

// Start a new day
function startNewDay() {
    gameState.day += 1;
    
    // Update customer preferences to keep the game interesting
    const randomColor = colorPalette[Math.floor(Math.random() * (colorPalette.length - 1))];
    const randomProduct = productTemplates[Math.floor(Math.random() * productTemplates.length)].id;
    
    gameState.customerPreferences = {
        popular: [randomProduct, gameState.customerPreferences.popular[0]],
        colors: [randomColor, gameState.customerPreferences.colors[0]]
    };
    
    return gameState.day;
}

// Get a product template by ID
function getProductTemplate(templateId) {
    return productTemplates.find(p => p.id === templateId);
}

// Initialize the game
function initGame() {
    const gameLoaded = loadGame();
    if (!gameLoaded) {
        // This is a new game
        initializeShopDisplays();
    }
    
    return {
        isNewGame: !gameLoaded,
        gameState
    };
}
