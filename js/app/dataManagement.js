/**
 * RedM Blacksmith Business Tool - Data Management
 * 
 * This file contains functions for saving, loading, 
 * and initializing application data.
 */

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
        salesHistory: salesHistory,
        contracts: window.contracts || [] // Save contracts
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
            
            // Restore contracts
            if (data.contracts) {
                window.contracts = data.contracts.map(contractData => {
                    const contract = new Contract(
                        contractData.id,
                        contractData.name,
                        contractData.client,
                        contractData.items,
                        contractData.deadline ? new Date(contractData.deadline) : null
                    );
                    
                    // Restore additional properties
                    contract.status = contractData.status;
                    contract.createdAt = new Date(contractData.createdAt);
                    contract.completedAt = contractData.completedAt ? new Date(contractData.completedAt) : null;
                    
                    return contract;
                });
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
        salesHistory: salesHistory,
        contracts: window.contracts || []
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
                    
                    // Restore contracts
                    if (data.contracts) {
                        window.contracts = data.contracts.map(contractData => {
                            const contract = new Contract(
                                contractData.id,
                                contractData.name,
                                contractData.client,
                                contractData.items,
                                contractData.deadline ? new Date(contractData.deadline) : null
                            );
                            
                            // Restore additional properties
                            contract.status = contractData.status;
                            contract.createdAt = new Date(contractData.createdAt);
                            contract.completedAt = contractData.completedAt ? new Date(contractData.completedAt) : null;
                            
                            return contract;
                        });
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
                    
                    // Update contracts if module exists
                    if (typeof contractManagement !== 'undefined') {
                        contractManagement.updateContractDisplay();
                    }
                    
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
    
    // Update contracts if module exists
    if (typeof contractManagement !== 'undefined') {
        contractManagement.updateContractDisplay();
    }
    
    closeModal();
    showModal('Reset Complete', '<p>All data has been reset to default values.</p>');
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
    
    // Initialize empty sales history and contracts
    salesHistory = [];
    window.contracts = [];
}