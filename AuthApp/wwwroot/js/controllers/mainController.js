// js/controllers/mainController.js
import { CityDropdownHandler } from '../modules/cityDropdownHandler.js';
import { ERVCalculator } from '../modules/ervCalculator.js';

export class MainController {
    constructor() {
        this.cityHandler = null;
        this.calculator = null;
        this.isCalculating = false;

        // Input field mappings
        this.inputFields = {
            // Temperature inputs
            oaDryBulbCooling: 'C7',
            oaWetBulbCooling: 'C8',
            raDryBulbCooling: 'C9',
            raWetBulbCooling: 'C10',
            oaDryBulbHeating: 'D7',
            oaWetBulbHeating: 'D8',
            raDryBulbHeating: 'D9',
            raWetBulbHeating: 'D10',

            // CFM inputs
            supplyAirCFM: 'C15',
            outdoorAirCFM: 'C16',
            exhaustReturnAirCFM: 'C17',

            // Unit selections
            ervWheelType: 'C21',
            ervModelSelection: 'C22',
            ervSizeSelection: 'C23',
            filterType: 'C24',
            purgeType: 'C25',
            unitVoltage: 'C28',
            traneOriginalTons: 'C26',
            traneStatedEER: 'C27',

            // Pre-heater
            preHeaterSize: 'H26',

            // Motor settings
            motorGroundingRing: 'H13',
            vavSystemVdf: 'H14',

            // Location
            nearestLocation: 'C14', // Main city dropdown in ERV inputs
            nearestLocationR1: 'AE5', // City dropdown in location section
            altitude: 'AF5' // Altitude input in location section
        };

        // Output field mappings
        this.outputFields = {
            // Calculated grains
            oaGrainsCooling: 'C11',
            raGrainsCooling: 'C12',
            oaGrainsHeating: 'D11',
            raGrainsHeating: 'D12',

            // Mixed return air
            mixedReturnCFM: 'C18',

            // Altitude display
            altitudeDisplay: 'D14',

            // Unit performance calculations
            tonnageWithERV: 'D26',
            eerWithERV: 'D27',

            // Fan data (placeholder values)
            fanType: 'H6',
            motorSizeHP: 'H7',
            fanRPM: 'H8',
            fanMotorBHP: 'H9',
            totalStaticPressure: 'H10',

            // Motor, Belt and Pullies
            motorValue: 'G16',
            motorPN: 'H16',
            driverValue: 'G17',
            driverPN: 'H17',
            drivenValue: 'G18',
            drivenPN: 'H18',
            beltValue: 'G19',
            beltPN: 'H19',
            rpmValue: 'H20',

            // Pre-heater results
            postPreheatAirTempCooling: 'I26',
            postPreheatAirTempHeating: 'I27',

            // Performance results table
            modelDesignationCooling: 'B33',
            effectivenessCooling: 'C33',
            pressureDropCooling: 'D33',
            velocityCooling: 'E33',
            ervDryBulbCooling: 'F33',
            ervWetBulbCooling: 'G33',
            msaDryBulbCooling: 'H33',
            msaWetBulbCooling: 'I33',
            ervEffectiveCoolingTons: 'J33',
            coolingSensibleMBH: 'K33',

            modelDesignationHeating: 'B35',
            effectivenessHeating: 'C35',
            pressureDropHeating: 'D35',
            velocityHeating: 'E35',
            ervDryBulbHeating: 'F35',
            ervWetBulbHeating: 'G35',
            msaDryBulbHeating: 'H35',
            msaWetBulbHeating: 'I35',
            ervEffectiveHeatingTons: 'J35',
            heatingSensibleMBH: 'K35'
        };
    }

