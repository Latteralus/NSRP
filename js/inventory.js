/**
 * RedM Blacksmith Business Tool - Inventory Management
 * 
 * This file contains:
 * - Inventory initialization
 * - Inventory display updates
 * - Inventory manipulation functions
 * - Inventory item adding/editing/removal
 */

/**
 * Initialize the inventory module
 */
function initInventory() {
    // Convert plain objects to class instances
    convertInventoryToInstances();
    
    // Set up event listeners
    setupInventoryEventListeners();
    
    // Update inventory displays
    updateInventoryDisplay();
}

/**
 * Convert plain inventory objects to class instances
 */
function convertInventoryToInstances() {
    // Convert materials
    materialInventory = materialInventory.map(item => {
        if (!(item instanceof Material)) {
            return new Material(item.id, item.name, item.quantity, item.cost, item.category);
        }
        return item;
    });
    
    // Convert crafted items
    craftedInventory = craftedInventory.map(item => {
        if (!(item instanceof CraftedItem)) {
            return new CraftedItem(item.id, item.name, item.quantity, item.cost, item.value, item.category);
        }
        return item;
    });
}

/**
 * Set up inventory event listeners
 */
function setupInventoryEventListeners() {
    // Add inventory item button
    const addInventoryBtn = document.getElementById('add-inventory');
    if (addInventoryBtn) {
        addInventoryBtn.addEventListener('click', showAddInventoryModal);
    }
    
    // Export inventory button
    const exportInventoryBtn = document.getElementById('export-inventory');
    if (exportInventoryBtn) {
        exportInventoryBtn.addEventListener('click', exportInventoryToCSV);
    }
    
    // Filter inputs for inventory tables
    const inventoryFilters = document.querySelectorAll('.filters input');
    inventoryFilters.forEach(filter => {
        filter.addEventListener('input', filterInventoryTable);
    });
    
    // Category filters for inventory tables
    const categoryFilters = document.querySelectorAll('.filters select');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', filterInventoryTable);
    });
}

/**
 * Update the inventory display in the UI
 */
function updateInventoryDisplay() {
    updateMaterialsInventoryTable();
    updateCraftedInventoryTable();
    updateInventorySummary();
}

/**
 * Update the materials inventory table
 */
