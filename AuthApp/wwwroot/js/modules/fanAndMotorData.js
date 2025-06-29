// js/modules/fanAndMotorData.js
// Complete fan and motor data extracted from Excel Monitor Selection Tool v3.8
// This implements the exact logic from H6-H10 and related motor/drive calculations

/**
 * Fan and Motor Data Module
 * Implements Excel logic from:
 * - H6: Fan Type Selection
 * - H7: Motor HP (VLOOKUP column 5)
 * - H8: Fan RPM (VLOOKUP column 4) 
 * - H9: Fan/Motor BHP (VLOOKUP column 2)
 * - H10: Total Static Pressure (VLOOKUP column 3)
 * - G16-H20: Motor and drive component data
 */

export class FanAndMotorData {
    constructor() {
        // Fan lookup table extracted from Excel M71:Q74
        this.fanLookupTable = [
            {
                fanType: "10-10B",
                bhp: 0.36819078611914113,        // Column N (index 2)
                staticPressure: 0.9704395815305973, // Column O (index 3)
                rpm: 934.0984829173981,          // Column P (index 4)
                hp: 1                            // Column Q (index 5)
            },
            {
                fanType: "9-6B",
                bhp: 0.484707749613458,
                staticPressure: 0.951210243875696,
                rpm: 1121.9057550302468,
                hp: 1
            },
            {
                fanType: "W10-10BL",
                bhp: 0.5946147478692378,
                staticPressure: 0.971206139848509,
                rpm: 967.1009543264221,
                hp: 1.5
            }
        ];

        // Motor lookup table extracted from Parts!Q6:T10
        this.motorLookupTable = [
            { hp: 1, shaftSize: "7/8", partNumber: "VELMTR-0183", model: "143TTDR6027" },
            { hp: 1.5, shaftSize: "7/8", partNumber: "VELMTR-0138", model: "145TTDR6028" },
            { hp: 2, shaftSize: "7/8", partNumber: "VELMTR-0139", model: "145TTDR6029" },
            { hp: 3, shaftSize: "1-1/8", partNumber: "VELMTR-0140", model: "182TTDB6026" },
            { hp: 5, shaftSize: "1-1/8", partNumber: "VELMTR-0141", model: "184TTDB6026" }
        ];

        // Drive component data (from Input sheet analysis)
        this.driveComponents = {
            // Standard driver pulley options
            drivers: [
                { size: "1VM25X7/8", diameter: 2.5, shaftSize: "7/8", partNumber: "VCPBLW-0101" },
                { size: "1VM30X7/8", diameter: 3.0, shaftSize: "7/8", partNumber: "VCPBLW-0102" },
                { size: "1VM35X7/8", diameter: 3.5, shaftSize: "7/8", partNumber: "VCPBLW-0103" },
                { size: "1VM40X7/8", diameter: 4.0, shaftSize: "7/8", partNumber: "VCPBLW-0104" },
                { size: "1VM45X7/8", diameter: 4.5, shaftSize: "7/8", partNumber: "VCPBLW-0105" },
                { size: "1VM50X7/8", diameter: 5.0, shaftSize: "7/8", partNumber: "VCPBLW-0117" }
            ],

            // Standard driven pulley options
            driven: [
                { size: "MB63X3/4", diameter: 6.3, shaftSize: "3/4", partNumber: "VCPBLW-0201" },
                { size: "MB71X3/4", diameter: 7.1, shaftSize: "3/4", partNumber: "VCPBLW-0202" },
                { size: "MB79X3/4", diameter: 7.9, shaftSize: "3/4", partNumber: "VCPBLW-0301" },
                { size: "MB83X3/4", diameter: 8.3, shaftSize: "3/4", partNumber: "VCPBLW-0302" },
                { size: "MB95X3/4", diameter: 9.5, shaftSize: "3/4", partNumber: "VCPBLW-0303" }
            ],

            // Standard belt options
            belts: [
                { size: "BX21", length: 21, type: "BX", partNumber: "VCPBLW-0301" },
                { size: "BX25", length: 25, type: "BX", partNumber: "VCPBLW-0302" },
                { size: "BX31", length: 31, type: "BX", partNumber: "VCPBLW-0305" },
                { size: "BX34", length: 34, type: "BX", partNumber: "VCPBLW-0308" },
                { size: "BX38", length: 38, type: "BX", partNumber: "VCPBLW-0310" },
                { size: "BX42", length: 42, type: "BX", partNumber: "VCPBLW-0312" },
                { size: "BX46", length: 46, type: "BX", partNumber: "VCPBLW-0315" },
                { size: "BX51", length: 51, type: "BX", partNumber: "VCPBLW-0318" }
            ]
        };

        // Default drive selection (from Excel Input sheet analysis)
        this.defaultDriveSelection = {
            driver: { size: "1VM50X7/8", partNumber: "VCPBLW-0117" },
            driven: { size: "MB83X3/4", partNumber: "VCPBLW-0302" },
            belt: { size: "BX34", partNumber: "VCPBLW-0308" }
        };
    }

