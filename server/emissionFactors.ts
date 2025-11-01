/**
 * Carbon Emission Factors and Calculation Module
 * 
 * This module contains scientifically-backed emission factors for calculating CO2 emissions
 * from various activities. All values are based on internationally recognized standards:
 * - DEFRA (UK Department for Environment, Food & Rural Affairs)
 * - EPA (US Environmental Protection Agency)
 * - IPCC (Intergovernmental Panel on Climate Change)
 * - IEA (International Energy Agency)
 * 
 * Last Updated: 2024
 * Units: All emission factors are in kg CO2 equivalent per unit
 */

/**
 * Emission Factor Structure
 * Each factor represents kg CO2 emitted per unit of activity
 */
export interface EmissionFactor {
  [unit: string]: number;
}

export interface SubcategoryFactors {
  [subcategory: string]: EmissionFactor;
}

export interface CategoryFactors {
  [category: string]: EmissionFactor;
}

/**
 * ELECTRICITY EMISSION FACTORS
 * Based on grid carbon intensity and generation mix
 * Default: Global average grid intensity (~0.5 kg CO2/kWh)
 */
export const ELECTRICITY_FACTORS: SubcategoryFactors = {
  // Default/Grid Average
  default: {
    kwh: 0.475,     // Global average (IEA 2024)
    mwh: 475,
    gwh: 475000,
  },
  grid: {
    kwh: 0.475,     // Grid average
    mwh: 475,
  },
  // By Generation Source
  coal: {
    kwh: 0.950,     // Coal-fired power plants (highest emissions)
    mwh: 950,
  },
  natural_gas: {
    kwh: 0.450,     // Natural gas combined cycle
    mwh: 450,
  },
  oil: {
    kwh: 0.650,     // Oil-fired generation
    mwh: 650,
  },
  renewable: {
    kwh: 0.012,     // Solar/Wind (lifecycle emissions only)
    mwh: 12,
  },
  solar: {
    kwh: 0.048,     // Solar PV (lifecycle)
    mwh: 48,
  },
  wind: {
    kwh: 0.011,     // Wind turbines (lifecycle)
    mwh: 11,
  },
  nuclear: {
    kwh: 0.012,     // Nuclear power (lifecycle)
    mwh: 12,
  },
  hydro: {
    kwh: 0.024,     // Hydroelectric (lifecycle)
    mwh: 24,
  },
  // By Usage Location
  home: {
    kwh: 0.475,     // Residential usage
    mwh: 475,
  },
  apartment: {
    kwh: 0.475,     // Apartment usage
    mwh: 475,
  },
  office: {
    kwh: 0.475,     // Commercial office
    mwh: 475,
  },
  factory: {
    kwh: 0.475,     // Industrial facility
    mwh: 475,
  },
  warehouse: {
    kwh: 0.475,     // Warehouse
    mwh: 475,
  },
  retail: {
    kwh: 0.475,     // Retail space
    mwh: 475,
  },
};

/**
 * TRANSPORTATION EMISSION FACTORS
 * Based on vehicle type, fuel efficiency, and passenger load
 * Formula: Fuel consumed × Emission factor per fuel unit
 */
