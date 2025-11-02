import { 
  Car, 
  Home, 
  Zap, 
  Trash2, 
  Factory, 
  Truck, 
  Plane,
  ShoppingBag,
  Beef,
  Droplets,
  Flame,
  Building,
  Package,
  Users,
  TreePine
} from "lucide-react";

// Enhanced Individual Categories with more detailed tracking
export const INDIVIDUAL_CATEGORIES = [
  {
    value: "energy",
    label: "Energy Usage",
    icon: Zap,
    description: "Track your household energy consumption",
    subcategories: ["electricity", "cooking_fuel", "heating_cooling"],
    units: ["kWh", "kg", "m³", "hours"],
    scope: "Scope 1 & 2"
  },
  {
    value: "transportation",
    label: "Transportation",
    icon: Car,
    description: "All your travel and commute activities",
    subcategories: ["car_travel", "two_wheeler", "public_transport", "flights", "shared_mobility"],
    units: ["km"],
    scope: "Scope 1 & 3"
  },
  {
    value: "household",
    label: "Household & Lifestyle",
    icon: Home,
    description: "Water, waste, and appliance usage",
    subcategories: ["water_usage", "waste_generation", "appliance_use"],
    units: ["liters", "kg", "kWh"],
    scope: "Scope 3"
  },
  {
    value: "food",
    label: "Food & Diet",
    icon: Beef,
    description: "Track your dietary carbon footprint",
    subcategories: ["meat_consumption", "dairy", "plant_based_foods", "processed_food"],
    units: ["kg", "liters", "items"],
    scope: "Scope 3"
  },
  {
    value: "shopping",
    label: "Shopping & Goods",
    icon: ShoppingBag,
    description: "Purchases and consumer goods",
    subcategories: ["clothing", "electronics"],
    units: ["items", "kg"],
    scope: "Scope 3"
  }
];

// Enhanced Company Categories with comprehensive business operations tracking
export const COMPANY_CATEGORIES = [
  {
    value: "facility_energy",
    label: "Facility Energy",
    icon: Building,
    description: "Electricity and energy consumption across facilities",
    subcategories: ["office", "factory", "warehouse", "retail_store", "data_center", "renewable_offset"],
    units: ["kWh", "MWh", "GWh"],
    scope: "Scope 2",
    departmentTracking: true
  },
  {
    value: "production",
    label: "Manufacturing & Production",
    icon: Factory,
    description: "Direct emissions from production processes",
    subcategories: ["manufacturing", "assembly", "processing", "packaging", "quality_control"],
    units: ["units", "kg", "tons", "batches", "hours"],
    scope: "Scope 1",
    departmentTracking: true
  },
  {
    value: "fleet_vehicles",
    label: "Company Fleet",
    icon: Truck,
    description: "Company-owned vehicle emissions",
    subcategories: ["delivery_trucks", "company_cars", "service_vehicles", "heavy_machinery", "forklifts"],
    units: ["miles", "km", "gallons", "liters"],
    scope: "Scope 1",
    departmentTracking: true
  },
  {
    value: "logistics",
    label: "Logistics & Distribution",
    icon: Package,
    description: "Third-party shipping and transportation",
    subcategories: ["ground_shipping", "air_freight", "ocean_freight", "rail_freight", "last_mile_delivery"],
    units: ["km", "miles", "packages", "tons", "pallets"],
    scope: "Scope 3",
    departmentTracking: true
  },
  {
    value: "business_travel",
    label: "Employee Business Travel",
    icon: Plane,
    description: "Business trips and travel",
    subcategories: ["flights", "rental_cars", "hotels", "rideshare", "trains"],
    units: ["miles", "km", "nights", "trips"],
    scope: "Scope 3",
    departmentTracking: true
  },
  {
    value: "employee_commute",
    label: "Employee Commuting",
    icon: Users,
    description: "Daily employee commute emissions",
    subcategories: ["personal_vehicles", "public_transit", "remote_work_offset"],
    units: ["employee_days", "miles", "km"],
    scope: "Scope 3",
    departmentTracking: true
  },
  {
    value: "industrial_waste",
    label: "Industrial Waste",
    icon: Trash2,
    description: "Waste from operations and facilities",
    subcategories: ["industrial", "office", "recyclable", "hazardous", "e_waste", "construction"],
    units: ["kg", "tons", "cubic_meters"],
    scope: "Scope 3",
    departmentTracking: true
  },
  {
    value: "purchased_goods",
    label: "Purchased Goods & Services",
    icon: ShoppingBag,
    description: "Supply chain and procurement emissions",
    subcategories: ["raw_materials", "office_supplies", "equipment", "services", "it_hardware"],
    units: ["dollars", "units", "kg"],
    scope: "Scope 3",
    departmentTracking: true
  },
  {
    value: "fuel_combustion",
    label: "Fuel & Heating",
    icon: Flame,
    description: "On-site fuel combustion for heating/processing",
    subcategories: ["natural_gas", "diesel", "fuel_oil", "coal", "biomass"],
    units: ["therms", "gallons", "liters", "tons"],
    scope: "Scope 1",
    departmentTracking: true
  }
];

// Category metadata for better UI presentation
export const CATEGORY_METADATA = {
  individual: {
    totalCategories: INDIVIDUAL_CATEGORIES.length,
    focusAreas: ["Home", "Transportation", "Lifestyle"],
    measurementApproach: "Personal carbon footprint tracking",
    typicalAnnualEmissions: "4-16 tons CO₂e per person"
  },
  company: {
    totalCategories: COMPANY_CATEGORIES.length,
    focusAreas: ["Operations", "Supply Chain", "Facilities"],
    measurementApproach: "GHG Protocol Corporate Standard",
    typicalAnnualEmissions: "Varies by industry and size"
  }
};

// Scope definitions for education
export const EMISSION_SCOPES = {
  "Scope 1": "Direct emissions from owned or controlled sources",
  "Scope 2": "Indirect emissions from purchased energy",
  "Scope 3": "All other indirect emissions in the value chain"
};
