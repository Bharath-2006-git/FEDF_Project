/**
 * Environment variable validation for production
 * Ensures all required environment variables are set before starting the server
 */

interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  // Optional but recommended for production
  const recommended = {
    FRONTEND_URL: process.env.FRONTEND_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  // Check required variables
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Check JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production');
    }
    if (jwtSecret && (jwtSecret.includes('your-') || jwtSecret.includes('change-this'))) {
      errors.push('JWT_SECRET appears to be a placeholder value. Generate a secure secret.');
    }
  }

  // Check recommended variables
  for (const [key, value] of Object.entries(recommended)) {
    if (!value || value.trim() === '') {
      warnings.push(`Recommended environment variable not set: ${key}`);
    }
  }

  // Check Google OAuth (optional but should be complete if provided)
  const hasGoogleClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasGoogleClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasGoogleCallbackUrl = !!process.env.GOOGLE_CALLBACK_URL;

  if (hasGoogleClientId || hasGoogleClientSecret || hasGoogleCallbackUrl) {
    if (!hasGoogleClientId) warnings.push('GOOGLE_CLIENT_ID is missing (Google OAuth incomplete)');
    if (!hasGoogleClientSecret) warnings.push('GOOGLE_CLIENT_SECRET is missing (Google OAuth incomplete)');
    if (!hasGoogleCallbackUrl) warnings.push('GOOGLE_CALLBACK_URL is missing (Google OAuth incomplete)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logValidationResults(result: EnvValidationResult): void {
  if (result.errors.length > 0) {
    console.error('\n❌ Environment Variable Errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Environment Variable Warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('\n✅ All environment variables validated successfully');
  }
}
