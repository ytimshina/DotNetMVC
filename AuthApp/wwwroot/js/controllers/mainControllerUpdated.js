// js/controllers/mainControllerUpdated.js
// Main controller class updated to work with the new HTML structure

import { ERVCalculatorExact } from '../modules/ervCalculatorExact.js';

export class MainControllerUpdated {
    constructor() {
        this.calculator = new ERVCalculatorExact();
        this.isCalculating = false;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing MainControllerUpdated with new HTML structure...');

            // Initialize dropdown data
            await this.initializeDropdowns();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize calculator with default values
            this.loadDefaultValues();

            this.isInitialized = true;
            console.log('MainControllerUpdated initialized successfully');

        } catch (error) {
            console.error('Failed to initialize MainControllerUpdated:', error);
            throw error;
        }
    }

    async initializeDropdowns() {
        // City/Location dropdown with elevation data
        const cityData = [
            { name: "Denver, CO", elevation: 5280 },
            { name: "Atlanta, GA", elevation: 1050 },
            { name: "Chicago, IL", elevation: 594 },
            { name: "Miami, FL", elevation: 6 },
            { name: "Phoenix, AZ", elevation: 1086 },
            { name: "Seattle, WA", elevation: 56 },
            { name: "New York, NY", elevation: 33 },
            { name: "Los Angeles, CA", elevation: 285 },
            { name: "Dallas, TX", elevation: 430 },
            { name: "Houston, TX", elevation: 43 }
        ];

        // ERV Wheel Types
        const wheelTypes = [
            { value: "1", text: "Aluminum" },
            { value: "2", text: "MS Coated" },
            { value: "3", text: "Polymer" }
        ];

        // ERV Models
        const ervModels = [
            { value: "1", text: "ERC" },
            { value: "2", text: "HRV" },
            { value: "3", text: "ERV" }
        ];

        // ERV Size Selection (from Excel data)
        const ervSizes = [
            { value: "ERC-3014", text: "ERC-3014" },
            { value: "ERC-3622", text: "ERC-3622" },
            { value: "ERC-4136", text: "ERC-4136" },
            { value: "ERC-4634", text: "ERC-4634" },
            { value: "ERC-5262", text: "ERC-5262" }
        ];

        // Filter Types
        const filterTypes = [
            { value: "1", text: "MERV 8" },
            { value: "2", text: "MERV 13" },
            { value: "3", text: "HEPA" }
        ];

        // Purge Types
        const purgeTypes = [
            { value: "0", text: "0°" },
            { value: "5", text: "5°" },
            { value: "10", text: "10°" }
        ];

        // Unit Tons
        const unitTons = [];
        for (let i = 1; i <= 50; i++) {
            unitTons.push({ value: i.toString(), text: `${i} Tons` });
        }

        // Unit Voltage
        const voltages = [
            { value: "110", text: "110V" },
            { value: "220", text: "220V" },
            { value: "440", text: "440V" }
        ];

        // Trane EER values
        const eerValues = [
            { value: "10", text: "10.0" },
            { value: "11", text: "11.0" },
            { value: "12", text: "12.0" },
            { value: "13", text: "13.0" }
        ];

        // Motor grounding ring options
        const yesNoOptions = [
            { value: "0", text: "No" },
            { value: "1", text: "Yes" }
        ];

        // Populate dropdowns using the correct IDs from the new HTML
        this.populateDropdown('AE5', cityData.map(city => ({ value: city.name, text: city.name })));
        this.populateDropdown('C14', cityData.map(city => ({ value: city.name, text: city.name })));
        this.populateDropdown('C21', wheelTypes);
        this.populateDropdown('C22', ervModels);
        this.populateDropdown('C23', ervSizes);
        this.populateDropdown('C24', filterTypes);
        this.populateDropdown('C25', purgeTypes);
        this.populateDropdown('C26', unitTons);
        this.populateDropdown('C27', eerValues);
        this.populateDropdown('C28', voltages);
        this.populateDropdown('H13', yesNoOptions);
        this.populateDropdown('H14', yesNoOptions);

        // Setup city selection handlers for elevation
        this.setupCitySelectionHandlers(cityData);
    }

    setupCitySelectionHandlers(cityData) {
        // Main city selector (AE5) updates altitude (AF5)
        const citySelect = document.getElementById('AE5');
        const elevationInput = document.getElementById('AF5');

        if (citySelect && elevationInput) {
            citySelect.addEventListener('change', (e) => {
                const selectedCity = cityData.find(city => city.name === e.target.value);
                if (selectedCity) {
                    elevationInput.value = selectedCity.elevation;
                    // Also update the display field D14 if it exists
                    const displayField = document.getElementById('D14');
                    if (displayField) {
                        displayField.textContent = selectedCity.elevation;
                    }
                }
            });
        }

        // Secondary city selector (C14) updates D14
        const citySelect2 = document.getElementById('C14');
        if (citySelect2) {
            citySelect2.addEventListener('change', (e) => {
                const selectedCity = cityData.find(city => city.name === e.target.value);
                if (selectedCity) {
                    const displayField = document.getElementById('D14');
                    if (displayField) {
                        displayField.textContent = selectedCity.elevation;
                    }
                }
            });
        }
    }

    populateDropdown(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) {
            console.warn(`Dropdown element ${elementId} not found`);
            return;
        }

        // Clear existing options except the first (placeholder)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
    }

    setupEventListeners() {
        // Get all input elements
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');

        // Add change listeners with debouncing
        let calculationTimeout;
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(calculationTimeout);
                calculationTimeout = setTimeout(() => {
                    this.performCalculation();
                }, 1000);
            });
        });

        // Setup form submission
        const form = document.getElementById('ervForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performCalculation();
            });
        }

        // Setup save results button
        const saveBtn = document.getElementById('saveResultsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCalculation();
            });
        }
    }

    loadDefaultValues() {
        // Set some default values to demonstrate the calculator
        const defaults = {
            'C7': '95',    // OA Dry Bulb Cooling
            'C8': '78',    // OA Wet Bulb Cooling  
            'C9': '75',    // RA Dry Bulb Cooling
            'C10': '62.5', // RA Wet Bulb Cooling
            'D7': '0',     // OA Dry Bulb Heating
            'D8': '0',     // OA Wet Bulb Heating
            'D9': '70',    // RA Dry Bulb Heating
            'D10': '60',   // RA Wet Bulb Heating
            'C15': '5600', // Supply Air CFM
            'C16': '1200', // Outdoor Air CFM
            'C17': '1200', // Exhaust Return Air CFM
            'C23': 'ERC-4136', // ERV Size Selection
            'C26': '5',    // Unit Tons
            'AE5': 'Atlanta, GA', // City
            'H26': '10'    // Pre-Heater Size
        };

        Object.entries(defaults).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
                // Trigger change event for city selection
                if (id === 'AE5') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    collectInputs() {
        const inputs = {};

        // Temperature inputs
        inputs.oaDryBulbCooling = document.getElementById('C7')?.value || '';
        inputs.oaWetBulbCooling = document.getElementById('C8')?.value || '';
        inputs.raDryBulbCooling = document.getElementById('C9')?.value || '';
        inputs.raWetBulbCooling = document.getElementById('C10')?.value || '';
        inputs.oaDryBulbHeating = document.getElementById('D7')?.value || '';
        inputs.oaWetBulbHeating = document.getElementById('D8')?.value || '';
        inputs.raDryBulbHeating = document.getElementById('D9')?.value || '';
        inputs.raWetBulbHeating = document.getElementById('D10')?.value || '';

        // Flow inputs
        inputs.supplyAirCFM = document.getElementById('C15')?.value || '';
        inputs.outdoorAirCFM = document.getElementById('C16')?.value || '';
        inputs.exhaustReturnAirCFM = document.getElementById('C17')?.value || '';

        // Equipment inputs
        inputs.ervWheelType = document.getElementById('C21')?.value || '';
        inputs.ervModelSelection = document.getElementById('C22')?.value || '';
        inputs.ervSizeSelection = document.getElementById('C23')?.value || '';
        inputs.filterType = document.getElementById('C24')?.value || '';
        inputs.purgeType = document.getElementById('C25')?.value || '';
        inputs.unitTons = document.getElementById('C26')?.value || '';
        inputs.traneStatedEER = document.getElementById('C27')?.value || '';
        inputs.unitVoltage = document.getElementById('C28')?.value || '';

        // Location
        inputs.nearestLocation = document.getElementById('AE5')?.value || '';
        inputs.altitude = document.getElementById('AF5')?.value || '';

        // Additional inputs
        inputs.preHeaterSize = document.getElementById('H26')?.value || '';
        inputs.motorGroundingRing = document.getElementById('H13')?.value || '';
        inputs.vavSystemVdf = document.getElementById('H14')?.value || '';

        return inputs;
    }

    validateInputs(inputs) {
        const errors = [];

        // Check required numeric fields
        const requiredNumeric = [
            { key: 'oaDryBulbCooling', name: 'OA Dry Bulb Cooling' },
            { key: 'supplyAirCFM', name: 'Supply Air CFM' },
            { key: 'outdoorAirCFM', name: 'Outdoor Air CFM' }
        ];

        requiredNumeric.forEach(field => {
            const value = parseFloat(inputs[field.key]);
            if (isNaN(value) || value <= 0) {
                errors.push(`${field.name} must be a positive number`);
            }
        });

        // Check CFM relationships
        const supplyAir = parseFloat(inputs.supplyAirCFM);
        const outdoorAir = parseFloat(inputs.outdoorAirCFM);

        if (!isNaN(supplyAir) && !isNaN(outdoorAir) && outdoorAir > supplyAir) {
            errors.push('Outdoor Air CFM cannot exceed Supply Air CFM');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    async performCalculation() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;

            // Show loading state
            this.showLoadingState();

            // Collect inputs
            const inputs = this.collectInputs();

            // Validate inputs
            const validation = this.validateInputs(inputs);
            if (!validation.isValid) {
                console.warn('Validation errors:', validation.errors);
                this.hideLoadingState();
                return;
            }

            // Perform calculation using ERVCalculatorExact
            await this.calculator.calculate(inputs);

            // Update UI with results
            this.displayResults();

            // Show results widget
            this.showResultsWidget();

            console.log('Calculation completed successfully');

        } catch (error) {
            console.error('Calculation failed:', error);
            this.showError('Calculation failed: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.hideLoadingState();
        }
    }

    displayResults() {
        const results = this.calculator.getFormattedResults();

        // Update calculated fields
        const calculatedFields = {
            // Grains calculations
            'C11': results.oaGrainsCooling || '--',
            'D11': results.oaGrainsHeating || '--',
            'C12': results.raGrainsCooling || '--',
            'D12': results.raGrainsHeating || '--',

            // Mixed Return Air CFM
            'C18': results.mixedReturnCFM || '--',

            // Tonnage with ERV
            'D26': results.tonnageWithERV || '--',

            // EER Value
            'D27': results.eerValue || '--',

            // Post Preheat Air Temp
            'I26': results.postPreheatTempCooling || '--',
            'I27': results.postPreheatTempHeating || '--',

            // Fan Data
            'H6': results.fanType || '--',
            'H7': results.motorSizeHP || '--',
            'H8': results.fanRPM || '--',
            'H9': results.fanMotorBHP || '--',
            'H10': results.totalStaticPressure || '--',

            // Motor, Belt and Pullies
            'G16': results.motorValue || '--',
            'H16': results.motorPN || '--',
            'G17': results.driverValue || '--',
            'H17': results.driverPN || '--',
            'G18': results.drivenValue || '--',
            'H18': results.drivenPN || '--',
            'G19': results.beltValue || '--',
            'H19': results.beltPN || '--',
            'H20': results.rpmValue || '--'
        };

        Object.entries(calculatedFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update results table (Summer Performance)
        const summerResults = {
            'B33': results.modelDesignation || '--',
            'C33': results.unitEffectivenessCooling || '--',
            'D33': results.pressureDropCooling || '--',
            'E33': results.velocity || '--',
            'F33': results.ervDryBulbCooling || '--',
            'G33': results.ervWetBulbCooling || '--',
            'H33': results.msaDryBulbCooling || '--',
            'I33': results.msaWetBulbCooling || '--',
            'J33': results.ervEffectiveCoolingTons || '--',
            'K33': results.coolingSensibleMBH || '--'
        };

        Object.entries(summerResults).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update results table (Winter Performance)
        const winterResults = {
            'B35': results.modelDesignation || '--',
            'C35': results.unitEffectivenessHeating || '--',
            'D35': results.pressureDropHeating || '--',
            'E35': results.velocity || '--',
            'F35': results.ervDryBulbHeating || '--',
            'G35': results.ervWetBulbHeating || '--',
            'H35': results.msaDryBulbHeating || '--',
            'I35': results.msaWetBulbHeating || '--',
            'J35': results.ervEffectiveHeatingTons || '--',
            'K35': results.heatingSensibleMBH || '--'
        };

        Object.entries(winterResults).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    showResultsWidget() {
        const widget = document.getElementById('resultsWidget');
        if (widget) {
            widget.classList.remove('hidden');
            widget.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideLoadingState() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md';
        errorDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-red-700 hover:text-red-900" onclick="this.parentElement.remove()">
                    ×
                </button>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Save calculation to the server
    async saveCalculation() {
        try {
            const inputs = this.collectInputs();
            const results = this.calculator.getFormattedResults();
            const description = document.getElementById('calculation-description')?.value || 'ERV Wheel Calculation';

            const data = {
                inputs: inputs,
                results: results,
                description: description
            };

            // Get anti-forgery token
            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

            const response = await fetch('/History/SaveCalculation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': token
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Show success modal
                const successModal = document.getElementById('successModal');
                if (successModal) {
                    successModal.classList.remove('hidden');
                }
            } else {
                throw new Error('Failed to save calculation');
            }

        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Failed to save calculation: ' + error.message);
        }
    }

    // Export functionality
    exportResults() {
        const inputs = this.collectInputs();
        const results = this.calculator.getFormattedResults();

        const exportData = {
            inputs: inputs,
            results: results,
            timestamp: new Date().toISOString(),
            version: '3.8.0-excel-exact'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `erv-calculation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Load calculation from file
    loadCalculation(data) {
        try {
            if (data.inputs) {
                // Load inputs into form
                Object.entries(data.inputs).forEach(([key, value]) => {
                    // Map back to element IDs
                    const elementMappings = {
                        'oaDryBulbCooling': 'C7',
                        'oaWetBulbCooling': 'C8',
                        'raDryBulbCooling': 'C9',
                        'raWetBulbCooling': 'C10',
                        'oaDryBulbHeating': 'D7',
                        'oaWetBulbHeating': 'D8',
                        'raDryBulbHeating': 'D9',
                        'raWetBulbHeating': 'D10',
                        'supplyAirCFM': 'C15',
                        'outdoorAirCFM': 'C16',
                        'exhaustReturnAirCFM': 'C17',
                        'ervWheelType': 'C21',
                        'ervModelSelection': 'C22',
                        'ervSizeSelection': 'C23',
                        'filterType': 'C24',
                        'purgeType': 'C25',
                        'unitTons': 'C26',
                        'traneStatedEER': 'C27',
                        'unitVoltage': 'C28',
                        'nearestLocation': 'AE5',
                        'altitude': 'AF5',
                        'preHeaterSize': 'H26',
                        'motorGroundingRing': 'H13',
                        'vavSystemVdf': 'H14'
                    };

                    const elementId = elementMappings[key];
                    if (elementId) {
                        const element = document.getElementById(elementId);
                        if (element) {
                            element.value = value;
                        }
                    }
                });

                // Recalculate with loaded data
                setTimeout(() => {
                    this.performCalculation();
                }, 500);
            }
        } catch (error) {
            console.error('Failed to load calculation:', error);
            this.showError('Failed to load calculation data');
        }
    }

    getCurrentState() {
        return {
            inputs: this.collectInputs(),
            results: this.calculator.getFormattedResults(),
            isCalculating: this.isCalculating,
            isInitialized: this.isInitialized
        };
    }
}