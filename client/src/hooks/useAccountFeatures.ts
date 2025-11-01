import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ACCOUNT_FEATURES, 
  ACCOUNT_CAPABILITIES,
  DASHBOARD_METRICS,
  REPORT_TEMPLATES,
  hasFeature,
  getFeatureLimit,
  type AccountRole,
  type AccountFeatures,
  type AccountCapabilities
} from '@/types/account';

/**
 * Custom hook for accessing account-specific features and capabilities
 * Provides type-safe access to role-based features
 */
export function useAccountFeatures() {
  const { user } = useAuth();
  
  const role = (user?.role || 'individual') as AccountRole;
  
  // Get all features for current role
  const features: AccountFeatures = useMemo(() => {
    return ACCOUNT_FEATURES[role];
  }, [role]);
  
  // Get account capabilities metadata
  const capabilities: AccountCapabilities = useMemo(() => {
    return ACCOUNT_CAPABILITIES[role];
  }, [role]);
  
  // Get dashboard metrics for current role
  const dashboardMetrics = useMemo(() => {
    return DASHBOARD_METRICS[role];
  }, [role]);
  
  // Get available report templates
  const reportTemplates = useMemo(() => {
    return REPORT_TEMPLATES[role];
  }, [role]);
  
  // Helper functions
  const checkFeature = (feature: keyof AccountFeatures): boolean => {
    return hasFeature(role, feature);
  };
  
  const getLimit = (limit: 'maxEmissionsPerMonth' | 'maxGoals' | 'maxUsers' | 'dataRetentionMonths'): number => {
    return getFeatureLimit(role, limit);
  };
  
  // Account type checks
  const isIndividual = role === 'individual';
  const isCompany = role === 'company';
  const isAdmin = role === 'admin';
  
  // Feature availability checks
  const canTrackDepartments = checkFeature('departmentTracking');
  const canAccessAPI = checkFeature('apiAccess');
  const canBulkImport = checkFeature('bulkImport');
  const canViewAuditTrail = checkFeature('auditTrail');
  const canGenerateComplianceReports = checkFeature('complianceReports');
  const canAnalyzeByScope = checkFeature('scopeBasedAnalysis');
  const hasMultiUserAccess = checkFeature('multiUserAccess');
  const hasTeamCollaboration = checkFeature('teamCollaboration');
  const hasCustomReporting = checkFeature('customReporting');
  
  // Get formatted account info for display
  const accountInfo = {
    type: capabilities.displayName,
    icon: capabilities.icon,
    description: capabilities.description,
    color: capabilities.color
  };
  
  return {
    // Role information
    role,
    isIndividual,
    isCompany,
    isAdmin,
    
    // Features and capabilities
    features,
    capabilities,
    accountInfo,
    
    // Dashboard and reporting
    dashboardMetrics,
    reportTemplates,
    
    // Feature checks
    checkFeature,
    getLimit,
    
    // Common feature flags (for convenience)
    canTrackDepartments,
    canAccessAPI,
    canBulkImport,
    canViewAuditTrail,
    canGenerateComplianceReports,
    canAnalyzeByScope,
    hasMultiUserAccess,
    hasTeamCollaboration,
    hasCustomReporting,
    
    // Limits
    limits: {
      emissions: getLimit('maxEmissionsPerMonth'),
      goals: getLimit('maxGoals'),
      users: getLimit('maxUsers'),
      dataRetention: getLimit('dataRetentionMonths')
    }
  };
}
