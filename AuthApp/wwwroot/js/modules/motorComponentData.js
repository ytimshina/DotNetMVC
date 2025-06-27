// js/modules/motorComponentData.js
// Motor, drive, and component data extracted from Excel Parts and Calculator sheets

// Motor lookup table (from Parts sheet Q6:T10)
export const MOTOR_LOOKUP = [
    { hp: 1, shaftSize: "7/8", partNumber: "VELMTR-0183", model: "143TTDR6027", code: "A" },
    { hp: 1.5, shaftSize: "7/8", partNumber: "VELMTR-0138", model: "145TTDR6028", code: "C" },
    { hp: 2, shaftSize: "7/8", partNumber: "VELMTR-0139", model: "145TTDR6029", code: "E" },
    { hp: 3, shaftSize: "1-1/8", partNumber: "VELMTR-0140", model: "182TTDB6026", code: "G" },
    { hp: 5, shaftSize: "1-1/8", partNumber: "VELMTR-0141", model: "184TTDB6026", code: "J" }
];

// Fan curve data extracted from Fan Curve sheet
export const FAN_CURVE_DATA = {
    "10-10B_Single": {
        name: "ATLI Fans 1010b / 1010r (single)",
        baseRPM: 1597,
        performancePoints: [
            { cfm: 752.53, staticPressure: 2.63, bhp: 1.13, rpm: 1597 },
            { cfm: 995.66, staticPressure: 2.62, bhp: 1.14, rpm: 1591 },
            { cfm: 1493.49, staticPressure: 2.73, bhp: 1.31, rpm: 1598 },
            { cfm: 2002.89, staticPressure: 2.84, bhp: 1.57, rpm: 1599 },
            { cfm: 2512.3, staticPressure: 2.88, bhp: 1.93, rpm: 1600 },
            { cfm: 2975.4, staticPressure: 2.81, bhp: 2.35, rpm: 1601 },
            { cfm: 3484.8, staticPressure: 2.57, bhp: 2.92, rpm: 1598 },
            { cfm: 3623.73, staticPressure: 2.48, bhp: 3.1, rpm: 1600 },
            { cfm: 3994.21, staticPressure: 2.17, bhp: 3.62, rpm: 1600 },
            { cfm: 4526.77, staticPressure: 1.53, bhp: 4.47, rpm: 1599 },
            { cfm: 4804.63, staticPressure: 1.1, bhp: 4.95, rpm: 1596 }
        ]
    },
    "10-10BL_Twin": {
        name: "ATLI Fans W 10- 10 bl / 1010 bp (twin)",
        baseRPM: 1349,
        performancePoints: [
            { cfm: 1283.84, staticPressure: 1.88, bhp: 1.36, rpm: 1349 },
            { cfm: 1976.71, staticPressure: 1.9, bhp: 1.44, rpm: 1350 },
            { cfm: 2975.25, staticPressure: 1.99, bhp: 1.73, rpm: 1350 },
            { cfm: 3994.18, staticPressure: 2.05, bhp: 2.19, rpm: 1351 },
            { cfm: 5114.99, staticPressure: 1.98, bhp: 2.89, rpm: 1349 },
            { cfm: 5991.27, staticPressure: 1.8, bhp: 3.61, rpm: 1350 },
            { cfm: 6500.73, staticPressure: 1.65, bhp: 4.1, rpm: 1351 },
            { cfm: 7030.57, staticPressure: 1.43, bhp: 4.67, rpm: 1352 },
            { cfm: 8029.11, staticPressure: 0.85, bhp: 5.86, rpm: 1350 },
            { cfm: 8599.71, staticPressure: 0.44, bhp: 6.6, rpm: 1351 },
            { cfm: 9088.79, staticPressure: 0.02, bhp: 7.23, rpm: 1350 }
        ]
    },
    "9-6B_Single": {
        name: "ATLI Fans 9-6b / 9-6r (single)",
        baseRPM: 1693,
        performancePoints: [
            { cfm: 500, staticPressure: 2.46, bhp: 0.44, rpm: 1693 },
            { cfm: 752.53, staticPressure: 2.58, bhp: 0.56, rpm: 1696 },
            { cfm: 1001.45, staticPressure: 2.69, bhp: 0.72, rpm: 1696 },
            { cfm: 1250.36, staticPressure: 2.7, bhp: 0.91, rpm: 1698 },
            { cfm: 1360.35, staticPressure: 2.67, bhp: 1.01, rpm: 1701 },
            { cfm: 1499.28, staticPressure: 2.59, bhp: 1.14, rpm: 1702 },
            { cfm: 1753.98, staticPressure: 2.29, bhp: 1.39, rpm: 1699 },
            { cfm: 1997.1, staticPressure: 1.89, bhp: 1.68, rpm: 1703 },
            { cfm: 2251.81, staticPressure: 1.28, bhp: 2, rpm: 1700 },
            { cfm: 2500.72, staticPressure: 0.52, bhp: 2.32, rpm: 1696 }
        ]
    }
};