export const TRAVEL_FACTORS: SubcategoryFactors = {
  // === PERSONAL VEHICLES ===
  // Passenger Cars (various sizes and fuel types)
  car: {
    km: 0.192,      // Average passenger car (DEFRA 2024)
    mile: 0.309,
    miles: 0.309,
  },
  car_small: {
    km: 0.142,      // Small car (<1.4L engine)
    mile: 0.229,
    miles: 0.229,
  },
  car_medium: {
    km: 0.192,      // Medium car (1.4-2.0L)
    mile: 0.309,
    miles: 0.309,
  },
  car_large: {
    km: 0.282,      // Large car/SUV (>2.0L)
    mile: 0.454,
    miles: 0.454,
  },
  car_electric: {
    km: 0.053,      // Battery electric vehicle (BEV)
    mile: 0.085,
    miles: 0.085,
  },
  car_hybrid: {
    km: 0.109,      // Plug-in hybrid (PHEV)
    mile: 0.175,
    miles: 0.175,
  },
  
  // Two-Wheelers
  motorcycle: {
    km: 0.113,      // Average motorcycle
    mile: 0.182,
    miles: 0.182,
  },
  motorcycle_small: {
    km: 0.084,      // Small motorcycle (<125cc)
    mile: 0.135,
    miles: 0.135,
  },
  motorcycle_medium: {
    km: 0.103,      // Medium motorcycle (125-500cc)
    mile: 0.166,
    miles: 0.166,
  },
  motorcycle_large: {
    km: 0.134,      // Large motorcycle (>500cc)
    mile: 0.216,
    miles: 0.216,
  },
  scooter: {
    km: 0.072,      // Motor scooter
    mile: 0.116,
    miles: 0.116,
  },
  
  // === PUBLIC TRANSPORTATION ===
  // Buses
  bus: {
    km: 0.089,      // Local bus (average occupancy 12 passengers)
    mile: 0.143,
    miles: 0.143,
  },
  bus_local: {
    km: 0.089,      // City/local bus
    mile: 0.143,
    miles: 0.143,
  },
  coach: {
    km: 0.027,      // Long-distance coach (higher occupancy)
    mile: 0.043,
    miles: 0.043,
  },
  
  // Rail
  train: {
    km: 0.041,      // Average passenger train
    mile: 0.066,
    miles: 0.066,
  },
  train_electric: {
    km: 0.035,      // Electric passenger train
    mile: 0.056,
    miles: 0.056,
  },
  train_diesel: {
    km: 0.061,      // Diesel passenger train
    mile: 0.098,
    miles: 0.098,
  },
  subway: {
    km: 0.028,      // Metro/Underground
    mile: 0.045,
    miles: 0.045,
  },
  metro: {
    km: 0.028,      // Metro (alias)
    mile: 0.045,
    miles: 0.045,
  },
  tram: {
    km: 0.029,      // Tram/Light rail
    mile: 0.047,
    miles: 0.047,
  },
  light_rail: {
    km: 0.029,      // Light rail (alias)
    mile: 0.047,
    miles: 0.047,
  },
  
  // === AIR TRAVEL ===
  // Aviation (includes lifecycle and radiative forcing effects)
  plane: {
    km: 0.255,      // Average flight (economy)
    mile: 0.410,
    miles: 0.410,
    hours: 90.0,    // ~350 km/h average
  },
  // By Distance
  plane_short: {
    km: 0.156,      // Short-haul (<500km)
    mile: 0.251,
    miles: 0.251,
    hours: 70.0,
  },
  plane_domestic: {
    km: 0.156,      // Domestic flight (alias)
    mile: 0.251,
    miles: 0.251,
    hours: 70.0,
  },
  plane_medium: {
    km: 0.150,      // Medium-haul (500-3500km)
    mile: 0.241,
    miles: 0.241,
    hours: 85.0,
  },
  plane_long: {
    km: 0.195,      // Long-haul (>3500km)
    mile: 0.314,
    miles: 0.314,
    hours: 100.0,
  },
  plane_international: {
    km: 0.195,      // International flight (alias)
    mile: 0.314,
    miles: 0.314,
    hours: 100.0,
  },
  // By Class (reflects space per passenger)
  plane_economy: {
    km: 0.150,      // Economy class (baseline)
    mile: 0.241,
    miles: 0.241,
    hours: 85.0,
  },
  plane_premium_economy: {
    km: 0.225,      // Premium economy (1.5x space)
    mile: 0.362,
    miles: 0.362,
    hours: 128.0,
  },
  plane_business: {
    km: 0.450,      // Business class (3x space)
    mile: 0.724,
    miles: 0.724,
    hours: 255.0,
  },
  plane_first: {
    km: 0.600,      // First class (4x space)
    mile: 0.966,
    miles: 0.966,
    hours: 340.0,
  },
  
  // === TAXIS & RIDE-SHARING ===
  taxi: {
    km: 0.211,      // Regular taxi
    mile: 0.340,
    miles: 0.340,
  },
  taxi_electric: {
    km: 0.053,      // Electric taxi
    mile: 0.085,
    miles: 0.085,
  },
  rideshare: {
    km: 0.192,      // Rideshare (solo)
    mile: 0.309,
    miles: 0.309,
  },
  rideshare_shared: {
    km: 0.096,      // Shared rideshare (2 passengers)
    mile: 0.155,
    miles: 0.155,
  },
  
  // === ZERO EMISSION ===
  bike: {
    km: 0,          // Bicycle (zero direct emissions)
    mile: 0,
    miles: 0,
  },
  ebike: {
    km: 0.005,      // E-bike (electricity only)
    mile: 0.008,
    miles: 0.008,
  },
  walk: {
    km: 0,          // Walking (zero emissions)
    mile: 0,
    miles: 0,
  },
};

