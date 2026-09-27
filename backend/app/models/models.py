import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Amogh")
    mobile_number = Column(String(20), unique=True, index=True, nullable=False)
    preferred_language = Column(String(10), default="en")  # en, ta, te, ml, hi, gu
    profile_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)

    boats = relationship("Boat", back_populates="owner", cascade="all, delete-orphan")
    daily_memories = relationship("MarineDailyMemory", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    saved_zones = relationship("SavedZone", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("ORCAConversation", back_populates="user", cascade="all, delete-orphan")
    whatsapp_messages = relationship("WhatsAppMessage", back_populates="user", cascade="all, delete-orphan")


class Boat(Base):
    __tablename__ = "boats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    boat_name = Column(String(100), default="Sea Star")
    boat_registration = Column(String(50), default="IND-TN-06-MM-4421")
    home_harbour = Column(String(100), default="Kanyakumari")
    emergency_contact = Column(String(20), default="+91 94431 22890")

    owner = relationship("User", back_populates="boats")


class MarineDailyMemory(Base):
    __tablename__ = "marine_daily_memory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    date = Column(String(20), index=True)  # YYYY-MM-DD
    latitude = Column(Float, default=8.0883)
    longitude = Column(Float, default=77.5385)
    sea_condition = Column(String(50), default="Moderate")
    wave_height = Column(Float, default=1.4)  # in meters
    wind_speed = Column(Float, default=12.0)  # in km/h
    weather_status = Column(String(50), default="Moderate")
    sst = Column(Float, default=28.2)  # Sea Surface Temp in °C
    chlorophyll = Column(Float, default=0.8)  # mg/m³
    pfz_latitude = Column(Float, default=8.1500)
    pfz_longitude = Column(Float, default=77.5500)
    pfz_distance = Column(Float, default=18.0)  # km
    pfz_direction = Column(String(20), default="Northeast")
    imbl_distance = Column(Float, default=8.4)  # km
    boundary_status = Column(String(50), default="Safe / Monitor")
    recommendation = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="daily_memories")


class UserMemory(Base):
    __tablename__ = "user_memory"

    memory_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    preferred_language = Column(String(10), default="en")
    home_harbour = Column(String(100), default="Kanyakumari")
    boat_name = Column(String(100), default="Sea Star")
    saved_pfz = Column(Text, default="[]")  # JSON encoded list of saved PFZ IDs
    recently_viewed_pfz = Column(Text, default="PFZ-01")
    recent_alerts = Column(Text, default="[]")
    recent_orca_queries = Column(Text, default="[]")
    last_known_location = Column(String(100), default="8.0883,77.5385")
    last_sync_time = Column(DateTime, default=datetime.datetime.utcnow)


class PFZLocation(Base):
    __tablename__ = "pfz_locations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), default="PFZ-01")
    name = Column(String(100), default="Wadge Bank Northeast")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    distance_km = Column(Float, default=18.0)
    direction = Column(String(30), default="Northeast")
    sst = Column(Float, default=28.2)
    chlorophyll = Column(Float, default=0.8)
    wave_height = Column(Float, default=1.4)
    wind_speed = Column(Float, default=12.0)
    confidence = Column(Integer, default=88)  # percentage
    source = Column(String(50), default="Bhuvan-INCOIS OceanSat-3")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region = Column(String(100), default="Kanyakumari Offshore")
    wind_speed = Column(Float, default=12.0)
    wind_direction = Column(String(20), default="NE")
    wave_height = Column(Float, default=1.4)
    sea_condition = Column(String(50), default="Moderate")
    weather_status = Column(String(50), default="Moderate")
    visibility_km = Column(Float, default=10.0)
    source = Column(String(50), default="MOSDAC / Open-Meteo")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String(50))  # IMBL_PROXIMITY, HIGH_WAVE, WEATHER, PFZ_UPDATE
    title = Column(String(100))
    message = Column(Text)
    action_recommended = Column(Text, default="Monitor sea conditions before travelling further.")
    latitude = Column(Float, default=8.0883)
    longitude = Column(Float, default=77.5385)
    severity = Column(String(20), default="CAUTION")  # SAFE, CAUTION, WARNING, CRITICAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    read_status = Column(Boolean, default=False)

    user = relationship("User", back_populates="alerts")


class SavedZone(Base):
    __tablename__ = "saved_zones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pfz_id = Column(Integer, ForeignKey("pfz_locations.id"))
    zone_name = Column(String(100), default="Zone Alpha")
    latitude = Column(Float)
    longitude = Column(Float)
    notes = Column(Text, default="Productive Wadge Bank zone")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_zones")


class ORCAConversation(Base):
    __tablename__ = "orca_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    language = Column(String(10), default="en")
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    evidence = Column(Text)  # JSON or key-value string
    query_type = Column(String(50), default="GENERAL")  # PFZ, BORDER, WEATHER, COMPARISON
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    mobile_number = Column(String(20))
    message_type = Column(String(50))  # DAILY_UPDATE, ALERT, QUERY_RESPONSE
    message_content = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    delivery_status = Column(String(20), default="Delivered")  # Sent, Delivered, Failed

    user = relationship("User", back_populates="whatsapp_messages")


class OfflineSyncQueue(Base):
    __tablename__ = "offline_sync_queue"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    data_type = Column(String(50))  # SAVED_ZONE, USER_QUERY, TELEMETRY
    data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    synced_at = Column(DateTime, nullable=True)
    sync_status = Column(String(20), default="PENDING")  # PENDING, SYNCED