    // Initialize the application
    async init() {
        try {
            // Initialize modules
            this.cityHandler = new CityDropdownHandler();
            this.calculator = new ERVCalculator();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize UI
            this.initializeUI();

            console.log('ERV Calculator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ERV Calculator:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Form submission
        const form = document.querySelector('#ervForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performCalculation();
            });
        }

        // Save results button
        const saveBtn = document.getElementById('saveResultsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveResults());
        }

        // Input field changes for real-time calculation preview
        Object.values(this.inputFields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => {
                    // Debounce calculations to avoid excessive computation
                    clearTimeout(this.calculationTimeout);
                    this.calculationTimeout = setTimeout(() => {
                        this.updateCalculationPreview();
                    }, 500);
                });
            }
        });
    }

    // Initialize UI components
    initializeUI() {
        // Clear all output fields
        this.clearOutputFields();

        // Set default values if needed
        this.setDefaultValues();
    }

    // Set default values for form fields
    setDefaultValues() {
        const defaults = {
            'C21': '1', // Default to Aluminum wheel
            'C22': '1', // Default to ERC model
            'C23': '2', // Default to Medium size
            'C24': '1', // Default to MERV 8
            'C25': '0', // Default to 0° purge
            'C28': '220', // Default to 220V
            'H13': '0', // Default to No grounding ring
            'H14': '0'  // Default to No VDF
        };

        Object.entries(defaults).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && !field.value) {
                field.value = value;
            }
        });
    }

    // Collect input values from form
    collectInputs() {
        const inputs = {};

        Object.entries(this.inputFields).forEach(([key, fieldId]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                let value = field.value;

                // Convert numeric fields
                if (field.type === 'number' || (field.tagName === 'SELECT' && !isNaN(value))) {
                    value = value ? parseFloat(value) : null;
                }

                inputs[key] = value;
            }
        });

        return inputs;
    }

    // Update output fields with calculated results
    updateOutputFields(results) {
        // Clear existing values first
        this.clearOutputFields();

        // Update calculated fields
        this.setFieldValue('C11', results.oaGrainsCooling);
        this.setFieldValue('C12', results.raGrainsCooling);
        this.setFieldValue('D11', results.oaGrainsHeating);
        this.setFieldValue('D12', results.raGrainsHeating);
        this.setFieldValue('C18', results.mixedReturnCFM);
        this.setFieldValue('D26', results.tonnageWithERV);
        this.setFieldValue('D27', results.eerWithERV);

        // Update performance table - Cooling
        this.setFieldValue('B33', results.modelDesignation);
        this.setFieldValue('C33', results.effectivenessCooling);
        this.setFieldValue('D33', results.pressureDropCooling);
        this.setFieldValue('E33', results.velocity);
        this.setFieldValue('F33', results.ervDryBulbCooling);
        this.setFieldValue('G33', results.ervWetBulbCooling);
        this.setFieldValue('H33', results.msaDryBulbCooling);
        this.setFieldValue('I33', results.msaWetBulbCooling);
        this.setFieldValue('J33', results.ervEffectiveCoolingTons);
        this.setFieldValue('K33', results.coolingSensibleMBH);

        // Update performance table - Heating
        this.setFieldValue('B35', results.modelDesignation);
        this.setFieldValue('C35', results.effectivenessHeating);
        this.setFieldValue('D35', results.pressureDropHeating);
        this.setFieldValue('E35', results.velocity);
        this.setFieldValue('F35', results.ervDryBulbHeating);
        this.setFieldValue('G35', results.ervWetBulbHeating);
        this.setFieldValue('H35', results.msaDryBulbHeating);
        this.setFieldValue('I35', results.msaWetBulbHeating);
        this.setFieldValue('J35', results.ervEffectiveHeatingTons);
        this.setFieldValue('K35', results.heatingSensibleMBH);

        // Update placeholder fan data
        this.updateFanData(results);

        // Update motor data
        this.updateMotorData(results);
    }

    // Update fan data based on calculations
    updateFanData(results) {
        // These would typically come from a fan selection algorithm
        // For now, providing reasonable estimates based on CFM
        const inputs = this.collectInputs();
        const cfm = inputs.outdoorAirCFM || 1000;

        this.setFieldValue('H6', 'Centrifugal');
        this.setFieldValue('H7', this.estimateMotorSize(cfm));
        this.setFieldValue('H8', this.estimateFanRPM(cfm));
        this.setFieldValue('H9', this.estimateBHP(cfm));
        this.setFieldValue('H10', results.pressureDropCooling || '2.5');
    }

    // Update motor and belt data
    updateMotorData(results) {
        const inputs = this.collectInputs();
        const motorSize = this.estimateMotorSize(inputs.outdoorAirCFM || 1000);

        this.setFieldValue('G16', `${motorSize}HP TEFC`);
        this.setFieldValue('H16', `MOT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        this.setFieldValue('G17', 'Standard Drive');
        this.setFieldValue('H17', `DRV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        this.setFieldValue('G18', 'Standard Driven');
        this.setFieldValue('H18', `DRN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        this.setFieldValue('G19', 'V-Belt');
        this.setFieldValue('H19', `BLT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        this.setFieldValue('H20', this.estimateFanRPM(inputs.outdoorAirCFM || 1000));
    }

    // Helper methods for fan calculations
    estimateMotorSize(cfm) {
        if (cfm < 500) return '1';
        if (cfm < 1000) return '2';
        if (cfm < 2000) return '3';
        if (cfm < 3000) return '5';
        return '7.5';
    }

    estimateFanRPM(cfm) {
        return Math.round(600 + (cfm / 10)).toString();
    }

    estimateBHP(cfm) {
        return (cfm / 500).toFixed(1);
    }

    // Set field value (handles both input fields and display elements)
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const displayValue = value || '--';

        if (field.tagName === 'INPUT' || field.tagName === 'SELECT') {
            field.value = displayValue;
        } else {
            field.textContent = displayValue;
        }
    }

    // Clear all output fields
    clearOutputFields() {
        Object.values(this.outputFields).forEach(fieldId => {
            this.setFieldValue(fieldId, '--');
        });
    }

    // Main calculation method
    async performCalculation() {
        if (this.isCalculating) return;

        try {
            this.isCalculating = true;
            this.showLoading();

            // Collect inputs
            const inputs = this.collectInputs();

            // Validate inputs
            const validation = this.validateInputs(inputs);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Get altitude for calculations
            const altitude = this.cityHandler.getCurrentAltitude() || 0;

            // Perform calculations
            const results = this.calculator.performCalculations(inputs, altitude);
            const formattedResults = this.calculator.getFormattedResults();

            // Update UI
            this.updateOutputFields(formattedResults);

            // Show results
            this.showResults();

            console.log('Calculation completed successfully');

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Calculation failed: ' + error.message);
        } finally {
            this.isCalculating = false;
            this.hideLoading();
        }
    }

    // Update calculation preview (lighter version for real-time updates)
    updateCalculationPreview() {
        try {
            const inputs = this.collectInputs();

            // Only update basic calculations that don't require full processing
            if (inputs.supplyAirCFM && inputs.outdoorAirCFM) {
                const mixedReturnCFM = Math.max(0, inputs.supplyAirCFM - inputs.outdoorAirCFM);
                this.setFieldValue('C18', mixedReturnCFM.toFixed(0));
            }

            // Update grains if we have temperature data
            const altitude = this.cityHandler.getCurrentAltitude() || 0;

            if (inputs.oaDryBulbCooling && inputs.oaWetBulbCooling) {
                const grains = this.calculator.calculateGrains(
                    inputs.oaDryBulbCooling, inputs.oaWetBulbCooling, altitude
                );
                if (grains !== null) {
                    this.setFieldValue('C11', grains.toFixed(1));
                }
            }

        } catch (error) {
            // Silently fail for preview updates
            console.warn('Preview calculation error:', error);
        }
    }

    // Validate inputs before calculation
    validateInputs(inputs) {
        const requiredFields = [
            'oaDryBulbCooling', 'oaWetBulbCooling', 'raDryBulbCooling', 'raWetBulbCooling',
            'oaDryBulbHeating', 'oaWetBulbHeating', 'raDryBulbHeating', 'raWetBulbHeating',
            'supplyAirCFM', 'outdoorAirCFM',
            'ervWheelType', 'ervModelSelection', 'ervSizeSelection'
        ];

        for (const field of requiredFields) {
            if (!inputs[field] && inputs[field] !== 0) {
                return {
                    isValid: false,
                    message: `Please enter a value for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
                };
            }
        }

        // Validate ranges
        if (inputs.outdoorAirCFM > inputs.supplyAirCFM) {
            return {
                isValid: false,
                message: 'Outdoor Air CFM cannot exceed Supply Air CFM'
            };
        }

        return { isValid: true };
    }

    // Save calculation results
    async saveResults() {
        try {
            const inputs = this.collectInputs();
            const results = this.calculator.getFormattedResults();
            const description = document.getElementById('calculation-description')?.value || 'ERV Calculation';

            // Prepare data for saving
            const saveData = {
                inputs,
                results,
                description,
                timestamp: new Date().toISOString(),
                cityData: {
                    city: this.cityHandler.getCurrentCity(),
                    altitude: this.cityHandler.getCurrentAltitude()
                }
            };

            // TODO: Implement actual save logic (API call, local storage, etc.)
            console.log('Saving calculation:', saveData);

            // For now, simulate successful save
            setTimeout(() => {
                this.showSuccessModal();
            }, 1000);

        } catch (error) {
            console.error('Save error:', error);
            this.showError('Failed to save calculation: ' + error.message);
        }
    }

    // UI utility methods
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    }

    showResults() {
        const resultsWidget = document.getElementById('resultsWidget');
        if (resultsWidget) {
            resultsWidget.classList.remove('hidden');
            resultsWidget.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    showError(message) {
        // Simple alert for now - could be replaced with a more sophisticated error display
        alert(message);
    }

    // Export functionality
    exportResults() {
        const results = this.calculator.getFormattedResults();
        const inputs = this.collectInputs();

        const exportData = {
            inputs,
            results,
            exportDate: new Date().toISOString(),
            city: this.cityHandler.getCurrentCity(),
            altitude: this.cityHandler.getCurrentAltitude()
        };

        // Create downloadable JSON file
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

    // Load saved calculation
    loadCalculation(data) {
        try {
            // Set city first
            if (data.cityData?.city) {
                this.cityHandler.setCity(data.cityData.city);
            }

            // Set input values
            Object.entries(data.inputs).forEach(([key, value]) => {
                const fieldId = this.inputFields[key];
                if (fieldId) {
                    this.setFieldValue(fieldId, value);
                }
            });

            // Trigger calculation
            this.performCalculation();

        } catch (error) {
            console.error('Load error:', error);
            this.showError('Failed to load calculation: ' + error.message);
        }
    }
}