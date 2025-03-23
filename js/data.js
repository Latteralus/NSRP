/**
 * RedM Blacksmith Business Tool - Data Models
 * 
 * This file contains:
 * - Data models and structures
 * - Data manipulation methods
 * - Storage and retrieval functions
 */

// Material data model
class Material {
    constructor(id, name, quantity, cost, category) {
        this.id = id;
        this.name = name;
        this.quantity = quantity || 0;
        this.cost = cost || 0;
        this.category = category || 'raw';
    }
    
    get value() {
        return this.quantity * this.cost;
    }
    
    get status() {
        if (this.quantity <= 0) return 'out';
        if (this.quantity <= appState.lowStockThreshold) return 'low';
        return 'normal';
    }
}

// Crafted item data model
class CraftedItem {
    constructor(id, name, quantity, cost, value, category) {
        this.id = id;
        this.name = name;
        this.quantity = quantity || 0;
        this.cost = cost || 0;
        this.value = value || 0;
        this.category = category || 'misc';
    }
    
    get totalValue() {
        return this.quantity * this.value;
    }
    
    get profit() {
        return this.value - this.cost;
    }
    
    get profitMargin() {
        if (this.value === 0) return 0;
        return (this.profit / this.value) * 100;
    }
    
    get status() {
        if (this.quantity <= 0) return 'out';
        if (this.quantity <= appState.lowStockThreshold) return 'low';
        return 'normal';
    }
}

// Recipe data model
class Recipe {
    constructor(id, name, outputQuantity, craftingTime, ingredients, value) {
        this.id = id;
        this.name = name;
        this.outputQuantity = outputQuantity || 1;
        this.craftingTime = craftingTime || 5; // in minutes
        this.ingredients = ingredients || [];
        this.value = value || 0;
    }
    
    get cost() {
        let totalCost = 0;
        
        for (const ingredient of this.ingredients) {
            const material = findMaterialById(ingredient.id);
            if (material) {
                totalCost += material.cost * ingredient.quantity;
            } else {
                // Check if ingredient is a crafted item
                const craftedItem = findCraftedItemById(ingredient.id);
                if (craftedItem) {
                    totalCost += craftedItem.value * ingredient.quantity;
                }
            }
        }
        
        return totalCost;
    }
    
    get unitCost() {
        return this.cost / this.outputQuantity;
    }
    
    get profit() {
        return (this.value * this.outputQuantity) - this.cost;
    }
    
    get unitProfit() {
        return this.value - this.unitCost;
    }
    
    get profitMargin() {
        if (this.value === 0) return 0;
        return (this.unitProfit / this.value) * 100;
    }
    
