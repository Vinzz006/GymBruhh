from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.user import User, UserSettings
from app.models.notification import Notification
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & Notifications"])

@router.get("")
def get_user_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("")
def update_user_settings(
    settings_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    for key, value in settings_data.items():
        if hasattr(settings, key) and key not in ["id", "user_id"]:
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings

@router.get("/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()
    return notifs

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
