// js/modules/psychrometricFunctions.js
// Exact recreation of Excel custom psychrometric functions

import { PSYCHROMETRIC_CONSTANTS } from '.moduels/ervLookupData.js';

/**
 * Grains function - calculates grains of moisture per pound of dry air
 * Replicates Excel: Grains(dryBulb, pressure, mode, wetBulb)
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} pressure - Atmospheric pressure (psia)
 * @param {number} mode - Calculation mode (1 = standard)
 * @param {number} wetBulb - Wet bulb temperature (°F)
 * @returns {number} Grains of moisture per pound of dry air
 */
export function Grains(dryBulb, pressure, mode, wetBulb) {
    if (!dryBulb || !wetBulb || !pressure) return 0;

    try {
        const db = parseFloat(dryBulb);
        const wb = parseFloat(wetBulb);
        const p = parseFloat(pressure);

        // Convert temperatures to Celsius for calculation
        const dbC = (db - 32) * 5 / 9;
        const wbC = (wb - 32) * 5 / 9;

        // Calculate saturation pressure at wet bulb temperature using Antoine equation
        const pws = Math.exp(
            PSYCHROMETRIC_CONSTANTS.ANTOINE_A -
            (PSYCHROMETRIC_CONSTANTS.ANTOINE_B / (wbC + PSYCHROMETRIC_CONSTANTS.ANTOINE_C))
        ) * 0.14503773; // Convert kPa to psia

        // Calculate vapor pressure
        const pv = pws - ((p - pws) * (db - wb) * 0.00066 * (1 + 0.00115 * wb));

        // Calculate humidity ratio
        const humidityRatio = PSYCHROMETRIC_CONSTANTS.MOLECULAR_WEIGHT_RATIO * pv / (p - pv);

        // Convert to grains (7000 grains per pound)
        return Math.max(0, humidityRatio * 7000);

    } catch (error) {
        console.error('Grains calculation error:', error);
        return 0;
    }
}

/**
 * Wetbulb function - calculates wet bulb temperature from dry bulb and humidity
 * Replicates Excel: wetbulb(dryBulb, pressure, mode, reference)
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} pressure - Atmospheric pressure (psia)
 * @param {number} mode - Calculation mode (2 = from enthalpy)
 * @param {number} reference - Reference value (humidity ratio or enthalpy)
 * @returns {number} Wet bulb temperature (°F)
 */
export function wetbulb(dryBulb, pressure, mode, reference) {
    if (!dryBulb || !pressure) return dryBulb - 5; // Simplified fallback

    try {
        const db = parseFloat(dryBulb);
        const p = parseFloat(pressure);
        const ref = parseFloat(reference) || 0;

        // Simplified wet bulb calculation using iteration
        let wb = db - 10; // Initial guess
        let iteration = 0;
        const maxIterations = 20;
        const tolerance = 0.01;

        while (iteration < maxIterations) {
            // Calculate humidity ratio at current wet bulb guess
            const pws = calculateSaturationPressure(wb);
            const pv = pws - ((p - pws) * (db - wb) * 0.00066);
            const w = PSYCHROMETRIC_CONSTANTS.MOLECULAR_WEIGHT_RATIO * pv / (p - pv);

            // Calculate enthalpy
            const h = 0.24 * db + w * (1061 + 0.444 * db);

            // Check convergence based on mode
            let error;
            if (mode === 2) {
                // Mode 2: match enthalpy
                error = Math.abs(h - ref);
            } else {
                // Default: match humidity ratio
                error = Math.abs(w * 7000 - ref);
            }

            if (error < tolerance) break;

            // Update wet bulb guess
            wb += (ref > h) ? 0.5 : -0.5;
            iteration++;
        }

        return Math.max(32, Math.min(db, wb)); // Constrain to reasonable range

    } catch (error) {
        console.error('Wetbulb calculation error:', error);
        return dryBulb - 5; // Simplified fallback
    }
}

/**
 * Enthalpy function - calculates enthalpy of moist air
 * Replicates Excel: enthalpy(dryBulb, pressure, mode, wetBulb)
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} pressure - Atmospheric pressure (psia)
 * @param {number} mode - Calculation mode (1 = standard)
 * @param {number} wetBulb - Wet bulb temperature (°F)
 * @returns {number} Enthalpy (Btu/lb dry air)
 */
export function enthalpy(dryBulb, pressure, mode, wetBulb) {
    if (!dryBulb || !wetBulb || !pressure) return 0;

    try {
        const db = parseFloat(dryBulb);
        const wb = parseFloat(wetBulb);
        const p = parseFloat(pressure);

        // Calculate humidity ratio using Grains function
        const grains = Grains(db, p, mode, wb);
        const humidityRatio = grains / 7000;

        // Calculate enthalpy using ASHRAE formula
        const h = (0.24 * db) + (humidityRatio * (1061 + 0.444 * db));

        return h;

    } catch (error) {
        console.error('Enthalpy calculation error:', error);
        return 0;
    }
}

/**
 * Humidity function - calculates relative humidity from dry bulb and wet bulb
 * Replicates Excel: humidity(dryBulb, pressure, mode, wetBulb)
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} pressure - Atmospheric pressure (psia)
 * @param {number} mode - Calculation mode (1 = standard)
 * @param {number} wetBulb - Wet bulb temperature (°F)
 * @returns {number} Relative humidity (0-1)
 */
