/**
 * RedM Blacksmith Business Tool - Contract Management
 * 
 * This file contains:
 * - Contract creation and management
 * - Material and resource requirement analysis
 * - Profit and cost calculation
 * - Production planning for contracts
 */

// Contract class to represent individual contracts
class Contract {
    constructor(id, name, client, items, deadline, requirements = {}) {
        this.id = id;
        this.name = name;
        this.client = client;
        this.items = items; // Array of {itemId, quantity}
        this.deadline = deadline;
        this.requirements = requirements; // Additional contract-specific requirements
        this.status = 'pending'; // pending, in-progress, completed, failed
        this.createdAt = new Date();
        this.completedAt = null;
    }
    
    /**
     * Calculate total materials needed for the contract
     * @returns {Object} Detailed material requirements
     */
    calculateMaterialRequirements() {
        const materialRequirements = {};
        
        this.items.forEach(contractItem => {
            // Find the recipe for the item
            const recipe = findRecipeById(contractItem.itemId);
            if (!recipe) {
                console.warn(`No recipe found for item: ${contractItem.itemId}`);
                return;
            }
            
            // Calculate required quantity of base materials
            recipe.ingredients.forEach(ingredient => {
                const requiredQuantity = ingredient.quantity * contractItem.quantity;
                
                if (!materialRequirements[ingredient.id]) {
                    materialRequirements[ingredient.id] = {
                        name: '',
                        requiredQuantity: 0,
                        currentInventory: 0,
                        needToProduce: 0
                    };
                }
                
                // Find material or crafted item to get name
                const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
                materialRequirements[ingredient.id].name = material ? material.name : ingredient.id;
                materialRequirements[ingredient.id].requiredQuantity += requiredQuantity;
                
                // Check current inventory
                const currentInventory = material ? material.quantity : 0;
                materialRequirements[ingredient.id].currentInventory = currentInventory;
                
                // Calculate how much needs to be produced/purchased
                const needToProduce = Math.max(0, requiredQuantity - currentInventory);
                materialRequirements[ingredient.id].needToProduce += needToProduce;
            });
        });
        
        return materialRequirements;
    }
    
    /**
     * Calculate total contract cost and potential profit
     * @returns {Object} Cost and profit breakdown
     */
    calculateFinancials() {
        let totalCost = 0;
        let totalRevenue = 0;
        
        this.items.forEach(contractItem => {
            // Find the recipe for the item
            const recipe = findRecipeById(contractItem.itemId);
            if (!recipe) {
                console.warn(`No recipe found for item: ${contractItem.itemId}`);
                return;
            }
            
            // Calculate production cost
            const itemCost = recipe.cost * contractItem.quantity;
            totalCost += itemCost;
            
            // Calculate revenue based on sale price
            const itemRevenue = recipe.value * recipe.outputQuantity * contractItem.quantity;
            totalRevenue += itemRevenue;
        });
        
        // Add any additional contract-specific costs or requirements
        if (this.requirements.additionalCosts) {
            totalCost += this.requirements.additionalCosts;
        }
        
        return {
            totalCost,
            totalRevenue,
            netProfit: totalRevenue - totalCost,
            profitMargin: ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2)
        };
    }
    
    /**
     * Generate a production plan for the contract
     * @returns {Array} Production queue items
     */
    generateProductionPlan() {
        const productionQueue = [];
        
        this.items.forEach(contractItem => {
            const recipe = findRecipeById(contractItem.itemId);
            if (!recipe) {
                console.warn(`No recipe found for item: ${contractItem.itemId}`);
                return;
            }
            
            // Create a production queue item
            const productionItem = new ProductionItem(
                Date.now() + productionQueue.length, // Unique ID
                contractItem.itemId,
                contractItem.quantity,
                this.deadline ? 'urgent' : 'normal', // Priority based on deadline
                this.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days if no deadline
                'pending'
            );
            
            productionQueue.push(productionItem);
        });
        
        return productionQueue;
    }
    
    /**
     * Validate if the contract can be fulfilled with current resources
     * @returns {Object} Validation result
     */
    validateContractFeasibility() {
        const materialRequirements = this.calculateMaterialRequirements();
        const shortages = [];
        
        Object.values(materialRequirements).forEach(material => {
            if (material.needToProduce > 0) {
                shortages.push({
                    name: material.name,
                    required: material.requiredQuantity,
                    inStock: material.currentInventory,
                    needToProduce: material.needToProduce
                });
            }
        });
        
        return {
            canFulfill: shortages.length === 0,
            shortages: shortages
        };
    }
    
    /**
     * Update contract status
     * @param {string} newStatus - New status of the contract
     */
    updateStatus(newStatus) {
        this.status = newStatus;
        
        if (newStatus === 'completed') {
            this.completedAt = new Date();
        }
    }
}