function updateMaterialsInventoryTable() {
    const tableBody = document.getElementById('materials-inventory');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows for each material
    materialInventory.forEach(material => {
        const row = document.createElement('tr');
        row.dataset.id = material.id;
        
        // Calculate total value
        const totalValue = material.quantity * material.cost;
        
        row.innerHTML = `
            <td>${material.name}</td>
            <td>
                <input type="number" class="quantity-input" data-item="${material.id}" value="${material.quantity}" min="0">
            </td>
            <td>
                <input type="number" class="cost-input" data-item="${material.id}" value="${material.cost.toFixed(2)}" step="0.01" min="0">
            </td>
            <td>${formatCurrency(totalValue)}</td>
            <td><span class="status ${material.status}">${capitalizeFirstLetter(material.status)}</span></td>
            <td>
                <button class="btn-icon edit-item" data-id="${material.id}" data-type="material"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-item" data-id="${material.id}" data-type="material"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to inputs
    const quantityInputs = tableBody.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', updateMaterialQuantity);
    });
    
    const costInputs = tableBody.querySelectorAll('.cost-input');
    costInputs.forEach(input => {
        input.addEventListener('change', updateMaterialCost);
    });
    
    // Add event listeners to buttons
    const editButtons = tableBody.querySelectorAll('.edit-item');
    editButtons.forEach(button => {
        button.addEventListener('click', showEditItemModal);
    });
    
    const deleteButtons = tableBody.querySelectorAll('.delete-item');
    deleteButtons.forEach(button => {
        button.addEventListener('click', showDeleteItemConfirmation);
    });
}

/**
 * Update the crafted items inventory table
 */
function updateCraftedInventoryTable() {
    const tableBody = document.getElementById('crafted-inventory');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add rows for each crafted item
    craftedInventory.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Calculate profit margin
        const profitMargin = ((item.value - item.cost) / item.value * 100).toFixed(1);
        const isProfitPositive = item.value > item.cost;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <input type="number" class="quantity-input" data-item="${item.id}" value="${item.quantity}" min="0">
            </td>
            <td>${formatCurrency(item.cost)}</td>
            <td>${formatCurrency(item.value)}</td>
            <td class="${isProfitPositive ? 'profit-positive' : 'profit-negative'}">
                ${isProfitPositive ? '+' : ''}${formatCurrency(item.value - item.cost)} (${profitMargin}%)
            </td>
            <td><span class="status ${item.status}">${capitalizeFirstLetter(item.status)}</span></td>
            <td>
                <button class="btn-icon edit-item" data-id="${item.id}" data-type="crafted"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete-item" data-id="${item.id}" data-type="crafted"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to inputs
    const quantityInputs = tableBody.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', updateCraftedItemQuantity);
    });
    
    // Add event listeners to buttons
    const editButtons = tableBody.querySelectorAll('.edit-item');
    editButtons.forEach(button => {
        button.addEventListener('click', showEditItemModal);
    });
    
    const deleteButtons = tableBody.querySelectorAll('.delete-item');
    deleteButtons.forEach(button => {
        button.addEventListener('click', showDeleteItemConfirmation);
    });
}

/**
 * Update inventory summary information
 */
function updateInventorySummary() {
    // Update materials summary
    const totalMaterialTypes = document.getElementById('total-material-types');
    const totalMaterialUnits = document.getElementById('total-material-units');
    const totalMaterialValue = document.getElementById('total-material-value');
    
    if (totalMaterialTypes && totalMaterialUnits && totalMaterialValue) {
        const totalTypes = materialInventory.length;
        const totalUnits = materialInventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = materialInventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        
        totalMaterialTypes.textContent = totalTypes;
        totalMaterialUnits.textContent = totalUnits;
        totalMaterialValue.textContent = formatCurrency(totalValue);
    }
    
    // Update crafted items summary
    const totalCraftedTypes = document.getElementById('total-crafted-types');
    const totalCraftedUnits = document.getElementById('total-crafted-units');
    const totalCraftedValue = document.getElementById('total-crafted-value');
    
    if (totalCraftedTypes && totalCraftedUnits && totalCraftedValue) {
        const totalTypes = craftedInventory.length;
        const totalUnits = craftedInventory.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = craftedInventory.reduce((sum, item) => sum + (item.quantity * item.value), 0);
        
        totalCraftedTypes.textContent = totalTypes;
        totalCraftedUnits.textContent = totalUnits;
        totalCraftedValue.textContent = formatCurrency(totalValue);
    }
}

/**
 * Update material quantity when changed in the UI
 * @param {Event} event - The change event
 */
function updateMaterialQuantity(event) {
    const itemId = event.target.dataset.item;
    const newQuantity = parseInt(event.target.value);
    
    // Find the material
    const material = findMaterialById(itemId);
    if (material) {
        material.quantity = newQuantity;
        
        // Update the row display
        const row = event.target.closest('tr');
        const totalValueCell = row.querySelector('td:nth-child(4)');
        const statusCell = row.querySelector('td:nth-child(5) .status');
        
        totalValueCell.textContent = formatCurrency(material.quantity * material.cost);
        statusCell.className = `status ${material.status}`;
        statusCell.textContent = capitalizeFirstLetter(material.status);
        
        // Update summary
        updateInventorySummary();
    }
}

/**
 * Update material cost when changed in the UI
 * @param {Event} event - The change event
 */
function updateMaterialCost(event) {
    const itemId = event.target.dataset.item;
    const newCost = parseFloat(event.target.value);
    
    // Find the material
    const material = findMaterialById(itemId);
    if (material) {
        material.cost = newCost;
        
        // Update the row display
        const row = event.target.closest('tr');
        const totalValueCell = row.querySelector('td:nth-child(4)');
        
        totalValueCell.textContent = formatCurrency(material.quantity * material.cost);
        
        // Update summary
        updateInventorySummary();
        
        // Update crafted items that use this material
        updateCraftedItemsCost();
    }
}

/**
 * Update crafted item quantity when changed in the UI
 * @param {Event} event - The change event
 */
function updateCraftedItemQuantity(event) {
    const itemId = event.target.dataset.item;
    const newQuantity = parseInt(event.target.value);
    
    // Find the crafted item
    const item = findCraftedItemById(itemId);
    if (item) {
        item.quantity = newQuantity;
        
        // Update status cell
        const row = event.target.closest('tr');
        const statusCell = row.querySelector('td:nth-child(6) .status');
        
        statusCell.className = `status ${item.status}`;
        statusCell.textContent = capitalizeFirstLetter(item.status);
        
        // Update summary
        updateInventorySummary();
    }
}

/**
 * Update costs of crafted items when material costs change
 */
function updateCraftedItemsCost() {
    // For each recipe, recalculate the cost
    recipeData.forEach(recipe => {
        const craftedItem = findCraftedItemById(recipe.id);
        if (craftedItem) {
            craftedItem.cost = recipe.unitCost;
        }
    });
    
    // Update the crafted inventory table
    updateCraftedInventoryTable();
}

/**
 * Show modal for adding a new inventory item
 */
function showAddInventoryModal() {
    const activeTab = document.querySelector('.tab.active');
    const itemType = activeTab.dataset.target === 'raw-materials' ? 'material' : 'crafted';
    
    let content = `
        <div class="form-group">
            <label for="item-name">Item Name:</label>
            <input type="text" id="item-name" required>
        </div>
        <div class="form-group">
            <label for="item-id">Item ID (no spaces):</label>
            <input type="text" id="item-id" required>
        </div>
        <div class="form-group">
            <label for="item-quantity">Quantity:</label>
            <input type="number" id="item-quantity" value="0" min="0">
        </div>
    `;
    
    if (itemType === 'material') {
        content += `
            <div class="form-group">
                <label for="item-cost">Cost Per Unit:</label>
                <input type="number" id="item-cost" value="0.00" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="item-category">Category:</label>
                <select id="item-category">
                    <option value="raw">Raw Material</option>
                    <option value="metal">Metal</option>
                    <option value="fuel">Fuel</option>
                    <option value="other">Other</option>
                </select>
            </div>
        `;
    } else {
        content += `
            <div class="form-group">
                <label for="item-cost">Cost to Produce:</label>
                <input type="number" id="item-cost" value="0.00" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="item-value">Sale Price:</label>
                <input type="number" id="item-value" value="0.00" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="item-category">Category:</label>
                <select id="item-category">
                    <option value="misc">Miscellaneous</option>
                    <option value="tools">Tools</option>
                    <option value="weapons">Weapon Parts</option>
                    <option value="crafted">Crafted Material</option>
                </select>
            </div>
        `;
    }
    
    showModal(
        `Add New ${itemType === 'material' ? 'Material' : 'Item'}`,
        content,
        () => addInventoryItem(itemType)
    );
    
    // Auto-generate ID from name
    const nameInput = document.getElementById('item-name');
    const idInput = document.getElementById('item-id');
    
    nameInput.addEventListener('input', () => {
        idInput.value = nameInput.value.toLowerCase().replace(/\s+/g, '-');
    });
}

/**
 * Add a new inventory item from modal
 * @param {string} itemType - The type of item (material or crafted)
 */
function addInventoryItem(itemType) {
    // Get form values
    const name = document.getElementById('item-name').value;
    const id = document.getElementById('item-id').value;
    const quantity = parseInt(document.getElementById('item-quantity').value);
    const cost = parseFloat(document.getElementById('item-cost').value);
    const category = document.getElementById('item-category').value;
    
    // Validate inputs
    if (!name || !id) {
        alert('Name and ID are required');
        return;
    }
    
    // Check for duplicate ID
    if (findMaterialById(id) || findCraftedItemById(id)) {
        alert('An item with this ID already exists');
        return;
    }
    
    if (itemType === 'material') {
        // Create new material
        const material = new Material(id, name, quantity, cost, category);
        materialInventory.push(material);
        
        // Update display
        updateMaterialsInventoryTable();
    } else {
        // Create new crafted item
        const value = parseFloat(document.getElementById('item-value').value);
        const craftedItem = new CraftedItem(id, name, quantity, cost, value, category);
        craftedInventory.push(craftedItem);
        
        // Update display
        updateCraftedInventoryTable();
    }
    
    // Update summary
    updateInventorySummary();
    
    // Close modal
    closeModal();
}

/**
 * Show modal for editing an inventory item
 * @param {Event} event - The click event
 */
function showEditItemModal(event) {
    const itemId = event.currentTarget.dataset.id;
    const itemType = event.currentTarget.dataset.type;
    
    let item;
    if (itemType === 'material') {
        item = findMaterialById(itemId);
    } else {
        item = findCraftedItemById(itemId);
    }
    
    if (!item) return;
    
    let content = `
        <div class="form-group">
            <label for="edit-item-name">Item Name:</label>
            <input type="text" id="edit-item-name" value="${item.name}" required>
        </div>
        <div class="form-group">
            <label for="edit-item-quantity">Quantity:</label>
            <input type="number" id="edit-item-quantity" value="${item.quantity}" min="0">
        </div>
    `;
    
    if (itemType === 'material') {
        content += `
            <div class="form-group">
                <label for="edit-item-cost">Cost Per Unit:</label>
                <input type="number" id="edit-item-cost" value="${item.cost.toFixed(2)}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="edit-item-category">Category:</label>
                <select id="edit-item-category">
                    <option value="raw" ${item.category === 'raw' ? 'selected' : ''}>Raw Material</option>
                    <option value="metal" ${item.category === 'metal' ? 'selected' : ''}>Metal</option>
                    <option value="fuel" ${item.category === 'fuel' ? 'selected' : ''}>Fuel</option>
                    <option value="other" ${item.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        `;
    } else {
        content += `
            <div class="form-group">
                <label for="edit-item-cost">Cost to Produce:</label>
                <input type="number" id="edit-item-cost" value="${item.cost.toFixed(2)}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="edit-item-value">Sale Price:</label>
                <input type="number" id="edit-item-value" value="${item.value.toFixed(2)}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="edit-item-category">Category:</label>
                <select id="edit-item-category">
                    <option value="misc" ${item.category === 'misc' ? 'selected' : ''}>Miscellaneous</option>
                    <option value="tools" ${item.category === 'tools' ? 'selected' : ''}>Tools</option>
                    <option value="weapons" ${item.category === 'weapons' ? 'selected' : ''}>Weapon Parts</option>
                    <option value="crafted" ${item.category === 'crafted' ? 'selected' : ''}>Crafted Material</option>
                </select>
            </div>
        `;
    }
    
    showModal(
        `Edit ${itemType === 'material' ? 'Material' : 'Item'}`,
        content,
        () => updateInventoryItem(itemId, itemType)
    );
}

/**
 * Update an inventory item from modal
 * @param {string} itemId - The ID of the item to update
 * @param {string} itemType - The type of item (material or crafted)
 */
function updateInventoryItem(itemId, itemType) {
    // Get form values
    const name = document.getElementById('edit-item-name').value;
    const quantity = parseInt(document.getElementById('edit-item-quantity').value);
    const cost = parseFloat(document.getElementById('edit-item-cost').value);
    const category = document.getElementById('edit-item-category').value;
    
    // Validate inputs
    if (!name) {
        alert('Name is required');
        return;
    }
    
    if (itemType === 'material') {
        // Update material
        const material = findMaterialById(itemId);
        if (material) {
            material.name = name;
            material.quantity = quantity;
            material.cost = cost;
            material.category = category;
            
            // Update display
            updateMaterialsInventoryTable();
        }
    } else {
        // Update crafted item
        const value = parseFloat(document.getElementById('edit-item-value').value);
        const craftedItem = findCraftedItemById(itemId);
        if (craftedItem) {
            craftedItem.name = name;
            craftedItem.quantity = quantity;
            craftedItem.cost = cost;
            craftedItem.value = value;
            craftedItem.category = category;
            
            // Update display
            updateCraftedInventoryTable();
        }
    }
    
    // Update summary
    updateInventorySummary();
    
    // Close modal
    closeModal();
}

/**
 * Show confirmation for deleting an inventory item
 * @param {Event} event - The click event
 */
function showDeleteItemConfirmation(event) {
    const itemId = event.currentTarget.dataset.id;
    const itemType = event.currentTarget.dataset.type;
    
    let item;
    if (itemType === 'material') {
        item = findMaterialById(itemId);
    } else {
        item = findCraftedItemById(itemId);
    }
    
    if (!item) return;
    
    showModal(
        `Delete ${item.name}`,
        `<p>Are you sure you want to delete ${item.name} from your inventory?</p>`,
        () => deleteInventoryItem(itemId, itemType)
    );
}

/**
 * Delete an inventory item
 * @param {string} itemId - The ID of the item to delete
 * @param {string} itemType - The type of item (material or crafted)
 */
function deleteInventoryItem(itemId, itemType) {
    if (itemType === 'material') {
        // Delete material
        materialInventory = materialInventory.filter(item => item.id !== itemId);
        
        // Update display
        updateMaterialsInventoryTable();
    } else {
        // Delete crafted item
        craftedInventory = craftedInventory.filter(item => item.id !== itemId);
        
        // Update display
        updateCraftedInventoryTable();
    }
    
    // Update summary
    updateInventorySummary();
    
    // Close modal
    closeModal();
}

/**
 * Filter inventory table based on search input and category
 * @param {Event} event - The input or change event
 */
function filterInventoryTable(event) {
    const filterInput = event.target.closest('.filters').querySelector('input');
    const categorySelect = event.target.closest('.filters').querySelector('select');
    
    const searchTerm = filterInput.value.toLowerCase();
    const categoryFilter = categorySelect.value;
    
    // Determine which table to filter
    const isRawMaterials = event.target.closest('.tab-content').id === 'raw-materials';
    const rows = isRawMaterials
        ? document.querySelectorAll('#materials-inventory tr')
        : document.querySelectorAll('#crafted-inventory tr');
    
    rows.forEach(row => {
        const itemId = row.dataset.id;
        const item = isRawMaterials
            ? findMaterialById(itemId)
            : findCraftedItemById(itemId);
        
        if (!item) return;
        
        // Check if item matches search term
        const nameMatches = item.name.toLowerCase().includes(searchTerm);
        
        // Check if item matches category filter
        const categoryMatches = categoryFilter === 'all' || item.category === categoryFilter;
        
        // Show/hide row based on filters
        if (nameMatches && categoryMatches) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Export inventory to CSV file
 */
function exportInventoryToCSV() {
    const activeTab = document.querySelector('.tab.active');
    const isRawMaterials = activeTab.dataset.target === 'raw-materials';
    
    let csvContent = '';
    let fileName = '';
    
    if (isRawMaterials) {
        // Export raw materials
        csvContent = 'ID,Name,Quantity,Cost Per Unit,Total Value,Category\n';
        fileName = 'raw_materials_inventory.csv';
        
        materialInventory.forEach(item => {
            csvContent += `${item.id},${item.name},${item.quantity},${item.cost},${item.quantity * item.cost},${item.category}\n`;
        });
    } else {
        // Export crafted items
        csvContent = 'ID,Name,Quantity,Cost to Produce,Sale Price,Profit Margin,Category\n';
        fileName = 'crafted_items_inventory.csv';
        
        craftedInventory.forEach(item => {
            const profitMargin = ((item.value - item.cost) / item.value * 100).toFixed(1);
            csvContent += `${item.id},${item.name},${item.quantity},${item.cost},${item.value},${profitMargin}%,${item.category}\n`;
        });
    }
    
    // Create download link
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the inventory system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initApp === 'function') {
        // Wait for app initialization
        document.addEventListener('appInitialized', initInventory);
    } else {
        // Initialize directly if app.js is not available
        initInventory();
    }
});