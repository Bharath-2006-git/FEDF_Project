/**
 * Account Type Definitions and Role-Based Features
 * Comprehensive type system for individual vs organization accounts
 */

export type AccountRole = 'individual' | 'company' | 'admin';

export interface AccountFeatures {
  // Core Features
  emissionTracking: boolean;
  dashboard: boolean;
  goals: boolean;
  reports: boolean;
  analytics: boolean;
  tips: boolean;
  
  // Advanced Features
  departmentTracking: boolean;
  multiUserAccess: boolean;
  teamCollaboration: boolean;
  customReporting: boolean;
  apiAccess: boolean;
  bulkImport: boolean;
  auditTrail: boolean;
  complianceReports: boolean;
  scopeBasedAnalysis: boolean;
  
  // Limits
  maxEmissionsPerMonth: number;
  maxGoals: number;
  maxUsers: number;
  dataRetentionMonths: number;
}

export interface AccountCapabilities {
  role: AccountRole;
  features: AccountFeatures;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  primaryFocus: string[];
  reportingStandards: string[];
  typicalUseCase: string;
}

// Feature Matrix for Different Account Types
export const ACCOUNT_FEATURES: Record<AccountRole, AccountFeatures> = {
  individual: {
    // Core Features
    emissionTracking: true,
    dashboard: true,
    goals: true,
    reports: true,
    analytics: true,
    tips: true,
    
    // Advanced Features
    departmentTracking: false,
    multiUserAccess: false,
    teamCollaboration: false,
    customReporting: false,
    apiAccess: false,
    bulkImport: false,
    auditTrail: false,
    complianceReports: false,
    scopeBasedAnalysis: false,
    
    // Limits
    maxEmissionsPerMonth: 500,
    maxGoals: 10,
    maxUsers: 1,
    dataRetentionMonths: 24
  },
  
  company: {
    // Core Features
    emissionTracking: true,
    dashboard: true,
    goals: true,
    reports: true,
    analytics: true,
    tips: true,
    
    // Advanced Features
    departmentTracking: true,
    multiUserAccess: true,
    teamCollaboration: true,
    customReporting: true,
    apiAccess: true,
    bulkImport: true,
    auditTrail: true,
    complianceReports: true,
    scopeBasedAnalysis: true,
    
    // Limits
    maxEmissionsPerMonth: 10000,
    maxGoals: 100,
    maxUsers: 50,
    dataRetentionMonths: 60
  },
  
  admin: {
    // Core Features
    emissionTracking: true,
    dashboard: true,
    goals: true,
    reports: true,
    analytics: true,
    tips: true,
    
    // Advanced Features
    departmentTracking: true,
    multiUserAccess: true,
    teamCollaboration: true,
    customReporting: true,
    apiAccess: true,
    bulkImport: true,
    auditTrail: true,
    complianceReports: true,
    scopeBasedAnalysis: true,
    
    // Limits
    maxEmissionsPerMonth: Infinity,
    maxGoals: Infinity,
    maxUsers: Infinity,
    dataRetentionMonths: Infinity
  }
};

// Account Capabilities Metadata
export const ACCOUNT_CAPABILITIES: Record<AccountRole, AccountCapabilities> = {
  individual: {
    role: 'individual',
    features: ACCOUNT_FEATURES.individual,
    displayName: 'Individual Account',
    description: 'Track your personal carbon footprint and make sustainable choices',
    icon: '🌱',
    color: 'emerald',
    primaryFocus: ['Personal Lifestyle', 'Home Energy', 'Transportation', 'Diet'],
    reportingStandards: ['Personal Carbon Calculator', 'Household Emissions'],
    typicalUseCase: 'Individuals wanting to understand and reduce their environmental impact'
  },
  
  company: {
    role: 'company',
    features: ACCOUNT_FEATURES.company,
    displayName: 'Organization Account',
    description: 'Comprehensive carbon accounting for businesses and organizations',
    icon: '🏢',
    color: 'blue',
    primaryFocus: ['Operations', 'Supply Chain', 'Facilities', 'Employee Activities'],
    reportingStandards: ['GHG Protocol', 'CDP', 'TCFD', 'SBTi'],
    typicalUseCase: 'Businesses tracking organizational emissions and pursuing sustainability goals'
  },
  
  admin: {
    role: 'admin',
    features: ACCOUNT_FEATURES.admin,
    displayName: 'Administrator Account',
    description: 'Full platform access with administrative privileges',
    icon: '👑',
    color: 'purple',
    primaryFocus: ['System Management', 'User Administration', 'Platform Analytics'],
    reportingStandards: ['All Standards'],
    typicalUseCase: 'Platform administrators and system managers'
  }
};

// Helper function to check if user has access to a feature
export function hasFeature(role: AccountRole, feature: keyof AccountFeatures): boolean {
  return ACCOUNT_FEATURES[role][feature] === true;
}

// Helper function to get feature limit
export function getFeatureLimit(role: AccountRole, limit: keyof Pick<AccountFeatures, 'maxEmissionsPerMonth' | 'maxGoals' | 'maxUsers' | 'dataRetentionMonths'>): number {
  return ACCOUNT_FEATURES[role][limit];
}

