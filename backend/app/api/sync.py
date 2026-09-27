import json
import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import OfflineSyncQueue, PFZLocation, Alert
from ..schemas.schemas import OfflineSyncUploadRequest
from ..agents.geofence_agent import GeospatialGeofenceAgent

router = APIRouter(prefix="/sync", tags=["Offline & Mesh Sync"])
geofence_agent = GeospatialGeofenceAgent()


@router.post("/upload")
def upload_sync_queue(req: OfflineSyncUploadRequest, db: Session = Depends(get_db)):
    synced_count = 0
    now = datetime.datetime.utcnow()
    for item in req.items:
        queue_entry = OfflineSyncQueue(
            user_id=req.user_id,
            data_type=item.data_type,
            data=json.dumps(item.payload),
            created_at=now,
            synced_at=now,
            sync_status="SYNCED",
        )
        db.add(queue_entry)
        synced_count += 1
    db.commit()
    return {"success": True, "synced_items": synced_count, "timestamp": now.strftime("%I:%M %p")}


@router.get("/download")
def download_offline_package(area: str = Query(default="Kanyakumari Coast"), db: Session = Depends(get_db)):
    pfzs = db.query(PFZLocation).all()
    boundaries = geofence_agent.get_boundaries_geojson()

    return {
        "area": area,
        "download_status": "OFFLINE_READY",
        "last_sync": datetime.datetime.now().strftime("%I:%M %p"),
        "cached_data": {
            "marine_summary": {
                "sea_state": "Moderate",
                "wave_height": 1.4,
                "wind_speed": 12.0,
                "weather_status": "Moderate",
            },
            "pfz_locations": [
                {
                    "code": p.code,
                    "name": p.name,
                    "latitude": p.latitude,
                    "longitude": p.longitude,
                    "distance_km": p.distance_km,
                    "direction": p.direction,
                    "sst": p.sst,
                    "chlorophyll": p.chlorophyll,
                }
                for p in pfzs
            ],
            "boundaries": boundaries,
            "offline_safety_advisories": [
                {
                    "type": "IMBL",
                    "text_en": "You are approaching the International Maritime Boundary. Check your route.",
                    "text_ta": "நீங்கள் சர்வதேச கடல் எல்லைக்கு அருகில் செல்கிறீர்கள். தயவுசெய்து உங்கள் பாதையை சரிபார்க்கவும்.",
                },
                {
                    "type": "HIGH_WAVE",
                    "text_en": "High wave conditions detected. Reduce boat speed and stay vigilant.",
                    "text_ta": "அதிக அலை நிலைமை கண்டறியப்பட்டுள்ளது. படகின் வேகத்தைக் குறைத்து எச்சரிக்கையுடன் இருக்கவும்.",
                },
            ],
        },
    }


@router.post("/mesh-simulate")
def simulate_mesh_sync():
    """
    Simulates the SIH Wi-Fi Direct / BLE Mesh communication
    exchanging lightweight emergency hazard packets between nearby fishing boats.
    """
    return {
        "status": "COMPLETED",
        "devices_found": 2,
        "nearby_boats": [
            {
                "boat_name": "Sea Horse (IND-TN-06-SH-310)",
                "distance": "~450 meters",
                "shared_packet": "Wave height 1.5m reported at 8.12N, 77.56E",
                "time": "Just now",
            },
            {
                "boat_name": "Ocean Pride (IND-TN-06-OP-118)",
                "distance": "~720 meters",
                "shared_packet": "IMBL buffer clear. Fish shoal sighted.",
                "time": "1 min ago",
            },
        ],
        "message": "Safety and PFZ packets successfully synchronized across BLE mesh cluster.",
    }
