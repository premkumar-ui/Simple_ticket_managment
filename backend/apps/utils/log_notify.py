from datetime import datetime

def send_ticket_created_notification(ticket):
    print(f"[{datetime.now()}] ✅ Ticket Created")
    print(f"Title: {ticket.title}")
    print(f"User ID: {ticket.user_id}")


def send_ticket_assigned_notification(ticket, user):
    print(f"[{datetime.now()}] 📌 Ticket Assigned")
    print(f"Ticket: {ticket.title}")
    print(f"Assigned to: {user.name}")


def send_ticket_closed_notification(ticket):
    print(f"[{datetime.now()}] 🔒 Ticket Closed")
    print(f"Ticket: {ticket.title}")