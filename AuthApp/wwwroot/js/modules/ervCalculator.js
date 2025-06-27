// js/modules/ervCalculator.js

export class ERVCalculator {
    constructor() {
        this.inputs = {};
        this.results = {};
        this.constants = {
            // Psychrometric constants
            ATMOSPHERIC_PRESSURE_SEA_LEVEL: 14.696, // psia
            GAS_CONSTANT_WATER_VAPOR: 85.778, // ft·lbf/(lbm·°R)

            // Air properties
            AIR_DENSITY_STD: 0.075, // lb/ft³ at standard conditions
            SPECIFIC_HEAT_AIR: 0.24, // Btu/(lb·°F)

            // Unit conversions
            CFM_TO_LBS_PER_HOUR: 4.5, // approximate conversion factor
            TONS_TO_BTU_PER_HOUR: 12000,

            // Altitude adjustment factors
            PRESSURE_LAPSE_RATE: 0.0000368 // per foot
        };
    }

    // Calculate air pressure based on altitude
    calculateAirPressure(altitude) {
        // Barometric formula for pressure at altitude
        return this.constants.ATMOSPHERIC_PRESSURE_SEA_LEVEL *
            Math.pow(1 - (this.constants.PRESSURE_LAPSE_RATE * altitude), 5.25588);
    }

    // Calculate grains of moisture from dry bulb and wet bulb temperatures
    calculateGrains(dryBulb, wetBulb, altitude = 0) {
        if (!dryBulb || !wetBulb) return null;

        const pressure = this.calculateAirPressure(altitude);

        // Simplified psychrometric calculation for grains
        // This is a simplified version - in production, you'd use more accurate formulas
        const saturationPressure = this.calculateSaturationPressure(wetBulb);
        const vaporPressure = saturationPressure - ((pressure - saturationPressure) * (dryBulb - wetBulb) * 0.00066);

        // Convert to grains per pound of dry air
        const grains = 7000 * (0.622 * vaporPressure) / (pressure - vaporPressure);

        return Math.max(0, grains); // Ensure non-negative result
    }

    // Calculate saturation pressure for water vapor
    calculateSaturationPressure(temperature) {
        // Antoine equation for water vapor pressure (simplified)
        const tempKelvin = (temperature + 459.67) * 5 / 9; // Convert °F to K
        const logP = 8.07131 - (1730.63 / (tempKelvin - 39.724));
        return Math.pow(10, logP) * 0.0193368; // Convert mmHg to psia
    }

    // Calculate mixed return air CFM
    calculateMixedReturnAirCFM(supplyAirCFM, outdoorAirCFM) {
        if (!supplyAirCFM || !outdoorAirCFM) return null;
        return Math.max(0, parseFloat(supplyAirCFM) - parseFloat(outdoorAirCFM));
    }

    // Calculate ERV effectiveness based on wheel type and operating conditions
    calculateERVEffectiveness(wheelType, modelSelection, sizeSelection, oaDryBulb, raDryBulb, cfm) {
        // Base effectiveness values by wheel type
        const baseEffectiveness = {
            1: 0.75, // Aluminum
            2: 0.78, // MS Coated  
            3: 0.72  // Polymer
        };

        let effectiveness = baseEffectiveness[wheelType] || 0.75;

        // Adjust for model selection
        const modelAdjustment = {
            1: 1.0,   // ERC
            2: 0.95,  // HRV
            3: 1.05   // ERV
        };

        effectiveness *= (modelAdjustment[modelSelection] || 1.0);

        // Adjust for size (larger wheels are typically more effective)
        const sizeAdjustment = {
            1: 0.95,  // Small
            2: 1.0,   // Medium
            3: 1.05   // Large
        };

        effectiveness *= (sizeAdjustment[sizeSelection] || 1.0);

        // Adjust for temperature difference (higher ΔT typically means better effectiveness)
        if (oaDryBulb && raDryBulb) {
            const tempDiff = Math.abs(parseFloat(oaDryBulb) - parseFloat(raDryBulb));
            if (tempDiff > 30) {
                effectiveness *= 1.02; // Slight boost for high temperature differences
            } else if (tempDiff < 10) {
                effectiveness *= 0.98; // Slight reduction for low temperature differences
            }
        }

        return Math.min(0.85, Math.max(0.60, effectiveness)); // Clamp between 60% and 85%
    }

