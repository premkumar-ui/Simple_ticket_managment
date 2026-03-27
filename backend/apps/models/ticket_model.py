from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from apps.database import Base
from sqlalchemy.orm import relationship


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(String(500))
    priority = Column(String(20))
    status = Column(String(20), default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    assigned_user = relationship(
    "User",
    foreign_keys=[assigned_to],
    back_populates="assigned_tickets"
)