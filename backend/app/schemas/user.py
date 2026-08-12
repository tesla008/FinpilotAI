from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture_url: str | None
    created_at: datetime
    onboarding_status: str

    model_config = {"from_attributes": True}


class GoogleSignInRequest(BaseModel):
    id_token: str
