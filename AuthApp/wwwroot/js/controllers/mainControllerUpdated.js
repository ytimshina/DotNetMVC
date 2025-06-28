// js/controllers/mainControllerUpdated.js
// Main controller class updated with exact Excel formulas and NO demo data

import { ERVCalculatorExact } from '../modules/ervCalculatorExact.js';

export class MainControllerUpdated {
    constructor() {
        this.calculator = new ERVCalculatorExact();
        this.isCalculating = false;
        this.isInitialized = false;

        // Cell mapping based on Excel analysis
        this.cellMapping = {
            inputs: {
                // Temperature inputs (must be filled)
                C7: { name: "OA Dry Bulb Cooling", type: "number", required: true },
                C8: { name: "OA Wet Bulb Cooling", type: "number", required: true },
                C9: { name: "RA Dry Bulb Cooling", type: "number", required: true },
                C10: { name: "RA Wet Bulb Cooling", type: "number", required: true },
                D7: { name: "OA Dry Bulb Heating", type: "number", required: true },
                D8: { name: "OA Wet Bulb Heating", type: "number", required: true },
                D9: { name: "RA Dry Bulb Heating", type: "number", required: true },
                D10: { name: "RA Wet Bulb Heating", type: "number", required: true },

                // Flow inputs (must be filled)
                C15: { name: "Supply Air CFM", type: "number", required: true },
                C16: { name: "Outdoor Air CFM", type: "number", required: true },
                C17: { name: "Exhaust Return Air CFM", type: "number", required: true },

                // Equipment selections (must be selected)
                AE5: { name: "Nearest Location", type: "dropdown", required: true },
                C21: { name: "Unit Model", type: "dropdown", required: true },
                C22: { name: "ERV Wheel Type", type: "dropdown", required: true },
                C23: { name: "ERV Size Selection", type: "dropdown", required: true },
                C24: { name: "Filter Type", type: "dropdown", required: true },
                C25: { name: "Purge Type", type: "dropdown", required: true },
                C26: { name: "Unit Tons", type: "dropdown", required: true },
                C27: { name: "Trane Stated EER", type: "dropdown", required: true },
                C28: { name: "Unit Voltage", type: "dropdown", required: true },
                H13: { name: "Motor with grounding ring", type: "dropdown", required: true },
                H14: { name: "VAV system with VDF", type: "dropdown", required: true },

                // Optional inputs
                H26: { name: "Pre-Heater Size", type: "number", required: false }
            }
        };
    }

    async init() {
        try {
            console.log('Initializing MainControllerUpdated with Excel-exact formulas...');

            // Initialize dropdown data
            await this.initializeDropdowns();

            // Setup event listeners
            this.setupEventListeners();

            // DO NOT load default values - user must enter all data
            console.log('Ready for user input - no demo data loaded');

            this.isInitialized = true;
            console.log('MainControllerUpdated initialized successfully');

        } catch (error) {
            console.error('Failed to initialize MainControllerUpdated:', error);
            throw error;
        }
    }

