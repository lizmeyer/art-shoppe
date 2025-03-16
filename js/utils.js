/**
 * Utility Functions for Cozy Artist Shop
 * Contains helper functions used throughout the application
 */

const Utils = {
    /**
     * Generate a unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} A unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    },
    
    /**
     * Show a toast notification
     * @param {string} message - The message to show
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, duration);
    },
    
    /**
     * Show an error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        const errorScreen = document.getElementById('errorScreen');
        const errorMessage = document.getElementById('errorMessage');
        const gameContainer = document.getElementById('gameContainer');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        if (errorScreen) {
            errorScreen.classList.remove('hidden');
        }
        
        if (gameContainer) {
            gameContainer.classList.add('hidden');
        }
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        console.error('Game Error:', message);
    },
    
    /**
     * Get a random item from an array
     * @param {Array} array - The array to select from
     * @returns {*} A random item from the array
     */
    randomItem(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Get a random number between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} A random number
     */
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Format a number with commas for thousands
     * @param {number} number - The number to format
     * @returns {string} Formatted number
     */
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Check if the device is mobile
     * @returns {boolean} True if device is mobile
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Create a modal dialog
     * @param {Object} options - Modal options
     * @param {string} options.title - The modal title
     * @param {string} options.content - HTML content for the modal body
     * @param {Array} options.buttons - Array of button configs {text, type, onClick}
     * @returns {HTMLElement} The created modal element
     */
    createModal(options) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        let buttonsHtml = '';
        if (options.buttons && options.buttons.length) {
            buttonsHtml = options.buttons.map(btn => {
                const type = btn.type || 'secondary-button';
                return `<button class="button ${type}" data-action="${btn.action || ''}">${btn.text}</button>`;
            }).join('');
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${options.title || 'Modal'}</h3>
                    <button class="close-modal" data-action="close">×</button>
                </div>
                <div class="modal-body">
                    ${options.content || ''}
                    ${options.buttons && options.buttons.length ? `<div class="modal-actions">${buttonsHtml}</div>` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        if (options.buttons) {
            options.buttons.forEach(btn => {
                modal.querySelectorAll(`button[data-action="${btn.action || ''}"]`).forEach(button => {
                    button.addEventListener('click', () => {
                        if (typeof btn.onClick === 'function') {
                            btn.onClick();
                        }
                        document.body.removeChild(modal);
                    });
                });
            });
        }
        
        // Add to DOM
        document.body.appendChild(modal);
        return modal;
    },
    
    /**
     * Check if local storage is available
     * @returns {boolean} True if localStorage is available
     */
    isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Safely parse JSON
     * @param {string} json - The JSON string to parse
     * @param {*} fallback - Fallback value if parsing fails
     * @returns {*} The parsed object or fallback value
     */
    safeJSONParse(json, fallback = null) {
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return fallback;
        }
    }
};