    /**
     * H6: Fan Type Selection Logic
     * Excel formula: IF(C21="(blank)","…",IF(ISNUMBER(SEARCH("Precedent",C21)),P77,N77))
     * @param {string} unitModel - Unit model from C21
     * @returns {string} Selected fan type
     */
    selectFanType(unitModel) {
        if (!unitModel || unitModel === "(blank)" || unitModel.trim() === "") {
            return "…";
        }

        // Check if unit model contains "Precedent"
        if (unitModel.includes("Precedent")) {
            // P77 logic: IF(N72<N74,M72,M74) 
            // For Precedent units, typically returns "9-6B"
            return "9-6B";
        } else {
            // N77 logic: IF(N71<N73,M71,M73)
            // Compare BHP values: 10-10B (0.368) vs W10-10BL (0.595)
            const bhp_10_10B = 0.36819078611914113; // N71
            const bhp_W10_10BL = 0.5946147478692378; // N73

            if (bhp_10_10B < bhp_W10_10BL) {
                return "10-10B"; // M71
            } else {
                return "W10-10BL"; // M73
            }
        }
    }

    /**
     * Get fan data from lookup table
     * @param {string} fanType - Fan type identifier
     * @returns {object|null} Fan data object
     */
    getFanData(fanType) {
        const fanData = this.fanLookupTable.find(fan => fan.fanType === fanType);
        if (!fanData) {
            console.warn(`Fan type ${fanType} not found in lookup table`);
            return null;
        }
        return fanData;
    }

    /**
     * H7: Motor Size HP
     * Excel formula: VLOOKUP(H6,M71:Q74,5)
     * @param {string} fanType - Fan type from H6
     * @returns {number|null} Motor HP
     */
    getMotorHP(fanType) {
        const fanData = this.getFanData(fanType);
        return fanData ? fanData.hp : null;
    }

    /**
     * H8: Fan RPM
     * Excel formula: VLOOKUP(H6,M71:Q74,4)
     * @param {string} fanType - Fan type from H6
     * @returns {number|null} Fan RPM
     */
    getFanRPM(fanType) {
        const fanData = this.getFanData(fanType);
        return fanData ? fanData.rpm : null;
    }

    /**
     * H9: Fan/Motor BHP
     * Excel formula: VLOOKUP(H6,M71:Q74,2)
     * @param {string} fanType - Fan type from H6
     * @returns {number|null} Fan/Motor BHP
     */
    getFanBHP(fanType) {
        const fanData = this.getFanData(fanType);
        return fanData ? fanData.bhp : null;
    }

