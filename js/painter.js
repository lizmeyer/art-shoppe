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
    painter.canvas = document.getElementById('paintCanvas');
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
    if (productTemplates.length > 0) {
        selectProduct(productTemplates[0].id);
    }
}

// Reset the canvas to blank
function resetCanvas() {
    painter.ctx.fillStyle = 'white';
    painter.ctx.fillRect(0, 0, painter.canvas.width, painter.canvas.height);
    updateArtDataUrl();
}

// Set up event listeners for drawing
function setupPainterEvents() {
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
    document.getElementById('brushTool').addEventListener('click', () => setTool('brush'));
    document.getElementById('eraserTool').addEventListener('click', () => setTool('eraser'));
    document.getElementById('fillTool').addEventListener('click', () => setTool('fill'));
    document.getElementById('clearTool').addEventListener('click', () => resetCanvas());
    
    // Initialize brush sizes
    document.querySelectorAll('.brush-size').forEach(btn => {
        btn.addEventListener('click', () => {
            painter.brushSize = parseInt(btn.dataset.size);
            updateToolButtons();
        });
    });
    
    // Save button
    document.getElementById('saveProductButton').addEventListener('click', createProduct);
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
        updateArtDataUrl();
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
    
    // Update the data URL periodically
    if (Math.random() < 0.1) { // Only update 10% of the time for performance
        updateArtDataUrl();
    }
}

// Stop drawing
function stopDrawing() {
    painter.isDrawing = false;
    updateArtDataUrl();
}

// Update the art data URL for preview
function updateArtDataUrl() {
    painter.artDataUrl = painter.canvas.toDataURL('image/png');
    updateProductPreview();
}

// Create the color palette
function createColorPalette() {
    const colorPicker = document.querySelector('.color-picker');
    colorPicker.innerHTML = '';
    
    colorPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        
        if (color === painter.color) {
            swatch.classList.add('active');
        }
        
        swatch.addEventListener('click', () => {
            painter.color = color;
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            
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
    productSelector.innerHTML = '';
    
    productTemplates.forEach(product => {
        const option = document.createElement('div');
        option.className = 'product-option';
        option.dataset.product = product.id;
        
        // Create image element with fallback
        const img = document.createElement('img');
        img.alt = product.name;
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.objectFit = 'contain';
        
        // Handle image loading with fallback
        img.onerror = function() {
            // If image fails to load, create a fallback
            this.style.display = 'none';
            
            // Basic fallback for product display
            const fallback = document.createElement('div');
            fallback.style.width = '60px';
            fallback.style.height = '60px';
            fallback.style.backgroundColor = 'white';
            fallback.style.border = '2px solid var(--text-color)';
            fallback.style.borderRadius = '4px';
            fallback.style.display = 'flex';
            fallback.style.justifyContent = 'center';
            fallback.style.alignItems = 'center';
            fallback.textContent = product.name;
            option.appendChild(fallback);
        };
        
        img.src = product.image;
        
        // Create name element
        const name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = product.name;
        
        option.appendChild(img);
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
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    updateProductPreview();
}

// Update the product preview with current art
function updateProductPreview() {
    if (!painter.selectedProduct || !painter.artDataUrl) return;
    
    const previewEl = document.getElementById('productPreview');
    previewEl.innerHTML = '';
    
    // Create container for proper positioning
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Create product base image
    const baseImg = document.createElement('img');
    baseImg.className = 'product-base';
    baseImg.src = painter.selectedProduct.image;
    baseImg.style.width = '100%';
    baseImg.style.height = '100%';
    baseImg.style.objectFit = 'contain';
    
    // Create art overlay
    const artImg = document.createElement('img');
    artImg.className = 'product-art';
    artImg.src = painter.artDataUrl;
    artImg.style.position = 'absolute';
    artImg.style.top = '0';
    artImg.style.left = '0';
    artImg.style.width = '100%';
    artImg.style.height = '100%';
    artImg.style.mixBlendMode = 'multiply';
    
    // Apply positioning from template
    const pos = painter.selectedProduct.artPosition;
    artImg.style.top = `${pos.y}px`;
    artImg.style.left = `${pos.x}px`;
    artImg.style.width = `${pos.width}px`;
    artImg.style.height = `${pos.height}px`;
    if (pos.rotation) {
        artImg.style.transform = `rotate(${pos.rotation}deg)`;
    }
    
    container.appendChild(baseImg);
    container.appendChild(artImg);
    previewEl.appendChild(container);
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
    
    document.getElementById(`${painter.tool}Tool`).classList.add('active');
    
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
    
    console.log("Creating product with art:", painter.artDataUrl);
    
    // Add to inventory
    const newProduct = addToInventory(product);
    
    // Show created product
    showCreatedProduct(newProduct);
    
    // No need to clear canvas immediately, let the user see what they created
    // Only clear after they confirm
}

// Show the created product in a modal
function showCreatedProduct(product) {
    console.log("Showing created product:", product);
    
    const displayEl = document.getElementById('createdProductDisplay');
    displayEl.innerHTML = '';
    
    // Create a container with proper positioning
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '200px';
    container.style.height = '200px';
    container.style.margin = '0 auto';
    container.style.backgroundColor = 'white';
    container.style.borderRadius = 'var(--border-radius)';
    
    // Get the template
    const template = getProductTemplate(product.templateId);
    console.log("Template:", template);
    
    // Create product base image
    const baseImg = document.createElement('img');
    baseImg.style.width = '100%';
    baseImg.style.height = '100%';
    baseImg.style.objectFit = 'contain';
    baseImg.style.position = 'absolute';
    baseImg.style.top = '0';
    baseImg.style.left = '0';
    baseImg.src = product.imageUrl;
    baseImg.alt = product.name;
    
    // Create art overlay
    const artImg = document.createElement('img');
    artImg.style.position = 'absolute';
    artImg.style.mixBlendMode = 'multiply';
    artImg.src = product.artUrl;
    artImg.alt = "Your Art";
    
    // Apply positioning from template
    const pos = template.artPosition;
    
    // Apply scaling appropriate for the modal size
    const scaleFactor = 0.5; // Adjust based on your modal size
    artImg.style.top = `${pos.y * scaleFactor}px`;
    artImg.style.left = `${pos.x * scaleFactor}px`;
    artImg.style.width = `${pos.width * scaleFactor}px`;
    artImg.style.height = `${pos.height * scaleFactor}px`;
    
    if (pos.rotation) {
        artImg.style.transform = `rotate(${pos.rotation}deg)`;
    }
    
    // Add a separate preview of just the art
    const artPreview = document.createElement('div');
    artPreview.style.marginTop = '10px';
    artPreview.innerHTML = `
        <p style="font-size: 0.9rem; margin: 5px 0;">Your Design:</p>
        <img src="${product.artUrl}" style="max-width: 80px; max-height: 80px; border: 1px solid #ddd; border-radius: 4px;">
    `;
    
    container.appendChild(baseImg);
    container.appendChild(artImg);
    displayEl.appendChild(container);
    displayEl.appendChild(artPreview);
    
    // Show the modal
    const modal = document.getElementById('productCreatedModal');
    modal.classList.add('active');
    
    // Close button should reset the canvas
    document.getElementById('closeProductModal').addEventListener('click', () => {
        modal.classList.remove('active');
        resetCanvas(); // Clear canvas after they confirm
    });
}

// Flood fill algorithm
function floodFill(x, y, fillColor) {
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
    
    return "Debug overlay