// Dashboard metrics configuration per role
export interface DashboardMetric {
  key: string;
  label: string;
  description: string;
  icon: string;
  priority: number;
  format: 'number' | 'percentage' | 'weight' | 'currency';
}

export const DASHBOARD_METRICS: Record<AccountRole, DashboardMetric[]> = {
  individual: [
    {
      key: 'totalEmissions',
      label: 'Total Footprint',
      description: 'Your total carbon emissions',
      icon: 'TrendingUp',
      priority: 1,
      format: 'weight'
    },
    {
      key: 'monthlyEmissions',
      label: 'This Month',
      description: 'Current month emissions',
      icon: 'Calendar',
      priority: 2,
      format: 'weight'
    },
    {
      key: 'topCategory',
      label: 'Biggest Impact',
      description: 'Category with highest emissions',
      icon: 'AlertCircle',
      priority: 3,
      format: 'number'
    },
    {
      key: 'goalProgress',
      label: 'Goal Progress',
      description: 'Progress towards reduction goals',
      icon: 'Target',
      priority: 4,
      format: 'percentage'
    }
  ],
  
  company: [
    {
      key: 'totalEmissions',
      label: 'Total Emissions',
      description: 'Organizational carbon footprint',
      icon: 'Building',
      priority: 1,
      format: 'weight'
    },
    {
      key: 'scope1Emissions',
      label: 'Scope 1',
      description: 'Direct emissions',
      icon: 'Factory',
      priority: 2,
      format: 'weight'
    },
    {
      key: 'scope2Emissions',
      label: 'Scope 2',
      description: 'Energy indirect emissions',
      icon: 'Zap',
      priority: 3,
      format: 'weight'
    },
    {
      key: 'scope3Emissions',
      label: 'Scope 3',
      description: 'Value chain emissions',
      icon: 'Truck',
      priority: 4,
      format: 'weight'
    },
    {
      key: 'departmentBreakdown',
      label: 'By Department',
      description: 'Emissions by department',
      icon: 'Users',
      priority: 5,
      format: 'number'
    },
    {
      key: 'intensityMetric',
      label: 'Emissions Intensity',
      description: 'Emissions per revenue/employee',
      icon: 'TrendingDown',
      priority: 6,
      format: 'number'
    }
  ],
  
  admin: [
    {
      key: 'platformEmissions',
      label: 'Platform Total',
      description: 'All tracked emissions',
      icon: 'Globe',
      priority: 1,
      format: 'weight'
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      description: 'Users with recent activity',
      icon: 'Users',
      priority: 2,
      format: 'number'
    },
    {
      key: 'organizationCount',
      label: 'Organizations',
      description: 'Company accounts',
      icon: 'Building',
      priority: 3,
      format: 'number'
    }
  ]
};

// Report templates per role
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: 'pdf' | 'csv' | 'xlsx';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export const REPORT_TEMPLATES: Record<AccountRole, ReportTemplate[]> = {
  individual: [
    {
      id: 'monthly-summary',
      name: 'Monthly Carbon Summary',
      description: 'Overview of your monthly emissions',
      sections: ['Total Emissions', 'Category Breakdown', 'Trends', 'Tips'],
      format: 'pdf',
      frequency: 'monthly'
    },
    {
      id: 'annual-review',
      name: 'Annual Carbon Review',
      description: 'Comprehensive yearly analysis',
      sections: ['Annual Total', 'Monthly Trends', 'Goals Achievement', 'Recommendations'],
      format: 'pdf',
      frequency: 'annual'
    }
  ],
  
  company: [
    {
      id: 'ghg-inventory',
      name: 'GHG Emissions Inventory',
      description: 'Comprehensive greenhouse gas inventory',
      sections: ['Executive Summary', 'Scope 1/2/3 Analysis', 'Department Breakdown', 'Methodology'],
      format: 'pdf',
      frequency: 'annual'
    },
    {
      id: 'cdp-disclosure',
      name: 'CDP Climate Disclosure',
      description: 'CDP reporting template',
      sections: ['Governance', 'Strategy', 'Risk Management', 'Metrics & Targets'],
      format: 'xlsx',
      frequency: 'annual'
    },
    {
      id: 'monthly-operations',
      name: 'Monthly Operations Report',
      description: 'Operational emissions tracking',
      sections: ['Facilities', 'Fleet', 'Production', 'Travel'],
      format: 'csv',
      frequency: 'monthly'
    },
    {
      id: 'quarterly-board',
      name: 'Quarterly Board Report',
      description: 'Executive summary for board',
      sections: ['Key Metrics', 'Progress vs Targets', 'Initiatives', 'Next Steps'],
      format: 'pdf',
      frequency: 'quarterly'
    }
  ],
  
  admin: [
    {
      id: 'platform-analytics',
      name: 'Platform Analytics',
      description: 'System-wide metrics and usage',
      sections: ['User Activity', 'Data Quality', 'System Performance'],
      format: 'xlsx',
      frequency: 'weekly'
    }
  ]
};
