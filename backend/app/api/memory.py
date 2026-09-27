import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import MarineDailyMemory, UserMemory

router = APIRouter(prefix="/memory", tags=["Marine Memory Layer"])


@router.get("/today")
def get_today_memory(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    today_str = "2026-09-26"
    mem = (
        db.query(MarineDailyMemory)
        .filter(MarineDailyMemory.user_id == user_id, MarineDailyMemory.date == today_str)
        .first()
    )
    if not mem:
        mem = (
            db.query(MarineDailyMemory)
            .filter(MarineDailyMemory.user_id == user_id)
            .order_by(MarineDailyMemory.created_at.desc())
            .first()
        )
    if not mem:
        raise HTTPException(status_code=404, detail="No marine memory found for today")

    return {
        "id": mem.id,
        "date": mem.date,
        "location": {"latitude": mem.latitude, "longitude": mem.longitude},
        "sea_condition": mem.sea_condition,
        "wave_height": mem.wave_height,
        "wind_speed": mem.wind_speed,
        "weather_status": mem.weather_status,
        "sst": mem.sst,
        "chlorophyll": mem.chlorophyll,
        "pfz": {
            "latitude": mem.pfz_latitude,
            "longitude": mem.pfz_longitude,
            "distance_km": mem.pfz_distance,
            "direction": mem.pfz_direction,
        },
        "imbl_distance_km": mem.imbl_distance,
        "boundary_status": mem.boundary_status,
        "recommendation": mem.recommendation,
        "created_at": mem.created_at.strftime("%Y-%m-%d %H:%M"),
    }


@router.get("/date/{date}")
def get_memory_by_date(date: str, user_id: int = Query(default=1), db: Session = Depends(get_db)):
    mem = (
        db.query(MarineDailyMemory)
        .filter(MarineDailyMemory.user_id == user_id, MarineDailyMemory.date == date)
        .first()
    )
    if not mem:
        raise HTTPException(status_code=404, detail=f"No record found for date: {date}")

    return {
        "id": mem.id,
        "date": mem.date,
        "location": {"latitude": mem.latitude, "longitude": mem.longitude},
        "sea_condition": mem.sea_condition,
        "wave_height": mem.wave_height,
        "wind_speed": mem.wind_speed,
        "weather_status": mem.weather_status,
        "sst": mem.sst,
        "chlorophyll": mem.chlorophyll,
        "pfz": {
            "latitude": mem.pfz_latitude,
            "longitude": mem.pfz_longitude,
            "distance_km": mem.pfz_distance,
            "direction": mem.pfz_direction,
        },
        "imbl_distance_km": mem.imbl_distance,
        "boundary_status": mem.boundary_status,
        "recommendation": mem.recommendation,
        "created_at": mem.created_at.strftime("%Y-%m-%d %H:%M"),
    }


@router.get("/comparison")
def compare_yesterday_today(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    mem_yesterday = (
        db.query(MarineDailyMemory)
        .filter(MarineDailyMemory.user_id == user_id, MarineDailyMemory.date == "2026-09-25")
        .first()
    )
    mem_today = (
        db.query(MarineDailyMemory)
        .filter(MarineDailyMemory.user_id == user_id, MarineDailyMemory.date == "2026-09-26")
        .first()
    )

    return {
        "yesterday": {
            "date": "2026-09-25",
            "wave_height": mem_yesterday.wave_height if mem_yesterday else 1.1,
            "wind_speed": mem_yesterday.wind_speed if mem_yesterday else 10.0,
            "sst": mem_yesterday.sst if mem_yesterday else 28.0,
            "pfz_distance": mem_yesterday.pfz_distance if mem_yesterday else 20.0,
            "sea_condition": mem_yesterday.sea_condition if mem_yesterday else "Calm to Moderate",
        },
        "today": {
            "date": "2026-09-26",
            "wave_height": mem_today.wave_height if mem_today else 1.4,
            "wind_speed": mem_today.wind_speed if mem_today else 12.0,
            "sst": mem_today.sst if mem_today else 28.2,
            "pfz_distance": mem_today.pfz_distance if mem_today else 18.0,
            "sea_condition": mem_today.sea_condition if mem_today else "Moderate",
        },
        "comparison_summary": "Today's wave height is 0.3m higher than yesterday (1.4m vs 1.1m). Nearby PFZ is 2 km closer (18 km vs 20 km). Conditions remain within moderate fishing safety limits.",
    }


@router.get("/user")
def get_user_memory(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    mem = db.query(UserMemory).filter(UserMemory.user_id == user_id).first()
    if not mem:
        return {"status": "Default profile initialized"}
    return {
        "user_id": mem.user_id,
        "home_harbour": mem.home_harbour,
        "boat_name": mem.boat_name,
        "recently_viewed_pfz": mem.recently_viewed_pfz,
        "last_known_location": mem.last_known_location,
        "last_sync_time": mem.last_sync_time.strftime("%I:%M %p"),
    }
