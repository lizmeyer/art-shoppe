/**
 * Painter Module for Cozy Artist Shop
 * Handles canvas drawing functionality and product creation
 */

// Canvas state
const painter = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    color: '#000000',
    brushSize: 5,
    tool: 'brush', // 'brush', 'eraser', 'fill'
    selectedProduct: null,
    artDataUrl: null
};

// Initialize the canvas
function initializePainter() {
    console.log("Initializing painter...");
    painter.canvas = document.getElementById('paintCanvas');
    
    if (!painter.canvas) {
        console.error("Canvas element not found!");
        return;
    }
    
    painter.ctx = painter.canvas.getContext('2d');
    
    // Set default values
    resetCanvas();
    
    // Set up event listeners
    setupPainterEvents();
    
    // Initialize color picker
    createColorPalette();
    
    // Initialize product options
    createProductOptions();
    
    // Set first product as selected
    if (productTemplates && productTemplates.length > 0) {
        selectProduct(productTemplates[0].id);
    }
    
    console.log("Painter initialization complete");
}

// Reset the canvas to blank
function resetCanvas() {
    if (!painter.ctx) return;
    
    painter.ctx.fillStyle = 'white';
    painter.ctx.fillRect(0, 0, painter.canvas.width, painter.canvas.height);
    updateArtDataUrl();
}

// Set up event listeners for drawing
function setupPainterEvents() {
    // First check if elements exist
    if (!painter.canvas) return;
    
    // Mouse events
    painter.canvas.addEventListener('mousedown', startDrawing);
    painter.canvas.addEventListener('mousemove', draw);
    painter.canvas.addEventListener('mouseup', stopDrawing);
    painter.canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    painter.canvas.addEventListener('touchstart', handleTouchStart);
    painter.canvas.addEventListener('touchmove', handleTouchMove);
    painter.canvas.addEventListener('touchend', stopDrawing);
    
    // Tool buttons
    const brushTool = document.getElementById('brushTool');
    const eraserTool = document.getElementById('eraserTool');
    const fillTool = document.getElementById('fillTool');
    const clearTool = document.getElementById('clearTool');
    
    if (brushTool) brushTool.addEventListener('click', () => setTool('brush'));
    if (eraserTool) eraserTool.addEventListener('click', () => setTool('eraser'));
    if (fillTool) fillTool.addEventListener('click', () => setTool('fill'));
    if (clearTool) clearTool.addEventListener('click', () => resetCanvas());
    
    // Initialize brush sizes
    document.querySelectorAll('.brush-size').forEach(btn => {
        btn.addEventListener('click', () => {
            painter.brushSize = parseInt(btn.dataset.size);
            ToolButtons();
        });
    });
    
    // Save button
    const saveBtn = document.getElementById('saveProductButton');
    if (saveBtn) {
        saveBtn.addEventListener('click', createProduct);
    }
}

// Handle touch start event
function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = painter.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (painter.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (painter.canvas.height / rect.height);
        
        startDrawingAt(x, y);
    }
}

// Handle touch move event
function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && painter.isDrawing) {
        const touch = e.touches[0];
        const rect = painter.canvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (painter.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (painter.canvas.height / rect.height);
        
        drawTo(x, y);
    }
}

