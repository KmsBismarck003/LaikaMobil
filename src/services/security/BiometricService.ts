import * as LocalAuthentication from 'expo-local-authentication';

export interface IBiometricService {
  isBiometricAvailable(): Promise<boolean>;
  authenticateUser(promptMessage: string): Promise<boolean>;
}

export class BiometricService implements IBiometricService {
  /**
   * Verifica si el dispositivo soporta y tiene configurada la biometría
   */
  public async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error verificando biometría:', error);
      return false;
    }
  }

  /**
   * Ejecuta el prompt nativo para autenticar al usuario
   */
  public async authenticateUser(promptMessage: string = 'Autenticación requerida para continuar'): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        // Fallback: Si no hay biometría, permitimos el paso o pedimos PIN
        // En una app real, podríamos requerir la contraseña nuevamente.
        return true; 
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Usar PIN',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      return false;
    }
  }
}

// Exportamos una instancia única (Singleton) por simplicidad, 
// o se podría inyectar mediante un contenedor de dependencias (DI).
export const biometricService = new BiometricService();
