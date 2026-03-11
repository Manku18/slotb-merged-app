import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface NearbyLocation {
    id: string;
    name: string;
    address: string;
    distance: string;
    latitude: number;
    longitude: number;
}

interface LocationContextType {
    userLocation: string;
    coords: { latitude: number; longitude: number } | null;
    isLocating: boolean;
    refreshLocation: () => Promise<void>;
    setDistrict: (district: string, lat?: number, lon?: number) => void;
    searchLocations: (query: string) => Promise<NearbyLocation[]>;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userLocation, setUserLocation] = useState('Locating...');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocating, setIsLocating] = useState(true);

    const setDistrict = (district: string, lat?: number, lon?: number) => {
        setUserLocation(district);
        if (lat !== undefined && lon !== undefined) {
            setCoords({ latitude: lat, longitude: lon });
        }
    };

    const searchLocations = async (query: string): Promise<NearbyLocation[]> => {
        if (!query || query.length < 3) return [];
        try {
            // Using Nominatim for fast, single-request search
            // Prioritizing Bihar and India
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&countrycodes=in`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'SlotB-App' }
            });
            const data = await response.json();

            if (data && Array.isArray(data)) {
                return data.map((item: any, i: number) => {
                    const addr = item.address;
                    const name = item.display_name.split(',')[0];

                    const addressParts = [
                        addr.suburb || addr.neighbourhood,
                        addr.district || addr.county || addr.city_district,
                        addr.city || addr.town || addr.village,
                        addr.state,
                        'India'
                    ].filter(Boolean);

                    const fullAddress = [...new Set(addressParts)].join(', ');

                    return {
                        id: `osm_${item.place_id}_${i}`,
                        name: name,
                        address: fullAddress,
                        distance: 'Location',
                        latitude: parseFloat(item.lat),
                        longitude: parseFloat(item.lon),
                    };
                });
            }
            return [];
        } catch (e) {
            console.warn('Search Error:', e);
            return [];
        }
    };

    const refreshLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocation('Patna, BR (Default)');
                setCoords({ latitude: 25.5941, longitude: 85.1376 });
                setIsLocating(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            const lat = location.coords.latitude;
            const lon = location.coords.longitude;
            setCoords({ latitude: lat, longitude: lon });

            let [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (addr) {
                setUserLocation(`${addr.city || addr.subregion}, ${addr.region || 'BR'}`);
            } else {
                setUserLocation('Patna, BR');
            }
        } catch (e) {
            console.warn('Location Error:', e);
            setUserLocation('Patna, BR');
            setCoords({ latitude: 25.5941, longitude: 85.1376 });
        } finally {
            setIsLocating(false);
        }
    };

    useEffect(() => {
        refreshLocation();
    }, []);

    return (
        <LocationContext.Provider value={{
            userLocation,
            coords,
            isLocating,
            refreshLocation,
            setDistrict,
            searchLocations
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
