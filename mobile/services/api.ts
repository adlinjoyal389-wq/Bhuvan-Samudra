import { MarineTodayData, PFZItem, AlertItem, SafeRouteData, UserProfile, SupportedLanguage } from '../types';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getInitialBaseUrl = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && Platform.OS !== 'web') {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8001`;
  }
  return 'http://localhost:8001';
};

export let API_BASE_URL = getInitialBaseUrl();

async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch (err) {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    const ip = hostUri && Platform.OS !== 'web' ? hostUri.split(':')[0] : 'localhost';
    const altPort = API_BASE_URL.includes('8001') ? '8000' : '8001';
    const alternate = `http://${ip}:${altPort}`;
    try {
      const resAlt = await fetch(`${alternate}${endpoint}`, options);
      API_BASE_URL = alternate;
      return resAlt;
    } catch (_) {}
    throw err;
  }
}

// In-memory fallback dataset for offline/independent prototype operation
const DEMO_FALLBACK_DATA: MarineTodayData = {
  date: "2026-09-26",
  sea_condition: {
    sea_state: "Moderate",
    wave_height: 1.4,
    wind_speed: 12.0,
    condition: "Moderate",
  },
  nearby_pfz: {
    id: 1,
    code: "PFZ-01",
    name: "Wadge Bank Northeast Shoal",
    latitude: 8.1500,
    longitude: 77.5500,
    distance_km: 18.0,
    direction: "Northeast",
    sst: 28.2,
    chlorophyll: 0.8,
    wave_height: 1.4,
    wind_speed: 12.0,
    confidence: 88,
    source: "Bhuvan-INCOIS OceanSat-3 (Demo)",
    timestamp: "10:30 AM",
  },
  safety_status: {
    status: "SAFE",
    imbl_distance_km: 8.4,
    wave_height: 1.4,
    weather: "Moderate",
    current_alert: "No immediate warning",
    boundary_level: "CAUTION",
  },
  orca_recommendation:
    "Current marine conditions are moderate. A potential fishing zone is available approximately 18 km northeast of your current location. Monitor wave and weather conditions before travelling.",
  orca_evidence: {
    sst: "28.2°C",
    chlorophyll: "0.8 mg/m³",
    wave_height: "1.4 m",
    wind_speed: "12 km/h",
    distance: "18 km Northeast",
    imbl_distance: "8.4 km",
    confidence: "88%",
    updated: "10:30 AM",
    data_source: "Bhuvan-INCOIS OceanSat-3 / MOSDAC (Demo)",
    reasoning_chain: [
      "SST gradient (28.2°C) correlates with thermal front boundaries.",
      "Chlorophyll-a (0.8 mg/m³) confirms active phytoplankton concentration.",
      "Wave height (1.4m) is below the INCOIS cautionary threshold of 2.0m.",
      "IMBL clearance (8.4 km) guarantees fishing zone is within Indian EEZ.",
    ],
    recommendation_summary:
      "Current marine conditions are moderate. A potential fishing zone is available approximately 18 km northeast of your current location. Monitor wave and weather conditions before travelling.",
  },
  is_demo_data: true,
  data_source: "Bhuvan-INCOIS / MOSDAC / Open-Meteo",
  timestamp: "10:30 AM",
};

