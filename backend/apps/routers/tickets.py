from typing import Optional
from apps.utils.redis_client import (
    clear_ticket_cache,
    clear_ticket_cache,
    get_cache,
    set_cache,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload
from apps.models.ticket_model import Ticket
from apps.schema import *
from apps.dependencies import get_db, get_current_user, role_required
from apps.models.user_model import User
from fastapi import BackgroundTasks
from apps.utils.log_notify import *

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/")
def create_ticket(
    data: TicketCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(role_required("USER")),
):
    ticket = Ticket(
        title=data.title,
        description=data.description,
        priority=data.priority,
        user_id=user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    background_tasks.add_task(send_ticket_created_notification, ticket)
    clear_ticket_cache()
    return ticket


# @router.get("/")
# def get_all_tickets(
#     db: Session = Depends(get_db),
#     user = Depends(role_required("ADMIN"))
# ):
#     return db.query(Ticket).all()

@router.get("/")
def get_all_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user=Depends(role_required("ADMIN")),
):
    cache_key = f"tickets:{status}:{priority}:{search}:{skip}:{limit}"

    cached_data = get_cache(cache_key)
    if cached_data:
        return cached_data

    query = db.query(Ticket)

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    tickets = query.offset(skip).limit(limit).all()

    # 🔥 convert to JSON serializable
    ticket_list = [TicketResponse.model_validate(t).model_dump(mode="json") for t in tickets]

    response = {
        "total": total,
        "data": ticket_list
    }

    set_cache(cache_key, response, expire=300)

    return response


@router.get("/my")
def get_my_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user=Depends(role_required("USER")),
):
    query = db.query(Ticket).filter(Ticket.user_id == user.id)

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
            )
        )

    return query.all()


@router.put("/sp/{id}")
def update_ticket(
    id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    user=Depends(role_required("ADMIN")),
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    # if ticket.assigned_to != user.id:
    #     raise HTTPException(403, "Not allowed to update this ticket")

    if data.status is not None:
        ticket.status = data.status

        if data.status == "closed":
            ticket.closed_at = func.now()

    if data.priority is not None:
        ticket.priority = data.priority
    ticket.updated_at = func.now()

    db.commit()
    db.refresh(ticket)
    clear_ticket_cache()
    return {
        "message": "Ticket updated",
        "data": {"id": ticket.id, "status": ticket.status, "priority": ticket.priority},
    }


@router.get("/stats")
def get_ticket_stats(
    db: Session = Depends(get_db), user=Depends(role_required("ADMIN"))
):
    cache_key = "ticket_stats"

    cached = get_cache(cache_key)
    if cached:
        return cached

    total = db.query(func.count(Ticket.id)).scalar()

    open_count = (
        db.query(func.count(Ticket.id)).filter(Ticket.status == "open").scalar()
    )
    closed_count = (
        db.query(func.count(Ticket.id)).filter(Ticket.status == "closed").scalar()
    )
    in_progress_count = (
        db.query(func.count(Ticket.id)).filter(Ticket.status == "in_progress").scalar()
    )

    # 🔥 Priority distribution
    priority_data = (
        db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    )

    priority_stats = {"High": 0, "Medium": 0, "Low": 0}

    for p, count in priority_data:
        priority_stats[p] = count
    response ={
        "total": total,
        "status": {
            "open": open_count,
            "in_progress": in_progress_count,
            "closed": closed_count,
        },
        "priority": priority_stats,
    }
    set_cache(cache_key, response, expire=300)
    
    return response



@router.put("/{id}/assign")
def assign_ticket(
    id: int,
    data: TicketAssign,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(role_required("ADMIN")),
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    assigned_user = db.query(User).filter(User.id == data.assigned_to).first()

    if not assigned_user:
        raise HTTPException(404, "User not found")

    ticket.assigned_to = assigned_user.id
    ticket.updated_at = func.now()

    db.commit()
    db.refresh(ticket)
    background_tasks.add_task(
        send_ticket_assigned_notification, ticket, assigned_user
    )
    clear_ticket_cache()
    return {"message": "Ticket assigned", "assigned_to": assigned_user.name}


@router.get("/assigned/my")
def get_my_assigned_tickets(
    db: Session = Depends(get_db), user=Depends(get_current_user)
):
    tickets = db.query(Ticket).filter(Ticket.assigned_to == user.id).all()

    return tickets


@router.get("/assigned", response_model=list[TicketOut])
def get_tickets_by_user(
    user_id: int | None = None,
    db: Session = Depends(get_db),
    admin=Depends(role_required("ADMIN")),
):

    query = db.query(Ticket).options(joinedload(Ticket.assigned_user))

    if user_id is not None:
        query = query.filter(Ticket.assigned_to == user_id)
    else:
        query = query.filter(Ticket.assigned_to.isnot(None))

    return query.all()


@router.put("/{id}/status")
def update_ticket_status(
    id: int,
    data: TicketStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(404, "Ticket not found")

    # 🔥 enforce assignment rule
    if ticket.assigned_to != user.id:
        raise HTTPException(403, "Not allowed to update this ticket")

    ticket.status = data.status
    ticket.updated_at = func.now()

    # 🔥 auto close timestamp
    if data.status == "closed":
        ticket.closed_at = func.now()
        background_tasks.add_task(send_ticket_closed_notification, ticket)

    db.commit()
    db.refresh(ticket)
    clear_ticket_cache()
    return {"message": "Status updated", "status": ticket.status}


@router.get("/{id}", response_model=TicketOut)
def get_ticket_by_id(
    id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.user))
        .options(joinedload(Ticket.assigned_user))
        .filter(Ticket.id == id)
        .first()
    )

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return ticket