// Flow limits data (from Flow Limits sheet)
export const FLOW_LIMITS = [
    { model: "UWC-30", wheelArea: 2.1, wheelDia: 30, maxFlow: 1785, minFlow: 210 },
    { model: "UWCH-30", wheelArea: 2.1, wheelDia: 30, maxFlow: 1785, minFlow: 210 },
    { model: "UWC-36", wheelArea: 3.1, wheelDia: 36, maxFlow: 2635, minFlow: 310 },
    { model: "UWCH-36", wheelArea: 3.1, wheelDia: 36, maxFlow: 2635, minFlow: 310 },
    { model: "UWC-41", wheelArea: 4.1, wheelDia: 41, maxFlow: 3485, minFlow: 410 },
    { model: "UWCH-41", wheelArea: 4.1, wheelDia: 41, maxFlow: 3485, minFlow: 410 },
    { model: "UWC-46", wheelArea: 5.2, wheelDia: 46, maxFlow: 4420, minFlow: 520 },
    { model: "UWCH-46", wheelArea: 5.2, wheelDia: 46, maxFlow: 4420, minFlow: 520 },
    { model: "UWC-52", wheelArea: 7.1, wheelDia: 52, maxFlow: 6035, minFlow: 710 },
    { model: "UWCH-52", wheelArea: 7.1, wheelDia: 52, maxFlow: 6035, minFlow: 710 },
    { model: "UWC-58", wheelArea: 9.2, wheelDia: 58, maxFlow: 7820, minFlow: 920 },
    { model: "UWCH-58", wheelArea: 9.2, wheelDia: 58, maxFlow: 7820, minFlow: 920 },
    { model: "UWC-64", wheelArea: 10.7, wheelDia: 64, maxFlow: 9095, minFlow: 1070 },
    { model: "UWCH-64", wheelArea: 10.7, wheelDia: 64, maxFlow: 9095, minFlow: 1070 },
    { model: "UWC-68", wheelArea: 12.5, wheelDia: 68, maxFlow: 10625, minFlow: 1250 },
    { model: "UWCH-68", wheelArea: 12.5, wheelDia: 68, maxFlow: 10625, minFlow: 1250 },
    { model: "UWC-74", wheelArea: 14.8, wheelDia: 74, maxFlow: 12580, minFlow: 1480 },
    { model: "UWCH-74", wheelArea: 14.8, wheelDia: 74, maxFlow: 12580, minFlow: 1480 }
];

// Drive component calculation constants (from Calculator sheet)
export const DRIVE_CALCULATION_CONSTANTS = {
    // These are used in the Calculator sheet formulas
    DRIVER_DIAMETER_RANGE: { min: 3.0, max: 8.0 }, // From Calculator sheet analysis
    DRIVEN_DIAMETER_RANGE: { min: 6.0, max: 20.0 },
    BELT_LENGTH_TOLERANCE: 0.05, // C6 in Calculator

    // Standard belt types and their properties
    BELT_TYPES: {
        "BX": { minLength: 21, maxLength: 120, increment: 1 },
        "5VX": { minLength: 25, maxLength: 200, increment: 2.5 },
        "AX": { minLength: 13, maxLength: 250, increment: 1 }
    }
};

