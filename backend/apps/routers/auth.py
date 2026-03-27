from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from apps.models.user_model import User
from apps.schema import *
from apps.utils.password import hash_password, verify_password
from apps.utils.jwt import create_access_token
from apps.dependencies import get_db, get_current_user, role_required
from fastapi import UploadFile, File, Form
import shutil
import os
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

UPLOAD_DIR = "uploads/profile"

# 🔥 LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(400, "Invalid credentials")

    if not db_user.is_active:
        raise HTTPException(403, "User account is inactive")

    token = create_access_token({
        "id": db_user.id,
        "role": db_user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role.value,
            "profile_image": db_user.profile_image,
            "is_active": db_user.is_active
        }
    }


# 🔥 REGISTER
@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(400, "Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        profile_image=None,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "id": new_user.id,
        "role": new_user.role.value
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role.value,
            "profile_image": new_user.profile_image,
            "is_active": new_user.is_active
        }
    }


# 🔥 GET CURRENT USER PROFILE
@router.get("/me")
def get_profile(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "profile_image": user.profile_image,
        "is_active": user.is_active
    }


@router.put("/me")
def update_profile(
    name: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # ✅ Update name
    if name:
        user.name = name

    # ✅ Handle file upload
    if file:
        # generate unique filename
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # save path in DB
        user.profile_image = f"/uploads/profile/{filename}"

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated",
        "user": {
            "name": user.name,
            "email": user.email,
            "profile_image": user.profile_image
        }
    }


# 🔥 ADMIN: GET ALL USERS
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin=Depends(role_required("ADMIN"))
):
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "profile_image": u.profile_image,
            "is_active": u.is_active
        }
        for u in users
    ]

@router.get("/user")
def get_all_users(
    db: Session = Depends(get_db),
    admin=Depends(role_required("ADMIN"))
):
    users = db.query(User).filter(User.role != "ADMIN").all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "profile_image": u.profile_image,
            "is_active": u.is_active
        }
        for u in users
    ]

# 🔥 ADMIN: TOGGLE USER ACTIVE
@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(role_required("ADMIN"))
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(404, "User not found")

    user.is_active = not user.is_active
    db.commit()

    return {
        "message": "User status updated",
        "is_active": user.is_active
    }