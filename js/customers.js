/**
 * Customer Simulation for Cozy Artist Shop
 * Manages customer behavior, preferences, and interactions
 */

// Customer preferences constructor
function createCustomerPreferences() {
    // Get a mix of random preferences and current trends
    const trendyProducts = gameState.customerPreferences.popular;
    const trendyColors = gameState.customerPreferences.colors;
    
    return {
        // Products they're interested in
        products: getRandomSubset(
            [...trendyProducts, ...getRandomSubset(productTemplates.map(p => p.id), 1)], 
            Math.random() > 0.3 ? 2 : 1 // 70% chance of being interested in 2 product types
        ),
        
        // Colors they like
        colors: getRandomSubset(
            [...trendyColors, ...getRandomSubset(colorPalette, 2)],
            Math.random() > 0.5 ? 2 : 1 // 50% chance of liking 2 colors
        ),
        
        // Budget range
        budget: {
            min: 5 + Math.floor(Math.random() * 5),
            max: 15 + Math.floor(Math.random() * 15)
        },
        
        // How long they'll browse before leaving
        patience: 10 + Math.floor(Math.random() * 10) // 10-20 seconds
    };
}

// Get a random subset of an array
function getRandomSubset(array, count) {
    if (count >= array.length) return [...array];
    
    const result = [];
    const copyArray = [...array];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * copyArray.length);
        result.push(copyArray[randomIndex]);
        copyArray.splice(randomIndex, 1);
    }
    
    return result;
}

// Create a customer avatar
function createCustomerAvatar() {
    // In a real game, we'd have proper character images and more variety
    // For this demo, we'll create a simple emoji avatar
    
    const avatarOptions = [
        '👧', '👦', '👩', '👨', '👵', '👴', 
        '👱‍♀️', '👱', '👸', '🤴', '👳‍♀️', '👳'
    ];
    
    return avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
}

// Generate a random customer
function generateRandomCustomer() {
    const preferences = createCustomerPreferences();
    
    return {
        id: `customer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        avatar: createCustomerAvatar(),
        preferences: preferences,
        budget: preferences.budget,
        patience: preferences.patience
    };
}

// Calculate how well a product matches customer preferences
function calculateMatchScore(product, customerPreferences) {
    let score = 0;
    const template = getProductTemplate(product.templateId);
    
    // Check if product type matches preferences
    if (customerPreferences.preferences.products.includes(template.id)) {
        score += 3;
    }
    
    // Check price - higher score for lower prices within budget
    if (product.price <= customerPreferences.budget.max) {
        if (product.price <= customerPreferences.budget.min) {
            score += 2; // Great price
        } else {
            // Score decreases as price approaches max budget
            const priceRatio = (customerPreferences.budget.max - product.price) / 
                               (customerPreferences.budget.max - customerPreferences.budget.min);
            score += 1 + priceRatio;
        }
    } else {
        score -= 2; // Too expensive
    }
    
    // In a full implementation, we'd check art style, colors, etc.
    // For this demo, we'll keep it simple
    
    return score;
}

// Find the best matching product for a customer
function findBestProductMatch(customer, availableProducts) {
    if (!availableProducts || availableProducts.length === 0) return null;
    
    // Calculate scores for each product
    const productScores = availableProducts.map(product => ({
        product,
        score: calculateMatchScore(product, customer)
    }));
    
    // Sort by score (highest first)
    productScores.sort((a, b) => b.score - a.score);
    
    // Return the product with the highest score (if it's positive)
    if (productScores[0].score > 0) {
        return productScores[0].product;
    }
    
    // No good matches found
    return null;
}

// Generate customer thought based on product
function generateCustomerThought(customer, product) {
    // In a full game, we'd have more variety and context
    // For this demo, we'll keep it simple
    
    const template = getProductTemplate(product.templateId);
    const thoughts = [
        `I love this ${template.name}!`,
        `This design is so cute!`,
        `Oh, this is perfect!`,
        `I've been looking for a ${template.name} like this.`,
        `This would make a great gift!`
    ];
    
    if (product.price > customer.budget.max) {
        return `${template.name} looks nice, but it's too expensive...`;
    }
    
    return thoughts[Math.floor(Math.random() * thoughts.length)];
}

// Simulate customer making purchasing decision
function simulatePurchaseDecision(customer, product) {
    // Base chance of purchase
    let purchaseChance = 0.5;
    
    // Adjust based on how well product matches preferences
    const matchScore = calculateMatchScore(product, customer);
    purchaseChance += matchScore * 0.1;
    
    // Adjust for price relative to budget
    if (product.price <= customer.budget.min) {
        purchaseChance += 0.2; // Great price
    } else if (product.price <= customer.budget.max) {
        // Decreases as price approaches max budget
        const priceFactor = (customer.budget.max - product.price) / 
                            (customer.budget.max - customer.budget.min);
        purchaseChance += priceFactor * 0.1;
    } else {
        // Too expensive, very unlikely to purchase
        purchaseChance = 0.05;
    }
    
    // Cap the chance between 0.05 and 0.95
    purchaseChance = Math.min(0.95, Math.max(0.05, purchaseChance));
    
    // Make decision
    return Math.random() < purchaseChance;
}
