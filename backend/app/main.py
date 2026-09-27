from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .services.seed_data import seed_database
from .api import auth, user, marine, orca, memory, whatsapp, sync


# Ensure DB tables exist on load
Base.metadata.create_all(bind=engine)
db_init = SessionLocal()
try:
    seed_database(db_init)
finally:
    db_init.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables and seed on lifespan startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Bhuvan-Samudra – ORCA API",
    description=(
        "Backend services for Bhuvan-Samudra: Marine Ecosystem Reasoning with Collaborative Agents (ORCA). "
        "Smart India Hackathon 2026 - Problem Statement SIH26176 (Team REPHOENIX)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local Expo dev server, Android emulator, and browser previews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(marine.router)
app.include_router(orca.router)
app.include_router(memory.router)
app.include_router(whatsapp.router)
app.include_router(sync.router)


@app.get("/")
def root():
    return {
        "project": "Bhuvan-Samudra – ORCA",
        "tagline": "Marine Ecosystem Reasoning with Collaborative Agents",
        "hackathon": "Smart India Hackathon 2026",
        "problem_statement_id": "SIH26176",
        "theme": "Space Technology",
        "team": "REPHOENIX",
        "status": "OPERATIONAL",
        "demo_credentials": {
            "mobile": "+919876543210",
            "demo_otp": "123456",
            "home_harbour": "Kanyakumari",
        },
        "docs_url": "/docs",
    }
