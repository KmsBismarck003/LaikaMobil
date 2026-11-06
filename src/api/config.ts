import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenService } from '../services/security/TokenService';
import { sslPinningService } from '../services/security/SSLPinningService';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inicializar configuraciones de seguridad de bajo nivel (Pinning)
sslPinningService.initializePinning();

const ASYNC_STORAGE_OVERRIDE_KEY = '@laika_custom_api_url';

// URL Oficial de Pilgrim API Gateway en Producción (Azure Cloud HTTPS)
export const PRODUCTION_PILGRIM_URL = 'https://laikaclub-nzhwq8.southcentralus.cloudapp.azure.com/api';

/**
 * Obtiene dinámicamente la IP de la máquina donde se ejecuta Expo / Metro bundler.
 * Cuando el celular se conecta a Expo en la misma red Wi-Fi, Constants.expoConfig?.hostUri
 * contiene la IP real asignada por el router actual (ej: "192.168.1.15:8081" o "10.0.0.4:8081").
 */
export const getAutoDetectedHost = (): string => {
  try {
    const hostUri = Constants.expoConfig?.hostUri 
      || Constants.manifest2?.extra?.expoClient?.hostUri 
      || (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && !ip.includes('exp.direct')) {
        return ip;
      }
    }
  } catch {
    // Silencioso en caso de error
  }
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const resolveApiUrl = (envVar: string | undefined, name: string): string => {
  // Soporte defensivo para EXPO_PUBLIC_ y compatibilidad con VITE_
  const candidate = envVar || (process.env as any).VITE_PILGRIM_API_URL || '';
  const cleanVar = candidate ? candidate.trim() : '';

  // 1. Descartar túneles obsoletos o caídos (loca.lt, ngrok, localtunnel)
  if (cleanVar.includes('loca.lt') || cleanVar.includes('ngrok') || cleanVar.includes('localtunnel')) {
    if (__DEV__) {
      console.log(`⚠️ [Network] Descartando túnel temporal (${cleanVar}). Apuntando a Azure: ${PRODUCTION_PILGRIM_URL}`);
    }
    return PRODUCTION_PILGRIM_URL;
  }

  // 2. Si se especificó una URL explícita (Producción HTTPS u host configurado)
  if (cleanVar && cleanVar.toLowerCase() !== 'auto') {
    const normalized = cleanVar.endsWith('/api') ? cleanVar : `${cleanVar.replace(/\/+$/, '')}/api`;
    if (__DEV__) {
      console.log(`🌐 [Network URL] ${name} configurada a: ${normalized}`);
    }
    return normalized;
  }

  // 3. Si se solicitó "auto" explícitamente y estamos en modo desarrollo (__DEV__)
  if (__DEV__ && cleanVar.toLowerCase() === 'auto') {
    const autoHost = getAutoDetectedHost();
    if (autoHost && autoHost !== 'localhost' && autoHost !== '10.0.2.2') {
      const lanUrl = `http://${autoHost}:8000/api`;
      console.log(`📡 [Network Auto-Detect LAN] ${name} configurada dinámicamente a: ${lanUrl}`);
      return lanUrl;
    }
  }

  // 4. Producción oficial canónica (Azure Cloud con HTTPS)
  if (__DEV__) {
    console.log(`🚀 [Network Production Gateway] ${name} conectada a: ${PRODUCTION_PILGRIM_URL}`);
  }
  return PRODUCTION_PILGRIM_URL;
};

export const PILGRIM_API_URL = resolveApiUrl(process.env.EXPO_PUBLIC_PILGRIM_API_URL, 'EXPO_PUBLIC_PILGRIM_API_URL');
export const USER_API_URL = process.env.EXPO_PUBLIC_USER_API_URL 
  ? resolveApiUrl(process.env.EXPO_PUBLIC_USER_API_URL, 'EXPO_PUBLIC_USER_API_URL') 
  : PILGRIM_API_URL;

