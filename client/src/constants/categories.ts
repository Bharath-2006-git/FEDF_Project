import { Car, Home, Zap, Trash2, Factory, Truck } from "lucide-react";

export const INDIVIDUAL_CATEGORIES = [
  {
    value: "electricity",
    label: "Electricity",
    icon: Zap,
    subcategories: ["home", "apartment", "office"],
    units: ["kWh"]
  },
  {
    value: "travel",
    label: "Transportation",
    icon: Car,
    subcategories: ["car", "bus", "train", "plane", "bike", "walk"],
    units: ["miles", "km", "hours"]
  },
  {
    value: "fuel",
    label: "Fuel",
    icon: Home,
    subcategories: ["gasoline", "diesel", "natural_gas", "heating_oil"],
    units: ["liters", "gallons", "cubic_meters"]
  },
  {
    value: "waste",
    label: "Waste",
    icon: Trash2,
    subcategories: ["household", "recyclable", "organic", "electronic"],
    units: ["kg", "lbs", "bags"]
  }
];

export const COMPANY_CATEGORIES = [
  {
    value: "production",
    label: "Production",
    icon: Factory,
    subcategories: ["manufacturing", "assembly", "processing", "packaging"],
    units: ["units", "kg", "tons", "hours"]
  },
  {
    value: "logistics",
    label: "Logistics",
    icon: Truck,
    subcategories: ["shipping", "delivery", "warehouse", "distribution"],
    units: ["km", "miles", "packages", "tons"]
  },
  {
    value: "electricity",
    label: "Electricity",
    icon: Zap,
    subcategories: ["office", "factory", "warehouse", "retail"],
    units: ["kWh", "MWh"]
  },
  {
    value: "waste",
    label: "Waste",
    icon: Trash2,
    subcategories: ["industrial", "office", "recyclable", "hazardous"],
    units: ["kg", "tons", "cubic_meters"]
  }
];