// Start drawing
function startDrawing(e) {
    const rect = painter.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (painter.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (painter.canvas.height / rect.height);
    
    startDrawingAt(x, y);
}

// Start drawing at a specific position
function startDrawingAt(x, y) {
    painter.isDrawing = true;
    painter.lastX = x;
    painter.lastY = y;
    
    // If using the fill tool, fill the area and stop
    if (painter.tool === 'fill') {
        floodFill(Math.floor(x), Math.floor(y), painter.color);
        painter.isDrawing = false;
        ArtDataUrl();
    }
}

// Draw line while moving
function draw(e) {
    if (!painter.isDrawing) return;
    
    const rect = painter.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (painter.canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (painter.canvas.height / rect.height);
    
    drawTo(x, y);
}

// Draw to a specific point
function drawTo(x, y) {
    if (!painter.ctx) return;
    
    painter.ctx.lineJoin = 'round';
    painter.ctx.lineCap = 'round';
    painter.ctx.lineWidth = painter.brushSize;
    
    // Set brush color based on tool
    if (painter.tool === 'eraser') {
        painter.ctx.strokeStyle = 'white';
    } else {
        painter.ctx.strokeStyle = painter.color;
    }
    
    painter.ctx.beginPath();
    painter.ctx.moveTo(painter.lastX, painter.lastY);
    painter.ctx.lineTo(x, y);
    painter.ctx.stroke();
    
    painter.lastX = x;
    painter.lastY = y;
    
    //  the data URL periodically
    if (Math.random() < 0.1) { // Only  10% of the time for performance
        ArtDataUrl();
    }
}

// Stop drawing
function stopDrawing() {
    painter.isDrawing = false;
    ArtDataUrl();
}

//  the art data URL for preview
function ArtDataUrl() {
    if (!painter.canvas) return;
    
    painter.artDataUrl = painter.canvas.toDataURL('image/png');
    updateProductPreview();
}

// Create the color palette
function createColorPalette() {
    const colorPicker = document.querySelector('.color-picker');
    if (!colorPicker) {
        console.error("Color picker container not found!");
        return;
    }
    
    colorPicker.innerHTML = '';
    
    colorPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.style.width = '30px';
        swatch.style.height = '30px';
        swatch.style.borderRadius = '50%';
        swatch.style.display = 'inline-block';
        swatch.style.margin = '5px';
        swatch.style.cursor = 'pointer';
        swatch.style.border = '2px solid var(--border-color)';
        swatch.dataset.color = color;
        
        if (color === painter.color) {
            swatch.style.border = '2px solid white';
            swatch.style.boxShadow = '0 0 0 2px var(--text-color)';
        }
        
        swatch.addEventListener('click', () => {
            painter.color = color;
            document.querySelectorAll('.color-swatch').forEach(s => {
                s.style.border = '2px solid var(--border-color)';
                s.style.boxShadow = 'none';
            });
            swatch.style.border = '2px solid white';
            swatch.style.boxShadow = '0 0 0 2px var(--text-color)';
            
            // If eraser was active, switch back to brush
            if (painter.tool === 'eraser') {
                setTool('brush');
            }
        });
        
        colorPicker.appendChild(swatch);
    });
}

// Create product options
function createProductOptions() {
    const productSelector = document.querySelector('.product-selector');
    if (!productSelector) {
        console.error("Product selector container not found!");
        return;
    }
    
    productSelector.innerHTML = '';
    
    productTemplates.forEach(product => {
        const option = document.createElement('div');
        option.className = 'product-option';
        option.dataset.product = product.id;
        option.style.padding = '10px';
        option.style.margin = '5px';
        option.style.backgroundColor = 'white';
        option.style.border = '1px solid var(--border-color)';
        option.style.borderRadius = '8px';
        option.style.display = 'inline-block';
        option.style.textAlign = 'center';
        option.style.cursor = 'pointer';
        option.style.width = '80px';
        
        // Try to load image with fallback
        const imgContainer = document.createElement('div');
        imgContainer.style.width = '60px';
        imgContainer.style.height = '60px';
        imgContainer.style.margin = '0 auto';
        imgContainer.style.position = 'relative';
        
        try {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            
            img.onerror = function() {
                this.style.display = 'none';
                // Create fallback shape based on product type
                const fallback = document.createElement('div');
                fallback.style.width = '100%';
                fallback.style.height = '100%';
                fallback.style.backgroundColor = 'white';
                fallback.style.border = '1px solid var(--text-color)';
                fallback.style.borderRadius = '4px';
                fallback.style.display = 'flex';
                fallback.style.justifyContent = 'center';
                fallback.style.alignItems = 'center';
                fallback.textContent = product.id.charAt(0).toUpperCase();
                imgContainer.appendChild(fallback);
            };
            
            img.src = product.image;
            imgContainer.appendChild(img);
        } catch (e) {
            console.error("Error creating product image:", e);
            const fallback = document.createElement('div');
            fallback.style.width = '100%';
            fallback.style.height = '100%';
            fallback.style.backgroundColor = 'white';
            fallback.style.border = '1px solid var(--text-color)';
            fallback.style.borderRadius = '4px';
            fallback.style.display = 'flex';
            fallback.style.justifyContent = 'center';
            fallback.style.alignItems = 'center';
            fallback.textContent = product.id.charAt(0).toUpperCase();
            imgContainer.appendChild(fallback);
        }
        
        // Create name element
        const name = document.createElement('div');
        name.textContent = product.name;
        name.style.marginTop = '5px';
        name.style.fontSize = '14px';
        
        option.appendChild(imgContainer);
        option.appendChild(name);
        
        option.addEventListener('click', () => {
            selectProduct(product.id);
        });
        
        productSelector.appendChild(option);
    });
}

