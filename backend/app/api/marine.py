import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import PFZLocation, WeatherData, Alert, SavedZone, MarineDailyMemory
from ..schemas.schemas import (
    MarineTodayResponse,
    SeaCondition,
    PFZItem,
    SafetyStatus,
    AlertItem,
    SafeRouteRequest,
    SafeRouteResponse,
)
from ..agents.marine_agent import MarineOceanDiscoveryAgent
from ..agents.weather_agent import WeatherHazardAgent
from ..agents.geofence_agent import GeospatialGeofenceAgent
from ..agents.trajectory_agent import TrajectoryOptimizerAgent
from ..agents.xai_agent import ExplainableAIAgent

router = APIRouter(prefix="/marine", tags=["Marine Intelligence"])

marine_agent = MarineOceanDiscoveryAgent()
weather_agent = WeatherHazardAgent()
geofence_agent = GeospatialGeofenceAgent()
trajectory_agent = TrajectoryOptimizerAgent()
xai_agent = ExplainableAIAgent()


@router.get("/today", response_model=MarineTodayResponse)
def get_today_marine(
    lat: float = Query(default=8.0883),
    lon: float = Query(default=77.5385),
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    timestamp_str = datetime.datetime.now().strftime("%I:%M %p")
    today_date = "2026-09-26"

    # Get or generate daily record
    mem = (
        db.query(MarineDailyMemory)
        .filter(MarineDailyMemory.user_id == user_id, MarineDailyMemory.date == today_date)
        .first()
    )

    nearest = marine_agent.get_nearest_pfz(lat, lon)
    weather = weather_agent.get_weather_forecast(lat, lon)
    imbl_dist = geofence_agent.get_imbl_distance_km(lat, lon)
    boundary_eval = geofence_agent.evaluate_boundary_status(imbl_dist)

    evidence = xai_agent.generate_pfz_evidence(
        nearest, weather, {"distance_km": imbl_dist, "status": boundary_eval["status"]}, timestamp_str
    )

    sea_cond = SeaCondition(
        sea_state=weather["sea_state"],
        wave_height=weather["wave_height"],
        wind_speed=weather["wind_speed"],
        condition=weather["condition"],
    )

    pfz_item = PFZItem(
        id=nearest["id"],
        code=nearest["code"],
        name=nearest["name"],
        latitude=nearest["latitude"],
        longitude=nearest["longitude"],
        distance_km=nearest["distance_km"],
        direction=nearest["direction"],
        sst=nearest["sst"],
        chlorophyll=nearest["chlorophyll"],
        wave_height=nearest["wave_height"],
        wind_speed=nearest["wind_speed"],
        confidence=nearest["confidence"],
        source=nearest["source"],
        timestamp=timestamp_str,
    )

    safety = SafetyStatus(
        status="SAFE",
        imbl_distance_km=imbl_dist,
        wave_height=weather["wave_height"],
        weather=weather["condition"],
        current_alert="No immediate warning",
        boundary_level=boundary_eval["level"],
    )

    orca_recommendation = (
        f"Current marine conditions are moderate. A potential fishing zone is available "
        f"approximately {nearest['distance_km']} km {nearest['direction'].lower()} of your current location. "
        f"Monitor wave and weather conditions before travelling."
    )

    return MarineTodayResponse(
        date=today_date,
        sea_condition=sea_cond,
        nearby_pfz=pfz_item,
        safety_status=safety,
        orca_recommendation=orca_recommendation,
        orca_evidence=evidence,
        is_demo_data=True,
        data_source="Bhuvan-INCOIS / MOSDAC / Open-Meteo",
        timestamp=timestamp_str,
    )


@router.get("/pfz", response_model=List[PFZItem])
def get_pfz_list(lat: float = Query(default=8.0883), lon: float = Query(default=77.5385)):
    zones = marine_agent.get_all_pfz(lat, lon)
    timestamp_str = "10:30 AM"
    return [
        PFZItem(
            id=z["id"],
            code=z["code"],
            name=z["name"],
            latitude=z["latitude"],
            longitude=z["longitude"],
            distance_km=z["distance_km"],
            direction=z["direction"],
            sst=z["sst"],
            chlorophyll=z["chlorophyll"],
            wave_height=z["wave_height"],
            wind_speed=z["wind_speed"],
            confidence=z["confidence"],
            source=z["source"],
            timestamp=timestamp_str,
        )
        for z in zones
    ]


@router.get("/weather")
def get_weather(lat: float = Query(default=8.0883), lon: float = Query(default=77.5385)):
    return weather_agent.get_weather_forecast(lat, lon)


@router.get("/alerts", response_model=List[AlertItem])
def get_alerts(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .filter((Alert.user_id == user_id) | (Alert.user_id == None))
        .order_by(Alert.created_at.desc())
        .all()
    )
    result = []
    for a in alerts:
        result.append(
            AlertItem(
                id=a.id,
                type=a.type,
                title=a.title,
                message=a.message,
                action_recommended=a.action_recommended,
                severity=a.severity,
                time=a.created_at.strftime("%I:%M %p"),
                read_status=a.read_status,
            )
        )
    return result


@router.put("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.read_status = True
        db.commit()
    return {"success": True}


@router.get("/boundaries")
def get_boundaries():
    return geofence_agent.get_boundaries_geojson()


@router.post("/safe-route", response_model=SafeRouteResponse)
def compute_route(req: SafeRouteRequest):
    pfz = marine_agent.get_nearest_pfz(req.start_lat, req.start_lon)
    route = trajectory_agent.compute_safe_route(
        req.start_lat, req.start_lon, pfz["latitude"], pfz["longitude"], pfz["code"]
    )
    return SafeRouteResponse(
        pfz_code=pfz["code"],
        distance_km=route["distance_km"],
        estimated_time_mins=route["estimated_time_mins"],
        risk_level=route["risk_level"],
        boundary_status=route["boundary_status"],
        weather_status=route["weather_status"],
        hazards_detected=route["hazards_detected"],
        waypoints=route["waypoints"],
    )


@router.post("/save-zone")
def save_fishing_zone(
    pfz_id: int, user_id: int = Query(default=1), notes: str = "", db: Session = Depends(get_db)
):
    saved = SavedZone(
        user_id=user_id,
        pfz_id=pfz_id,
        zone_name=f"Zone PFZ-0{pfz_id}",
        notes=notes or "Saved from satellite map view",
    )
    db.add(saved)
    db.commit()
    return {"success": True, "message": "Fishing zone saved to your memory"}


@router.get("/saved-zones")
def get_saved_zones(user_id: int = Query(default=1), db: Session = Depends(get_db)):
    zones = db.query(SavedZone).filter(SavedZone.user_id == user_id).all()
    return [
        {
            "id": z.id,
            "pfz_id": z.pfz_id,
            "zone_name": z.zone_name,
            "notes": z.notes,
            "created_at": z.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for z in zones
    ]
