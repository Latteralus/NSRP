/**
 * RedM Blacksmith Business Tool - Recipe Management
 * 
 * This file contains:
 * - Recipe initialization
 * - Recipe display updates
 * - Recipe manipulation functions
 * - Recipe adding/editing/removal
 */

/**
 * Initialize the recipes module
 */
function initRecipes() {
    // Convert plain objects to class instances
    convertRecipesToInstances();
    
    // Set up event listeners
    setupRecipeEventListeners();
    
    // Update recipe displays
    updateRecipeDisplay();
}

/**
 * Convert plain recipe objects to class instances
 */
function convertRecipesToInstances() {
    recipeData = recipeData.map(recipe => {
        if (!(recipe instanceof Recipe)) {
            return new Recipe(
                recipe.id,
                recipe.name,
                recipe.outputQuantity,
                recipe.craftingTime,
                recipe.ingredients,
                recipe.value
            );
        }
        return recipe;
    });
}

/**
 * Set up recipe event listeners
 */
function setupRecipeEventListeners() {
    // Add recipe button
    const addRecipeBtn = document.getElementById('add-recipe');
    if (addRecipeBtn) {
        addRecipeBtn.addEventListener('click', showAddRecipeModal);
    }
}

/**
 * Update the recipe display in the UI
 */
function updateRecipeDisplay() {
    const recipeContainer = document.getElementById('recipe-container');
    if (!recipeContainer) return;
    
    // Clear container
    recipeContainer.innerHTML = '';
    
    // Add cards for each recipe
    recipeData.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipeContainer.appendChild(recipeCard);
    });
}

/**
 * Create a recipe card element
 * @param {Recipe} recipe - The recipe to create a card for
 * @returns {HTMLElement} The recipe card element
 */
