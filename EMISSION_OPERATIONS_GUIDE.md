# CarbonSense Emission Operations Documentation

## Overview
This document describes all emission logging and calculation operations in the CarbonSense backend system.

---

## 🎯 Features Implemented

### 1. **Emission Calculation Engine**
- ✅ Comprehensive emission factors for all categories
- ✅ Subcategory-specific calculations
- ✅ Support for multiple units (kWh, miles, km, liters, gallons, kg, etc.)
- ✅ Automatic CO2 conversion with 3 decimal precision

### 2. **Emission Logging**
- ✅ Add emission entries with validation
- ✅ Update existing emissions
- ✅ Delete emissions
- ✅ Support for both individual and company users
- ✅ Optional department tracking for companies

### 3. **Emission Retrieval**
- ✅ Get emissions list with filtering
- ✅ Get emissions history (grouped by month)
- ✅ Get emissions summary with statistics
- ✅ Filter by category, date range, and limit

### 4. **Data Validation**
- ✅ Required field validation
- ✅ Positive number validation
- ✅ Proper error messages
- ✅ User authentication checks

---

## 📊 Emission Factors

### Electricity
- **kWh**: 0.5 kg CO2
- **MWh**: 500 kg CO2

### Travel
**General:**
- **km**: 0.15 kg CO2
- **mile/miles**: 0.24 kg CO2
- **hours**: 5.0 kg CO2 (for flights)

**By Subcategory:**
- **car**: 0.21 kg/km, 0.34 kg/mile
- **bus**: 0.05 kg/km, 0.08 kg/mile
- **train**: 0.04 kg/km, 0.06 kg/mile
- **plane**: 0.25 kg/km, 0.40 kg/mile, 90.0 kg/hour
- **bike/walk**: 0 kg CO2

### Fuel
**General:**
- **liter/liters**: 2.31 kg CO2
- **gallon/gallons**: 8.74 kg CO2
- **cubic_meters**: 2.0 kg CO2

**By Subcategory:**
- **gasoline**: 2.31 kg/liter, 8.74 kg/gallon
- **diesel**: 2.68 kg/liter, 10.15 kg/gallon
- **natural_gas**: 2.0 kg/cubic_meter
- **heating_oil**: 2.52 kg/liter, 9.54 kg/gallon

### Production
- **unit/units**: 1.5 kg CO2
- **kg**: 0.5 kg CO2
- **tons**: 500 kg CO2
- **hours**: 10.0 kg CO2

### Logistics
- **km**: 0.8 kg CO2
- **miles**: 1.29 kg CO2
- **packages**: 2.5 kg CO2
- **tons**: 100 kg CO2

### Waste
**General:**
- **kg**: 0.5 kg CO2
- **lbs**: 0.23 kg CO2
- **bags**: 3.0 kg CO2
- **tons**: 500 kg CO2

**By Subcategory:**
- **household**: 0.5 kg/kg, 3.0 kg/bag
- **recyclable**: 0.1 kg/kg, 0.6 kg/bag
- **organic**: 0.3 kg/kg, 1.8 kg/bag
- **electronic**: 1.5 kg/kg, 9.0 kg/bag
- **industrial**: 0.8 kg/kg, 800 kg/ton
- **hazardous**: 2.0 kg/kg, 2000 kg/ton

---

## 🔌 API Endpoints

### 1. Calculate Emissions (GET)
**Endpoint:** `/api/emissions/calculate`

**Query Parameters:**
- `category` (required): Category of emission
- `quantity` (required): Amount/quantity
- `unit` (required): Unit of measurement
- `subcategory` (optional): Specific subcategory

**Example Request:**
```bash
GET /api/emissions/calculate?category=travel&subcategory=car&quantity=50&unit=km
```

**Example Response:**
```json
{
  "co2Emissions": 10.5,
  "category": "travel",
  "subcategory": "car",
  "quantity": 50,
  "unit": "km",
  "message": "Emissions calculated successfully"
}
```

---

### 2. Add Emission (POST)
**Endpoint:** `/api/emissions/add`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category": "electricity",
  "subcategory": "home",
  "quantity": 150,
  "unit": "kWh",
  "date": "2025-10-22",
  "description": "Home electricity usage",
  "department": "Optional - for companies only"
}
```

**Response:**
```json
{
  "message": "Emission logged successfully",
  "emission": {
    "id": 123,
    "category": "electricity",
    "subcategory": "home",
    "quantity": 150,
    "unit": "kWh",
    "co2Emissions": 75.0,
    "date": "2025-10-22",
    "description": "Home electricity usage",
    "department": null
  },
  "co2Emissions": 75.0
}
```

---

### 3. Get Emissions List (GET)
**Endpoint:** `/api/emissions/list`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `category` (optional): Filter by category
- `limit` (optional): Limit number of results

**Example Request:**
```bash
GET /api/emissions/list?category=travel&limit=10
```

**Response:**
```json
{
  "emissions": [
    {
      "id": 123,
      "userId": 1,
      "category": "travel",
      "subcategory": "car",
      "quantity": 50,
      "unit": "km",
      "co2Emissions": 10.5,
      "date": "2025-10-22T00:00:00.000Z",
      "description": "Daily commute",
      "department": null,
      "createdAt": "2025-10-22T10:30:00.000Z"
    }
  ],
  "total": 1,
  "filtered": true,
  "totalEmissions": 10.5
}
```

---

### 4. Get Emissions History (GET)
**Endpoint:** `/api/emissions/history`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "history": [
    {
      "date": "2025-10",
      "emissions": 234.5
    },
    {
      "date": "2025-09",
      "emissions": 312.8
    }
  ],
  "totalEmissions": 547.3,
  "count": 45
}
```

