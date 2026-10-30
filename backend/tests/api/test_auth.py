"""Unit and integration tests for Authentication, JWT tokens, and Password Security."""

import time

import pytest
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.api.v1.auth import demo_login, login, logout, register
from app.core.errors import UnauthorizedError, ValidationFailure
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import UserLoginRequest, UserRegisterRequest


def test_password_hashing_and_verification():
    """Verify bcrypt salt hashing and password verification."""
    password = "SecurePassword@123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(password, None) is False


def test_jwt_token_issuance_and_decoding():
    """Verify HS256 JWT access token generation and claims recovery."""
    token = create_access_token(user_id=101, email="test@finwise.ai")
    assert isinstance(token, str)

    claims = decode_access_token(token)
    assert claims["sub"] == "101"
    assert claims["email"] == "test@finwise.ai"
    assert claims["type"] == "access"


def test_invalid_jwt_token_raises_unauthorized():
    """Tampered or invalid tokens must raise UnauthorizedError."""
    with pytest.raises(UnauthorizedError) as exc_info:
        decode_access_token("not.a.valid.jwt.token")
    assert "Invalid authentication credentials" in str(exc_info.value.message)


def test_register_new_user_flow(db_session: Session):
    """Registering creates user, initial profile, and valid JWT."""
    unique_email = f"user_{int(time.time() * 1000)}@finwise.ai"
    req = UserRegisterRequest(
        email=unique_email,
        password="MySecretPassword99!",
        name="Kabir Roy",
        persona="student",
        language_pref="hinglish",
    )

    resp = register(request=req, db=db_session)
    assert resp.access_token is not None
    assert resp.token_type == "bearer"
    assert resp.user.email == unique_email
    assert resp.user.name == "Kabir Roy"
    assert resp.user.persona == "student"

    # Verify user in database
    user = db_session.query(User).filter(User.id == resp.user.id).first()
    assert user is not None
    assert user.profile is not None
    assert verify_password("MySecretPassword99!", user.hashed_password) is True


def test_register_duplicate_email_rejected(db_session: Session):
    """Duplicate email registration must raise ValidationFailure."""
    unique_email = f"dup_{int(time.time() * 1000)}@finwise.ai"
    req = UserRegisterRequest(
        email=unique_email,
        password="Password123!",
        name="Dup User",
        persona="first_job",
    )
    register(request=req, db=db_session)

    with pytest.raises(ValidationFailure) as exc_info:
        register(request=req, db=db_session)
    assert "already exists" in str(exc_info.value.message).lower()


def test_login_flow_success_and_failure(db_session: Session):
    """Test login with valid password succeeds and wrong password fails."""
    unique_email = f"login_test_{int(time.time() * 1000)}@finwise.ai"
    reg_req = UserRegisterRequest(
        email=unique_email,
        password="ValidPassword@789",
        name="Rhea Roy",
        persona="gig_worker",
    )
    register(request=reg_req, db=db_session)

    # 1. Correct password
    login_req = UserLoginRequest(email=unique_email, password="ValidPassword@789")
    auth_resp = login(request=login_req, db=db_session)
    assert auth_resp.access_token is not None
    assert auth_resp.user.email == unique_email

    # 2. Wrong password
    bad_req = UserLoginRequest(email=unique_email, password="IncorrectPassword")
    with pytest.raises(UnauthorizedError) as exc_info:
        login(request=bad_req, db=db_session)
    assert "Invalid email address or password" in str(exc_info.value.message)


def test_demo_persona_login(db_session: Session):
    """Demo login issues authentic JWT for seeded personas."""
    # Ensure test user 1 exists
    user = db_session.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, name="Aarav Sharma", persona="student", email="aarav@finwise.ai", is_active=True)
        db_session.add(user)
        db_session.commit()

    resp = demo_login(persona_id=1, db=db_session)
    assert resp.access_token is not None
    claims = decode_access_token(resp.access_token)
    assert claims["sub"] == "1"


def test_get_current_user_id_bearer_authentication(db_session: Session):
    """get_current_user_id correctly extracts and authenticates from Authorization header."""
    token = create_access_token(user_id=77, email="user77@finwise.ai")

    # Valid Bearer token
    extracted_id = get_current_user_id(authorization=f"Bearer {token}")
    assert extracted_id == 77

    # Malformed Authorization header
    with pytest.raises(UnauthorizedError):
        get_current_user_id(authorization="Basic dXNlcjpwYXNz")

    # Invalid Bearer token
    with pytest.raises(UnauthorizedError):
        get_current_user_id(authorization="Bearer forged_or_expired_token")


def test_logout_endpoint():
    """Logout endpoint returns success message."""
    resp = logout()
    assert resp["status"] == "success"