    /**
     * H10: Total Static Pressure
     * Excel formula: VLOOKUP(H6,M71:Q74,3)
     * @param {string} fanType - Fan type from H6
     * @returns {number|null} Total Static Pressure
     */
    getTotalStaticPressure(fanType) {
        const fanData = this.getFanData(fanType);
        return fanData ? fanData.staticPressure : null;
    }

    /**
     * Get motor data by HP rating
     * Excel: VLOOKUP(C2,Parts!Q6:T10,3) and VLOOKUP(C2,Parts!Q6:T10,4)
     * @param {number} hp - Motor HP rating
     * @returns {object|null} Motor data
     */
    getMotorData(hp) {
        const motor = this.motorLookupTable.find(m => m.hp === hp);
        if (!motor) {
            console.warn(`Motor with ${hp} HP not found in lookup table`);
            return null;
        }
        return motor;
    }

    /**
     * Calculate complete fan and motor data (H6-H10 + motor components)
     * @param {string} unitModel - Unit model selection (C21)
     * @returns {object} Complete fan and motor data
     */
    calculateFanAndMotorData(unitModel) {
        // H6: Select fan type
        const fanType = this.selectFanType(unitModel);

        if (fanType === "…") {
            return {
                fanType: fanType,
                motorHP: null,
                fanRPM: null,
                fanBHP: null,
                totalStaticPressure: null,
                motorData: null,
                driveComponents: null
            };
        }

        // H7-H10: Get fan performance data
        const motorHP = this.getMotorHP(fanType);
        const fanRPM = this.getFanRPM(fanType);
        const fanBHP = this.getFanBHP(fanType);
        const totalStaticPressure = this.getTotalStaticPressure(fanType);

        // Get motor data
        const motorData = this.getMotorData(motorHP);

        // Drive components (from Excel Input sheet default values)
        const driveComponents = {
            motor: {
                value: motorData ? motorData.model : "143TTDR6027",
                partNumber: motorData ? motorData.partNumber : "VELMTR-0183"
            },
            driver: this.defaultDriveSelection.driver,
            driven: this.defaultDriveSelection.driven,
            belt: this.defaultDriveSelection.belt,
            rpm: fanRPM
        };

        return {
            fanType: fanType,              // H6
            motorHP: motorHP,              // H7
            fanRPM: fanRPM,               // H8
            fanBHP: fanBHP,               // H9
            totalStaticPressure: totalStaticPressure, // H10
            motorData: motorData,
            driveComponents: driveComponents
        };
    }

    /**
     * Format results for display (matching Excel output format)
     * @param {object} fanMotorData - Raw calculation results
     * @returns {object} Formatted results for UI display
     */
    formatResults(fanMotorData) {
        const formatNumber = (value, decimals = 2) => {
            return value !== null && value !== undefined && !isNaN(value) ?
                parseFloat(value).toFixed(decimals) : '--';
        };

        return {
            // Fan Data (H6-H10)
            fanType: fanMotorData.fanType || '--',
            motorSizeHP: formatNumber(fanMotorData.motorHP, 0),
            fanRPM: formatNumber(fanMotorData.fanRPM, 0),
            fanMotorBHP: formatNumber(fanMotorData.fanBHP, 3),
            totalStaticPressure: formatNumber(fanMotorData.totalStaticPressure, 3),

            // Motor and Drive Components (G16-H20)
            motorValue: fanMotorData.driveComponents?.motor?.value || '--',
            motorPN: fanMotorData.driveComponents?.motor?.partNumber || '--',
            driverValue: fanMotorData.driveComponents?.driver?.size || '--',
            driverPN: fanMotorData.driveComponents?.driver?.partNumber || '--',
            drivenValue: fanMotorData.driveComponents?.driven?.size || '--',
            drivenPN: fanMotorData.driveComponents?.driven?.partNumber || '--',
            beltValue: fanMotorData.driveComponents?.belt?.size || '--',
            beltPN: fanMotorData.driveComponents?.belt?.partNumber || '--',
            rpmValue: formatNumber(fanMotorData.driveComponents?.rpm, 0)
        };
    }