function createRecipeCard(recipe) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.dataset.id = recipe.id;
    
    // Calculate profit metrics
    const unitProfit = recipe.unitProfit;
    const profitMargin = recipe.profitMargin;
    const isProfitPositive = unitProfit > 0;
    
    // Create header
    const recipeHeader = document.createElement('div');
    recipeHeader.className = 'recipe-header';
    recipeHeader.innerHTML = `
        <div class="recipe-title">
            <h3><i class="fas fa-${getRecipeIcon(recipe.id)}"></i> ${recipe.name}</h3>
            <span class="recipe-output">Makes ${recipe.outputQuantity}</span>
        </div>
        <div class="recipe-profit ${isProfitPositive ? 'profit-positive' : 'profit-negative'}">
            Profit: ${isProfitPositive ? '+' : ''}${formatCurrency(unitProfit)} per unit
        </div>
        <div class="recipe-toggle">
            <i class="fas fa-chevron-down"></i>
        </div>
    `;
    recipeHeader.addEventListener('click', (e) => toggleRecipe(e.currentTarget));
    
    // Create details section
    const recipeDetails = document.createElement('div');
    recipeDetails.className = 'recipe-details';
    
    // Create ingredients section
    let ingredientsHTML = `
        <div class="recipe-ingredients">
            <h4>Ingredients:</h4>
            <table class="ingredients-table">
    `;
    
    // Add rows for each ingredient
    recipe.ingredients.forEach(ingredient => {
        const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
        const materialName = material ? material.name : ingredient.id;
        const materialCost = material ? material.cost : 0;
        const totalCost = materialCost * ingredient.quantity;
        
        ingredientsHTML += `
            <tr>
                <td>${materialName}:</td>
                <td>
                    <input type="number" value="${ingredient.quantity}" min="0" step="1" 
                           data-ingredient="${ingredient.id}" data-recipe="${recipe.id}">
                </td>
                <td>${formatCurrency(totalCost)}</td>
            </tr>
        `;
    });
    
    ingredientsHTML += `
            </table>
        </div>
    `;
    
    // Create costs section
    let costsHTML = `
        <div class="recipe-costs">
            <div class="cost-item">
                <span>Total Cost:</span>
                <span>${formatCurrency(recipe.cost)} (${formatCurrency(recipe.unitCost)} per unit)</span>
            </div>
            <div class="cost-item">
                <span>Sale Price:</span>
                <span>
                    ${formatCurrency(recipe.value)} per unit
                    <button class="btn-icon edit-price" data-id="${recipe.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </span>
            </div>
            <div class="cost-item">
                <span>Profit:</span>
                <span class="${isProfitPositive ? 'profit-positive' : 'profit-negative'}">
                    ${isProfitPositive ? '+' : ''}${formatCurrency(unitProfit)} per unit (${profitMargin.toFixed(1)}%)
                </span>
            </div>
            <div class="cost-item">
                <span>Crafting Time:</span>
                <span>
                    ${recipe.craftingTime} minutes
                </span>
            </div>
        </div>
    `;
    
    // Create actions section
    let actionsHTML = `
        <div class="recipe-actions">
            <button class="btn btn-craft" data-id="${recipe.id}">
                <i class="fas fa-hammer"></i> Craft Now
            </button>
            <button class="btn btn-secondary edit-recipe" data-id="${recipe.id}">
                <i class="fas fa-edit"></i> Edit Recipe
            </button>
            <button class="btn btn-danger delete-recipe" data-id="${recipe.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    // Combine all sections
    recipeDetails.innerHTML = ingredientsHTML + costsHTML + actionsHTML;
    
    // Append elements to the card
    recipeCard.appendChild(recipeHeader);
    recipeCard.appendChild(recipeDetails);
    
    // Add event listeners
    recipeCard.querySelectorAll('input[data-ingredient]').forEach(input => {
        input.addEventListener('change', updateRecipeIngredient);
    });
    
    recipeCard.querySelector('.btn-craft').addEventListener('click', craftRecipe);
    recipeCard.querySelector('.edit-recipe').addEventListener('click', showEditRecipeModal);
    recipeCard.querySelector('.delete-recipe').addEventListener('click', showDeleteRecipeConfirmation);
    recipeCard.querySelector('.edit-price').addEventListener('click', showEditPriceModal);
    
    return recipeCard;
}

/**
 * Get an icon for a recipe based on its ID
 * @param {string} recipeId - The recipe ID
 * @returns {string} The icon name
 */
function getRecipeIcon(recipeId) {
    const iconMap = {
        'iron-bar': 'cube',
        'nails': 'thumbtack',
        'shell-casing': 'bullseye',
        'silver-horseshoes': 'shoe-prints',
        'pickaxe': 'pick',
        'hammer': 'hammer',
        'knife': 'cut',
        'axe': 'axe',
        'rifle-barrel': 'crosshairs'
    };
    
    return iconMap[recipeId] || 'cube';
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
 * Update recipe ingredient when changed in the UI
 * @param {Event} event - The change event
 */
function updateRecipeIngredient(event) {
    const ingredientId = event.target.dataset.ingredient;
    const recipeId = event.target.dataset.recipe;
    const newQuantity = parseInt(event.target.value);
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Find the ingredient in the recipe
    const ingredient = recipe.ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;
    
    // Update the ingredient quantity
    ingredient.quantity = newQuantity;
    
    // Update the recipe card
    updateRecipeCard(recipe);
    
    // Update craftable items that use this recipe
    updateCraftedItemsCost();
}

/**
 * Update a recipe card in the UI
 * @param {Recipe} recipe - The recipe to update
 */
function updateRecipeCard(recipe) {
    const recipeCard = document.querySelector(`.recipe-card[data-id="${recipe.id}"]`);
    if (!recipeCard) return;
    
    // Update profit in header
    const profitElement = recipeCard.querySelector('.recipe-profit');
    const isProfitPositive = recipe.unitProfit > 0;
    profitElement.className = `recipe-profit ${isProfitPositive ? 'profit-positive' : 'profit-negative'}`;
    profitElement.textContent = `Profit: ${isProfitPositive ? '+' : ''}${formatCurrency(recipe.unitProfit)} per unit`;
    
    // Update total cost
    const totalCostElement = recipeCard.querySelector('.recipe-costs .cost-item:first-child span:last-child');
    totalCostElement.textContent = `${formatCurrency(recipe.cost)} (${formatCurrency(recipe.unitCost)} per unit)`;
    
    // Update profit details
    const profitDetailsElement = recipeCard.querySelector('.recipe-costs .cost-item:nth-child(3) span:last-child');
    profitDetailsElement.className = isProfitPositive ? 'profit-positive' : 'profit-negative';
    profitDetailsElement.textContent = `${isProfitPositive ? '+' : ''}${formatCurrency(recipe.unitProfit)} per unit (${recipe.profitMargin.toFixed(1)}%)`;
    
    // Update ingredient costs
    recipe.ingredients.forEach(ingredient => {
        const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
        const materialCost = material ? material.cost : 0;
        const totalCost = materialCost * ingredient.quantity;
        
        const ingredientCostElement = recipeCard.querySelector(`input[data-ingredient="${ingredient.id}"]`).closest('tr').querySelector('td:last-child');
        ingredientCostElement.textContent = formatCurrency(totalCost);
    });
}

/**
 * Craft a recipe
 * @param {Event} event - The click event
 */
function craftRecipe(event) {
    const recipeId = event.currentTarget.dataset.id;
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Check if we can craft the recipe
    if (!recipe.canCraft()) {
        const missingMaterials = recipe.getMissingMaterials();
        
        let missingHTML = '<ul class="missing-materials">';
        missingMaterials.forEach(material => {
            missingHTML += `<li>${material.name}: Needed ${material.required}, Available ${material.available}</li>`;
        });
        missingHTML += '</ul>';
        
        showModal(
            'Missing Materials',
            `<p>You don't have enough materials to craft ${recipe.name}:</p>${missingHTML}`
        );
        return;
    }
    
    // Show confirmation
    showModal(
        `Craft ${recipe.name}`,
        `
            <p>Are you sure you want to craft ${recipe.outputQuantity} ${recipe.name}?</p>
            <p>This will use:</p>
            <ul>
                ${recipe.ingredients.map(ingredient => {
                    const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
                    const materialName = material ? material.name : ingredient.id;
                    return `<li>${materialName}: ${ingredient.quantity}</li>`;
                }).join('')}
            </ul>
        `,
        () => {
            try {
                // Craft the recipe
                const result = recipe.craft();
                
                // Show result
                showModal(
                    'Crafting Complete',
                    `
                        <p>Successfully crafted ${result.quantity} ${result.name}!</p>
                        <p>Total cost: ${formatCurrency(result.cost)}</p>
                        <p>Value: ${formatCurrency(result.value)}</p>
                        <p>Profit: ${formatCurrency(result.profit)}</p>
                    `
                );
                
                // Update displays
                updateInventoryDisplay();
                
            } catch (error) {
                showModal('Crafting Error', `<p>Error: ${error.message}</p>`);
            }
        }
    );
}