---

### 5. Get Emissions Summary (GET)
**Endpoint:** `/api/emissions/summary`

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "totalEmissions": 547.3,
  "totalEntries": 45,
  "byCategory": {
    "electricity": 225.5,
    "travel": 180.2,
    "fuel": 95.6,
    "waste": 46.0
  },
  "bySubcategory": {
    "car": 120.3,
    "home": 225.5,
    "gasoline": 95.6
  },
  "averageDaily": 18.24,
  "highestDay": {
    "date": "2025-10-15",
    "value": 45.8
  },
  "lowestDay": {
    "date": "2025-10-05",
    "value": 8.2
  },
  "uniqueDays": 30,
  "period": {
    "startDate": "2025-10-01",
    "endDate": "2025-10-22"
  }
}
```

---

### 6. Update Emission (PUT)
**Endpoint:** `/api/emissions/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category": "electricity",
  "quantity": 200,
  "unit": "kWh",
  "date": "2025-10-22",
  "description": "Updated electricity usage"
}
```

**Response:**
```json
{
  "message": "Emission updated successfully",
  "emission": {
    "id": 123,
    "category": "electricity",
    "quantity": 200,
    "unit": "kWh",
    "co2Emissions": 100.0,
    "date": "2025-10-22"
  }
}
```

---

### 7. Delete Emission (DELETE)
**Endpoint:** `/api/emissions/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Emission deleted successfully",
  "id": 123
}
```

---

## 🔒 Security Features

1. **Authentication Required**: All emission operations require a valid JWT token
2. **User Isolation**: Users can only access their own emissions
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Protection**: Using Supabase client with parameterized queries
5. **Error Handling**: Comprehensive error messages without exposing sensitive data

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test-emissions.js
```

This will test:
- ✅ User authentication
- ✅ Emission calculations
- ✅ Adding emissions
- ✅ Retrieving emissions
- ✅ Filtering and sorting
- ✅ Updating emissions
- ✅ Deleting emissions
- ✅ Input validation
- ✅ Edge cases

---

## 📝 Usage Examples

### Frontend Usage (React/TypeScript)

```typescript
import { emissionsAPI } from '@/services/api';

// Add an emission
const addEmission = async () => {
  try {
    const result = await emissionsAPI.add({
      category: 'travel',
      subcategory: 'car',
      quantity: 50,
      unit: 'km',
      date: '2025-10-22',
      description: 'Daily commute'
    });
    
    console.log(`Added emission: ${result.co2Emissions} kg CO₂`);
  } catch (error) {
    console.error('Failed to add emission:', error);
  }
};

// Get emissions summary
const getSummary = async () => {
  try {
    const summary = await emissionsAPI.summary();
    console.log(`Total emissions: ${summary.totalEmissions} kg CO₂`);
    console.log(`Categories:`, summary.byCategory);
  } catch (error) {
    console.error('Failed to get summary:', error);
  }
};

// Calculate before saving
const calculate = async () => {
  try {
    const result = await emissionsAPI.calculate(
      'electricity',
      100,
      'kWh',
      'home'
    );
    console.log(`This would emit ${result.co2Emissions} kg CO₂`);
  } catch (error) {
    console.error('Failed to calculate:', error);
  }
};
```

---

## 🐛 Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created (for POST requests)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (invalid permissions)
- **404**: Not Found
- **500**: Internal Server Error

Error response format:
```json
{
  "message": "Human-readable error message",
  "error": "Technical details (only in development mode)"
}
```

---

## 🚀 Performance Considerations

1. **Database Indexing**: Emissions table is indexed on `user_id` and `date`
2. **Query Optimization**: Uses efficient date range queries
3. **Response Formatting**: Minimal data transformation
4. **Caching**: Consider implementing Redis for frequently accessed summaries
5. **Pagination**: Use `limit` parameter for large datasets

---

## 📦 Database Schema

```sql
CREATE TABLE emissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  co2_emissions DECIMAL(10, 3) NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_emissions_user_id ON emissions(user_id);
CREATE INDEX idx_emissions_date ON emissions(date);
CREATE INDEX idx_emissions_category ON emissions(category);
```

---

## ✅ Validation Rules

1. **Category**: Required, must be valid category
2. **Quantity**: Required, must be positive number
3. **Unit**: Required, must match category's supported units
4. **Date**: Required, must be valid ISO date
5. **Subcategory**: Optional, must match category's subcategories
6. **Description**: Optional, text field
7. **Department**: Optional, for company users only

---

## 🎯 Future Enhancements

- [ ] Bulk emission import from CSV
- [ ] Real-time emission tracking
- [ ] Emission forecasting based on historical data
- [ ] Custom emission factors per user/company
- [ ] Automated emission calculations from IoT devices
- [ ] Carbon offset recommendations
- [ ] Emission comparison with similar users/companies
- [ ] AI-powered emission reduction suggestions

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Run the test suite: `node test-emissions.js`
3. Check server logs for detailed error messages
4. Review the emission factors table for accurate calculations

---

**Last Updated**: October 22, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