/**
 * FUEL COMBUSTION EMISSION FACTORS
 * Based on carbon content and combustion efficiency
 * Formula: Volume/Mass × Carbon content × Oxidation factor
 */
export const FUEL_FACTORS: SubcategoryFactors = {
  // === LIQUID FUELS ===
  // Petroleum Products
  gasoline: {
    liter: 2.310,   // Automotive gasoline/petrol
    liters: 2.310,
    gallon: 8.744,  // US gallon
    gallons: 8.744,
    kg: 3.156,      // By weight
  },
  petrol: {         // Alias for gasoline
    liter: 2.310,
    liters: 2.310,
    gallon: 8.744,
    gallons: 8.744,
    kg: 3.156,
  },
  diesel: {
    liter: 2.680,   // Automotive diesel
    liters: 2.680,
    gallon: 10.146,
    gallons: 10.146,
    kg: 3.156,
  },
  jet_fuel: {
    liter: 2.520,   // Aviation turbine fuel
    liters: 2.520,
    gallon: 9.540,
    gallons: 9.540,
    kg: 3.150,
  },
  kerosene: {
    liter: 2.530,   // Kerosene/paraffin
    liters: 2.530,
    gallon: 9.578,
    gallons: 9.578,
    kg: 3.150,
  },
  heating_oil: {
    liter: 2.960,   // Heating/fuel oil
    liters: 2.960,
    gallon: 11.206,
    gallons: 11.206,
    kg: 3.200,
  },
  
  // Liquefied Petroleum Gas
  lpg: {
    liter: 1.510,   // LPG (mixed propane/butane)
    liters: 1.510,
    gallon: 5.715,
    gallons: 5.715,
    kg: 2.983,
  },
  
  // === GASEOUS FUELS ===
  natural_gas: {
    cubic_meter: 2.000,     // Natural gas/methane
    cubic_meters: 2.000,
    m3: 2.000,
    ccf: 56.597,            // 100 cubic feet
    therm: 5.300,           // US therm
    kg: 2.750,
  },
  methane: {                // Alias
    cubic_meter: 2.000,
    cubic_meters: 2.000,
    m3: 2.000,
    kg: 2.750,
  },
  propane: {
    cubic_meter: 2.350,
    cubic_meters: 2.350,
    m3: 2.350,
    gallon: 5.740,
    gallons: 5.740,
    kg: 2.983,
  },
  butane: {
    cubic_meter: 2.920,
    cubic_meters: 2.920,
    m3: 2.920,
    kg: 3.030,
  },
  
  // === SOLID FUELS ===
  coal: {
    kg: 2.860,      // Bituminous coal
    ton: 2860,
    tons: 2860,
    tonne: 2860,    // Metric ton
    tonnes: 2860,
  },
  coal_anthracite: {
    kg: 3.240,      // Anthracite (hard coal)
    ton: 3240,
    tons: 3240,
  },
  coal_lignite: {
    kg: 1.200,      // Lignite (brown coal)
    ton: 1200,
    tons: 1200,
  },
  charcoal: {
    kg: 2.500,      // Charcoal
    ton: 2500,
    tons: 2500,
  },
  wood: {
    kg: 1.500,      // Wood/biomass (dry)
    ton: 1500,
    tons: 1500,
  },
  peat: {
    kg: 1.000,      // Peat
    ton: 1000,
    tons: 1000,
  },
};

