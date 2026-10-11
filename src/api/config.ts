import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenService } from '../services/security/TokenService';
import { sslPinningService } from '../services/security/SSLPinningService';
import { Platform } from 'react-native';

// Inicializar configuraciones de seguridad de bajo nivel (Pinning)
sslPinningService.initializePinning();

const getApiUrl = (envVar: string | undefined, name: string): string => {
  if (!envVar) {
    if (__DEV__) {
      console.warn(`WARNING: ${name} is missing. Usando la IP local de prueba.`);
      return name === 'EXPO_PUBLIC_PILGRIM_API_URL' ? 'http://192.168.1.7:8000/api' : 'http://192.168.1.7:8101';
    } else {
      throw new Error(`CRITICAL: Environment variable ${name} is required in production.`);
    }
  }
  
  if (__DEV__ && Platform.OS === 'android' && envVar.includes('localhost')) {
    console.warn(`WARNING: Android emulators cannot connect to localhost. Use 10.0.2.2 or your machine's IP for ${name}.`);
  }
  
  return envVar;
};

export const PILGRIM_API_URL = getApiUrl(process.env.EXPO_PUBLIC_PILGRIM_API_URL, 'EXPO_PUBLIC_PILGRIM_API_URL');
export const USER_API_URL = getApiUrl(process.env.EXPO_PUBLIC_USER_API_URL, 'EXPO_PUBLIC_USER_API_URL');

class HttpClient {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }

  private setupInterceptors() {
    // Interceptor de Request: Adjunta el Token de Acceso
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await tokenService.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
            const refreshToken = await tokenService.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Petición para obtener un nuevo token (Endpoint asimilado)
            const response = await axios.post(`${this.instance.defaults.baseURL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: new_refresh_token } = response.data;
            
            await tokenService.setAccessToken(access_token);
            if (new_refresh_token) {
              await tokenService.setRefreshToken(new_refresh_token);
            }

            this.onRefreshed(access_token);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.instance(originalRequest);

          } catch (refreshError) {
            // Falló el refresh token (sesión expirada por completo)
            await tokenService.clearTokens();
            // Aquí se podría despachar un evento global para cerrar sesión en la UI
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

// Mantenemos la compatibilidad con el código actual exportando la instancia directa de axios
export const pilgrimApi = pilgrimApiClient.getInstance();
export const userApi = userApiClient.getInstance();
