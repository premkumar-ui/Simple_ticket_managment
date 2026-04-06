from apps.models.comments_model import Comment
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload
from apps.models.ticket_model import Ticket
from apps.schema import *
from apps.dependencies import get_db, get_current_user, role_required
from apps.models.user_model import User

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.post("/{ticket_id}")
def add_comment(
    ticket_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    comment = Comment(
        content=data.content,
        user_id=user.id,
        ticket_id=ticket_id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {"message": "Comment added"}


@router.get("/{ticket_id}", response_model=list[CommentOut])
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.desc())
        .all()
    )

    return comments


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()

    if not comment:
        raise HTTPException(404, "Comment not found")

    # 🔥 ownership check
    if comment.user_id != user.id:
        raise HTTPException(403, "Not allowed to delete this comment")

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted"}