// Select a product for previewing
function selectProduct(productId) {
    painter.selectedProduct = getProductTemplate(productId);
    
    // Update UI
    document.querySelectorAll('.product-option').forEach(option => {
        if (option.dataset.product === productId) {
            option.style.backgroundColor = 'var(--button-hover)';
            option.style.transform = 'translateY(-2px)';
        } else {
            option.style.backgroundColor = 'white';
            option.style.transform = 'none';
        }
    });
    
    updateProductPreview();
}

// Update the product preview with current art
// Update the product preview with current art
function updateProductPreview() {
    if (!painter.selectedProduct || !painter.artDataUrl) return;
    
    const previewEl = document.getElementById('productPreview');
    if (!previewEl) {
        console.error("Product preview container not found!");
        return;
    }
    
    previewEl.innerHTML = '';
    
    // Create container with relative positioning
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    
    // Base product image
    const baseImg = document.createElement('img');
    baseImg.src = painter.selectedProduct.image;
    baseImg.alt = painter.selectedProduct.name;
    baseImg.style.maxWidth = '90%';
    baseImg.style.maxHeight = '90%';
    baseImg.style.objectFit = 'contain';
    baseImg.style.position = 'relative'; // Changed from absolute
    baseImg.style.zIndex = '1';
    
    // Create a wrapper for both images
    const productWithArtWrapper = document.createElement('div');
    productWithArtWrapper.style.position = 'relative';
    productWithArtWrapper.style.display = 'inline-block';
    
    // Art overlay
    const artImg = document.createElement('img');
    artImg.src = painter.artDataUrl;
    artImg.alt = "Your Design";
    artImg.style.position = 'absolute';
    artImg.style.mixBlendMode = 'multiply';
    artImg.style.zIndex = '2';
    
    // Determine overlay positioning based on product type
    let overlayStyle = {};
    
    switch(painter.selectedProduct.id) {
        case 'mug':
            overlayStyle = {
                top: '20%',
                left: '35%',
                width: '40%',
                height: '40%'
            };
            break;
        case 'tote':
            overlayStyle = {
                top: '25%',
                left: '30%',
                width: '40%',
                height: '40%'
            };
            break;
        case 'shirt':
            overlayStyle = {
                top: '25%',
                left: '35%',
                width: '30%',
                height: '30%'
            };
            break;
        case 'poster':
            overlayStyle = {
                top: '10%',
                left: '15%',
                width: '70%',
                height: '70%'
            };
            break;
        default:
            overlayStyle = {
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%'
            };
    }
    
    // Apply positioning
    artImg.style.top = overlayStyle.top;
    artImg.style.left = overlayStyle.left;
    artImg.style.width = overlayStyle.width;
    artImg.style.height = overlayStyle.height;
    
    // Add elements to container
    productWithArtWrapper.appendChild(baseImg);
    productWithArtWrapper.appendChild(artImg);
    container.appendChild(productWithArtWrapper);
    previewEl.appendChild(container);
    
    // Log for debugging
    console.log("Updated product preview with:", {
        product: painter.selectedProduct.name,
        artUrl: painter.artDataUrl.substring(0, 50) + "...",
        positioning: overlayStyle
    });
}