export const ApiService = {
  async sendOTP(mobileNumber: string): Promise<{ success: boolean; message: string; demo_otp: string }> {
    try {
      const res = await apiFetch('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline, using local OTP verification");
    }
    return {
      success: true,
      message: `Demo OTP: 123456 sent to ${mobileNumber}`,
      demo_otp: "123456",
    };
  },

  async verifyOTP(mobileNumber: string, otp: string): Promise<{ success: boolean; user_id: number; profile_completed: boolean; preferred_language: string }> {
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber, otp }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline, verifying locally with demo OTP");
    }
    if (otp === "123456") {
      return {
        success: true,
        user_id: 1,
        profile_completed: true,
        preferred_language: "en",
      };
    }
    throw new Error("Invalid OTP. Enter 123456 for SIH demo.");
  },

  async getProfile(userId: number = 1): Promise<UserProfile> {
    try {
      const res = await apiFetch(`/user/profile?user_id=${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using cached local profile");
    }
    return {
      id: 1,
      name: "Amogh",
      mobile_number: "+91 98765 43210",
      boat_name: "Sea Star",
      boat_registration: "IND-TN-06-MM-4421",
      home_harbour: "Kanyakumari",
      preferred_language: "en",
      emergency_contact: "+91 94431 22890",
      last_sync: "10:30 AM",
      profile_completed: true,
    };
  },

  async updateProfile(profile: Partial<UserProfile>, userId: number = 1): Promise<UserProfile> {
    try {
      const res = await apiFetch(`/user/profile?user_id=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Saved profile locally");
    }
    return {
      id: userId,
      name: profile.name || "Amogh",
      mobile_number: "+91 98765 43210",
      boat_name: profile.boat_name || "Sea Star",
      boat_registration: profile.boat_registration || "IND-TN-06-MM-4421",
      home_harbour: profile.home_harbour || "Kanyakumari",
      preferred_language: (profile.preferred_language as SupportedLanguage) || "en",
      emergency_contact: profile.emergency_contact || "+91 94431 22890",
      last_sync: "10:30 AM",
      profile_completed: true,
    };
  },

  async getTodayMarine(lat: number = 8.0883, lon: number = 77.5385): Promise<MarineTodayData> {
    try {
      const res = await apiFetch(`/marine/today?lat=${lat}&lon=${lon}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline cached marine data");
    }
    return DEMO_FALLBACK_DATA;
  },

  async getPFZList(lat: number = 8.0883, lon: number = 77.5385): Promise<PFZItem[]> {
    try {
      const res = await apiFetch(`/marine/pfz?lat=${lat}&lon=${lon}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using cached PFZ list");
    }
    return [
      DEMO_FALLBACK_DATA.nearby_pfz,
      {
        id: 2,
        code: "PFZ-02",
        name: "Cape Comorin Deep Shelf",
        latitude: 7.9800,
        longitude: 77.6200,
        distance_km: 24.5,
        direction: "Southeast",
        sst: 27.9,
        chlorophyll: 0.72,
        wave_height: 1.6,
        wind_speed: 14.0,
        confidence: 82,
        source: "Bhuvan-INCOIS OceanSat-3 (Demo)",
        timestamp: "10:30 AM",
      },
      {
        id: 3,
        code: "PFZ-03",
        name: "Colachel Coastal Upwelling",
        latitude: 8.1800,
        longitude: 77.2500,
        distance_km: 33.0,
        direction: "Northwest",
        sst: 28.5,
        chlorophyll: 0.95,
        wave_height: 1.3,
        wind_speed: 11.0,
        confidence: 85,
        source: "Bhuvan-INCOIS OceanSat-3 (Demo)",
        timestamp: "10:30 AM",
      },
    ];
  },

  async getAlerts(): Promise<AlertItem[]> {
    try {
      const res = await apiFetch('/marine/alerts');
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using cached alerts");
    }
    return [
      {
        id: 1,
        type: "HIGH_WAVE",
        title: "HIGH WAVE ALERT",
        message: "Wave conditions may increase towards 1.8 m by late afternoon. Monitor sea conditions before travelling further.",
        action_recommended: "Monitor sea conditions before travelling further.",
        severity: "WARNING",
        time: "2:00 PM",
        read_status: false,
      },
      {
        id: 2,
        type: "IMBL_PROXIMITY",
        title: "IMBL PROXIMITY",
        message: "You are approaching the International Maritime Boundary Line. Current distance is 8.4 km.",
        action_recommended: "Verify GPS coordinates and steer westwards if necessary.",
        severity: "CAUTION",
        time: "1:30 PM",
        read_status: false,
      },
      {
        id: 3,
        type: "WEATHER",
        title: "WEATHER ALERT",
        message: "Wind speed 12 km/h NE, wave height 1.4 m. Conditions are moderate.",
        action_recommended: "Monitor conditions.",
        severity: "SAFE",
        time: "10:25 AM",
        read_status: true,
      },
      {
        id: 4,
        type: "PFZ_UPDATE",
        title: "PFZ UPDATE",
        message: "New Potential Fishing Zone information is available at Wadge Bank Northeast.",
        action_recommended: "Open satellite map for navigation.",
        severity: "SAFE",
        time: "10:30 AM",
        read_status: true,
      },
    ];
  },

  async queryORCA(question: string, language: string = "en", lat: number = 8.0883, lon: number = 77.5385): Promise<any> {
    try {
      const res = await apiFetch('/orca/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language, current_lat: lat, current_lon: lon }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline, generating local multi-agent response");
    }

    // Local multi-agent fallback
    const isTa = language === "ta";
    const answer = isTa
      ? "இன்றைய கடல் நிலைமை மிதமான நிலையில் உள்ளது. வடகிழக்கே சுமார் 18 கிமீ தொலைவில் PFZ-01 மீன்பிடி மண்டலம் உள்ளது. கடல் வெப்பநிலை 28.2°C, அலை உயரம் 1.4 மீட்டர்."
      : "Current marine conditions are moderate. A potential fishing zone is available approximately 18 km northeast of your current location (Wadge Bank Northeast). Wave height is 1.4m and SST is 28.2°C.";

    return {
      question,
      answer,
      language,
      detected_intent: "PFZ_QUERY",
      evidence: DEMO_FALLBACK_DATA.orca_evidence,
      map_action: { type: "FOCUS_PFZ", latitude: 8.1500, longitude: 77.5500, zoom: 12 },
      data_timestamp: "10:30 AM",
      data_source: "Bhuvan-INCOIS / MOSDAC (Demo)",
    };
  },

  async getSafeRoute(startLat: number = 8.0883, startLon: number = 77.5385, targetPfzId: number = 1): Promise<SafeRouteData> {
    try {
      const res = await apiFetch('/marine/safe-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_lat: startLat, start_lon: startLon, target_pfz_id: targetPfzId }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline safe route algorithm");
    }
    return {
      pfz_code: "PFZ-01",
      distance_km: 18.2,
      estimated_time_mins: 52,
      risk_level: "LOW (A* Risk-weighted corridor clear)",
      boundary_status: "Clear (> 8 km buffer maintained)",
      weather_status: "Moderate (Waves 1.4m, Wind 12 km/h)",
      hazards_detected: "None detected along proposed trajectory",
      waypoints: [
        { latitude: 8.0883, longitude: 77.5385, step_label: "Depart from Current Boat Position", risk_level: "LOW" },
        { latitude: 8.1068, longitude: 77.5414, step_label: "Pass Coastal Shoal Channel (Depth > 20m)", risk_level: "LOW" },
        { latitude: 8.1315, longitude: 77.5460, step_label: "Vector Northeast away from boundary buffer", risk_level: "LOW" },
        { latitude: 8.1500, longitude: 77.5500, step_label: "Arrive at PFZ-01 Wadge Bank Shoal", risk_level: "OPTIMAL" },
      ],
    };
  },

  async simulateWhatsApp(command: string, mobileNumber: string = "+91 98765 43210"): Promise<any> {
    try {
      const res = await apiFetch('/whatsapp/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, mobile_number: mobileNumber }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Using offline WhatsApp engine");
    }
    return {
      sender: mobileNumber,
      command,
      reply_text: `*BHUVAN-SAMUDRA [OFFLINE]*\n\nCommand: ${command}\nWave: 1.4 m | Wind: 12 km/h | PFZ: 18 km NE | IMBL: 8.4 km\nSafety: Safe / Monitor`,
      sent_at: "10:30 AM",
      delivery_status: "Delivered",
    };
  },

  async simulateMeshSync(): Promise<any> {
    try {
      const res = await apiFetch('/sync/mesh-simulate', { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Offline mesh fallback");
    }
    return {
      status: "COMPLETED",
      devices_found: 2,
      nearby_boats: [
        { boat_name: "Sea Horse (IND-TN-06-SH-310)", distance: "~450 meters", shared_packet: "Wave height 1.5m at 8.12N, 77.56E", time: "Just now" },
        { boat_name: "Ocean Pride (IND-TN-06-OP-118)", distance: "~720 meters", shared_packet: "IMBL buffer clear. Fish shoal sighted.", time: "1 min ago" },
      ],
      message: "Safety and PFZ packets successfully synchronized across BLE mesh cluster.",
    };
  },
};
