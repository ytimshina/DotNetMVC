// js/main.js
<<<<<<< HEAD
// Complete application with Excel-exact H6-H10 implementation and all dependencies
=======
// Main application file updated to work with the new HTML structure
// Properly connects JavaScript to the Welcome HTML
>>>>>>> parent of 1877a4b (some working yayyy)

import { MainControllerComplete } from './controllers/mainControllerComplete.js';

// Global application instance
let app = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
<<<<<<< HEAD
        console.log('=== ERV Calculator v3.8.0 - Complete Excel Implementation ===');
        console.log('Initializing with exact H6-H10 formulas and all dependencies...');
=======
        console.log('Initializing ERV Calculator with new HTML structure...');
>>>>>>> parent of 1877a4b (some working yayyy)

        // Hide loading overlay
        const moduleLoading = document.getElementById('moduleLoading');
        if (moduleLoading) {
            moduleLoading.style.display = 'none';
        }

        // Initialize the complete main controller with Excel-exact implementation
        app = new MainControllerComplete();
        await app.init();

        // Setup global event handlers
        setupGlobalEventHandlers();

<<<<<<< HEAD
        console.log('=== Application Ready ===');
        console.log('Features:');
        console.log('✓ Excel-exact H6-H10 fan selection formulas');
        console.log('✓ Complete FanFactors sheet FORECAST calculations');
        console.log('✓ Exact VLOOKUP table implementation (M71:Q74)');
        console.log('✓ BHP comparison logic (N77 vs P77)');
        console.log('✓ Unit model dependency handling');
        console.log('✓ Motor component data from Input sheet');
        console.log('✓ All psychrometric functions');
        console.log('✓ City/altitude lookup');
        console.log('✓ Complete ERV performance calculations');

        showWelcomeMessage();
=======
        // Perform initial calculation after a short delay
        setTimeout(() => {
            if (app && typeof app.performCalculation === 'function') {
                app.performCalculation();
            }
        }, 1000);

        console.log('ERV Calculator initialized successfully');
>>>>>>> parent of 1877a4b (some working yayyy)

    } catch (error) {
        console.error('Failed to initialize application:', error);
        showInitializationError(error);
    }
});

