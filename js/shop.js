/**
 * Shop Management for Cozy Artist Shop
 * Handles shop display, customer interactions, and sales
 */

// Shop state
const shopState = {
    activeCustomers: [],
    dayInProgress: false,
    customerTimer: null,
    dayTimer: null,
    dayLength: 60 // seconds
};

// Initialize the shop display
function initializeShop() {
    renderShopDisplays();
    setupShopEvents();
}

// Render shop display spots
function renderShopDisplays() {
    const displaysContainer = document.getElementById('shopDisplays');
    displaysContainer.innerHTML = '';
    
    gameState.shopDisplays.forEach(display => {
        const displayEl = document.createElement('div');
        displayEl.className = 'shop-display';
        displayEl.id = display.id;
        
        if (display.filled && display.productId) {
            displayEl.classList.add('filled');
            
            // Find the product in inventory
            const product = gameState.inventory.find(p => p.id === display.productId);
            
            if (product) {
                // Create product display
                const template = getProductTemplate(product.templateId);
                
                // Image container
                const imageContainer = document.createElement('div');
                imageContainer.className = 'shop-display-image';
                
                // Base product image
                const baseImg = document.createElement('img');
                baseImg.src = template.image;
                baseImg.className = 'product-base';
                
                // Art overlay
                const artImg = document.createElement('img');
                artImg.src = product.artUrl;
                artImg.className = 'product-art';
                
                // Apply positioning
                const pos = template.artPosition;
                artImg.style.top = `${pos.y / 4}px`;
                artImg.style.left = `${pos.x / 4}px`;
                artImg.style.width = `${pos.width / 4}px`;
                artImg.style.height = `${pos.height / 4}px`;
                
                if (pos.rotation) {
                    artImg.style.transform = `rotate(${pos.rotation}deg)`;
                }
                
                imageContainer.appendChild(baseImg);
                imageContainer.appendChild(artImg);
                
                // Price display
                const priceEl = document.createElement('div');
                priceEl.className = 'shop-display-price';
                
                const coinImg = document.createElement('img');
                coinImg.src = 'images/ui/coin.png';
                coinImg.alt = 'coins';
                
                const priceText = document.createElement('span');
                priceText.textContent = product.price;
                
                priceEl.appendChild(coinImg);
                priceEl.appendChild(priceText);
                
                displayEl.appendChild(imageContainer);
                displayEl.appendChild(priceEl);
            }
        } else {
            // Empty display
            const emptyText = document.createElement('div');
            emptyText.className = 'empty-display-text';
            emptyText.textContent = 'Click to add a product';
            
            displayEl.appendChild(emptyText);
        }
        
        displaysContainer.appendChild(displayEl);
    });
}

// Set up shop event listeners
function setupShopEvents() {
    // Display click events
    document.querySelectorAll('.shop-display').forEach(displayEl => {
        displayEl.addEventListener('click', () => {
            const displayId = displayEl.id;
            const display = gameState.shopDisplays.find(d => d.id === displayId);
            
            if (shopState.dayInProgress) {
                showNotification('Cannot change displays while shop is open!');
                return;
            }
            
            if (display.filled) {
                // Remove the product from display
                if (removeFromDisplay(displayId)) {
                    renderShopDisplays();
                    showNotification('Product removed from display');
                }
            } else {
                // Show inventory to select a product
                showInventoryForDisplay(displayId);
            }
        });
    });
    
    // Start day button (let's add this to the main UI)
    const startDayBtn = document.createElement('button');
    startDayBtn.id = 'startDayBtn';
    startDayBtn.className = 'accent-button';
    startDayBtn.textContent = 'Open Shop';
    startDayBtn.addEventListener('click', startDay);
    
    // Add it to shop tab
    const shopTab = document.getElementById('shopTab');
    
    // Only add if it doesn't exist yet
    if (!document.getElementById('startDayBtn')) {
        shopTab.appendChild(startDayBtn);
    }
}

