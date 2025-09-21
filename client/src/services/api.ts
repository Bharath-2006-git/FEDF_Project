import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'individual' | 'company' | 'admin';
  companyName?: string;
  companyDepartment?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyName?: string;
    companyDepartment?: string;
  };
}

export interface EmissionRequest {
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  date: string;
  description?: string;
  department?: string;
}

export interface EmissionResponse {
  status: string;
  emission: number;
  data: any;
}

export interface EmissionCalculation {
  totalEmissions: number;
  categories: Record<string, number>;
}

export interface EmissionHistory {
  date: string;
  emissions: number;
}

export interface Goal {
  id?: number;
  goalName: string;
  goalType: string;
  targetValue: number;
  currentValue?: number;
  targetDate: string;
  status?: string;
  category?: string;
}

export interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  targetRole: string;
  impactLevel: string;
}

export interface ReportRequest {
  reportType: string;
  startDate: string;
  endDate: string;
}

export interface DashboardData {
  totalEmissions: number;
  monthlyEmissions: number;
  categories: Record<string, number>;
  history: EmissionHistory[];
  goals: Array<{
    id: number;
    name: string;
    progress: number;
    target: number;
  }>;
}

class ApiService {
  private api: AxiosInstance;
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('carbonSense_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('carbonSense_token');
          localStorage.removeItem('carbonSense_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API calls with fallback to dummy data
  private async apiCall<T>(
    apiCall: () => Promise<AxiosResponse<T>>,
    dummyData: T,
    errorMessage: string = 'API call failed'
  ): Promise<T> {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      console.warn(`${errorMessage}, using dummy data:`, error);
      
      // In development, return dummy data as fallback
      if (this.isDevelopment) {
        return dummyData;
      }
      
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================
  
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/signup', userData);
    return response.data;
  }

  // ==================== EMISSIONS ====================
  
  async addEmission(emission: EmissionRequest): Promise<EmissionResponse> {
    return this.apiCall(
      () => this.api.post<EmissionResponse>('/emissions/add', emission),
      {
        status: 'success',
        emission: this.calculateDummyCO2(emission.category, emission.quantity, emission.unit),
        data: { id: Math.random(), ...emission }
      },
      'Failed to add emission'
    );
  }

  async getEmissionCalculation(startDate?: string, endDate?: string, category?: string): Promise<EmissionCalculation> {
    return this.apiCall(
      () => this.api.get<EmissionCalculation>('/emissions/calculate', {
        params: { startDate, endDate, category }
      }),
      {
        totalEmissions: 1250.5,
        categories: {
          electricity: 450.3,
          travel: 380.7,
          fuel: 250.1,
          waste: 169.4
        }
      },
      'Failed to calculate emissions'
    );
  }

  async getEmissionHistory(startDate?: string, endDate?: string): Promise<EmissionHistory[]> {
    return this.apiCall(
      () => this.api.get<EmissionHistory[]>('/emissions/history', {
        params: { startDate, endDate }
      }),
      [
        { date: "2025-01", emissions: 280 },
        { date: "2025-02", emissions: 310 },
        { date: "2025-03", emissions: 290 },
        { date: "2025-04", emissions: 340 },
        { date: "2025-05", emissions: 320 }
      ],
      'Failed to get emission history'
    );
  }

  async getEmissionsList(startDate?: string, endDate?: string): Promise<any[]> {
    return this.apiCall(
      () => this.api.get<any[]>('/emissions/list', {
        params: { startDate, endDate }
      }),
      [
        {
          id: 1,
          category: 'electricity',
          quantity: 250,
          unit: 'kWh',
          co2Emissions: 58.25,
          date: '2025-09-15',
          description: 'Monthly electricity bill'
        },
        {
          id: 2,
          category: 'travel',
          quantity: 50,
          unit: 'miles',
          co2Emissions: 20.2,
          date: '2025-09-14',
          description: 'Daily commute'
        }
      ],
      'Failed to get emissions list'
    );
  }

  // ==================== GOALS ====================
  
  async createGoal(goal: Goal): Promise<Goal> {
    return this.apiCall(
      () => this.api.post<Goal>('/goals/create', goal),
      { id: Math.random(), ...goal, currentValue: 0, status: 'active' },
      'Failed to create goal'
    );
  }

  async getGoals(): Promise<Goal[]> {
    return this.apiCall(
      () => this.api.get<Goal[]>('/goals/list'),
      [
        {
          id: 1,
          goalName: 'Reduce electricity by 20%',
          goalType: 'reduction_percentage',
          targetValue: 20,
          currentValue: 12,
          targetDate: '2025-12-31',
          status: 'active',
          category: 'electricity'
        },
        {
          id: 2,
          goalName: 'Switch to electric vehicle',
          goalType: 'absolute_target',
          targetValue: 1,
          currentValue: 0,
          targetDate: '2025-06-30',
          status: 'active',
          category: 'travel'
        }
      ],
      'Failed to get goals'
    );
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<void> {
    await this.apiCall(
      () => this.api.put(`/goals/${goalId}/progress`, { currentValue }),
      undefined,
      'Failed to update goal progress'
    );
  }

  // ==================== TIPS ====================
  
  async getTips(category?: string): Promise<Tip[]> {
    return this.apiCall(
      () => this.api.get<Tip[]>('/tips', { params: { category } }),
      [
        {
          id: 1,
          title: 'Switch to LED bulbs',
          content: 'LED bulbs use 75% less energy and last 25 times longer than incandescent bulbs.',
          category: 'energy',
          targetRole: 'individual',
          impactLevel: 'medium'
        },
        {
          id: 2,
          title: 'Use public transportation',
          content: 'Taking public transport can reduce your carbon footprint by up to 45% compared to driving.',
          category: 'transport',
          targetRole: 'individual',
          impactLevel: 'high'
        },
        {
          id: 3,
          title: 'Implement recycling program',
          content: 'A comprehensive recycling program can reduce company waste by 50-80%.',
          category: 'waste',
          targetRole: 'company',
          impactLevel: 'high'
        }
      ],
      'Failed to get tips'
    );
  }

  // ==================== REPORTS ====================
  
  async generateReport(reportData: ReportRequest): Promise<any> {
    return this.apiCall(
      () => this.api.post('/reports/generate', reportData),
      {
        message: 'Report generated successfully',
        reportData: {
          reportType: reportData.reportType,
          period: { startDate: reportData.startDate, endDate: reportData.endDate },
          totalEmissions: 1250.5,
          categories: {
            electricity: 450.3,
            travel: 380.7,
            fuel: 250.1,
            waste: 169.4
          },
          generatedAt: new Date().toISOString()
        },
        downloadUrl: `/reports/dummy_${reportData.reportType}_${Date.now()}.json`
      },
      'Failed to generate report'
    );
  }

  // ==================== USER PROFILE ====================
  
  async getUserProfile(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/user/profile'),
      {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'individual',
        createdAt: '2025-01-01T00:00:00Z'
      },
      'Failed to get user profile'
    );
  }

  // ==================== DASHBOARD ====================
  
  async getDashboardData(): Promise<DashboardData> {
    return this.apiCall(
      () => this.api.get<DashboardData>('/dummy/dashboard'),
      {
        totalEmissions: 1250.5,
        monthlyEmissions: 320.2,
        categories: {
          electricity: 450.3,
          travel: 380.7,
          fuel: 250.1,
          waste: 169.4
        },
        history: [
          { date: "2025-01", emissions: 280 },
          { date: "2025-02", emissions: 310 },
          { date: "2025-03", emissions: 290 },
          { date: "2025-04", emissions: 340 },
          { date: "2025-05", emissions: 320 }
        ],
        goals: [
          { id: 1, name: "Reduce by 20%", progress: 65, target: 100 },
          { id: 2, name: "Electric vehicle", progress: 30, target: 100 }
        ]
      },
      'Failed to get dashboard data'
    );
  }

  // ==================== UTILITY METHODS ====================
  
  private calculateDummyCO2(category: string, quantity: number, unit: string): number {
    const emissionFactors: Record<string, Record<string, number>> = {
      electricity: { 'kWh': 0.233 },
      travel: { 'miles': 0.404, 'km': 0.251 },
      fuel: { 'liters': 2.31, 'gallons': 8.74 },
      waste: { 'kg': 0.5 },
      production: { 'units': 1.5 },
      logistics: { 'km': 0.1 }
    };

    const factor = emissionFactors[category]?.[unit] || 1;
    return quantity * factor;
  }

  // Export data to CSV format
  exportToCSV(data: any[], filename: string): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();

// Export individual service methods for easier importing
export const authAPI = {
  login: (credentials: LoginRequest) => apiService.login(credentials),
  signup: (userData: SignupRequest) => apiService.signup(userData),
};

export const emissionsAPI = {
  add: (emission: EmissionRequest) => apiService.addEmission(emission),
  calculate: (startDate?: string, endDate?: string, category?: string) => 
    apiService.getEmissionCalculation(startDate, endDate, category),
  history: (startDate?: string, endDate?: string) => 
    apiService.getEmissionHistory(startDate, endDate),
  list: (startDate?: string, endDate?: string) => 
    apiService.getEmissionsList(startDate, endDate),
};

export const goalsAPI = {
  create: (goal: Goal) => apiService.createGoal(goal),
  list: () => apiService.getGoals(),
  updateProgress: (goalId: number, currentValue: number) => 
    apiService.updateGoalProgress(goalId, currentValue),
};

export const tipsAPI = {
  get: (category?: string) => apiService.getTips(category),
};

export const reportsAPI = {
  generate: (reportData: ReportRequest) => apiService.generateReport(reportData),
};

export const userAPI = {
  profile: () => apiService.getUserProfile(),
};

export const dashboardAPI = {
  getData: () => apiService.getDashboardData(),
};

export default apiService;