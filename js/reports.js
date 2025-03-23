/**
 * RedM Blacksmith Business Tool - Reports
 * 
 * This file contains:
 * - Business reporting functionality
 * - Analytics calculations
 * - Chart generation
 * - Report export functionality
 */

/**
 * Initialize the reports module
 */
function initReports() {
    // Set up event listeners
    setupReportsEventListeners();
    
    // Update reports
    updateReportsDisplay();
}

/**
 * Set up reports event listeners
 */
function setupReportsEventListeners() {
    // Report period selector
    const reportPeriod = document.getElementById('report-period');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', updateReportsDisplay);
    }
    
    // Export report button
    const exportReportBtn = document.getElementById('export-report');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReportData);
    }
    
    // Print report button
    const printReportBtn = document.getElementById('print-report');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }
}

/**
 * Update the reports display
 */
function updateReportsDisplay() {
    // Get selected report period
    const reportPeriod = document.getElementById('report-period');
    const period = reportPeriod ? reportPeriod.value : 'month';
    
    // Calculate date range based on period
    const dateRange = calculateDateRange(period);
    
    // Filter transaction data for the selected period
    const periodTransactions = filterTransactionsByDateRange(transactionHistory, dateRange);
    
    // Update summary metrics
    updateSummaryMetrics(periodTransactions);
    
    // Update charts
    updateProfitLossChart(periodTransactions, period);
    updateTopProductsChart(periodTransactions);
    
    // Update product rankings
    updateProductRankings(periodTransactions);
}

/**
 * Calculate date range based on the selected period
 * @param {string} period - The selected period (day, week, month, quarter, year)
 * @returns {Object} The start and end dates for the period
 */
function calculateDateRange(period) {
    const now = new Date();
    let startDate, endDate = now;
    
    switch (period) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            // Start of the current week (Sunday)
            const dayOfWeek = now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        case 'custom':
            // Custom date range would be implemented with a date picker
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { startDate, endDate };
}

/**
 * Filter transactions by date range
 * @param {Array} transactions - The transactions to filter
 * @param {Object} dateRange - The date range to filter by
 * @returns {Array} The filtered transactions
 */
function filterTransactionsByDateRange(transactions, dateRange) {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate;
    });
}

/**
 * Update summary metrics for the selected period
 * @param {Array} transactions - The transactions for the period
 */
function updateSummaryMetrics(transactions) {
    // Calculate total revenue, costs, and profit
    let totalRevenue = 0;
    let totalCosts = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'sale') {
            totalRevenue += transaction.totalValue;
        } else if (transaction.type === 'purchase') {
            totalCosts += transaction.totalValue;
        } else if (transaction.type === 'craft') {
            // For crafting, we count the production cost as an expense
            transaction.items.forEach(item => {
                const craftedItem = findCraftedItemById(item.id);
                if (craftedItem) {
                    totalCosts += craftedItem.cost * item.quantity;
                }
            });
        }
    });
    
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : '0.0';
    
    // Update the DOM
    const reportTotalRevenue = document.getElementById('report-total-revenue');
    const reportTotalCosts = document.getElementById('report-total-costs');
    const reportNetProfit = document.getElementById('report-net-profit');
    const reportProfitMargin = document.getElementById('report-profit-margin');
    
    if (reportTotalRevenue) reportTotalRevenue.textContent = formatCurrency(totalRevenue);
    if (reportTotalCosts) reportTotalCosts.textContent = formatCurrency(totalCosts);
    if (reportNetProfit) reportNetProfit.textContent = formatCurrency(netProfit);
    if (reportProfitMargin) reportProfitMargin.textContent = `${profitMargin}%`;
    
    // Add color to profit based on value
    if (reportNetProfit) {
        if (netProfit > 0) {
            reportNetProfit.className = 'profit-positive';
        } else if (netProfit < 0) {
            reportNetProfit.className = 'profit-negative';
        } else {
            reportNetProfit.className = '';
        }
    }
}

/**
 * Update the profit/loss chart
 * @param {Array} transactions - The transactions for the period
 * @param {string} period - The selected period
 */
