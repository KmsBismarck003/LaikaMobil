import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { tokenService } from '../services/security/TokenService';
import { sslPinningService } from '../services/security/SSLPinningService';

// Inicializar configuraciones de seguridad de bajo nivel (Pinning)
sslPinningService.initializePinning();

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
export const pilgrimApiClient = new HttpClient(
  process.env.EXPO_PUBLIC_PILGRIM_API_URL || 'http://localhost:8000/api/v1'
);
export const userApiClient = new HttpClient(
  process.env.EXPO_PUBLIC_USER_API_URL || 'http://localhost:8101'
);

// Mantenemos la compatibilidad con el código actual exportando la instancia directa de axios
export const pilgrimApi = pilgrimApiClient.getInstance();
export const userApi = userApiClient.getInstance();