    // Calculate pressure drop across ERV
    calculatePressureDrop(cfm, wheelType, filterType) {
        if (!cfm) return null;

        const flowRate = parseFloat(cfm);

        // Base pressure drop (inches of water column)
        let pressureDrop = 0.3 + (flowRate / 1000) * 0.2; // Base formula

        // Adjust for wheel type
        const wheelMultiplier = {
            1: 1.0,   // Aluminum
            2: 1.1,   // MS Coated (slightly higher drop)
            3: 0.9    // Polymer (slightly lower drop)
        };

        pressureDrop *= (wheelMultiplier[wheelType] || 1.0);

        // Adjust for filter type
        const filterMultiplier = {
            1: 1.0,   // MERV 8
            2: 1.3,   // MERV 13
            3: 1.8    // HEPA
        };

        pressureDrop *= (filterMultiplier[filterType] || 1.0);

        return pressureDrop;
    }

    // Calculate velocity through ERV
    calculateVelocity(cfm, sizeSelection) {
        if (!cfm || !sizeSelection) return null;

        // Approximate face areas for different sizes (sq ft)
        const faceAreas = {
            1: 4,    // Small
            2: 9,    // Medium  
            3: 16    // Large
        };

        const faceArea = faceAreas[sizeSelection] || 9;
        return parseFloat(cfm) / faceArea; // ft/min
    }

    // Calculate ERV outlet temperatures
    calculateERVOutletTemperatures(oaDryBulb, raDryBulb, effectiveness) {
        if (!oaDryBulb || !raDryBulb || !effectiveness) return { dryBulb: null, wetBulb: null };

        const oaTemp = parseFloat(oaDryBulb);
        const raTemp = parseFloat(raDryBulb);
        const eff = parseFloat(effectiveness) / 100;

        // Supply air temperature (outdoor air after heat recovery)
        const supplyTemp = oaTemp + eff * (raTemp - oaTemp);

        return {
            dryBulb: supplyTemp,
            wetBulb: supplyTemp - 5 // Simplified wet bulb approximation
        };
    }

    // Calculate mixed supply air temperatures
    calculateMixedSupplyAirTemperatures(ervOutletTemp, mixedReturnCFM, outdoorCFM, returnTemp) {
        if (!ervOutletTemp || !mixedReturnCFM || !outdoorCFM || !returnTemp) {
            return { dryBulb: null, wetBulb: null };
        }

        const totalCFM = parseFloat(mixedReturnCFM) + parseFloat(outdoorCFM);
        if (totalCFM === 0) return { dryBulb: null, wetBulb: null };

        // Weighted average temperature
        const mixedTemp = (
            (parseFloat(ervOutletTemp) * parseFloat(outdoorCFM)) +
            (parseFloat(returnTemp) * parseFloat(mixedReturnCFM))
        ) / totalCFM;

        return {
            dryBulb: mixedTemp,
            wetBulb: mixedTemp - 3 // Simplified approximation
        };
    }

    // Calculate cooling capacity
    calculateCoolingCapacity(cfm, enteringTemp, leavingTemp, altitude = 0) {
        if (!cfm || !enteringTemp || !leavingTemp) return null;

        const airDensity = this.constants.AIR_DENSITY_STD *
            (this.calculateAirPressure(altitude) / this.constants.ATMOSPHERIC_PRESSURE_SEA_LEVEL);

        const massFlow = parseFloat(cfm) * 60 * airDensity; // lb/hr
        const tempDiff = parseFloat(enteringTemp) - parseFloat(leavingTemp);

        const btuPerHour = massFlow * this.constants.SPECIFIC_HEAT_AIR * tempDiff;
        const tons = btuPerHour / this.constants.TONS_TO_BTU_PER_HOUR;

        return {
            btuPerHour: Math.abs(btuPerHour),
            tons: Math.abs(tons),
            sensibleMBH: Math.abs(btuPerHour / 1000)
        };
    }

    // Calculate tonnage with ERV
    calculateTonnageWithERV(originalTons, coolingCapacity) {
        if (!originalTons || !coolingCapacity) return null;

        const originalTonnage = parseFloat(originalTons);
        const ervReduction = coolingCapacity.tons || 0;

        return Math.max(0, originalTonnage - ervReduction);
    }