// Standard pulley sizes and part numbers
export const PULLEY_DATA = {
    drivers: [
        { size: "1VM25X7/8", diameter: 2.5, shaftSize: "7/8", partNumber: "VCPBLW-0101" },
        { size: "1VM30X7/8", diameter: 3.0, shaftSize: "7/8", partNumber: "VCPBLW-0102" },
        { size: "1VM35X7/8", diameter: 3.5, shaftSize: "7/8", partNumber: "VCPBLW-0103" },
        { size: "1VM40X7/8", diameter: 4.0, shaftSize: "7/8", partNumber: "VCPBLW-0104" },
        { size: "1VM45X7/8", diameter: 4.5, shaftSize: "7/8", partNumber: "VCPBLW-0105" },
        { size: "1VM50X7/8", diameter: 5.0, shaftSize: "7/8", partNumber: "VCPBLW-0117" }
    ],
    driven: [
        { size: "MB63X3/4", diameter: 6.3, shaftSize: "3/4", partNumber: "VCPBLW-0201" },
        { size: "MB71X3/4", diameter: 7.1, shaftSize: "3/4", partNumber: "VCPBLW-0202" },
        { size: "MB79X3/4", diameter: 7.9, shaftSize: "3/4", partNumber: "VCPBLW-0301" },
        { size: "MB83X3/4", diameter: 8.3, shaftSize: "3/4", partNumber: "VCPBLW-0302" },
        { size: "MB95X3/4", diameter: 9.5, shaftSize: "3/4", partNumber: "VCPBLW-0303" }
    ]
};

// Belt data with part numbers
export const BELT_DATA = [
    { size: "BX21", length: 21, type: "BX", partNumber: "VCPBLW-0301" },
    { size: "BX25", length: 25, type: "BX", partNumber: "VCPBLW-0302" },
    { size: "BX31", length: 31, type: "BX", partNumber: "VCPBLW-0305" },
    { size: "BX34", length: 34, type: "BX", partNumber: "VCPBLW-0308" },
    { size: "BX38", length: 38, type: "BX", partNumber: "VCPBLW-0310" },
    { size: "BX42", length: 42, type: "BX", partNumber: "VCPBLW-0312" },
    { size: "BX46", length: 46, type: "BX", partNumber: "VCPBLW-0315" },
    { size: "BX51", length: 51, type: "BX", partNumber: "VCPBLW-0318" }
];

// Helper functions

/**
 * Get motor data by horsepower
 * @param {number} hp - Motor horsepower
 * @returns {object} Motor data object
 */
export function getMotorByHP(hp) {
    return MOTOR_LOOKUP.find(motor => motor.hp === parseFloat(hp));
}

/**
 * Calculate fan performance at specific RPM
 * @param {string} fanType - Fan type identifier
 * @param {number} targetRPM - Target RPM
 * @param {number} targetCFM - Target CFM
 * @returns {object} Fan performance data
 */
export function calculateFanPerformance(fanType, targetRPM, targetCFM) {
    const fanData = FAN_CURVE_DATA[fanType];
    if (!fanData) return null;

    // Find closest performance point
    const closestPoint = fanData.performancePoints.reduce((prev, curr) => {
        return Math.abs(curr.cfm - targetCFM) < Math.abs(prev.cfm - targetCFM) ? curr : prev;
    });

    // Adjust for different RPM using fan laws
    const rpmRatio = targetRPM / closestPoint.rpm;
    const rpmRatio2 = Math.pow(rpmRatio, 2);
    const rpmRatio3 = Math.pow(rpmRatio, 3);

    return {
        cfm: closestPoint.cfm * rpmRatio,
        staticPressure: closestPoint.staticPressure * rpmRatio2,
        bhp: closestPoint.bhp * rpmRatio3,
        rpm: targetRPM
    };
}

/**
 * Calculate required drive ratio
 * @param {number} motorRPM - Motor RPM
 * @param {number} fanRPM - Desired fan RPM
 * @returns {number} Drive ratio
 */
export function calculateDriveRatio(motorRPM, fanRPM) {
    return parseFloat(motorRPM) / parseFloat(fanRPM);
}

/**
 * Select appropriate pulley sizes
 * @param {number} driveRatio - Required drive ratio
 * @param {string} motorShaftSize - Motor shaft size
 * @returns {object} Selected driver and driven pulleys
 */
