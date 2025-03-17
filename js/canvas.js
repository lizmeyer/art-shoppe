/**
 * Canvas Painter - A clean implementation of drawing functionality
 * for the Art Shop game
 */

const CanvasPainter = {
  // DOM Elements
  canvas: null,
  ctx: null,
  colorPalette: null,
  brushSizeSlider: null,
  clearButton: null,
  createProductButton: null,
  productSelector: null,

  // Drawing state
  isDrawing: false,
  currentColor: '#000000',
  brushSize: 5,
  lastX: 0,
  lastY: 0,
  selectedProduct: {
    id: 'mug',
    name: 'Mug',
    basePrice: 8,
    image: 'assets/images/products/mug.png'
  },

  // Initialize the painter
  init() {
    console.log('Initializing Canvas Painter');
    this.findElements();
    
    if (!this.canvas) {
      console.error('Canvas element not found!');
      return false;
    }
    
    this.setupCanvas();
    this.setupEventListeners();
    this.createColorPalette();
    this.setupProductOptions();
    
    console.log('Canvas Painter initialized');
    return true;
  },

  // Find all required DOM elements
  findElements() {
    this.canvas = document.querySelector('canvas');
    this.colorPalette = document.querySelector('.colors, #colors');
    this.brushSizeSlider = document.querySelector('input[type="range"]');
    this.clearButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Clear');
    this.createProductButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim() === 'Create Product');
    this.productSelector = document.querySelector('select');
  },

  // Set up the canvas for drawing
  setupCanvas() {
    this.ctx = this.canvas.getContext('2d');
    
    // Make sure canvas is cleared with white background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set initial drawing properties
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.brushSize;
    this.ctx.strokeStyle = this.currentColor;
  },

  // Set up event listeners for drawing and controls
  setupEventListeners() {
    // Canvas drawing events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });
    
    this.canvas.addEventListener('touchend', () => {
      const mouseEvent = new MouseEvent('mouseup');
      this.canvas.dispatchEvent(mouseEvent);
    });
    
    // Brush size slider
    if (this.brushSizeSlider) {
      this.brushSizeSlider.addEventListener('input', (e) => {
        this.brushSize = parseInt(e.target.value);
        this.ctx.lineWidth = this.brushSize;
      });
    }
    
    // Clear button
    if (this.clearButton) {
      this.clearButton.addEventListener('click', this.clearCanvas.bind(this));
    }
    
    // Create product button
    if (this.createProductButton) {
      this.createProductButton.addEventListener('click', this.createProduct.bind(this));
    }
    
    // Product selector
    if (this.productSelector) {
      this.productSelector.addEventListener('change', (e) => {
        const productId = e.target.value.toLowerCase();
        this.selectProduct(productId);
      });
    }
  },

  // Create color palette if not present
  createColorPalette() {
    if (!this.colorPalette) {
      console.warn('Color palette element not found, creating one');
      
      // Create container if needed
      const container = document.createElement('div');
      container.className = 'colors';
      container.id = 'colors';
      container.style.display = 'flex';
      container.style.flexWrap = 'wrap';
      container.style.gap = '10px';
      container.style.marginBottom = '20px';
      
      // Add title
      const title = document.createElement('h3');
      title.textContent = 'Colors';
      title.style.width = '100%';
      container.appendChild(title);
      
      // Add before canvas
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.insertBefore(container, this.canvas);
        this.colorPalette = container;
      }
    }
    
    // Add color swatches
    const colors = [
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
    
    // Clear existing swatches
    if (this.colorPalette.querySelector('.color-swatch')) {
      return; // Don't recreate if swatches already exist
    }
    
    colors.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.width = '30px';
      swatch.style.height = '30px';
      swatch.style.borderRadius = '50%';
      swatch.style.backgroundColor = color;
      swatch.style.cursor = 'pointer';
      swatch.style.border = color === this.currentColor ? '3px solid #000' : '1px solid #ccc';
      
      swatch.addEventListener('click', () => {
        this.selectColor(color);
        
        // Update selected swatch visual
        document.querySelectorAll('.color-swatch').forEach(s => {
          s.style.border = '1px solid #ccc';
        });
        swatch.style.border = '3px solid #000';
      });
      
      this.colorPalette.appendChild(swatch);
    });
  },

  // Set up product options
  setupProductOptions() {
    if (!this.productSelector) return;
    
    // Clear existing options
    this.productSelector.innerHTML = '';
    
    // Define available products
    const products = [
      { id: 'mug', name: 'Mug', basePrice: 8 },
      { id: 'tote', name: 'Tote Bag', basePrice: 12 },
      { id: 'shirt', name: 'T-Shirt', basePrice: 15 },
      { id: 'poster', name: 'Poster', basePrice: 10 }
    ];
    
    // Add options to selector
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      this.productSelector.appendChild(option);
    });
    
    // Select initial product
    this.selectProduct(this.productSelector.value);
  },

  // Start drawing
  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  },

  // Draw on canvas
  draw(e) {
    if (!this.isDrawing) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    
    this.lastX = currentX;
    this.lastY = currentY;
  },

  // Stop drawing
  stopDrawing() {
    this.isDrawing = false;
  },

  // Select a color
  selectColor(color) {
    this.currentColor = color;
    this.ctx.strokeStyle = color;
    console.log('Selected color:', color);
  },

  // Select a product
  selectProduct(productId) {
    const products = [
      { id: 'mug', name: 'Mug', basePrice: 8, image: 'assets/images/products/mug.png' },
      { id: 'tote', name: 'Tote Bag', basePrice: 12, image: 'assets/images/products/tote.png' },
      { id: 'shirt', name: 'T-Shirt', basePrice: 15, image: 'assets/images/products/tshirt.png' },
      { id: 'poster', name: 'Poster', basePrice: 10, image: 'assets/images/products/poster.png' }
    ];
    
    this.selectedProduct = products.find(p => p.id === productId) || products[0];
    console.log('Selected product:', this.selectedProduct.name);
  },

  // Clear the canvas
  clearCanvas() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    console.log('Canvas cleared');
  },

  // Create a product from the canvas
  createProduct() {
    try {
      console.log('Creating product from canvas');
      
      // Get canvas content as data URL
      const artDataUrl = this.canvas.toDataURL('image/png');
      
      // Calculate price
      const basePrice = this.selectedProduct.basePrice;
      const finalPrice = basePrice + Math.floor(Math.random() * 8) + 5;
      
      // Create product object
      const newProduct = {
        id: 'product-' + Date.now(),
        templateId: this.selectedProduct.id,
        name: `${this.selectedProduct.name} with Custom Art`,
        price: finalPrice,
        imageUrl: this.selectedProduct.image || `assets/images/products/${this.selectedProduct.id}.png`,
        artUrl: artDataUrl,
        created: new Date().toISOString()
      };
      
      console.log('Product created:', newProduct);
      
      // Show product preview modal
      this.showProductPreview(newProduct);
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product: ' + error.message);
    }
  },

  // Show product preview modal
  showProductPreview(product) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'product-modal';
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
    
    // Create modal content
    modal.innerHTML = `
      <div style="background-color: #ffeef2; border-radius: 10px; padding: 20px; max-width: 90%; width: 500px; position: relative;">
        <h2 style="margin-top: 0; text-align: center;">Product Created!</h2>
        <button id="closeModal" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        
        <div style="position: relative; width: 200px; height: 200px; margin: 0 auto;">
          <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">
          <img src="${product.artUrl}" alt="Custom Art" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; height: 60%;">
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <h3 style="margin: 5px 0;">${product.name}</h3>
          <p style="margin: 5px 0;">Price: ${product.price} coins</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <button id="addToShop" style="background-color: #ffb0c8; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer;">Add to Shop</button>
          <button id="addToInventory" style="background-color: white; color: #333; border: 1px solid #ddd; padding: 10px 20px; border-radius: 20px; cursor: pointer;">Add to Inventory</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Set up event listeners
    document.getElementById('closeModal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    document.getElementById('addToShop').addEventListener('click', () => {
      this.addToShop(product);
      document.body.removeChild(modal);
    });
    
    document.getElementById('addToInventory').addEventListener('click', () => {
      this.addToInventory(product);
      document.body.removeChild(modal);
    });
  },

  // Add product to shop
  addToShop(product) {
    console.log('Adding product to shop:', product);
    
    // Add to inventory first
    const addedToInventory = this.addToInventory(product);
    if (!addedToInventory) return false;
    
    // Find an empty display spot
    const displaySpot = this.findEmptyDisplaySpot();
    if (!displaySpot) {
      alert('No empty display spots available. Please remove some items first.');
      return false;
    }
    
    // Display product
    if (window.gameState && typeof window.gameState.displayProduct === 'function') {
      const result = window.gameState.displayProduct(product.id, displaySpot.id);
      console.log('Product added to shop display:', result);
      
      // Update UI
      this.updateAllUI();
      
      return result;
    } else {
      console.error('gameState.displayProduct function not available');
      alert('Cannot display product in shop. Try adding to inventory instead.');
      return false;
    }
  },

  // Add product to inventory
  addToInventory(product) {
    console.log('Adding product to inventory:', product);
    
    if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.inventory)) {
      // Add to inventory
      window.gameState.data.inventory.push(product);
      
      // Save game
      if (typeof window.gameState.saveGame === 'function') {
        window.gameState.saveGame();
      }
      
      // Update UI
      this.updateAllUI();
      
      return true;
    } else {
      console.error('gameState.data.inventory is not available');
      alert('Game state not initialized correctly. Product created but not saved.');
      return false;
    }
  },

  // Find an empty display spot
  findEmptyDisplaySpot() {
    if (window.gameState && window.gameState.data && Array.isArray(window.gameState.data.shopDisplays)) {
      return window.gameState.data.shopDisplays.find(spot => !spot.filled);
    }
    return null;
  },

  // Update all UI components
  updateAllUI() {
    if (window.UI) {
      if (typeof window.UI.renderShopDisplays === 'function') {
        window.UI.renderShopDisplays();
      }
      if (typeof window.UI.renderInventory === 'function') {
        window.UI.renderInventory();
      }
      if (typeof window.UI.updateAllUI === 'function') {
        window.UI.updateAllUI();
      }
    }
  }
};

// Initialize the canvas painter when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a short moment to ensure DOM is ready
  setTimeout(() => {
    CanvasPainter.init();
  }, 500);
});