/**
 * Show modal for adding a new recipe
 */
function showAddRecipeModal() {
    // Get all available materials and crafted items for ingredient selection
    const availableIngredients = [...materialInventory, ...craftedInventory];
    
    let ingredientsOptions = '';
    availableIngredients.forEach(item => {
        ingredientsOptions += `<option value="${item.id}">${item.name}</option>`;
    });
    
    let content = `
        <div class="form-group">
            <label for="recipe-name">Recipe Name:</label>
            <input type="text" id="recipe-name" required>
        </div>
        <div class="form-group">
            <label for="recipe-id">Recipe ID (no spaces):</label>
            <input type="text" id="recipe-id" required>
        </div>
        <div class="form-group">
            <label for="recipe-output-quantity">Output Quantity:</label>
            <input type="number" id="recipe-output-quantity" value="1" min="1">
        </div>
        <div class="form-group">
            <label for="recipe-value">Sale Price (per unit):</label>
            <input type="number" id="recipe-value" value="1.00" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label for="recipe-crafting-time">Crafting Time (minutes):</label>
            <input type="number" id="recipe-crafting-time" value="5" min="1">
        </div>
        
        <h4>Ingredients</h4>
        <div id="ingredients-container">
            <div class="ingredient-row">
                <select class="ingredient-select">
                    <option value="">Select Ingredient</option>
                    ${ingredientsOptions}
                </select>
                <input type="number" class="ingredient-quantity" value="1" min="1">
                <button type="button" class="btn-icon remove-ingredient">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <button type="button" class="btn btn-secondary" id="add-ingredient">
            <i class="fas fa-plus"></i> Add Ingredient
        </button>
    `;
    
    showModal(
        'Add New Recipe',
        content,
        addNewRecipe
    );
    
    // Auto-generate ID from name
    const nameInput = document.getElementById('recipe-name');
    const idInput = document.getElementById('recipe-id');
    
    nameInput.addEventListener('input', () => {
        idInput.value = nameInput.value.toLowerCase().replace(/\s+/g, '-');
    });
    
    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient');
    addIngredientBtn.addEventListener('click', addIngredientRow);
    
    // Remove ingredient button
    const removeIngredientBtn = document.querySelector('.remove-ingredient');
    removeIngredientBtn.addEventListener('click', removeIngredientRow);
}

