import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
  message: string;
  emission: {
    id: number;
    category: string;
    subcategory?: string;
    quantity: number;
    unit: string;
    co2Emissions: number;
    emissionFactor?: number;
    calculationMethod?: string;
    confidence?: string;
    date: string;
    description?: string;
    department?: string;
  };
  co2Emissions: number;
  emissionFactor?: number;
  calculationMethod?: string;
  confidence?: string;
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
  estimatedSavings?: number;
  difficulty?: string;
  explanation?: string;
  source?: string;
}

export interface CompletedTip {
  id?: number;
  userId?: number;
  tipId: number;
  completedAt: string;
  estimatedSavings: number;
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

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('carbonSense_token');
          localStorage.removeItem('carbonSense_user');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/auth') {
            window.location.href = '/login';
          }
        }
        
        // Log errors for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.error('[API Error]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/signup', userData);
    return response.data;
  }

  async addEmission(emission: EmissionRequest): Promise<EmissionResponse> {
    const response = await this.api.post<EmissionResponse>('/emissions/add', emission);
    return response.data;
  }

  async updateEmission(emissionId: number, emission: EmissionRequest): Promise<EmissionResponse> {
    const response = await this.api.put<EmissionResponse>(`/emissions/${emissionId}`, emission);
    return response.data;
  }

  async deleteEmission(emissionId: number): Promise<void> {
    await this.api.delete(`/emissions/${emissionId}`);
  }

  async getEmissionCalculation(startDate?: string, endDate?: string, category?: string): Promise<EmissionCalculation> {
    const response = await this.api.get<EmissionCalculation>('/emissions/calculate', {
      params: { startDate, endDate, category }
    });
    return response.data;
  }

  async getEmissionHistory(startDate?: string, endDate?: string): Promise<EmissionHistory[]> {
    const response = await this.api.get('/emissions/history', {
      params: { startDate, endDate }
    });
    return response.data.history || response.data;
  }

  async getEmissionsList(startDate?: string, endDate?: string, category?: string, limit?: number): Promise<any[]> {
    const response = await this.api.get('/emissions/list', {
      params: { startDate, endDate, category, limit }
    });
    return response.data.emissions || response.data;
  }

  async getEmissionsSummary(startDate?: string, endDate?: string): Promise<any> {
    const response = await this.api.get('/emissions/summary', {
      params: { 
        startDate, 
        endDate,
        _t: Date.now() // Cache busting parameter
      }
    });
    return response.data;
  }

  async createGoal(goal: Goal): Promise<Goal> {
    const response = await this.api.post<Goal>('/goals', goal);
    return response.data;
  }

  async getGoals(): Promise<Goal[]> {
    const response = await this.api.get<any>('/goals');
    return response.data.goals || response.data;
  }

  async updateGoal(goalId: number, goalData: Partial<Goal>): Promise<void> {
    await this.api.put(`/goals/${goalId}`, goalData);
  }

  async deleteGoal(goalId: number): Promise<void> {
    await this.api.delete(`/goals/${goalId}`);
  }

  async getGoalProgress(goalId: number): Promise<any> {
    const response = await this.api.get(`/goals/${goalId}/progress`);
    return response.data;
  }

  async updateProfile(profileData: any): Promise<void> {
    await this.api.put('/profile', profileData);
  }

  async getTips(category?: string): Promise<Tip[]> {
    console.log('[API Service] Fetching tips with category:', category);
    const response = await this.api.get<Tip[]>('/tips', { params: { category } });
    console.log('[API Service] Tips response:', {
      status: response.status,
      dataLength: response.data?.length || 0,
      data: response.data
    });
    return response.data;
  }

  async getCompletedTips(): Promise<CompletedTip[]> {
    const response = await this.api.get<CompletedTip[]>('/tips/completed');
    return response.data;
  }

  async markTipCompleted(tipId: number, estimatedSavings: number): Promise<CompletedTip> {
    const response = await this.api.post<CompletedTip>('/tips/complete', { 
      tipId, 
      estimatedSavings 
    });
    return response.data;
  }

  async unmarkTipCompleted(tipId: number): Promise<void> {
    await this.api.delete(`/tips/complete/${tipId}`);
  }

  async getPersonalizedTips(): Promise<any> {
    const response = await this.api.get('/tips/personalized');
    return response.data;
  }

  async generateReport(reportData: ReportRequest): Promise<any> {
    const response = await this.api.post('/reports/generate', reportData);
    return response.data;
  }

  async getUserProfile(): Promise<any> {
    const response = await this.api.get('/user/profile');
    return response.data;
  }
  async getDashboardData(): Promise<DashboardData> {
    // Get actual user emissions and data instead of dummy endpoint
    const [emissions, goals] = await Promise.all([
      this.getEmissionHistory(),
      this.getGoals()
    ]);

    const totalEmissions = emissions.reduce((sum, item) => sum + item.emissions, 0);
    const monthlyEmissions = emissions.length > 0 ? emissions[emissions.length - 1]?.emissions || 0 : 0;

    // Calculate categories from actual emission data
    const categories: Record<string, number> = {};
    const emissionsList = await this.getEmissionsList();
    
    emissionsList.forEach(emission => {
      const category = emission.category || 'other';
      categories[category] = (categories[category] || 0) + (emission.co2Emissions || 0);
    });

    return {
      totalEmissions,
      monthlyEmissions,
      categories,
      history: emissions,
      goals: goals
        .filter((goal: any) => {
          // Only include active goals
          const goalStatus = goal.status || 'active';
          return goalStatus === 'active';
        })
        .map((goal: any) => {
          // Handle both camelCase and snake_case from API
          const goalName = goal.goalName || goal.goal_name || 'Unnamed Goal';
          const currentValue = parseFloat(goal.currentValue || goal.current_value || 0);
          const targetValue = parseFloat(goal.targetValue || goal.target_value || 1);
          
          const progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
          
          return {
            id: goal.id || 0,
            name: goalName,
            progress: Math.min(Math.max(progress, 0), 100), // Cap between 0-100%
            target: targetValue
          };
        })
    };
  }

  async getCategoryBreakdown(timeRange: string): Promise<any> {
    const response = await this.api.get('/analytics/category-breakdown', {
      params: { timeRange }
    });
    return response.data;
  }

  async getMonthlyComparison(timeRange: string): Promise<any> {
    const response = await this.api.get('/analytics/monthly-comparison', {
      params: { timeRange }
    });
    return response.data;
  }

  async getYearlyTrends(): Promise<any> {
    const response = await this.api.get('/analytics/yearly-trends');
    return response.data;
  }

  async getPeakAnalysis(timeRange: string): Promise<any> {
    const response = await this.api.get('/analytics/peak-analysis', {
      params: { timeRange }
    });
    return response.data;
  }

  async exportReport(format: string, timeRange: string): Promise<any> {
    const response = await this.api.get('/analytics/export', {
      params: { format, timeRange },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }

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
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value);
      }).join(','))
    ];
    
    return csvRows.join('\n');
  }
}

