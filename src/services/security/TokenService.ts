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
    return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
  }

  public async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, token);
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
  }
}

export const tokenService = new TokenService();