// Contract management functions
const contractManagement = {
    /**
     * Initialize the contracts module
     */
    initContracts() {
        // Set up event listeners
        this.setupContractEventListeners();
        
        // Update contract displays
        this.updateContractDisplay();
    },
    
    /**
     * Set up event listeners for contract management
     */
    setupContractEventListeners() {
        // Add contract button
        const addContractBtn = document.getElementById('add-contract');
        if (addContractBtn) {
            addContractBtn.addEventListener('click', this.showAddContractModal.bind(this));
        }
    },
    
    /**
     * Show modal for adding a new contract
     */
    showAddContractModal() {
        const availableItems = craftedInventory.map(item => ({
            id: item.id,
            name: item.name
        }));
        
        let content = `
            <div class="form-group">
                <label for="contract-name">Contract Name:</label>
                <input type="text" id="contract-name" required>
            </div>
            <div class="form-group">
                <label for="contract-client">Client Name:</label>
                <input type="text" id="contract-client" required>
            </div>
            <div class="form-group">
                <label for="contract-deadline">Deadline:</label>
                <input type="date" id="contract-deadline">
            </div>
            
            <h4>Contract Items</h4>
            <div id="contract-items-container">
                <div class="contract-item-row">
                    <select class="contract-item-select">
                        <option value="">Select Item</option>
                        ${availableItems.map(item => 
                            `<option value="${item.id}">${item.name}</option>`
                        ).join('')}
                    </select>
                    <input type="number" class="contract-item-quantity" value="1" min="1">
                    <button type="button" class="btn-icon remove-contract-item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <button type="button" class="btn btn-secondary" id="add-contract-item">
                <i class="fas fa-plus"></i> Add Item
            </button>
        `;
        
        showModal(
            'Add New Contract',
            content,
            this.addNewContract.bind(this)
        );
        
        // Add contract item button
        const addItemBtn = document.getElementById('add-contract-item');
        addItemBtn.addEventListener('click', this.addContractItemRow.bind(this));
        
        // Remove item buttons
        const removeItemBtns = document.querySelectorAll('.remove-contract-item');
        removeItemBtns.forEach(btn => {
            btn.addEventListener('click', this.removeContractItemRow.bind(this));
        });
    },
    
    /**
     * Add a new contract item row
     */
    addContractItemRow() {
        const container = document.getElementById('contract-items-container');
        const availableItems = craftedInventory.map(item => ({
            id: item.id,
            name: item.name
        }));
        
        const row = document.createElement('div');
        row.className = 'contract-item-row';
        row.innerHTML = `
            <select class="contract-item-select">
                <option value="">Select Item</option>
                ${availableItems.map(item => 
                    `<option value="${item.id}">${item.name}</option>`
                ).join('')}
            </select>
            <input type="number" class="contract-item-quantity" value="1" min="1">
            <button type="button" class="btn-icon remove-contract-item">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(row);
        
        // Add remove event listener
        const removeBtn = row.querySelector('.remove-contract-item');
        removeBtn.addEventListener('click', this.removeContractItemRow.bind(this));
    },
    
    /**
     * Remove a contract item row
     * @param {Event} event - The click event
     */
    removeContractItemRow(event) {
        const row = event.currentTarget.closest('.contract-item-row');
        const allRows = document.querySelectorAll('.contract-item-row');
        
        if (allRows.length > 1) {
            row.remove();
        }
    },
    
    /**
     * Add a new contract
     */
    addNewContract() {
        const name = document.getElementById('contract-name').value;
        const client = document.getElementById('contract-client').value;
        const deadline = document.getElementById('contract-deadline').value 
            ? new Date(document.getElementById('contract-deadline').value) 
            : null;
        
        // Validate inputs
        if (!name || !client) {
            alert('Contract name and client are required');
            return;
        }
        
        // Get contract items
        const contractItems = [];
        const itemRows = document.querySelectorAll('.contract-item-row');
        
        for (const row of itemRows) {
            const itemId = row.querySelector('.contract-item-select').value;
            const quantity = parseInt(row.querySelector('.contract-item-quantity').value);
            
            if (itemId && quantity > 0) {
                contractItems.push({
                    itemId: itemId,
                    quantity: quantity
                });
            }
        }
        
        if (contractItems.length === 0) {
            alert('At least one contract item is required');
            return;
        }
        
        // Create and add the contract
        const contract = new Contract(
            Date.now(),
            name,
            client,
            contractItems,
            deadline
        );
        
        // Add to contracts list (you would implement this)
        this.addContract(contract);
        
        // Close modal
        closeModal();
    },
    
    /**
     * Add a contract to the contract list
     * @param {Contract} contract - The contract to add
     */
    addContract(contract) {
        // In a real app, you'd store this in a more persistent data structure
        if (!window.contracts) {
            window.contracts = [];
        }
        
        window.contracts.push(contract);
        
        // Update display
        this.updateContractDisplay();
        
        // Analyze contract feasibility
        const feasibility = contract.validateContractFeasibility();
        
        if (!feasibility.canFulfill) {
            // Show feasibility warning
            showModal(
                'Contract Feasibility Warning',
                `
                    <p>This contract may be challenging to fulfill. You're short on the following materials:</p>
                    <ul>
                        ${feasibility.shortages.map(shortage => 
                            `<li>${shortage.name}: Need ${shortage.needToProduce} more (${shortage.inStock} in stock)</li>`
                        ).join('')}
                    </ul>
                `
            );
        }
        
        return contract;
    },
    
    /**
     * Update the contract display
     */
    updateContractDisplay() {
        const contractContainer = document.getElementById('contracts-container');
        if (!contractContainer) return;
        
        // Clear container
        contractContainer.innerHTML = '';
        
        // Add cards for each contract
        (window.contracts || []).forEach(contract => {
            const contractCard = this.createContractCard(contract);
            contractContainer.appendChild(contractCard);
        });
    },
    
    /**
     * Create a contract card element
     * @param {Contract} contract - The contract to create a card for
     * @returns {HTMLElement} The contract card element
     */
    createContractCard(contract) {
        const card = document.createElement('div');
        card.className = 'contract-card';
        card.dataset.id = contract.id;
        
        // Calculate financials
        const financials = contract.calculateFinancials();
        
        // Status styling
        let statusClass = 'pending';
        switch (contract.status) {
            case 'in-progress':
                statusClass = 'in-progress';
                break;
            case 'completed':
                statusClass = 'completed';
                break;
            case 'failed':
                statusClass = 'failed';
                break;
        }
        
        // Create card content
        card.innerHTML = `
            <div class="contract-header">
                <h3>${contract.name}</h3>
                <span class="contract-status ${statusClass}">${contract.status}</span>
            </div>
            <div class="contract-details">
                <div class="contract-client">
                    <strong>Client:</strong> ${contract.client}
                </div>
                <div class="contract-deadline">
                    <strong>Deadline:</strong> ${contract.deadline ? contract.deadline.toLocaleDateString() : 'No Deadline'}
                </div>
                <div class="contract-items">
                    <h4>Items:</h4>
                    <ul>
                        ${contract.items.map(item => {
                            const recipe = findRecipeById(item.itemId);
                            const itemName = recipe ? recipe.name : item.itemId;
                            return `<li>${itemName}: ${item.quantity}</li>`;
                        }).join('')}
                    </ul>
                </div>
                <div class="contract-financials">
                    <div class="financial-item">
                        <span>Total Cost:</span>
                        ${formatCurrency(financials.totalCost)}
                    </div>
                    <div class="financial-item">
                        <span>Total Revenue:</span>
                        ${formatCurrency(financials.totalRevenue)}
                    </div>
                    <div class="financial-item ${financials.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}">
                        <span>Net Profit:</span>
                        ${formatCurrency(financials.netProfit)}
                    </div>
                    <div class="financial-item">
                        <span>Profit Margin:</span>
                        ${financials.profitMargin}%
                    </div>
                </div>
            </div>
            <div class="contract-actions">
                <button class="btn btn-secondary analyze-contract">
                    <i class="fas fa-chart-pie"></i> Analyze
                </button>
                <button class="btn btn-secondary start-production">
                    <i class="fas fa-play"></i> Start Production
                </button>
                <button class="btn btn-secondary update-status">
                    <i class="fas fa-edit"></i> Update Status
                </button>
            </div>
        `;
        
        // Add event listeners to action buttons
        const analyzeBtn = card.querySelector('.analyze-contract');
        analyzeBtn.addEventListener('click', () => this.analyzeContract(contract));
        
        const startProductionBtn = card.querySelector('.start-production');
        startProductionBtn.addEventListener('click', () => this.startContractProduction(contract));
        
        const updateStatusBtn = card.querySelector('.update-status');
        updateStatusBtn.addEventListener('click', () => this.showUpdateStatusModal(contract));
        
        return card;
    },
    
    /**
     * Analyze contract details and requirements
     * @param {Contract} contract - The contract to analyze
     */
    analyzeContract(contract) {
        // Calculate material requirements
        const materialRequirements = contract.calculateMaterialRequirements();
        
        // Prepare modal content
        let content = `
            <div class="contract-analysis">
                <h3>Contract Analysis: ${contract.name}</h3>
                
                <div class="analysis-section">
                    <h4>Material Requirements</h4>
                    <table class="analysis-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Required</th>
                                <th>In Stock</th>
                                <th>Need to Produce</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.values(materialRequirements).map(material => `
                                <tr class="${material.needToProduce > 0 ? 'status-warn' : 'status-ok'}">
                                    <td>${material.name}</td>
                                    <td>${material.requiredQuantity}</td>
                                    <td>${material.currentInventory}</td>
                                    <td>${material.needToProduce}</td>
                                    <td>${material.needToProduce > 0 ? 'Needs Production' : 'Sufficient'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="analysis-section">
                    <h4>Financial Analysis</h4>
                    ${this.generateFinancialAnalysisHTML(contract)}
                </div>
                
                <div class="analysis-section">
                    <h4>Production Timeline</h4>
                    ${this.generateProductionTimelineHTML(contract)}
                </div>
            </div>
        `;
        
        showModal('Contract Analysis', content);
    },
    
    /**
     * Generate financial analysis HTML
     * @param {Contract} contract - The contract to analyze
     * @returns {string} HTML string with financial details
     */
    generateFinancialAnalysisHTML(contract) {
        const financials = contract.calculateFinancials();
        
        return `
            <div class="financial-breakdown">
                <div class="financial-item">
                    <span>Total Cost:</span>
                    ${formatCurrency(financials.totalCost)}
                </div>
                <div class="financial-item">
                    <span>Total Revenue:</span>
                    ${formatCurrency(financials.totalRevenue)}
                </div>
                <div class="financial-item ${financials.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}">
                    <span>Net Profit:</span>
                    ${formatCurrency(financials.netProfit)}
                </div>
                <div class="financial-item">
                    <span>Profit Margin:</span>
                    ${financials.profitMargin}%
                </div>
            </div>
        `;
    },
    
    /**
     * Generate production timeline HTML
     * @param {Contract} contract - The contract to analyze
     * @returns {string} HTML string with production timeline
     */
    generateProductionTimelineHTML(contract) {
        const productionPlan = contract.generateProductionPlan();
        
        return `
            <div class="production-timeline">
                <table class="timeline-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Priority</th>
                            <th>Estimated Completion</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productionPlan.map(item => {
                            const recipe = findRecipeById(item.itemId);
                            const itemName = recipe ? recipe.name : item.itemId;
                            
                            return `
                                <tr>
                                    <td>${itemName}</td>
                                    <td>${item.quantity}</td>
                                    <td class="priority ${item.priority}">${capitalizeFirstLetter(item.priority)}</td>
                                    <td>${item.timeline.toLocaleDateString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    /**
     * Start production for a contract
     * @param {Contract} contract - The contract to start production for
     */
    startContractProduction(contract) {
        // Validate contract feasibility
        const feasibility = contract.validateContractFeasibility();
        
        if (!feasibility.canFulfill) {
            // Show material shortage warning
            showModal(
                'Production Cannot Start',
                `
                    <p>Unable to start production. Material shortages:</p>
                    <ul>
                        ${feasibility.shortages.map(shortage => 
                            `<li>${shortage.name}: Need ${shortage.needToProduce} more (${shortage.inStock} in stock)</li>`
                        ).join('')}
                    </ul>
                    <p>Please acquire or produce the missing materials first.</p>
                `
            );
            return;
        }
        
        // Confirm starting production
        showModal(
            'Start Contract Production',
            `
                <p>Are you sure you want to start production for the contract: ${contract.name}?</p>
                <p>This will add all items to the production queue and update the contract status.</p>
            `,
            () => {
                // Generate and add production queue items
                const productionPlan = contract.generateProductionPlan();
                
                // Add to existing production queue
                productionPlan.forEach(item => {
                    addToProductionQueue(item);
                });
                
                // Update contract status
                contract.updateStatus('in-progress');
                
                // Update displays
                this.updateContractDisplay();
                updateProductionQueue();
                
                // Show confirmation
                showModal(
                    'Production Started',
                    `<p>Production for ${contract.name} has been initiated.</p>`
                );
            }
        );
    },
    
    /**
     * Show modal to update contract status
     * @param {Contract} contract - The contract to update
     */
    showUpdateStatusModal(contract) {
        const content = `
            <div class="form-group">
                <label for="contract-status">Contract Status:</label>
                <select id="contract-status">
                    <option value="pending" ${contract.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${contract.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${contract.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="failed" ${contract.status === 'failed' ? 'selected' : ''}>Failed</option>
                </select>
            </div>
            
            ${contract.status === 'completed' || contract.status === 'failed' ? '' : `
                <div class="form-group">
                    <label for="contract-notes">Additional Notes:</label>
                    <textarea id="contract-notes" rows="3" placeholder="Optional notes about the status change"></textarea>
                </div>
            `}
        `;
        
        showModal(
            `Update ${contract.name} Status`,
            content,
            () => {
                const newStatus = document.getElementById('contract-status').value;
                const notes = document.getElementById('contract-notes')?.value;
                
                // Update contract status
                contract.updateStatus(newStatus);
                
                // In a real app, you might save additional notes
                if (notes) {
                    // Implement note saving logic
                    console.log('Status change notes:', notes);
                }
                
                // Update display
                this.updateContractDisplay();
                
                // Close modal
                closeModal();
                
                // Show confirmation
                showModal(
                    'Status Updated',
                    `<p>Contract "${contract.name}" status updated to ${newStatus}.</p>`
                );
            }
        );
    }
};

// Initialize the contracts system
document.addEventListener('DOMContentLoaded', () => {
    // Add contracts section to the main HTML (update index.html)
    const contractsSection = document.createElement('section');
    contractsSection.id = 'contracts';
    contractsSection.className = 'content-section';
    contractsSection.innerHTML = `
        <div class="section-header">
            <h2>Contracts</h2>
            <div class="action-buttons">
                <button type="button" class="btn" id="add-contract">
                    <i class="fas fa-plus"></i> New Contract
                </button>
            </div>
        </div>
        
        <div id="contracts-container" class="contracts-list">
            <!-- Contracts will be populated here -->
        </div>
    `;
    
    // Find the main content area and append the contracts section
    const mainContent = document.querySelector('.main-content main');
    if (mainContent) {
        mainContent.appendChild(contractsSection);
    }
    
    // Add contracts to the sidebar navigation
    const sidebar = document.querySelector('.sidebar .nav-links');
    if (sidebar) {
        const contractNavItem = document.createElement('li');
        contractNavItem.className = 'nav-item';
        contractNavItem.dataset.target = 'contracts';
        contractNavItem.innerHTML = `
            <i class="fas fa-file-contract"></i> Contracts
        `;
        
        sidebar.appendChild(contractNavItem);
        
        // Add click event listener to navigate to contracts
        contractNavItem.addEventListener('click', () => {
            if (typeof navigateTo === 'function') {
                navigateTo('contracts');
            }
        });
    }
    
    // Initialize contracts module
    contractManagement.initContracts();
});

// Expose contract management to window for global access
window.contractManagement = contractManagement;
window.Contract = Contract;