export function selectPulleys(driveRatio, motorShaftSize = "7/8") {
    // Find suitable driver pulley for motor shaft
    const suitableDrivers = PULLEY_DATA.drivers.filter(p => p.shaftSize === motorShaftSize);

    if (suitableDrivers.length === 0) return null;

    // Try different driver sizes to find best match
    let bestMatch = null;
    let bestError = Infinity;

    suitableDrivers.forEach(driver => {
        const requiredDrivenDiameter = driver.diameter * driveRatio;

        // Find closest driven pulley
        const driven = PULLEY_DATA.driven.reduce((prev, curr) => {
            return Math.abs(curr.diameter - requiredDrivenDiameter) <
                Math.abs(prev.diameter - requiredDrivenDiameter) ? curr : prev;
        });

        const actualRatio = driven.diameter / driver.diameter;
        const error = Math.abs(actualRatio - driveRatio);

        if (error < bestError) {
            bestError = error;
            bestMatch = { driver, driven, actualRatio, error };
        }
    });

    return bestMatch;
}

/**
 * Calculate belt length for given pulley centers and diameters
 * @param {number} driverDia - Driver pulley diameter
 * @param {number} drivenDia - Driven pulley diameter
 * @param {number} centerDistance - Center distance between pulleys
 * @returns {number} Required belt length
 */
export function calculateBeltLength(driverDia, drivenDia, centerDistance) {
    const pi = Math.PI;
    const diameterDiff = Math.abs(drivenDia - driverDia);

    // Standard belt length calculation
    const beltLength = 2 * centerDistance +
        (pi * (driverDia + drivenDia) / 2) +
        (Math.pow(diameterDiff, 2) / (4 * centerDistance));

    return beltLength;
}

/**
 * Find best belt match for calculated length
 * @param {number} requiredLength - Required belt length
 * @param {string} beltType - Belt type (BX, 5VX, etc.)
 * @returns {object} Best matching belt
 */
export function selectBelt(requiredLength, beltType = "BX") {
    const availableBelts = BELT_DATA.filter(belt => belt.type === beltType);

    return availableBelts.reduce((prev, curr) => {
        return Math.abs(curr.length - requiredLength) <
            Math.abs(prev.length - requiredLength) ? curr : prev;
    });
}

/**
 * Validate flow against ERV wheel limits
 * @param {string} ervModel - ERV model name
 * @param {number} flowCFM - Flow rate in CFM
 * @returns {object} Validation result
 */
export function validateFlow(ervModel, flowCFM) {
    const flowLimit = FLOW_LIMITS.find(limit => ervModel.includes(limit.model.replace(/UW[CH]?-/, "")));

    if (!flowLimit) {
        return { valid: false, reason: "ERV model not found in flow limits" };
    }

    const cfm = parseFloat(flowCFM);

    if (cfm < flowLimit.minFlow) {
        return {
            valid: false,
            reason: `Flow (${cfm} CFM) below minimum (${flowLimit.minFlow} CFM) for ${flowLimit.model}`
        };
    }

    if (cfm > flowLimit.maxFlow) {
        return {
            valid: false,
            reason: `Flow (${cfm} CFM) exceeds maximum (${flowLimit.maxFlow} CFM) for ${flowLimit.model}`
        };
    }

    return { valid: true, flowLimit };
}

/**
 * Get all available motor options
 * @returns {array} Array of motor options for dropdowns
 */
export function getMotorOptions() {
    return MOTOR_LOOKUP.map(motor => ({
        value: motor.hp,
        label: `${motor.hp} HP - ${motor.model}`,
        ...motor
    }));
}

/**
 * Get ERV wheel options based on flow requirements
 * @param {number} maxFlow - Maximum flow requirement
 * @returns {array} Suitable ERV wheel options
 */
export function getERVWheelOptions(maxFlow) {
    return FLOW_LIMITS
        .filter(limit => limit.maxFlow >= maxFlow)
        .map(limit => ({
            value: limit.model,
            label: `${limit.model} (${limit.minFlow}-${limit.maxFlow} CFM)`,
            ...limit
        }));
}