// Set the active drawing tool
function setTool(tool) {
    painter.tool = tool;
    updateToolButtons();
}

// Update the tool buttons to reflect the current selection
function updateToolButtons() {
    // Update tool buttons
    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeToolBtn = document.getElementById(`${painter.tool}Tool`);
    if (activeToolBtn) {
        activeToolBtn.classList.add('active');
    }
    
    // Update brush size buttons
    document.querySelectorAll('.brush-size').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.size) === painter.brushSize) {
            btn.classList.add('active');
        }
    });
}

// Create a new product with the current art
function createProduct() {
    if (!painter.selectedProduct || !painter.artDataUrl) {
        showNotification('Please create some art first!');
        return;
    }
    
    console.log("Creating product with selected template:", painter.selectedProduct);
    
    // Ensure we have the latest canvas data
    updateArtDataUrl();
    
    // Create a product object
    const product = {
        templateId: painter.selectedProduct.id,
        name: `${painter.selectedProduct.name} with Custom Art`,
        price: painter.selectedProduct.basePrice + 5, // Add markup for custom art
        imageUrl: painter.selectedProduct.image,
        artUrl: painter.artDataUrl,
        created: new Date().toISOString()
    };
    
    console.log("Product object created:", product);
    
    try {
        // Add to inventory
        console.log("Adding product to inventory...");
        const newProduct = addToInventory(product);
        console.log("Product added to inventory, new product ID:", newProduct.id);
        
        // Save game state to persist
        if (typeof saveGame === 'function') {
            saveGame();
            console.log("Game state saved");
        }
        
        // Show created product
        showCreatedProduct(newProduct);
        
        // Show success notification
        showNotification('Product created and added to inventory!');
        
        // Update inventory display if on inventory tab
        if (document.getElementById('inventoryTab').classList.contains('active')) {
            if (typeof renderInventory === 'function') {
                renderInventory();
            }
        }
    } catch (e) {
        console.error("Error creating product:", e);
        showNotification('Error creating product');
    }
}

