# 🚀 Quick Start Guide - Emission Operations

## Server Running
```bash
npm run dev:full
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api

---

## 🔐 Authentication

### Login
```javascript
POST /api/auth/login
{
  "email": "demo@carbonsense.com",
  "password": "demo123"
}

// Response: { token, user }
// Use token in headers: Authorization: Bearer <token>
```

---

## 📊 Emission Operations

### 1️⃣ Add Emission
```javascript
POST /api/emissions/add
Headers: { Authorization: "Bearer <token>" }
Body: {
  "category": "travel",
  "subcategory": "car",
  "quantity": 50,
  "unit": "km",
  "date": "2025-10-22",
  "description": "Daily commute"
}

Response: {
  "message": "Emission logged successfully",
  "emission": { ... },
  "co2Emissions": 10.5
}
```

### 2️⃣ Calculate (Preview)
```javascript
GET /api/emissions/calculate?category=electricity&quantity=100&unit=kWh
Headers: { Authorization: "Bearer <token>" }

Response: {
  "co2Emissions": 50,
  "category": "electricity",
  "quantity": 100,
  "unit": "kWh"
}
```

### 3️⃣ Get List
```javascript
GET /api/emissions/list
Optional params: ?category=travel&limit=10&startDate=2025-10-01

Response: {
  "emissions": [...],
  "total": 10,
  "totalEmissions": 234.5
}
```

### 4️⃣ Get History (Monthly)
```javascript
GET /api/emissions/history
Optional params: ?startDate=2025-10-01&endDate=2025-10-31

Response: {
  "history": [
    { "date": "2025-10", "emissions": 234.5 }
  ],
  "totalEmissions": 234.5,
  "count": 15
}
```

### 5️⃣ Get Summary
```javascript
GET /api/emissions/summary

Response: {
  "totalEmissions": 547.3,
  "byCategory": { "electricity": 225.5, ... },
  "bySubcategory": { "car": 120.3, ... },
  "averageDaily": 18.24,
  "highestDay": { "date": "2025-10-15", "value": 45.8 },
  "lowestDay": { "date": "2025-10-05", "value": 8.2 }
}
```

### 6️⃣ Update Emission
```javascript
PUT /api/emissions/:id
Body: {
  "category": "electricity",
  "quantity": 200,
  "unit": "kWh",
  "date": "2025-10-22"
}

Response: {
  "message": "Emission updated successfully",
  "emission": { ... }
}
```

### 7️⃣ Delete Emission
```javascript
DELETE /api/emissions/:id

Response: {
  "message": "Emission deleted successfully",
  "id": 123
}
```

---

## 📋 Categories & Units

### Electricity
- Units: kWh, MWh
- Factor: 0.5 kg/kWh

### Travel
- Units: km, miles, hours
- Subcategories: car, bus, train, plane, bike, walk
- Factors: car=0.21kg/km, bus=0.05kg/km, plane=90kg/hour

### Fuel
- Units: liters, gallons, cubic_meters
- Subcategories: gasoline, diesel, natural_gas, heating_oil
- Factor: gasoline=2.31kg/L, diesel=2.68kg/L

### Production
- Units: units, kg, tons, hours
- Factor: 1.5 kg/unit

### Logistics
- Units: km, miles, packages, tons
- Factor: 0.8 kg/km

### Waste
- Units: kg, lbs, bags, tons
- Subcategories: household, recyclable, organic, electronic, industrial, hazardous
- Factor: household=0.5kg/kg, recyclable=0.1kg/kg

---

## 💻 Frontend Usage

```typescript
import { emissionsAPI } from '@/services/api';

// Add emission
const result = await emissionsAPI.add({
  category: 'travel',
  subcategory: 'car',
  quantity: 50,
  unit: 'km',
  date: '2025-10-22'
});
console.log(`CO₂: ${result.co2Emissions} kg`);

// Get summary
const summary = await emissionsAPI.summary();
console.log(`Total: ${summary.totalEmissions} kg CO₂`);
console.log('By category:', summary.byCategory);

// Calculate preview
const preview = await emissionsAPI.calculate(
  'electricity', 100, 'kWh'
);
console.log(`Would emit: ${preview.co2Emissions} kg CO₂`);
```

---

## 🧪 Testing

### Manual Test in Browser Console:
```javascript
// 1. Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@carbonsense.com',
    password: 'demo123'
  })
});
const { token } = await loginRes.json();

// 2. Add emission
const addRes = await fetch('/api/emissions/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    category: 'travel',
    subcategory: 'car',
    quantity: 50,
    unit: 'km',
    date: '2025-10-22'
  })
});
const emission = await addRes.json();
console.log('Added:', emission);

// 3. Get summary
const summaryRes = await fetch('/api/emissions/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const summary = await summaryRes.json();
console.log('Summary:', summary);
```

---

## 🎯 Common Use Cases

### Track Daily Commute
```javascript
await emissionsAPI.add({
  category: 'travel',
  subcategory: 'car',
  quantity: 30,
  unit: 'km',
  date: new Date().toISOString().split('T')[0],
  description: 'Work commute'
});
```

### Log Home Electricity
```javascript
await emissionsAPI.add({
  category: 'electricity',
  quantity: 150,
  unit: 'kWh',
  date: new Date().toISOString().split('T')[0],
  description: 'Monthly bill'
});
```

### Get Monthly Report
```javascript
const startDate = '2025-10-01';
const endDate = '2025-10-31';
const summary = await emissionsAPI.summary(startDate, endDate);
```

---

## ✅ Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (no/invalid token)
- **500**: Server Error

---

## 📚 Documentation Files

- `EMISSION_OPERATIONS_GUIDE.md` - Complete API documentation
- `EMISSION_BACKEND_SUMMARY.md` - Implementation details
- `EMISSION_VERIFICATION.md` - Verification report
- `QUICK_START.md` - This file

---

**🚀 Everything is ready to use!**