export function humidity(dryBulb, pressure, mode, wetBulb) {
    if (!dryBulb || !wetBulb || !pressure) return 0;

    try {
        const db = parseFloat(dryBulb);
        const wb = parseFloat(wetBulb);
        const p = parseFloat(pressure);

        // Calculate saturation pressures
        const pwsDb = calculateSaturationPressure(db);
        const pwsWb = calculateSaturationPressure(wb);

        // Calculate vapor pressure
        const pv = pwsWb - ((p - pwsWb) * (db - wb) * 0.00066);

        // Calculate relative humidity
        const rh = pv / pwsDb;

        return Math.max(0, Math.min(1, rh));

    } catch (error) {
        console.error('Humidity calculation error:', error);
        return 0;
    }
}

/**
 * Calculate saturation pressure using Antoine equation
 * @param {number} temperature - Temperature in °F
 * @returns {number} Saturation pressure in psia
 */
function calculateSaturationPressure(temperature) {
    // Convert to Celsius
    const tempC = (temperature - 32) * 5 / 9;

    // Antoine equation for water vapor pressure
    const logP = PSYCHROMETRIC_CONSTANTS.ANTOINE_A -
        (PSYCHROMETRIC_CONSTANTS.ANTOINE_B / (tempC + PSYCHROMETRIC_CONSTANTS.ANTOINE_C));

    // Convert from log(kPa) to psia
    return Math.exp(logP) * 0.14503773;
}

/**
 * Calculate air density at altitude
 * @param {number} altitude - Altitude in feet
 * @param {number} temperature - Temperature in °F
 * @returns {number} Air density (lb/ft³)
 */
export function calculateAirDensity(altitude = 0, temperature = 70) {
    const standardDensity = 0.075; // lb/ft³ at sea level, 70°F

    // Pressure adjustment for altitude
    const pressureRatio = Math.pow(1 - (altitude * PSYCHROMETRIC_CONSTANTS.ALTITUDE_LAPSE_RATE), 5.25588);

    // Temperature adjustment (assuming standard atmosphere)
    const tempRatio = (temperature + PSYCHROMETRIC_CONSTANTS.RANKINE_OFFSET) / (70 + PSYCHROMETRIC_CONSTANTS.RANKINE_OFFSET);

    return standardDensity * pressureRatio / tempRatio;
}

/**
 * Calculate atmospheric pressure at altitude
 * @param {number} altitude - Altitude in feet above sea level
 * @returns {number} Atmospheric pressure in psia
 */
export function calculateAtmosphericPressure(altitude = 0) {
    return PSYCHROMETRIC_CONSTANTS.STANDARD_PRESSURE *
        Math.pow(1 - (altitude * PSYCHROMETRIC_CONSTANTS.ALTITUDE_LAPSE_RATE), 5.25588);
}

/**
 * Dewpoint function - calculates dew point temperature
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} relativeHumidity - Relative humidity (0-1)
 * @returns {number} Dew point temperature (°F)
 */
export function dewpoint(dryBulb, relativeHumidity) {
    if (!dryBulb || !relativeHumidity) return 0;

    try {
        const db = parseFloat(dryBulb);
        const rh = parseFloat(relativeHumidity);

        // Convert to Celsius
        const dbC = (db - 32) * 5 / 9;

        // Magnus formula for dew point
        const alpha = Math.log(rh) + (17.625 * dbC) / (243.04 + dbC);
        const dpC = (243.04 * alpha) / (17.625 - alpha);

        // Convert back to Fahrenheit
        return dpC * 9 / 5 + 32;

    } catch (error) {
        console.error('Dewpoint calculation error:', error);
        return dryBulb - 10; // Fallback
    }
}

/**
 * Specific volume calculation
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} pressure - Atmospheric pressure (psia)
 * @param {number} humidityRatio - Humidity ratio (lb water/lb dry air)
 * @returns {number} Specific volume (ft³/lb dry air)
 */
export function specificVolume(dryBulb, pressure, humidityRatio) {
    if (!dryBulb || !pressure) return 13.5; // Standard value

    try {
        const db = parseFloat(dryBulb);
        const p = parseFloat(pressure);
        const w = parseFloat(humidityRatio) || 0;

        // Convert temperature to absolute (°R)
        const tempR = db + PSYCHROMETRIC_CONSTANTS.RANKINE_OFFSET;

        // Calculate specific volume using ideal gas law
        const v = (PSYCHROMETRIC_CONSTANTS.DRY_AIR_GAS_CONSTANT * tempR * (1 + 1.608 * w)) / (144 * p);

        return v;

    } catch (error) {
        console.error('Specific volume calculation error:', error);
        return 13.5; // Standard fallback
    }
}

/**
 * Validate psychrometric inputs
 * @param {number} dryBulb - Dry bulb temperature (°F)
 * @param {number} wetBulb - Wet bulb temperature (°F)
 * @returns {boolean} True if inputs are valid
 */
export function validatePsychrometricInputs(dryBulb, wetBulb) {
    const db = parseFloat(dryBulb);
    const wb = parseFloat(wetBulb);

    // Basic validation
    if (isNaN(db) || isNaN(wb)) return false;
    if (db < -50 || db > 150) return false; // Reasonable temperature range
    if (wb < -50 || wb > 150) return false;
    if (wb > db) return false; // Wet bulb cannot exceed dry bulb

    return true;
}

// Export all functions as a module
export const PsychrometricFunctions = {
    Grains,
    wetbulb,
    enthalpy,
    humidity,
    dewpoint,
    specificVolume,
    calculateAirDensity,
    calculateAtmosphericPressure,
    calculateSaturationPressure,
    validatePsychrometricInputs
};