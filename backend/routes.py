"""
FastAPI routes for CarbonSense API
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from models import (
    UserCreate, UserLogin, User, AuthResponse, MessageResponse,
    EmissionCreate, EmissionUpdate, Emission, EmissionResponse,
    EmissionCalculation, EmissionHistory, DashboardData,
    GoalCreate, Goal, TipResponse, ReportRequest, WhatIfRequest, WhatIfResult
)
from storage import storage
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from utils import calculate_co2_emissions

# Create router
router = APIRouter()


# ============= Authentication Routes =============

@router.post("/api/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """Register a new user."""
    print(f"📝 Signup request received: {user_data.email}")
    
    # Check if user already exists
    existing_user = await storage.get_user_by_email(user_data.email)
    if existing_user:
        print(f"❌ User already exists: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    print("✓ Password hashed")
    
    # Create user
    user = await storage.create_user(user_data, hashed_password)
    print(f"✓ User created with ID: {user.id}")
    
    # Generate JWT token
    token = create_access_token({
        "userId": user.id,
        "email": user.email,
        "role": user.role
    })
    print("✓ JWT token generated")
    
    # Return response (exclude password)
    user_dict = user.dict(exclude={"password"})
    print(f"✅ Signup successful for: {user_data.email}")
    
    return AuthResponse(
        message="User created successfully",
        token=token,
        user=User(**user_dict)
    )


@router.post("/api/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """Login a user."""
    print(f"🔐 Login request received: {credentials.email}")
    
    # Special handling for demo account
    if credentials.email == "demo@carbonsense.com" and credentials.password == "demo123":
        print("👤 Demo account login")
        demo_user = User(
            id=999,
            email="demo@carbonsense.com",
            first_name="Demo",
            last_name="User",
            role="individual",
            created_at=datetime.utcnow()
        )
        
        token = create_access_token({
            "userId": 999,
            "email": "demo@carbonsense.com",
            "role": "individual"
        })
        
        return AuthResponse(
            message="Demo login successful",
            token=token,
            user=demo_user
        )
    
    # Find user
    user = await storage.get_user_by_email(credentials.email)
    if not user:
        print(f"❌ User not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    print("✓ User found")
    
    # Verify password
    if not verify_password(credentials.password, user.password):
        print(f"❌ Invalid password for: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    print("✓ Password verified")
    
    # Generate token
    token = create_access_token({
        "userId": user.id,
        "email": user.email,
        "role": user.role
    })
    print("✓ JWT token generated")
    
    user_dict = user.dict(exclude={"password"})
    print(f"✅ Login successful for: {credentials.email}")
    
    return AuthResponse(
        message="Login successful",
        token=token,
        user=User(**user_dict)
    )


# ============= Emission Routes =============

@router.post("/api/emissions/add", response_model=EmissionResponse, status_code=status.HTTP_201_CREATED)
async def add_emission(
    emission_data: EmissionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new emission entry."""
    print("📊 Add emission request received")
    
    # Calculate CO2 emissions
    co2_emissions = calculate_co2_emissions(
        emission_data.category,
        emission_data.quantity,
        emission_data.unit,
        emission_data.subcategory
    )
    
    print(f"✓ Calculated CO2: {co2_emissions}kg for {emission_data.quantity}{emission_data.unit} of {emission_data.category}")
    
    # Add to database
    emission = await storage.add_emission(current_user["userId"], emission_data, co2_emissions)
    print(f"✅ Emission logged successfully with ID: {emission.id}")
    
    return EmissionResponse(
        message="Emission logged successfully",
        emission=emission,
        co2_emissions=co2_emissions
    )


@router.get("/api/emissions/calculate")
async def calculate_emissions(
    category: str = Query(..., description="Emission category"),
    quantity: float = Query(..., gt=0, description="Quantity"),
    unit: str = Query(..., description="Unit of measurement"),
    subcategory: Optional[str] = Query(None, description="Subcategory"),
    current_user: dict = Depends(get_current_user)
):
    """Calculate CO2 emissions for given parameters."""
    print("🧮 Calculate emissions request received")
    
    co2_emissions = calculate_co2_emissions(category, quantity, unit, subcategory)
    
    print(f"✓ Calculated: {co2_emissions}kg CO2 for {quantity}{unit} of {category}")
    
    return {
        "co2_emissions": co2_emissions,
        "category": category,
        "subcategory": subcategory,
        "quantity": quantity,
        "unit": unit,
        "message": "Emissions calculated successfully"
    }


