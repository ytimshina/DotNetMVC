// js/modules/ervLookupData.js
// ERV model and performance data extracted from Excel PickList and AirXchange sheets

// ERV Model Options (extracted from Excel dropdown lists)
export const ERV_MODELS = [
    { value: "ERC-3014", label: "ERC-3014" },
    { value: "ERC-3622", label: "ERC-3622" },
    { value: "ERC-4136", label: "ERC-4136" },
    { value: "ERC-4634", label: "ERC-4634" },
    { value: "ERC-5262", label: "ERC-5262" },
    { value: "ERC-4132C-4M", label: "ERC-4132C-4M" }
];

// ERV Wheel Types (from Excel dropdown)
export const ERV_WHEEL_TYPES = [
    { value: "Aluminum ERC Series (Airxchange)", label: "Aluminum ERC Series (Airxchange)" },
    { value: "MS Coated ERC Series (Airxchange)", label: "MS Coated ERC Series (Airxchange)" },
    { value: "Polymer ERC Series (Airxchange)", label: "Polymer ERC Series (Airxchange)" }
];

// Unit Model Options (from Excel PickList sheet)
export const UNIT_MODELS = [
    { value: "Trane - Voyager C", label: "Trane - Voyager C", tons: 14 },
    { value: "Trane - Voyager B", label: "Trane - Voyager B", tons: 12 },
    { value: "Trane - Voyager A", label: "Trane - Voyager A", tons: 10 },
    { value: "Custom Unit", label: "Custom Unit", tons: 0 }
];

// Filter Types (from Excel dropdown)
export const FILTER_TYPES = [
    { value: "Merv 8", label: "MERV 8", multiplier: 1.0 },
    { value: "Merv 13", label: "MERV 13", multiplier: 1.3 },
    { value: "HEPA", label: "HEPA", multiplier: 1.8 }
];

// Purge Angle Options (from Excel)
export const PURGE_ANGLES = [
    { value: "0", label: "0°" },
    { value: "90", label: "90°" },
    { value: "180", label: "180°" },
    { value: "270", label: "270°" }
];

// Unit Voltage Options (from Excel)
export const UNIT_VOLTAGES = [
    { value: "208", label: "208V" },
    { value: "230", label: "230V" },
    { value: "460", label: "460V" },
    { value: "575", label: "575V" }
];

// Motor and component data (from Excel Input sheet)
export const MOTOR_DATA = {
    "143TTDR6027": {
        partNumber: "VELMTR-0183",
        hp: 1,
        rpm: 953,
        voltage: [208, 230, 460]
    },
    "Other Motor": {
        partNumber: "VELMTR-XXXX",
        hp: 0.75,
        rpm: 1725,
        voltage: [208, 230, 460, 575]
    }
};

// Belt and pulley data (from Excel Input sheet)
export const DRIVE_DATA = {
    driver: {
        part: "1VM50X7/8",
        partNumber: "VCPBLW-0117"
    },
    driven: {
        part: "MB83X3/4",
        partNumber: "VCPBLW-0302"
    },
    belt: {
        part: "BX34",
        partNumber: "VCPBLW-0308"
    }
};

// Fan performance data (from Excel Fan Curve and Main Sheet)
export const FAN_DATA = {
    "10-10B": {
        motorSizeHP: 1,
        fanRPM: 934.0984829173981,
        fanMotorBHP: 0.36819078611914113,
        totalStaticPressure: 0.9704395815305973
    },
    "Other Fan": {
        motorSizeHP: 0.75,
        fanRPM: 1200,
        fanMotorBHP: 0.5,
        totalStaticPressure: 0.75
    }
};