/**
 * WASTE DISPOSAL EMISSION FACTORS
 * Includes methane emissions from decomposition
 * Based on waste type and disposal method (landfill vs incineration)
 */
export const WASTE_FACTORS: SubcategoryFactors = {
  // === GENERAL WASTE (Landfill) ===
  household: {
    kg: 0.500,      // Mixed household waste
    lbs: 0.227,
    pound: 0.227,
    pounds: 0.227,
    bag: 3.000,     // ~6 kg average bag
    bags: 3.000,
    ton: 500,
    tons: 500,
  },
  commercial: {
    kg: 0.450,      // Commercial/office waste
    lbs: 0.204,
    ton: 450,
    tons: 450,
  },
  industrial: {
    kg: 0.800,      // Industrial waste
    lbs: 0.363,
    ton: 800,
    tons: 800,
  },
  
  // === RECYCLABLES (Lower emissions due to avoided production) ===
  recyclable: {
    kg: 0.021,      // Mixed recyclables
    lbs: 0.010,
    bag: 0.126,
    bags: 0.126,
  },
  paper: {
    kg: 0.900,      // Paper/cardboard to landfill
    lbs: 0.408,
    ton: 900,
    tons: 900,
  },
  paper_recycled: {
    kg: -1.700,     // Negative = emissions avoided by recycling
    lbs: -0.771,
  },
  plastic: {
    kg: 2.100,      // Plastic waste to landfill
    lbs: 0.953,
    ton: 2100,
    tons: 2100,
  },
  plastic_recycled: {
    kg: -1.500,     // Emissions avoided
    lbs: -0.680,
  },
  glass: {
    kg: 0.500,      // Glass to landfill
    lbs: 0.227,
    ton: 500,
    tons: 500,
  },
  glass_recycled: {
    kg: -0.400,     // Emissions avoided
    lbs: -0.181,
  },
  metal: {
    kg: 0.700,      // Metal waste
    lbs: 0.318,
    ton: 700,
    tons: 700,
  },
  metal_recycled: {
    kg: -5.000,     // High emissions avoided (esp. aluminum)
    lbs: -2.268,
  },
  
  // === ORGANIC WASTE ===
  organic: {
    kg: 0.300,      // Food/organic waste (composted)
    lbs: 0.136,
    bag: 1.800,
    bags: 1.800,
  },
  food: {
    kg: 0.500,      // Food waste to landfill
    lbs: 0.227,
  },
  compost: {
    kg: 0.100,      // Composted organic (much lower)
    lbs: 0.045,
  },
  
  // === SPECIAL WASTE ===
  electronic: {
    kg: 1.500,      // E-waste
    lbs: 0.680,
    unit: 10.000,   // Average device
  },
  hazardous: {
    kg: 2.000,      // Hazardous waste (incineration)
    lbs: 0.907,
    ton: 2000,
    tons: 2000,
  },
  medical: {
    kg: 1.800,      // Medical waste (incineration)
    lbs: 0.816,
  },
  construction: {
    kg: 0.400,      // Construction/demolition debris
    lbs: 0.181,
    ton: 400,
    tons: 400,
    cubic_meter: 200,
    cubic_meters: 200,
    m3: 200,
  },
};

/**
 * PRODUCTION & MANUFACTURING EMISSION FACTORS
 * Process emissions + energy consumption
 * Based on lifecycle analysis (LCA) data
 */