/**
 * Add a new ingredient row to the add/edit recipe modal
 */
function addIngredientRow() {
    const ingredientsContainer = document.getElementById('ingredients-container');
    const availableIngredients = [...materialInventory, ...craftedInventory];
    
    let ingredientsOptions = '';
    availableIngredients.forEach(item => {
        ingredientsOptions += `<option value="${item.id}">${item.name}</option>`;
    });
    
    const ingredientRow = document.createElement('div');
    ingredientRow.className = 'ingredient-row';
    ingredientRow.innerHTML = `
        <select class="ingredient-select">
            <option value="">Select Ingredient</option>
            ${ingredientsOptions}
        </select>
        <input type="number" class="ingredient-quantity" value="1" min="1">
        <button type="button" class="btn-icon remove-ingredient">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    ingredientsContainer.appendChild(ingredientRow);
    
    // Add event listener to remove button
    const removeBtn = ingredientRow.querySelector('.remove-ingredient');
    removeBtn.addEventListener('click', removeIngredientRow);
}

/**
 * Remove an ingredient row from the add/edit recipe modal
 * @param {Event} event - The click event
 */
function removeIngredientRow(event) {
    const ingredientRow = event.currentTarget.closest('.ingredient-row');
    
    // Don't remove if it's the only row
    const allRows = document.querySelectorAll('.ingredient-row');
    if (allRows.length > 1) {
        ingredientRow.remove();
    }
}

/**
 * Add a new recipe from modal
 */
function addNewRecipe() {
    // Get form values
    const name = document.getElementById('recipe-name').value;
    const id = document.getElementById('recipe-id').value;
    const outputQuantity = parseInt(document.getElementById('recipe-output-quantity').value);
    const value = parseFloat(document.getElementById('recipe-value').value);
    const craftingTime = parseInt(document.getElementById('recipe-crafting-time').value);
    
    // Validate inputs
    if (!name || !id) {
        alert('Name and ID are required');
        return;
    }
    
    // Check for duplicate ID
    if (findRecipeById(id)) {
        alert('A recipe with this ID already exists');
        return;
    }
    
    // Get ingredients
    const ingredients = [];
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    
    for (const row of ingredientRows) {
        const ingredientId = row.querySelector('.ingredient-select').value;
        const quantity = parseInt(row.querySelector('.ingredient-quantity').value);
        
        if (ingredientId && quantity > 0) {
            ingredients.push({
                id: ingredientId,
                quantity: quantity
            });
        }
    }
    
    if (ingredients.length === 0) {
        alert('At least one ingredient is required');
        return;
    }
    
    // Create new recipe
    const recipe = new Recipe(
        id,
        name,
        outputQuantity,
        craftingTime,
        ingredients,
        value
    );
    
    // Add to recipe data
    recipeData.push(recipe);
    
    // Update price data
    updatePrice(id, value);
    
    // Update display
    updateRecipeDisplay();
    
    // Close modal
    closeModal();
}

/**
 * Show modal for editing a recipe
 * @param {Event} event - The click event
 */
function showEditRecipeModal(event) {
    event.stopPropagation();
    
    const recipeId = event.currentTarget.dataset.id;
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Get all available materials and crafted items for ingredient selection
    const availableIngredients = [...materialInventory, ...craftedInventory];
    
    let ingredientsOptions = '';
    availableIngredients.forEach(item => {
        ingredientsOptions += `<option value="${item.id}">${item.name}</option>`;
    });
    
    let content = `
        <div class="form-group">
            <label for="edit-recipe-name">Recipe Name:</label>
            <input type="text" id="edit-recipe-name" value="${recipe.name}" required>
        </div>
        <div class="form-group">
            <label for="edit-recipe-output-quantity">Output Quantity:</label>
            <input type="number" id="edit-recipe-output-quantity" value="${recipe.outputQuantity}" min="1">
        </div>
        <div class="form-group">
            <label for="edit-recipe-value">Sale Price (per unit):</label>
            <input type="number" id="edit-recipe-value" value="${recipe.value.toFixed(2)}" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label for="edit-recipe-crafting-time">Crafting Time (minutes):</label>
            <input type="number" id="edit-recipe-crafting-time" value="${recipe.craftingTime}" min="1">
        </div>
        
        <h4>Ingredients</h4>
        <div id="edit-ingredients-container">
    `;
    
    // Add existing ingredients
    recipe.ingredients.forEach(ingredient => {
        const material = findMaterialById(ingredient.id) || findCraftedItemById(ingredient.id);
        const materialName = material ? material.name : ingredient.id;
        
        content += `
            <div class="ingredient-row" data-id="${ingredient.id}">
                <select class="ingredient-select">
                    <option value="">Select Ingredient</option>
                    ${availableIngredients.map(item => 
                        `<option value="${item.id}" ${item.id === ingredient.id ? 'selected' : ''}>${item.name}</option>`
                    ).join('')}
                </select>
                <input type="number" class="ingredient-quantity" value="${ingredient.quantity}" min="1">
                <button type="button" class="btn-icon remove-ingredient">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    content += `
        </div>
        
        <button type="button" class="btn btn-secondary" id="edit-add-ingredient">
            <i class="fas fa-plus"></i> Add Ingredient
        </button>
    `;
    
    showModal(
        `Edit ${recipe.name} Recipe`,
        content,
        () => updateRecipe(recipeId)
    );
    
    // Add ingredient button
    const addIngredientBtn = document.getElementById('edit-add-ingredient');
    addIngredientBtn.addEventListener('click', () => {
        const container = document.getElementById('edit-ingredients-container');
        
        const ingredientRow = document.createElement('div');
        ingredientRow.className = 'ingredient-row';
        ingredientRow.innerHTML = `
            <select class="ingredient-select">
                <option value="">Select Ingredient</option>
                ${ingredientsOptions}
            </select>
            <input type="number" class="ingredient-quantity" value="1" min="1">
            <button type="button" class="btn-icon remove-ingredient">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(ingredientRow);
        
        // Add event listener to remove button
        const removeBtn = ingredientRow.querySelector('.remove-ingredient');
        removeBtn.addEventListener('click', (e) => {
            const row = e.currentTarget.closest('.ingredient-row');
            row.remove();
        });
    });
    
    // Remove ingredient buttons
    const removeIngredientBtns = document.querySelectorAll('.remove-ingredient');
    removeIngredientBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = e.currentTarget.closest('.ingredient-row');
            
            // Don't remove if it's the only row
            const allRows = document.querySelectorAll('.ingredient-row');
            if (allRows.length > 1) {
                row.remove();
            }
        });
    });
}

/**
 * Update a recipe from modal
 * @param {string} recipeId - The ID of the recipe to update
 */
function updateRecipe(recipeId) {
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Get form values
    const name = document.getElementById('edit-recipe-name').value;
    const outputQuantity = parseInt(document.getElementById('edit-recipe-output-quantity').value);
    const value = parseFloat(document.getElementById('edit-recipe-value').value);
    const craftingTime = parseInt(document.getElementById('edit-recipe-crafting-time').value);
    
    // Validate inputs
    if (!name) {
        alert('Name is required');
        return;
    }
    
    // Get ingredients
    const ingredients = [];
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    
    for (const row of ingredientRows) {
        const ingredientId = row.querySelector('.ingredient-select').value;
        const quantity = parseInt(row.querySelector('.ingredient-quantity').value);
        
        if (ingredientId && quantity > 0) {
            ingredients.push({
                id: ingredientId,
                quantity: quantity
            });
        }
    }
    
    if (ingredients.length === 0) {
        alert('At least one ingredient is required');
        return;
    }
    
    // Update recipe
    recipe.name = name;
    recipe.outputQuantity = outputQuantity;
    recipe.value = value;
    recipe.craftingTime = craftingTime;
    recipe.ingredients = ingredients;
    
    // Update price data
    updatePrice(recipeId, value);
    
    // Update display
    updateRecipeDisplay();
    
    // Update crafted items that use this recipe
    updateCraftedItemsCost();
    
    // Close modal
    closeModal();
}

/**
 * Show modal for editing a recipe price
 * @param {Event} event - The click event
 */
function showEditPriceModal(event) {
    event.stopPropagation();
    
    const recipeId = event.currentTarget.dataset.id;
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Calculate recommended price based on cost and default margin
    const cost = recipe.unitCost;
    const recommendedPrice = cost * 1.3; // 30% margin
    
    let content = `
        <div class="form-group">
            <label for="price-cost">Production Cost:</label>
            <input type="number" id="price-cost" value="${cost.toFixed(2)}" disabled>
        </div>
        <div class="form-group">
            <label for="price-target-margin">Target Profit Margin (%):</label>
            <input type="number" id="price-target-margin" value="30" min="0" max="100">
        </div>
        <div class="form-group">
            <label for="price-recommended">Recommended Price:</label>
            <input type="number" id="price-recommended" value="${recommendedPrice.toFixed(2)}" disabled>
        </div>
        <div class="form-group">
            <label for="price-new">New Price:</label>
            <input type="number" id="price-new" value="${recipe.value.toFixed(2)}" min="0" step="0.01">
        </div>
    `;
    
    showModal(
        `Edit ${recipe.name} Price`,
        content,
        () => updateRecipePrice(recipeId)
    );
    
    // Update recommended price when margin changes
    const marginInput = document.getElementById('price-target-margin');
    marginInput.addEventListener('input', () => {
        const margin = parseFloat(marginInput.value) / 100;
        const newRecommendedPrice = cost * (1 + margin);
        document.getElementById('price-recommended').value = newRecommendedPrice.toFixed(2);
        document.getElementById('price-new').value = newRecommendedPrice.toFixed(2);
    });
    
    // Use recommended price button
    const useRecommendedBtn = document.createElement('button');
    useRecommendedBtn.className = 'btn btn-secondary';
    useRecommendedBtn.textContent = 'Use Recommended';
    useRecommendedBtn.style.marginTop = '10px';
    
    document.getElementById('price-recommended').parentNode.appendChild(useRecommendedBtn);
    
    useRecommendedBtn.addEventListener('click', () => {
        const recommendedPrice = parseFloat(document.getElementById('price-recommended').value);
        document.getElementById('price-new').value = recommendedPrice.toFixed(2);
    });
}

/**
 * Update a recipe price from modal
 * @param {string} recipeId - The ID of the recipe to update
 */
function updateRecipePrice(recipeId) {
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    // Get form value
    const newPrice = parseFloat(document.getElementById('price-new').value);
    
    // Update recipe
    recipe.value = newPrice;
    
    // Update price data
    updatePrice(recipeId, newPrice);
    
    // Update display
    updateRecipeDisplay();
    
    // Update crafted items that use this recipe
    updateCraftedItemsCost();
    
    // Close modal
    closeModal();
}

/**
 * Show confirmation for deleting a recipe
 * @param {Event} event - The click event
 */
function showDeleteRecipeConfirmation(event) {
    event.stopPropagation();
    
    const recipeId = event.currentTarget.dataset.id;
    
    // Find the recipe
    const recipe = findRecipeById(recipeId);
    if (!recipe) return;
    
    showModal(
        `Delete ${recipe.name} Recipe`,
        `<p>Are you sure you want to delete this recipe? This cannot be undone.</p>`,
        () => deleteRecipe(recipeId)
    );
}

/**
 * Delete a recipe
 * @param {string} recipeId - The ID of the recipe to delete
 */
function deleteRecipe(recipeId) {
    // Remove recipe from data
    recipeData = recipeData.filter(recipe => recipe.id !== recipeId);
    
    // Update display
    updateRecipeDisplay();
    
    // Close modal
    closeModal();
}

// Initialize the recipes system
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initApp === 'function') {
        // Wait for app initialization
        document.addEventListener('appInitialized', initRecipes);
    } else {
        // Initialize directly if app.js is not available
        initRecipes();
    }
});