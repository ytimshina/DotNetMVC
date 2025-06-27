// js/main.js
import { MainController } from './controllers/mainController.js';

// Global application instance
let app = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing ERV Calculator Application...');

        // Create and initialize main controller
        app = new MainController();
        await app.init();

        // Make app globally available for debugging
        window.ERVApp = app;

        console.log('ERV Calculator Application initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);

        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Failed to initialize application. Please refresh the page.</span>
            </div>
        `;
        document.body.appendChild(errorDiv);

        // Auto-remove error message after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }
});

// Export for potential external use
export { app };

// Global functions for backward compatibility and easy access
window.ERVCalculator = {
    // Export calculation results
    exportResults: () => {
        if (app) {
            app.exportResults();
        } else {
            console.error('Application not initialized');
        }
    },

    // Load calculation from file
    loadCalculation: (data) => {
        if (app) {
            app.loadCalculation(data);
        } else {
            console.error('Application not initialized');
        }
    },

    // Get current calculation state
    getCurrentState: () => {
        if (app) {
            return {
                inputs: app.collectInputs(),
                results: app.calculator?.getFormattedResults(),
                city: app.cityHandler?.getCurrentCity(),
                altitude: app.cityHandler?.getCurrentAltitude()
            };
        }
        return null;
    },

    // Manual calculation trigger
    calculate: () => {
        if (app) {
            app.performCalculation();
        } else {
            console.error('Application not initialized');
        }
    }
};

// Handle file import for calculations
window.addEventListener('load', () => {
    // Add file input handler for loading calculations
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    window.ERVCalculator.loadCalculation(data);
                } catch (error) {
                    console.error('Failed to load file:', error);
                    alert('Invalid file format. Please select a valid ERV calculation file.');
                }
            };
            reader.readAsText(file);
        }
    });

    // Make file input globally accessible
    window.ERVCalculator.importFromFile = () => {
        fileInput.click();
    };
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);

    // Don't show error notifications for minor issues
    if (event.error && event.error.message &&
        !event.error.message.includes('Script error') &&
        !event.error.message.includes('Non-Error promise rejection')) {

        // Could implement more sophisticated error reporting here
        console.warn('An error occurred in the ERV Calculator application');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Prevent default browser behavior
    event.preventDefault();
});

// Development helpers (only in development mode)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add development tools to window
    window.DEV = {
        // Quick test data
        testData: {
            inputs: {
                oaDryBulbCooling: 95,
                oaWetBulbCooling: 78,
                raDryBulbCooling: 75,
                raWetBulbCooling: 62,
                oaDryBulbHeating: 20,
                oaWetBulbHeating: 19,
                raDryBulbHeating: 70,
                raWetBulbHeating: 65,
                supplyAirCFM: 2000,
                outdoorAirCFM: 400,
                exhaustReturnAirCFM: 400,
                ervWheelType: 1,
                ervModelSelection: 1,
                ervSizeSelection: 2,
                filterType: 1,
                traneOriginalTons: 5,
                traneStatedEER: 11
            },
            city: 'Atlanta, GA'
        },

        // Load test data
        loadTestData: () => {
            if (app) {
                // Set test city
                app.cityHandler.setCity(window.DEV.testData.city);

                // Set test inputs
                Object.entries(window.DEV.testData.inputs).forEach(([key, value]) => {
                    const fieldId = app.inputFields[key];
                    if (fieldId) {
                        app.setFieldValue(fieldId, value);
                    }
                });

                console.log('Test data loaded');
            }
        },

        // Run test calculation
        runTest: () => {
            window.DEV.loadTestData();
            setTimeout(() => {
                window.ERVCalculator.calculate();
            }, 500);
        },

        // Clear all data
        clearAll: () => {
            if (app) {
                // Clear inputs
                Object.values(app.inputFields).forEach(fieldId => {
                    app.setFieldValue(fieldId, '');
                });

                // Clear outputs
                app.clearOutputFields();

                console.log('All data cleared');
            }
        }
    };

    console.log('Development mode enabled. Use window.DEV for testing utilities.');
    console.log('Available commands: DEV.loadTestData(), DEV.runTest(), DEV.clearAll()');
}