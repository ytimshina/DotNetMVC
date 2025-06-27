// City Selection and Altitude Logic for ERV Wheel Calculator

class CityManager {
    constructor() {
        this.cityData = window.CityData || [];
        this.isManualMode = false;
        this.init();
    }

    init() {
        this.setupCityDropdown();
        this.setupEventListeners();
        this.populateDropdownOptions();
    }

    setupCityDropdown() {
        const cityCell = document.querySelector('td:has(#AE5)');
        if (!cityCell) return;

        // Create the dropdown and manual input structure
        cityCell.innerHTML = `
            <div class="city-selection-container">
                <div class="toggle-buttons mb-2">
                    <button type="button" class="btn btn-sm btn-primary active" id="dropdown-mode-btn">
                        Select from List
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="manual-mode-btn">
                        Manual Entry
                    </button>
                </div>
                <div id="dropdown-container">
                    <select class="form-select" id="AE5-dropdown" name="cityDropdown">
                        <option value="">Select a city...</option>
                    </select>
                </div>
                <div id="manual-container" class="d-none">
                    <input class="form-input" type="text" id="AE5-manual" name="R1_nearestLocation" placeholder="Enter city name"/>
                </div>
                <input type="hidden" id="AE5" name="R1_nearestLocation" value="" />
            </div>
        `;

        // Also update the altitude cell to show it's auto-populated
        const altitudeCell = document.querySelector('td:has(#AF5)');
        if (altitudeCell) {
            altitudeCell.innerHTML = `
                <div class="altitude-container">
                    <div id="altitude-dropdown-container">
                        <input class="form-input bg-light" type="number" id="AF5-auto" placeholder="Auto-filled" readonly/>
                    </div>
                    <div id="altitude-manual-container" class="d-none">
                        <input class="form-input" type="number" id="AF5-manual" name="R2_altitude" placeholder="Enter altitude"/>
                    </div>
                    <input type="hidden" id="AF5" name="R2_altitude" value="" />
                </div>
            `;
        }
    }

    populateDropdownOptions() {
        const dropdown = document.getElementById('AE5-dropdown');
        if (!dropdown) return;

        // Sort cities alphabetically
        const sortedCities = [...this.cityData].sort((a, b) => a.city.localeCompare(b.city));

        // Add cities to dropdown
        sortedCities.forEach(cityData => {
            const option = document.createElement('option');
            option.value = cityData.city;
            option.textContent = cityData.city;
            option.dataset.altitude = cityData.altitude;
            dropdown.appendChild(option);
        });
    }

    setupEventListeners() {
        // Toggle between dropdown and manual mode
        document.getElementById('dropdown-mode-btn')?.addEventListener('click', () => {
            this.switchToDropdownMode();
        });

        document.getElementById('manual-mode-btn')?.addEventListener('click', () => {
            this.switchToManualMode();
        });

        // Handle dropdown selection
        document.getElementById('AE5-dropdown')?.addEventListener('change', (e) => {
            this.handleCitySelection(e.target);
        });

        // Handle manual input changes
        document.getElementById('AE5-manual')?.addEventListener('input', (e) => {
            this.handleManualCityInput(e.target.value);
        });

        document.getElementById('AF5-manual')?.addEventListener('input', (e) => {
            this.handleManualAltitudeInput(e.target.value);
        });
    }

    switchToDropdownMode() {
        this.isManualMode = false;

        // Update button states
        document.getElementById('dropdown-mode-btn').className = 'btn btn-sm btn-primary active';
        document.getElementById('manual-mode-btn').className = 'btn btn-sm btn-outline-primary';

        // Show/hide appropriate containers
        document.getElementById('dropdown-container').classList.remove('d-none');
        document.getElementById('manual-container').classList.add('d-none');
        document.getElementById('altitude-dropdown-container').classList.remove('d-none');
        document.getElementById('altitude-manual-container').classList.add('d-none');

        // Clear manual inputs
        document.getElementById('AE5-manual').value = '';
        document.getElementById('AF5-manual').value = '';

        // Trigger dropdown change if something is selected
        const dropdown = document.getElementById('AE5-dropdown');
        if (dropdown.value) {
            this.handleCitySelection(dropdown);
        } else {
            this.clearValues();
        }
    }

    switchToManualMode() {
        this.isManualMode = true;

        // Update button states
        document.getElementById('dropdown-mode-btn').className = 'btn btn-sm btn-outline-primary';
        document.getElementById('manual-mode-btn').className = 'btn btn-sm btn-primary active';

        // Show/hide appropriate containers
        document.getElementById('dropdown-container').classList.add('d-none');
        document.getElementById('manual-container').classList.remove('d-none');
        document.getElementById('altitude-dropdown-container').classList.add('d-none');
        document.getElementById('altitude-manual-container').classList.remove('d-none');

        // Clear dropdown selection
        document.getElementById('AE5-dropdown').value = '';
        document.getElementById('AF5-auto').value = '';

        // Clear all related fields
        this.clearValues();
    }

    handleCitySelection(dropdown) {
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        const cityName = selectedOption.value;
        const altitude = selectedOption.dataset.altitude;

        if (cityName && altitude) {
            // Update all relevant fields
            this.updateCityAndAltitude(cityName, parseFloat(altitude));
        } else {
            this.clearValues();
        }
    }

    handleManualCityInput(cityName) {
        if (cityName.trim()) {
            // In manual mode, we only update the city, not altitude
            this.updateHiddenField('AE5', cityName.trim());
            this.updateReflectionFields(cityName.trim(), null);
        } else {
            this.clearValues();
        }
    }

    handleManualAltitudeInput(altitude) {
        const altitudeValue = altitude ? parseFloat(altitude) : null;
        this.updateHiddenField('AF5', altitudeValue);

        // Get current city value
        const cityName = document.getElementById('AE5-manual').value.trim();
        this.updateReflectionFields(cityName, altitudeValue);
    }

    updateCityAndAltitude(cityName, altitude) {
        // Update hidden fields
        this.updateHiddenField('AE5', cityName);
        this.updateHiddenField('AF5', altitude);

        // Update auto-filled altitude display
        document.getElementById('AF5-auto').value = altitude;

        // Update reflection fields
        this.updateReflectionFields(cityName, altitude);
    }

    updateReflectionFields(cityName, altitude) {
        // Update C14 (city reflection)
        const c14Element = document.getElementById('C14');
        if (c14Element) {
            c14Element.textContent = cityName || '--';
        }

        // Update D14 (altitude reflection)
        const d14Element = document.getElementById('D14');
        if (d14Element) {
            d14Element.textContent = altitude !== null ? altitude.toFixed(1) : '--';
        }
    }

    updateHiddenField(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value || '';
        }
    }

    clearValues() {
        // Clear hidden fields
        this.updateHiddenField('AE5', '');
        this.updateHiddenField('AF5', '');

        // Clear auto altitude display
        const autoAltitude = document.getElementById('AF5-auto');
        if (autoAltitude) {
            autoAltitude.value = '';
        }

        // Clear reflection fields
        this.updateReflectionFields('', null);
    }

    // Public method to get current values
    getCurrentValues() {
        return {
            city: document.getElementById('AE5').value,
            altitude: document.getElementById('AF5').value,
            isManual: this.isManualMode
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit to ensure all elements are loaded
    setTimeout(() => {
        window.cityManager = new CityManager();
    }, 100);
});

// Expose for external use
window.CityManager = CityManager;