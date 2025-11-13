import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geolocationService } from '../geolocationService';

describe('geolocationService', () => {
    beforeEach(() => {
        vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
        delete (window as any).google;
        delete (window as any).initGoogleMaps;
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(s => s.remove());
    });

    describe('validateLocation', () => {
        it('validates correct location', () => {
            expect(geolocationService.validateLocation({ address: 'Test', latitude: 40, longitude: -74 })).toBe(true);
        });

        it('rejects invalid latitude', () => {
            expect(geolocationService.validateLocation({ address: 'Test', latitude: 100, longitude: 0 })).toBe(false);
        });

        it('rejects invalid longitude', () => {
            expect(geolocationService.validateLocation({ address: 'Test', latitude: 0, longitude: 200 })).toBe(false);
        });

        it('rejects missing address', () => {
            expect(geolocationService.validateLocation({ latitude: 0, longitude: 0 })).toBe(false);
        });

        it('rejects NaN coordinates', () => {
            expect(geolocationService.validateLocation({ address: 'Test', latitude: NaN, longitude: 0 })).toBe(false);
        });
    });

    describe('formatLocationDisplay', () => {
        it('formats with different placeName', () => {
            expect(geolocationService.formatLocationDisplay({
                address: '123 Main St', placeName: 'Home', latitude: 0, longitude: 0
            })).toBe('Home - 123 Main St');
        });

        it('formats with same placeName', () => {
            expect(geolocationService.formatLocationDisplay({
                address: '123 Main St', placeName: '123 Main St', latitude: 0, longitude: 0
            })).toBe('123 Main St');
        });
    });

    describe('calculateDistance', () => {
        it('calculates distance between two points', () => {
            const dist = geolocationService.calculateDistance(
                { latitude: 40.7128, longitude: -74.0060 },
                { latitude: 34.0522, longitude: -118.2437 }
            );
            expect(dist).toBeGreaterThan(3900);
            expect(dist).toBeLessThan(4000);
        });
    });

    describe('getCurrentLocation', () => {
        it('returns null when geolocation unavailable', async () => {
            const geo = global.navigator.geolocation;
            (global.navigator as any).geolocation = undefined;
            const result = await geolocationService.getCurrentLocation();
            expect(result).toBeNull();
            (global.navigator as any).geolocation = geo;
        });

        it('gets current position', async () => {
            const mockGeo = {
                getCurrentPosition: vi.fn((success) => success({ coords: { latitude: 40, longitude: -74 } }))
            };
            (global.navigator as any).geolocation = mockGeo;
            const result = await geolocationService.getCurrentLocation();
            expect(result).toEqual({ latitude: 40, longitude: -74 });
        });

        it('handles geolocation error', async () => {
            const mockGeo = {
                getCurrentPosition: vi.fn((_, error) => error())
            };
            (global.navigator as any).geolocation = mockGeo;
            const result = await geolocationService.getCurrentLocation();
            expect(result).toBeNull();
        });
    });

    describe('initializeGoogleMaps', () => {
        it('returns early if already loaded', async () => {
            (geolocationService as any).isGoogleMapsLoaded = true;
            await geolocationService.initializeGoogleMaps();
            expect(document.querySelectorAll('script[src*="maps.googleapis.com"]').length).toBe(0);
            (geolocationService as any).isGoogleMapsLoaded = false;
        });

        it('warns when no API key', async () => {
            vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const newService = new (geolocationService.constructor as any)();
            await newService.initializeGoogleMaps();
            expect(consoleWarn).toHaveBeenCalledWith('Google Maps API key not configured. Location features will be limited.');
            consoleWarn.mockRestore();
        });

        it('uses existing google.maps', async () => {
            (window as any).google = { maps: {} };
            await geolocationService.initializeGoogleMaps();
            expect((geolocationService as any).isGoogleMapsLoaded).toBe(true);
        });

        it('waits for existing script to load', async () => {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=test';
            document.head.appendChild(script);

            const promise = geolocationService.initializeGoogleMaps();

            setTimeout(() => {
                (window as any).google = { maps: {} };
            }, 50);

            await promise;
            expect((geolocationService as any).isGoogleMapsLoaded).toBe(true);
        });

        it('handles script load via callback', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const promise = geolocationService.initializeGoogleMaps();
            setTimeout(() => {
                if (window.initGoogleMaps) window.initGoogleMaps();
            }, 50);
            await promise;
            expect((geolocationService as any).isGoogleMapsLoaded).toBe(true);
        });

        it('handles script load error', async () => {
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
            (geolocationService as any).isGoogleMapsLoaded = false;
            const promise = geolocationService.initializeGoogleMaps();
            await vi.waitFor(() => {
                const script = document.querySelector('script[src*="maps.googleapis.com"]');
                return script !== null;
            }, { timeout: 1000 });
            const script = document.querySelector('script[src*="maps.googleapis.com"]');
            if (script) {
                const errorHandler = (script as any).onerror;
                if (errorHandler) errorHandler();
            }
            await promise;
            consoleWarn.mockRestore();
        });

        it('handles loading timeout', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            await geolocationService.initializeGoogleMaps();
            const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
            expect(scripts.length).toBeGreaterThan(0);
        });

        it('handles script onload clearTimeout', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const promise = geolocationService.initializeGoogleMaps();
            await vi.waitFor(() => {
                const script = document.querySelector('script[src*="maps.googleapis.com"]');
                return script !== null;
            }, { timeout: 1000 });
            const script = document.querySelector('script[src*="maps.googleapis.com"]');
            if (script && (script as any).onload) {
                (script as any).onload();
            }
            if (window.initGoogleMaps) window.initGoogleMaps();
            await promise;
            expect((geolocationService as any).isGoogleMapsLoaded).toBe(true);
        });

        it('waits for existing script to load with setInterval', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const existingScript = document.createElement('script');
            existingScript.src = 'https://maps.googleapis.com/maps/api/js?key=test';
            document.head.appendChild(existingScript);

            const promise = geolocationService.initializeGoogleMaps();
            await new Promise(resolve => setTimeout(resolve, 150));
            (window as any).google = { maps: {} };
            await promise;
            expect((geolocationService as any).isGoogleMapsLoaded).toBe(true);
        });
    });

    describe('geocodeAddress', () => {
        it('throws when Google Maps unavailable', async () => {
            await expect(geolocationService.geocodeAddress('Test')).rejects.toThrow('Google Maps API not available');
        });

        it('throws when Google Maps not initialized', async () => {
            (geolocationService as any).isGoogleMapsLoaded = true;
            delete (window as any).google;
            await expect(geolocationService.geocodeAddress('Test')).rejects.toThrow('Google Maps API not available');
        });

        it('calls initializeGoogleMaps when not loaded', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const initSpy = vi.spyOn(geolocationService, 'initializeGoogleMaps').mockResolvedValue();
            (window as any).google = {
                maps: { Geocoder: vi.fn(() => ({ geocode: vi.fn((_, cb) => cb(null, 'ZERO_RESULTS')) })) }
            };
            await geolocationService.geocodeAddress('Test');
            expect(initSpy).toHaveBeenCalled();
            initSpy.mockRestore();
        });

        it('geocodes address successfully', async () => {
            (window as any).google = {
                maps: {
                    Geocoder: vi.fn(() => ({
                        geocode: vi.fn((_, cb) => cb([{
                            formatted_address: '123 Main St',
                            geometry: { location: { lat: () => 40, lng: () => -74 } },
                            name: 'Home',
                            place_id: 'id123'
                        }], 'OK'))
                    }))
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.geocodeAddress('Test');
            expect(result).toEqual({
                address: '123 Main St', latitude: 40, longitude: -74, placeName: 'Home', placeId: 'id123'
            });
        });

        it('returns null on geocode failure', async () => {
            (window as any).google = {
                maps: { Geocoder: vi.fn(() => ({ geocode: vi.fn((_, cb) => cb(null, 'ERROR')) })) }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.geocodeAddress('Invalid');
            expect(result).toBeNull();
        });
    });

    describe('reverseGeocode', () => {
        it('throws when Google Maps not initialized', async () => {
            (geolocationService as any).isGoogleMapsLoaded = true;
            delete (window as any).google;
            await expect(geolocationService.reverseGeocode(40, -74)).rejects.toThrow('Google Maps API not available');
        });

        it('calls initializeGoogleMaps when not loaded', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const initSpy = vi.spyOn(geolocationService, 'initializeGoogleMaps').mockResolvedValue();
            (window as any).google = {
                maps: { Geocoder: vi.fn(() => ({ geocode: vi.fn((_, cb) => cb(null, 'ZERO_RESULTS')) })) }
            };
            await geolocationService.reverseGeocode(40, -74);
            expect(initSpy).toHaveBeenCalled();
            initSpy.mockRestore();
        });

        it('reverse geocodes coordinates', async () => {
            (window as any).google = {
                maps: {
                    Geocoder: vi.fn(() => ({
                        geocode: vi.fn((_, cb) => cb([{
                            formatted_address: '123 Main St',
                            name: 'Home',
                            place_id: 'id123'
                        }], 'OK'))
                    }))
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.reverseGeocode(40, -74);
            expect(result).toEqual({
                address: '123 Main St', latitude: 40, longitude: -74, placeName: 'Home', placeId: 'id123'
            });
        });

        it('returns null on reverse geocode failure', async () => {
            (window as any).google = {
                maps: { Geocoder: vi.fn(() => ({ geocode: vi.fn((_, cb) => cb(null, 'ERROR')) })) }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.reverseGeocode(40, -74);
            expect(result).toBeNull();
        });
    });

    describe('searchPlaces', () => {
        it('returns empty array when Google Maps unavailable', async () => {
            const result = await geolocationService.searchPlaces('test');
            expect(result).toEqual([]);
        });

        it('calls initializeGoogleMaps when not loaded', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            const initSpy = vi.spyOn(geolocationService, 'initializeGoogleMaps').mockResolvedValue();
            await geolocationService.searchPlaces('test');
            expect(initSpy).toHaveBeenCalled();
            initSpy.mockRestore();
        });

        it('searches places successfully', async () => {
            const mockSuggestion = {
                placePrediction: {
                    text: { toString: () => '123 Main St' },
                    structuredFormat: { mainText: { toString: () => 'Main St' } },
                    placeId: 'id123'
                }
            };
            (window as any).google = {
                maps: {
                    importLibrary: vi.fn().mockResolvedValue({
                        AutocompleteSessionToken: vi.fn(),
                        AutocompleteSuggestion: {
                            fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({
                                suggestions: [mockSuggestion]
                            })
                        }
                    })
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.searchPlaces('test', 'en');
            expect(result[0]).toMatchObject({ address: '123 Main St', placeName: 'Main St', placeId: 'id123' });
        });

        it('uses navigator.language when no language provided', async () => {
            const mockSuggestion = {
                placePrediction: {
                    text: { toString: () => 'Test' },
                    structuredFormat: { mainText: { toString: () => 'Test' } },
                    placeId: 'id1'
                }
            };
            (window as any).google = {
                maps: {
                    importLibrary: vi.fn().mockResolvedValue({
                        AutocompleteSessionToken: vi.fn(),
                        AutocompleteSuggestion: {
                            fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({ suggestions: [mockSuggestion] })
                        }
                    })
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            await geolocationService.searchPlaces('test');
            expect(window.google.maps.importLibrary).toHaveBeenCalled();
        });

        it('handles suggestion without mainText', async () => {
            const mockSuggestion = {
                placePrediction: {
                    text: { toString: () => 'Address Only' },
                    structuredFormat: { mainText: undefined },
                    placeId: 'id2'
                }
            };
            (window as any).google = {
                maps: {
                    importLibrary: vi.fn().mockResolvedValue({
                        AutocompleteSessionToken: vi.fn(),
                        AutocompleteSuggestion: {
                            fetchAutocompleteSuggestions: vi.fn().mockResolvedValue({ suggestions: [mockSuggestion] })
                        }
                    })
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.searchPlaces('test');
            expect(result[0].placeName).toBe('');
        });

        it('handles search error', async () => {
            (window as any).google = {
                maps: { importLibrary: vi.fn().mockRejectedValue(new Error('API error')) }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const result = await geolocationService.searchPlaces('test');
            expect(result).toEqual([]);
            expect(consoleWarn).toHaveBeenCalled();
            consoleWarn.mockRestore();
        });
    });

    describe('getPlaceDetails', () => {
        it('returns null when no placeId', async () => {
            const result = await geolocationService.getPlaceDetails('', 'en');
            expect(result).toBeNull();
        });

        it('returns null when Google Maps unavailable', async () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            delete (window as any).google;
            const result = await geolocationService.getPlaceDetails('id123');
            expect(result).toBeNull();
        });

        it('gets place details successfully', async () => {
            const mockPlace = {
                formattedAddress: '123 Main St',
                location: { lat: () => 40, lng: () => -74 },
                displayName: 'Home',
                id: 'id123',
                fetchFields: vi.fn().mockResolvedValue(undefined)
            };
            (window as any).google = {
                maps: {
                    importLibrary: vi.fn().mockResolvedValue({
                        Place: vi.fn(() => mockPlace)
                    })
                }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const result = await geolocationService.getPlaceDetails('id123', 'en');
            expect(result).toEqual({
                address: '123 Main St', latitude: 40, longitude: -74, placeName: 'Home', placeId: 'id123'
            });
        });

        it('returns null when place has no location', async () => {
            const mockPlace = { location: null, fetchFields: vi.fn().mockResolvedValue(undefined) };
            (window as any).google = {
                maps: { importLibrary: vi.fn().mockResolvedValue({ Place: vi.fn(() => mockPlace) }) }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const result = await geolocationService.getPlaceDetails('id123');
            expect(result).toBeNull();
            expect(consoleWarn).toHaveBeenCalledWith('Place has no location');
            consoleWarn.mockRestore();
        });

        it('handles place API error', async () => {
            (window as any).google = {
                maps: { importLibrary: vi.fn().mockRejectedValue(new Error('Place error')) }
            };
            (geolocationService as any).isGoogleMapsLoaded = true;
            const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const result = await geolocationService.getPlaceDetails('id123');
            expect(result).toBeNull();
            expect(consoleWarn).toHaveBeenCalledWith('Place API error:', expect.any(Error));
            consoleWarn.mockRestore();
        });
    });

    describe('isAvailable', () => {
        it('returns true when loaded', () => {
            (window as any).google = { maps: {} };
            (geolocationService as any).isGoogleMapsLoaded = true;
            expect(geolocationService.isAvailable).toBe(true);
        });

        it('returns false when not loaded', () => {
            (geolocationService as any).isGoogleMapsLoaded = false;
            expect(geolocationService.isAvailable).toBe(false);
        });
    });
});
