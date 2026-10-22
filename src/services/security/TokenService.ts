import * as SecureStore from 'expo-secure-store';

export interface ITokenService {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearTokens(): Promise<void>;
}

export class TokenService implements ITokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  public async getAccessToken(): Promise<string | null> {
    const directToken = await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
    if (directToken) return directToken;
    return await SecureStore.getItemAsync('token');
  }

  public async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, token);
    await SecureStore.setItemAsync('token', token);
  }

  public async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
  }

  public async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, token);
  }

  public async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('token');
  }
}

export const tokenService = new TokenService();
