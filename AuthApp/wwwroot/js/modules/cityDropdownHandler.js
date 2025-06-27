// js/modules/cityDropdownHandler.js
import { getCityData, getAltitudeByCity } from './cityAltitudeData.js';

export class CityDropdownHandler {
    constructor() {
        this.cityData = getCityData();
        this.init();
    }

    init() {
        this.populateDropdowns();
        this.attachEventListeners();
    }

    // Populate both city dropdowns with data
    populateDropdowns() {
        const cityDropdowns = [
            document.getElementById('AE5'), // Location Information dropdown
            document.getElementById('C14')  // ERV Wheel Inputs dropdown
        ];

        cityDropdowns.forEach(dropdown => {
            if (dropdown) {
                this.populateDropdown(dropdown);
            }
        });
    }

    // Populate a single dropdown with city options
    populateDropdown(dropdown) {
        // Clear existing options except the first one (placeholder)
        dropdown.innerHTML = '<option value="">Select City</option>';

        // Sort cities alphabetically for better UX
        const sortedCities = [...this.cityData].sort((a, b) =>
            a.city.localeCompare(b.city)
        );

        // Add city options
        sortedCities.forEach(cityItem => {
            const option = document.createElement('option');
            option.value = cityItem.city;
            option.textContent = cityItem.city;
            option.dataset.altitude = cityItem.altitude;
            dropdown.appendChild(option);
        });
    }

    // Attach event listeners to dropdowns
    attachEventListeners() {
        const locationDropdown = document.getElementById('AE5');
        const ervInputDropdown = document.getElementById('C14');

        if (locationDropdown) {
            locationDropdown.addEventListener('change', (e) => {
                this.handleCitySelection(e.target.value, 'location');
            });
        }

        if (ervInputDropdown) {
            ervInputDropdown.addEventListener('change', (e) => {
                this.handleCitySelection(e.target.value, 'ervInput');
            });
        }
    }

    // Handle city selection and update altitude fields
    handleCitySelection(selectedCity, dropdownType) {
        if (!selectedCity) {
            this.clearAltitudeFields(dropdownType);
            return;
        }

        const altitude = getAltitudeByCity(selectedCity);

        if (altitude !== null) {
            this.updateAltitudeFields(altitude, dropdownType);
            this.syncDropdowns(selectedCity, dropdownType);
        } else {
            console.error('City not found:', selectedCity);
            this.clearAltitudeFields(dropdownType);
        }
    }

    // Update altitude display fields
    updateAltitudeFields(altitude, dropdownType) {
        const altitudeFields = {
            location: document.getElementById('AF5'),     // Location Information altitude
            ervInput: document.getElementById('D14')     // ERV Wheel Inputs altitude
        };

        // Update the corresponding altitude field
        if (altitudeFields[dropdownType]) {
            if (altitudeFields[dropdownType].tagName === 'INPUT') {
                altitudeFields[dropdownType].value = altitude.toFixed(1);
            } else {
                altitudeFields[dropdownType].textContent = altitude.toFixed(1);
            }
        }

        // For ERV inputs, also update the main altitude display (D14)
        if (dropdownType === 'ervInput') {
            const mainAltitudeDisplay = document.getElementById('D14');
            if (mainAltitudeDisplay) {
                mainAltitudeDisplay.textContent = altitude.toFixed(1);
            }
        }
    }

    // Clear altitude fields when no city is selected
    clearAltitudeFields(dropdownType) {
        const altitudeFields = {
            location: document.getElementById('AF5'),
            ervInput: document.getElementById('D14')
        };

        if (altitudeFields[dropdownType]) {
            if (altitudeFields[dropdownType].tagName === 'INPUT') {
                altitudeFields[dropdownType].value = '';
            } else {
                altitudeFields[dropdownType].textContent = '--';
            }
        }
    }

    // Sync both dropdowns when one is changed
    syncDropdowns(selectedCity, sourceDropdown) {
        const dropdowns = {
            location: document.getElementById('AE5'),
            ervInput: document.getElementById('C14')
        };

        // Update the other dropdown to match
        Object.keys(dropdowns).forEach(key => {
            if (key !== sourceDropdown && dropdowns[key]) {
                dropdowns[key].value = selectedCity;
            }
        });

        // Update both altitude fields
        const altitude = getAltitudeByCity(selectedCity);
        if (altitude !== null) {
            this.updateAltitudeFields(altitude, 'location');
            this.updateAltitudeFields(altitude, 'ervInput');
        }
    }

    // Get currently selected city
    getCurrentCity() {
        const dropdown = document.getElementById('AE5') || document.getElementById('C14');
        return dropdown ? dropdown.value : null;
    }

    // Get current altitude
    getCurrentAltitude() {
        const currentCity = this.getCurrentCity();
        return currentCity ? getAltitudeByCity(currentCity) : null;
    }

    // Method to programmatically set city (useful for loading saved data)
    setCity(cityName) {
        if (!cityName) return;

        const dropdowns = [
            document.getElementById('AE5'),
            document.getElementById('C14')
        ];

        dropdowns.forEach(dropdown => {
            if (dropdown) {
                dropdown.value = cityName;
            }
        });

        this.handleCitySelection(cityName, 'location');
    }

    // Search functionality for large city lists
    filterCities(searchTerm) {
        if (!searchTerm) return this.cityData;

        const searchLower = searchTerm.toLowerCase();
        return this.cityData.filter(city =>
            city.city.toLowerCase().includes(searchLower)
        );
    }
}