    // Calculate EER with ERV
    calculateEERWithERV(originalEER, tonnageReduction, originalTons) {
        if (!originalEER || !tonnageReduction || !originalTons) return null;

        const eer = parseFloat(originalEER);
        const reduction = parseFloat(tonnageReduction);
        const original = parseFloat(originalTons);

        // Simplified EER improvement calculation
        const improvementFactor = 1 + (reduction / original) * 0.1; // 10% improvement per ton reduced

        return eer * improvementFactor;
    }

    // Main calculation method
    performCalculations(inputData, altitude = 0) {
        this.inputs = inputData;
        this.results = {};

        try {
            // Calculate grains
            this.results.oaGrainsCooling = this.calculateGrains(
                inputData.oaDryBulbCooling, inputData.oaWetBulbCooling, altitude
            );
            this.results.oaGrainsHeating = this.calculateGrains(
                inputData.oaDryBulbHeating, inputData.oaWetBulbHeating, altitude
            );
            this.results.raGrainsCooling = this.calculateGrains(
                inputData.raDryBulbCooling, inputData.raWetBulbCooling, altitude
            );
            this.results.raGrainsHeating = this.calculateGrains(
                inputData.raDryBulbHeating, inputData.raWetBulbHeating, altitude
            );

            // Calculate mixed return air CFM
            this.results.mixedReturnCFM = this.calculateMixedReturnAirCFM(
                inputData.supplyAirCFM, inputData.outdoorAirCFM
            );

            // Calculate ERV effectiveness
            this.results.effectivenessCooling = this.calculateERVEffectiveness(
                inputData.ervWheelType, inputData.ervModelSelection, inputData.ervSizeSelection,
                inputData.oaDryBulbCooling, inputData.raDryBulbCooling, inputData.outdoorAirCFM
            );
            this.results.effectivenessHeating = this.calculateERVEffectiveness(
                inputData.ervWheelType, inputData.ervModelSelection, inputData.ervSizeSelection,
                inputData.oaDryBulbHeating, inputData.raDryBulbHeating, inputData.outdoorAirCFM
            );

            // Calculate pressure drop
            this.results.pressureDropCooling = this.calculatePressureDrop(
                inputData.outdoorAirCFM, inputData.ervWheelType, inputData.filterType
            );
            this.results.pressureDropHeating = this.results.pressureDropCooling; // Same for both seasons

            // Calculate velocity
            this.results.velocity = this.calculateVelocity(
                inputData.outdoorAirCFM, inputData.ervSizeSelection
            );

            // Calculate ERV outlet temperatures
            const ervOutletCooling = this.calculateERVOutletTemperatures(
                inputData.oaDryBulbCooling, inputData.raDryBulbCooling, this.results.effectivenessCooling * 100
            );
            const ervOutletHeating = this.calculateERVOutletTemperatures(
                inputData.oaDryBulbHeating, inputData.raDryBulbHeating, this.results.effectivenessHeating * 100
            );

            this.results.ervDryBulbCooling = ervOutletCooling.dryBulb;
            this.results.ervWetBulbCooling = ervOutletCooling.wetBulb;
            this.results.ervDryBulbHeating = ervOutletHeating.dryBulb;
            this.results.ervWetBulbHeating = ervOutletHeating.wetBulb;

            // Calculate mixed supply air temperatures
            const msaCooling = this.calculateMixedSupplyAirTemperatures(
                this.results.ervDryBulbCooling, this.results.mixedReturnCFM,
                inputData.outdoorAirCFM, inputData.raDryBulbCooling
            );
            const msaHeating = this.calculateMixedSupplyAirTemperatures(
                this.results.ervDryBulbHeating, this.results.mixedReturnCFM,
                inputData.outdoorAirCFM, inputData.raDryBulbHeating
            );

            this.results.msaDryBulbCooling = msaCooling.dryBulb;
            this.results.msaWetBulbCooling = msaCooling.wetBulb;
            this.results.msaDryBulbHeating = msaHeating.dryBulb;
            this.results.msaWetBulbHeating = msaHeating.wetBulb;

            // Calculate cooling capacity
            const coolingCapacity = this.calculateCoolingCapacity(
                inputData.outdoorAirCFM, inputData.oaDryBulbCooling, this.results.ervDryBulbCooling, altitude
            );
            const heatingCapacity = this.calculateCoolingCapacity(
                inputData.outdoorAirCFM, this.results.ervDryBulbHeating, inputData.oaDryBulbHeating, altitude
            );

            this.results.ervEffectiveCoolingTons = coolingCapacity ? coolingCapacity.tons : 0;
            this.results.coolingSensibleMBH = coolingCapacity ? coolingCapacity.sensibleMBH : 0;
            this.results.ervEffectiveHeatingTons = heatingCapacity ? heatingCapacity.tons : 0;
            this.results.heatingSensibleMBH = heatingCapacity ? heatingCapacity.sensibleMBH : 0;

            // Calculate tonnage with ERV
            this.results.tonnageWithERV = this.calculateTonnageWithERV(
                inputData.traneOriginalTons, coolingCapacity
            );

            // Calculate EER with ERV
            this.results.eerWithERV = this.calculateEERWithERV(
                inputData.traneStatedEER, coolingCapacity ? coolingCapacity.tons : 0, inputData.traneOriginalTons
            );

            // Generate model designation
            this.results.modelDesignation = this.generateModelDesignation(inputData);

            return this.results;

        } catch (error) {
            console.error('Calculation error:', error);
            throw new Error('Failed to perform ERV calculations: ' + error.message);
        }
    }

