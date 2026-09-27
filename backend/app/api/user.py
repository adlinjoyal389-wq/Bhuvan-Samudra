import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User, Boat, UserMemory
from ..schemas.schemas import ProfileUpdateRequest, UserProfileResponse

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback to first available user or create Amogh
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    boat = db.query(Boat).filter(Boat.user_id == user.id).first()
    mem = db.query(UserMemory).filter(UserMemory.user_id == user.id).first()

    last_sync_str = (
        mem.last_sync_time.strftime("%I:%M %p") if mem and mem.last_sync_time else "10:30 AM"
    )

    return UserProfileResponse(
        id=user.id,
        name=user.name or "Amogh",
        mobile_number=user.mobile_number,
        boat_name=boat.boat_name if boat else "Sea Star",
        boat_registration=boat.boat_registration if boat else "IND-TN-06-MM-4421",
        home_harbour=boat.home_harbour if boat else "Kanyakumari",
        preferred_language=user.preferred_language or "en",
        emergency_contact=boat.emergency_contact if boat else "+91 94431 22890",
        last_sync=last_sync_str,
        profile_completed=user.profile_completed,
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(req: ProfileUpdateRequest, user_id: int = Query(default=1), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

    user.name = req.name
    user.preferred_language = req.preferred_language
    user.profile_completed = True

    boat = db.query(Boat).filter(Boat.user_id == user.id).first()
    if not boat:
        boat = Boat(user_id=user.id)
        db.add(boat)

    boat.boat_name = req.boat_name
    boat.home_harbour = req.home_harbour
    if req.boat_registration:
        boat.boat_registration = req.boat_registration
    if req.emergency_contact:
        boat.emergency_contact = req.emergency_contact

    # Update user memory
    mem = db.query(UserMemory).filter(UserMemory.user_id == user.id).first()
    if mem:
        mem.preferred_language = req.preferred_language
        mem.home_harbour = req.home_harbour
        mem.boat_name = req.boat_name
        mem.last_sync_time = datetime.datetime.utcnow()

    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        name=user.name,
        mobile_number=user.mobile_number,
        boat_name=boat.boat_name,
        boat_registration=boat.boat_registration,
        home_harbour=boat.home_harbour,
        preferred_language=user.preferred_language,
        emergency_contact=boat.emergency_contact,
        last_sync=datetime.datetime.now().strftime("%I:%M %p"),
        profile_completed=user.profile_completed,
    )


@router.put("/language")
def update_language(language: str = Query(..., regex="^(en|ta|te|ml|hi|gu)$"), user_id: int = Query(default=1), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    if user:
        user.preferred_language = language
        mem = db.query(UserMemory).filter(UserMemory.user_id == user.id).first()
        if mem:
            mem.preferred_language = language
        db.commit()
    return {"success": True, "preferred_language": language}
