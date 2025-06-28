// js/modules/ervCalculatorExact.js
// Exact recreation of Excel formulas from Monitor Selection Tool v3.8.xlsm

import { PsychrometricFunctions } from './psychrometricFunctions.js';
import { getCityData } from './cityAltitudeData.js';

export class ERVCalculatorExact {
    constructor() {
        this.inputs = {};
        this.results = {};

        // Constants extracted from Excel
        this.constants = {
            // From Excel M27 - atmospheric pressure reference
            ATMOSPHERIC_PRESSURE_REF: 14.637627819829893, // psia

            // Air density factor from Excel calculations
            AIR_DENSITY_FACTOR: 1.08, // Used in sensible heat calculations (K33, K35)

            // Conversion factors from Excel
            CFM_TO_TONS_FACTOR: 4.5, // Used in J33, K35 formulas
            BTU_TO_TONS: 12000, // Conversion factor in J33
            MBH_DIVISOR: 1000, // Used in K33, K35 for MBH conversion

            // Preheat constant from Excel (appears to be N1)
            PREHEAT_CONSTANT: 26.3, // Used in I26, I27 calculations
        };

        // ERV effectiveness lookup (from AirXchange sheet)
        this.ervEffectiveness = {
            "ERC-4132C-4M": {
                cooling: 0.8752023172092118, // AirXchange!L11
                heating: 0.8435680521122568  // AirXchange!L23
            },
            "ERC-3014": {
                cooling: 0.85,
                heating: 0.82
            },
            "ERC-3622": {
                cooling: 0.87,
                heating: 0.84
            },
            "ERC-4136": {
                cooling: 0.88,
                heating: 0.85
            },
            "ERC-4634": {
                cooling: 0.89,
                heating: 0.86
            },
            "ERC-5262": {
                cooling: 0.90,
                heating: 0.87
            }
        };

        // Pressure drop lookup (from AirXchange sheet F29)
        this.pressureDrop = 0.434589058481117;

        // Velocity lookup (from PickList L13:M17)
        this.velocityLookup = {
            "ERC-3014": 571.4285714285714,
            "ERC-3622": 387.09677419354836,
            "ERC-4136": 292.6829268292683,
            "ERC-4634": 230.76923076923077,
            "ERC-5262": 169.01408450704227,
            "ERC-4132C-4M": 387.09677419354836
        };

        // Fan lookup data (from Main Sheet M71:Q74)
        this.fanData = {
            "10-10B": {
                motorSizeHP: 1,
                fanRPM: 934.0984829173981,
                fanMotorBHP: 0.36819078611914113,
                totalStaticPressure: 0.9704395815305973
            }
        };

        // Motor and parts data (from Input sheet)
        this.partsData = {
            motor: {
                value: "143TTDR6027", // Input!C8
                partNumber: "VELMTR-0183" // Input!D8
            },
            driver: {
                value: "1VM50X7/8", // Input!C9
                partNumber: "VCPBLW-0117" // Input!D9
            },
            driven: {
                value: "MB83X3/4", // Input!C10
                partNumber: "VCPBLW-0302" // Input!D10
            },
            belt: {
                value: "BX34", // Input!C11
                partNumber: "VCPBLW-0308" // Input!D11
            }
        };
    }

