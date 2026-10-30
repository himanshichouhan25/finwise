"""Pydantic schemas for User Authentication and Profile."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


class UserRegisterRequest(BaseModel):
    """Payload for user registration."""

    email: str = Field(
        pattern=EMAIL_REGEX,
        min_length=5,
        max_length=255,
        description="Unique email address for login",
    )
    password: str = Field(min_length=6, max_length=128, description="Secure password")
    name: str = Field(min_length=2, max_length=100, description="Full name or display name")
    persona: str = Field(
        default="student",
        description="Investor persona: 'student', 'first_job', or 'gig_worker'",
    )
    language_pref: str = Field(default="en", description="Language preference: 'en' or 'hinglish'")


class UserLoginRequest(BaseModel):
    """Payload for user login."""

    email: str = Field(
        pattern=EMAIL_REGEX,
        min_length=5,
        max_length=255,
        description="Registered email address",
    )
    password: str = Field(min_length=1, description="Password")


class UserAuthProfile(BaseModel):
    """User profile returned upon successful authentication."""

    id: int
    email: str | None = None
    name: str
    persona: str
    language_pref: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    """Token and user payload returned upon login or registration."""

    access_token: str
    token_type: str = "bearer"
    user: UserAuthProfile