// Show the created product in a modal
function showCreatedProduct(product) {
    console.log("Showing product with art:", product);
    
    const displayEl = document.getElementById('createdProductDisplay');
    if (!displayEl) {
        console.error("Product display container not found!");
        return;
    }
    
    displayEl.innerHTML = '';
    
    // ============= PRODUCT DISPLAY =============
    // Create main product container
    const productContainer = document.createElement('div');
    productContainer.style.position = 'relative';
    productContainer.style.width = '100%';
    productContainer.style.maxWidth = '250px';
    productContainer.style.margin = '0 auto';
    
    // Base product image
    const baseImg = document.createElement('img');
    baseImg.src = product.imageUrl;
    baseImg.alt = product.name;
    baseImg.style.width = '100%';
    baseImg.style.height = 'auto';
    baseImg.style.display = 'block';
    
    // Handle image error
    baseImg.onerror = function() {
        this.style.display = 'none';
        
        // Create fallback shape
        const fallback = document.createElement('div');
        fallback.style.width = '100%';
        fallback.style.height = '200px';
        fallback.style.backgroundColor = 'white';
        fallback.style.border = '1px solid var(--text-color)';
        fallback.style.borderRadius = '4px';
        fallback.style.display = 'flex';
        fallback.style.justifyContent = 'center';
        fallback.style.alignItems = 'center';
        fallback.textContent = product.name;
        productContainer.appendChild(fallback);
    };
    
    // Get product template
    const template = getProductTemplate(product.templateId);
    
    // Determine overlay positioning based on product type
    let overlayStyle = {};
    
    switch(product.templateId) {
        case 'mug':
            overlayStyle = {
                top: '20%',
                left: '35%',
                width: '40%',
                height: '40%'
            };
            break;
        case 'tote':
            overlayStyle = {
                top: '25%',
                left: '30%',
                width: '40%',
                height: '40%'
            };
            break;
        case 'shirt':
            overlayStyle = {
                top: '25%',
                left: '35%',
                width: '30%',
                height: '30%'
            };
            break;
        case 'poster':
            overlayStyle = {
                top: '10%',
                left: '15%',
                width: '70%',
                height: '70%'
            };
            break;
        default:
            overlayStyle = {
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%'
            };
    }
    
    // Create art overlay
    const artOverlay = document.createElement('div');
    artOverlay.style.position = 'absolute';
    artOverlay.style.top = overlayStyle.top;
    artOverlay.style.left = overlayStyle.left;
    artOverlay.style.width = overlayStyle.width;
    artOverlay.style.height = overlayStyle.height;
    
    // Art image
    const artImg = document.createElement('img');
    artImg.src = product.artUrl;
    artImg.alt = "Your Design";
    artImg.style.width = '100%';
    artImg.style.height = '100%';
    artImg.style.objectFit = 'contain';
    artImg.style.mixBlendMode = 'multiply';
    
    // Add elements to container
    artOverlay.appendChild(artImg);
    productContainer.appendChild(baseImg);
    productContainer.appendChild(artOverlay);
    
    // ============= ART PREVIEW =============
    // Separate preview of just the art
    const artPreview = document.createElement('div');
    artPreview.style.marginTop = '15px';
    artPreview.style.textAlign = 'center';
    artPreview.style.display = 'flex';
    artPreview.style.flexDirection = 'column';
    artPreview.style.alignItems = 'center';
    
    const previewLabel = document.createElement('p');
    previewLabel.textContent = 'Your Design:';
    previewLabel.style.margin = '0 0 5px 0';
    previewLabel.style.fontSize = '14px';
    
    const previewImg = document.createElement('img');
    previewImg.src = product.artUrl;
    previewImg.alt = "Design Preview";
    previewImg.style.maxWidth = '80px';
    previewImg.style.maxHeight = '80px';
    previewImg.style.border = '1px solid #ddd';
    previewImg.style.borderRadius = '4px';
    previewImg.style.backgroundColor = 'white';
    
    artPreview.appendChild(previewLabel);
    artPreview.appendChild(previewImg);
    
    // ============= PRODUCT DETAILS =============
    // Product name and details
    const productDetails = document.createElement('div');
    productDetails.style.marginTop = '10px';
    productDetails.style.textAlign = 'center';
    
    const nameEl = document.createElement('p');
    nameEl.textContent = product.name;
    nameEl.style.fontWeight = 'bold';
    nameEl.style.margin = '5px 0';
    
    const priceEl = document.createElement('p');
    priceEl.innerHTML = `Price: <span style="font-weight: bold;">${product.price} coins</span>`;
    priceEl.style.margin = '5px 0';
    
    productDetails.appendChild(nameEl);
    productDetails.appendChild(priceEl);
    
    // Add all sections to the display
    displayEl.appendChild(productContainer);
    displayEl.appendChild(artPreview);
    displayEl.appendChild(productDetails);
    
    // Show the modal
    const modal = document.getElementById('productCreatedModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Handle the close button - reset canvas only after confirmation
    const closeBtn = document.getElementById('closeProductModal');
    if (closeBtn) {
        // Remove existing event listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            resetCanvas(); // Clear canvas for next creation
        });
    }
}

