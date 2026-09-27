import datetime
from sqlalchemy.orm import Session
from ..models.models import (
    User,
    Boat,
    MarineDailyMemory,
    UserMemory,
    PFZLocation,
    WeatherData,
    Alert,
    SavedZone,
    WhatsAppMessage,
)


def seed_database(db: Session):
    # Check if user already seeded
    existing_user = db.query(User).filter(User.mobile_number == "+919876543210").first()
    if existing_user:
        return existing_user

    # 1. Create Default User (Amogh)
    user = User(
        name="Amogh",
        mobile_number="+919876543210",
        preferred_language="en",
        profile_completed=True,
        created_at=datetime.datetime(2026, 9, 20, 8, 0, 0),
        last_login=datetime.datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Boat
    boat = Boat(
        user_id=user.id,
        boat_name="Sea Star",
        boat_registration="IND-TN-06-MM-4421",
        home_harbour="Kanyakumari",
        emergency_contact="+91 94431 22890",
    )
    db.add(boat)

    # 3. Create User Memory
    user_memory = UserMemory(
        user_id=user.id,
        preferred_language="en",
        home_harbour="Kanyakumari",
        boat_name="Sea Star",
        saved_pfz='["PFZ-01"]',
        recently_viewed_pfz="PFZ-01",
        last_known_location="8.0883,77.5385",
        last_sync_time=datetime.datetime.utcnow(),
    )
    db.add(user_memory)

    # 4. Create PFZ Locations
    pfz1 = PFZLocation(
        code="PFZ-01",
        name="Wadge Bank Northeast Shoal",
        latitude=8.1500,
        longitude=77.5500,
        distance_km=18.0,
        direction="Northeast",
        sst=28.2,
        chlorophyll=0.80,
        wave_height=1.4,
        wind_speed=12.0,
        confidence=88,
        source="Bhuvan-INCOIS OceanSat-3 (Demo)",
        timestamp=datetime.datetime(2026, 9, 26, 10, 30, 0),
    )
    pfz2 = PFZLocation(
        code="PFZ-02",
        name="Cape Comorin Deep Shelf",
        latitude=7.9800,
        longitude=77.6200,
        distance_km=24.5,
        direction="Southeast",
        sst=27.9,
        chlorophyll=0.72,
        wave_height=1.6,
        wind_speed=14.0,
        confidence=82,
        source="Bhuvan-INCOIS OceanSat-3 (Demo)",
        timestamp=datetime.datetime(2026, 9, 26, 10, 30, 0),
    )
    pfz3 = PFZLocation(
        code="PFZ-03",
        name="Colachel Coastal Upwelling",
        latitude=8.1800,
        longitude=77.2500,
        distance_km=33.0,
        direction="Northwest",
        sst=28.5,
        chlorophyll=0.95,
        wave_height=1.3,
        wind_speed=11.0,
        confidence=85,
        source="Bhuvan-INCOIS OceanSat-3 (Demo)",
        timestamp=datetime.datetime(2026, 9, 26, 10, 30, 0),
    )
    db.add_all([pfz1, pfz2, pfz3])
    db.commit()

    # 5. Saved Zone
    saved_z = SavedZone(
        user_id=user.id,
        pfz_id=pfz1.id,
        zone_name="Wadge Bank Favorite Zone",
        latitude=8.1500,
        longitude=77.5500,
        notes="High tuna concentration observed near thermal front",
    )
    db.add(saved_z)

    # 6. Weather Data
    weather = WeatherData(
        latitude=8.0883,
        longitude=77.5385,
        region="Kanyakumari Offshore",
        wind_speed=12.0,
        wind_direction="NE",
        wave_height=1.4,
        sea_condition="Moderate",
        weather_status="Moderate",
        visibility_km=10.0,
        source="MOSDAC / Open-Meteo",
        timestamp=datetime.datetime(2026, 9, 26, 10, 25, 0),
    )
    db.add(weather)

    # 7. Marine Daily Memories (Yesterday: 2026-09-25, Today: 2026-09-26)
    mem_yesterday = MarineDailyMemory(
        user_id=user.id,
        date="2026-09-25",
        latitude=8.0883,
        longitude=77.5385,
        sea_condition="Calm to Moderate",
        wave_height=1.1,
        wind_speed=10.0,
        weather_status="Clear",
        sst=28.0,
        chlorophyll=0.75,
        pfz_latitude=8.1600,
        pfz_longitude=77.5600,
        pfz_distance=20.0,
        pfz_direction="Northeast",
        imbl_distance=8.8,
        boundary_status="Safe / Monitor",
        recommendation="Calm to moderate sea. Stored PFZ information showed a location approximately 20 km northeast.",
        created_at=datetime.datetime(2026, 9, 25, 6, 0, 0),
        updated_at=datetime.datetime(2026, 9, 25, 18, 0, 0),
    )

    mem_today = MarineDailyMemory(
        user_id=user.id,
        date="2026-09-26",
        latitude=8.0883,
        longitude=77.5385,
        sea_condition="Moderate",
        wave_height=1.4,
        wind_speed=12.0,
        weather_status="Moderate",
        sst=28.2,
        chlorophyll=0.80,
        pfz_latitude=8.1500,
        pfz_longitude=77.5500,
        pfz_distance=18.0,
        pfz_direction="Northeast",
        imbl_distance=8.4,
        boundary_status="Safe / Monitor",
        recommendation="Current marine conditions are moderate. A potential fishing zone is available approximately 18 km northeast of your current location. Monitor wave and weather conditions before travelling.",
        created_at=datetime.datetime(2026, 9, 26, 6, 0, 0),
        updated_at=datetime.datetime(2026, 9, 26, 10, 30, 0),
    )
    db.add_all([mem_yesterday, mem_today])

    # 8. Alerts
    alert1 = Alert(
        user_id=user.id,
        type="HIGH_WAVE",
        title="HIGH WAVE ALERT",
        message="Wave conditions may increase towards 1.8 m by late afternoon. Monitor sea conditions before travelling further.",
        action_recommended="Monitor sea conditions before travelling further.",
        latitude=8.0883,
        longitude=77.5385,
        severity="WARNING",
        created_at=datetime.datetime(2026, 9, 26, 14, 0, 0),
        read_status=False,
    )
    alert2 = Alert(
        user_id=user.id,
        type="IMBL_PROXIMITY",
        title="IMBL PROXIMITY WARNING",
        message="You are approaching the International Maritime Boundary Line. Current distance is 8.4 km.",
        action_recommended="Verify GPS coordinates and steer westwards if necessary.",
        latitude=8.0883,
        longitude=77.5385,
        severity="CAUTION",
        created_at=datetime.datetime(2026, 9, 26, 13, 30, 0),
        read_status=False,
    )
    alert3 = Alert(
        user_id=user.id,
        type="WEATHER",
        title="WEATHER ADVISORY",
        message="Wind 12 km/h NE, wave 1.4 m. Sea state is moderate.",
        action_recommended="Monitor weather updates periodically.",
        latitude=8.0883,
        longitude=77.5385,
        severity="SAFE",
        created_at=datetime.datetime(2026, 9, 26, 10, 25, 0),
        read_status=True,
    )
    alert4 = Alert(
        user_id=user.id,
        type="PFZ_UPDATE",
        title="PFZ UPDATE",
        message="New Potential Fishing Zone data detected at Wadge Bank Northeast (18 km NE).",
        action_recommended="View satellite map for navigation and ocean front layers.",
        latitude=8.1500,
        longitude=77.5500,
        severity="SAFE",
        created_at=datetime.datetime(2026, 9, 26, 10, 30, 0),
        read_status=True,
    )
    db.add_all([alert1, alert2, alert3, alert4])

    # 9. WhatsApp Messages
    wa_msg = WhatsAppMessage(
        user_id=user.id,
        mobile_number=user.mobile_number,
        message_type="DAILY_UPDATE",
        message_content=(
            "*BHUVAN-SAMUDRA – TODAY'S UPDATE*\n\n"
            "Good morning, Amogh.\n\n"
            "Sea Condition: Moderate\n"
            "Wave: 1.4 m\n"
            "Wind: 12 km/h\n"
            "Nearby PFZ: 18 km northeast\n"
            "IMBL: 8.4 km\n"
            "Safety: No immediate warning\n\n"
            'ORCA Recommendation: "Current conditions are moderate. Monitor wave conditions before travelling."'
        ),
        sent_at=datetime.datetime(2026, 9, 26, 7, 0, 0),
        delivery_status="Delivered",
    )
    db.add(wa_msg)

    db.commit()
    return user
