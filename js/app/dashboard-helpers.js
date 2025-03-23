/**
 * RedM Blacksmith Business Tool - Dashboard Helpers
 * 
 * This file contains functions for calculating and 
 * updating dashboard metrics and displays.
 */

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
    const totalRevenueEl = document.getElementById('total-revenue');
    const totalProfitEl = document.getElementById('total-profit');
    const inventoryValueEl = document.getElementById('inventory-value');
    const totalOrdersEl = document.getElementById('total-orders');
    
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(totalRevenue);
    if (totalProfitEl) totalProfitEl.textContent = formatCurrency(totalProfit);
    if (inventoryValueEl) inventoryValueEl.textContent = formatCurrency(inventoryValue);
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
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
    if (!alertsContainer) return;
    
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
 * Calculate the total revenue
 * @returns {number} The total revenue
 */
function calculateTotalRevenue() {
    // Placeholder calculation using transaction history
    if (typeof transactionHistory === 'undefined') return 0;
    
    return transactionHistory.reduce((total, transaction) => {
        if (transaction.type === 'sale') {
            return total + transaction.totalValue;
        }
        return total;
    }, 0);
}

/**
 * Calculate the total profit
 * @returns {number} The total profit
 */
function calculateTotalProfit() {
    // Placeholder calculation using transaction history
    if (typeof transactionHistory === 'undefined') return 0;
    
    return transactionHistory.reduce((total, transaction) => {
        if (transaction.type === 'sale') {
            // Estimate profit by subtracting production costs
            const saleProfit = transaction.items.reduce((itemTotal, item) => {
                const craftedItem = findCraftedItemById(item.id);
                return craftedItem 
                    ? itemTotal + (item.value - (craftedItem.cost * item.quantity)) 
                    : itemTotal;
            }, 0);
            return total + saleProfit;
        }
        return total;
    }, 0);
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
    // Placeholder calculation using transaction history
    if (typeof transactionHistory === 'undefined') return 0;
    
    return transactionHistory.reduce((total, transaction) => {
        if (transaction.type === 'sale') {
            return total + transaction.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0);
        }
        return total;
    }, 0);
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