// Psychrometric constants (extracted from Excel Weather Data sheet)
export const PSYCHROMETRIC_CONSTANTS = {
    // Standard atmospheric pressure at sea level (psia)
    STANDARD_PRESSURE: 14.696,

    // Gas constants
    DRY_AIR_GAS_CONSTANT: 53.35, // ft·lbf/(lbm·°R)
    WATER_VAPOR_GAS_CONSTANT: 85.778, // ft·lbf/(lbm·°R)

    // Molecular weight ratio (water vapor/dry air)
    MOLECULAR_WEIGHT_RATIO: 0.62198,

    // Conversion factors
    RANKINE_OFFSET: 459.67, // °R offset from °F

    // Antoine equation constants for water vapor pressure
    ANTOINE_A: 8.07131,
    ANTOINE_B: 1730.63,
    ANTOINE_C: 233.426,

    // Enthalpy constants
    ENTHALPY_DRY_AIR: 0.24, // Btu/(lb·°F)
    ENTHALPY_WATER_VAPOR: 1061, // Btu/lb at 32°F

    // Altitude adjustment factors
    ALTITUDE_LAPSE_RATE: 0.0000368 // pressure change per foot
};

// ERV effectiveness lookup table (from AirXchange sheet)
export const EFFECTIVENESS_DATA = {
    "ERC-4132C-4M": {
        cooling: {
            sensible: 0.8752023172092118, // AirXchange L11
            latent: 0.807, // AirXchange N5
            enthalpy: 0.8435 // calculated
        },
        heating: {
            sensible: 0.8435680521122568, // AirXchange L23
            latent: 0.807, // AirXchange N5
            enthalpy: 0.8612 // calculated
        }
    },
    "ERC-3014": {
        cooling: { sensible: 0.85, latent: 0.80, enthalpy: 0.82 },
        heating: { sensible: 0.82, latent: 0.80, enthalpy: 0.84 }
    },
    "ERC-3622": {
        cooling: { sensible: 0.87, latent: 0.80, enthalpy: 0.84 },
        heating: { sensible: 0.84, latent: 0.80, enthalpy: 0.86 }
    },
    "ERC-4136": {
        cooling: { sensible: 0.88, latent: 0.81, enthalpy: 0.85 },
        heating: { sensible: 0.85, latent: 0.81, enthalpy: 0.87 }
    },
    "ERC-4634": {
        cooling: { sensible: 0.89, latent: 0.81, enthalpy: 0.86 },
        heating: { sensible: 0.86, latent: 0.81, enthalpy: 0.88 }
    },
    "ERC-5262": {
        cooling: { sensible: 0.90, latent: 0.82, enthalpy: 0.87 },
        heating: { sensible: 0.87, latent: 0.82, enthalpy: 0.89 }
    }
};

// Helper functions for data access
export function getERVModel(modelName) {
    return ERV_MODELS.find(model => model.value === modelName);
}

export function getERVEffectiveness(modelName, season = 'cooling') {
    const data = EFFECTIVENESS_DATA[modelName];
    return data ? data[season] : EFFECTIVENESS_DATA["ERC-4132C-4M"][season];
}

export function getUnitModelData(modelName) {
    return UNIT_MODELS.find(unit => unit.value === modelName);
}

export function getFanData(fanType) {
    return FAN_DATA[fanType] || FAN_DATA["10-10B"];
}

export function getFilterMultiplier(filterType) {
    const filter = FILTER_TYPES.find(f => f.value === filterType);
    return filter ? filter.multiplier : 1.0;
}

// Utility function to validate ERV model selection
export function validateERVModel(modelName) {
    return ERV_MODELS.some(model => model.value === modelName);
}

// Function to get all available ERV models for dropdowns
export function getAvailableERVModels() {
    return ERV_MODELS.map(model => ({
        value: model.value,
        label: model.label
    }));
}

// Function to get dropdown options for any field
export function getDropdownOptions(fieldType) {
    switch (fieldType) {
        case 'ervModel':
            return ERV_MODELS;
        case 'wheelType':
            return ERV_WHEEL_TYPES;
        case 'unitModel':
            return UNIT_MODELS;
        case 'filterType':
            return FILTER_TYPES;
        case 'purgeAngle':
            return PURGE_ANGLES;
        case 'voltage':
            return UNIT_VOLTAGES;
        default:
            return [];
    }
}