export const PRODUCTION_FACTORS: SubcategoryFactors = {
  // === RAW MATERIALS ===
  // Metals
  steel: {
    kg: 1.850,      // Steel production (BOF)
    ton: 1850,
    tons: 1850,
  },
  steel_recycled: {
    kg: 0.450,      // Recycled steel (much lower)
    ton: 450,
    tons: 450,
  },
  aluminum: {
    kg: 11.500,     // Primary aluminum (energy-intensive)
    ton: 11500,
    tons: 11500,
  },
  aluminum_recycled: {
    kg: 0.600,      // Recycled aluminum (95% less energy)
    ton: 600,
    tons: 600,
  },
  copper: {
    kg: 3.000,      // Copper production
    ton: 3000,
    tons: 3000,
  },
  
  // Construction Materials
  cement: {
    kg: 0.930,      // Cement production (CaCO3 → CaO + CO2)
    ton: 930,
    tons: 930,
  },
  concrete: {
    kg: 0.130,      // Ready-mix concrete
    ton: 130,
    tons: 130,
    cubic_meter: 325,
    m3: 325,
  },
  brick: {
    kg: 0.240,      // Clay brick
    unit: 0.240,
  },
  
  // Plastics & Polymers
  plastic: {
    kg: 3.500,      // Average plastic resin
    ton: 3500,
    tons: 3500,
  },
  pet: {
    kg: 3.400,      // PET plastic
    ton: 3400,
    tons: 3400,
  },
  hdpe: {
    kg: 1.900,      // HDPE plastic
    ton: 1900,
    tons: 1900,
  },
  pvc: {
    kg: 2.000,      // PVC plastic
    ton: 2000,
    tons: 2000,
  },
  
  // Paper Products
  paper: {
    kg: 1.300,      // Virgin paper
    ton: 1300,
    tons: 1300,
  },
  paper_recycled: {
    kg: 0.700,      // Recycled paper
    ton: 700,
    tons: 700,
  },
  cardboard: {
    kg: 1.000,      // Cardboard
    ton: 1000,
    tons: 1000,
  },
  
  // Glass
  glass: {
    kg: 0.850,      // Glass production
    ton: 850,
    tons: 850,
  },
  
  // === FOOD PRODUCTION (kg CO2e per kg product) ===
  // Livestock (high emissions due to enteric fermentation)
  beef: {
    kg: 27.000,     // Beef (cattle farming)
  },
  lamb: {
    kg: 24.000,     // Lamb/mutton
  },
  pork: {
    kg: 7.000,      // Pork
  },
  chicken: {
    kg: 6.900,      // Chicken/poultry
  },
  turkey: {
    kg: 10.900,     // Turkey
  },
  
  // Seafood
  fish: {
    kg: 5.500,      // Fish (farmed)
  },
  fish_wild: {
    kg: 2.900,      // Wild-caught fish
  },
  prawns: {
    kg: 26.000,     // Prawns/shrimp (intensive farming)
  },
  
  // Dairy
  milk: {
    liter: 1.300,   // Cow's milk
    liters: 1.300,
    kg: 1.300,
  },
  cheese: {
    kg: 13.500,     // Cheese
  },
  butter: {
    kg: 23.800,     // Butter
  },
  eggs: {
    kg: 4.500,      // Eggs
    dozen: 2.700,   // ~600g
  },
  
  // Plant-Based (much lower emissions)
  vegetables: {
    kg: 0.400,      // Average vegetables
  },
  fruits: {
    kg: 0.500,      // Average fruits
  },
  grains: {
    kg: 0.500,      // Cereals/grains
  },
  rice: {
    kg: 2.700,      // Rice (methane from paddies)
  },
  legumes: {
    kg: 0.900,      // Beans/lentils/peas
  },
  nuts: {
    kg: 2.300,      // Nuts (water-intensive)
  },
  
  // === GENERIC MANUFACTURING ===
  manufacturing: {
    unit: 1.500,    // Generic manufactured unit
    units: 1.500,
    hours: 10.000,  // Manufacturing hour
  },
  assembly: {
    unit: 0.800,    // Assembly operation
    hours: 5.000,
  },
  processing: {
    kg: 0.500,      // Processing per kg
    ton: 500,
  },
  packaging: {
    unit: 0.300,    // Package/unit
    kg: 0.200,
  },
};

/**
 * LOGISTICS & FREIGHT EMISSION FACTORS
 * Freight transport emissions per distance and weight
 * Formula: Distance × Weight × Factor (per ton-km)
 */
