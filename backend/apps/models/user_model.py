from sqlalchemy import Column, Integer, String, Boolean, Enum
from apps.database import Base
import enum
from sqlalchemy.orm import relationship

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False,)
    email = Column(String(155), unique=True, index=True)
    password = Column(String(225), nullable=False)

    role = Column(Enum(UserRole), default=UserRole.USER)

    profile_image = Column(String(225), nullable=True)
    is_active = Column(Boolean, default=True)
    
    tickets = relationship(
    "Ticket",
    foreign_keys="Ticket.user_id",
    back_populates="user"
    )

    assigned_tickets = relationship(
        "Ticket",
        foreign_keys="Ticket.assigned_to",
        back_populates="assigned_user"
    )