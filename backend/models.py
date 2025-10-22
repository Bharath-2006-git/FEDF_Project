from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# ============= User Models =============
class UserBase(BaseModel):
    email: EmailStr
    role: str = Field(default="individual", pattern="^(individual|company|admin)$")
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    company_department: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserInDB(User):
    password: str


# ============= Emission Models =============
class EmissionBase(BaseModel):
    category: str = Field(..., description="Emission category: electricity, travel, fuel, waste, production, logistics")
    subcategory: Optional[str] = None
    quantity: float = Field(..., gt=0, description="Quantity must be positive")
    unit: str = Field(..., description="Unit of measurement: kWh, km, liters, kg, etc.")
    date: datetime
    description: Optional[str] = None
    department: Optional[str] = None


class EmissionCreate(EmissionBase):
    pass


class EmissionUpdate(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    date: Optional[datetime] = None
    description: Optional[str] = None
    department: Optional[str] = None


class Emission(EmissionBase):
    id: int
    user_id: int
    co2_emissions: float
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Goal Models =============
class GoalBase(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=255)
    goal_type: str = Field(..., pattern="^(reduction_percentage|absolute_target)$")
    target_value: float = Field(..., gt=0)
    target_date: datetime
    category: Optional[str] = None


class GoalCreate(GoalBase):
    pass


class Goal(GoalBase):
    id: int
    user_id: int
    current_value: float = 0.0
    status: str = "active"
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============= Response Models =============
class AuthResponse(BaseModel):
    message: str
    token: str
    user: User


class EmissionResponse(BaseModel):
    message: str
    emission: Emission
    co2_emissions: float


class EmissionCalculation(BaseModel):
    total_emissions: float
    categories: dict[str, float]


class EmissionHistory(BaseModel):
    date: str
    emissions: float


class DashboardData(BaseModel):
    total_emissions: float
    monthly_emissions: float
    categories: dict[str, float]
    history: list[EmissionHistory]
    goals: list[Goal]
    recent_emissions: list[Emission]


class MessageResponse(BaseModel):
    message: str


class TipResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    target_role: str
    impact_level: str


class ReportRequest(BaseModel):
    report_type: str
    start_date: datetime
    end_date: datetime


# ============= What-If Analysis Models =============
class WhatIfScenario(BaseModel):
    category: str
    reduction_percentage: float = Field(..., ge=0, le=100)


class WhatIfRequest(BaseModel):
    scenarios: list[WhatIfScenario]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class WhatIfResult(BaseModel):
    original_emissions: float
    projected_emissions: float
    total_reduction: float
    reduction_percentage: float
    category_breakdown: dict[str, dict[str, float]]
