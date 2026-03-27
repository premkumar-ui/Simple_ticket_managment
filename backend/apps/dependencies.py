from fastapi import Depends, HTTPException
from jose import jwt, JWTError
from fastapi.security import HTTPBearer
from apps.database import SessionLocal
from apps.models.user_model import User
from apps.utils.jwt import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token=Depends(security), db=Depends(get_db)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.id == payload.get("id")).first()
        if not user:
            raise HTTPException(401, "Invalid user")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")

def role_required(required_role: str):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role.value != required_role:
            raise HTTPException(403, "Access denied")
        return current_user
    return role_checker