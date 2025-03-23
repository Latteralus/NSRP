/**
 * RedM Blacksmith Business Tool - Main App
 * 
 * This file contains the core application logic including:
 * - Navigation and UI controls
 * - Theme switching
 * - Data initialization
 * - Global utilities
 */

// Application State
const appState = {
    currentSection: 'dashboard',
    theme: 'light',
    currency: '$',
    animations: true,
    shopName: 'My Blacksmith Shop',
    taxRate: 8,
    lowStockThreshold: 10
};

// DOM Elements
const elements = {
    sidebar: document.querySelector('.sidebar'),
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.content-section'),
    themeToggle: document.getElementById('theme-toggle'),
    saveDataBtn: document.getElementById('save-data'),
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    modalContainer: document.getElementById('modal-container'),
    modalClose: document.querySelector('.modal-close'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalCancel: document.getElementById('modal-cancel'),
    modalConfirm: document.getElementById('modal-confirm')
};

// =========================
// Core Functionality
// =========================

/**
 * Initialize the application
 */
function initApp() {
    // Load saved data if available
    loadSavedData();
    
    // Set date input defaults
    const defaultDate = new Date();
    document.getElementById('prod-timeline').valueAsDate = defaultDate;
    
    // Update theme
    updateTheme();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize modules
    initModules();
    
    // Update dashboard
    updateDashboard();
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.target);
        });
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Save data
    elements.saveDataBtn.addEventListener('click', saveAllData);
    
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.target);
        });
    });
    
    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    
    // Settings form
    document.getElementById('setting-theme').addEventListener('change', e => {
        appState.theme = e.target.value;
        updateTheme();
    });
    
    document.getElementById('setting-animations').addEventListener('change', e => {
        appState.animations = e.target.checked;
    });
    
    document.getElementById('setting-currency').addEventListener('change', e => {
        appState.currency = e.target.value;
        updateCurrencyDisplay();
    });
    
    document.getElementById('setting-shop-name').addEventListener('change', e => {
        appState.shopName = e.target.value;
    });
    
    document.getElementById('setting-tax-rate').addEventListener('change', e => {
        appState.taxRate = parseFloat(e.target.value);
    });
    
    document.getElementById('setting-low-stock').addEventListener('change', e => {
        appState.lowStockThreshold = parseInt(e.target.value);
        updateInventoryStatus();
    });
    
    // Data management
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', importData);
    document.getElementById('reset-data').addEventListener('click', confirmResetData);
}

/**
 * Initialize modules by calling their init functions
 */
