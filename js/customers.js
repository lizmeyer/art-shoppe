/**
 * Customer Controller for Cozy Artist Shop
 * Handles customer generation, behavior, and preferences
 */

const Customers = {
    /**
     * Initialize customer system
     */
    init() {
        try {
            // Start customer spawning if we have products on display
            const filledDisplays = gameState.data.shopDisplays.filter(d => d.filled).length;
            if (filledDisplays > 0) {
                gameState.startCustomerSpawning();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize customers:', error);
            return false;
        }
    },
    
    /**
     * Generate initial customers based on displayed products
     */
    generateInitialCustomers() {
        // Clear any existing customers
        gameState.data.activeCustomers = [];
        
        // Calculate how many customers based on display count
        const filledDisplays = gameState.data.shopDisplays.filter(d => d.filled).length;
        if (filledDisplays === 0) return;
        
        const maxCustomers = Math.min(gameState.constants.MAX_CUSTOMERS, Math.max(1, Math.floor(filledDisplays / 2)));
        
        // Generate customers
        for (let i = 0; i < maxCustomers; i++) {
            gameState.generateCustomer();
        }
    },
    
    /**
     * Update customer patience bars
     * Should be called in the animation loop
     */
    updateCustomerPatience() {
        gameState.data.activeCustomers.forEach(customer => {
            const timeElapsed = (Date.now() - customer.enteredAt) / 1000;
            const patiencePercentage = Math.max(0, Math.min(100, 100 - (timeElapsed / customer.patience * 100)));
            
            const patienceFill = document.querySelector(`[data-customer-id="${customer.id}"] .patience-fill`);
            if (patienceFill) {
                patienceFill.style.width = `${patiencePercentage}%`;
                
                // Update color based on patience level
                if (patiencePercentage < 30) {
                    patienceFill.style.backgroundColor = 'var(--danger)';
                } else if (patiencePercentage < 60) {
                    patienceFill.style.backgroundColor = 'var(--warning)';
                } else {
                    patienceFill.style.backgroundColor = 'var(--success)';
                }
            }
        });
    },
    
    /**
     * Show customer preferences and product interest
     * @param {Object} customer - The customer to show preferences for
     */
    showPreferences(customer) {
        try {
            // Get displayed products
            const displayedProducts = gameState.getDisplayedProducts();
            
            if (displayedProducts.length === 0) {
                Utils.showNotification('This customer doesn\'t see any products to buy');
                return;
            }
            
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
                        <div class="product-image-container">
                            <img src="${item.product.imageUrl}" alt="${item.product.name}" class="product-base-image">
                        </div>
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
            
            // Create the modal
            const modal = Utils.createModal({
                title: `${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)} Customer`,
                content: `
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
                `
            });
            
            // Add event listeners for product selection
            modal.querySelectorAll('.preference-product').forEach(product => {
                product.addEventListener('click', () => {
                    const productId = product.getAttribute('data-product-id');
                    const selectedProduct = gameState.data.inventory.find(p => p.id === productId);
                    
                    if (selectedProduct) {
                        // Check if customer can afford it
                        if (selectedProduct.price <= customer.budget) {
                            // Sell the product
                            if (gameState.sellProduct(productId, selectedProduct.price)) {
                                Utils.showNotification(`Sold ${selectedProduct.name} for ${selectedProduct.price} coins!`);
                                UI.updateCoinDisplay();
                                UI.renderShopDisplays();
                                
                                // Mark customer as satisfied and make them leave
                                gameState.customerLeaves(customer.id, true);
                                UI.renderCustomers();
                                
                                // Close modal
                                document.body.removeChild(modal);
                            }
                        } else {
                            Utils.showNotification("That's too expensive for this customer!");
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Failed to show customer preferences:', error);
            Utils.showNotification('Error showing customer preferences');
        }
    }
};
