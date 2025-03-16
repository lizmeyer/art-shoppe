/**
 * Inventory Management for Cozy Artist Shop
 * Handles inventory display and interactions
 */

// Initialize the inventory
function initializeInventory() {
    renderInventory();
}

// Render the inventory grid
function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center';
        emptyMessage.style.gridColumn = '1 / -1';
        emptyMessage.innerHTML = `
            <p>Your inventory is empty!</p>
            <p>Go to the Art Studio to create some products.</p>
        `;
        inventoryGrid.appendChild(emptyMessage);
        return;
    }
    
    // Sort inventory - newest items first
    const sortedInventory = [...gameState.inventory].sort((a, b) => 
        new Date(b.created) - new Date(a.created)
    );
    
    sortedInventory.forEach(product => {
        const template = getProductTemplate(product.templateId);
        
        const item = document.createElement('div');
        item.className = 'inventory-item';
        item.dataset.id = product.id;
        
        // Create product preview
        const previewContainer = document.createElement('div');
        previewContainer.className = 'inventory-item-image';
        
        // Product container (for positioning art correctly)
        const productContainer = document.createElement('div');
        productContainer.style.position = 'relative';
        productContainer.style.width = '100%';
        productContainer.style.height = '100%';
        
        // Base product image
        const baseImg = document.createElement('img');
        baseImg.src = product.imageUrl;
        baseImg.alt = product.name;
        baseImg.style.width = '100%';
        baseImg.style.height = '100%';
        baseImg.style.objectFit = 'contain';
        
        // Art overlay
        const artImg = document.createElement('img');
        artImg.src = product.artUrl;
        artImg.style.position = 'absolute';
        artImg.style.top = '0';
        artImg.style.left = '0';
        artImg.style.width = '100%';
        artImg.style.height = '100%';
        artImg.style.objectFit = 'contain';
        artImg.style.mixBlendMode = 'multiply';
        
        productContainer.appendChild(baseImg);
        productContainer.appendChild(artImg);
        previewContainer.appendChild(productContainer);
        
        // Product details
        const details = document.createElement('div');
        details.className = 'inventory-item-details';
        
        const name = document.createElement('div');
        name.className = 'inventory-item-name';
        name.textContent = product.name;
        
        const price = document.createElement('div');
        price.className = 'inventory-item-price';
        
        const coinIcon = document.createElement('img');
        coinIcon.src = 'images/ui/coin.png';
        coinIcon.alt = 'coins';
        
        const priceValue = document.createElement('span');
        priceValue.textContent = product.price;
        
        price.appendChild(coinIcon);
        price.appendChild(priceValue);
        
        details.appendChild(name);
        details.appendChild(price);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'inventory-item-actions';
        
        // Display/Remove from Display button
        const displayBtn = document.createElement('button');
        
        if (product.displayed) {
            displayBtn.textContent = 'Remove';
            displayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeProductFromDisplay(product.id);
            });
        } else {
            displayBtn.textContent = 'Display';
            displayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showDisplaySelection(product.id);
            });
        }
        
        // Edit price button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Price';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPriceEditor(product);
        });
        
        actions.appendChild(displayBtn);
        actions.appendChild(editBtn);
        
        // Add all elements to item
        item.appendChild(previewContainer);
        item.appendChild(details);
        item.appendChild(actions);
        
        // Show detailed product view on click
        item.addEventListener('click', () => {
            showProductDetails(product);
        });
        
        inventoryGrid.appendChild(item);
    });
}

