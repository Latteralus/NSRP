/**
 * RedM Blacksmith Business Tool - UI and Utility Helpers
 * 
 * This file contains utility functions and UI-related helpers 
 * used across the application.
 */

/**
 * Show a modal dialog
 * @param {string} title - The modal title
 * @param {string} content - The modal content HTML
 * @param {Function} onConfirm - The function to call when confirmed
 */
function showModal(title, content, onConfirm) {
    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    
    // Set up confirm button
    if (onConfirm) {
        elements.modalConfirm.onclick = onConfirm;
        elements.modalConfirm.style.display = 'block';
    } else {
        elements.modalConfirm.style.display = 'none';
    }
    
    // Show modal
    elements.modalContainer.classList.add('active');
}

/**
 * Close the modal dialog
 */
function closeModal() {
    elements.modalContainer.classList.remove('active');
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    updateTheme();
    
    // Update settings form if on settings page
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
        themeSelect.value = appState.theme;
    }
}

/**
 * Update theme based on app state
 */
function updateTheme() {
    const body = document.body;
    const themeIcon = elements.themeToggle.querySelector('i');
    
    if (appState.theme === 'dark') {
        body.classList.add('dark-theme');
        themeIcon.className = 'fas fa-sun';
    } else {
        body.classList.remove('dark-theme');
        themeIcon.className = 'fas fa-moon';
    }
}

/**
 * Update currency symbols throughout the app
 */
function updateCurrencyDisplay() {
    const currencyElements = document.querySelectorAll('.currency-symbol');
    currencyElements.forEach(element => {
        element.textContent = appState.currency;
    });
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
function formatCurrency(amount) {
    return `${appState.currency}${amount.toFixed(2)}`;
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Toggle recipe details visibility
 * @param {HTMLElement} element - The recipe header element
 */
function toggleRecipe(element) {
    element.classList.toggle('active');
    const details = element.nextElementSibling;
    if (details.classList.contains('active')) {
        details.classList.remove('active');
    } else {
        details.classList.add('active');
    }
}

/**
 * Create an alert element
 * @param {string} type - The type of alert
 * @param {string} title - The alert title
 * @param {string} message - The alert message
 * @param {string} actionText - The action button text
 * @returns {HTMLElement} The alert element
 */
function createAlertElement(type, title, message, actionText) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert-item ${type}`;
    
    let icon = 'exclamation-triangle';
    if (type === 'low-stock') icon = 'boxes';
    if (type === 'profit-warning') icon = 'chart-line';
    
    alertElement.innerHTML = `
        <div class="alert-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="alert-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <div class="alert-action">
            <button class="btn btn-small">${actionText}</button>
        </div>
    `;
    
    // Add event listener to action button
    const actionButton = alertElement.querySelector('.btn');
    actionButton.addEventListener('click', () => handleAlertAction(type, message));
    
    return alertElement;
}

/**
 * Handle alert action button click
 * @param {string} type - The type of alert
 * @param {string} message - The alert message
 */
function handleAlertAction(type, message) {
    // Extract item name from message
    const itemName = message.split(' is ')[0].split(' has ')[0];
    
    switch (type) {
        case 'low-stock':
            navigateTo('inventory');
            // Focus on the item in inventory
            setTimeout(() => {
                const inventorySearch = document.querySelector('.filters input[type="text"]');
                if (inventorySearch) {
                    inventorySearch.value = itemName;
                    inventorySearch.dispatchEvent(new Event('input'));
                }
            }, 300);
            break;
        case 'profit-warning':
            navigateTo('pricing');
            // Focus on the item in pricing
            setTimeout(() => {
                const priceItemSelect = document.getElementById('price-item');
                if (priceItemSelect) {
                    Array.from(priceItemSelect.options).forEach((option, index) => {
                        if (option.text === itemName) {
                            priceItemSelect.selectedIndex = index;
                            priceItemSelect.dispatchEvent(new Event('change'));
                        }
                    });
                }
            }, 300);
            break;
    }
}

/**
 * Get settings display updated
 */
function updateSettingsDisplay() {
    // Update theme selector
    const themeSelect = document.getElementById('setting-theme');
    if (themeSelect) {
        themeSelect.value = appState.theme;
    }
    
    // Update animations checkbox
    const animationsCheckbox = document.getElementById('setting-animations');
    if (animationsCheckbox) {
        animationsCheckbox.checked = appState.animations;
    }
    
    // Update currency input
    const currencyInput = document.getElementById('setting-currency');
    if (currencyInput) {
        currencyInput.value = appState.currency;
    }
    
    // Update shop name input
    const shopNameInput = document.getElementById('setting-shop-name');
    if (shopNameInput) {
        shopNameInput.value = appState.shopName;
    }
    
    // Update tax rate input
    const taxRateInput = document.getElementById('setting-tax-rate');
    if (taxRateInput) {
        taxRateInput.value = appState.taxRate;
    }
    
    // Update low stock threshold input
    const lowStockInput = document.getElementById('setting-low-stock');
    if (lowStockInput) {
        lowStockInput.value = appState.lowStockThreshold;
    }
}

/**
 * Update inventory status based on low stock threshold
 */
function updateInventoryStatus() {
    // This function would be called when low stock threshold changes
    // You might want to add additional logic here in the future
    updateDashboardAlerts();
}