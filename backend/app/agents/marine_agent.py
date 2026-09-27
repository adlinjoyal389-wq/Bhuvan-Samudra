import math
from typing import Dict, Any, List


class MarineOceanDiscoveryAgent:
    """
    Responsible for SST, Chlorophyll-a, PFZ detection, and marine observations
    modeled on Bhuvan-INCOIS OceanSat-3 satellite feeds.
    """

    def __init__(self):
        # Demo PFZ database around Kanyakumari / Wadge Bank
        self.pfz_database = [
            {
                "id": 1,
                "code": "PFZ-01",
                "name": "Wadge Bank Northeast Shoal",
                "latitude": 8.1500,
                "longitude": 77.5500,
                "distance_km": 18.0,
                "direction": "Northeast",
                "sst": 28.2,
                "chlorophyll": 0.8,
                "wave_height": 1.4,
                "wind_speed": 12.0,
                "confidence": 88,
                "source": "Bhuvan-INCOIS OceanSat-3 (Demo)",
                "species_likely": "Tuna, Sardine, Mackerel",
            },
            {
                "id": 2,
                "code": "PFZ-02",
                "name": "Cape Comorin Deep Shelf",
                "latitude": 7.9800,
                "longitude": 77.6200,
                "distance_km": 24.5,
                "direction": "Southeast",
                "sst": 27.9,
                "chlorophyll": 0.72,
                "wave_height": 1.6,
                "wind_speed": 14.0,
                "confidence": 82,
                "source": "Bhuvan-INCOIS OceanSat-3 (Demo)",
                "species_likely": "Pelagic Tuna, Ribbonfish",
            },
            {
                "id": 3,
                "code": "PFZ-03",
                "name": "Colachel Coastal Upwelling",
                "latitude": 8.1800,
                "longitude": 77.2500,
                "distance_km": 33.0,
                "direction": "Northwest",
                "sst": 28.5,
                "chlorophyll": 0.95,
                "wave_height": 1.3,
                "wind_speed": 11.0,
                "confidence": 85,
                "source": "Bhuvan-INCOIS OceanSat-3 (Demo)",
                "species_likely": "Anchovy, Carangids",
            },
        ]

    def calculate_distance_km(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine distance in kilometers"""
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 1)

    def get_nearest_pfz(self, lat: float, lon: float) -> Dict[str, Any]:
        """Find the optimal PFZ relative to current boat position"""
        zones = []
        for zone in self.pfz_database:
            dist = self.calculate_distance_km(lat, lon, zone["latitude"], zone["longitude"])
            item = dict(zone)
            item["distance_km"] = dist
            zones.append(item)
        zones.sort(key=lambda x: x["distance_km"])
        return zones[0] if zones else self.pfz_database[0]

    def get_all_pfz(self, lat: float = 8.0883, lon: float = 77.5385) -> List[Dict[str, Any]]:
        results = []
        for zone in self.pfz_database:
            item = dict(zone)
            item["distance_km"] = self.calculate_distance_km(lat, lon, zone["latitude"], zone["longitude"])
            results.append(item)
        return results

    def get_marine_summary(self, lat: float = 8.0883, lon: float = 77.5385) -> Dict[str, Any]:
        nearest = self.get_nearest_pfz(lat, lon)
        return {
            "nearest_pfz": nearest,
            "ocean_front": "Active thermal front detected along Wadge Bank gradient",
            "sst_average": 28.2,
            "chlorophyll_average": 0.8,
            "demo_notice": "Prototype oceanographic data modeled from ISRO Bhuvan / MOSDAC specs.",
        }
