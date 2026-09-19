import { getDefaultBaseUrl } from '../constants/api';
import StorageService from './storage';

class ApiClient {
  private customBaseUrl: string | null = null;
  private defaultTimeout = 15000;

  public setCustomBaseUrl(url: string | null) {
    this.customBaseUrl = url;
  }

  public async getBaseUrl(): Promise<string> {
    if (this.customBaseUrl && !this.customBaseUrl.includes('10.0.2.2')) {
      return this.customBaseUrl;
    }
    const stored = await StorageService.getApiUrl();
    if (stored && stored.trim().length > 0 && !stored.includes('10.0.2.2')) {
      return stored.trim();
    }
    if (stored && stored.includes('10.0.2.2')) {
      await StorageService.clearApiUrl();
    }
    return getDefaultBaseUrl();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await StorageService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async requestWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.defaultTimeout);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your network connection.');
      }
      throw error;
    }
  }

  private async handleResponse(response: Response): Promise<any> {
    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (response.ok) {
      return data;
    }

    let errorMessage = 'An error occurred';
    if (data && typeof data === 'object') {
      errorMessage = data.detail || data.message || errorMessage;
    } else if (response.statusText) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  public async get(endpoint: string): Promise<any> {
    const baseUrl = await this.getBaseUrl();
    const headers = await this.getHeaders();
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await this.requestWithTimeout(url, {
        method: 'GET',
        headers,
      });
      return await this.handleResponse(response);
    } catch (e: any) {
      console.log(`GET ${url} failed:`, e.message);
      throw e;
    }
  }

  public async post(endpoint: string, body?: any): Promise<any> {
    const baseUrl = await this.getBaseUrl();
    const headers = await this.getHeaders();
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await this.requestWithTimeout(url, {
        method: 'POST',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse(response);
    } catch (e: any) {
      console.log(`POST ${url} failed:`, e.message);
      throw e;
    }
  }

  public async put(endpoint: string, body?: any): Promise<any> {
    const baseUrl = await this.getBaseUrl();
    const headers = await this.getHeaders();
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await this.requestWithTimeout(url, {
        method: 'PUT',
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return await this.handleResponse(response);
    } catch (e: any) {
      console.log(`PUT ${url} failed:`, e.message);
      throw e;
    }
  }

  public async delete(endpoint: string): Promise<any> {
    const baseUrl = await this.getBaseUrl();
    const headers = await this.getHeaders();
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await this.requestWithTimeout(url, {
        method: 'DELETE',
        headers,
      });
      return await this.handleResponse(response);
    } catch (e: any) {
      console.log(`DELETE ${url} failed:`, e.message);
      throw e;
    }
  }
}

export const api = new ApiClient();
export default api;
