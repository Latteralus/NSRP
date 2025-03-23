/**
 * RedM Blacksmith Business Tool - Production Management
 * 
 * This file contains:
 * - Production queue initialization
 * - Production planning
 * - Production queue management
 * - Production calculations
 */

/**
 * Initialize the production module
 */
function initProduction() {
    // Convert plain objects to class instances
    convertProductionToInstances();
    
    // Set up event listeners
    setupProductionEventListeners();
    
    // Populate recipe select options
    populateRecipeOptions();
    
    // Set today's date as default timeline
    setDefaultTimeline();
    
    // Update production displays
    updateProductionDisplay();
}

/**
 * Convert plain production objects to class instances
 */
function convertProductionToInstances() {
    productionQueue = productionQueue.map(item => {
        if (!(item instanceof ProductionItem)) {
            return new ProductionItem(
                item.id,
                item.itemId,
                item.quantity,
                item.priority,
                new Date(item.timeline),
                item.status
            );
        }
        return item;
    });
}

/**
 * Set up production event listeners
 */
function setupProductionEventListeners() {
    // Add to production queue button
    const addToProductionBtn = document.getElementById('add-to-production');
    if (addToProductionBtn) {
        addToProductionBtn.addEventListener('click', addToProductionQueue);
    }
    
    // Recipe selection changes
    const recipeSelect = document.getElementById('prod-item-select');
    if (recipeSelect) {
        recipeSelect.addEventListener('change', updateProductionCalculator);
    }
    
    // Quantity changes
    const quantityInput = document.getElementById('prod-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('change', updateProductionCalculator);
        quantityInput.addEventListener('input', updateProductionCalculator);
    }
}

/**
 * Populate the recipe select options
 */
function populateRecipeOptions() {
    const recipeSelect = document.getElementById('prod-item-select');
    if (!recipeSelect) return;
    
    // Clear existing options
    recipeSelect.innerHTML = '';
    
    // Add options for each recipe
    recipeData.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = `${recipe.name} (makes ${recipe.outputQuantity})`;
        recipeSelect.appendChild(option);
    });
    
    // Update calculator with selected recipe
    updateProductionCalculator();
}

/**
 * Set default timeline to today's date
 */
