// js/modules/ervCalculatorExactUpdated.js
// Updated ERV Calculator with complete fan data system from Excel analysis

import { PsychrometricFunctions } from './psychrometricFunctions.js';
import { getCityData } from './cityAltitudeData.js';
import fanDataSystem from './fanDataLookupExact.js';

export class ERVCalculatorExactUpdated {
    constructor() {
        this.inputs = {};
        this.results = {};

        // Constants extracted from Excel (same as before)
        this.constants = {
            ATMOSPHERIC_PRESSURE_REF: 14.637627819829893,
            AIR_DENSITY_FACTOR: 1.08,
            CFM_TO_TONS_FACTOR: 4.5,
            BTU_TO_TONS: 12000,
            MBH_DIVISOR: 1000,
            PREHEAT_CONSTANT: 26.3,
        };

        // ERV effectiveness lookup (same as before)
        this.ervEffectiveness = {
            "ERC-4132C-4M": {
                cooling: 0.8752023172092118,
                heating: 0.8435680521122568
            },
            "ERC-3014": { cooling: 0.85, heating: 0.82 },
            "ERC-3622": { cooling: 0.87, heating: 0.84 },
            "ERC-4136": { cooling: 0.88, heating: 0.85 },
            "ERC-4634": { cooling: 0.89, heating: 0.86 },
            "ERC-5262": { cooling: 0.90, heating: 0.87 }
        };

        this.pressureDrop = 0.434589058481117;

        this.velocityLookup = {
            "ERC-3014": 571.4285714285714,
            "ERC-3622": 387.09677419354836,
            "ERC-4136": 292.6829268292683,
            "ERC-4634": 230.76923076923077,
            "ERC-5262": 169.01408450704227,
            "ERC-4132C-4M": 387.09677419354836
        };
    }

    async calculate(inputData) {
        try {
            this.inputs = inputData;
            this.results = {};

            console.log('Starting Excel-exact ERV calculation with complete fan data system...');

            // Step 1: Get altitude from city lookup (AF5 formula)
            const altitude = this.lookupAltitude(this.inputs.nearestLocation);

            // Step 2: Calculate atmospheric pressure
            const pressure = this.calculateAtmosphericPressure(altitude);

            // Step 3: Calculate psychrometric properties (Level 2)
            await this.calculatePsychrometrics(pressure);

            // Step 4: Calculate flow relationships (Level 1)
            this.calculateFlowValues();

            // Step 5: Calculate ERV model and performance (Level 1-3)
            this.calculateERVPerformance();

            // Step 6: Calculate ERV temperatures (Level 4)
            this.calculateERVTemperatures();

            // Step 7: Calculate mixed supply air (Level 5)
            this.calculateMixedSupplyAir();

            // Step 8: Calculate capacities (Level 6)
            this.calculateCapacities();

            // Step 9: Calculate fan and motor data using EXACT Excel formulas (Level 2-4)
            this.calculateFanAndMotorDataExact();

            // Step 10: Calculate preheat temperatures (Level 2)
            this.calculatePreheatTemperatures();

            // Step 11: Calculate unit performance (Level 7)
            this.calculateUnitPerformance();

            console.log('Excel-exact ERV calculation with complete fan data completed');
            return this.results;

        } catch (error) {
            console.error('ERV Calculation error:', error);
            throw new Error('Failed to perform ERV calculations: ' + error.message);
        }
    }

    // AF5: VLOOKUP(AE5,PickList!E8:F1961,2,FALSE)
    lookupAltitude(cityName) {
        if (!cityName) return 0;
        const cityData = getCityData();
        const city = cityData.find(c => c.city === cityName);
        return city ? city.altitude : 0;
    }

    calculateAtmosphericPressure(altitude) {
        const seaLevelPressure = 14.696;
        const lapseRate = 0.0000368;
        return seaLevelPressure * Math.pow(1 - (lapseRate * altitude), 5.25588);
    }

