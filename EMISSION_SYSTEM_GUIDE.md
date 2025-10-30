# Emission Calculation System - Testing Guide

## Overview
The backend emission calculation system has been enhanced with **100+ scientifically accurate emission factors** across 7 major categories. This guide explains how to test the system.

## API Endpoints

### 1. GET /api/emissions/categories
Returns metadata about all available categories, subcategories, units, and descriptions.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "categories": {
    "electricity": {
      "description": "Electricity consumption from various sources",
      "units": ["kWh", "MWh", "GWh"],
      "defaultUnit": "kWh",
      "subcategories": {
        "grid": { "name": "Grid Average", "description": "..." },
        "coal": { "name": "Coal-Powered", "description": "..." },
        // ... more subcategories
      }
    },
    // ... more categories
  }
}
```

### 2. POST /api/emissions/add
Logs an emission with automatic CO2 calculation.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "category": "travel",
  "subcategory": "car_electric",
  "quantity": 50,
  "unit": "km",
  "date": "2025-10-27",
  "description": "Daily commute",
  "department": "Engineering" // Optional, for companies
}
```

**Response:**
```json
{
  "message": "Emission logged successfully",
  "emission": {
    "id": 123,
    "category": "travel",
    "subcategory": "car_electric",
    "quantity": 50,
    "unit": "km",
    "co2Emissions": 2.5,
    "date": "2025-10-27",
    "description": "Daily commute"
  },
  "co2Emissions": 2.5
}
```

### 3. GET /api/emissions/calculate
Calculates CO2 emissions without logging to database.

**Authentication:** Required (Bearer token)

**Query Parameters:**
- `category` (required): electricity, travel, fuel, waste, production, logistics, water
- `subcategory` (optional): specific subcategory (e.g., car_electric, plane_business)
- `quantity` (required): numeric value
- `unit` (required): unit of measurement (e.g., kWh, km, liters)

**Example:**
```
GET /api/emissions/calculate?category=travel&subcategory=plane_business&quantity=500&unit=km
```

**Response:**
```json
{
  "co2Emissions": 140,
  "category": "travel",
  "subcategory": "plane_business",
  "quantity": 500,
  "unit": "km",
  "message": "Emissions calculated successfully"
}
```

## Emission Factors by Category

### ⚡ Electricity
- **grid**: 0.5 kg CO2/kWh (average grid mix)
- **coal**: 0.95 kg CO2/kWh (coal power plants)
- **natural_gas**: 0.45 kg CO2/kWh (gas power plants)
- **renewable**: 0.01 kg CO2/kWh (solar/wind)
- **nuclear**: 0.012 kg CO2/kWh
- **hydro**: 0.024 kg CO2/kWh

### 🚗 Travel
**Cars:**
- **car_small**: 0.15 kg CO2/km
- **car_medium**: 0.19 kg CO2/km
- **car_large**: 0.28 kg CO2/km (SUV)
- **car_electric**: 0.05 kg CO2/km
- **car_hybrid**: 0.11 kg CO2/km

**Public Transport:**
- **bus**: 0.05 kg CO2/km
- **coach**: 0.03 kg CO2/km
- **train**: 0.04 kg CO2/km
- **train_electric**: 0.035 kg CO2/km
- **train_diesel**: 0.06 kg CO2/km
- **subway**: 0.03 kg CO2/km
- **tram**: 0.03 kg CO2/km

**Air Travel:**
- **plane_short** (<500km): 0.15 kg CO2/km
- **plane_medium** (500-3500km): 0.14 kg CO2/km
- **plane_long** (>3500km): 0.19 kg CO2/km
- **plane_economy**: 0.14 kg CO2/km
- **plane_business**: 0.28 kg CO2/km (2x economy)
- **plane_first**: 0.42 kg CO2/km (3x economy)

**Other:**
- **motorcycle**: 0.11 kg CO2/km
- **scooter**: 0.07 kg CO2/km
- **bike**: 0 kg CO2/km (zero emissions)
- **ebike**: 0.003 kg CO2/km
- **walk**: 0 kg CO2/km

### ⛽ Fuel
**Liquid Fuels:**
- **gasoline**: 2.31 kg CO2/liter
- **diesel**: 2.68 kg CO2/liter
- **jet_fuel**: 2.52 kg CO2/liter
- **heating_oil**: 2.96 kg CO2/liter
- **lpg**: 1.51 kg CO2/liter

**Gaseous Fuels:**
- **natural_gas**: 2.0 kg CO2/m³
- **propane**: 2.35 kg CO2/m³
- **butane**: 3.03 kg CO2/kg

**Solid Fuels:**
- **coal**: 2.86 kg CO2/kg
- **charcoal**: 2.5 kg CO2/kg
- **wood**: 1.5 kg CO2/kg
- **peat**: 1.0 kg CO2/kg