    // Check if we have enough materials to craft this recipe
    canCraft(quantity = 1) {
        for (const ingredient of this.ingredients) {
            const material = findMaterialById(ingredient.id);
            if (material) {
                if (material.quantity < ingredient.quantity * quantity) {
                    return false;
                }
            } else {
                // Check if ingredient is a crafted item
                const craftedItem = findCraftedItemById(ingredient.id);
                if (craftedItem) {
                    if (craftedItem.quantity < ingredient.quantity * quantity) {
                        return false;
                    }
                } else {
                    // Ingredient not found in either inventory
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Get missing materials for crafting
    getMissingMaterials(quantity = 1) {
        const missing = [];
        
        for (const ingredient of this.ingredients) {
            const material = findMaterialById(ingredient.id);
            if (material) {
                const requiredQty = ingredient.quantity * quantity;
                if (material.quantity < requiredQty) {
                    missing.push({
                        id: material.id,
                        name: material.name,
                        required: requiredQty,
                        available: material.quantity,
                        missing: requiredQty - material.quantity
                    });
                }
            } else {
                // Check if ingredient is a crafted item
                const craftedItem = findCraftedItemById(ingredient.id);
                if (craftedItem) {
                    const requiredQty = ingredient.quantity * quantity;
                    if (craftedItem.quantity < requiredQty) {
                        missing.push({
                            id: craftedItem.id,
                            name: craftedItem.name,
                            required: requiredQty,
                            available: craftedItem.quantity,
                            missing: requiredQty - craftedItem.quantity
                        });
                    }
                } else {
                    // Ingredient not found in either inventory
                    missing.push({
                        id: ingredient.id,
                        name: ingredient.id, // Fallback name
                        required: ingredient.quantity * quantity,
                        available: 0,
                        missing: ingredient.quantity * quantity
                    });
                }
            }
        }
        
        return missing;
    }
    
    // Craft the item
    craft(quantity = 1) {
        if (!this.canCraft(quantity)) {
            throw new Error(`Cannot craft ${this.name}: insufficient materials`);
        }
        
        // Consume materials
        for (const ingredient of this.ingredients) {
            const material = findMaterialById(ingredient.id);
            if (material) {
                material.quantity -= ingredient.quantity * quantity;
            } else {
                // Check if ingredient is a crafted item
                const craftedItem = findCraftedItemById(ingredient.id);
                if (craftedItem) {
                    craftedItem.quantity -= ingredient.quantity * quantity;
                }
            }
        }
        
        // Add crafted item to inventory
        const craftedItem = findCraftedItemById(this.id);
        if (craftedItem) {
            craftedItem.quantity += this.outputQuantity * quantity;
        } else {
            // Create new crafted item if it doesn't exist
            const newItem = new CraftedItem(
                this.id,
                this.name,
                this.outputQuantity * quantity,
                this.unitCost,
                this.value,
                'crafted'
            );
            craftedInventory.push(newItem);
        }
        
        // Return crafting results
        return {
            id: this.id,
            name: this.name,
            quantity: this.outputQuantity * quantity,
            cost: this.cost * quantity,
            value: this.value * this.outputQuantity * quantity,
            profit: this.profit * quantity
        };
    }
}

// Transaction data model
class Transaction {
    constructor(id, type, date, items, totalValue) {
        this.id = id;
        this.type = type; // 'sale', 'purchase', 'craft'
        this.date = date || new Date();
        this.items = items || [];
        this.totalValue = totalValue || 0;
    }
    
    get formattedDate() {
        return this.date.toLocaleDateString();
    }
}

// Item for production queue
class ProductionItem {
    constructor(id, itemId, quantity, priority, timeline, status) {
        this.id = id;
        this.itemId = itemId;
        this.quantity = quantity || 1;
        this.priority = priority || 'normal'; // 'normal', 'high', 'urgent'
        this.timeline = timeline || new Date();
        this.status = status || 'pending'; // 'pending', 'ready', 'completed', 'cancelled'
    }
    
    get recipe() {
        return findRecipeById(this.itemId);
    }
    
    get name() {
        const recipe = this.recipe;
        return recipe ? recipe.name : this.itemId;
    }
    
    get estimatedCost() {
        const recipe = this.recipe;
        return recipe ? recipe.cost * this.quantity : 0;
    }
    
    get estimatedValue() {
        const recipe = this.recipe;
        return recipe ? recipe.value * recipe.outputQuantity * this.quantity : 0;
    }
    
    get estimatedProfit() {
        return this.estimatedValue - this.estimatedCost;
    }
    
    get materialsStatus() {
        const recipe = this.recipe;
        if (!recipe) return 'unknown';
        
        const missing = recipe.getMissingMaterials(this.quantity);
        if (missing.length === 0) return 'ready';
        return 'missing';
    }
    
    get missingMaterials() {
        const recipe = this.recipe;
        if (!recipe) return [];
        
        return recipe.getMissingMaterials(this.quantity);
    }
    
    get estimatedTime() {
        const recipe = this.recipe;
        return recipe ? recipe.craftingTime * this.quantity : 0;
    }
    
    // Start production if materials are available
    startProduction() {
        const recipe = this.recipe;
        if (!recipe) {
            throw new Error(`Recipe not found for ${this.itemId}`);
        }
        
        if (!recipe.canCraft(this.quantity)) {
            throw new Error(`Cannot produce ${recipe.name}: insufficient materials`);
        }
        
        // Craft the item
        const result = recipe.craft(this.quantity);
        
        // Update status
        this.status = 'completed';
        
        // Create transaction record
        const transaction = new Transaction(
            Date.now(),
            'craft',
            new Date(),
            [{
                id: recipe.id,
                name: recipe.name,
                quantity: result.quantity,
                value: result.value
            }],
            result.value
        );
        
        // Add to transaction history
        transactionHistory.push(transaction);
        
        return result;
    }
}

// Helper functions for finding items in inventory
function findMaterialById(id) {
    return materialInventory.find(item => item.id === id);
}

function findCraftedItemById(id) {
    return craftedInventory.find(item => item.id === id);
}

function findRecipeById(id) {
    return recipeData.find(recipe => recipe.id === id);
}

function findPriceById(id) {
    return pricingData.find(price => price.id === id);
}

function findQueueItemById(id) {
    return productionQueue.find(item => item.id === id);
}

// Helper functions for data manipulation
function addMaterial(material) {
    const existingMaterial = findMaterialById(material.id);
    if (existingMaterial) {
        // Update existing material
        existingMaterial.quantity += material.quantity;
        existingMaterial.cost = material.cost; // Update cost to latest value
        return existingMaterial;
    } else {
        // Add new material
        materialInventory.push(material);
        return material;
    }
}

function removeMaterial(id, quantity) {
    const material = findMaterialById(id);
    if (!material) {
        throw new Error(`Material not found: ${id}`);
    }
    
    if (material.quantity < quantity) {
        throw new Error(`Insufficient quantity of ${material.name}`);
    }
    
    material.quantity -= quantity;
    return material;
}

function addCraftedItem(item) {
    const existingItem = findCraftedItemById(item.id);
    if (existingItem) {
        // Update existing item
        existingItem.quantity += item.quantity;
        existingItem.cost = item.cost; // Update cost to latest value
        existingItem.value = item.value; // Update value to latest price
        return existingItem;
    } else {
        // Add new item
        craftedInventory.push(item);
        return item;
    }
}

function removeCraftedItem(id, quantity) {
    const item = findCraftedItemById(id);
    if (!item) {
        throw new Error(`Item not found: ${id}`);
    }
    
    if (item.quantity < quantity) {
        throw new Error(`Insufficient quantity of ${item.name}`);
    }
    
    item.quantity -= quantity;
    return item;
}

function addRecipe(recipe) {
    const existingRecipe = findRecipeById(recipe.id);
    if (existingRecipe) {
        // Update existing recipe
        Object.assign(existingRecipe, recipe);
        return existingRecipe;
    } else {
        // Add new recipe
        recipeData.push(recipe);
        return recipe;
    }
}

function removeRecipe(id) {
    const index = recipeData.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
        recipeData.splice(index, 1);
        return true;
    }
    return false;
}

function updatePrice(id, price) {
    const existingPrice = findPriceById(id);
    if (existingPrice) {
        // Update existing price
        existingPrice.price = price;
        existingPrice.lastUpdated = new Date().toISOString();
        return existingPrice;
    } else {
        // Add new price
        const newPrice = {
            id: id,
            price: price,
            lastUpdated: new Date().toISOString()
        };
        pricingData.push(newPrice);
        return newPrice;
    }
}

function addToProductionQueue(item) {
    // Generate a unique ID if not provided
    if (!item.id) {
        item.id = Date.now();
    }
    
    productionQueue.push(item);
    return item;
}

function removeFromProductionQueue(id) {
    const index = productionQueue.findIndex(item => item.id === id);
    if (index !== -1) {
        productionQueue.splice(index, 1);
        return true;
    }
    return false;
}

function updateProductionQueueItem(id, updates) {
    const item = findQueueItemById(id);
    if (item) {
        Object.assign(item, updates);
        return item;
    }
    return null;
}

// Data export and import functions
function exportInventoryData() {
    return {
        materials: materialInventory,
        craftedItems: craftedInventory
    };
}

function importInventoryData(data) {
    if (data.materials) {
        materialInventory = data.materials.map(item => 
            new Material(item.id, item.name, item.quantity, item.cost, item.category)
        );
    }
    
    if (data.craftedItems) {
        craftedInventory = data.craftedItems.map(item => 
            new CraftedItem(item.id, item.name, item.quantity, item.cost, item.value, item.category)
        );
    }
}

function exportRecipeData() {
    return recipeData;
}

function importRecipeData(data) {
    recipeData = data.map(recipe => 
        new Recipe(
            recipe.id,
            recipe.name,
            recipe.outputQuantity,
            recipe.craftingTime,
            recipe.ingredients,
            recipe.value
        )
    );
}

function exportProductionData() {
    return productionQueue;
}

function importProductionData(data) {
    productionQueue = data.map(item => 
        new ProductionItem(
            item.id,
            item.itemId,
            item.quantity,
            item.priority,
            new Date(item.timeline),
            item.status
        )
    );
}

function exportTransactionHistory() {
    return transactionHistory;
}

function importTransactionHistory(data) {
    transactionHistory = data.map(transaction => 
        new Transaction(
            transaction.id,
            transaction.type,
            new Date(transaction.date),
            transaction.items,
            transaction.totalValue
        )
    );
}

// Sample transaction history
let transactionHistory = [];

// Export necessary functions and classes
window.Material = Material;
window.CraftedItem = CraftedItem;
window.Recipe = Recipe;
window.Transaction = Transaction;
window.ProductionItem = ProductionItem;

// Functions
window.findMaterialById = findMaterialById;
window.findCraftedItemById = findCraftedItemById;
window.findRecipeById = findRecipeById;
window.findPriceById = findPriceById;
window.findQueueItemById = findQueueItemById;

window.addMaterial = addMaterial;
window.removeMaterial = removeMaterial;
window.addCraftedItem = addCraftedItem;
window.removeCraftedItem = removeCraftedItem;
window.addRecipe = addRecipe;
window.removeRecipe = removeRecipe;
window.updatePrice = updatePrice;
window.addToProductionQueue = addToProductionQueue;
window.removeFromProductionQueue = removeFromProductionQueue;
window.updateProductionQueueItem = updateProductionQueueItem;

window.exportInventoryData = exportInventoryData;
window.importInventoryData = importInventoryData;
window.exportRecipeData = exportRecipeData;
window.importRecipeData = importRecipeData;
window.exportProductionData = exportProductionData;
window.importProductionData = importProductionData;
window.exportTransactionHistory = exportTransactionHistory;
window.importTransactionHistory = importTransactionHistory;