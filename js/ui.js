/**
 * UI Functionality for Cozy Artist Shop
 * Handles user interface interactions and updates
 */

// Update the coin display
function updateCoins() {
    document.getElementById('coinCount').textContent = gameState.coins;
}

// Update the day counter
function updateDayCounter() {
    document.getElementById('dayCount').textContent = gameState.day;
}

// Show notification
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('active');
    
    // Hide after duration
    setTimeout(() => {
        notification.classList.remove('active');
    }, duration);
}

// Switch between tabs
// Switch between tabs
function switchTab(tabName) {
    console.log("Switching to tab:", tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) {
        targetTab.classList.add('active');
        
        // Refresh content when switching to inventory
        if (tabName === 'inventory' && typeof renderInventory === 'function') {
            console.log("Refreshing inventory display");
            renderInventory();
        }
    } else {
        console.error(`Tab "${tabName}Tab" not found!`);
    }
}

// Set up UI event listeners
function setupUIEvents() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Menu button
    document.getElementById('menuButton').addEventListener('click', () => {
        document.getElementById('menuModal').classList.add('active');
    });
    
    // Close menu button
    document.getElementById('closeMenuButton').addEventListener('click', () => {
        document.getElementById('menuModal').classList.remove('active');
    });
    
    // Save game button
    document.getElementById('saveGameButton').addEventListener('click', () => {
        if (saveGame()) {
            showNotification('Game saved successfully!');
            document.getElementById('menuModal').classList.remove('active');
        } else {
            showNotification('Failed to save game. Please try again.');
        }
    });
    
    // Theme button
    document.getElementById('changeThemeButton').addEventListener('click', () => {
        showThemeSelector();
    });
    
    // Help button
    document.getElementById('helpButton').addEventListener('click', () => {
        showHelpModal();
        document.getElementById('menuModal').classList.remove('active');
    });
}

// Show theme selector modal
function showThemeSelector() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Choose a Theme';
    
    const themes = document.createElement('div');
    themes.className = 'theme-options';
    
    // Theme options
    const themeOptions = [
        { id: 'pastel', name: 'Pastel Pink' },
        { id: 'mint', name: 'Mint Green' },
        { id: 'lavender', name: 'Lavender' }
    ];
    
    themeOptions.forEach(theme => {
        const option = document.createElement('div');
        option.className = 'theme-option';
        option.dataset.theme = theme.id;
        
        if (gameState.activeTheme === theme.id) {
            option.classList.add('active');
        }
        
        const name = document.createElement('h3');
        name.textContent = theme.name;
        
        option.appendChild(name);
        
        option.addEventListener('click', () => {
            setTheme(theme.id);
            
            // Update active class
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        });
        
        themes.appendChild(option);
    });
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', closeModal);
    
    modalContent.appendChild(title);
    modalContent.appendChild(themes);
    modalContent.appendChild(closeBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Set theme
function setTheme(themeId) {
    document.body.dataset.theme = themeId;
    gameState.activeTheme = themeId;
    showNotification(`Theme changed to ${themeId}!`);
}

// Show help modal
function showHelpModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'How to Play';
    
    const content = document.createElement('div');
    content.innerHTML = `
        <h3>Welcome to Cozy Artist Shop!</h3>
        <p>Create unique art and sell it on products in your very own shop.</p>
        
        <h4>Art Studio</h4>
        <p>Use the painting tools to create designs, then apply them to products like mugs, shirts, and more!</p>
        
        <h4>Inventory</h4>
        <p>View all your created products. Set prices and manage your stock.</p>
        
        <h4>Shop</h4>
        <p>Display your products and open your shop to attract customers. Different customers have different tastes!</p>
        
        <h4>Tips:</h4>
        <ul>
            <li>Create products that match current trends to increase sales</li>
            <li>Set prices strategically - too high might scare customers away</li>
            <li>Try different product types - some customers prefer mugs, others like t-shirts</li>
            <li>Save your game often!</li>
        </ul>
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Got It!';
    closeBtn.className = 'accent-button';
    closeBtn.addEventListener('click', closeModal);
    
    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modalContent.appendChild(closeBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Show first-time tutorial
function showTutorial() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Welcome to Your Art Shop!';
    
    const content = document.createElement('div');
    content.innerHTML = `
        <p>Congratulations! You've just opened your very own art shop in the heart of the cozy town of Meadowview.</p>
        
        <p>After years of creating art as a hobby, you've finally taken the leap to turn your passion into a business. Your small shop has space to display handcrafted items featuring your unique designs.</p>
        
        <p>The townsfolk are excited to see what you'll create, and tourists passing through are always looking for special souvenirs to take home.</p>
        
        <h4>How to get started:</h4>
        <ol>
            <li>First, visit your <strong>Art Studio</strong> to design beautiful art patterns</li>
            <li>Apply your designs to products like mugs, t-shirts, tote bags, and posters</li>
            <li>Set appropriate prices in your <strong>Inventory</strong></li>
            <li>Display your creations in your <strong>Shop</strong></li>
            <li>Open for business and attract customers!</li>
        </ol>
        
        <p>Each customer has their own taste and budget. Pay attention to what sells well and create more of what people love!</p>
        
        <p>Are you ready to become Meadowview's most beloved artist and shopkeeper?</p>
    `;
    
    const startBtn = document.createElement('button');
    startBtn.textContent = "Begin My Art Journey!";
    startBtn.className = 'accent-button';
    startBtn.addEventListener('click', () => {
        gameState.tutorialComplete = true;
        saveGame();
        closeModal();
        
        // Switch to studio tab to guide the player
        switchTab('studio');
    });
    
    modalContent.appendChild(title);
    modalContent.appendChild(content);
    modalContent.appendChild(startBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Loading screen functions
function initializeLoadingScreen() {
    const loadingBar = document.getElementById('loadingBar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += 5;
        loadingBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
                
                // Show tutorial for new players
                if (!gameState.tutorialComplete) {
                    setTimeout(showTutorial, 500);
                }
            }, 500);
        }
    }, 100);
}
