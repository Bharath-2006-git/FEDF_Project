from supabase import create_client, Client
from config import get_settings
from typing import Optional, List
from datetime import datetime, timedelta
from models import UserCreate, UserInDB, EmissionCreate, Emission, GoalCreate, Goal
from decimal import Decimal

settings = get_settings()


class DatabaseStorage:
    """Database storage layer using Supabase."""
    
    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    # ============= User Operations =============
    async def get_user(self, user_id: int) -> Optional[UserInDB]:
        """Get user by ID."""
        response = self.supabase.table("users").select("*").eq("id", user_id).limit(1).execute()
        if response.data:
            return self._convert_user_from_db(response.data[0])
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        response = self.supabase.table("users").select("*").eq("email", email).limit(1).execute()
        if response.data:
            return self._convert_user_from_db(response.data[0])
        return None
    
    async def create_user(self, user: UserCreate, hashed_password: str) -> UserInDB:
        """Create a new user."""
        user_data = {
            "email": user.email,
            "password": hashed_password,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "company_name": user.company_name,
            "company_department": user.company_department,
        }
        
        response = self.supabase.table("users").insert(user_data).execute()
        return self._convert_user_from_db(response.data[0])
    
    # ============= Emission Operations =============
    async def add_emission(self, user_id: int, emission: EmissionCreate, co2_emissions: float) -> Emission:
        """Add a new emission entry."""
        emission_data = {
            "user_id": user_id,
            "category": emission.category,
            "subcategory": emission.subcategory,
            "quantity": str(emission.quantity),
            "unit": emission.unit,
            "co2_emissions": str(co2_emissions),
            "date": emission.date.isoformat(),
            "description": emission.description,
            "department": emission.department,
        }
        
        response = self.supabase.table("emissions").insert(emission_data).execute()
        return self._convert_emission_from_db(response.data[0])
    
    async def update_emission(self, emission_id: int, user_id: int, update_data: dict) -> None:
        """Update an emission entry."""
        self.supabase.table("emissions").update(update_data).eq("id", emission_id).eq("user_id", user_id).execute()
    
    async def delete_emission(self, emission_id: int, user_id: int) -> None:
        """Delete an emission entry."""
        self.supabase.table("emissions").delete().eq("id", emission_id).eq("user_id", user_id).execute()
    
    async def get_user_emissions(
        self, 
        user_id: int, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[Emission]:
        """Get all emissions for a user, optionally filtered by date range."""
        query = self.supabase.table("emissions").select("*").eq("user_id", user_id).order("date", desc=True)
        
        if start_date and end_date:
            query = query.gte("date", start_date.isoformat()).lte("date", end_date.isoformat())
        
        response = query.execute()
        return [self._convert_emission_from_db(e) for e in response.data]
    
    async def calculate_total_emissions(
        self, 
        user_id: int, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> float:
        """Calculate total emissions for a user."""
        emissions = await self.get_user_emissions(user_id, start_date, end_date)
        return sum(e.co2_emissions for e in emissions)
    
    async def get_emissions_by_category(
        self, 
        user_id: int, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> dict[str, float]:
        """Get emissions grouped by category."""
        emissions = await self.get_user_emissions(user_id, start_date, end_date)
        categories: dict[str, float] = {}
        
        for emission in emissions:
            category = emission.category
            categories[category] = categories.get(category, 0.0) + emission.co2_emissions
        
        return categories
    
    # ============= Goal Operations =============
    async def create_goal(self, user_id: int, goal: GoalCreate) -> Goal:
        """Create a new goal."""
        goal_data = {
            "user_id": user_id,
            "goal_name": goal.goal_name,
            "goal_type": goal.goal_type,
            "target_value": str(goal.target_value),
            "target_date": goal.target_date.isoformat(),
            "category": goal.category,
        }
        
        response = self.supabase.table("goals").insert(goal_data).execute()
        return self._convert_goal_from_db(response.data[0])
    
    async def get_user_goals(self, user_id: int) -> List[Goal]:
        """Get all goals for a user."""
        response = self.supabase.table("goals").select("*").eq("user_id", user_id).execute()
        return [self._convert_goal_from_db(g) for g in response.data]
    
    async def update_goal_progress(self, goal_id: int, current_value: float) -> None:
        """Update goal progress."""
        self.supabase.table("goals").update({"current_value": str(current_value)}).eq("id", goal_id).execute()
    
    # ============= Tips Operations =============
    async def get_tips_for_user(self, role: str, category: Optional[str] = None) -> List[dict]:
        """Get tips for a user based on role."""
        target_role = "individual" if role == "individual" else "company"
        query = self.supabase.table("tips").select("*").eq("target_role", target_role)
        
        if category:
            query = query.eq("category", category)
        
        response = query.execute()
        return response.data
    
    async def save_report(
        self, 
        user_id: int, 
        report_type: str, 
        report_date: datetime, 
        file_path: str, 
        report_data: dict
    ) -> None:
        """Save a report."""
        report = {
            "user_id": user_id,
            "report_type": report_type,
            "report_date": report_date.isoformat(),
            "file_path": file_path,
            "file_format": "pdf" if file_path.endswith(".pdf") else "csv",
            "report_data": report_data,
        }
        
        self.supabase.table("reports").insert(report).execute()
    
    # ============= Helper Methods =============
    def _convert_user_from_db(self, data: dict) -> UserInDB:
        """Convert database user to UserInDB model."""
        return UserInDB(
            id=data["id"],
            email=data["email"],
            password=data["password"],
            role=data["role"],
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            company_name=data.get("company_name"),
            company_department=data.get("company_department"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")) if isinstance(data["created_at"], str) else data["created_at"],
            updated_at=datetime.fromisoformat(data["updated_at"].replace("Z", "+00:00")) if data.get("updated_at") and isinstance(data["updated_at"], str) else data.get("updated_at"),
        )
    
    def _convert_emission_from_db(self, data: dict) -> Emission:
        """Convert database emission to Emission model."""
        return Emission(
            id=data["id"],
            user_id=data["user_id"],
            category=data["category"],
            subcategory=data.get("subcategory"),
            quantity=float(data["quantity"]),
            unit=data["unit"],
            co2_emissions=float(data["co2_emissions"]),
            date=datetime.fromisoformat(data["date"].replace("Z", "+00:00")) if isinstance(data["date"], str) else data["date"],
            description=data.get("description"),
            department=data.get("department"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")) if isinstance(data["created_at"], str) else data["created_at"],
        )
    
    def _convert_goal_from_db(self, data: dict) -> Goal:
        """Convert database goal to Goal model."""
        return Goal(
            id=data["id"],
            user_id=data["user_id"],
            goal_name=data["goal_name"],
            goal_type=data["goal_type"],
            target_value=float(data["target_value"]),
            current_value=float(data.get("current_value", 0)),
            target_date=datetime.fromisoformat(data["target_date"].replace("Z", "+00:00")) if isinstance(data["target_date"], str) else data["target_date"],
            status=data.get("status", "active"),
            category=data.get("category"),
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")) if isinstance(data["created_at"], str) else data["created_at"],
            completed_at=datetime.fromisoformat(data["completed_at"].replace("Z", "+00:00")) if data.get("completed_at") and isinstance(data["completed_at"], str) else data.get("completed_at"),
        )


# Singleton instance
storage = DatabaseStorage()