function setDefaultTimeline() {
    const timelineInput = document.getElementById('prod-timeline');
    if (timelineInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        timelineInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

/**
 * Update the production display
 */
function updateProductionDisplay() {
    updateProductionCalculator();
    updateProductionQueue();
}

/**
 * Update the production calculator with selected recipe and quantity
 */
function updateProductionCalculator() {
    const recipeSelect = document.getElementById('prod-item-select');
    const quantityInput = document.getElementById('prod-quantity');
    
    if (!recipeSelect || !quantityInput) return;
    
    const recipeId = recipeSelect.value;
    const quantity = parseInt(quantityInput.value);
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Calculate materials needed
    updateMaterialsList(recipe, quantity);
    
    // Check inventory status
    updateInventoryStatus(recipe, quantity);
    
    // Update production summary
    updateProductionSummary(recipe, quantity);
}

/**
 * Update the materials list in the calculator
 * @param {Recipe} recipe - The selected recipe
 * @param {number} quantity - The quantity to produce
 */
function updateMaterialsList(recipe, quantity) {
    const materialsList = document.getElementById('prod-materials-list');
    if (!materialsList) return;
    
    // Clear existing list
    materialsList.innerHTML = '';
    
    // Calculate materials needed for each ingredient
    recipe.ingredients.forEach(ingredient => {
        const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
        const materialName = material ? material.name : ingredient.id;
        const requiredQuantity = ingredient.quantity * quantity;
        
        const listItem = document.createElement('li');
        listItem.textContent = `${materialName}: ${requiredQuantity} units`;
        materialsList.appendChild(listItem);
    });
}

/**
 * Update the inventory status in the calculator
 * @param {Recipe} recipe - The selected recipe
 * @param {number} quantity - The quantity to produce
 */
function updateInventoryStatus(recipe, quantity) {
    const inventoryStatus = document.getElementById('prod-inventory-status');
    if (!inventoryStatus) return;
    
    // Clear existing list
    inventoryStatus.innerHTML = '';
    
    // Check each ingredient
    recipe.ingredients.forEach(ingredient => {
        const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
        const materialName = material ? material.name : ingredient.id;
        const materialQuantity = material ? material.quantity : 0;
        const requiredQuantity = ingredient.quantity * quantity;
        
        const listItem = document.createElement('li');
        
        if (materialQuantity >= requiredQuantity) {
            listItem.className = 'status-ok';
            listItem.textContent = `${materialName}: ${materialQuantity}/${requiredQuantity} (Sufficient)`;
        } else {
            listItem.className = 'status-warn';
            listItem.textContent = `${materialName}: ${materialQuantity}/${requiredQuantity} (Insufficient)`;
        }
        
        inventoryStatus.appendChild(listItem);
    });
}

/**
 * Update the production summary in the calculator
 * @param {Recipe} recipe - The selected recipe
 * @param {number} quantity - The quantity to produce
 */
function updateProductionSummary(recipe, quantity) {
    const totalCostElement = document.getElementById('prod-total-cost');
    const estimatedTimeElement = document.getElementById('prod-estimated-time');
    const expectedProfitElement = document.getElementById('prod-expected-profit');
    
    if (!totalCostElement || !estimatedTimeElement || !expectedProfitElement) return;
    
    // Calculate values
    const totalCost = recipe.cost * quantity;
    const totalValue = recipe.value * recipe.outputQuantity * quantity;
    const profit = totalValue - totalCost;
    const estimatedTime = recipe.craftingTime * quantity;
    
    // Update elements
    totalCostElement.textContent = formatCurrency(totalCost);
    estimatedTimeElement.textContent = `${estimatedTime} minutes`;
    
    if (profit >= 0) {
        expectedProfitElement.className = 'profit-positive';
        expectedProfitElement.textContent = `+${formatCurrency(profit)}`;
    } else {
        expectedProfitElement.className = 'profit-negative';
        expectedProfitElement.textContent = formatCurrency(profit);
    }
}

/**
 * Add the current recipe to the production queue
 */
function addToProductionQueue() {
    const recipeSelect = document.getElementById('prod-item-select');
    const quantityInput = document.getElementById('prod-quantity');
    const prioritySelect = document.getElementById('prod-priority');
    const timelineInput = document.getElementById('prod-timeline');
    
    if (!recipeSelect || !quantityInput || !prioritySelect || !timelineInput) return;
    
    const recipeId = recipeSelect.value;
    const quantity = parseInt(quantityInput.value);
    const priority = prioritySelect.value;
    const timeline = new Date(timelineInput.value);
    
    // Validate inputs
    if (!recipeId) {
        showModal('Error', '<p>Please select a recipe.</p>');
        return;
    }
    
    if (quantity <= 0) {
        showModal('Error', '<p>Quantity must be greater than zero.</p>');
        return;
    }
    
    if (isNaN(timeline.getTime())) {
        showModal('Error', '<p>Please enter a valid date.</p>');
        return;
    }
    
    // Create new production item
    const productionItem = new ProductionItem(
        Date.now(), // Generate unique ID
        recipeId,
        quantity,
        priority,
        timeline
    );
    
    // Add to queue
    productionQueue.push(productionItem);
    
    // Update display
    updateProductionQueue();
    
    // Reset inputs
    quantityInput.value = 1;
    prioritySelect.value = 'normal';
    
    // Show confirmation
    showModal('Success', '<p>Item added to production queue.</p>');
}

/**
 * Update the production queue display
 */
function updateProductionQueue() {
    const queueList = document.getElementById('queue-list');
    if (!queueList) return;
    
    // Clear existing list
    queueList.innerHTML = '';
    
    // Sort queue by priority and timeline
    const sortedQueue = [...productionQueue].sort((a, b) => {
        const priorityOrder = { 'urgent': 0, 'high': 1, 'normal': 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.timeline) - new Date(b.timeline);
    });
    
    // Add rows for each item
    sortedQueue.forEach(item => {
        // Skip completed items
        if (item.status === 'completed') return;
        
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Get recipe name
        const recipe = findRecipeById(item.itemId);
        const itemName = recipe ? recipe.name : item.itemId;
        
        // Format date
        const timeline = new Date(item.timeline);
        const formattedDate = timeline.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Material status
        let materialStatus = '';
        let statusClass = '';
        
        if (item.materialsStatus === 'ready') {
            materialStatus = 'Ready to Produce';
            statusClass = 'status-ok';
        } else if (item.materialsStatus === 'missing') {
            const missingItems = item.missingMaterials.map(m => `${m.missing} ${m.name}`).join(', ');
            materialStatus = `Missing ${missingItems}`;
            statusClass = 'status-warn';
        } else {
            materialStatus = 'Unknown Status';
            statusClass = '';
        }
        
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${item.quantity}</td>
            <td><span class="${statusClass}">${materialStatus}</span></td>
            <td>${formattedDate}</td>
            <td class="${item.estimatedProfit >= 0 ? 'profit-positive' : 'profit-negative'}">
                ${item.estimatedProfit >= 0 ? '+' : ''}${formatCurrency(item.estimatedProfit)}
            </td>
            <td><span class="priority ${item.priority}">${capitalizeFirstLetter(item.priority)}</span></td>
            <td>
                <button class="btn-icon start-production" data-id="${item.id}" ${item.materialsStatus !== 'ready' ? 'disabled' : ''}>
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn-icon edit-production" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-production" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        queueList.appendChild(row);
    });
    
    // Add event listeners to buttons
    const startButtons = queueList.querySelectorAll('.start-production');
    startButtons.forEach(button => {
        button.addEventListener('click', startProduction);
    });
    
    const editButtons = queueList.querySelectorAll('.edit-production');
    editButtons.forEach(button => {
        button.addEventListener('click', showEditProductionModal);
    });
    
    const deleteButtons = queueList.querySelectorAll('.delete-production');
    deleteButtons.forEach(button => {
        button.addEventListener('click', showDeleteProductionConfirmation);
    });
}

/**
 * Start production for a queue item
 * @param {Event} event - The click event
 */
function startProduction(event) {
    const itemId = event.currentTarget.dataset.id;
    
    // Find the production item
    const productionItem = findQueueItemById(parseInt(itemId));
    if (!productionItem) return;
    
    // Check if we can produce
    if (productionItem.materialsStatus !== 'ready') {
        showModal('Error', '<p>Cannot start production: insufficient materials.</p>');
        return;
    }
    
    // Show confirmation
    showModal(
        'Start Production',
        `
            <p>Are you sure you want to start production of ${productionItem.quantity} ${productionItem.name}?</p>
            <p>This will consume the required materials from your inventory.</p>
        `,
        () => {
            try {
                // Start production
                const result = productionItem.startProduction();
                
                // Update displays
                updateInventoryDisplay();
                updateProductionQueue();
                
                // Show result
                showModal(
                    'Production Complete',
                    `
                        <p>Successfully produced ${result.quantity} ${result.name}!</p>
                        <p>Total cost: ${formatCurrency(result.cost)}</p>
                        <p>Value: ${formatCurrency(result.value)}</p>
                        <p>Profit: ${formatCurrency(result.profit)}</p>
                    `
                );
                
            } catch (error) {
                showModal('Production Error', `<p>Error: ${error.message}</p>`);
            }
        }
    );
}

/**
 * Show modal for editing a production queue item
 * @param {Event} event - The click event
 */
function showEditProductionModal(event) {
    const itemId = event.currentTarget.dataset.id;
    
    // Find the production item
    const productionItem = findQueueItemById(parseInt(itemId));
    if (!productionItem) return;
    
    // Get recipe name
    const recipe = findRecipeById(productionItem.itemId);
    const itemName = recipe ? recipe.name : productionItem.itemId;
    
    // Format date
    const timeline = new Date(productionItem.timeline);
    const formattedDate = timeline.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    let content = `
        <div class="form-group">
            <label for="edit-prod-item">Item:</label>
            <input type="text" id="edit-prod-item" value="${itemName}" disabled>
        </div>
        <div class="form-group">
            <label for="edit-prod-quantity">Quantity:</label>
            <input type="number" id="edit-prod-quantity" value="${productionItem.quantity}" min="1">
        </div>
        <div class="form-group">
            <label for="edit-prod-priority">Priority:</label>
            <select id="edit-prod-priority">
                <option value="normal" ${productionItem.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${productionItem.priority === 'high' ? 'selected' : ''}>High</option>
                <option value="urgent" ${productionItem.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
        </div>
        <div class="form-group">
            <label for="edit-prod-timeline">Timeline:</label>
            <input type="date" id="edit-prod-timeline" value="${formattedDate}">
        </div>
    `;
    
    showModal(
        `Edit Production: ${itemName}`,
        content,
        () => updateProductionItem(itemId)
    );
}

/**
 * Update a production queue item from modal
 * @param {string} itemId - The ID of the item to update
 */
function updateProductionItem(itemId) {
    // Find the production item
    const productionItem = findQueueItemById(parseInt(itemId));
    if (!productionItem) return;
    
    // Get form values
    const quantity = parseInt(document.getElementById('edit-prod-quantity').value);
    const priority = document.getElementById('edit-prod-priority').value;
    const timeline = new Date(document.getElementById('edit-prod-timeline').value);
    
    // Validate inputs
    if (quantity <= 0) {
        alert('Quantity must be greater than zero');
        return;
    }
    
    if (isNaN(timeline.getTime())) {
        alert('Please enter a valid date');
        return;
    }
    
    // Update item
    productionItem.quantity = quantity;
    productionItem.priority = priority;
    productionItem.timeline = timeline;
    
    // Update display
    updateProductionQueue();
    
    // Close modal
    closeModal();
}

/**
 * Show confirmation for deleting a production queue item
 * @param {Event} event - The click event
 */
function showDeleteProductionConfirmation(event) {
    const itemId = event.currentTarget.dataset.id;
    
    // Find the production item
    const productionItem = findQueueItemById(parseInt(itemId));
    if (!productionItem) return;
    
    // Get recipe name
    const recipe = findRecipeById(productionItem.itemId);
    const itemName = recipe ? recipe.name : productionItem.itemId;
    
    showModal(
        `Delete Production Item`,
        `<p>Are you sure you want to remove ${itemName} from the production queue?</p>`,
        () => deleteProductionItem(itemId)
    );
}

/**
 * Delete a production queue item
 * @param {string} itemId - The ID of the item to delete
 */
function deleteProductionItem(itemId) {
    // Remove item from queue
    productionQueue = productionQueue.filter(item => item.id !== parseInt(itemId));
    
    // Update display
    updateProductionQueue();
    
    // Close modal
    closeModal();
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the production system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initApp === 'function') {
        // Wait for app initialization
        document.addEventListener('appInitialized', initProduction);
    } else {
        // Initialize directly if app.js is not available
        initProduction();
    }
});