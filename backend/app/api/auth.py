from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.services import auth_service
from backend.app.services.auth_service import get_db
from backend.app.db import models

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = 'donor'


@router.post('/register', response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = auth_service.get_user_by_username(db, user.username)
    if existing:
        raise HTTPException(status_code=400, detail='Username already registered')
    hashed = auth_service.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {'username': db_user.username, 'role': db_user.role}


@router.post('/token', response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={'sub': user.username}, expires_delta=access_token_expires
    )
    return {'access_token': access_token, 'token_type': 'bearer'}


@router.get('/me')
def read_users_me(current_user: models.User = Depends(auth_service.get_current_user)):
    return {'username': current_user.username, 'role': current_user.role}
