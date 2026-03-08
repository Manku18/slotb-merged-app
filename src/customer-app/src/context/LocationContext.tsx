import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
    userLocation: string;
    coords: { latitude: number; longitude: number } | null;
    isLocating: boolean;
    refreshLocation: () => Promise<void>;
    setDistrict: (district: string) => void;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userLocation, setUserLocation] = useState('Locating...');
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLocating, setIsLocating] = useState(true);

    const setDistrict = (district: string) => {
        setUserLocation(district);
    };

    const refreshLocation = async () => {
        setIsLocating(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocation('Patna, BR (Default)');
                setCoords({ latitude: 25.5941, longitude: 85.1376 }); // Patna
                setIsLocating(false);
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            let [addr] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
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
        <LocationContext.Provider value={{ userLocation, coords, isLocating, refreshLocation, setDistrict }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
