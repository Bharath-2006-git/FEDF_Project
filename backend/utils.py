"""
Utility functions for CO2 emission calculations and other helpers.
"""

from typing import Optional


def calculate_co2_emissions(
    category: str, 
    quantity: float, 
    unit: str, 
    subcategory: Optional[str] = None
) -> float:
    """
    Calculate CO2 emissions based on category, quantity, unit, and subcategory.
    
    Args:
        category: Emission category (electricity, travel, fuel, waste, production, logistics)
        quantity: Amount of the resource consumed
        unit: Unit of measurement
        subcategory: Optional subcategory for more specific calculations
    
    Returns:
        CO2 emissions in kilograms
    """
    # Comprehensive emission factors (kg CO2 per unit)
    emission_factors = {
        "electricity": {
            "kWh": 0.5,  # Grid average
            "MWh": 500
        },
        "travel": {
            "km": 0.15,      # Average vehicle
            "mile": 0.24,    # Average vehicle
            "miles": 0.24,
            "hours": 5.0     # For flights (approximate)
        },
        "fuel": {
            "liter": 2.31,        # Gasoline
            "liters": 2.31,
            "gallon": 8.74,       # Gasoline
            "gallons": 8.74,
            "cubic_meters": 2.0,  # Natural gas
            "cubic meters": 2.0
        },
        "production": {
            "unit": 1.5,
            "units": 1.5,
            "kg": 0.5,
            "tons": 500,
            "hours": 10.0
        },
        "logistics": {
            "km": 0.8,
            "miles": 1.29,
            "packages": 2.5,
            "tons": 100
        },
        "waste": {
            "kg": 0.5,     # Landfill waste
            "lbs": 0.23,
            "bags": 3.0,   # Assuming ~6kg per bag
            "tons": 500,
            "cubic_meters": 50,
            "cubic meters": 50
        }
    }
    
    # Subcategory-specific factors (override category defaults)
    subcategory_factors = {
        "travel": {
            "car": {"km": 0.21, "mile": 0.34, "miles": 0.34},
            "bus": {"km": 0.05, "mile": 0.08, "miles": 0.08},
            "train": {"km": 0.04, "mile": 0.06, "miles": 0.06},
            "plane": {"km": 0.25, "mile": 0.40, "miles": 0.40, "hours": 90.0},
            "bike": {"km": 0, "mile": 0, "miles": 0},
            "walk": {"km": 0, "mile": 0, "miles": 0}
        },
        "fuel": {
            "gasoline": {"liter": 2.31, "liters": 2.31, "gallon": 8.74, "gallons": 8.74},
            "diesel": {"liter": 2.68, "liters": 2.68, "gallon": 10.15, "gallons": 10.15},
            "natural_gas": {"cubic_meters": 2.0, "cubic meters": 2.0, "liter": 0.002, "liters": 0.002},
            "heating_oil": {"liter": 2.52, "liters": 2.52, "gallon": 9.54, "gallons": 9.54}
        },
        "waste": {
            "household": {"kg": 0.5, "lbs": 0.23, "bags": 3.0},
            "recyclable": {"kg": 0.1, "lbs": 0.05, "bags": 0.6},
            "organic": {"kg": 0.3, "lbs": 0.14, "bags": 1.8},
            "electronic": {"kg": 1.5, "lbs": 0.68, "bags": 9.0},
            "industrial": {"kg": 0.8, "lbs": 0.36, "tons": 800},
            "hazardous": {"kg": 2.0, "lbs": 0.91, "tons": 2000}
        }
    }
    
    # Try subcategory-specific factor first, then category default, then fallback
    factor = 1.0  # Default fallback
    
    if subcategory and subcategory in subcategory_factors.get(category, {}):
        if unit in subcategory_factors[category][subcategory]:
            factor = subcategory_factors[category][subcategory][unit]
    elif category in emission_factors and unit in emission_factors[category]:
        factor = emission_factors[category][unit]
    
    result = quantity * factor
    return round(result, 3)  # Round to 3 decimal places
