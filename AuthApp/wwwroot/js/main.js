// js/main.js
// Main application file updated to work with the new HTML structure
// Properly connects JavaScript to the Welcome HTML

import { MainControllerUpdated } from './controllers/mainControllerUpdated.js';

// Global application instance
let app = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing ERV Calculator with new HTML structure...');

        // Hide loading overlay
        const moduleLoading = document.getElementById('moduleLoading');
        if (moduleLoading) {
            moduleLoading.style.display = 'none';
        }

        // Initialize the main controller
        app = new MainControllerUpdated();
        await app.init();

        // Setup global event handlers
        setupGlobalEventHandlers();

        // Perform initial calculation after a short delay
        setTimeout(() => {
            if (app && typeof app.performCalculation === 'function') {
                app.performCalculation();
            }
        }, 1000);

        console.log('ERV Calculator initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
        showInitializationError(error);
    }
});

// Setup global event handlers
function setupGlobalEventHandlers() {
    // Handle form submission
    const ervForm = document.getElementById('ervForm');
    if (ervForm) {
        ervForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                await app.performCalculation();
                showCalculationSuccess();
            } catch (error) {
                console.error('Calculation failed:', error);
                showError('Calculation failed: ' + error.message);
            }
        });
    }

    // Handle save results button
    const saveResultsBtn = document.getElementById('saveResultsBtn');
    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', async () => {
            try {
                await app.saveCalculation();
            } catch (error) {
                console.error('Save failed:', error);
                showError('Save failed: ' + error.message);
            }
        });
    }

    // Setup success modal close button
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', hideSuccessModal);
    }

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter or Cmd+Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (app && typeof app.performCalculation === 'function') {
                app.performCalculation();
            }
        }

        // Ctrl+S or Cmd+S to export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (app && typeof app.exportResults === 'function') {
                app.exportResults();
            }
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const successModal = document.getElementById('successModal');
        if (e.target === successModal) {
            hideSuccessModal();
        }

        const loadingOverlay = document.getElementById('loadingOverlay');
        if (e.target === loadingOverlay) {
            // Don't close loading overlay by clicking
        }
    });

    // Handle window resize for responsive design
    window.addEventListener('resize', () => {
        // Add any resize-specific logic here if needed
        adjustLayoutForMobile();
    });

    // Initial mobile layout adjustment
    adjustLayoutForMobile();
}

// Adjust layout for mobile devices
function adjustLayoutForMobile() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // Add mobile-specific adjustments
        document.body.classList.add('mobile-layout');
    } else {
        document.body.classList.remove('mobile-layout');
    }
}

// Create file input for importing calculations
function createFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (app && typeof app.loadCalculation === 'function') {
                    app.loadCalculation(data);
                    showSuccess('Calculation loaded successfully!');
                } else {
                    showError('Application not ready. Please try again.');
                }
            } catch (error) {
                console.error('Failed to parse file:', error);
                showError('Invalid file format. Please select a valid ERV calculation file.');
            }
        };
        reader.onerror = () => {
            showError('Failed to read file. Please try again.');
        };
        reader.readAsText(file);

        // Clean up
        document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
}

// Show calculation success
function showCalculationSuccess() {
    showSuccess('Calculation completed successfully!');
}

// Hide success modal
function hideSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('hidden');
    }
}

// Show initialization error
function showInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed inset-0 bg-red-50 flex items-center justify-center z-50';
    errorDiv.innerHTML = `
        <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Initialization Failed</h3>
                <p class="text-gray-600 mb-4">${error.message}</p>
                <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onclick="window.location.reload()">
                    Reload Page
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Show success message
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show error message
function showError(message) {
    showNotification(message, 'error');
}

// Generic notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md ${getNotificationClasses(type)}`;

    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                ${getNotificationIcon(type)}
                <span class="ml-3">${message}</span>
            </div>
            <button class="ml-4 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove notification
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, type === 'error' ? 8000 : 5000);
}

// Get notification classes based on type
function getNotificationClasses(type) {
    switch (type) {
        case 'success':
            return 'bg-green-100 border border-green-400 text-green-700';
        case 'error':
            return 'bg-red-100 border border-red-400 text-red-700';
        case 'warning':
            return 'bg-yellow-100 border border-yellow-400 text-yellow-700';
        default:
            return 'bg-blue-100 border border-blue-400 text-blue-700';
    }
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
        case 'error':
            return '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
        case 'warning':
            return '<svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
        default:
            return '<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
    }
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please refresh the page if problems persist.');
    event.preventDefault();
});

// Handle general errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);

    if (event.error && event.error.message) {
        showError('Application error: ' + event.error.message);
    }
});

// Export for potential external use
export { app };

// Global functions for backward compatibility and easy access
window.ERVCalculator = {
    // Export calculation results
    exportResults: () => {
        if (app && typeof app.exportResults === 'function') {
            app.exportResults();
        } else {
            console.error('Application not initialized or export function not available');
            showError('Export function not available. Please refresh the page.');
        }
    },

    // Import data from file
    importFromFile: () => {
        createFileInput();
    },

    // Load calculation from file (for programmatic use)
    loadCalculation: (data) => {
        if (app && typeof app.loadCalculation === 'function') {
            app.loadCalculation(data);
        } else {
            console.error('Application not initialized or load function not available');
            showError('Load function not available. Please refresh the page.');
        }
    },

    // Get current calculation state
    getCurrentState: () => {
        if (app && typeof app.getCurrentState === 'function') {
            return app.getCurrentState();
        }
        console.error('Application not initialized or getCurrentState function not available');
        return null;
    },

    // Manual calculation trigger
    calculate: () => {
        if (app && typeof app.performCalculation === 'function') {
            app.performCalculation();
        } else {
            console.error('Application not initialized or calculate function not available');
            showError('Calculate function not available. Please refresh the page.');
        }
    },

    // Validate current inputs
    validate: () => {
        if (app && typeof app.validateInputs === 'function') {
            const inputs = app.collectInputs();
            return app.validateInputs(inputs);
        }
        console.error('Application not initialized or validate function not available');
        return false;
    },

    // Save calculation to server
    saveCalculation: () => {
        if (app && typeof app.saveCalculation === 'function') {
            app.saveCalculation();
        } else {
            console.error('Application not initialized or save function not available');
            showError('Save function not available. Please refresh the page.');
        }
    },

    // Get application status
    getStatus: () => {
        return {
            initialized: app !== null,
            calculating: app?.isCalculating || false,
            version: '3.8.0-excel-exact',
            htmlVersion: 'new-structure',
            features: [
                'Excel-exact formulas',
                'Real-time calculations',
                'City/altitude lookup',
                'Psychrometric functions',
                'Motor/drive selection',
                'Flow validation',
                'Export/import',
                'Server-side saving',
                'Results visualization'
            ]
        };
    }
};

// Initialize performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('erv-calculator-start');

    window.addEventListener('load', () => {
        performance.mark('erv-calculator-loaded');
        performance.measure('erv-calculator-load-time', 'erv-calculator-start', 'erv-calculator-loaded');

        const measurements = performance.getEntriesByName('erv-calculator-load-time');
        if (measurements.length > 0) {
            console.log(`ERV Calculator loaded in ${measurements[0].duration.toFixed(2)}ms`);
        }
    });
}

console.log('ERV Calculator v3.8.0 with Excel-exact formulas - New HTML Structure - Ready for initialization');