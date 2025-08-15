// src/services/api.ts
import { Platform } from 'react-native';

// Configuration
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:5050/api',
        android: 'http://10.0.2.2:5050/api',
        default: 'http://192.168.11.58:5050/api',
      })
    : 'https://your-production-domain.com/api',
  
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 500,
};

// Types for the new symptom structure - matching your API exactly
interface Intake {
  id: number;
  medicationId: number;
  scheduledTime: string;
  actualTime: string;
  medication: string;
}

interface Medication {
  id: number;
  name: string;
  intervalHours: number;
  totalDays: number;
  quantityMg: number;
  treatmentId: number | null;
  stageId: number;
  stage: string | null;
  intakes: Intake[] | null;
}

interface Stage {
  id: number;
  name: string;
  symptomId: number;
  symptom: string;
  medication: Medication[];
}

interface Symptom {
  id: number;
  name: string;
  isActive: boolean;
  stages: Stage[];
}

// Partial types for form handling
interface PartialMedication {
  id?: number;
  name: string;
  intervalHours: number;
  totalDays: number;
  quantityMg: number;
  treatmentId?: number | null;
  stageId?: number;
  stage?: string | null;
  intakes?: Intake[] | null;
}

interface PartialStage {
  id?: number;
  name: string;
  symptomId?: number;
  symptom?: string;
  medication: PartialMedication[] | null;
}

interface PartialSymptom {
  id?: number;
  name: string;
  isActive: boolean;
  stages: PartialStage[] | null;
}

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Helper method to handle timeouts
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
      ),
    ]);
  }

  // Helper method for retries
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1) {
        console.log(`API call failed, retrying... (${attempts - 1} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  // Main request method
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.TIMEOUT,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`[API] ${method} ${url}`);
    if (body) {
      console.log(`[API] Request body:`, body);
    }

    try {
      const response = await this.withRetry(() =>
        this.withTimeout(fetch(url, config), timeout)
      );

      console.log(`[API] Response: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[API] HTTP Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      // Handle empty responses (like DELETE)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      const data = await response.json();
      console.log(`[API] Response data:`, data);
      return data;
    } catch (error) {
      console.error(`[API] Error:`, error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods matching your Swagger endpoints exactly
  
  // Symptom endpoints
  getSymptoms(): Promise<Symptom[]> {
    return this.get<Symptom[]>('/symptoms');
  }

  getSymptom(id: number): Promise<Symptom> {
    return this.get<Symptom>(`/symptoms/${id}`);
  }

  createSymptom(symptom: PartialSymptom): Promise<Symptom> {
    return this.post<Symptom>('/symptoms', symptom);
  }

  updateSymptom(id: number, symptom: PartialSymptom): Promise<Symptom> {
    return this.put<Symptom>(`/symptoms/${id}`, symptom);
  }

  deleteSymptom(id: number): Promise<any> {
    return this.delete(`/symptoms/${id}`);
  }

  // Medication endpoints - matching your exact API
  getMedicationsByStage(stageId: number): Promise<Medication[]> {
    return this.get<Medication[]>(`/Medication/stage/${stageId}`);
  }

  getMedication(id: number): Promise<Medication> {
    return this.get<Medication>(`/Medication/${id}`);
  }

  createMedication(medication: PartialMedication): Promise<Medication> {
    return this.post<Medication>('/Medication', medication);
  }

  updateMedication(id: number, medication: PartialMedication): Promise<Medication> {
    return this.put<Medication>(`/Medication/${id}`, medication);
  }

  deleteMedication(id: number): Promise<any> {
    return this.delete(`/Medication/${id}`);
  }

  // Stage management
  createStage(stage: PartialStage): Promise<Stage> {
    return this.post<Stage>('/stages', stage);
  }

  updateStage(id: number, stage: PartialStage): Promise<Stage> {
    return this.put<Stage>(`/stages/${id}`, stage);
  }

  deleteStage(id: number): Promise<any> {
    return this.delete(`/stages/${id}`);
  }

  // Intake management
  createIntake(intake: Partial<Intake>): Promise<Intake> {
    return this.post<Intake>('/intakes', intake);
  }

  updateIntake(id: number, intake: Partial<Intake>): Promise<Intake> {
    return this.put<Intake>(`/intakes/${id}`, intake);
  }

  deleteIntake(id: number): Promise<any> {
    return this.delete(`/intakes/${id}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/symptoms');
      return true;
    } catch (error) {
      console.log('[API] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { 
  ApiResponse, 
  Symptom, 
  Stage, 
  Medication, 
  Intake,
  PartialSymptom,
  PartialStage,
  PartialMedication
};