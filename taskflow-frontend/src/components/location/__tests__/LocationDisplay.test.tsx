import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import LocationDisplay from '../LocationDisplay';
import { geolocationService } from '../../../services/geolocationService';

vi.mock('../../../services/geolocationService');

const mockLocation = { address: '123 Main St', placeName: 'Home', latitude: 40, longitude: -74 };

describe('LocationDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete (window as any).google;
    });

    it('renders null when no location', () => {
        const { container } = render(<LocationDisplay location={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders location without map', () => {
        render(<LocationDisplay location={mockLocation} showMap={false} />);
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    it('renders map when showMap is true', async () => {
        const mockMap = { setCenter: vi.fn() };
        const mockMarker = { addListener: vi.fn() };
        (window as any).google = {
            maps: {
                Map: vi.fn(() => mockMap),
                importLibrary: vi.fn().mockResolvedValue({ AdvancedMarkerElement: vi.fn(() => mockMarker) }),
                InfoWindow: vi.fn()
            }
        };
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();

        render(<LocationDisplay location={mockLocation} showMap={true} />);
        await waitFor(() => expect(geolocationService.initializeGoogleMaps).toHaveBeenCalled());
    });

    it('shows error when maps not available', async () => {
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();
        render(<LocationDisplay location={mockLocation} showMap={true} />);
        await waitFor(() => screen.getByText(/not available/i));
    });

    it('handles map initialization error', async () => {
        vi.mocked(geolocationService.initializeGoogleMaps).mockRejectedValue(new Error('Map error'));
        render(<LocationDisplay location={mockLocation} showMap={true} />);
        await waitFor(() => screen.getByText(/Error loading map/i));
    });

    it('renders interactive map with info window', async () => {
        const mockMap = { setCenter: vi.fn() };
        const mockMarker = { addListener: vi.fn() };
        const mockInfoWindow = { open: vi.fn() };
        (window as any).google = {
            maps: {
                Map: vi.fn(() => mockMap),
                importLibrary: vi.fn().mockResolvedValue({ AdvancedMarkerElement: vi.fn(() => mockMarker) }),
                InfoWindow: vi.fn(() => mockInfoWindow)
            }
        };
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();

        render(<LocationDisplay location={mockLocation} showMap={true} interactive={true} />);
        await waitFor(() => expect(mockMarker.addListener).toHaveBeenCalledWith('click', expect.any(Function)));

        const clickHandler = mockMarker.addListener.mock.calls[0][1];
        clickHandler();
        expect(mockInfoWindow.open).toHaveBeenCalledWith(mockMap, mockMarker);
    });

    it('updates map center when location changes', async () => {
        const mockMap = { setCenter: vi.fn() };
        (window as any).google = {
            maps: {
                Map: vi.fn(() => mockMap),
                importLibrary: vi.fn().mockResolvedValue({ AdvancedMarkerElement: vi.fn() })
            }
        };
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();

        const { rerender } = render(<LocationDisplay location={mockLocation} showMap={true} />);
        await waitFor(() => expect(mockMap.setCenter).toHaveBeenCalled());

        const newLocation = { ...mockLocation, latitude: 50, longitude: -80 };
        rerender(<LocationDisplay location={newLocation} showMap={true} />);
        await waitFor(() => expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 50, lng: -80 }));
    });

    it('handles error during map creation after initialization', async () => {
        (window as any).google = { maps: { Map: vi.fn(() => { throw new Error('Map creation failed'); }) } };
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();

        render(<LocationDisplay location={mockLocation} showMap={true} />);
        await waitFor(() => screen.getByText(/Error loading map/i));
    });

    it('renders map with location without placeName', async () => {
        const locationNoPlaceName = { address: '456 Oak Ave', latitude: 41, longitude: -75 };
        const mockMap = { setCenter: vi.fn() };
        const mockMarker = { addListener: vi.fn() };
        const mockInfoWindow = { open: vi.fn() };
        (window as any).google = {
            maps: {
                Map: vi.fn(() => mockMap),
                importLibrary: vi.fn().mockResolvedValue({ AdvancedMarkerElement: vi.fn(() => mockMarker) }),
                InfoWindow: vi.fn(() => mockInfoWindow)
            }
        };
        vi.mocked(geolocationService.initializeGoogleMaps).mockResolvedValue();

        render(<LocationDisplay location={locationNoPlaceName} showMap={true} interactive={true} />);
        await waitFor(() => expect(mockMarker.addListener).toHaveBeenCalled());
    });
});