function updateProfitLossChart(transactions, period) {
    // In a real application, this would use a chart library like Chart.js
    // For this demo, we'll create a placeholder with some basic information
    
    const chartContainer = document.getElementById('profit-loss-chart');
    if (!chartContainer) return;
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Group transactions by date
    const groupedData = groupTransactionsByDate(transactions, period);
    
    // Create placeholder chart
    const chartPlaceholder = document.createElement('div');
    chartPlaceholder.className = 'chart-placeholder';
    
    // Create chart data display
    let chartDataHTML = '<div class="chart-data">';
    chartDataHTML += '<h4>Profit/Loss Data by Time Period</h4>';
    chartDataHTML += '<table class="chart-data-table">';
    chartDataHTML += '<tr><th>Period</th><th>Revenue</th><th>Costs</th><th>Profit</th></tr>';
    
    Object.keys(groupedData).forEach(date => {
        const data = groupedData[date];
        const profit = data.revenue - data.costs;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        
        chartDataHTML += `
            <tr>
                <td>${date}</td>
                <td>${formatCurrency(data.revenue)}</td>
                <td>${formatCurrency(data.costs)}</td>
                <td class="${profitClass}">${formatCurrency(profit)}</td>
            </tr>
        `;
    });
    
    chartDataHTML += '</table></div>';
    
    // Create chart message
    const chartMessage = document.createElement('p');
    chartMessage.className = 'chart-message';
    chartMessage.innerHTML = `
        <i class="fas fa-info-circle"></i> In a production environment, this would be an interactive chart showing profit and loss trends over time.
    `;
    
    // Append elements to container
    chartPlaceholder.innerHTML = `
        <i class="fas fa-chart-line"></i>
        <p>Profit & Loss Chart</p>
    `;
    
    chartContainer.appendChild(chartPlaceholder);
    chartContainer.insertAdjacentHTML('beforeend', chartDataHTML);
    chartContainer.appendChild(chartMessage);
}

/**
 * Group transactions by date based on the selected period
 * @param {Array} transactions - The transactions to group
 * @param {string} period - The selected period
 * @returns {Object} The grouped transaction data
 */
function groupTransactionsByDate(transactions, period) {
    const groupedData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        let groupKey;
        
        // Format group key based on period
        switch (period) {
            case 'day':
                groupKey = date.toLocaleDateString('en-US', { hour: '2-digit' });
                break;
            case 'week':
                groupKey = date.toLocaleDateString('en-US', { weekday: 'short' });
                break;
            case 'month':
                groupKey = date.toLocaleDateString('en-US', { day: 'numeric' });
                break;
            case 'quarter':
                groupKey = `Month ${date.getMonth() % 3 + 1}`;
                break;
            case 'year':
                groupKey = date.toLocaleDateString('en-US', { month: 'short' });
                break;
            default:
                groupKey = date.toLocaleDateString('en-US');
        }
        
        // Initialize group if it doesn't exist
        if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
                revenue: 0,
                costs: 0
            };
        }
        
        // Add transaction data
        if (transaction.type === 'sale') {
            groupedData[groupKey].revenue += transaction.totalValue;
        } else if (transaction.type === 'purchase') {
            groupedData[groupKey].costs += transaction.totalValue;
        } else if (transaction.type === 'craft') {
            transaction.items.forEach(item => {
                const craftedItem = findCraftedItemById(item.id);
                if (craftedItem) {
                    groupedData[groupKey].costs += craftedItem.cost * item.quantity;
                }
            });
        }
    });
    
    return groupedData;
}

/**
 * Update the top products chart
 * @param {Array} transactions - The transactions for the period
 */
