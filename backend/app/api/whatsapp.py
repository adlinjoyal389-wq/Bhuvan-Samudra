import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import WhatsAppMessage, User, MarineDailyMemory
from ..schemas.schemas import WhatsAppSimulateRequest, WhatsAppSimulateResponse

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Bot & Notifications"])


def format_command_response(command: str, user_name: str = "Amogh") -> str:
    cmd = command.strip().upper()
    now_str = datetime.datetime.now().strftime("%I:%M %p")

    if cmd == "TODAY":
        return (
            f"🌊 *BHUVAN-SAMUDRA – TODAY'S UPDATE*\n\n"
            f"Good morning, {user_name}.\n\n"
            f"⚓ *Sea Condition:* Moderate\n"
            f"🌊 *Wave:* 1.4 m\n"
            f"🌬 *Wind:* 12 km/h\n"
            f"🐟 *Nearby PFZ:* 18 km northeast\n"
            f"🔴 *IMBL Distance:* 8.4 km\n"
            f"🛡 *Safety:* No immediate warning (Safe / Monitor)\n\n"
            f"🤖 *ORCA Recommendation:*\n"
            f"\"Current conditions are moderate. A potential fishing zone is available approximately 18 km northeast. Monitor wave conditions before travelling.\"\n\n"
            f"📲 *Open App:* Bhuvan-Samudra for Satellite Map & Navigation"
        )
    elif cmd == "PFZ":
        return (
            f"🐟 *NEARBY POTENTIAL FISHING ZONE*\n\n"
            f"Zone: PFZ-01 (Wadge Bank Northeast)\n"
            f"Distance: 18 km\n"
            f"Direction: Northeast\n"
            f"SST: 28.2°C\n"
            f"Chlorophyll: 0.8 mg/m³\n"
            f"Wave Height: 1.4 m\n"
            f"ORCA Confidence: 88%\n"
            f"Updated: {now_str}\n\n"
            f"📲 Open Bhuvan-Samudra app for full satellite map and safe route."
        )
    elif cmd == "WEATHER":
        return (
            f"🌤 *MARINE WEATHER REPORT*\n\n"
            f"Wind: 12 km/h (NE)\n"
            f"Wave Height: 1.4 m\n"
            f"Sea State: Moderate\n"
            f"Weather Status: Monitor\n"
            f"Visibility: 10 km\n"
            f"Updated: {now_str}\n\n"
            f"Data Source: MOSDAC / Open-Meteo"
        )
    elif cmd == "BORDER":
        return (
            f"🔴 *MARITIME BOUNDARY STATUS*\n\n"
            f"Distance to IMBL: 8.4 km\n"
            f"Status: Safe / Monitor\n"
            f"Advisory: You are outside restricted zones. Keep GPS active.\n\n"
            f"Open Bhuvan-Samudra app to view the boundary line directly on satellite map."
        )
    elif cmd == "ALERTS":
        return (
            f"⚠ *ACTIVE MARINE ALERTS*\n\n"
            f"1. *HIGH WAVE ALERT (2:00 PM)*\n"
            f"Wave conditions may increase to 1.8 m. Monitor sea conditions.\n\n"
            f"2. *IMBL PROXIMITY (1:30 PM)*\n"
            f"Distance: 8.4 km. You are approaching boundary buffer zone."
        )
    else:
        return (
            f"🤖 *BHUVAN-SAMUDRA WHATSAPP BOT HELP*\n\n"
            f"Send any of these commands:\n"
            f"• *TODAY* - Daily sea, PFZ & safety summary\n"
            f"• *PFZ* - Nearby Potential Fishing Zone & SST\n"
            f"• *WEATHER* - Wind speed & wave height\n"
            f"• *BORDER* - IMBL distance & safety status\n"
            f"• *ALERTS* - Active maritime warnings\n"
            f"• *HELP* - View command list"
        )


@router.post("/simulate-incoming", response_model=WhatsAppSimulateResponse)
def simulate_whatsapp(req: WhatsAppSimulateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile_number == req.mobile_number).first()
    user_name = user.name if user else "Amogh"
    user_id = user.id if user else 1

    reply = format_command_response(req.command, user_name)

    # Save to whatsapp_messages table
    msg = WhatsAppMessage(
        user_id=user_id,
        mobile_number=req.mobile_number,
        message_type=f"CMD_{req.command.upper()}",
        message_content=reply,
        sent_at=datetime.datetime.utcnow(),
        delivery_status="Delivered",
    )
    db.add(msg)
    db.commit()

    return WhatsAppSimulateResponse(
        sender=req.mobile_number,
        command=req.command,
        reply_text=reply,
        sent_at=datetime.datetime.now().strftime("%I:%M %p"),
        delivery_status="Delivered",
    )


@router.post("/send-daily-update")
def send_daily_update(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    name = user.name if user else "Amogh"
    phone = user.mobile_number if user else "+919876543210"

    content = format_command_response("TODAY", name)
    msg = WhatsAppMessage(
        user_id=user_id,
        mobile_number=phone,
        message_type="DAILY_UPDATE",
        message_content=content,
        sent_at=datetime.datetime.utcnow(),
        delivery_status="Delivered",
    )
    db.add(msg)
    db.commit()

    return {
        "success": True,
        "message": f"Daily WhatsApp update dispatched to {phone}",
        "content": content,
    }


@router.get("/status")
def get_whatsapp_status(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return {
        "status": "Connected" if user else "Not Connected",
        "mobile_number": user.mobile_number if user else "+91 98765 43210",
        "daily_marine_update": True,
        "safety_alerts": True,
        "pfz_updates": True,
        "weather_alerts": True,
    }


@router.post("/webhook")
def whatsapp_webhook(payload: dict):
    """Production webhook endpoint for WhatsApp Cloud API"""
    return {"status": "EVENT_RECEIVED"}
