/**
 * Minimal UI Implementation for Cozy Artist Shop
 * This version focuses on reliable initialization
 */

// Create UI object with fallbacks and error handling
const UI = {
  // Initialize with safety checks
  init() {
    try {
      console.log('Starting UI initialization');
      
      // Basic state checks
      if (typeof gameState === 'undefined') {
        console.warn('gameState not found, creating fallback');
        window.gameState = window.gameState || {
          data: {
            coins: 100,
            day: 1,
            inventory: [],
            shopDisplays: [],
            settings: { theme: 'pastel' },
            activeCustomers: []
          },
          saveGame: function() { return true; }
        };
      }
      
      // Cache essential DOM elements
      this.cacheElements();
      
      // Update basic UI elements
      this.updateBasicUI();
      
      console.log('UI initialization complete');
      return true;
    } catch (error) {
      console.error('UI initialization failed:', error);
      return false;
    }
  },
  
  // Cache DOM element references safely
  cacheElements() {
    this.elements = {
      coinDisplay: document.getElementById('coinDisplay'),
      dayDisplay: document.getElementById('dayDisplay'),
      shopDisplays: document.getElementById('shopDisplays'),
      inventoryItems: document.getElementById('inventoryItems'),
      customerArea: document.getElementById('customerArea'),
      canvas: document.querySelector('canvas')
    };
    
    console.log('UI elements cached:', 
      Object.keys(this.elements).filter(key => this.elements[key] !== null).length, 
      'elements found');
  },
  
  // Update basic UI elements
  updateBasicUI() {
    try {
      // Update coins display
      if (this.elements.coinDisplay) {
        this.elements.coinDisplay.textContent = gameState.data.coins;
      }
      
      // Update day display
      if (this.elements.dayDisplay) {
        this.elements.dayDisplay.textContent = gameState.data.day;
      }
      
      // Apply theme
      document.body.setAttribute('data-theme', 
        gameState.data.settings?.theme || 'pastel');
    } catch (error) {
      console.warn('Error updating basic UI:', error);
    }
  },
  
  // Safe rendering methods with error checking
  renderInventory() {
    try {
      if (!this.elements.inventoryItems) return;
      this.elements.inventoryItems.innerHTML = '<div class="inventory-item">Inventory rendering disabled</div>';
    } catch (error) {
      console.warn('Error rendering inventory:', error);
    }
  },
  
  renderShopDisplays() {
    try {
      if (!this.elements.shopDisplays) return;
      this.elements.shopDisplays.innerHTML = '<div class="shop-display">Display rendering disabled</div>';
    } catch (error) {
      console.warn('Error rendering shop displays:', error);
    }
  },
  
  renderCustomers() {
    try {
      if (!this.elements.customerArea) return;
      this.elements.customerArea.innerHTML = '<div class="customer">Customer rendering disabled</div>';
    } catch (error) {
      console.warn('Error rendering customers:', error);
    }
  },
  
  // These methods are stubs to prevent errors
  updateCoinDisplay() { this.updateBasicUI(); },
  updateDayDisplay() { this.updateBasicUI(); },
  updateAllUI() { this.updateBasicUI(); },
  changeView() {},
  showNotification() {}
};

// Compatibility with both naming conventions
const ui = UI;

// Add global error handler
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.error);
});

// Initialize UI when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing UI');
  UI.init();
});

// Backup initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Document already loaded, initializing UI now');
  setTimeout(function() {
    UI.init();
  }, 100);
}