    async initializeDropdowns() {
        // City/Location dropdown with elevation data from cityAltitudeData.js
        const { getCityData } = await import('../modules/cityAltitudeData.js');
        const cityData = getCityData();

        // ERV Wheel Types (exact from Excel)
        const wheelTypes = [
            { value: "Aluminum ERC Series (Airxchange)", text: "Aluminum ERC Series (Airxchange)" },
            { value: "MS Coated ERC Series (Airxchange)", text: "MS Coated ERC Series (Airxchange)" },
            { value: "Polymer ERC Series (Airxchange)", text: "Polymer ERC Series (Airxchange)" }
        ];

        // Unit Models (exact from Excel)
        const unitModels = [
            { value: "Trane - Voyager C", text: "Trane - Voyager C" },
            { value: "Trane - Voyager B", text: "Trane - Voyager B" },
            { value: "Trane - Voyager A", text: "Trane - Voyager A" },
            { value: "Custom Unit", text: "Custom Unit" }
        ];

        // ERV Size Selection (exact from Excel)
        const ervSizes = [
            { value: "ERC-3014", text: "ERC-3014" },
            { value: "ERC-3622", text: "ERC-3622" },
            { value: "ERC-4136", text: "ERC-4136" },
            { value: "ERC-4634", text: "ERC-4634" },
            { value: "ERC-5262", text: "ERC-5262" },
            { value: "ERC-4132C-4M", text: "ERC-4132C-4M" }
        ];

        // Filter Types (exact from Excel)
        const filterTypes = [
            { value: "Merv 8", text: "MERV 8" },
            { value: "Merv 13", text: "MERV 13" },
            { value: "HEPA", text: "HEPA" }
        ];

        // Purge Types
        const purgeTypes = [
            { value: "0", text: "0°" },
            { value: "90", text: "90°" },
            { value: "180", text: "180°" },
            { value: "270", text: "270°" }
        ];

        // Unit Tons
        const unitTons = [];
        for (let i = 1; i <= 50; i += 0.5) {
            unitTons.push({ value: i.toString(), text: `${i} Tons` });
        }

        // Unit Voltage
        const voltages = [
            { value: "208", text: "208V" },
            { value: "230", text: "230V" },
            { value: "460", text: "460V" },
            { value: "575", text: "575V" }
        ];

        // EER values
        const eerValues = [];
        for (let i = 8.0; i <= 15.0; i += 0.1) {
            eerValues.push({ value: i.toFixed(1), text: i.toFixed(1) });
        }

        // Yes/No options
        const yesNoOptions = [
            { value: "No", text: "No" },
            { value: "Yes", text: "Yes" }
        ];

        // Populate dropdowns
        this.populateDropdown('AE5', cityData.map(city => ({ value: city.city, text: city.city })));
        this.populateDropdown('C14', cityData.map(city => ({ value: city.city, text: city.city })));
        this.populateDropdown('C21', unitModels);
        this.populateDropdown('C22', wheelTypes);
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
                const selectedCity = cityData.find(city => city.city === e.target.value);
                if (selectedCity) {
                    elevationInput.value = selectedCity.altitude;
                    // Also update the display field D14 if it exists
                    const displayField = document.getElementById('D14');
                    if (displayField) {
                        displayField.textContent = selectedCity.altitude.toFixed(1);
                    }
                    // Trigger calculation check
                    this.checkAndCalculateIfReady();
                } else {
                    elevationInput.value = '';
                    const displayField = document.getElementById('D14');
                    if (displayField) {
                        displayField.textContent = '--';
                    }
                }
            });
        }

        // Secondary city selector (C14) updates D14
        const citySelect2 = document.getElementById('C14');
        if (citySelect2) {
            citySelect2.addEventListener('change', (e) => {
                const selectedCity = cityData.find(city => city.city === e.target.value);
                if (selectedCity) {
                    const displayField = document.getElementById('D14');
                    if (displayField) {
                        displayField.textContent = selectedCity.altitude.toFixed(1);
                    }
                    // Sync with main selector
                    if (citySelect) {
                        citySelect.value = e.target.value;
                        citySelect.dispatchEvent(new Event('change'));
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

        // Add change listeners - calculate only when all required fields are filled
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.checkAndCalculateIfReady();
            });
            input.addEventListener('change', () => {
                this.checkAndCalculateIfReady();
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

    // Check if all required inputs are filled and calculate if ready
    checkAndCalculateIfReady() {
        if (this.isCalculating) return;

        const inputs = this.collectInputs();
        const validation = this.validateInputs(inputs);

        if (validation.isValid && this.areAllRequiredFieldsFilled(inputs)) {
            // Debounce calculation
            clearTimeout(this.calculationTimeout);
            this.calculationTimeout = setTimeout(() => {
                this.performCalculation();
            }, 500);
        } else {
            // Clear results if inputs are not complete
            this.clearResults();
        }
    }

    areAllRequiredFieldsFilled(inputs) {
        const requiredFields = Object.keys(this.cellMapping.inputs).filter(
            cellId => this.cellMapping.inputs[cellId].required
        );

        return requiredFields.every(cellId => {
            const mappedKey = this.getCellToInputMapping()[cellId];
            const value = inputs[mappedKey];
            return value && value.toString().trim() !== '';
        });
    }

    getCellToInputMapping() {
        return {
            'C7': 'oaDryBulbCooling',
            'C8': 'oaWetBulbCooling',
            'C9': 'raDryBulbCooling',
            'C10': 'raWetBulbCooling',
            'D7': 'oaDryBulbHeating',
            'D8': 'oaWetBulbHeating',
            'D9': 'raDryBulbHeating',
            'D10': 'raWetBulbHeating',
            'C15': 'supplyAirCFM',
            'C16': 'outdoorAirCFM',
            'C17': 'exhaustReturnAirCFM',
            'AE5': 'nearestLocation',
            'C21': 'unitModel',
            'C22': 'ervWheelType',
            'C23': 'ervSizeSelection',
            'C24': 'filterType',
            'C25': 'purgeType',
            'C26': 'unitTons',
            'C27': 'traneStatedEER',
            'C28': 'unitVoltage',
            'H13': 'motorGroundingRing',
            'H14': 'vavSystemVdf',
            'H26': 'preHeaterSize'
        };
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
        inputs.unitModel = document.getElementById('C21')?.value || '';
        inputs.ervWheelType = document.getElementById('C22')?.value || '';
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
            { key: 'oaWetBulbCooling', name: 'OA Wet Bulb Cooling' },
            { key: 'raDryBulbCooling', name: 'RA Dry Bulb Cooling' },
            { key: 'raWetBulbCooling', name: 'RA Wet Bulb Cooling' },
            { key: 'oaDryBulbHeating', name: 'OA Dry Bulb Heating' },
            { key: 'oaWetBulbHeating', name: 'OA Wet Bulb Heating' },
            { key: 'raDryBulbHeating', name: 'RA Dry Bulb Heating' },
            { key: 'raWetBulbHeating', name: 'RA Wet Bulb Heating' },
            { key: 'supplyAirCFM', name: 'Supply Air CFM' },
            { key: 'outdoorAirCFM', name: 'Outdoor Air CFM' }
        ];

        requiredNumeric.forEach(field => {
            const value = parseFloat(inputs[field.key]);
            if (isNaN(value)) {
                errors.push(`${field.name} must be a valid number`);
            }
        });

        // Check CFM relationships
        const supplyAir = parseFloat(inputs.supplyAirCFM);
        const outdoorAir = parseFloat(inputs.outdoorAirCFM);

        if (!isNaN(supplyAir) && !isNaN(outdoorAir) && outdoorAir > supplyAir) {
            errors.push('Outdoor Air CFM cannot exceed Supply Air CFM');
        }

        // Check wet bulb vs dry bulb temperatures
        const coolingWB = parseFloat(inputs.oaWetBulbCooling);
        const coolingDB = parseFloat(inputs.oaDryBulbCooling);
        if (!isNaN(coolingWB) && !isNaN(coolingDB) && coolingWB > coolingDB) {
            errors.push('OA Wet Bulb Cooling cannot exceed OA Dry Bulb Cooling');
        }

        const heatingWB = parseFloat(inputs.oaWetBulbHeating);
        const heatingDB = parseFloat(inputs.oaDryBulbHeating);
        if (!isNaN(heatingWB) && !isNaN(heatingDB) && heatingWB > heatingDB) {
            errors.push('OA Wet Bulb Heating cannot exceed OA Dry Bulb Heating');
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
                this.showError('Please fix the following errors:\n' + validation.errors.join('\n'));
                this.hideLoadingState();
                return;
            }

            // Check if all required fields are filled
            if (!this.areAllRequiredFieldsFilled(inputs)) {
                console.warn('Not all required fields are filled');
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

    clearResults() {
        // Clear all calculated fields
        const calculatedFields = [
            'C11', 'C12', 'C18', 'D11', 'D12', 'D14', 'D26', 'D27',
            'H6', 'H7', 'H8', 'H9', 'H10', 'G16', 'H16', 'G17', 'H17',
            'G18', 'H18', 'G19', 'H19', 'H20', 'I26', 'I27',
            'B33', 'C33', 'D33', 'E33', 'F33', 'G33', 'H33', 'I33', 'J33', 'K33',
            'B35', 'C35', 'D35', 'E35', 'F35', 'G35', 'H35', 'I35', 'J35', 'K35'
        ];

        calculatedFields.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '--';
            }
        });

        // Hide results widget
        const widget = document.getElementById('resultsWidget');
        if (widget) {
            widget.classList.add('hidden');
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
                <span style="white-space: pre-line;">${message}</span>
                <button class="ml-4 text-red-700 hover:text-red-900" onclick="this.parentElement.parentElement.remove()">
                    ×
                </button>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 8000);
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
            version: '3.8.0-excel-exact-no-demo'
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
                        'unitModel': 'C21',
                        'ervWheelType': 'C22',
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
                            // Trigger change event
                            element.dispatchEvent(new Event('change'));
                        }
                    }
                });

                // Recalculate with loaded data
                setTimeout(() => {
                    this.checkAndCalculateIfReady();
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