    // Level 2: Psychrometric calculations (same as before)
    async calculatePsychrometrics(pressure) {
        this.results.oaGrainsCooling = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.oaDryBulbCooling),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.oaWetBulbCooling)
        );

        this.results.raGrainsCooling = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.raDryBulbCooling),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.raWetBulbCooling)
        );

        this.results.raGrainsHeating = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.raDryBulbHeating),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.raWetBulbHeating)
        );

        const preHeaterSize = parseFloat(this.inputs.preHeaterSize) || 0;
        if (preHeaterSize === 0) {
            this.results.oaGrainsHeating = PsychrometricFunctions.Grains(
                parseFloat(this.inputs.oaDryBulbHeating),
                this.constants.ATMOSPHERIC_PRESSURE_REF,
                1,
                parseFloat(this.inputs.oaWetBulbHeating)
            );
        } else {
            const postPreheatDB = parseFloat(this.inputs.oaDryBulbHeating) + this.constants.PREHEAT_CONSTANT;
            const postPreheatWB = parseFloat(this.inputs.oaWetBulbHeating) + this.constants.PREHEAT_CONSTANT;
            this.results.oaGrainsHeating = PsychrometricFunctions.Grains(
                postPreheatDB,
                this.constants.ATMOSPHERIC_PRESSURE_REF,
                1,
                postPreheatWB
            );
        }
    }

    // Level 1: Flow calculations (same as before)
    calculateFlowValues() {
        const supplyAirCFM = parseFloat(this.inputs.supplyAirCFM) || 0;
        const outdoorAirCFM = parseFloat(this.inputs.outdoorAirCFM) || 0;
        this.results.mixedReturnCFM = supplyAirCFM - outdoorAirCFM;
        this.results.locationDisplay = this.inputs.nearestLocation;
        this.results.altitudeDisplay = this.lookupAltitude(this.inputs.nearestLocation);
    }

    // Level 1-3: ERV performance calculations (same as before)
    calculateERVPerformance() {
        const ervSize = this.inputs.ervSizeSelection;

        if (ervSize && ervSize.includes("ERC")) {
            this.results.modelDesignation = ervSize;
        } else {
            this.results.modelDesignation = "";
            return;
        }

        const effectiveness = this.ervEffectiveness[ervSize] || this.ervEffectiveness["ERC-4132C-4M"];
        this.results.unitEffectivenessCooling = effectiveness.cooling;
        this.results.unitEffectivenessHeating = effectiveness.heating;

        this.results.pressureDropCooling = this.pressureDrop;
        this.results.pressureDropHeating = this.pressureDrop;

        this.results.velocity = this.velocityLookup[ervSize] || this.velocityLookup["ERC-4132C-4M"];
    }

    // Level 4: ERV temperature calculations (same as before)
    calculateERVTemperatures() {
        if (!this.results.modelDesignation) return;

        const oaCoolingDB = parseFloat(this.inputs.oaDryBulbCooling);
        const raCoolingDB = parseFloat(this.inputs.raDryBulbCooling);
        const oaHeatingDB = parseFloat(this.inputs.oaDryBulbHeating);
        const raHeatingDB = parseFloat(this.inputs.raDryBulbHeating);

        this.results.ervDryBulbCooling = oaCoolingDB - (oaCoolingDB - raCoolingDB) * this.results.unitEffectivenessCooling;
        this.results.ervDryBulbHeating = oaHeatingDB + (raHeatingDB - oaHeatingDB) * this.results.unitEffectivenessHeating;
        this.results.ervWetBulbCooling = this.results.ervDryBulbCooling - 5;
        this.results.ervWetBulbHeating = this.results.ervDryBulbHeating - 5;
    }

    // Level 5: Mixed supply air calculations (same as before)
    calculateMixedSupplyAir() {
        if (!this.results.modelDesignation) return;

        const outdoorCFM = parseFloat(this.inputs.outdoorAirCFM);
        const supplyCFM = parseFloat(this.inputs.supplyAirCFM);
        const raCoolingDB = parseFloat(this.inputs.raDryBulbCooling);
        const raHeatingDB = parseFloat(this.inputs.raDryBulbHeating);

        this.results.msaDryBulbCooling = (
            (this.results.ervDryBulbCooling * outdoorCFM) +
            (raCoolingDB * this.results.mixedReturnCFM)
        ) / supplyCFM;

        this.results.msaDryBulbHeating = (
            (this.results.ervDryBulbHeating * outdoorCFM) +
            (raHeatingDB * this.results.mixedReturnCFM)
        ) / supplyCFM;

        this.results.msaWetBulbCooling = PsychrometricFunctions.wetbulb(
            this.results.msaDryBulbCooling,
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            2,
            this.results.raGrainsCooling / 7000
        );

        this.results.msaWetBulbHeating = PsychrometricFunctions.wetbulb(
            this.results.msaDryBulbHeating,
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            2,
            this.results.raGrainsHeating / 7000
        );
    }

    // Level 6: Capacity calculations (same as before)
    calculateCapacities() {
        if (!this.results.modelDesignation) return;

        const outdoorCFM = parseFloat(this.inputs.outdoorAirCFM);
        const supplyCFM = parseFloat(this.inputs.supplyAirCFM);
        const oaCoolingDB = parseFloat(this.inputs.oaDryBulbCooling);

        const tempDiffCooling = oaCoolingDB - this.results.ervDryBulbCooling;
        this.results.ervEffectiveCoolingTons = Math.abs(
            (this.constants.CFM_TO_TONS_FACTOR * outdoorCFM * tempDiffCooling) /
            this.constants.BTU_TO_TONS
        );

        this.results.coolingSensibleMBH = (
            supplyCFM * this.constants.AIR_DENSITY_FACTOR *
            (oaCoolingDB - this.results.msaDryBulbCooling)
        ) / this.constants.MBH_DIVISOR;

        const tempDiffHeating = this.results.ervDryBulbHeating - parseFloat(this.inputs.oaDryBulbHeating);
        this.results.heatingSensibleMBH = Math.abs(
            (this.constants.CFM_TO_TONS_FACTOR * outdoorCFM * tempDiffHeating) /
            this.constants.MBH_DIVISOR
        );

        this.results.ervEffectiveHeatingTons = null;
    }

    // Level 2-4: Fan and motor calculations using EXACT Excel formulas
    calculateFanAndMotorDataExact() {
        console.log('Calculating fan data using exact Excel formulas H6-H10...');

        // Use the fan data system that implements exact Excel formulas
        const fanResults = fanDataSystem.calculateFanAndMotorDataExact(this.inputs);

        // Map results to the expected output format
        this.results.fanType = fanResults.fanType;                    // H6
        this.results.motorSizeHP = fanResults.motorSizeHP;            // H7
        this.results.fanRPM = fanResults.fanRPM;                      // H8
        this.results.fanMotorBHP = fanResults.fanMotorBHP;            // H9
        this.results.totalStaticPressure = fanResults.totalStaticPressure; // H10

        // Get motor component data (from Input sheet)
        const components = fanDataSystem.getMotorComponentData();
        this.results.motorValue = components.motorValue;
        this.results.motorPN = components.motorPN;
        this.results.driverValue = components.driverValue;
        this.results.driverPN = components.driverPN;
        this.results.drivenValue = components.drivenValue;
        this.results.drivenPN = components.drivenPN;
        this.results.beltValue = components.beltValue;
        this.results.beltPN = components.beltPN;
        this.results.rpmValue = fanResults.fanRPM;

        // Store calculation path for debugging
        this.results.fanCalculationPath = fanResults.calculationPath;
        this.results.fanValidation = fanResults.validation;

        console.log('Fan data calculated:', {
            fanType: this.results.fanType,
            motorHP: this.results.motorSizeHP,
            rpm: this.results.fanRPM,
            bhp: this.results.fanMotorBHP,
            staticPressure: this.results.totalStaticPressure
        });
    }

    // Level 2: Preheat calculations (same as before)
    calculatePreheatTemperatures() {
        this.results.postPreheatTempCooling = Math.round(
            (parseFloat(this.inputs.oaDryBulbHeating) + this.constants.PREHEAT_CONSTANT) * 10
        ) / 10;

        this.results.postPreheatTempHeating = Math.round(
            (parseFloat(this.inputs.oaWetBulbHeating) + this.constants.PREHEAT_CONSTANT) * 10
        ) / 10;
    }

    // Level 7: Unit performance calculations (same as before)
    calculateUnitPerformance() {
        const originalTons = parseFloat(this.inputs.unitTons) || 0;
        const ervReduction = this.results.ervEffectiveCoolingTons || 0;
        this.results.tonnageWithERV = Math.round((originalTons - ervReduction) * 10) / 10;

        const originalEER = parseFloat(this.inputs.traneStatedEER) || 0;
        if (this.results.tonnageWithERV > 0) {
            this.results.eerValue = Math.round(
                (originalEER * (originalTons / this.results.tonnageWithERV)) * 10
            ) / 10;
        } else {
            this.results.eerValue = originalEER;
        }
    }

    getFormattedResults() {
        const formatNumber = (value, decimals = 1) => {
            return value !== null && value !== undefined && !isNaN(value) ?
                parseFloat(value).toFixed(decimals) : '--';
        };

        const formatPercentage = (value, decimals = 1) => {
            return value !== null && value !== undefined && !isNaN(value) ?
                `${(parseFloat(value) * 100).toFixed(decimals)}%` : '--';
        };

        return {
            // Psychrometric Results
            oaGrainsCooling: formatNumber(this.results.oaGrainsCooling, 1),
            raGrainsCooling: formatNumber(this.results.raGrainsCooling, 1),
            oaGrainsHeating: formatNumber(this.results.oaGrainsHeating, 1),
            raGrainsHeating: formatNumber(this.results.raGrainsHeating, 1),
            mixedReturnCFM: formatNumber(this.results.mixedReturnCFM, 0),

            // Performance Results
            modelDesignation: this.results.modelDesignation || '--',
            unitEffectivenessCooling: formatPercentage(this.results.unitEffectivenessCooling, 1),
            unitEffectivenessHeating: formatPercentage(this.results.unitEffectivenessHeating, 1),
            pressureDropCooling: formatNumber(this.results.pressureDropCooling, 3),
            pressureDropHeating: formatNumber(this.results.pressureDropHeating, 3),
            velocity: formatNumber(this.results.velocity, 0),

            // Temperature Results
            ervDryBulbCooling: formatNumber(this.results.ervDryBulbCooling, 1),
            ervWetBulbCooling: formatNumber(this.results.ervWetBulbCooling, 1),
            ervDryBulbHeating: formatNumber(this.results.ervDryBulbHeating, 1),
            ervWetBulbHeating: formatNumber(this.results.ervWetBulbHeating, 1),
            msaDryBulbCooling: formatNumber(this.results.msaDryBulbCooling, 1),
            msaWetBulbCooling: formatNumber(this.results.msaWetBulbCooling, 1),
            msaDryBulbHeating: formatNumber(this.results.msaDryBulbHeating, 1),
            msaWetBulbHeating: formatNumber(this.results.msaWetBulbHeating, 1),

            // Capacity Results
            ervEffectiveCoolingTons: formatNumber(this.results.ervEffectiveCoolingTons, 2),
            coolingSensibleMBH: formatNumber(this.results.coolingSensibleMBH, 1),
            ervEffectiveHeatingTons: this.results.ervEffectiveHeatingTons ? formatNumber(this.results.ervEffectiveHeatingTons, 2) : '--',
            heatingSensibleMBH: formatNumber(this.results.heatingSensibleMBH, 1),

            // Unit Performance
            tonnageWithERV: formatNumber(this.results.tonnageWithERV, 1),
            eerValue: formatNumber(this.results.eerValue, 1),

            // Preheat Results
            postPreheatTempCooling: formatNumber(this.results.postPreheatTempCooling, 1),
            postPreheatTempHeating: formatNumber(this.results.postPreheatTempHeating, 1),

            // Fan and Motor Data (EXACT from Excel H6-H10)
            fanType: this.results.fanType || '--',
            motorSizeHP: formatNumber(this.results.motorSizeHP, 0),
            fanRPM: formatNumber(this.results.fanRPM, 0),
            fanMotorBHP: formatNumber(this.results.fanMotorBHP, 3),
            totalStaticPressure: formatNumber(this.results.totalStaticPressure, 3),
            motorValue: this.results.motorValue || '--',
            motorPN: this.results.motorPN || '--',
            driverValue: this.results.driverValue || '--',
            driverPN: this.results.driverPN || '--',
            drivenValue: this.results.drivenValue || '--',
            drivenPN: this.results.drivenPN || '--',
            beltValue: this.results.beltValue || '--',
            beltPN: this.results.beltPN || '--',
            rpmValue: formatNumber(this.results.rpmValue, 0),

            // Debug information
            fanCalculationPath: this.results.fanCalculationPath,
            fanValidation: this.results.fanValidation
        };
    }
}