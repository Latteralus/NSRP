/**
 * RedM Blacksmith Business Tool - Pricing Management
 * 
 * This file contains:
 * - Price management initialization
 * - Price calculation
 * - Price optimization suggestions
 * - Bundle pricing
 */

/**
 * Initialize the pricing module
 */
function initPricing() {
    // Set up event listeners
    setupPricingEventListeners();
    
    // Populate item selectors
    populatePriceItemOptions();
    
    // Update pricing displays
    updatePricingDisplay();
}

/**
 * Set up pricing event listeners
 */
function setupPricingEventListeners() {
    // Update price button
    const updatePriceBtn = document.getElementById('update-price');
    if (updatePriceBtn) {
        updatePriceBtn.addEventListener('click', updateItemPrice);
    }
    
    // Item selector change
    const priceItem = document.getElementById('price-item');
    if (priceItem) {
        priceItem.addEventListener('change', updatePriceCalculator);
    }
    
    // Profit margin input
    const priceMargin = document.getElementById('price-margin');
    if (priceMargin) {
        priceMargin.addEventListener('input', calculateRecommendedPrice);
        priceMargin.addEventListener('change', calculateRecommendedPrice);
    }
    
    // Competitor price input
    const priceCompetitor = document.getElementById('price-competitor');
    if (priceCompetitor) {
        priceCompetitor.addEventListener('input', calculateRecommendedPrice);
        priceCompetitor.addEventListener('change', calculateRecommendedPrice);
    }
}

/**
 * Populate the item selector in the pricing calculator
 */
function populatePriceItemOptions() {
    const priceItem = document.getElementById('price-item');
    if (!priceItem) return;
    
    // Clear existing options
    priceItem.innerHTML = '';
    
    // Add options for each crafted item
    const items = [...craftedInventory];
    
    // Sort alphabetically
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        priceItem.appendChild(option);
    });
    
    // Update calculator with selected item
    updatePriceCalculator();
}

/**
 * Update the pricing display
 */
function updatePricingDisplay() {
    updatePriceCalculator();
    updatePriceList();
    updateBundlePricing();
}

/**
 * Update the pricing calculator with selected item
 */
function updatePriceCalculator() {
    const priceItem = document.getElementById('price-item');
    if (!priceItem) return;
    
    const itemId = priceItem.value;
    if (!itemId) return;
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Update production cost display
    const productionCost = document.getElementById('price-production-cost');
    if (productionCost) {
        productionCost.textContent = formatCurrency(item.cost);
    }
    
    // Update current price display
    const currentPrice = document.getElementById('price-current');
    if (currentPrice) {
        currentPrice.textContent = formatCurrency(item.value);
    }
    
    // Update current margin display
    const currentMargin = document.getElementById('price-current-margin');
    if (currentMargin) {
        const margin = item.value > 0 ? ((item.value - item.cost) / item.value * 100).toFixed(1) : '0.0';
        currentMargin.textContent = `${margin}%`;
        
        // Add color based on margin
        if (parseFloat(margin) < 0) {
            currentMargin.className = 'profit-negative';
        } else if (parseFloat(margin) < 15) {
            currentMargin.className = 'profit-warning';
        } else {
            currentMargin.className = 'profit-positive';
        }
    }
    
    // Calculate recommended price
    calculateRecommendedPrice();
}

/**
 * Calculate and display recommended price
 */
function calculateRecommendedPrice() {
    const priceItem = document.getElementById('price-item');
    const priceMargin = document.getElementById('price-margin');
    const priceCompetitor = document.getElementById('price-competitor');
    const priceRecommended = document.getElementById('price-recommended');
    
    if (!priceItem || !priceMargin || !priceCompetitor || !priceRecommended) return;
    
    const itemId = priceItem.value;
    const targetMargin = parseFloat(priceMargin.value) / 100;
    const competitorPrice = parseFloat(priceCompetitor.value);
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Calculate recommended price based on cost and margin
    let recommendedPrice = item.cost / (1 - targetMargin);
    
    // Consider competitor price if provided
    if (competitorPrice > 0) {
        // Slightly undercut competitor if our cost allows it
        if (competitorPrice > item.cost * 1.1) {
            recommendedPrice = Math.min(recommendedPrice, competitorPrice * 0.95);
        }
    }
    
    // Ensure minimum profit
    recommendedPrice = Math.max(recommendedPrice, item.cost * 1.05);
    
    // Update display
    priceRecommended.textContent = formatCurrency(recommendedPrice);
}

/**
 * Update an item's price
 */
function updateItemPrice() {
    const priceItem = document.getElementById('price-item');
    const priceRecommended = document.getElementById('price-recommended');
    
    if (!priceItem || !priceRecommended) return;
    
    const itemId = priceItem.value;
    const newPrice = parseFloat(priceRecommended.textContent.replace(/[^0-9.-]+/g, ''));
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Update the item price
    item.value = newPrice;
    
    // Update the price data
    updatePrice(itemId, newPrice);
    
    // Update displays
    updatePricingDisplay();
    
    // Show confirmation
    showModal('Price Updated', `<p>The price for ${item.name} has been updated to ${formatCurrency(newPrice)}.</p>`);
}

