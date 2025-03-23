/**
 * RedM Blacksmith Business Tool - Core Application Logic
 * 
 * This file contains the core application initialization 
 * and primary navigation functionality.
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

/**
 * Initialize the application
 */
function initApp() {
    // Load saved data if available
    loadSavedData();
    
    // Set date input defaults
    const defaultDate = new Date();
    const prodTimelineInput = document.getElementById('prod-timeline');
    if (prodTimelineInput) {
        prodTimelineInput.valueAsDate = defaultDate;
    }
    
    // Update theme
    updateTheme();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize modules
    initModules();
    
    // Update dashboard
    updateDashboard();
    
    // Dispatch app initialization event
    const event = new Event('appInitialized');
    document.dispatchEvent(event);
}

/**
 * Initialize event listeners
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
    
    // Settings form event listeners
    setupSettingsFormListeners();
}

/**
 * Set up event listeners for settings form
 */
function setupSettingsFormListeners() {
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
}

/**
 * Initialize modules by calling their init functions
 */
function initModules() {
    // Initialize systems if their initialization functions exist
    const modules = [
        { name: 'initInventory', fn: typeof initInventory === 'function' ? initInventory : null },
        { name: 'initRecipes', fn: typeof initRecipes === 'function' ? initRecipes : null },
        { name: 'initProduction', fn: typeof initProduction === 'function' ? initProduction : null },
        { name: 'initPricing', fn: typeof initPricing === 'function' ? initPricing : null },
        { name: 'initReports', fn: typeof initReports === 'function' ? initReports : null },
        { name: 'initContracts', fn: typeof contractManagement?.initContracts === 'function' ? contractManagement.initContracts : null }
    ];
    
    modules.forEach(module => {
        if (module.fn) {
            try {
                module.fn();
            } catch (error) {
                console.error(`Error initializing module ${module.name}:`, error);
            }
        }
    });
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
        case 'contracts':
            if (typeof contractManagement !== 'undefined') {
                contractManagement.updateContractDisplay();
            }
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

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);