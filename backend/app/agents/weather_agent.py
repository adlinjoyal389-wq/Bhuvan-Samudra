from typing import Dict, Any


class WeatherHazardAgent:
    """
    Responsible for Wind, Waves, Sea State, Cyclone advisories,
    and threshold-based maritime safety categorization.
    """

    def __init__(self):
        # Default baseline conditions around Kanyakumari marine zone
        self.current_weather = {
            "region": "Kanyakumari Offshore",
            "sea_state": "Moderate",
            "condition": "Moderate",
            "wave_height": 1.4,  # meters
            "wind_speed": 12.0,  # km/h
            "wind_direction": "Northeast (NE)",
            "weather_status": "Moderate",
            "visibility_km": 10.0,
            "lightning_risk": "Low",
            "cyclone_warning": "No active depression / cyclone warning",
            "source": "MOSDAC / Open-Meteo marine model (Demo)",
        }

    def evaluate_safety_tier(self, wave_height: float, wind_speed: float) -> Dict[str, str]:
        """Categorize safety based on INCOIS marine safety thresholds"""
        if wave_height > 3.0 or wind_speed > 45.0:
            return {
                "tier": "DANGEROUS",
                "label": "Rough / Dangerous",
                "advisory": "High danger. Fishermen are strongly advised not to venture into deep sea.",
            }
        elif wave_height > 2.0 or wind_speed > 25.0:
            return {
                "tier": "WARNING",
                "label": "Caution / High Wave",
                "advisory": "Wave conditions elevated. Monitor sea conditions before travelling further.",
            }
        elif wave_height >= 1.2 or wind_speed >= 10.0:
            return {
                "tier": "SAFE_MODERATE",
                "label": "Moderate",
                "advisory": "Conditions are moderate and acceptable for motorized fishing craft.",
            }
        else:
            return {
                "tier": "SAFE_CALM",
                "label": "Calm",
                "advisory": "Sea is calm. Excellent conditions for artisanal fishing.",
            }

    def get_weather_forecast(self, lat: float = 8.0883, lon: float = 77.5385) -> Dict[str, Any]:
        weather = dict(self.current_weather)
        safety = self.evaluate_safety_tier(weather["wave_height"], weather["wind_speed"])
        weather["safety_tier"] = safety["tier"]
        weather["safety_label"] = safety["label"]
        weather["advisory"] = safety["advisory"]
        return weather