/**
 * Update the price list table
 */
function updatePriceList() {
    const priceListBody = document.getElementById('price-list-body');
    if (!priceListBody) return;
    
    // Clear existing rows
    priceListBody.innerHTML = '';
    
    // Add rows for each crafted item
    const items = [...craftedInventory];
    
    // Sort alphabetically
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Calculate profit margin
        const profitMargin = item.value > 0 ? ((item.value - item.cost) / item.value * 100).toFixed(1) : '0.0';
        let marginClass = 'profit-positive';
        
        if (parseFloat(profitMargin) < 0) {
            marginClass = 'profit-negative';
        } else if (parseFloat(profitMargin) < 15) {
            marginClass = 'profit-warning';
        }
        
        // Get last updated date
        const priceData = findPriceById(item.id);
        const lastUpdated = priceData ? new Date(priceData.lastUpdated) : new Date();
        const formattedDate = lastUpdated.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatCurrency(item.cost)}</td>
            <td>${formatCurrency(item.value)}</td>
            <td class="${marginClass}">${profitMargin}%</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn-icon quick-edit-price" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon calculate-price" data-id="${item.id}">
                    <i class="fas fa-calculator"></i>
                </button>
            </td>
        `;
        
        priceListBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    const quickEditButtons = priceListBody.querySelectorAll('.quick-edit-price');
    quickEditButtons.forEach(button => {
        button.addEventListener('click', showQuickEditPriceModal);
    });
    
    const calculateButtons = priceListBody.querySelectorAll('.calculate-price');
    calculateButtons.forEach(button => {
        button.addEventListener('click', selectItemInCalculator);
    });
}

/**
 * Show modal for quick editing an item's price
 * @param {Event} event - The click event
 */
function showQuickEditPriceModal(event) {
    const itemId = event.currentTarget.dataset.id;
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Calculate profit margin
    const profitMargin = item.value > 0 ? ((item.value - item.cost) / item.value * 100).toFixed(1) : '0.0';
    
    let content = `
        <div class="form-group">
            <label for="quick-edit-cost">Production Cost:</label>
            <input type="number" id="quick-edit-cost" value="${item.cost.toFixed(2)}" disabled>
        </div>
        <div class="form-group">
            <label for="quick-edit-price">Sale Price:</label>
            <input type="number" id="quick-edit-price" value="${item.value.toFixed(2)}" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label for="quick-edit-margin">Current Profit Margin:</label>
            <input type="text" id="quick-edit-margin" value="${profitMargin}%" disabled>
        </div>
    `;
    
    showModal(
        `Quick Edit Price: ${item.name}`,
        content,
        () => quickUpdateItemPrice(itemId)
    );
    
    // Update margin when price changes
    const priceInput = document.getElementById('quick-edit-price');
    priceInput.addEventListener('input', () => {
        const cost = parseFloat(document.getElementById('quick-edit-cost').value);
        const price = parseFloat(priceInput.value);
        
        if (price > 0) {
            const margin = ((price - cost) / price * 100).toFixed(1);
            document.getElementById('quick-edit-margin').value = `${margin}%`;
            
            // Add color based on margin
            if (parseFloat(margin) < 0) {
                document.getElementById('quick-edit-margin').className = 'profit-negative';
            } else if (parseFloat(margin) < 15) {
                document.getElementById('quick-edit-margin').className = 'profit-warning';
            } else {
                document.getElementById('quick-edit-margin').className = 'profit-positive';
            }
        } else {
            document.getElementById('quick-edit-margin').value = '0.0%';
        }
    });
}

/**
 * Quick update an item's price from modal
 * @param {string} itemId - The ID of the item to update
 */
function quickUpdateItemPrice(itemId) {
    // Get new price
    const newPrice = parseFloat(document.getElementById('quick-edit-price').value);
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Update the item price
    item.value = newPrice;
    
    // Update the price data
    updatePrice(itemId, newPrice);
    
    // Update displays
    updatePricingDisplay();
    
    // Close modal
    closeModal();
}

/**
 * Select an item in the pricing calculator
 * @param {Event} event - The click event
 */
function selectItemInCalculator(event) {
    const itemId = event.currentTarget.dataset.id;
    
    // Find the item
    const item = findCraftedItemById(itemId);
    if (!item) return;
    
    // Select the item in the calculator
    const priceItem = document.getElementById('price-item');
    if (priceItem) {
        priceItem.value = itemId;
        
        // Trigger change event
        priceItem.dispatchEvent(new Event('change'));
    }
    
    // Navigate to the calculator
    document.querySelector('.pricing-calculator').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update bundle pricing display
 */
function updateBundlePricing() {
    const bundleContainer = document.getElementById('bundle-container');
    if (!bundleContainer) return;
    
    // Clear existing content
    bundleContainer.innerHTML = '';
    
    // Sample bundles data - in a real application, this would come from a data source
    const bundles = [
        {
            id: 'shell-casings-box',
            name: 'Shell Casings Box',
            description: 'A box of 100 shell casings, perfect for ammunition crafting.',
            items: [
                { id: 'shell-casing', quantity: 100 }
            ],
            regularPrice: 50.00,
            bundlePrice: 35.00
        },
        {
            id: 'rifle-set',
            name: 'Rifle Crafting Set',
            description: 'All the components needed to craft a complete rifle.',
            items: [
                { id: 'iron-bar', quantity: 20 },
                { id: 'shell-casing', quantity: 50 },
                { id: 'rifle-barrel', quantity: 1 }
            ],
            regularPrice: 650.00,
            bundlePrice: 600.00
        },
        {
            id: 'blacksmith-tool-set',
            name: 'Blacksmith Tool Set',
            description: 'A complete set of essential blacksmith tools.',
            items: [
                { id: 'hammer', quantity: 2 },
                { id: 'pickaxe', quantity: 1 },
                { id: 'axe', quantity: 1 }
            ],
            regularPrice: 132.00,
            bundlePrice: 120.00
        }
    ];
    
    // Create bundle cards
    bundles.forEach(bundle => {
        createBundleCard(bundle, bundleContainer);
    });
}

/**
 * Create a bundle card
 * @param {Object} bundle - The bundle data
 * @param {HTMLElement} container - The container to append the card to
 */
function createBundleCard(bundle, container) {
    const card = document.createElement('div');
    card.className = 'bundle-card';
    card.dataset.id = bundle.id;
    
    // Calculate savings percentage
    const savingsPercent = ((bundle.regularPrice - bundle.bundlePrice) / bundle.regularPrice * 100).toFixed(1);
    
    let itemsList = '<ul class="bundle-items">';
    
    bundle.items.forEach(bundleItem => {
        const item = findCraftedItemById(bundleItem.id);
        const itemName = item ? item.name : bundleItem.id;
        
        itemsList += `<li>${bundleItem.quantity} × ${itemName}</li>`;
    });
    
    itemsList += '</ul>';
    
    card.innerHTML = `
        <div class="bundle-header">
            <h3>${bundle.name}</h3>
            <div class="bundle-price">${formatCurrency(bundle.bundlePrice)}</div>
        </div>
        <div class="bundle-content">
            <p class="bundle-description">${bundle.description}</p>
            <div class="bundle-savings">
                <span class="regular-price">Regular: ${formatCurrency(bundle.regularPrice)}</span>
                <span class="savings">Save ${savingsPercent}%</span>
            </div>
            <div class="bundle-details">
                <h4>Includes:</h4>
                ${itemsList}
            </div>
            <div class="bundle-actions">
                <button class="btn btn-secondary edit-bundle" data-id="${bundle.id}">
                    <i class="fas fa-edit"></i> Edit Bundle
                </button>
                <button class="btn delete-bundle" data-id="${bundle.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(card);
    
    // Add event listeners to buttons
    card.querySelector('.edit-bundle').addEventListener('click', showEditBundleModal);
    card.querySelector('.delete-bundle').addEventListener('click', showDeleteBundleConfirmation);
}

