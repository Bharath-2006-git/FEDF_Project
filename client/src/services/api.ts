﻿import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
    date: string;
    description?: string;
    department?: string;
  };
  co2Emissions: number;
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
        if (error.response?.status === 401) {
          localStorage.removeItem('carbonSense_token');
          localStorage.removeItem('carbonSense_user');
          window.location.href = '/login';
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

  async calculateEmission(category: string, quantity: number, unit: string, subcategory?: string): Promise<any> {
    const response = await this.api.get('/emissions/calculate', {
      params: { category, quantity, unit, subcategory }
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
      params: { startDate, endDate }
    });
    return response.data;
  }

  async createGoal(goal: Goal): Promise<Goal> {
    const response = await this.api.post<Goal>('/goals', goal);
    return response.data;
  }

  async getGoals(): Promise<Goal[]> {
    const response = await this.api.get<Goal[]>('/goals');
    return response.data;
  }

  async updateGoalProgress(goalId: number, currentValue: number): Promise<void> {
    await this.api.put(`/goals/${goalId}/progress`, { currentValue });
  }

  async getTips(category?: string): Promise<Tip[]> {
    const response = await this.api.get<Tip[]>('/tips', { params: { category } });
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
      goals: goals.map(goal => ({
        id: goal.id || 0,
        name: goal.goalName,
        progress: ((goal.currentValue || 0) / goal.targetValue) * 100,
        target: goal.targetValue
      }))
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

  async getUserAchievements(): Promise<any> {
    const response = await this.api.get('/achievements/user');
    return response.data;
  }

  async getAchievementStats(): Promise<any> {
    const response = await this.api.get('/achievements/stats');
    return response.data;
  }

  async getNotifications(): Promise<any> {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async getNotificationSettings(): Promise<any> {
    const response = await this.api.get('/notifications/settings');
    return response.data;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.put('/notifications/read-all');
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.api.delete(`/notifications/${notificationId}`);
  }

  async updateNotificationSettings(settings: any): Promise<void> {
    await this.api.put('/notifications/settings', settings);
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
  calculate: (category: string, quantity: number, unit: string, subcategory?: string) => 
    apiService.calculateEmission(category, quantity, unit, subcategory),
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
  updateProgress: (goalId: number, currentValue: number) => 
    apiService.updateGoalProgress(goalId, currentValue),
};

export const tipsAPI = {
  get: () => apiService.getTips(),
};

export const reportsAPI = {
  generate: (reportData: ReportRequest) => apiService.generateReport(reportData),
};

export const userAPI = {
  profile: () => apiService.getUserProfile(),
};

export const dashboardAPI = {
  getData: () => apiService.getDashboardData(),
  getCategoryBreakdown: (timeRange: string) => apiService.getCategoryBreakdown(timeRange),
  getMonthlyComparison: (timeRange: string) => apiService.getMonthlyComparison(timeRange),
  getYearlyTrends: () => apiService.getYearlyTrends(),
  getPeakAnalysis: (timeRange: string) => apiService.getPeakAnalysis(timeRange),
  exportReport: (format: string, timeRange: string) => apiService.exportReport(format, timeRange),
  getUserAchievements: () => apiService.getUserAchievements(),
  getAchievementStats: () => apiService.getAchievementStats(),
  getNotifications: () => apiService.getNotifications(),
  getNotificationSettings: () => apiService.getNotificationSettings(),
  markNotificationRead: (notificationId: number) => apiService.markNotificationRead(notificationId),
  markAllNotificationsRead: () => apiService.markAllNotificationsRead(),
  deleteNotification: (notificationId: number) => apiService.deleteNotification(notificationId),
  updateNotificationSettings: (settings: any) => apiService.updateNotificationSettings(settings),
};

export default apiService;