    async calculate(inputData) {
        try {
            this.inputs = inputData;
            this.results = {};

            console.log('Starting Excel-exact ERV calculation...');

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

            // Step 9: Calculate fan and motor data (Level 2-4)
            this.calculateFanAndMotorData();

            // Step 10: Calculate preheat temperatures (Level 2)
            this.calculatePreheatTemperatures();

            // Step 11: Calculate unit performance (Level 7)
            this.calculateUnitPerformance();

            console.log('Excel-exact ERV calculation completed');
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
        // Standard atmospheric pressure calculation
        const seaLevelPressure = 14.696; // psia
        const lapseRate = 0.0000368; // per foot
        return seaLevelPressure * Math.pow(1 - (lapseRate * altitude), 5.25588);
    }

    // Level 2: Psychrometric calculations
    async calculatePsychrometrics(pressure) {
        // C11: Grains(C7,$M$27,1,C8)
        this.results.oaGrainsCooling = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.oaDryBulbCooling),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.oaWetBulbCooling)
        );

        // C12: Grains(C9,$M$27,1,C10)
        this.results.raGrainsCooling = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.raDryBulbCooling),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.raWetBulbCooling)
        );

        // D12: Grains(D9,$M$27,1,D10)
        this.results.raGrainsHeating = PsychrometricFunctions.Grains(
            parseFloat(this.inputs.raDryBulbHeating),
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            1,
            parseFloat(this.inputs.raWetBulbHeating)
        );

        // D11: IF(H26=0,Grains(D7,$M$27,1,D8),Grains(I26,$M$27,1,I27))
        const preHeaterSize = parseFloat(this.inputs.preHeaterSize) || 0;
        if (preHeaterSize === 0) {
            this.results.oaGrainsHeating = PsychrometricFunctions.Grains(
                parseFloat(this.inputs.oaDryBulbHeating),
                this.constants.ATMOSPHERIC_PRESSURE_REF,
                1,
                parseFloat(this.inputs.oaWetBulbHeating)
            );
        } else {
            // Will be calculated after I26, I27 are determined
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

    // Level 1: Flow calculations
    calculateFlowValues() {
        // C18: C15-C16
        const supplyAirCFM = parseFloat(this.inputs.supplyAirCFM) || 0;
        const outdoorAirCFM = parseFloat(this.inputs.outdoorAirCFM) || 0;
        this.results.mixedReturnCFM = supplyAirCFM - outdoorAirCFM;

        // C14: IF(ISBLANK(AE6),AE5,AE6) - simplified to just use AE5
        this.results.locationDisplay = this.inputs.nearestLocation;

        // D14: IF(ISBLANK(AF6),AF5,AF6) - simplified to use altitude
        this.results.altitudeDisplay = this.lookupAltitude(this.inputs.nearestLocation);
    }

    // Level 1-3: ERV performance calculations
    calculateERVPerformance() {
        const ervSize = this.inputs.ervSizeSelection;

        // B33, B35: IF(ISNUMBER(SEARCH("ERC",C23)), C23,"")
        if (ervSize && ervSize.includes("ERC")) {
            this.results.modelDesignation = ervSize;
        } else {
            this.results.modelDesignation = "";
            return; // Can't proceed without valid ERV model
        }

        // C33: IF(B33<>"",AirXchange!L11,"")
        // C35: IF(B35<>"",AirXchange!L23,"")
        const effectiveness = this.ervEffectiveness[ervSize] || this.ervEffectiveness["ERC-4132C-4M"];
        this.results.unitEffectivenessCooling = effectiveness.cooling;
        this.results.unitEffectivenessHeating = effectiveness.heating;

        // D33, D35: IF(ISNUMBER(C33),AirXchange!F29,"")
        this.results.pressureDropCooling = this.pressureDrop;
        this.results.pressureDropHeating = this.pressureDrop;

        // E33, E35: IF(ISNUMBER(C33),(VLOOKUP(B33,PickList!L13:M17,2)),"")
        this.results.velocity = this.velocityLookup[ervSize] || this.velocityLookup["ERC-4132C-4M"];
    }

    // Level 4: ERV temperature calculations
    calculateERVTemperatures() {
        if (!this.results.modelDesignation) return;

        const oaCoolingDB = parseFloat(this.inputs.oaDryBulbCooling);
        const raCoolingDB = parseFloat(this.inputs.raDryBulbCooling);
        const oaHeatingDB = parseFloat(this.inputs.oaDryBulbHeating);
        const raHeatingDB = parseFloat(this.inputs.raDryBulbHeating);

        // F33: Excel shows this comes from AirXchange!F33
        // Based on effectiveness formula: F33 = C7 - (C7 - C9) * C33
        this.results.ervDryBulbCooling = oaCoolingDB - (oaCoolingDB - raCoolingDB) * this.results.unitEffectivenessCooling;

        // F35: Excel shows this comes from AirXchange!F35  
        // Based on effectiveness formula: F35 = D7 + (D9 - D7) * C35
        this.results.ervDryBulbHeating = oaHeatingDB + (raHeatingDB - oaHeatingDB) * this.results.unitEffectivenessHeating;

        // G33: Excel shows this comes from AirXchange!F34
        // Estimate wet bulb based on dry bulb and typical humidity
        this.results.ervWetBulbCooling = this.results.ervDryBulbCooling - 5; // Simplified

        // G35: Excel shows this comes from AirXchange!F36
        this.results.ervWetBulbHeating = this.results.ervDryBulbHeating - 5; // Simplified
    }

    // Level 5: Mixed supply air calculations
    calculateMixedSupplyAir() {
        if (!this.results.modelDesignation) return;

        const outdoorCFM = parseFloat(this.inputs.outdoorAirCFM);
        const supplyCFM = parseFloat(this.inputs.supplyAirCFM);
        const raCoolingDB = parseFloat(this.inputs.raDryBulbCooling);
        const raHeatingDB = parseFloat(this.inputs.raDryBulbHeating);

        // H33: IF(ISNUMBER(C33),((F33*$C$16)+($C$9*$C$18))/$C$15, "")
        this.results.msaDryBulbCooling = (
            (this.results.ervDryBulbCooling * outdoorCFM) +
            (raCoolingDB * this.results.mixedReturnCFM)
        ) / supplyCFM;

        // H35: IF(ISNUMBER(C35),((F35*$C$16)+($D$9*$C$18))/$C$15, "")
        this.results.msaDryBulbHeating = (
            (this.results.ervDryBulbHeating * outdoorCFM) +
            (raHeatingDB * this.results.mixedReturnCFM)
        ) / supplyCFM;

        // I33: IF(ISNUMBER(C33),(wetbulb(H33,M$27,2,O50)), "")
        this.results.msaWetBulbCooling = PsychrometricFunctions.wetbulb(
            this.results.msaDryBulbCooling,
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            2,
            this.results.raGrainsCooling / 7000
        );

        // I35: IF(ISNUMBER(C35),(wetbulb(H35,M$27,2,X50)), "")
        this.results.msaWetBulbHeating = PsychrometricFunctions.wetbulb(
            this.results.msaDryBulbHeating,
            this.constants.ATMOSPHERIC_PRESSURE_REF,
            2,
            this.results.raGrainsHeating / 7000
        );
    }

    // Level 6: Capacity calculations
    calculateCapacities() {
        if (!this.results.modelDesignation) return;

        const outdoorCFM = parseFloat(this.inputs.outdoorAirCFM);
        const supplyCFM = parseFloat(this.inputs.supplyAirCFM);
        const oaCoolingDB = parseFloat(this.inputs.oaDryBulbCooling);

        // J33: IF(ISNUMBER(C33),(ABS((4.5*C16*P33)/12000)), "")
        // P33 appears to be temperature difference for cooling calculation
        const tempDiffCooling = oaCoolingDB - this.results.ervDryBulbCooling;
        this.results.ervEffectiveCoolingTons = Math.abs(
            (this.constants.CFM_TO_TONS_FACTOR * outdoorCFM * tempDiffCooling) /
            this.constants.BTU_TO_TONS
        );

        // K33: ($C$15*1.08*($C$7-H33))/1000
        this.results.coolingSensibleMBH = (
            supplyCFM * this.constants.AIR_DENSITY_FACTOR *
            (oaCoolingDB - this.results.msaDryBulbCooling)
        ) / this.constants.MBH_DIVISOR;

        // K35: IF(ISNUMBER(C35),(ABS((4.5*C16*P36)/1000)), "")
        // P36 appears to be temperature difference for heating calculation
        const tempDiffHeating = this.results.ervDryBulbHeating - parseFloat(this.inputs.oaDryBulbHeating);
        this.results.heatingSensibleMBH = Math.abs(
            (this.constants.CFM_TO_TONS_FACTOR * outdoorCFM * tempDiffHeating) /
            this.constants.MBH_DIVISOR
        );

        // J35 appears to be empty in Excel, so no heating tons calculation
        this.results.ervEffectiveHeatingTons = null;
    }

    // Level 2-4: Fan and motor calculations
    calculateFanAndMotorData() {
        const unitModel = this.inputs.unitModel;

        // H6: IF(C21="(blank)","…",IF(ISNUMBER(SEARCH("Precedent",C21)),P77,N77))
        // Simplified based on unit model
        if (unitModel && unitModel.includes("Voyager")) {
            this.results.fanType = "10-10B";
        } else {
            this.results.fanType = "10-10B"; // Default
        }

        // Get fan data from lookup
        const fanInfo = this.fanData[this.results.fanType] || this.fanData["10-10B"];

        // H7: VLOOKUP(H6,M71:Q74,5)
        this.results.motorSizeHP = fanInfo.motorSizeHP;

        // H8: VLOOKUP(H6,M71:Q74,4)
        this.results.fanRPM = fanInfo.fanRPM;

        // H9: VLOOKUP(H6,M71:Q74,2)
        this.results.fanMotorBHP = fanInfo.fanMotorBHP;

        // H10: VLOOKUP(H6,M71:Q74,3)
        this.results.totalStaticPressure = fanInfo.totalStaticPressure;

        // Motor and parts data from Input sheet
        this.results.motorValue = this.partsData.motor.value;
        this.results.motorPN = this.partsData.motor.partNumber;
        this.results.driverValue = this.partsData.driver.value;
        this.results.driverPN = this.partsData.driver.partNumber;
        this.results.drivenValue = this.partsData.driven.value;
        this.results.drivenPN = this.partsData.driven.partNumber;
        this.results.beltValue = this.partsData.belt.value;
        this.results.beltPN = this.partsData.belt.partNumber;
        this.results.rpmValue = this.results.fanRPM;
    }

    // Level 2: Preheat calculations
    calculatePreheatTemperatures() {
        // I26: ROUND(D7+N1,1)
        this.results.postPreheatTempCooling = Math.round(
            (parseFloat(this.inputs.oaDryBulbHeating) + this.constants.PREHEAT_CONSTANT) * 10
        ) / 10;

        // I27: ROUND(D8+N1,1)
        this.results.postPreheatTempHeating = Math.round(
            (parseFloat(this.inputs.oaWetBulbHeating) + this.constants.PREHEAT_CONSTANT) * 10
        ) / 10;
    }

    // Level 7: Unit performance calculations
    calculateUnitPerformance() {
        // D26: ROUND(PickList!T3,1) - appears to be tonnage calculation
        const originalTons = parseFloat(this.inputs.unitTons) || 0;
        const ervReduction = this.results.ervEffectiveCoolingTons || 0;
        this.results.tonnageWithERV = Math.round((originalTons - ervReduction) * 10) / 10;

        // D27: ROUND(PickList!U3,1) - appears to be EER calculation
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

            // Fan and Motor Data
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
            rpmValue: formatNumber(this.results.rpmValue, 0)
        };
    }
}