### 🗑️ Waste
- **household**: 0.5 kg CO2/kg
- **commercial**: 0.45 kg CO2/kg
- **industrial**: 0.8 kg CO2/kg
- **recyclable**: 0.1 kg CO2/kg
- **paper**: 0.9 kg CO2/kg
- **plastic**: 2.1 kg CO2/kg
- **glass**: 0.5 kg CO2/kg
- **metal**: 0.7 kg CO2/kg
- **organic**: 0.3 kg CO2/kg
- **electronic**: 1.5 kg CO2/kg
- **hazardous**: 2.0 kg CO2/kg
- **medical**: 1.8 kg CO2/kg
- **construction**: 0.4 kg CO2/kg

### 🏭 Production
**Materials:**
- **steel**: 1.85 kg CO2/kg
- **aluminum**: 11.5 kg CO2/kg
- **cement**: 0.93 kg CO2/kg
- **concrete**: 0.13 kg CO2/kg
- **plastic**: 3.5 kg CO2/kg
- **paper**: 1.3 kg CO2/kg
- **glass**: 0.85 kg CO2/kg

**Food:**
- **beef**: 27.0 kg CO2/kg (highest impact)
- **lamb**: 24.0 kg CO2/kg
- **pork**: 7.0 kg CO2/kg
- **chicken**: 6.9 kg CO2/kg
- **fish**: 5.5 kg CO2/kg
- **dairy**: 3.2 kg CO2/kg
- **vegetables**: 0.4 kg CO2/kg
- **grains**: 0.5 kg CO2/kg

### 🚚 Logistics
- **truck_small**: 0.3 kg CO2/km
- **truck_medium**: 0.5 kg CO2/km
- **truck_heavy**: 0.8 kg CO2/km
- **van**: 0.25 kg CO2/km
- **ship**: 0.011 kg CO2/ton-km
- **cargo_ship**: 0.011 kg CO2/ton-km
- **air_freight**: 0.602 kg CO2/ton-km
- **rail_freight**: 0.027 kg CO2/ton-km

### 💧 Water
- **All water**: 0.0003 kg CO2/liter (treatment emissions)

## Testing

### Manual Testing (Recommended)
1. Login to the app at http://localhost:5173/auth
2. Open browser DevTools → Application/Storage → Local Storage
3. Copy the JWT token value
4. Run the test script:
   ```bash
   node test-emissions-manual.js YOUR_TOKEN_HERE
   ```

This will test:
- ✅ GET /api/emissions/categories
- ✅ POST /api/emissions/add (with 5 different subcategories)
- ✅ GET /api/emissions/history
- ✅ GET /api/emissions/calculate

### Example Calculations

**Example 1: Electric car commute**
- Category: travel
- Subcategory: car_electric
- Quantity: 100 km
- **Result:** 5 kg CO2 (0.05 × 100)

**Example 2: Business class flight**
- Category: travel
- Subcategory: plane_business
- Quantity: 1000 km
- **Result:** 280 kg CO2 (0.28 × 1000)

**Example 3: Natural gas usage**
- Category: fuel
- Subcategory: natural_gas
- Quantity: 50 cubic meters
- **Result:** 100 kg CO2 (2.0 × 50)

**Example 4: Beef consumption**
- Category: production
- Subcategory: beef
- Quantity: 5 kg
- **Result:** 135 kg CO2 (27.0 × 5)

**Example 5: Renewable electricity**
- Category: electricity
- Subcategory: renewable
- Quantity: 100 kWh
- **Result:** 1 kg CO2 (0.01 × 100)

## Data Sources

All emission factors are based on scientifically recognized sources:
- **DEFRA** (UK Department for Environment, Food & Rural Affairs)
- **EPA** (US Environmental Protection Agency)
- **IPCC** (Intergovernmental Panel on Climate Change)

## Frontend Integration

The LogEmissions page can fetch categories metadata and build dynamic forms:

```typescript
// Fetch categories
const response = await fetch('/api/emissions/categories', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

// Build UI from metadata
Object.entries(data.categories).forEach(([category, info]) => {
  console.log(`Category: ${category}`);
  console.log(`Units: ${info.units.join(', ')}`);
  console.log(`Subcategories: ${Object.keys(info.subcategories || {}).length}`);
});
```

## Next Steps

1. ✅ Backend emission calculation - **COMPLETE**
2. ✅ Categories metadata API - **COMPLETE**
3. ⏳ Update LogEmissions.tsx to use dynamic categories (optional)
4. ⏳ Analytics endpoints (replace dummy data with real calculations)
5. ⏳ Achievements system
6. ⏳ Reports generation (PDF/CSV)
