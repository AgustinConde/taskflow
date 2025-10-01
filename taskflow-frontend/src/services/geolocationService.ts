import type { GeocodeResult, TaskLocation } from '../types/Location';

class GeolocationService {
    private googleMapsApiKey: string | null = null;
    private isGoogleMapsLoaded: boolean = false;

    constructor() {
        this.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null;
    }

    async initializeGoogleMaps(): Promise<void> {
        if (this.isGoogleMapsLoaded) return;

        if (!this.googleMapsApiKey) {
            console.warn('Google Maps API key not configured. Location features will be limited.');
            return;
        }

        return new Promise((resolve) => {
            if (window.google?.maps) {
                this.isGoogleMapsLoaded = true;
                resolve();
                return;
            }

            if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
                const checkGoogle = setInterval(() => {
                    if (window.google?.maps) {
                        clearInterval(checkGoogle);
                        this.isGoogleMapsLoaded = true;
                        resolve();
                    }
                }, 100);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places,marker&callback=initGoogleMaps&loading=async`;
            script.async = true;
            script.defer = true;

            // @ts-ignore - Global callback for Google Maps
            window.initGoogleMaps = () => {
                this.isGoogleMapsLoaded = true;
                resolve();
            };

            script.onerror = () => {
                console.warn('Google Maps API failed to load. Some location features may not work.');
                this.isGoogleMapsLoaded = false;
                resolve();
            };

            const timeout = setTimeout(() => {
                if (!this.isGoogleMapsLoaded) {
                    console.warn('Google Maps API loading timeout');
                    resolve();
                }
            }, 10000);

            script.onload = () => {
                clearTimeout(timeout);
            };

            document.head.appendChild(script);
        });
    }

    async geocodeAddress(address: string): Promise<GeocodeResult | null> {
        if (!this.isGoogleMapsLoaded) {
            await this.initializeGoogleMaps();
        }

        if (!window.google?.maps) {
            throw new Error('Google Maps API not available');
        }

        return new Promise((resolve, _reject) => {
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ address }, (results: any[] | null, status: any) => {
                if (status === 'OK' && results && results[0]) {
                    const result = results[0];
                    const location = result.geometry.location;

                    resolve({
                        address: result.formatted_address,
                        latitude: location.lat(),
                        longitude: location.lng(),
                        placeName: result.name,
                        placeId: result.place_id
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult | null> {
        if (!this.isGoogleMapsLoaded) {
            await this.initializeGoogleMaps();
        }

        if (!window.google?.maps) {
            throw new Error('Google Maps API not available');
        }

        return new Promise((resolve, _reject) => {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results: any[] | null, status: any) => {
                if (status === 'OK' && results && results[0]) {
                    const result = results[0];

                    resolve({
                        address: result.formatted_address,
                        latitude,
                        longitude,
                        placeName: result.name,
                        placeId: result.place_id
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                () => {
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    async searchPlaces(query: string, language?: string): Promise<GeocodeResult[]> {
        if (!this.isGoogleMapsLoaded) {
            await this.initializeGoogleMaps();
        }

        if (!window.google?.maps) {
            return [];
        }

        return this.searchPlacesNew(query, language);
    }

    private async searchPlacesNew(query: string, language?: string): Promise<GeocodeResult[]> {
        try {
            const { AutocompleteSessionToken, AutocompleteSuggestion } = await window.google.maps.importLibrary("places") as any;

            const token = new AutocompleteSessionToken();
            const userLanguage = language || navigator.language.split('-')[0];
            const request = {
                input: query,
                sessionToken: token,
                includedPrimaryTypes: ['establishment', 'street_address', 'premise'],
                language: userLanguage
            }; const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

            const results = suggestions.map((suggestion: any) => ({
                address: suggestion.placePrediction.text.toString(),
                latitude: 0,
                longitude: 0,
                placeName: suggestion.placePrediction.structuredFormat?.mainText?.toString() || '',
                placeId: suggestion.placePrediction.placeId
            }));

            return results;
        } catch (error) {
            console.warn('AutocompleteSuggestion error:', error);
            return [];
        }
    }

    async getPlaceDetails(placeId: string, language?: string): Promise<GeocodeResult | null> {
        if (!this.isGoogleMapsLoaded) {
            await this.initializeGoogleMaps();
        }

        if (!window.google?.maps || !placeId) {
            return null;
        }

        return this.getPlaceDetailsNew(placeId, language);
    }

    private async getPlaceDetailsNew(placeId: string, language?: string): Promise<GeocodeResult | null> {
        try {
            const { Place } = await window.google.maps.importLibrary("places") as any;

            const userLanguage = language || navigator.language.split('-')[0];
            const place = new Place({
                id: placeId,
                requestedLanguage: userLanguage
            });

            await place.fetchFields({
                fields: ['displayName', 'formattedAddress', 'location', 'id']
            });

            if (place.location) {
                return {
                    address: place.formattedAddress || '',
                    latitude: place.location.lat(),
                    longitude: place.location.lng(),
                    placeName: place.displayName || '',
                    placeId: place.id
                };
            }

            console.warn('Place has no location');
            return null;
        } catch (error) {
            console.warn('Place API error:', error);
            return null;
        }
    }

    validateLocation(location: Partial<TaskLocation>): location is TaskLocation {
        return !!(
            location.address &&
            typeof location.latitude === 'number' &&
            typeof location.longitude === 'number' &&
            !isNaN(location.latitude) &&
            !isNaN(location.longitude) &&
            location.latitude >= -90 &&
            location.latitude <= 90 &&
            location.longitude >= -180 &&
            location.longitude <= 180
        );
    }

    formatLocationDisplay(location: TaskLocation): string {
        if (location.placeName && location.placeName !== location.address) {
            return `${location.placeName} - ${location.address}`;
        }
        return location.address;
    }

    calculateDistance(
        location1: { latitude: number; longitude: number },
        location2: { latitude: number; longitude: number }
    ): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(location2.latitude - location1.latitude);
        const dLon = this.toRadians(location2.longitude - location1.longitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(location1.latitude)) *
            Math.cos(this.toRadians(location2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    get isAvailable(): boolean {
        return this.isGoogleMapsLoaded && !!window.google?.maps;
    }
}

declare global {
    interface Window {
        google?: any;
        initGoogleMaps?: () => void;
    }
}

export const geolocationService = new GeolocationService();