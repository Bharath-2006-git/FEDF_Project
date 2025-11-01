/**
 * Carbon Emission Calculator
 * 
 * This module provides the core calculation engine for converting activities
 * into CO2 equivalent emissions using scientifically-backed emission factors.
 * 
 * Calculation Formula:
 * CO2 Emissions (kg) = Activity Quantity × Emission Factor
 * 
 * Where:
 * - Activity Quantity: The amount of activity (e.g., 100 km driven, 50 kWh used)
 * - Emission Factor: kg CO2 per unit of activity (from emissionFactors.ts)
 * 
 * The calculator supports:
 * 1. Category-based calculations (e.g., "electricity", "travel")
 * 2. Subcategory-specific factors (e.g., "car_electric", "coal" electricity)
 * 3. Multiple unit conversions (e.g., km/miles, liters/gallons)
 * 4. Validation and error handling
 */

import {
  EMISSION_FACTORS,
  DEFAULT_CATEGORY_FACTORS,
  type EmissionFactor,
  type SubcategoryFactors,
} from './emissionFactors';

/**
 * Result interface for emission calculations
 */
export interface EmissionCalculationResult {
  co2Emissions: number;
  category: string;
  subcategory?: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  calculationMethod: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Error types for emission calculations
 */
export class EmissionCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EmissionCalculationError';
  }
}

/**
 * Normalize unit names for consistent lookup
 * Converts various unit formats to standard format
 * 
 * Examples:
 * - "Liter" → "liter"
 * - "Miles" → "miles"
 * - "ton km" → "ton_km"
 */
function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .replace(/-/g, '_')          // Replace hyphens with underscores
    .replace(/[^a-z0-9_]/g, ''); // Remove special characters
}

/**
 * Normalize category and subcategory names
 */
function normalizeCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

/**
 * Get emission factor for a given category, subcategory, and unit
 * 
 * Lookup priority:
 * 1. Subcategory-specific factor (most accurate)
 * 2. Category default factor
 * 3. Generic fallback
 * 
 * @param category - Main category (e.g., "travel", "electricity")
 * @param unit - Unit of measurement (e.g., "km", "kWh")
 * @param subcategory - Optional subcategory for more specific factor
 * @returns Emission factor and metadata
 */
function getEmissionFactor(
  category: string,
  unit: string,
  subcategory?: string
): { factor: number; source: string; confidence: 'high' | 'medium' | 'low' } {
  const normalizedCategory = normalizeCategory(category);
  const normalizedUnit = normalizeUnit(unit);
  const normalizedSubcategory = subcategory ? normalizeCategory(subcategory) : undefined;

  // Get category factors
  const categoryFactors = EMISSION_FACTORS[normalizedCategory];
  
  if (!categoryFactors) {
    throw new EmissionCalculationError(
      `Unknown category: ${category}`,
      'UNKNOWN_CATEGORY',
      { category, availableCategories: Object.keys(EMISSION_FACTORS) }
    );
  }

  // Try subcategory-specific factor first (highest confidence)
  if (normalizedSubcategory && typeof categoryFactors === 'object') {
    const subcategoryFactors = (categoryFactors as SubcategoryFactors)[normalizedSubcategory];
    
    if (subcategoryFactors && typeof subcategoryFactors === 'object') {
      const factor = subcategoryFactors[normalizedUnit];
      
      if (factor !== undefined) {
        return {
          factor,
          source: `${category}.${subcategory}.${unit}`,
          confidence: 'high',
        };
      }
    }
  }

  // Try category default factor for the unit (medium confidence)
  if (typeof categoryFactors === 'object') {
    // Check if there's a 'default' subcategory
    const defaultFactors = (categoryFactors as SubcategoryFactors).default;
    if (defaultFactors && typeof defaultFactors === 'object') {
      const factor = defaultFactors[normalizedUnit];
      if (factor !== undefined) {
        return {
          factor,
          source: `${category}.default.${unit}`,
          confidence: 'medium',
        };
      }
    }

    // Check default category factors
    const categoryDefaultFactors = DEFAULT_CATEGORY_FACTORS[normalizedCategory];
    if (categoryDefaultFactors) {
      const factor = categoryDefaultFactors[normalizedUnit];
      if (factor !== undefined) {
        return {
          factor,
          source: `${category}.${unit} (category default)`,
          confidence: 'medium',
        };
      }
    }
  }

  // No factor found
  throw new EmissionCalculationError(
    `No emission factor found for ${category} ${subcategory ? `(${subcategory}) ` : ''}with unit ${unit}`,
    'FACTOR_NOT_FOUND',
    {
      category,
      subcategory,
      unit,
      availableUnits: getAvailableUnits(normalizedCategory, normalizedSubcategory),
    }
  );
}

/**
 * Get available units for a category/subcategory combination
 */
function getAvailableUnits(category: string, subcategory?: string): string[] {
  const categoryFactors = EMISSION_FACTORS[category];
  if (!categoryFactors || typeof categoryFactors !== 'object') {
    return [];
  }

  const units = new Set<string>();

  if (subcategory && (categoryFactors as SubcategoryFactors)[subcategory]) {
    const subcatFactors = (categoryFactors as SubcategoryFactors)[subcategory];
    if (typeof subcatFactors === 'object') {
      Object.keys(subcatFactors).forEach(unit => units.add(unit));
    }
  }

  // Add category default units
  const defaultFactors = (categoryFactors as SubcategoryFactors).default;
  if (defaultFactors && typeof defaultFactors === 'object') {
    Object.keys(defaultFactors).forEach(unit => units.add(unit));
  }

  return Array.from(units);
}

