// Fix for shop display issues - Save this as shop-fix.js

document.addEventListener('DOMContentLoaded', function() {
    // Wait for page to fully load then fix display behaviors
    setTimeout(fixShopBehaviors, 1000);
});

function fixShopBehaviors() {
    // Add manual shop display click handlers
    document.querySelectorAll('.shop-display').forEach(display => {
        // Remove existing click event by cloning the element
        const newDisplay = display.cloneNode(true);
        if (display.parentNode) {
            display.parentNode.replaceChild(newDisplay, display);
        }
        
        // Add new click handler with correct behavior
        newDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const displayId = this.id;
            const isFilled = this.classList.contains('filled');
            
            // Check if shop is open
            if (window.shopState && window.shopState.dayInProgress) {
                showNotification('Cannot change displays while shop is open!');
                return;
            }
            
            if (isFilled) {
                // For filled displays, show options instead of removing immediately
                showDisplayOptions(displayId);
            } else {
                // For empty displays, show inventory selector
                openInventorySelector(displayId);
            }
        });
    });
    
    console.log("Shop display behaviors fixed");
}

// Show options for a displayed product
function showDisplayOptions(displayId) {
    // Find which display has this ID
    const display = window.gameState.shopDisplays.find(d => d.id === displayId);
    if (!display || !display.productId) return;
    
    // Find the product
    const product = window.gameState.inventory.find(p => p.id === display.productId);
    if (!product) return;
    
    // Create a simple modal for options
    const modal = document.createElement('div');
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
    
    // Modal content
    const content = document.createElement('div');
    content.style.backgroundColor = '#fff5f7';
    content.style.borderRadius = '12px';
    content.style.padding = '20px';
    content.style.maxWidth = '300px';
    content.style.textAlign = 'center';
    
    // Product info
    const title = document.createElement('h2');
    title.textContent = product.name;
    title.style.marginBottom = '15px';
    
    // Product image
    const productContainer = document.createElement('div');
    productContainer.style.position = 'relative';
    productContainer.style.width = '150px';
    productContainer.style.height = '150px';
    productContainer.style.margin = '0 auto 15px auto';
    
    const baseImg = document.createElement('img');
    baseImg.src = product.imageUrl;
    baseImg.alt = product.name;
    baseImg.style.width = '100%';
    baseImg.style.height = '100%';
    baseImg.style.objectFit = 'contain';
    
    // Get art position
    const getArtPosition = window.getArtPosition || function(id) {
        return { top: '25%', left: '25%', width: '50%', height: '50%' };
    };
    
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
    
    productContainer.appendChild(baseImg);
    productContainer.appendChild(artImg);
    
    // Price
    const price = document.createElement('p');
    price.innerHTML = `Price: <strong>${product.price} coins</strong>`;
    price.style.marginBottom = '20px';
    
    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove from Display';
    removeBtn.style.padding = '8px 16px';
    removeBtn.style.backgroundColor = '#ffb8c6';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '8px';
    removeBtn.style.cursor = 'pointer';
    
    removeBtn.onclick = function() {
        // Remove the product from display
        if (typeof window.removeFromDisplay === 'function') {
            window.removeFromDisplay(displayId);
            
            // Refresh displays
            if (typeof window.renderShopDisplays === 'function') {
                window.renderShopDisplays();
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Product removed from display');
            }
        }
        
        // Close modal
        document.body.removeChild(modal);
    };
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '8px 16px';
    cancelBtn.style.backgroundColor = '#f0f0f0';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.cursor = 'pointer';
    
    cancelBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    buttonContainer.appendChild(removeBtn);
    buttonContainer.appendChild(cancelBtn);
    
    // Assemble modal
    content.appendChild(title);
    content.appendChild(productContainer);
    content.appendChild(price);
    content.appendChild(buttonContainer);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Open a simple inventory selector
function openInventorySelector(displayId) {
    // Create a simple modal
    const modal = document.createElement('div');
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
    
    // Modal content
    const content = document.createElement('div');
    content.style.backgroundColor = '#fff5f7';
    content.style.borderRadius = '12px';
    content.style.padding = '20px';
    content.style.maxWidth = '90%';
    content.style.maxHeight = '90%';
    content.style.overflow = 'auto';
    
    // Title
    const title = document.createElement('h2');
    title.textContent = 'Select a Product to Display';
    title.style.marginBottom = '15px';
    
    content.appendChild(title);
    
    // Get available products
    const availableProducts = window.gameState.inventory.filter(p => !p.displayed);
    
    if (availableProducts.length === 0) {
        const noProducts = document.createElement('p');
        noProducts.textContent = 'No products available. Create some in the Art Studio!';
        content.appendChild(noProducts);
    } else {
        // Create a grid
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        grid.style.gap = '15px';
        
        // Add products
        availableProducts.forEach(product => {
            const productEl = document.createElement('div');
            productEl.style.border = '1px solid #ffb8c6';
            productEl.style.borderRadius = '8px';
            productEl.style.padding = '10px';
            productEl.style.cursor = 'pointer';
            productEl.style.backgroundColor = 'white';
            
            // Product container with relative positioning
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.width = '100%';
            imgContainer.style.height = '120px';
            imgContainer.style.marginBottom = '10px';
            
            // Product image
            const img = document.createElement('img');
            img.src = product.imageUrl;
            img.alt = product.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            // Get art position
            const getArtPosition = window.getArtPosition || function(id) {
                return { top: '25%', left: '25%', width: '50%', height: '50%' };
            };
            
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
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(artImg);
            
            // Product name
            const name = document.createElement('p');
            name.textContent = product.name;
            name.style.margin = '5px 0';
            name.style.fontWeight = 'bold';
            
            // Product price
            const price = document.createElement('p');
            price.textContent = `${product.price} coins`;
            
            productEl.appendChild(imgContainer);
            productEl.appendChild(name);
            productEl.appendChild(price);
            
            // Click handler
            productEl.onclick = function() {
                // Display the product
                if (typeof window.displayProduct === 'function') {
                    window.displayProduct(product.id, displayId);
                    
                    // Refresh displays
                    if (typeof window.renderShopDisplays === 'function') {
                        window.renderShopDisplays();
                    }
                    
                    // Show notification
                    if (typeof window.showNotification === 'function') {
                        window.showNotification('Product added to display!');
                    }
                }
                
                // Close modal
                document.body.removeChild(modal);
            };
            
            grid.appendChild(productEl);
        });
        
        content.appendChild(grid);
    }
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancel';
    closeBtn.style.marginTop = '20px';
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.backgroundColor = '#ffb8c6';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.cursor = 'pointer';
    
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Helper function if showNotification isn't available
function showNotification(message) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message);
    } else {
        // Simple fallback notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#fff5f7';
        notification.style.color = '#664e56';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        notification.style.zIndex = '1001';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}
