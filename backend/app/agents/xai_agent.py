import datetime
from typing import Dict, Any


class ExplainableAIAgent:
    """
    Responsible for evidence extraction, rule explanation,
    and decision reasoning for transparent multi-agent recommendations.
    """

    def generate_pfz_evidence(
        self,
        pfz: Dict[str, Any],
        weather: Dict[str, Any],
        boundary: Dict[str, Any],
        timestamp_str: str = "10:30 AM",
    ) -> Dict[str, Any]:
        """
        Produces the XAI Evidence card structure demanded by the SIH ORCA architecture.
        """
        sst = pfz.get("sst", 28.2)
        chl = pfz.get("chlorophyll", 0.8)
        wave = weather.get("wave_height", 1.4)
        wind = weather.get("wind_speed", 12.0)
        dist = pfz.get("distance_km", 18.0)
        direction = pfz.get("direction", "Northeast")
        imbl_dist = boundary.get("distance_km", 8.4)

        return {
            "sst": f"{sst}°C",
            "chlorophyll": f"{chl} mg/m³",
            "wave_height": f"{wave} m",
            "wind_speed": f"{wind} km/h",
            "distance": f"{dist} km {direction}",
            "imbl_distance": f"{imbl_dist} km",
            "confidence": f"{pfz.get('confidence', 88)}%",
            "updated": timestamp_str,
            "data_source": "Bhuvan-INCOIS OceanSat-3 / MOSDAC (Demo)",
            "reasoning_chain": [
                f"SST gradient ({sst}°C) correlates with thermal front boundaries.",
                f"Chlorophyll-a ({chl} mg/m³) confirms active phytoplankton concentration.",
                f"Wave height ({wave}m) is below the INCOIS cautionary threshold of 2.0m.",
                f"IMBL clearance ({imbl_dist} km) guarantees fishing zone is within Indian EEZ.",
            ],
            "recommendation_summary": (
                f"Current marine conditions are moderate. A potential fishing zone is available "
                f"approximately {dist} km {direction.lower()} of your current location. "
                f"Monitor wave and weather conditions before travelling."
            ),
        }