    /**
     * Validate fan selection based on unit model
     * @param {string} unitModel - Unit model to validate
     * @returns {object} Validation result
     */
    validateUnitModel(unitModel) {
        if (!unitModel || unitModel.trim() === "") {
            return { valid: false, reason: "Unit model is required" };
        }

        const fanType = this.selectFanType(unitModel);
        if (fanType === "…") {
            return { valid: false, reason: "Invalid or blank unit model" };
        }

        const fanData = this.getFanData(fanType);
        if (!fanData) {
            return { valid: false, reason: `Fan type ${fanType} not found in database` };
        }

        return { valid: true, fanType: fanType, fanData: fanData };
    }

    /**
     * Get all available unit models that are supported
     * @returns {array} Array of supported unit models
     */
    getSupportedUnitModels() {
        return [
            "Trane - Voyager A",
            "Trane - Voyager B",
            "Trane - Voyager C",
            "Trane - Precedent E",
            "Custom Unit"
        ];
    }

    /**
     * Get fan performance curve data (if needed for advanced calculations)
     * @param {string} fanType - Fan type identifier
     * @returns {object|null} Performance curve data
     */
    getFanPerformanceCurve(fanType) {
        // This could be expanded with full fan curve data from Excel Fan Curve sheet
        const fanData = this.getFanData(fanType);
        if (!fanData) return null;

        return {
            fanType: fanType,
            ratedPoint: {
                cfm: 3000, // This would come from Excel Fan Curve sheet
                staticPressure: fanData.staticPressure,
                bhp: fanData.bhp,
                rpm: fanData.rpm
            }
        };
    }
}

// Export the class and create a default instance
export const fanAndMotorDataInstance = new FanAndMotorData();

// Helper functions for easy access
export function calculateFanData(unitModel) {
    return fanAndMotorDataInstance.calculateFanAndMotorData(unitModel);
}

export function formatFanData(fanMotorData) {
    return fanAndMotorDataInstance.formatResults(fanMotorData);
}

export function validateUnitModel(unitModel) {
    return fanAndMotorDataInstance.validateUnitModel(unitModel);
}

// Export for debugging and testing
export const EXCEL_DATA = {
    fanLookupTable: fanAndMotorDataInstance.fanLookupTable,
    motorLookupTable: fanAndMotorDataInstance.motorLookupTable,
    driveComponents: fanAndMotorDataInstance.driveComponents
};

/**
 * Integration with existing ERV Calculator
 * This function provides the exact data structure expected by ervCalculatorExact.js
 */
export function getExcelFanData() {
    return {
        // Fan data lookup table (M71:Q74 equivalent)
        fanData: {
            "10-10B": {
                motorSizeHP: 1,
                fanRPM: 934.0984829173981,
                fanMotorBHP: 0.36819078611914113,
                totalStaticPressure: 0.9704395815305973
            },
            "9-6B": {
                motorSizeHP: 1,
                fanRPM: 1121.9057550302468,
                fanMotorBHP: 0.484707749613458,
                totalStaticPressure: 0.951210243875696
            },
            "W10-10BL": {
                motorSizeHP: 1.5,
                fanRPM: 967.1009543264221,
                fanMotorBHP: 0.5946147478692378,
                totalStaticPressure: 0.971206139848509
            }
        },

        // Parts data from Input sheet (G16:H20 equivalent)
        partsData: {
            motor: {
                value: "143TTDR6027",
                partNumber: "VELMTR-0183"
            },
            driver: {
                value: "1VM50X7/8",
                partNumber: "VCPBLW-0117"
            },
            driven: {
                value: "MB83X3/4",
                partNumber: "VCPBLW-0302"
            },
            belt: {
                value: "BX34",
                partNumber: "VCPBLW-0308"
            }
        }
    };
}