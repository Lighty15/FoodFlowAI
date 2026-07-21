from pydantic import BaseModel
from typing import Optional


class FoodState(BaseModel):
    donor_name: str
    food_name: str
    quantity: int
    location: str
    expiry_hours: int

    validation: Optional[str] = None
    validation_reason: Optional[str] = None

    priority: Optional[str] = None
    priority_reason: Optional[str] = None

    ngo: Optional[str] = None
    volunteer: Optional[str] = None
    status: Optional[str] = None