// Flood fill algorithm
function floodFill(x, y, fillColor) {
    if (!painter.ctx) return;
    
    // Get canvas data
    const imageData = painter.ctx.getImageData(0, 0, painter.canvas.width, painter.canvas.height);
    const data = imageData.data;
    
    // Get target color (color at the clicked position)
    const targetColor = getPixelColor(imageData, x, y);
    
    // Convert fill color string to RGBA values
    const fillRgb = hexToRgb(fillColor);
    const fillR = fillRgb.r;
    const fillG = fillRgb.g;
    const fillB = fillRgb.b;
    
    // Don't fill if clicking on the same color
    if (colorMatch(targetColor, [fillR, fillG, fillB, 255])) {
        return;
    }
    
    // Queue for flood fill
    const queue = [];
    queue.push([x, y]);
    
    while (queue.length > 0) {
        const [curX, curY] = queue.shift();
        
        // Skip if out of bounds
        if (curX < 0 || curY < 0 || curX >= painter.canvas.width || curY >= painter.canvas.height) {
            continue;
        }
        
        // Get current pixel color
        const currentColor = getPixelColor(imageData, curX, curY);
        
        // Skip if not the target color
        if (!colorMatch(currentColor, targetColor)) {
            continue;
        }
        
        // Set color of current pixel
        setPixelColor(imageData, curX, curY, fillR, fillG, fillB, 255);
        
        // Add neighboring pixels to queue
        queue.push([curX + 1, curY]);
        queue.push([curX - 1, curY]);
        queue.push([curX, curY + 1]);
        queue.push([curX, curY - 1]);
    }
    
    // Put the modified pixels back on the canvas
    painter.ctx.putImageData(imageData, 0, 0);
}

// Get color of a pixel from ImageData
function getPixelColor(imageData, x, y) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    return [
        data[index],
        data[index + 1],
        data[index + 2],
        data[index + 3]
    ];
}

// Set color of a pixel in ImageData
function setPixelColor(imageData, x, y, r, g, b, a) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
    data[index + 3] = a;
}

// Check if two colors match with some tolerance
function colorMatch(color1, color2) {
    const tolerance = 10;
    return Math.abs(color1[0] - color2[0]) <= tolerance &&
           Math.abs(color1[1] - color2[1]) <= tolerance &&
           Math.abs(color1[2] - color2[2]) <= tolerance &&
           Math.abs(color1[3] - color2[3]) <= tolerance;
}

// Convert hex color to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// Debug function that can be called from console
window.debugArtPosition = function() {
    console.log("Current art data:", painter.artDataUrl);
    console.log("Selected product:", painter.selectedProduct);
    
    // Show current positions
    const pos = painter.selectedProduct.artPosition;
    console.log("Art position:", pos);
    
    // Create test overlay
    const testOverlay = document.createElement('div');
    testOverlay.style.position = 'absolute';
    testOverlay.style.border = '2px solid red';
    testOverlay.style.top = `${pos.y}px`;
    testOverlay.style.left = `${pos.x}px`;
    testOverlay.style.width = `${pos.width}px`;
    testOverlay.style.height = `${pos.height}px`;
    
    const previewEl = document.getElementById('productPreview');
    previewEl.appendChild(testOverlay);
    
    return "Debug overlay added - red box shows art position";
};

// Emergency fix function that can be called to restore functionality
window.emergencyFixPainter = function() {
    console.log("Running emergency painter fix...");
    
    // Reinitialize everything
    initializePainter();
    
    // Extra fixes for product options
    const productSelector = document.querySelector('.product-selector');
    if (productSelector && (!productSelector.children.length || productSelector.children.length < 2)) {
        createProductOptions();
        
        // Select first product
        if (productTemplates && productTemplates.length > 0) {
            selectProduct(productTemplates[0].id);
        }
    }
    
    // Fix color picker
    const colorPicker = document.querySelector('.color-picker');
    if (colorPicker && (!colorPicker.children.length || colorPicker.children.length < 2)) {
        createColorPalette();
    }
    
    return "Emergency fix applied!";
};
