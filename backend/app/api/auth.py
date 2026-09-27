import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User, Boat, UserMemory
from ..schemas.schemas import (
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(req: SendOTPRequest):
    mobile = req.mobile_number.strip()
    if not mobile or len(mobile) < 10:
        raise HTTPException(status_code=400, detail="Invalid mobile number format")

    return SendOTPResponse(
        success=True,
        message=f"OTP sent to {mobile}. For SIH Hackathon testing, use Demo OTP: 123456.",
        demo_otp="123456",
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    mobile = req.mobile_number.strip()
    otp = req.otp.strip()

    # Verify Demo OTP (123456 is standard hackathon demo OTP)
    if otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Please enter 123456 for demo verification.")

    user = db.query(User).filter(User.mobile_number == mobile).first()
    if not user:
        # Create new user
        user = User(
            name="",
            mobile_number=mobile,
            preferred_language="en",
            profile_completed=False,
            created_at=datetime.datetime.utcnow(),
            last_login=datetime.datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create default empty boat entry
        boat = Boat(
            user_id=user.id,
            boat_name="",
            boat_registration="",
            home_harbour="",
            emergency_contact="",
        )
        db.add(boat)

        # Create memory record
        user_memory = UserMemory(
            user_id=user.id,
            preferred_language="en",
            home_harbour="",
            boat_name="",
            saved_pfz="[]",
            recently_viewed_pfz="PFZ-01",
            last_known_location="8.0883,77.5385",
            last_sync_time=datetime.datetime.utcnow(),
        )
        db.add(user_memory)
        db.commit()
    else:
        user.last_login = datetime.datetime.utcnow()
        db.commit()

    return VerifyOTPResponse(
        success=True,
        user_id=user.id,
        mobile_number=user.mobile_number,
        preferred_language=user.preferred_language,
        profile_completed=user.profile_completed,
        token=f"bhuvan_jwt_token_{user.id}_{int(datetime.datetime.utcnow().timestamp())}",
        message="Verification successful.",
    )