/**
 * Show modal for editing a bundle
 * @param {Event} event - The click event
 */
function showEditBundleModal(event) {
    // In a real application, this function would fetch the bundle data
    // and create a form for editing its properties
    
    const bundleId = event.currentTarget.dataset.id;
    
    showModal(
        'Edit Bundle',
        `<p>Bundle editing functionality would be implemented here for bundle ID: ${bundleId}</p>`
    );
}

/**
 * Show confirmation for deleting a bundle
 * @param {Event} event - The click event
 */
function showDeleteBundleConfirmation(event) {
    const bundleId = event.currentTarget.dataset.id;
    
    showModal(
        'Delete Bundle',
        `<p>Are you sure you want to delete this bundle? This cannot be undone.</p>`,
        () => deleteBundle(bundleId)
    );
}

/**
 * Delete a bundle
 * @param {string} bundleId - The ID of the bundle to delete
 */
function deleteBundle(bundleId) {
    // In a real application, this function would delete the bundle from the data source
    
    // For demo purposes, just remove the card
    const bundleCard = document.querySelector(`.bundle-card[data-id="${bundleId}"]`);
    if (bundleCard) {
        bundleCard.remove();
    }
    
    // Close modal
    closeModal();
}

// Initialize the pricing system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initApp === 'function') {
        // Wait for app initialization
        document.addEventListener('appInitialized', initPricing);
    } else {
        // Initialize directly if app.js is not available
        initPricing();
    }
});