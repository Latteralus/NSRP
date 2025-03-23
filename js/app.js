/**
 * RedM Blacksmith Business Tool - Application Router
 * 
 * This file serves as the main entry point and router for the application,
 * importing and initializing modules from the app directory.
 */

(function() {
    // Ensure modules can communicate and share global state
    window.BlacksmithApp = {
        // Global application state
        state: {
            currentSection: 'dashboard',
            theme: 'light',
            currency: '$',
            animations: true,
            shopName: 'My Blacksmith Shop',
            taxRate: 8,
            lowStockThreshold: 10
        },

        // Global DOM elements
        elements: {
            sidebar: null,
            navItems: null,
            sections: null,
            themeToggle: null,
            saveDataBtn: null,
            tabs: null,
            tabContents: null,
            modalContainer: null,
            modalClose: null,
            modalTitle: null,
            modalBody: null,
            modalCancel: null,
            modalConfirm: null
        },

        // Module initialization method
        init: function() {
            // Cache DOM elements
            this.cacheElements();

            // Import and initialize modules
            this.initializeModules();

            // Set up global event listeners
            this.setupGlobalEventListeners();
        },

        // Cache DOM elements for global use
        cacheElements: function() {
            this.elements = {
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
        },

        // Set up global event listeners
        setupGlobalEventListeners: function() {
            // Navigation event delegation
            if (this.elements.sidebar) {
                this.elements.sidebar.addEventListener('click', (event) => {
                    const navItem = event.target.closest('.nav-item');
                    if (navItem) {
                        this.navigateTo(navItem.dataset.target);
                    }
                });
            }

            // Theme toggle
            if (this.elements.themeToggle) {
                this.elements.themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }

            // Save data button
            if (this.elements.saveDataBtn) {
                this.elements.saveDataBtn.addEventListener('click', () => {
                    this.saveAllData();
                });
            }

            // Tab switching
            if (this.elements.tabs) {
                this.elements.tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        this.switchTab(tab.dataset.target);
                    });
                });
            }

            // Modal close buttons
            if (this.elements.modalClose) {
                this.elements.modalClose.addEventListener('click', () => {
                    this.closeModal();
                });
            }
            if (this.elements.modalCancel) {
                this.elements.modalCancel.addEventListener('click', () => {
                    this.closeModal();
                });
            }
        },

        // Initialize modules
        initializeModules: function() {
            const modules = [
                { 
                    name: 'Inventory', 
                    initFunction: window.initInventory 
                },
                { 
                    name: 'Recipes', 
                    initFunction: window.initRecipes 
                },
                { 
                    name: 'Production', 
                    initFunction: window.initProduction 
                },
                { 
                    name: 'Pricing', 
                    initFunction: window.initPricing 
                },
                { 
                    name: 'Reports', 
                    initFunction: window.initReports 
                },
                { 
                    name: 'Contracts', 
                    initFunction: window.contractManagement?.initContracts 
                }
            ];

            modules.forEach(module => {
                if (typeof module.initFunction === 'function') {
                    try {
                        module.initFunction();
                        console.log(`Initialized ${module.name} module`);
                    } catch (error) {
                        console.error(`Error initializing ${module.name} module:`, error);
                    }
                }
            });

            // Dispatch initialization complete event
            const initEvent = new Event('blacksmithAppInitialized');
            document.dispatchEvent(initEvent);
        },

        // Navigation methods
        navigateTo: function(sectionId) {
            // Update active navigation items
            this.elements.navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.target === sectionId);
            });

            // Show/hide sections
            this.elements.sections.forEach(section => {
                section.classList.toggle('active', section.id === sectionId);
            });

            // Update current section
            this.state.currentSection = sectionId;

            // Refresh section content
            this.refreshSectionContent(sectionId);
        },

        // Refresh section content based on current section
        refreshSectionContent: function(sectionId) {
            const refreshMap = {
                'dashboard': () => window.updateDashboard?.(),
                'inventory': () => window.updateInventoryDisplay?.(),
                'recipes': () => window.updateRecipeDisplay?.(),
                'production': () => window.updateProductionDisplay?.(),
                'pricing': () => window.updatePricingDisplay?.(),
                'reports': () => window.updateReportsDisplay?.(),
                'settings': () => window.updateSettingsDisplay?.(),
                'contracts': () => window.contractManagement?.updateContractDisplay?.()
            };

            const refreshFunction = refreshMap[sectionId];
            if (refreshFunction) {
                refreshFunction();
            }
        },

        // Theme methods
        toggleTheme: function() {
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.updateTheme();

            // Update theme selector if on settings page
            const themeSelect = document.getElementById('setting-theme');
            if (themeSelect) {
                themeSelect.value = this.state.theme;
            }
        },

        updateTheme: function() {
            const body = document.body;
            const themeIcon = this.elements.themeToggle.querySelector('i');
            
            if (this.state.theme === 'dark') {
                body.classList.add('dark-theme');
                themeIcon.className = 'fas fa-sun';
            } else {
                body.classList.remove('dark-theme');
                themeIcon.className = 'fas fa-moon';
            }
        },

        // Save data method
        saveAllData: function() {
            window.saveAllData?.();
        },

        // Modal methods
        closeModal: function() {
            if (this.elements.modalContainer) {
                this.elements.modalContainer.classList.remove('active');
            }
        },

        // Tab switching
        switchTab: function(tabId) {
            const tabContainer = document.querySelector('.tab.active').parentNode;
            
            // Update active tab
            tabContainer.querySelectorAll('.tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.target === tabId);
            });
            
            // Show active tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
        }
    };

    // Initialize the application when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        window.BlacksmithApp.init();
    });
})();