function updateTopProductsChart(transactions, maxItems = 5) {
    // In a real application, this would use a chart library like Chart.js
    // For this demo, we'll create a placeholder with some basic information
    
    const chartContainer = document.getElementById('top-products-chart');
    if (!chartContainer) return;
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Calculate product sales and profit
    const productData = calculateProductPerformance(transactions);
    
    // Sort by revenue (or could sort by profit, units, etc.)
    const sortedProducts = Object.entries(productData)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, maxItems);
    
    // Create placeholder chart
    const chartPlaceholder = document.createElement('div');
    chartPlaceholder.className = 'chart-placeholder';
    
    // Create chart data display
    let chartDataHTML = '<div class="chart-data">';
    chartDataHTML += '<h4>Top Products by Revenue</h4>';
    chartDataHTML += '<div class="bar-chart-container">';
    
    sortedProducts.forEach(([productId, data], index) => {
        const product = findCraftedItemById(productId);
        const productName = product ? product.name : productId;
        const maxRevenue = sortedProducts[0][1].revenue;
        const percentage = (data.revenue / maxRevenue * 100).toFixed(0);
        
        chartDataHTML += `
            <div class="bar-chart-item">
                <div class="bar-label">${productName}</div>
                <div class="bar-container">
                    <div class="bar" style="width: ${percentage}%;" title="${formatCurrency(data.revenue)}"></div>
                </div>
                <div class="bar-value">${formatCurrency(data.revenue)}</div>
            </div>
        `;
    });
    
    chartDataHTML += '</div></div>';
    
    // Create chart message
    const chartMessage = document.createElement('p');
    chartMessage.className = 'chart-message';
    chartMessage.innerHTML = `
        <i class="fas fa-info-circle"></i> In a production environment, this would be an interactive chart showing your top selling products.
    `;
    
    // Append elements to container
    chartPlaceholder.innerHTML = `
        <i class="fas fa-chart-bar"></i>
        <p>Top Products Chart</p>
    `;
    
    chartContainer.appendChild(chartPlaceholder);
    chartContainer.insertAdjacentHTML('beforeend', chartDataHTML);
    chartContainer.appendChild(chartMessage);
}

/**
 * Calculate product performance metrics
 * @param {Array} transactions - The transactions to analyze
 * @returns {Object} The product performance data
 */
function calculateProductPerformance(transactions) {
    const productData = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'sale') {
            transaction.items.forEach(item => {
                if (!productData[item.id]) {
                    productData[item.id] = {
                        revenue: 0,
                        unitsSold: 0,
                        profit: 0
                    };
                }
                
                const craftedItem = findCraftedItemById(item.id);
                const cost = craftedItem ? craftedItem.cost : 0;
                const revenue = item.value * item.quantity;
                const profit = revenue - (cost * item.quantity);
                
                productData[item.id].revenue += revenue;
                productData[item.id].unitsSold += item.quantity;
                productData[item.id].profit += profit;
            });
        }
    });
    
    return productData;
}

/**
 * Update the product rankings table
 * @param {Array} transactions - The transactions for the period
 */
