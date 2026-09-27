from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
import datetime


class SendOTPRequest(BaseModel):
    mobile_number: str


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    demo_otp: Optional[str] = "123456"


class VerifyOTPRequest(BaseModel):
    mobile_number: str
    otp: str


class VerifyOTPResponse(BaseModel):
    success: bool
    user_id: int
    mobile_number: str
    preferred_language: str
    profile_completed: bool
    token: str
    message: str


class ProfileUpdateRequest(BaseModel):
    name: str
    boat_name: str
    home_harbour: str
    preferred_language: str = "en"
    boat_registration: Optional[str] = None
    emergency_contact: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: int
    name: str
    mobile_number: str
    boat_name: str
    boat_registration: str
    home_harbour: str
    preferred_language: str
    emergency_contact: str
    last_sync: str
    profile_completed: bool


class SeaCondition(BaseModel):
    sea_state: str
    wave_height: float
    wind_speed: float
    condition: str


class PFZItem(BaseModel):
    id: int
    code: str
    name: str
    latitude: float
    longitude: float
    distance_km: float
    direction: str
    sst: float
    chlorophyll: float
    wave_height: float
    wind_speed: float
    confidence: int
    source: str
    timestamp: str


class SafetyStatus(BaseModel):
    status: str
    imbl_distance_km: float
    wave_height: float
    weather: str
    current_alert: str
    boundary_level: str  # SAFE, CAUTION, WARNING


class MarineTodayResponse(BaseModel):
    date: str
    sea_condition: SeaCondition
    nearby_pfz: PFZItem
    safety_status: SafetyStatus
    orca_recommendation: str
    orca_evidence: Dict[str, Any]
    is_demo_data: bool = True
    data_source: str = "Bhuvan-INCOIS / MOSDAC / Open-Meteo"
    timestamp: str


class AlertItem(BaseModel):
    id: int
    type: str
    title: str
    message: str
    action_recommended: str
    severity: str
    time: str
    read_status: bool


class BoundaryPoint(BaseModel):
    id: int
    name: str
    type: str  # IMBL, MPA (Marine Protected Area)
    coordinates: List[List[float]]  # [[lat, lon], ...]
    warning_distance_km: float
    description: str


class RouteWaypoint(BaseModel):
    latitude: float
    longitude: float
    step_label: str
    risk_level: str


class SafeRouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    target_pfz_id: int


class SafeRouteResponse(BaseModel):
    pfz_code: str
    distance_km: float
    estimated_time_mins: int
    risk_level: str
    boundary_status: str
    weather_status: str
    hazards_detected: str
    waypoints: List[RouteWaypoint]


class ORCAQueryRequest(BaseModel):
    user_id: Optional[int] = 1
    question: str
    language: Optional[str] = "en"
    current_lat: Optional[float] = 8.0883
    current_lon: Optional[float] = 77.5385


class ORCAQueryResponse(BaseModel):
    question: str
    answer: str
    language: str
    detected_intent: str
    evidence: Dict[str, Any]
    map_action: Optional[Dict[str, Any]] = None
    data_timestamp: str
    data_source: str


class WhatsAppMessageItem(BaseModel):
    id: int
    type: str
    content: str
    sent_at: str
    status: str


class WhatsAppSimulateRequest(BaseModel):
    mobile_number: str = "+919876543210"
    command: str  # TODAY, PFZ, WEATHER, ALERTS, BORDER, HELP


class WhatsAppSimulateResponse(BaseModel):
    sender: str
    command: str
    reply_text: str
    sent_at: str
    delivery_status: str


class OfflineSyncItem(BaseModel):
    data_type: str
    payload: Dict[str, Any]
    client_timestamp: str


class OfflineSyncUploadRequest(BaseModel):
    user_id: int
    items: List[OfflineSyncItem]