@router.get("/api/emissions/history")
async def get_emissions_history(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get emissions history grouped by month."""
    print("📜 Emissions history request received")
    
    # Parse dates if provided
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    emissions = await storage.get_user_emissions(current_user["userId"], start, end)
    print(f"✓ Found {len(emissions)} emissions for user {current_user['userId']}")
    
    # Group by month
    history_dict = {}
    for emission in emissions:
        month = emission.date.strftime("%Y-%m")
        history_dict[month] = history_dict.get(month, 0.0) + emission.co2_emissions
    
    history_array = [
        EmissionHistory(date=month, emissions=round(total, 3))
        for month, total in sorted(history_dict.items())
    ]
    
    total_emissions = sum(h.emissions for h in history_array)
    
    print(f"✅ Returning {len(history_array)} months of history")
    
    return {
        "history": history_array,
        "total_emissions": total_emissions,
        "count": len(emissions)
    }


@router.get("/api/emissions/list")
async def list_emissions(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get list of emissions."""
    print("📋 Emissions list request received")
    
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    emissions = await storage.get_user_emissions(current_user["userId"], start, end)
    
    # Filter by category if provided
    if category:
        emissions = [e for e in emissions if e.category == category]
    
    # Apply limit if provided
    if limit:
        emissions = emissions[:limit]
    
    total_emissions = sum(e.co2_emissions for e in emissions)
    
    print(f"✅ Returning {len(emissions)} emissions")
    
    return {
        "emissions": emissions,
        "total": len(emissions),
        "filtered": bool(category),
        "total_emissions": total_emissions
    }


@router.get("/api/emissions/summary")
async def get_emissions_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get emission statistics and summary."""
    print("📊 Emissions summary request received")
    
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    emissions = await storage.get_user_emissions(current_user["userId"], start, end)
    
    # Calculate total emissions
    total_emissions = sum(e.co2_emissions for e in emissions)
    
    # Group by category
    by_category = {}
    for e in emissions:
        by_category[e.category] = by_category.get(e.category, 0.0) + e.co2_emissions
    
    # Group by subcategory
    by_subcategory = {}
    for e in emissions:
        if e.subcategory:
            by_subcategory[e.subcategory] = by_subcategory.get(e.subcategory, 0.0) + e.co2_emissions
    
    # Calculate daily stats
    daily_emissions = {}
    for e in emissions:
        date_str = e.date.strftime("%Y-%m-%d")
        daily_emissions[date_str] = daily_emissions.get(date_str, 0.0) + e.co2_emissions
    
    unique_days = len(daily_emissions)
    average_daily = total_emissions / unique_days if unique_days > 0 else 0
    
    highest_day = max(daily_emissions.items(), key=lambda x: x[1]) if daily_emissions else None
    lowest_day = min(daily_emissions.items(), key=lambda x: x[1]) if daily_emissions else None
    
    print(f"✅ Summary: {total_emissions:.2f}kg CO2 from {len(emissions)} entries")
    
    return {
        "total_emissions": round(total_emissions, 3),
        "total_entries": len(emissions),
        "by_category": {k: round(v, 3) for k, v in by_category.items()},
        "by_subcategory": {k: round(v, 3) for k, v in by_subcategory.items()},
        "average_daily": round(average_daily, 3),
        "highest_day": {"date": highest_day[0], "value": round(highest_day[1], 3)} if highest_day else None,
        "lowest_day": {"date": lowest_day[0], "value": round(lowest_day[1], 3)} if lowest_day else None,
        "unique_days": unique_days,
        "period": {"start_date": start_date, "end_date": end_date}
    }


@router.put("/api/emissions/{emission_id}", response_model=EmissionResponse)
async def update_emission(
    emission_id: int,
    update_data: EmissionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an emission entry."""
    print("✏️ Update emission request received")
    
    # Calculate new CO2 if values changed
    update_dict = update_data.dict(exclude_unset=True)
    
    if any(k in update_dict for k in ["category", "quantity", "unit", "subcategory"]):
        # Need to recalculate CO2
        # First get the current emission to fill in missing values
        emissions = await storage.get_user_emissions(current_user["userId"])
        current = next((e for e in emissions if e.id == emission_id), None)
        
        if not current:
            raise HTTPException(status_code=404, detail="Emission not found")
        
        category = update_dict.get("category", current.category)
        quantity = update_dict.get("quantity", current.quantity)
        unit = update_dict.get("unit", current.unit)
        subcategory = update_dict.get("subcategory", current.subcategory)
        
        co2_emissions = calculate_co2_emissions(category, quantity, unit, subcategory)
        update_dict["co2_emissions"] = str(co2_emissions)
    
    # Convert to database format
    db_update = {}
    field_mapping = {
        "category": "category",
        "subcategory": "subcategory",
        "quantity": "quantity",
        "unit": "unit",
        "date": "date",
        "description": "description",
        "department": "department",
        "co2_emissions": "co2_emissions"
    }
    
    for key, value in update_dict.items():
        if key in field_mapping and value is not None:
            db_key = field_mapping[key]
            if key in ["quantity", "co2_emissions"]:
                db_update[db_key] = str(value)
            elif key == "date" and isinstance(value, datetime):
                db_update[db_key] = value.isoformat()
            else:
                db_update[db_key] = value
    
    await storage.update_emission(emission_id, current_user["userId"], db_update)
    
    # Get updated emission
    emissions = await storage.get_user_emissions(current_user["userId"])
    updated = next((e for e in emissions if e.id == emission_id), None)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Emission not found")
    
    print(f"✅ Emission {emission_id} updated successfully")
    
    return EmissionResponse(
        message="Emission updated successfully",
        emission=updated,
        co2_emissions=updated.co2_emissions
    )


@router.delete("/api/emissions/{emission_id}", response_model=MessageResponse)
async def delete_emission(
    emission_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete an emission entry."""
    print("🗑️ Delete emission request received")
    
    await storage.delete_emission(emission_id, current_user["userId"])
    
    print(f"✅ Emission {emission_id} deleted successfully")
    
    return MessageResponse(message="Emission deleted successfully")


# ============= Goal Routes =============

@router.post("/api/goals", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new goal."""
    goal = await storage.create_goal(current_user["userId"], goal_data)
    return goal


@router.get("/api/goals", response_model=List[Goal])
async def get_goals(current_user: dict = Depends(get_current_user)):
    """Get all goals for the current user."""
    goals = await storage.get_user_goals(current_user["userId"])
    return goals


# ============= Tips Routes =============

@router.get("/api/tips", response_model=List[TipResponse])
async def get_tips(
    category: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get eco-friendly tips."""
    tips = await storage.get_tips_for_user(current_user["role"], category)
    
    if limit:
        tips = tips[:limit]
    
    return [TipResponse(**tip) for tip in tips]


# ============= User/Profile Routes =============

@router.get("/api/user/profile", response_model=User)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    user = await storage.get_user(current_user["userId"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user.dict(exclude={"password"}))


@router.put("/api/profile", response_model=MessageResponse)
async def update_profile(current_user: dict = Depends(get_current_user)):
    """Update user profile."""
    # TODO: Implement profile update
    return MessageResponse(message="Profile updated successfully")


# ============= Reports Routes =============

@router.post("/api/reports/generate")
async def generate_report(
    report_request: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate an emissions report."""
    # Get emissions for the period
    emissions = await storage.get_user_emissions(
        current_user["userId"],
        report_request.start_date,
        report_request.end_date
    )
    
    # Calculate breakdown
    breakdown = {}
    for e in emissions:
        breakdown[e.category] = breakdown.get(e.category, 0.0) + e.co2_emissions
    
    total_emissions = sum(breakdown.values())
    
    data = {
        "total_emissions": total_emissions,
        "breakdown": breakdown,
        "period": {
            "start_date": report_request.start_date.isoformat(),
            "end_date": report_request.end_date.isoformat()
        }
    }
    
    # Create dummy report record
    import time
    report = {
        "id": int(time.time()),
        "user_id": current_user["userId"],
        "report_type": report_request.report_type,
        "start_date": report_request.start_date.isoformat(),
        "end_date": report_request.end_date.isoformat(),
        "file_path": f"/reports/{current_user['userId']}_{report_request.report_type}_{int(time.time())}.json",
        "status": "completed",
        "created_at": datetime.utcnow().isoformat()
    }
    
    return {
        "report": report,
        "data": data,
        "message": "Report generated successfully"
    }


# ============= Dashboard Route =============

@router.get("/api/dashboard", response_model=DashboardData)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Get dashboard data for the current user."""
    # Get all-time emissions
    total_emissions = await storage.calculate_total_emissions(current_user["userId"])
    
    # Get current month emissions
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_end = (month_start + relativedelta(months=1)) - timedelta(seconds=1)
    
    monthly_emissions = await storage.calculate_total_emissions(
        current_user["userId"],
        month_start,
        month_end
    )
    
    # Get emissions by category
    categories = await storage.get_emissions_by_category(current_user["userId"])
    
    # Get history for last 6 months
    six_months_ago = now - relativedelta(months=6)
    emissions = await storage.get_user_emissions(current_user["userId"], six_months_ago, now)
    
    history_dict = {}
    for e in emissions:
        month = e.date.strftime("%Y-%m")
        history_dict[month] = history_dict.get(month, 0.0) + e.co2_emissions
    
    history = [
        EmissionHistory(date=month, emissions=round(total, 3))
        for month, total in sorted(history_dict.items())
    ]
    
    # Get goals
    goals = await storage.get_user_goals(current_user["userId"])
    
    # Get recent emissions (last 10)
    recent_emissions = emissions[:10] if len(emissions) > 0 else []
    
    return DashboardData(
        total_emissions=round(total_emissions, 3),
        monthly_emissions=round(monthly_emissions, 3),
        categories={k: round(v, 3) for k, v in categories.items()},
        history=history,
        goals=goals,
        recent_emissions=recent_emissions
    )


# ============= What-If Analysis Route =============

@router.post("/api/whatif", response_model=WhatIfResult)
async def what_if_analysis(
    request: WhatIfRequest,
    current_user: dict = Depends(get_current_user)
):
    """Perform what-if analysis for emission reduction scenarios."""
    # Get emissions for the period
    emissions = await storage.get_user_emissions(
        current_user["userId"],
        request.start_date,
        request.end_date
    )
    
    # Calculate original emissions by category
    original_by_category = {}
    for e in emissions:
        original_by_category[e.category] = original_by_category.get(e.category, 0.0) + e.co2_emissions
    
    original_total = sum(original_by_category.values())
    
    # Apply scenarios
    projected_by_category = original_by_category.copy()
    category_breakdown = {}
    
    for scenario in request.scenarios:
        if scenario.category in projected_by_category:
            original = projected_by_category[scenario.category]
            reduction = original * (scenario.reduction_percentage / 100)
            projected = original - reduction
            projected_by_category[scenario.category] = projected
            
            category_breakdown[scenario.category] = {
                "original": round(original, 3),
                "projected": round(projected, 3),
                "reduction": round(reduction, 3),
                "reduction_percentage": scenario.reduction_percentage
            }
    
    projected_total = sum(projected_by_category.values())
    total_reduction = original_total - projected_total
    reduction_percentage = (total_reduction / original_total * 100) if original_total > 0 else 0
    
    return WhatIfResult(
        original_emissions=round(original_total, 3),
        projected_emissions=round(projected_total, 3),
        total_reduction=round(total_reduction, 3),
        reduction_percentage=round(reduction_percentage, 2),
        category_breakdown=category_breakdown
    )


# ============= Dummy/Test Routes =============

@router.get("/api/dummy/dashboard")
async def get_dummy_dashboard():
    """Get dummy dashboard data for testing."""
    return {
        "total_emissions": 1234.5,
        "monthly_emissions": 234.7,
        "categories": {
            "electricity": 450.2,
            "travel": 320.8,
            "fuel": 123.5,
            "waste": 67.3
        },
        "history": [
            {"date": "2024-01", "emissions": 400},
            {"date": "2024-02", "emissions": 380},
            {"date": "2024-03", "emissions": 420},
            {"date": "2024-04", "emissions": 350},
            {"date": "2024-05", "emissions": 320},
            {"date": "2024-06", "emissions": 234.7}
        ],
        "goals": [
            {"id": 1, "name": "Reduce electricity by 20%", "progress": 65, "target": 20},
            {"id": 2, "name": "Cut travel emissions by 30%", "progress": 45, "target": 30}
        ]
    }