class HttpClient {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true', // Permite que localtunnel y túneles pasen peticiones API sin pantallas intermedias
      },
    });

    this.setupInterceptors();
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }

  public setBaseURL(newUrl: string) {
    this.instance.defaults.baseURL = newUrl;
  }

  private setupInterceptors() {
    // Interceptor de Request: Adjunta el Token de Acceso
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        let token = await tokenService.getAccessToken();
        if (!token) {
          try {
            const { getCurrentToken } = require('../store/AuthStore');
            token = getCurrentToken();
          } catch {
            // Ignorar si AuthStore no está disponible aún
          }
        }
        if (!token) {
          try {
            token = await AsyncStorage.getItem('@laika_auth_token');
          } catch {}
        }
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Asegurar encabezado bypass en cada petición
        if (config.headers) {
          config.headers['bypass-tunnel-reminder'] = 'true';
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de Response: Maneja expiración de Token (401)
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Failover automático: Solo si se estaba usando un túnel temporal caído (localtunnel / ngrok),
        // y detectamos la IP local de la computadora por Wi-Fi, conmutar en caliente a la red local
        if (
          __DEV__ &&
          originalRequest &&
          !originalRequest._retry &&
          (!error.response || error.response.status === 502 || error.response.status === 503 || error.code === 'ERR_NETWORK')
        ) {
          const currentBase = this.instance.defaults.baseURL || '';
          const isTemporaryTunnel = currentBase.includes('loca.lt') || currentBase.includes('ngrok') || currentBase.includes('localtunnel');
          const autoHost = getAutoDetectedHost();
          const localBase = `http://${autoHost}:8000/api`;

          if (isTemporaryTunnel && autoHost && autoHost !== 'localhost' && autoHost !== '10.0.2.2') {
            console.warn(`🔄 [Network Auto-Failover] Túnel temporal caído (${error.message}). Conmutando en caliente a LAN: ${localBase}`);
            originalRequest._retry = true;
            this.setBaseURL(localBase);
            originalRequest.baseURL = localBase;
            return this.instance(originalRequest);
          }
        }

        // Si el error es 401 y no hemos intentado refrescar ya la misma petición
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Si ya estamos refrescando, ponemos la petición en cola
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.instance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            let activeToken = await tokenService.getAccessToken();
            if (!activeToken) {
              try {
                const { getCurrentToken } = require('../store/AuthStore');
                activeToken = getCurrentToken();
              } catch {}
            }
            if (!activeToken) {
              activeToken = await AsyncStorage.getItem('@laika_auth_token');
            }

            if (!activeToken) {
              this.isRefreshing = false;
              return Promise.reject(error);
            }

            // Renovación mediante el endpoint /auth/refresh con Bearer token
            const response = await axios.post(
              `${this.instance.defaults.baseURL}/auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${activeToken}`,
                  'bypass-tunnel-reminder': 'true',
                },
              }
            );

            const newToken = response.data.token || response.data.access_token;
            if (!newToken) {
              this.isRefreshing = false;
              return Promise.reject(error);
            }

            await tokenService.setAccessToken(newToken);
            await AsyncStorage.setItem('@laika_auth_token', newToken);

            try {
              const { setCurrentUser, getCurrentUser } = require('../store/AuthStore');
              const usr = getCurrentUser();
              if (usr) {
                await setCurrentUser(usr, newToken);
              }
            } catch {}

            this.onRefreshed(newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }
}

// Instanciamos los clientes y los exportamos para ser usados en la aplicación
export const pilgrimApiClient = new HttpClient(PILGRIM_API_URL);
export const userApiClient = new HttpClient(USER_API_URL);

// Exportamos la instancia directa de axios para compatibilidad total
export const pilgrimApi = pilgrimApiClient.getInstance();
export const userApi = userApiClient.getInstance();

/**
 * Prueba la conectividad hacia el API Gateway Pilgrim (vía /health).
 */
export const checkApiHealth = async (customUrl?: string): Promise<{ ok: boolean; status?: number; latencyMs?: number; message?: string }> => {
  const targetBase = (customUrl || pilgrimApi.defaults.baseURL || PILGRIM_API_URL).trim();
  const startTime = Date.now();
  try {
    const cleanUrl = targetBase.replace(/\/+$/, '');
    const testEndpoint = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/api/health`;
    
    const response = await axios.get(testEndpoint, {
      timeout: 6000,
      headers: { 'bypass-tunnel-reminder': 'true' }
    });
    
    const latencyMs = Date.now() - startTime;
    return { ok: response.status >= 200 && response.status < 400, status: response.status, latencyMs, message: 'En línea y respondiendo' };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      ok: false,
      latencyMs,
      message: error.response ? `HTTP ${error.response.status}` : (error.message || 'Sin conexión al servidor')
    };
  }
};

/**
 * Permite cambiar dinámicamente la URL de la API en caliente desde la aplicación móvil.
 */
export const setCustomApiUrl = async (newUrl: string): Promise<void> => {
  let normalized = newUrl.trim();
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  pilgrimApiClient.setBaseURL(normalized);
  userApiClient.setBaseURL(normalized);
  await AsyncStorage.setItem(ASYNC_STORAGE_OVERRIDE_KEY, normalized);
  console.log(`✅ [Network] URL de API actualizada a: ${normalized}`);
};

/**
 * Restaura la URL de la API al valor por defecto (Producción Azure HTTPS).
 */
export const resetToDefaultApiUrl = async (): Promise<void> => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_OVERRIDE_KEY);
  pilgrimApiClient.setBaseURL(PILGRIM_API_URL);
  userApiClient.setBaseURL(USER_API_URL);
  console.log(`🔄 [Network] URL de API restaurada a valor oficial: ${PILGRIM_API_URL}`);
};

/**
 * Inicializa y valida la URL de API activa.
 * Purga automáticamente cualquier URL obsoleta, túnel previo (loca.lt / ngrok) o IP local
 * que haya quedado en el AsyncStorage del dispositivo para garantizar que la app
 * se conecte de forma inmediata y estable a Pilgrim en Azure.
 */
export const initStoredApiUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(ASYNC_STORAGE_OVERRIDE_KEY);
    if (saved) {
      if (
        saved !== PRODUCTION_PILGRIM_URL ||
        saved.includes('loca.lt') ||
        saved.includes('ngrok') ||
        saved.includes('192.168.') ||
        saved.includes('10.0.') ||
        saved.includes('localhost') ||
        saved.includes('127.0.0.1')
      ) {
        await AsyncStorage.removeItem(ASYNC_STORAGE_OVERRIDE_KEY);
        console.log(`🧹 [Network] URL previa obsoleta purgada de AsyncStorage (${saved}).`);
      } else {
        pilgrimApiClient.setBaseURL(saved);
        userApiClient.setBaseURL(saved);
        console.log(`📦 [Network] URL de API cargada desde almacenamiento: ${saved}`);
        return saved;
      }
    }
  } catch {
    // Silencioso
  }
  pilgrimApiClient.setBaseURL(PILGRIM_API_URL);
  userApiClient.setBaseURL(USER_API_URL);
  return PILGRIM_API_URL;
};

// Cargar URL guardada de inmediato
initStoredApiUrl();
