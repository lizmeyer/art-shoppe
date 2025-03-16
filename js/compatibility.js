/**
 * Comprehensive Compatibility Layer for Cozy Artist Shop
 * 
 * This file maps original function names to the new object-oriented structure.
 * It ensures backward compatibility while allowing for code modernization.
 */

//------------------------------------------------------
// Game State Functions
//------------------------------------------------------

// Core game initialization and state management
function initGame() { 
    if (typeof gameState === 'undefined') return null;
    return gameState.init(); 
}

function saveGame() { 
    if (typeof gameState === 'undefined') return false;
    return gameState.saveGame(); 
}

function loadGame() { 
    if (typeof gameState === 'undefined') return false;
    return gameState.loadGame(); 
}

function resetGame() {
    if (typeof gameState === 'undefined') return false;
    return gameState.resetGame();
}

// Shop displays
function initializeShopDisplays() { 
    if (typeof gameState === 'undefined') return;
    return gameState.initializeShopDisplays(); 
}

// Product management
function addToInventory(product) { 
    if (typeof gameState === 'undefined') return null;
    return gameState.addToInventory(product); 
}

function displayProduct(productId, displayId) { 
    if (typeof gameState === 'undefined') return false;
    if (typeof UI !== 'undefined' && typeof UI.displayProduct === 'function') {
        return UI.displayProduct(productId, displayId);
    }
    return gameState.displayProduct(productId, displayId); 
}

function removeFromDisplay(displayId) { 
    if (typeof gameState === 'undefined') return false;
    return gameState.removeFromDisplay(displayId); 
}

function sellProduct(productId, price) { 
    if (typeof gameState === 'undefined') return false;
    return gameState.sellProduct(productId, price); 
}

function getProductTemplate(templateId) { 
    if (typeof gameState === 'undefined') return null;
    return gameState.getProductTemplate(templateId); 
}

function getDisplayedProducts() {
    if (typeof gameState === 'undefined') return [];
    return gameState.getDisplayedProducts();
}

// Day and time progression
function startNewDay() { 
    if (typeof gameState === 'undefined') return 1;
    
    if (typeof UI !== 'undefined' && typeof UI.startNewDay === 'function') {
        return UI.startNewDay();
    }
    
    return gameState.startNewDay(); 
}

// Customer management
function generateCustomer() {
    if (typeof gameState === 'undefined') return null;
    return gameState.generateCustomer();
}

function calculateCustomerInterest(customer, product) {
    if (typeof gameState === 'undefined') return 0;
    return gameState.calculateCustomerInterest(customer, product);
}

//------------------------------------------------------
// UI Functions
//------------------------------------------------------

// Status display updates
function updateCoins() { 
    if (typeof UI === 'undefined') return;
    return UI.updateCoinsDisplay(); 
}

function updateDayCounter() { 
    if (typeof UI === 'undefined') return;
    return UI.updateDayDisplay(); 
}

function updateDay() { 
    if (typeof UI === 'undefined') return;
    return UI.updateDayDisplay(); 
}

// Rendering functions
function renderShopDisplays() { 
    if (typeof UI === 'undefined') return;
    return UI.renderShopDisplays(); 
}

function renderInventory() { 
    if (typeof UI === 'undefined') return;
    return UI.renderInventory(); 
}

function renderCustomers() { 
    if (typeof UI === 'undefined') return;
    return UI.renderCustomers(); 
}

function renderProductSelector() {
    if (typeof UI === 'undefined') return;
    return UI.renderProductSelector();
}

function renderColorPalette() {
    if (typeof UI === 'undefined') return;
    return UI.renderColorPalette();
}

function updateAllUI() { 
    if (typeof UI === 'undefined') return;
    return UI.updateAllUI(); 
}

// Notification system
function showNotification(message, duration) { 
    if (typeof UI === 'undefined') return;
    return UI.showNotification(message, duration); 
}

// Customer generation and interaction
function generateCustomers() { 
    if (typeof UI === 'undefined') return;
    return UI.generateCustomers(); 
}

function showCustomerPreferences(customer) {
    if (typeof UI === 'undefined') return;
    return UI.showCustomerPreferences(customer);
}

// View and navigation
function changeView(viewName) { 
    if (typeof UI === 'undefined') return;
    return UI.changeView(viewName); 
}

function changeTab(tabName) { 
    if (typeof UI === 'undefined') return;
    return UI.changeTab(tabName); 
}

// Theme management
function updateTheme() { 
    if (typeof UI === 'undefined') return;
    return UI.updateTheme(); 
}

function changeTheme(theme) { 
    if (typeof UI === 'undefined') return;
    return UI.changeTheme(theme); 
}

// Tutorial
function showTutorial() {
    if (typeof UI === 'undefined') return;
    return UI.showTutorial();
}

function showTutorialStep(step) {
    if (typeof UI === 'undefined') return;
    return UI.showTutorialStep(step);
}

function showNextTutorialStep() {
    if (typeof UI === 'undefined') return;
    return UI.showNextTutorialStep();
}

// Loading screen
function showLoading() {
    if (typeof UI === 'undefined') return;
    return UI.showLoading();
}

function hideLoading() {
    if (typeof UI === 'undefined') return;
    return UI.hideLoading();
}

function startGame() {
    if (typeof UI === 'undefined') return;
    return UI.startGame();
}

// Canvas and drawing
function initializeCanvas() {
    if (typeof UI === 'undefined') return;
    return UI.initializeCanvas();
}

function clearCanvas() {
    if (typeof UI === 'undefined') return;
    return UI.clearCanvas();
}

function selectProduct(productId) {
    if (typeof UI === 'undefined') return;
    return UI.selectProduct(productId);
}

function selectColor(color) {
    if (typeof UI === 'undefined') return;
    return UI.selectColor(color);
}

function startDrawing(event) {
    if (typeof UI === 'undefined') return;
    return UI.startDrawing(event);
}

function draw(event) {
    if (typeof UI === 'undefined') return;
    return UI.draw(event);
}

function stopDrawing() {
    if (typeof UI === 'undefined') return;
    return UI.stopDrawing();
}

function saveArtwork() {
    if (typeof UI === 'undefined') return;
    return UI.saveArtwork();
}

function showProductPreview(product) {
    if (typeof UI === 'undefined') return;
    return UI.showProductPreview(product);
}

function showDisplaySelection(productId) {
    if (typeof UI === 'undefined') return;
    return UI.showDisplaySelection(productId);
}

// Console logging wrapper (for debugging)
function logDebug(message) {
    console.log(`[Debug] ${message}`);
}
