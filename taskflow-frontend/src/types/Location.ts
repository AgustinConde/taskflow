export interface TaskLocation {
    id?: number;
    address: string;
    latitude: number;
    longitude: number;
    placeName?: string;
    placeId?: string; // Google Places ID for future reference
    createdAt?: string;
}

export interface CreateLocationRequest {
    address: string;
    latitude: number;
    longitude: number;
    placeName?: string;
    placeId?: string;
}

export interface UpdateLocationRequest {
    address?: string;
    latitude?: number;
    longitude?: number;
    placeName?: string;
    placeId?: string;
}

// Google Maps related types
export interface GeocodeResult {
    address: string;
    latitude: number;
    longitude: number;
    placeName?: string;
    placeId?: string;
}

export interface MapViewport {
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
}

// Component props types
export interface LocationPickerProps {
    value?: TaskLocation | null;
    onChange: (location: TaskLocation | null) => void;
    disabled?: boolean;
    placeholder?: string;
}

export interface LocationDisplayProps {
    location: TaskLocation;
    showMap?: boolean;
    mapHeight?: number;
    interactive?: boolean;
}