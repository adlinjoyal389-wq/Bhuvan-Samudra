import sys
import io

# Ensure UTF-8 output on Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_all():
    print("Testing Bhuvan-Samudra backend...")

    # 1. Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.text}"
    print("✓ Root endpoint:", r.json()["project"])

    # 2. Auth OTP
    r = client.post("/auth/send-otp", json={"mobile_number": "+919876543210"})
    assert r.status_code == 200
    print("✓ Send OTP:", r.json()["message"])

    r = client.post("/auth/verify-otp", json={"mobile_number": "+919876543210", "otp": "123456"})
    assert r.status_code == 200
    print("✓ Verify OTP:", r.json()["message"], "User ID:", r.json()["user_id"])

    # 3. User Profile
    r = client.get("/user/profile?user_id=1")
    assert r.status_code == 200
    data = r.json()
    print(f"✓ Profile loaded: {data['name']} on '{data['boat_name']}' ({data['home_harbour']})")

    # 4. Marine Today
    r = client.get("/marine/today")
    assert r.status_code == 200
    data = r.json()
    print(f"✓ Marine Today: Wave {data['sea_condition']['wave_height']}m, PFZ: {data['nearby_pfz']['distance_km']}km {data['nearby_pfz']['direction']}")

    # 5. ORCA query in English
    r = client.post("/orca/query", json={"question": "Where can I fish today?", "language": "en"})
    assert r.status_code == 200
    print("✓ ORCA English answer:", r.json()["answer"][:70], "...")

    # 6. ORCA query in Tamil
    r = client.post("/orca/query", json={"question": "இன்று எங்கே மீன் பிடிக்கலாம்?", "language": "ta"})
    assert r.status_code == 200
    print("✓ ORCA Tamil answer:", r.json()["answer"][:70], "...")

    # 7. Memory comparison (yesterday vs today)
    r = client.get("/memory/comparison")
    assert r.status_code == 200
    print("✓ Memory Comparison:", r.json()["comparison_summary"])

    # 8. WhatsApp Simulate
    r = client.post("/whatsapp/simulate-incoming", json={"mobile_number": "+919876543210", "command": "TODAY"})
    assert r.status_code == 200
    print("✓ WhatsApp Bot TODAY command response received.")

    # 9. Boundaries
    r = client.get("/marine/boundaries")
    assert r.status_code == 200
    print("✓ Boundaries returned: IMBL points count =", len(r.json()["imbl"]["coordinates"]))

    # 10. Safe Route
    r = client.post("/marine/safe-route", json={"start_lat": 8.0883, "start_lon": 77.5385, "target_pfz_id": 1})
    assert r.status_code == 200
    print("✓ Safe Route generated: Distance =", r.json()["distance_km"], "km, Waypoints =", len(r.json()["waypoints"]))

    # 11. Offline Mesh simulation
    r = client.post("/sync/mesh-simulate")
    assert r.status_code == 200
    print("✓ BLE Mesh simulated: Devices found =", r.json()["devices_found"])

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY! Ready for frontend integration.")

if __name__ == "__main__":
    test_all()