function initModules() {
    // Initialize inventory system
    if (typeof initInventory === 'function') {
        initInventory();
    }
    
    // Initialize recipe system
    if (typeof initRecipes === 'function') {
        initRecipes();
    }
    
    // Initialize production system
    if (typeof initProduction === 'function') {
        initProduction();
    }
    
    // Initialize pricing system
    if (typeof initPricing === 'function') {
        initPricing();
    }
    
    // Initialize reports system
    if (typeof initReports === 'function') {
        initReports();
    }
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - The ID of the section to navigate to
 */
function navigateTo(sectionId) {
    // Update active nav item
    elements.navItems.forEach(item => {
        if (item.dataset.target === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Show active section
    elements.sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Update app state
    appState.currentSection = sectionId;
    
    // Refresh section content if needed
    refreshSectionContent(sectionId);
}

/**
 * Refresh the content of a section if needed
 * @param {string} sectionId - The ID of the section to refresh
 */
function refreshSectionContent(sectionId) {
    switch (sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'inventory':
            updateInventoryDisplay();
            break;
        case 'recipes':
            updateRecipeDisplay();
            break;
        case 'production':
            updateProductionDisplay();
            break;
        case 'pricing':
            updatePricingDisplay();
            break;
        case 'reports':
            updateReportsDisplay();
            break;
        case 'settings':
            updateSettingsDisplay();
            break;
    }
}

/**
 * Switch between tabs within a section
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchTab(tabId) {
    const tabContainer = document.querySelector('.tab.active').parentNode;
    
    // Update active tab
    tabContainer.querySelectorAll('.tab').forEach(tab => {
        if (tab.dataset.target === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Show active tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
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
 * Update dashboard with current data
 */
function updateDashboard() {
    // Update summary cards
    updateDashboardSummary();
    
    // Update charts (placeholder - would be replaced with actual chart library)
    updateDashboardCharts();
    
    // Update alerts
    updateDashboardAlerts();
}

/**
 * Update dashboard summary cards
 */
function updateDashboardSummary() {
    // Calculate totals from inventory and sales data
    const totalRevenue = calculateTotalRevenue();
    const totalProfit = calculateTotalProfit();
    const inventoryValue = calculateInventoryValue();
    const totalOrders = calculateTotalOrders();
    
    // Update the DOM
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('total-profit').textContent = formatCurrency(totalProfit);
    document.getElementById('inventory-value').textContent = formatCurrency(inventoryValue);
    document.getElementById('total-orders').textContent = totalOrders;
}

/**
 * Update dashboard charts
 */
function updateDashboardCharts() {
    // Placeholder for chart library implementation
    console.log('Updating dashboard charts');
}

/**
 * Update dashboard alerts
 */
function updateDashboardAlerts() {
    // Check for low stock items
    const lowStockItems = checkLowStockItems();
    
    // Check for negative profit margins
    const negativeMarginItems = checkNegativeProfitMargins();
    
    // Update alerts container
    const alertsContainer = document.querySelector('.alerts-container');
    alertsContainer.innerHTML = '<h3><i class="fas fa-exclamation-triangle"></i> Alerts</h3>';
    
    // Add low stock alerts
    lowStockItems.forEach(item => {
        const alertElement = createAlertElement(
            'low-stock',
            'Low Stock Alert',
            `${item.name} is running low (${item.quantity} units remaining)`,
            'Order'
        );
        alertsContainer.appendChild(alertElement);
    });
    
    // Add profit margin alerts
    negativeMarginItems.forEach(item => {
        const alertElement = createAlertElement(
            'profit-warning',
            'Profit Margin Alert',
            `${item.name} has a negative profit margin (${formatCurrency(item.margin)})`,
            'Adjust'
        );
        alertsContainer.appendChild(alertElement);
    });
    
    // Show placeholder if no alerts
    if (lowStockItems.length === 0 && negativeMarginItems.length === 0) {
        const noAlertsElement = document.createElement('div');
        noAlertsElement.className = 'alert-item';
        noAlertsElement.innerHTML = `
            <div class="alert-content">
                <p>No alerts at this time. Everything is running smoothly!</p>
            </div>
        `;
        alertsContainer.appendChild(noAlertsElement);
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
 * Save all application data to local storage
 */
function saveAllData() {
    // Gather all data
    const data = {
        appState: appState,
        inventory: materialInventory,
        craftedItems: craftedInventory,
        recipes: recipeData,
        pricing: pricingData,
        production: productionQueue,
        salesHistory: salesHistory
    };
    
    // Save to local storage
    localStorage.setItem('blacksmithData', JSON.stringify(data));
    
    // Show confirmation
    showModal('Data Saved', '<p>Your data has been saved successfully.</p>');
}

/**
 * Load saved data from local storage
 */
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('blacksmithData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Restore app state
            if (data.appState) {
                Object.assign(appState, data.appState);
            }
            
            // Restore inventory
            if (data.inventory) {
                materialInventory = data.inventory;
            }
            
            if (data.craftedItems) {
                craftedInventory = data.craftedItems;
            }
            
            // Restore recipes
            if (data.recipes) {
                recipeData = data.recipes;
            }
            
            // Restore pricing
            if (data.pricing) {
                pricingData = data.pricing;
            }
            
            // Restore production queue
            if (data.production) {
                productionQueue = data.production;
            }
            
            // Restore sales history
            if (data.salesHistory) {
                salesHistory = data.salesHistory;
            }
            
            console.log('Data loaded from local storage');
        }
    } catch (error) {
        console.error('Error loading data from local storage:', error);
    }
}

/**
 * Export data to a JSON file
 */
function exportData() {
    // Gather all data
    const data = {
        appState: appState,
        inventory: materialInventory,
        craftedItems: craftedInventory,
        recipes: recipeData,
        pricing: pricingData,
        production: productionQueue,
        salesHistory: salesHistory
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'blacksmith_data.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

/**
 * Import data from a JSON file
 */
function importData() {
    const content = `
        <div class="form-group">
            <label for="import-file">Select JSON File to Import:</label>
            <input type="file" id="import-file" accept=".json">
        </div>
        <p class="warning">Warning: This will overwrite your current data.</p>
    `;
    
    showModal('Import Data', content, () => {
        const fileInput = document.getElementById('import-file');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Restore app state
                    if (data.appState) {
                        Object.assign(appState, data.appState);
                    }
                    
                    // Restore inventory
                    if (data.inventory) {
                        materialInventory = data.inventory;
                    }
                    
                    if (data.craftedItems) {
                        craftedInventory = data.craftedItems;
                    }
                    
                    // Restore recipes
                    if (data.recipes) {
                        recipeData = data.recipes;
                    }
                    
                    // Restore pricing
                    if (data.pricing) {
                        pricingData = data.pricing;
                    }
                    
                    // Restore production queue
                    if (data.production) {
                        productionQueue = data.production;
                    }
                    
                    // Restore sales history
                    if (data.salesHistory) {
                        salesHistory = data.salesHistory;
                    }
                    
                    // Update UI
                    updateTheme();
                    updateCurrencyDisplay();
                    updateInventoryDisplay();
                    updateRecipeDisplay();
                    updateProductionDisplay();
                    updatePricingDisplay();
                    updateReportsDisplay();
                    updateSettingsDisplay();
                    
                    closeModal();
                    showModal('Import Successful', '<p>Your data has been imported successfully.</p>');
                } catch (error) {
                    console.error('Error importing data:', error);
                    showModal('Import Error', '<p>There was an error importing your data. Please check the file format.</p>');
                }
            };
            
            reader.readAsText(file);
        }
    });
}

/**
 * Confirm data reset
 */
function confirmResetData() {
    const content = `
        <p>Are you sure you want to reset all data? This cannot be undone.</p>
        <p class="warning">This will delete all inventory, recipes, pricing, and sales history.</p>
    `;
    
    showModal('Reset All Data', content, resetAllData);
}

/**
 * Reset all application data
 */
function resetAllData() {
    // Clear local storage
    localStorage.removeItem('blacksmithData');
    
    // Reset data structures to defaults
    initializeDefaultData();
    
    // Update UI
    updateInventoryDisplay();
    updateRecipeDisplay();
    updateProductionDisplay();
    updatePricingDisplay();
    updateReportsDisplay();
    
    closeModal();
    showModal('Reset Complete', '<p>All data has been reset to default values.</p>');
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
 * Calculate the total revenue
 * @returns {number} The total revenue
 */
function calculateTotalRevenue() {
    // Placeholder - would be calculated from actual sales data
    return 1250.75;
}

/**
 * Calculate the total profit
 * @returns {number} The total profit
 */
function calculateTotalProfit() {
    // Placeholder - would be calculated from actual sales data
    return 458.20;
}

/**
 * Calculate the inventory value
 * @returns {number} The total inventory value
 */
function calculateInventoryValue() {
    let total = 0;
    
    // Add up material inventory value
    for (const item of materialInventory) {
        total += item.quantity * item.cost;
    }
    
    // Add up crafted item inventory value
    for (const item of craftedInventory) {
        total += item.quantity * item.value;
    }
    
    return total;
}

/**
 * Calculate the total orders
 * @returns {number} The total orders
 */
function calculateTotalOrders() {
    // Placeholder - would be calculated from actual order data
    return 42;
}

/**
 * Check for low stock items
 * @returns {Array} Array of low stock items
 */
function checkLowStockItems() {
    const lowStockItems = [];
    
    // Check material inventory
    for (const item of materialInventory) {
        if (item.quantity <= appState.lowStockThreshold) {
            lowStockItems.push({
                name: item.name,
                quantity: item.quantity,
                type: 'material'
            });
        }
    }
    
    // Check crafted inventory
    for (const item of craftedInventory) {
        if (item.quantity <= appState.lowStockThreshold) {
            lowStockItems.push({
                name: item.name,
                quantity: item.quantity,
                type: 'crafted'
            });
        }
    }
    
    return lowStockItems;
}

/**
 * Check for items with negative profit margins
 * @returns {Array} Array of items with negative profit margins
 */
function checkNegativeProfitMargins() {
    const negativeMarginItems = [];
    
    // Check crafted items
    for (const item of craftedInventory) {
        const margin = item.value - item.cost;
        if (margin < 0) {
            negativeMarginItems.push({
                name: item.name,
                margin: margin,
                price: item.value,
                cost: item.cost
            });
        }
    }
    
    return negativeMarginItems;
}

/**
 * Initialize default data
 */
function initializeDefaultData() {
    // Initialize default material inventory
    materialInventory = [
        { id: 'wood-logs', name: 'Wood Logs', quantity: 20, cost: 2.00, category: 'raw' },
        { id: 'iron-ore', name: 'Iron Ore', quantity: 15, cost: 0.60, category: 'metal' },
        { id: 'coal', name: 'Coal', quantity: 15, cost: 0.50, category: 'fuel' },
        { id: 'buck-skin', name: 'Buck Skin', quantity: 10, cost: 1.00, category: 'raw' },
        { id: 'copper', name: 'Copper', quantity: 8, cost: 0.50, category: 'metal' },
        { id: 'clay', name: 'Clay', quantity: 12, cost: 0.25, category: 'raw' }
    ];
    
    // Initialize default crafted inventory
    craftedInventory = [
        { id: 'iron-bar', name: 'Iron Bar', quantity: 10, cost: 0.40, value: 1.00, category: 'metal' },
        { id: 'nails', name: 'Nails', quantity: 25, cost: 0.08, value: 0.30, category: 'misc' },
        { id: 'pickaxe', name: 'Pickaxe', quantity: 2, cost: 3.60, value: 10.00, category: 'tools' }
    ];
    
    // Initialize default recipes
    recipeData = [
        {
            id: 'iron-bar',
            name: 'Iron Bar',
            outputQuantity: 5,
            craftingTime: 5,
            ingredients: [
                { id: 'iron-ore', quantity: 5 },
                { id: 'coal', quantity: 2 }
            ],
            value: 1.00
        },
        {
            id: 'nails',
            name: 'Nails',
            outputQuantity: 5,
            craftingTime: 3,
            ingredients: [
                { id: 'iron-bar', quantity: 1 }
            ],
            value: 0.30
        },
        {
            id: 'shell-casing',
            name: 'Shell Casing',
            outputQuantity: 20,
            craftingTime: 10,
            ingredients: [
                { id: 'iron-bar', quantity: 5 },
                { id: 'copper', quantity: 2 }
            ],
            value: 5.00
        },
        {
            id: 'silver-horseshoes',
            name: 'Silver Horseshoes',
            outputQuantity: 2,
            craftingTime: 8,
            ingredients: [
                { id: 'iron-ore', quantity: 4 },
                { id: 'coal', quantity: 2 }
            ],
            value: 5.00
        },
        {
            id: 'pickaxe',
            name: 'Pickaxe',
            outputQuantity: 1,
            craftingTime: 15,
            ingredients: [
                { id: 'iron-bar', quantity: 2 },
                { id: 'wood-logs', quantity: 1 }
            ],
            value: 10.00
        }
    ];
    
    // Initialize default pricing data
    pricingData = [
        { id: 'iron-bar', price: 1.00, lastUpdated: new Date().toISOString() },
        { id: 'nails', price: 0.30, lastUpdated: new Date().toISOString() },
        { id: 'shell-casing', price: 5.00, lastUpdated: new Date().toISOString() },
        { id: 'silver-horseshoes', price: 5.00, lastUpdated: new Date().toISOString() },
        { id: 'pickaxe', price: 10.00, lastUpdated: new Date().toISOString() }
    ];
    
    // Initialize default production queue
    productionQueue = [
        {
            id: 1,
            itemId: 'pickaxe',
            quantity: 3,
            priority: 'high',
            timeline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            estimatedProfit: 19.20,
            status: 'pending'
        },
        {
            id: 2,
            itemId: 'nails',
            quantity: 10,
            priority: 'normal',
            timeline: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            estimatedProfit: 10.00,
            status: 'ready'
        }
    ];
    
    // Initialize default sales history
    salesHistory = [];
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Global objects for module interaction
let materialInventory = [];
let craftedInventory = [];
let recipeData = [];
let pricingData = [];
let productionQueue = [];
let salesHistory = [];

// Initialize default data
initializeDefaultData();