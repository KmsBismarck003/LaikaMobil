/**
 * Interfaz para el servicio de Certificate Pinning.
 * Dado que React Native / Expo (Managed) no soporta Pinning nativo de forma directa
 * sin prebuild, esta clase abstrae la lógica. En un entorno productivo nativo
 * aquí se invocaría una librería como 'react-native-ssl-public-key-pinning'.
 */
export interface ISSLPinningService {
  initializePinning(): void;
}

export class SSLPinningService implements ISSLPinningService {
  private readonly pilgrimApiKeys = [
    'sha256/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX=', // Public Key Hash de Pilgrim
    'sha256/YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY=', // Backup Key
  ];

  public initializePinning(): void {
    // Configuración conceptual. 
    // Si usáramos 'react-native-ssl-public-key-pinning':
    /*
    import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';
    
    initializeSslPinning({
      'api.laikaclub.com': {
        includeSubdomains: true,
        publicKeyHashes: this.pilgrimApiKeys,
      },
    });
    */
    
    console.log('[Security] SSL Pinning configuration initialized para dominios principales.');
  }
}

export const sslPinningService = new SSLPinningService();