export const apiService = new ApiService();

export const authAPI = {
  login: (credentials: LoginRequest) => apiService.login(credentials),
  signup: (userData: SignupRequest) => apiService.signup(userData),
};

export const emissionsAPI = {
  add: (emission: EmissionRequest) => apiService.addEmission(emission),
  update: (emissionId: number, emission: EmissionRequest) => apiService.updateEmission(emissionId, emission),
  delete: (emissionId: number) => apiService.deleteEmission(emissionId),
  history: (startDate?: string, endDate?: string) => 
    apiService.getEmissionHistory(startDate, endDate),
  list: (startDate?: string, endDate?: string, category?: string, limit?: number) => 
    apiService.getEmissionsList(startDate, endDate, category, limit),
  summary: (startDate?: string, endDate?: string) =>
    apiService.getEmissionsSummary(startDate, endDate),
};

export const goalsAPI = {
  create: (goal: Goal) => apiService.createGoal(goal),
  list: () => apiService.getGoals(),
  update: (goalId: number, goalData: Partial<Goal>) => apiService.updateGoal(goalId, goalData),
  delete: (goalId: number) => apiService.deleteGoal(goalId),
  getProgress: (goalId: number) => apiService.getGoalProgress(goalId),
};

export const tipsAPI = {
  get: (category?: string) => apiService.getTips(category),
  getCompleted: () => apiService.getCompletedTips(),
  markCompleted: (tipId: number, estimatedSavings: number) => 
    apiService.markTipCompleted(tipId, estimatedSavings),
  unmarkCompleted: (tipId: number) => apiService.unmarkTipCompleted(tipId),
  getPersonalized: () => apiService.getPersonalizedTips(),
};

export const reportsAPI = {
  generate: (reportData: ReportRequest) => apiService.generateReport(reportData),
};

export const userAPI = {
  profile: () => apiService.getUserProfile(),
  updateProfile: (profileData: any) => apiService.updateProfile(profileData),
};

export const dashboardAPI = {
  getData: () => apiService.getDashboardData(),
  getCategoryBreakdown: (timeRange: string) => apiService.getCategoryBreakdown(timeRange),
  getMonthlyComparison: (timeRange: string) => apiService.getMonthlyComparison(timeRange),
  getYearlyTrends: () => apiService.getYearlyTrends(),
  getPeakAnalysis: (timeRange: string) => apiService.getPeakAnalysis(timeRange),
  exportReport: (format: string, timeRange: string) => apiService.exportReport(format, timeRange),
};

export default apiService;