// Show the display spot selection for a product
function showDisplaySelection(productId) {
    // Do not allow during shop hours
    if (shopState && shopState.dayInProgress) {
        showNotification('Cannot change displays while shop is open!');
        return;
    }
    
    // Find empty display spots
    const emptySpots = gameState.shopDisplays.filter(spot => !spot.filled);
    
    if (emptySpots.length === 0) {
        showNotification('No empty display spots available. Remove a product first.');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Select a Display Spot';
    
    const spotsContainer = document.createElement('div');
    spotsContainer.style.display = 'grid';
    spotsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(100px, 1fr))';
    spotsContainer.style.gap = '1rem';
    spotsContainer.style.margin = '1rem 0';
    
    emptySpots.forEach(spot => {
        const spotBtn = document.createElement('button');
        spotBtn.textContent = `Spot ${spot.id.split('-')[1]}`;
        spotBtn.addEventListener('click', () => {
            if (displayProduct(productId, spot.id)) {
                renderShopDisplays();
                renderInventory();
                closeModal();
                showNotification('Product added to display!');
            }
        });
        
        spotsContainer.appendChild(spotBtn);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeModal);
    
    modalContent.appendChild(title);
    modalContent.appendChild(spotsContainer);
    modalContent.appendChild(cancelBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Remove a product from display
function removeProductFromDisplay(productId) {
    // Do not allow during shop hours
    if (shopState && shopState.dayInProgress) {
        showNotification('Cannot change displays while shop is open!');
        return;
    }
    
    // Find which display has this product
    const display = gameState.shopDisplays.find(spot => spot.productId === productId);
    
    if (!display) {
        showNotification('Product not found on display.');
        return;
    }
    
    // Remove it
    if (removeFromDisplay(display.id)) {
        renderShopDisplays();
        renderInventory();
        showNotification('Product removed from display.');
    }
}

// Show price editor for a product
function showPriceEditor(product) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Edit Product Price';
    
    const form = document.createElement('div');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1rem';
    form.style.margin = '1rem 0';
    
    // Product preview
    const preview = document.createElement('div');
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.gap = '1rem';
    
    const template = getProductTemplate(product.templateId);
    
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '80px';
    imageContainer.style.height = '80px';
    imageContainer.style.position = 'relative';
    
    const baseImg = document.createElement('img');
    baseImg.src = template.image;
    baseImg.style.width = '100%';
    baseImg.style.height = '100%';
    baseImg.style.objectFit = 'contain';
    
    const artImg = document.createElement('img');
    artImg.src = product.artUrl;
    artImg.style.position = 'absolute';
    artImg.style.top = '0';
    artImg.style.left = '0';
    artImg.style.width = '100%';
    artImg.style.height = '100%';
    artImg.style.objectFit = 'contain';
    artImg.style.mixBlendMode = 'multiply';
    
    imageContainer.appendChild(baseImg);
    imageContainer.appendChild(artImg);
    
    const productInfo = document.createElement('div');
    productInfo.innerHTML = `
        <div><strong>${product.name}</strong></div>
        <div>Base Price: ${template.basePrice} coins</div>
        <div>Current Price: ${product.price} coins</div>
    `;
    
    preview.appendChild(imageContainer);
    preview.appendChild(productInfo);
    
    // Price input
    const priceInput = document.createElement('div');
    priceInput.innerHTML = `
        <label for="priceInput">New Price:</label>
        <input type="number" id="priceInput" min="${template.basePrice}" value="${product.price}" style="width: 100%; padding: 0.5rem; margin-top: 0.5rem; border-radius: var(--border-radius); border: 1px solid var(--border-color);">
    `;
    
    // Buttons
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '1rem';
    buttons.style.marginTop = '1rem';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'accent-button';
    saveBtn.textContent = 'Save Price';
    saveBtn.addEventListener('click', () => {
        const newPrice = parseInt(document.getElementById('priceInput').value);
        
        if (isNaN(newPrice) || newPrice < template.basePrice) {
            showNotification(`Price must be at least ${template.basePrice} coins.`);
            return;
        }
        
        // Update the product price
        const productIndex = gameState.inventory.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
            gameState.inventory[productIndex].price = newPrice;
            renderInventory();
            renderShopDisplays(); // Update shop displays in case this product is displayed
            closeModal();
            showNotification('Product price updated!');
        }
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', closeModal);
    
    buttons.appendChild(saveBtn);
    buttons.appendChild(cancelBtn);
    
    form.appendChild(preview);
    form.appendChild(priceInput);
    form.appendChild(buttons);
    
    modalContent.appendChild(title);
    modalContent.appendChild(form);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Show detailed product view
function showProductDetails(product) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const template = getProductTemplate(product.templateId);
    
    // Product preview
    const preview = document.createElement('div');
    preview.style.display = 'flex';
    preview.style.flexDirection = 'column';
    preview.style.alignItems = 'center';
    preview.style.gap = '1rem';
    preview.style.margin = '1rem 0';
    
    const title = document.createElement('h2');
    title.textContent = product.name;
    
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '200px';
    imageContainer.style.height = '200px';
    imageContainer.style.position = 'relative';
    imageContainer.style.backgroundColor = 'white';
    imageContainer.style.borderRadius = 'var(--border-radius)';
    imageContainer.style.padding = '1rem';
    
    const baseImg = document.createElement('img');
    baseImg.src = template.image;
    baseImg.style.width = '100%';
    baseImg.style.height = '100%';
    baseImg.style.objectFit = 'contain';
    
    const artImg = document.createElement('img');
    artImg.src = product.artUrl;
    artImg.style.position = 'absolute';
    artImg.style.top = '0';
    artImg.style.left = '0';
    artImg.style.width = '100%';
    artImg.style.height = '100%';
    artImg.style.objectFit = 'contain';
    artImg.style.mixBlendMode = 'multiply';
    
    imageContainer.appendChild(baseImg);
    imageContainer.appendChild(artImg);
    
    // Product details
    const details = document.createElement('div');
    details.style.textAlign = 'center';
    
    const price = document.createElement('div');
    price.style.fontSize = '1.2rem';
    price.style.fontWeight = 'bold';
    price.style.margin = '0.5rem 0';
    price.innerHTML = `<img src="images/ui/coin.png" alt="coins" style="width: 20px; vertical-align: middle;"> ${product.price} coins`;
    
    const createdDate = new Date(product.created);
    const dateStr = createdDate.toLocaleDateString();
    
    const dateInfo = document.createElement('div');
    dateInfo.textContent = `Created on ${dateStr}`;
    dateInfo.style.fontSize = '0.9rem';
    dateInfo.style.opacity = '0.7';
    
    details.appendChild(price);
    details.appendChild(dateInfo);
    
    // Actions
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '1rem';
    actions.style.marginTop = '1rem';
    actions.style.justifyContent = 'center';
    
    // Display/Remove button
    const displayBtn = document.createElement('button');
    
    if (product.displayed) {
        displayBtn.textContent = 'Remove from Display';
        displayBtn.addEventListener('click', () => {
            removeProductFromDisplay(product.id);
            closeModal();
        });
    } else {
        displayBtn.textContent = 'Add to Display';
        displayBtn.className = 'accent-button';
        displayBtn.addEventListener('click', () => {
            closeModal();
            showDisplaySelection(product.id);
        });
    }
    
    // Edit price button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit Price';
    editBtn.addEventListener('click', () => {
        closeModal();
        showPriceEditor(product);
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closeModal);
    
    actions.appendChild(displayBtn);
    actions.appendChild(editBtn);
    actions.appendChild(closeBtn);
    
    preview.appendChild(title);
    preview.appendChild(imageContainer);
    preview.appendChild(details);
    
    modalContent.appendChild(preview);
    modalContent.appendChild(actions);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}