function updateProductRankings(transactions) {
    const productRankings = document.getElementById('product-rankings');
    if (!productRankings) return;
    
    // Clear existing rows
    productRankings.innerHTML = '';
    
    // Calculate product sales and profit
    const productData = calculateProductPerformance(transactions);
    
    // Sort by revenue
    const sortedProducts = Object.entries(productData)
        .sort((a, b) => b[1].revenue - a[1].revenue);
    
    // Add rows for each product
    sortedProducts.forEach(([productId, data], index) => {
        const product = findCraftedItemById(productId);
        const productName = product ? product.name : productId;
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${productName}</td>
            <td>${data.unitsSold}</td>
            <td>${formatCurrency(data.revenue)}</td>
            <td class="${data.profit >= 0 ? 'profit-positive' : 'profit-negative'}">
                ${formatCurrency(data.profit)}
            </td>
        `;
        
        productRankings.appendChild(row);
    });
    
    // Add "No data" row if no products
    if (sortedProducts.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = '<td colspan="5" class="no-data">No product sales data available for this period.</td>';
        productRankings.appendChild(noDataRow);
    }
}

/**
 * Export report data to CSV or PDF
 */
function exportReportData() {
    // In a real application, this would export to CSV or PDF
    // For this demo, we'll show a modal with sample export data
    
    const reportPeriod = document.getElementById('report-period');
    const period = reportPeriod ? reportPeriod.value : 'month';
    
    showModal(
        'Export Report',
        `
            <p>Export options would be provided here for the ${period} report.</p>
            <p>In a production environment, this would generate a CSV or PDF file with the report data.</p>
            <div class="export-options">
                <button class="btn btn-secondary export-option">
                    <i class="fas fa-file-csv"></i> Export as CSV
                </button>
                <button class="btn btn-secondary export-option">
                    <i class="fas fa-file-pdf"></i> Export as PDF
                </button>
                <button class="btn btn-secondary export-option">
                    <i class="fas fa-file-excel"></i> Export as Excel
                </button>
            </div>
        `
    );
    
    // Add click events to export options
    document.querySelectorAll('.export-option').forEach(button => {
        button.addEventListener('click', () => {
            closeModal();
            showModal('Export Initiated', '<p>Your export has been prepared. In a production environment, this would initiate a download.</p>');
        });
    });
}

/**
 * Print the current report
 */
function printReport() {
    // In a real application, this would use the browser's print functionality
    // For this demo, we'll show a modal with print information
    
    showModal(
        'Print Report',
        `
            <p>In a production environment, this would open the browser's print dialog with a print-optimized version of the report.</p>
            <p>The print version would include all charts, tables, and summary metrics from the current report view.</p>
        `
    );
}

/**
 * Generate transaction history data for demonstration
 * This would be replaced with actual transaction data in a real application
 */
function generateDemoTransactionHistory() {
    // Clear existing transactions
    transactionHistory = [];
    
    // Generate sales over the past 3 months
    const today = new Date();
    const endDate = today;
    const startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    
    // Generate one sale per day on average
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        // Skip some days randomly
        if (Math.random() < 0.3) continue;
        
        // Generate 1-3 sales per day
        const salesCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < salesCount; i++) {
            // Select random products
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let totalValue = 0;
            
            for (let j = 0; j < itemCount; j++) {
                // Select random product
                const randomIndex = Math.floor(Math.random() * craftedInventory.length);
                const product = craftedInventory[randomIndex];
                
                // Random quantity
                const quantity = Math.floor(Math.random() * 5) + 1;
                const value = product.value;
                
                items.push({
                    id: product.id,
                    name: product.name,
                    quantity: quantity,
                    value: value
                });
                
                totalValue += value * quantity;
            }
            
            // Create transaction
            const saleDate = new Date(date);
            saleDate.setHours(Math.floor(Math.random() * 24));
            
            const transaction = new Transaction(
                Date.now() + Math.floor(Math.random() * 1000),
                'sale',
                saleDate,
                items,
                totalValue
            );
            
            transactionHistory.push(transaction);
        }
        
        // Occasionally add a purchase transaction
        if (Math.random() < 0.2) {
            const purchaseItems = [];
            let purchaseTotal = 0;
            
            // Select random materials
            const materialCount = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < materialCount; j++) {
                // Select random material
                const randomIndex = Math.floor(Math.random() * materialInventory.length);
                const material = materialInventory[randomIndex];
                
                // Random quantity
                const quantity = Math.floor(Math.random() * 20) + 5;
                const cost = material.cost;
                
                purchaseItems.push({
                    id: material.id,
                    name: material.name,
                    quantity: quantity,
                    value: cost
                });
                
                purchaseTotal += cost * quantity;
            }
            
            // Create transaction
            const purchaseDate = new Date(date);
            purchaseDate.setHours(Math.floor(Math.random() * 24));
            
            const purchaseTransaction = new Transaction(
                Date.now() + Math.floor(Math.random() * 1000),
                'purchase',
                purchaseDate,
                purchaseItems,
                purchaseTotal
            );
            
            transactionHistory.push(purchaseTransaction);
        }
        
        // Occasionally add a crafting transaction
        if (Math.random() < 0.4) {
            const craftItems = [];
            let craftTotal = 0;
            
            // Select random recipe
            const randomIndex = Math.floor(Math.random() * recipeData.length);
            const recipe = recipeData[randomIndex];
            
            // Random quantity
            const quantity = Math.floor(Math.random() * 3) + 1;
            const value = recipe.value * recipe.outputQuantity;
            
            craftItems.push({
                id: recipe.id,
                name: recipe.name,
                quantity: quantity * recipe.outputQuantity,
                value: value
            });
            
            craftTotal += value * quantity;
            
            // Create transaction
            const craftDate = new Date(date);
            craftDate.setHours(Math.floor(Math.random() * 24));
            
            const craftTransaction = new Transaction(
                Date.now() + Math.floor(Math.random() * 1000),
                'craft',
                craftDate,
                craftItems,
                craftTotal
            );
            
            transactionHistory.push(craftTransaction);
        }
    }
    
    // Sort transactions by date
    transactionHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Initialize the reports system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initApp === 'function') {
        // Wait for app initialization
        document.addEventListener('appInitialized', () => {
            // Generate demo transaction data
            generateDemoTransactionHistory();
            
            // Initialize reports
            initReports();
        });
    } else {
        // Initialize directly if app.js is not available
        generateDemoTransactionHistory();
        initReports();
    }
});