export const LOGISTICS_FACTORS: SubcategoryFactors = {
  // === ROAD FREIGHT ===
  truck_small: {
    km: 0.300,      // Small truck (<3.5t)
    mile: 0.483,
    miles: 0.483,
    ton_km: 0.140,  // Per ton-kilometer
    'ton-km': 0.140,
  },
  van: {            // Alias
    km: 0.250,
    mile: 0.402,
    miles: 0.402,
  },
  truck_medium: {
    km: 0.500,      // Medium truck (3.5-7.5t)
    mile: 0.805,
    miles: 0.805,
    ton_km: 0.100,
    'ton-km': 0.100,
  },
  truck_heavy: {
    km: 0.800,      // Heavy truck/HGV (>7.5t)
    mile: 1.287,
    miles: 1.287,
    ton_km: 0.062,  // More efficient per ton
    'ton-km': 0.062,
  },
  truck_articulated: {
    km: 0.800,      // Articulated HGV (40t)
    mile: 1.287,
    miles: 1.287,
    ton_km: 0.062,
    'ton-km': 0.062,
  },
  
  // === SEA FREIGHT ===
  ship: {
    ton_km: 0.011,  // Container ship (most efficient)
    'ton-km': 0.011,
  },
  cargo_ship: {
    ton_km: 0.011,
    'ton-km': 0.011,
  },
  container_ship: {
    ton_km: 0.011,
    'ton-km': 0.011,
  },
  tanker: {
    ton_km: 0.005,  // Oil/gas tanker
    'ton-km': 0.005,
  },
  
  // === AIR FREIGHT ===
  air_freight: {
    ton_km: 0.602,  // Air cargo (highest emissions)
    'ton-km': 0.602,
  },
  
  // === RAIL FREIGHT ===
  rail_freight: {
    ton_km: 0.027,  // Rail cargo (efficient)
    'ton-km': 0.027,
  },
  train_freight: {
    ton_km: 0.027,
    'ton-km': 0.027,
  },
  
  // === COURIER/PACKAGE DELIVERY ===
  courier: {
    package: 2.500, // Average parcel delivery
    packages: 2.500,
    km: 0.250,
    mile: 0.402,
    miles: 0.402,
  },
  delivery: {
    package: 2.500,
    packages: 2.500,
  },
  
  // === WAREHOUSE/STORAGE ===
  warehouse: {
    sqm_year: 15.0,     // Square meter per year
    sqft_year: 1.394,   // Square foot per year
  },
  storage: {
    cubic_meter: 0.100, // Storage emissions
    m3: 0.100,
  },
  
  // === DISTRIBUTION ===
  distribution: {
    km: 0.500,      // Distribution center operations
    mile: 0.805,
    miles: 0.805,
  },
  shipping: {
    package: 2.500,
    packages: 2.500,
  },
};

/**
 * WATER USAGE EMISSION FACTORS
 * Emissions from water treatment and distribution
 */
export const WATER_FACTORS: SubcategoryFactors = {
  default: {
    liter: 0.000344,    // Water supply & treatment
    liters: 0.000344,
    gallon: 0.001302,   // US gallon
    gallons: 0.001302,
    cubic_meter: 0.344,
    cubic_meters: 0.344,
    m3: 0.344,
  },
};

/**
 * Main emission factors object combining all categories
 */
export const EMISSION_FACTORS: Record<string, SubcategoryFactors | CategoryFactors> = {
  electricity: ELECTRICITY_FACTORS,
  travel: TRAVEL_FACTORS,
  fuel: FUEL_FACTORS,
  waste: WASTE_FACTORS,
  production: PRODUCTION_FACTORS,
  logistics: LOGISTICS_FACTORS,
  water: WATER_FACTORS,
};

/**
 * Default category-level factors (used when no subcategory specified)
 */
export const DEFAULT_CATEGORY_FACTORS: CategoryFactors = {
  electricity: { kwh: 0.475, mwh: 475 },
  travel: { km: 0.192, mile: 0.309, miles: 0.309 },
  fuel: { liter: 2.310, liters: 2.310, gallon: 8.744, gallons: 8.744 },
  waste: { kg: 0.500, lbs: 0.227, bag: 3.000, bags: 3.000 },
  production: { kg: 1.500, unit: 1.500, units: 1.500 },
  logistics: { km: 0.800, mile: 1.287, miles: 1.287 },
  water: { liter: 0.000344, liters: 0.000344 },
};
