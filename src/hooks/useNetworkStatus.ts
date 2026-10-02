import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    // Suscribirse a cambios en la red
    const unsubscribe = NetInfo.addEventListener(state => {
      // isConnected = si está conectado a ALGO (Wifi, 4G, etc)
      // isInternetReachable = si ese "algo" realmente tiene salida a internet (ping exitoso)
      setIsConnected(state.isConnected);
      
      // En simuladores isInternetReachable puede tardar en resolverse,
      // pero en dispositivos físicos es muy confiable.
      setIsInternetReachable(state.isInternetReachable ?? state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Consideramos que está offline si isConnected es false explícitamente,
  // o si está conectado a un WiFi falso sin salida a internet (isInternetReachable = false).
  // Solo devolvemos false si estamos 100% seguros de que NO hay internet para evitar falsos positivos.
  const isOffline = (isConnected === false || isInternetReachable === false);

  return {
    isOffline,
    isConnected,
    isInternetReachable,
  };
};
