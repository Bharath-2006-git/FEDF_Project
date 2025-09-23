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
      if (this.isDevelopment) {
        return dummyData;
      }
      throw error;
    }
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

  // Analytics API methods
  async getMonthlyComparison(timeRange: string): Promise<any> {
    return this.apiCall(
      () => this.api.get(`/analytics/monthly-comparison?range=${timeRange}`),
      {
        data: [
          { month: 'Jan', current: 280, previous: 320, change: -12.5 },
          { month: 'Feb', current: 310, previous: 340, change: -8.8 },
          { month: 'Mar', current: 290, previous: 350, change: -17.1 },
          { month: 'Apr', current: 340, previous: 380, change: -10.5 },
          { month: 'May', current: 320, previous: 360, change: -11.1 },
          { month: 'Jun', current: 300, previous: 330, change: -9.1 }
        ]
      },
      'Failed to get monthly comparison'
    );
  }

  async getCategoryBreakdown(timeRange: string): Promise<any> {
    return this.apiCall(
      () => this.api.get(`/analytics/category-breakdown?range=${timeRange}`),
      {
        data: [
          { category: 'Electricity', value: 450.3, percentage: 36, trend: -5.2 },
          { category: 'Travel', value: 380.7, percentage: 30, trend: 2.1 },
          { category: 'Fuel', value: 250.1, percentage: 20, trend: -8.5 },
          { category: 'Waste', value: 169.4, percentage: 14, trend: -1.3 }
        ]
      },
      'Failed to get category breakdown'
    );
  }

  async getYearlyTrends(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/analytics/yearly-trends'),
      {
        data: [
          { year: '2022', emissions: 4200, goals: 4000, achieved: false },
          { year: '2023', emissions: 3800, goals: 3500, achieved: false },
          { year: '2024', emissions: 3200, goals: 3400, achieved: true },
          { year: '2025', emissions: 2800, goals: 3000, achieved: true }
        ]
      },
      'Failed to get yearly trends'
    );
  }

  async getPeakAnalysis(timeRange: string): Promise<any> {
    return this.apiCall(
      () => this.api.get(`/analytics/peak-analysis?range=${timeRange}`),
      {
        data: {
          highestDay: { date: '2025-08-15', value: 45.8 },
          lowestDay: { date: '2025-07-22', value: 8.2 },
          averageDaily: 23.7
        }
      },
      'Failed to get peak analysis'
    );
  }

  async exportReport(format: string, timeRange: string): Promise<any> {
    return this.apiCall(
      () => this.api.get(`/analytics/export?format=${format}&range=${timeRange}`, {
        responseType: 'blob'
      }),
      new Blob(['dummy,data\n1,2\n3,4'], { type: 'text/csv' }),
      'Failed to export report'
    );
  }

  // Achievements API methods
  async getUserAchievements(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/achievements/user'),
      {
        data: [
          {
            id: 1,
            achievementType: 'goal_completed',
            title: 'Goal Crusher',
            description: 'Complete your first emission reduction goal',
            badgeIcon: 'trophy',
            unlockedAt: '2025-08-15T10:30:00Z',
            isUnlocked: true
          },
          {
            id: 2,
            achievementType: 'streak',
            title: 'Consistency Champion',
            description: 'Log emissions for 7 consecutive days',
            badgeIcon: 'flame',
            unlockedAt: '2025-08-20T14:15:00Z',
            isUnlocked: true
          },
          {
            id: 3,
            achievementType: 'reduction',
            title: 'Carbon Cutter',
            description: 'Reduce monthly emissions by 20%',
            badgeIcon: 'trending-down',
            progress: 15,
            maxProgress: 20,
            isUnlocked: false
          },
          {
            id: 4,
            achievementType: 'milestone',
            title: 'First Steps',
            description: 'Log your first emission entry',
            badgeIcon: 'star',
            unlockedAt: '2025-07-01T09:00:00Z',
            isUnlocked: true
          }
        ]
      },
      'Failed to get user achievements'
    );
  }

  async getAchievementStats(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/achievements/stats'),
      {
        data: {
          totalAchievements: 12,
          unlockedAchievements: 6,
          currentStreak: 14,
          longestStreak: 28,
          totalPoints: 850,
          rank: 'Gold',
          nextRankPoints: 1000
        }
      },
      'Failed to get achievement stats'
    );
  }

  // Notifications API methods
  async getNotifications(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/notifications/list'),
      {
        data: [
          {
            id: 1,
            type: 'reminder',
            message: 'Don\'t forget to log your daily emissions!',
            isRead: false,
            scheduledFor: '2025-09-23T09:00:00Z',
            createdAt: '2025-09-23T09:00:00Z',
            priority: 'medium'
          },
          {
            id: 2,
            type: 'milestone',
            message: 'Congratulations! You\'ve achieved your monthly reduction goal of 15%',
            isRead: true,
            scheduledFor: '2025-09-20T10:30:00Z',
            createdAt: '2025-09-20T10:30:00Z',
            priority: 'high'
          },
          {
            id: 3,
            type: 'tip',
            message: 'Tip of the day: Switch to LED bulbs to save up to 75% on lighting energy',
            isRead: false,
            scheduledFor: '2025-09-22T08:00:00Z',
            createdAt: '2025-09-22T08:00:00Z',
            priority: 'low'
          },
          {
            id: 4,
            type: 'alert',
            message: 'Your emissions this week are 25% higher than last week',
            isRead: false,
            scheduledFor: '2025-09-21T16:00:00Z',
            createdAt: '2025-09-21T16:00:00Z',
            priority: 'high'
          }
        ]
      },
      'Failed to get notifications'
    );
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.apiCall(
      () => this.api.put(`/notifications/${notificationId}/read`),
      undefined,
      'Failed to mark notification as read'
    );
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.apiCall(
      () => this.api.put('/notifications/read-all'),
      undefined,
      'Failed to mark all notifications as read'
    );
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.apiCall(
      () => this.api.delete(`/notifications/${notificationId}`),
      undefined,
      'Failed to delete notification'
    );
  }

  async getNotificationSettings(): Promise<any> {
    return this.apiCall(
      () => this.api.get('/notifications/settings'),
      {
        data: {
          emailNotifications: true,
          pushNotifications: true,
          dailyReminders: true,
          weeklyReports: true,
          goalDeadlines: true,
          achievements: true,
          tips: true,
          emissionAlerts: true,
          reminderTime: '09:00',
          reportDay: 'monday'
        }
      },
      'Failed to get notification settings'
    );
  }

  async updateNotificationSettings(settings: any): Promise<void> {
    await this.apiCall(
      () => this.api.put('/notifications/settings', settings),
      undefined,
      'Failed to update notification settings'
    );
  }

  private calculateDummyCO2(category: string, quantity: number, unit: string): number {
    const emissionFactors: Record<string, Record<string, number>> = {
      electricity: { 'kWh': 0.233, 'MWh': 233 },
      fuel: { 'gallons': 8.887, 'liters': 2.347, 'kg': 3.15 },
      travel: { 'miles': 0.404, 'km': 0.251 },
      waste: { 'kg': 0.5, 'tons': 500 }
    };

    const categoryFactors = emissionFactors[category.toLowerCase()] || { [unit]: 1 };
    const factor = categoryFactors[unit.toLowerCase()] || 1;
    
    return quantity * factor;
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
  getMonthlyComparison: (timeRange: string) => apiService.getMonthlyComparison(timeRange),
  getCategoryBreakdown: (timeRange: string) => apiService.getCategoryBreakdown(timeRange),
  getYearlyTrends: () => apiService.getYearlyTrends(),
  getPeakAnalysis: (timeRange: string) => apiService.getPeakAnalysis(timeRange),
  exportReport: (format: string, timeRange: string) => apiService.exportReport(format, timeRange),
  getUserAchievements: () => apiService.getUserAchievements(),
  getAchievementStats: () => apiService.getAchievementStats(),
  getNotifications: () => apiService.getNotifications(),
  markNotificationRead: (id: number) => apiService.markNotificationRead(id),
  markAllNotificationsRead: () => apiService.markAllNotificationsRead(),
  deleteNotification: (id: number) => apiService.deleteNotification(id),
  getNotificationSettings: () => apiService.getNotificationSettings(),
  updateNotificationSettings: (settings: any) => apiService.updateNotificationSettings(settings),
};

export default apiService;
