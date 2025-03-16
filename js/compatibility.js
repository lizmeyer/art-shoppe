/**
 * Compatibility Layer
 * Provides backward compatibility with original function names
 */

// Game initialization compatibility
function initGame() {
    return gameState.init();
}

// UI update compatibility
function updateCoins() {
    if (UI && typeof UI.updateCoinsDisplay === 'function') {
        UI.updateCoinsDisplay();
    }
}

// Add other compatibility functions as needed
function updateDay() {
    if (UI && typeof UI.updateDayDisplay === 'function') {
        UI.updateDayDisplay();
    }
}

function saveGame() {
    return gameState.saveGame();
}

function loadGame() {
    return gameState.loadGame();
}

function displayProduct(productId, displayId) {
    if (UI && typeof UI.displayProduct === 'function') {
        return UI.displayProduct(productId, displayId);
    }
    return gameState.displayProduct(productId, displayId);
}

function addToInventory(product) {
    return gameState.addToInventory(product);
}

function removeFromDisplay(displayId) {
    return gameState.removeFromDisplay(displayId);
}

function sellProduct(productId, price) {
    return gameState.sellProduct(productId, price);
}

function startNewDay() {
    if (UI && typeof UI.startNewDay === 'function') {
        UI.startNewDay();
    } else {
        gameState.startNewDay();
    }
}