    // Generate model designation string
    generateModelDesignation(inputs) {
        const wheelTypes = { 1: 'AL', 2: 'MS', 3: 'PO' };
        const models = { 1: 'ERC', 2: 'HRV', 3: 'ERV' };
        const sizes = { 1: '10-20', 2: '30-50', 3: '60-100' };

        const wheelType = wheelTypes[inputs.ervWheelType] || 'AL';
        const model = models[inputs.ervModelSelection] || 'ERC';
        const size = sizes[inputs.ervSizeSelection] || '30-50';

        return `${model}-${wheelType}-${size}`;
    }

    // Get formatted results for display
    getFormattedResults() {
        const formatNumber = (value, decimals = 1) => {
            return value !== null && value !== undefined ?
                parseFloat(value).toFixed(decimals) : '--';
        };

        const formatPercentage = (value, decimals = 0) => {
            return value !== null && value !== undefined ?
                `${(parseFloat(value) * 100).toFixed(decimals)}%` : '--';
        };

        return {
            // Calculated grains
            oaGrainsCooling: formatNumber(this.results.oaGrainsCooling),
            raGrainsCooling: formatNumber(this.results.raGrainsCooling),
            oaGrainsHeating: formatNumber(this.results.oaGrainsHeating),
            raGrainsHeating: formatNumber(this.results.raGrainsHeating),

            // Mixed return air
            mixedReturnCFM: formatNumber(this.results.mixedReturnCFM, 0),

            // Performance data
            modelDesignation: this.results.modelDesignation || '--',
            effectivenessCooling: formatPercentage(this.results.effectivenessCooling),
            effectivenessHeating: formatPercentage(this.results.effectivenessHeating),
            pressureDropCooling: formatNumber(this.results.pressureDropCooling),
            pressureDropHeating: formatNumber(this.results.pressureDropHeating),
            velocity: formatNumber(this.results.velocity, 0),

            // Temperatures
            ervDryBulbCooling: formatNumber(this.results.ervDryBulbCooling),
            ervWetBulbCooling: formatNumber(this.results.ervWetBulbCooling),
            ervDryBulbHeating: formatNumber(this.results.ervDryBulbHeating),
            ervWetBulbHeating: formatNumber(this.results.ervWetBulbHeating),
            msaDryBulbCooling: formatNumber(this.results.msaDryBulbCooling),
            msaWetBulbCooling: formatNumber(this.results.msaWetBulbCooling),
            msaDryBulbHeating: formatNumber(this.results.msaDryBulbHeating),
            msaWetBulbHeating: formatNumber(this.results.msaWetBulbHeating),

            // Capacities
            ervEffectiveCoolingTons: formatNumber(this.results.ervEffectiveCoolingTons),
            coolingSensibleMBH: formatNumber(this.results.coolingSensibleMBH),
            ervEffectiveHeatingTons: formatNumber(this.results.ervEffectiveHeatingTons),
            heatingSensibleMBH: formatNumber(this.results.heatingSensibleMBH),

            // Unit performance
            tonnageWithERV: formatNumber(this.results.tonnageWithERV),
            eerWithERV: formatNumber(this.results.eerWithERV)
        };
    }
}