// Show inventory modal to select a product for display
function showInventoryForDisplay(displayId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'inventoryModal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Select a Product to Display';
    
    const productsGrid = document.createElement('div');
    productsGrid.className = 'inventory-grid';
    
    // Filter for products not already displayed
    const availableProducts = gameState.inventory.filter(p => !p.displayed);
    
    if (availableProducts.length === 0) {
        const noProducts = document.createElement('p');
        noProducts.textContent = 'No products available. Create some in the Art Studio!';
        productsGrid.appendChild(noProducts);
    } else {
        availableProducts.forEach(product => {
            const template = getProductTemplate(product.templateId);
            
            const productEl = document.createElement('div');
            productEl.className = 'inventory-item';
            
            // Create preview container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'inventory-item-image';
            
            // Base product image
            const baseImg = document.createElement('img');
            baseImg.src = template.image;
            baseImg.style.width = '100%';
            baseImg.style.height = '100%';
            baseImg.style.position = 'absolute';
            baseImg.style.top = '0';
            baseImg.style.left = '0';
            
            // Art overlay
            const artImg = document.createElement('img');
            artImg.src = product.artUrl;
            artImg.style.position = 'absolute';
            artImg.style.top = '0';
            artImg.style.left = '0';
            artImg.style.width = '100%';
            artImg.style.height = '100%';
            artImg.style.objectFit = 'contain';
            
            previewContainer.style.position = 'relative';
            previewContainer.appendChild(baseImg);
            previewContainer.appendChild(artImg);
            
            // Product details
            const details = document.createElement('div');
            details.className = 'inventory-item-details';
            
            const name = document.createElement('div');
            name.className = 'inventory-item-name';
            name.textContent = product.name;
            
            const price = document.createElement('div');
            price.className = 'inventory-item-price';
            
            const coinImg = document.createElement('img');
            coinImg.src = 'images/ui/coin.png';
            
            const priceText = document.createElement('span');
            priceText.textContent = product.price;
            
            price.appendChild(coinImg);
            price.appendChild(priceText);
            
            details.appendChild(name);
            details.appendChild(price);
            
            productEl.appendChild(previewContainer);
            productEl.appendChild(details);
            
            // Add click event
            productEl.addEventListener('click', () => {
                if (displayProduct(product.id, displayId)) {
                    renderShopDisplays();
                    closeModal();
                    showNotification('Product added to display!');
                }
            });
            
            productsGrid.appendChild(productEl);
        });
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.addEventListener('click', closeModal);
    
    modalContent.appendChild(title);
    modalContent.appendChild(productsGrid);
    modalContent.appendChild(closeBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Close any open modal
function closeModal() {
    const openModals = document.querySelectorAll('.modal.active');
    openModals.forEach(modal => {
        if (modal.id !== 'productCreatedModal') { // Don't close product created modal automatically
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode === document.body) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    });
}

// Start a new shop day
function startDay() {
    if (shopState.dayInProgress) return;
    
    // Check if there are products on display
    const hasProducts = gameState.shopDisplays.some(d => d.filled);
    
    if (!hasProducts) {
        showNotification('Please add at least one product to your displays!');
        return;
    }
    
    shopState.dayInProgress = true;
    shopState.activeCustomers = [];
    
    // Update UI
    document.getElementById('startDayBtn').textContent = 'Shop is Open';
    document.getElementById('startDayBtn').disabled = true;
    
    // Schedule customer spawns
    scheduleCustomers();
    
    // Set day timer
    shopState.dayTimer = setTimeout(() => {
        endDay();
    }, shopState.dayLength * 1000);
}

// Schedule customer spawns during the day
function scheduleCustomers() {
    // Calculate customer count based on game day
    const customerCount = Math.min(3 + Math.floor(gameState.day / 2), 8);
    
    // Schedule each customer
    for (let i = 0; i < customerCount; i++) {
        const delay = (Math.random() * 0.6 + 0.1) * shopState.dayLength * 1000; // 10-70% of day length
        setTimeout(() => {
            if (shopState.dayInProgress) {
                spawnCustomer();
            }
        }, delay);
    }
}

// Spawn a customer in the shop
function spawnCustomer() {
    // Select a random customer type
    const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    
    // Create a customer object
    const customer = {
        id: `customer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: customerType.type,
        avatar: customerType.avatar || 'images/customers/default.png',
        preferences: customerType.preferences,
        budget: customerType.budget,
        position: -50, // Starting position off-screen
        targetPosition: Math.floor(Math.random() * 70) + 15, // Random position between 15-85%
        state: 'entering', // 'entering', 'browsing', 'buying', 'leaving'
        patience: customerType.patience,
        patienceTimer: null,
        interested: null // Will hold the product they're interested in
    };
    
    // Add to active customers
    shopState.activeCustomers.push(customer);
    
    // Create customer element
    createCustomerElement(customer);
    
    // Move customer in
    moveCustomer(customer);
    
    // Start browsing after reaching position
    setTimeout(() => {
        if (shopState.dayInProgress && customer.state === 'entering') {
            startBrowsing(customer);
        }
    }, 2000);
}

// Create a customer DOM element
function createCustomerElement(customer) {
    const customerArea = document.getElementById('customerArea');
    
    const customerEl = document.createElement('div');
    customerEl.className = 'customer';
    customerEl.id = customer.id;
    customerEl.style.left = `${customer.position}px`;
    
    const customerBody = document.createElement('div');
    customerBody.className = 'customer-body';
    
    const avatar = document.createElement('div');
    avatar.className = 'customer-avatar';
    
    // Use actual image or emoji based on customer type
    if (customer.avatar.startsWith('images/')) {
        const avatarImg = document.createElement('img');
        avatarImg.src = customer.avatar;
        avatarImg.alt = customer.type;
        avatar.appendChild(avatarImg);
    } else {
        avatar.textContent = customer.avatar;
    }
    
    const thoughts = document.createElement('div');
    thoughts.className = 'customer-thoughts';
    thoughts.id = `${customer.id}-thoughts`;
    
    customerBody.appendChild(avatar);
    customerBody.appendChild(thoughts);
    
    customerEl.appendChild(customerBody);
    customerArea.appendChild(customerEl);
}

// Move a customer to their target position
function moveCustomer(customer) {
    const customerEl = document.getElementById(customer.id);
    
    if (!customerEl) return;
    
    if (customer.state === 'entering') {
        customerEl.style.transform = `translateX(${customer.targetPosition}vw)`;
    } else if (customer.state === 'leaving') {
        customerEl.style.transform = 'translateX(100vw)';
        
        // Remove after animation
        setTimeout(() => {
            if (customerEl.parentNode) {
                customerEl.parentNode.removeChild(customerEl);
            }
            
            // Remove from active customers array
            const index = shopState.activeCustomers.findIndex(c => c.id === customer.id);
            if (index !== -1) {
                shopState.activeCustomers.splice(index, 1);
            }
        }, 1000);
    }
}

// Start customer browsing behavior
function startBrowsing(customer) {
    if (!shopState.dayInProgress) return;
    
    customer.state = 'browsing';
    
    // Find products that match this customer's preferences
    const matchingProducts = findMatchingProducts(customer);
    
    if (matchingProducts.length > 0) {
        // Pick a random product from matches
        const chosenProduct = matchingProducts[Math.floor(Math.random() * matchingProducts.length)];
        customer.interested = chosenProduct;
        
        // Get the display where this product is shown
        const display = gameState.shopDisplays.find(d => d.productId === chosenProduct.id);
        
        if (display) {
            // Show interest in the product
            showCustomerThoughts(customer, `I like this ${chosenProduct.name}!`);
            
            // Move toward the display
            const displayEl = document.getElementById(display.id);
            const rect = displayEl.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const displayPosition = (rect.left + rect.width / 2) / viewportWidth * 100;
            
            const customerEl = document.getElementById(customer.id);
            customerEl.style.transform = `translateX(${displayPosition - 5}vw)`;
            
            // Start buying process after a delay
            setTimeout(() => {
                if (shopState.dayInProgress && customer.state === 'browsing') {
                    decideToBuy(customer);
                }
            }, Math.random() * 3000 + 2000);
        } else {
            // Product not found, leave
            leaveShop(customer);
        }
    } else {
        // No matching products
        showCustomerThoughts(customer, "I don't see anything I like...");
        
        // Leave after a short delay
        setTimeout(() => {
            if (shopState.dayInProgress) {
                leaveShop(customer);
            }
        }, Math.random() * 2000 + 1000);
    }
}

// Show customer thought bubble
function showCustomerThoughts(customer, text) {
    const thoughtsEl = document.getElementById(`${customer.id}-thoughts`);
    
    if (thoughtsEl) {
        thoughtsEl.textContent = text;
        thoughtsEl.classList.add('active');
        
        // Hide thoughts after a delay
        setTimeout(() => {
            thoughtsEl.classList.remove('active');
        }, 3000);
    }
}

// Find products that match customer preferences
function findMatchingProducts(customer) {
    const displayedProducts = [];
    
    // Find all displayed products
    gameState.shopDisplays.forEach(display => {
        if (display.filled && display.productId) {
            const product = gameState.inventory.find(p => p.id === display.productId);
            if (product) {
                displayedProducts.push(product);
            }
        }
    });
    
    // Filter products that match customer preferences
    const matches = displayedProducts.filter(product => {
        // Check if product type is preferred
        const isPreferredType = customer.preferences.products.includes(product.templateId);
        
        // Price within budget
        const inBudget = product.price <= customer.budget.max;
        
        return isPreferredType && inBudget;
    });
    
    return matches;
}

// Customer decides whether to buy a product
function decideToBuy(customer) {
    if (!customer.interested) return;
    
    customer.state = 'buying';
    
    // Check if product is still available
    const product = gameState.inventory.find(p => p.id === customer.interested.id);
    const display = gameState.shopDisplays.find(d => d.productId === customer.interested.id);
    
    if (!product || !display) {
        // Product no longer available
        showCustomerThoughts(customer, "Oh, it's gone...");
        leaveShop(customer);
        return;
    }
    
    // Calculate buy probability
    // Base 70% chance, increased if product matches preferences
    let buyChance = 0.7;
    
    // Increase chance for preferred products and price within ideal range
    if (customer.preferences.products.includes(product.templateId)) {
        buyChance += 0.1;
    }
    
    if (product.price <= customer.budget.max * 0.8) {
        buyChance += 0.1;
    }
    
    // Make decision
    if (Math.random() < buyChance) {
        // Buy the product!
        showCustomerThoughts(customer, "I'll take it!");
        
        // Add purchase animation/effects here
        const displayEl = document.getElementById(display.id);
        displayEl.classList.add('sold');
        
        setTimeout(() => {
            displayEl.classList.remove('sold');
            
            // Process the sale
            if (sellProduct(product.id, product.price)) {
                renderShopDisplays();
                updateCoins();
                
                // Show notification
                showNotification(`Sold ${product.name} for ${product.price} coins!`);
            }
            
            // Customer leaves happy
            leaveShop(customer);
        }, 1000);
    } else {
        // Decide not to buy
        showCustomerThoughts(customer, "Actually, not today.");
        leaveShop(customer);
    }
}

// Customer leaves the shop
function leaveShop(customer) {
    customer.state = 'leaving';
    moveCustomer(customer);
    
    // Clear any timers
    if (customer.patienceTimer) {
        clearTimeout(customer.patienceTimer);
    }
}

// End the shop day
function endDay() {
    if (!shopState.dayInProgress) return;
    
    shopState.dayInProgress = false;
    
    // Make all customers leave
    shopState.activeCustomers.forEach(customer => {
        leaveShop(customer);
    });
    
    // Clear timers
    clearTimeout(shopState.dayTimer);
    clearTimeout(shopState.customerTimer);
    
    // Update UI
    document.getElementById('startDayBtn').textContent = 'Open Shop';
    document.getElementById('startDayBtn').disabled = false;
    
    // Show day summary
    showDaySummary();
    
    // Start new day in game state
    startNewDay();
    updateDayCounter();
}

// Show end of day summary
function showDaySummary() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content day-summary';
    
    const title = document.createElement('h2');
    title.className = 'summary-header';
    title.textContent = `Day ${gameState.day} Summary`;
    
    const summary = document.createElement('div');
    summary.className = 'summary-stats';
    
    // Calculate sales stats (in a real game, we'd track these during the day)
    // For this demo, we'll just show a simulated summary
    const totalSales = Math.floor(Math.random() * 3) + 1;
    const totalRevenue = Math.floor(Math.random() * 30) + 10;
    
    const salesStat = document.createElement('div');
    salesStat.className = 'summary-stat';
    salesStat.innerHTML = `<span>Items Sold:</span> <span>${totalSales}</span>`;
    
    const revenueStat = document.createElement('div');
    revenueStat.className = 'summary-stat';
    revenueStat.innerHTML = `<span>Revenue:</span> <span>${totalRevenue} coins</span>`;
    
    const customerStat = document.createElement('div');
    customerStat.className = 'summary-stat';
    customerStat.innerHTML = `<span>Customers Visited:</span> <span>${Math.floor(Math.random() * 5) + 3}</span>`;
    
    const total = document.createElement('div');
    total.className = 'summary-total';
    total.innerHTML = `<span>Daily Profit:</span> <span>${totalRevenue} coins</span>`;
    
    const continueBtn = document.createElement('button');
    continueBtn.className = 'accent-button';
    continueBtn.textContent = 'Continue to Next Day';
    continueBtn.addEventListener('click', () => {
        closeModal();
        saveGame();
    });
    
    summary.appendChild(salesStat);
    summary.appendChild(revenueStat);
    summary.appendChild(customerStat);
    summary.appendChild(total);
    
    modalContent.appendChild(title);
    modalContent.appendChild(summary);
    modalContent.appendChild(continueBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Function to fix the "Click to add a product" functionality
function fixShopDisplays() {
    console.log("Fixing shop displays...");
    
    // Get all empty display spots
    const emptyDisplays = document.querySelectorAll('.shop-display:not(.filled)');
    
    emptyDisplays.forEach(display => {
        // Clear any existing event listeners by cloning and replacing
        const newDisplay = display.cloneNode(true);
        display.parentNode.replaceChild(newDisplay, display);
        
        // Set cursor style to indicate it's clickable
        newDisplay.style.cursor = 'pointer';
        
        // Add click event listener
        newDisplay.addEventListener('click', function() {
            const displayId = this.id;
            
            // Check if shop is open
            if (shopState && shopState.dayInProgress) {
                showNotification('Cannot change displays while shop is open!');
                return;
            }
            
            // Show inventory to select a product
            showInventoryForDisplay(displayId);
        });
    });
}

// Modify the existing renderShopDisplays function
const originalRenderShopDisplays = renderShopDisplays;
renderShopDisplays = function() {
    // Call original function
    originalRenderShopDisplays();
    
    // Then fix the click handlers
    setTimeout(fixShopDisplays, 100);
};

// Function to show inventory for selecting a product
function showInventoryForDisplay(displayId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'inventoryModal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Select a Product to Display';
    
    const productsGrid = document.createElement('div');
    productsGrid.className = 'inventory-grid';
    
    // Filter for products not already displayed
    const availableProducts = gameState.inventory.filter(p => !p.displayed);
    
    if (availableProducts.length === 0) {
        const noProducts = document.createElement('p');
        noProducts.textContent = 'No products available. Create some in the Art Studio!';
        productsGrid.appendChild(noProducts);
    } else {
        availableProducts.forEach(product => {
            const template = getProductTemplate(product.templateId);
            
            const productEl = document.createElement('div');
            productEl.className = 'inventory-item';
            
            // Create preview container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'inventory-item-image';
            previewContainer.style.position = 'relative';
            
            // Product base image
            const baseImg = document.createElement('img');
            baseImg.src = product.imageUrl;
            baseImg.alt = product.name;
            baseImg.style.width = '100%';
            baseImg.style.height = '100%';
            baseImg.style.objectFit = 'contain';
            
            // Get art position
            const artPosition = product.customArtPosition || getArtPosition(product.templateId);
            
            // Art overlay
            const artImg = document.createElement('img');
            artImg.src = product.artUrl;
            artImg.alt = "Custom Art";
            artImg.style.position = 'absolute';
            artImg.style.top = artPosition.top;
            artImg.style.left = artPosition.left;
            artImg.style.width = artPosition.width;
            artImg.style.height = artPosition.height;
            artImg.style.mixBlendMode = 'multiply';
            
            previewContainer.appendChild(baseImg);
            previewContainer.appendChild(artImg);
            
            // Product details
            const details = document.createElement('div');
            details.className = 'inventory-item-details';
            
            const name = document.createElement('div');
            name.className = 'inventory-item-name';
            name.textContent = product.name;
            
            const price = document.createElement('div');
            price.className = 'inventory-item-price';
            
            const coinImg = document.createElement('img');
            coinImg.src = 'images/ui/coin.png';
            coinImg.onerror = function() {
                this.outerHTML = '🪙';
            };
            
            const priceText = document.createElement('span');
            priceText.textContent = product.price;
            
            price.appendChild(coinImg);
            price.appendChild(priceText);
            
            details.appendChild(name);
            details.appendChild(price);
            
            productEl.appendChild(previewContainer);
            productEl.appendChild(details);
            
            // Add click event
            productEl.addEventListener('click', function() {
                if (displayProduct(product.id, displayId)) {
                    renderShopDisplays();
                    closeModal();
                    showNotification('Product added to display!');
                }
            });
            
            productsGrid.appendChild(productEl);
        });
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.addEventListener('click', closeModal);
    
    modalContent.appendChild(title);
    modalContent.appendChild(productsGrid);
    modalContent.appendChild(closeBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
