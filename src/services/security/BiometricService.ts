import * as LocalAuthentication from 'expo-local-authentication';

export interface IBiometricService {
  isBiometricAvailable(): Promise<boolean>;
  authenticateUser(promptMessage: string): Promise<boolean>;
}

export class BiometricService implements IBiometricService {
  /**
   * Verifica si el dispositivo soporta y tiene configurada la biometría o seguridad (PIN/Contraseña/Patrón)
   */
  public async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
      return (hasHardware && isEnrolled) || securityLevel > LocalAuthentication.SecurityLevel.NONE;
    } catch (error) {
      console.error('Error verificando biometría/seguridad del dispositivo:', error);
      return false;
    }
  }

  /**
   * Ejecuta el prompt nativo para autenticar al usuario con huella, rostro o PIN/contraseña del sistema
   */
  public async authenticateUser(promptMessage: string = 'Autenticación requerida para continuar'): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        // Fallback: Si el dispositivo no tiene biometría ni método de bloqueo configurado, permitimos el paso
        return true; 
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Usar PIN / Contraseña',
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