/**
 * Calculate CO2 emissions for a given activity
 * 
 * This is the main calculation function that:
 * 1. Validates input parameters
 * 2. Looks up appropriate emission factor
 * 3. Performs calculation: CO2 = quantity × factor
 * 4. Returns detailed result with metadata
 * 
 * @param category - Activity category (e.g., "travel", "electricity")
 * @param quantity - Amount of activity (must be positive number)
 * @param unit - Unit of measurement (e.g., "km", "kWh")
 * @param subcategory - Optional subcategory for specific factor
 * @returns Detailed calculation result
 * 
 * @example
 * // Calculate emissions from 100 km driven in a car
 * calculateCO2Emissions("travel", 100, "km", "car")
 * // Returns: { co2Emissions: 19.2, ... }
 * 
 * @example
 * // Calculate emissions from 50 kWh of electricity
 * calculateCO2Emissions("electricity", 50, "kWh")
 * // Returns: { co2Emissions: 23.75, ... }
 */
export function calculateCO2Emissions(
  category: string,
  quantity: number,
  unit: string,
  subcategory?: string
): EmissionCalculationResult {
  // Validate inputs
  if (!category || typeof category !== 'string') {
    throw new EmissionCalculationError(
      'Category is required and must be a string',
      'INVALID_CATEGORY'
    );
  }

  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new EmissionCalculationError(
      'Quantity must be a valid number',
      'INVALID_QUANTITY',
      { providedQuantity: quantity }
    );
  }

  if (quantity < 0) {
    throw new EmissionCalculationError(
      'Quantity must be a positive number',
      'NEGATIVE_QUANTITY',
      { providedQuantity: quantity }
    );
  }

  if (!unit || typeof unit !== 'string') {
    throw new EmissionCalculationError(
      'Unit is required and must be a string',
      'INVALID_UNIT'
    );
  }

  // Get emission factor
  const { factor, source, confidence } = getEmissionFactor(category, unit, subcategory);

  // Perform calculation
  // Formula: CO2 emissions (kg) = Activity quantity × Emission factor (kg CO2/unit)
  const co2Emissions = quantity * factor;

  // Round to 3 decimal places for precision
  const roundedEmissions = Math.round(co2Emissions * 1000) / 1000;

  return {
    co2Emissions: roundedEmissions,
    category,
    subcategory,
    quantity,
    unit,
    emissionFactor: factor,
    calculationMethod: source,
    confidence,
  };
}

/**
 * Calculate CO2 emissions with automatic error handling
 * Returns 0 if calculation fails instead of throwing
 * 
 * @param category - Activity category
 * @param quantity - Amount of activity
 * @param unit - Unit of measurement
 * @param subcategory - Optional subcategory
 * @returns CO2 emissions in kg (0 if error)
 */
export function calculateCO2EmissionsSafe(
  category: string,
  quantity: number,
  unit: string,
  subcategory?: string
): number {
  try {
    const result = calculateCO2Emissions(category, quantity, unit, subcategory);
    return result.co2Emissions;
  } catch (error) {
    console.error('Emission calculation error:', error);
    return 0;
  }
}

/**
 * Validate if a category/subcategory/unit combination is supported
 * 
 * @param category - Activity category
 * @param unit - Unit of measurement
 * @param subcategory - Optional subcategory
 * @returns True if combination is valid
 */
export function isValidCombination(
  category: string,
  unit: string,
  subcategory?: string
): boolean {
  try {
    getEmissionFactor(category, unit, subcategory);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.keys(EMISSION_FACTORS);
}

/**
 * Get all available subcategories for a category
 */
export function getAvailableSubcategories(category: string): string[] {
  const normalizedCategory = normalizeCategory(category);
  const categoryFactors = EMISSION_FACTORS[normalizedCategory];
  
  if (!categoryFactors || typeof categoryFactors !== 'object') {
    return [];
  }

  return Object.keys(categoryFactors as SubcategoryFactors).filter(
    key => key !== 'default' && typeof (categoryFactors as SubcategoryFactors)[key] === 'object'
  );
}

/**
 * Get metadata about a specific emission factor
 * Useful for displaying information to users
 */
export function getFactorMetadata(
  category: string,
  unit: string,
  subcategory?: string
): {
  factor: number;
  unit: string;
  description: string;
  confidence: string;
} {
  try {
    const { factor, source, confidence } = getEmissionFactor(category, unit, subcategory);
    
    return {
      factor,
      unit,
      description: `Emission factor from ${source}`,
      confidence,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Batch calculate emissions for multiple activities
 * Useful for calculating total emissions from multiple sources
 * 
 * @param activities - Array of activities to calculate
 * @returns Array of results and total emissions
 */
export function batchCalculateEmissions(
  activities: Array<{
    category: string;
    quantity: number;
    unit: string;
    subcategory?: string;
  }>
): {
  results: EmissionCalculationResult[];
  totalEmissions: number;
  successCount: number;
  failureCount: number;
} {
  const results: EmissionCalculationResult[] = [];
  let totalEmissions = 0;
  let successCount = 0;
  let failureCount = 0;

  for (const activity of activities) {
    try {
      const result = calculateCO2Emissions(
        activity.category,
        activity.quantity,
        activity.unit,
        activity.subcategory
      );
      results.push(result);
      totalEmissions += result.co2Emissions;
      successCount++;
    } catch (error) {
      console.error('Failed to calculate emission for activity:', activity, error);
      failureCount++;
    }
  }

  return {
    results,
    totalEmissions: Math.round(totalEmissions * 1000) / 1000,
    successCount,
    failureCount,
  };
}

/**
 * Export for backward compatibility with existing code
 */
export default calculateCO2Emissions;