<<<<<<< HEAD
// Show enhanced welcome message
function showWelcomeMessage() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg z-50 max-w-md shadow-lg';
    notification.innerHTML = `
        <div class="flex items-start">
            <svg class="w-6 h-6 mr-3 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <div>
                <h4 class="font-semibold mb-1">ERV Calculator v3.8.0 Ready</h4>
                <p class="text-sm mb-2">Complete Excel implementation loaded:</p>
                <ul class="text-xs list-disc list-inside space-y-1">
                    <li>Exact H6-H10 fan formulas</li>
                    <li>FanFactors FORECAST calculations</li>
                    <li>Complete dependency chains</li>
                    <li>Motor component data</li>
                </ul>
                <p class="text-sm mt-2">Fill all required fields for automatic calculations.</p>
                <button class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline" onclick="this.closest('.fixed').remove()">
                    Got it
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 12 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 12000);
}

// Setup global event handlers with enhanced functionality
=======
// Setup global event handlers
>>>>>>> parent of 1877a4b (some working yayyy)
function setupGlobalEventHandlers() {
    // Handle form submission
    const ervForm = document.getElementById('ervForm');
    if (ervForm) {
        ervForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                console.log('Manual calculation triggered...');
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

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter or Cmd+Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (app && typeof app.performCalculation === 'function') {
                console.log('Keyboard shortcut: Triggering calculation...');
                app.performCalculation();
            }
        }

        // Ctrl+S or Cmd+S to export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (app && typeof app.exportResults === 'function') {
                console.log('Keyboard shortcut: Exporting results...');
                app.exportResults();
            }
        }

        // Ctrl+Shift+D for debug info
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            showDebugInfo();
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const successModal = document.getElementById('successModal');
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });

    // Handle window resize for responsive design
    window.addEventListener('resize', () => {
        // Add any resize-specific logic here if needed
        adjustLayoutForMobile();
    });

    // Initial mobile layout adjustment
    adjustLayoutForMobile();
<<<<<<< HEAD

    // Enhanced input validation indicators
    setupEnhancedInputValidation();

    // Setup debug panel toggle
    setupDebugPanel();
}

// Enhanced input validation with real-time feedback
function setupEnhancedInputValidation() {
    const requiredInputs = document.querySelectorAll('input[type="text"], input[type="number"], select');

    requiredInputs.forEach(input => {
        // Add visual indicator for empty required fields
        input.addEventListener('blur', () => {
            if (input.value.trim() === '' && isRequiredField(input.id)) {
                input.classList.add('border-red-300', 'bg-red-50');
                input.classList.remove('border-gray-300');
                showFieldTooltip(input, 'This field is required');
            } else {
                input.classList.remove('border-red-300', 'bg-red-50');
                input.classList.add('border-gray-300');
                hideFieldTooltip(input);
            }
        });

        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                input.classList.remove('border-red-300', 'bg-red-50');
                input.classList.add('border-gray-300');
                hideFieldTooltip(input);

                // Show validation checkmark for completed fields
                if (isRequiredField(input.id)) {
                    showValidationCheckmark(input);
                }
            }
        });

        // Special validation for numeric fields
        if (input.type === 'number') {
            input.addEventListener('input', () => {
                const value = parseFloat(input.value);
                if (input.value && isNaN(value)) {
                    input.classList.add('border-orange-300', 'bg-orange-50');
                    showFieldTooltip(input, 'Please enter a valid number');
                } else {
                    input.classList.remove('border-orange-300', 'bg-orange-50');
                    hideFieldTooltip(input);
                }
            });
        }
    });
}

// Show field tooltip for validation
function showFieldTooltip(input, message) {
    hideFieldTooltip(input); // Remove existing tooltip

    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg';
    tooltip.textContent = message;
    tooltip.id = `tooltip-${input.id}`;

    // Position tooltip
    const rect = input.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;

    document.body.appendChild(tooltip);

    // Auto-hide after 3 seconds
    setTimeout(() => hideFieldTooltip(input), 3000);
}

// Hide field tooltip
function hideFieldTooltip(input) {
    const tooltip = document.getElementById(`tooltip-${input.id}`);
    if (tooltip) {
        tooltip.remove();
    }
}

// Show validation checkmark
function showValidationCheckmark(input) {
    // Remove existing checkmark
    const existingCheck = input.parentNode.querySelector('.validation-check');
    if (existingCheck) {
        existingCheck.remove();
    }

    const checkmark = document.createElement('div');
    checkmark.className = 'validation-check absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500';
    checkmark.innerHTML = '✓';

    if (input.parentNode.style.position !== 'relative') {
        input.parentNode.style.position = 'relative';
    }

    input.parentNode.appendChild(checkmark);
}

// Check if field is required
function isRequiredField(fieldId) {
    const requiredFields = [
        'C7', 'C8', 'C9', 'C10', 'D7', 'D8', 'D9', 'D10',
        'C15', 'C16', 'C17', 'AE5', 'C21', 'C22', 'C23',
        'C24', 'C25', 'C26', 'C27', 'C28', 'H13', 'H14'
    ];
    return requiredFields.includes(fieldId);
=======
>>>>>>> parent of 1877a4b (some working yayyy)
}

// Setup debug panel
function setupDebugPanel() {
    // Create debug toggle button
    const debugButton = document.createElement('button');
    debugButton.id = 'debug-toggle';
    debugButton.className = 'fixed bottom-4 right-4 bg-gray-600 text-white px-3 py-2 rounded text-xs hover:bg-gray-700 z-40';
    debugButton.textContent = 'Debug';
    debugButton.onclick = showDebugInfo;

    document.body.appendChild(debugButton);
}

// Show debug information
function showDebugInfo() {
    if (!app) {
        showError('Application not initialized');
        return;
    }

    const state = app.getCurrentState();
    const debugInfo = {
        applicationStatus: {
            initialized: app.isInitialized,
            calculating: app.isCalculating,
            version: '3.8.0-complete-excel-exact'
        },
        currentInputs: state.inputs,
        lastResults: state.results,
        fanCalculationDetails: state.results?.fanCalculationPath || 'No calculation performed yet'
    };

    console.log('=== DEBUG INFO ===', debugInfo);

    // Show debug modal
    const debugModal = document.createElement('div');
    debugModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    debugModal.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-96 overflow-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-900">Debug Information</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-gray-800">Application Status:</h4>
                    <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">${JSON.stringify(debugInfo.applicationStatus, null, 2)}</pre>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800">Fan Calculation Details:</h4>
                    <pre class="bg-blue-50 p-2 rounded text-xs overflow-auto">${JSON.stringify(debugInfo.fanCalculationDetails, null, 2)}</pre>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-800">Current Inputs (Sample):</h4>
                    <pre class="bg-green-50 p-2 rounded text-xs overflow-auto max-h-32">${JSON.stringify(Object.fromEntries(Object.entries(debugInfo.currentInputs).slice(0, 5)), null, 2)}...</pre>
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button onclick="console.log('Full debug info:', ${JSON.stringify(debugInfo).replace(/"/g, '\\"')})" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                    Log Full Info
                </button>
                <button onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(debugInfo)}, null, 2))" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                    Copy to Clipboard
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(debugModal);
}

// Adjust layout for mobile devices
function adjustLayoutForMobile() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        document.body.classList.add('mobile-layout');
<<<<<<< HEAD

        // Make tables more responsive on mobile
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.classList.contains('mobile-responsive')) {
                table.classList.add('mobile-responsive');
                table.style.fontSize = '0.875rem';
            }
        });

        // Adjust debug button for mobile
        const debugButton = document.getElementById('debug-toggle');
        if (debugButton) {
            debugButton.style.bottom = '80px'; // Move above mobile keyboard
        }
    } else {
        document.body.classList.remove('mobile-layout');

        // Reset table styles for desktop
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.style.fontSize = '';
        });

        // Reset debug button position
        const debugButton = document.getElementById('debug-toggle');
        if (debugButton) {
            debugButton.style.bottom = '1rem';
        }
=======
    } else {
        document.body.classList.remove('mobile-layout');
>>>>>>> parent of 1877a4b (some working yayyy)
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
                    console.log('Loaded calculation data:', data);
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

// Show calculation success with enhanced details
function showCalculationSuccess() {
    const state = app?.getCurrentState();
    const fanType = state?.results?.fanType || 'Unknown';

    showSuccess(`Calculation completed! Fan type selected: ${fanType}`);

    // Log calculation summary
    console.log('=== CALCULATION COMPLETED ===');
    console.log('Fan type selected:', fanType);
    console.log('Calculation method: Excel-exact H6-H10 implementation');
    if (state?.results?.fanCalculationPath) {
        console.log('Fan calculation path:', state.results.fanCalculationPath);
    }
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
                <p class="text-gray-600 mb-2">${error.message}</p>
                <p class="text-sm text-gray-500 mb-4">Complete Excel implementation could not load.</p>
                <div class="space-x-2">
                    <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onclick="window.location.reload()">
                        Reload Page
                    </button>
                    <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onclick="console.error('Initialization error:', '${error.message}')">
                        Log Error
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Enhanced notification system
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

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
    const duration = type === 'error' ? 8000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duration);
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

// Enhanced global functions for ERV Calculator
window.ERVCalculator = {
    // Export calculation results with enhanced data
    exportResults: () => {
        if (app && typeof app.exportResults === 'function') {
            console.log('Exporting results with Excel-exact calculations...');
            app.exportResults();
        } else {
            console.error('Application not initialized or export function not available');
            showError('Export function not available. Please refresh the page.');
        }
    },

    // Import data from file
    importFromFile: () => {
        console.log('Opening import dialog...');
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

    // Get current calculation state with enhanced information
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
            console.log('Manual calculation triggered via global function...');
            app.performCalculation();
        } else {
            console.error('Application not initialized or calculate function not available');
            showError('Calculate function not available. Please refresh the page.');
        }
    },

    // Validate current inputs with enhanced feedback
    validate: () => {
        if (app && typeof app.validateInputs === 'function') {
            const inputs = app.collectInputs();
            const validation = app.validateInputs(inputs);
            console.log('Validation result:', validation);
            return validation;
        }
        console.error('Application not initialized or validate function not available');
        return { isValid: false, errors: ['Application not ready'] };
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

    // Get enhanced application status
    getStatus: () => {
        return {
            initialized: app !== null,
            calculating: app?.isCalculating || false,
<<<<<<< HEAD
            version: '3.8.0-complete-excel-exact',
            implementation: 'Complete Excel H6-H10 formulas with all dependencies',
            features: [
                'Excel-exact H6-H10 fan selection formulas',
                'FanFactors sheet FORECAST calculations',
                'Complete VLOOKUP table (M71:Q74)',
                'BHP comparison logic (N77 vs P77)',
                'Unit model dependency handling',
                'Motor component data from Input sheet',
=======
            version: '3.8.0-excel-exact',
            htmlVersion: 'new-structure',
            features: [
                'Excel-exact formulas',
                'Real-time calculations',
                'City/altitude lookup',
>>>>>>> parent of 1877a4b (some working yayyy)
                'Psychrometric functions',
                'City/altitude lookup',
                'ERV performance calculations',
                'Real-time validation',
                'Enhanced error handling',
                'Debug information',
                'Mobile responsive design'
            ],
            fanCalculationDetails: app?.getCurrentState()?.results?.fanCalculationPath || 'No calculation performed'
        };
    },

    // Show debug information
    showDebug: () => {
        showDebugInfo();
    },

    // Get fan calculation details
    getFanCalculationDetails: () => {
        const state = app?.getCurrentState();
        return state?.results?.fanCalculationPath || null;
    }
};

// Initialize performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('erv-calculator-complete-start');

    window.addEventListener('load', () => {
        performance.mark('erv-calculator-complete-loaded');
        performance.measure('erv-calculator-complete-load-time', 'erv-calculator-complete-start', 'erv-calculator-complete-loaded');

        const measurements = performance.getEntriesByName('erv-calculator-complete-load-time');
        if (measurements.length > 0) {
            console.log(`ERV Calculator Complete loaded in ${measurements[0].duration.toFixed(2)}ms`);
        }
    });
}

<<<<<<< HEAD
console.log('=== ERV Calculator v3.8.0 Complete Excel Implementation ===');
console.log('Features: Excel-exact H6-H10 formulas, FanFactors FORECAST, complete dependencies');
console.log('Ready for initialization...');
=======
console.log('ERV Calculator v3.8.0 with Excel-exact formulas - New HTML Structure - Ready for initialization');
>>>>>>> parent of 1877a4b (some working yayyy)
