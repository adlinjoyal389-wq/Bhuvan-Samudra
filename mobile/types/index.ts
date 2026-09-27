export type SupportedLanguage = 'en' | 'ta' | 'te' | 'ml' | 'hi' | 'gu';

export interface UserProfile {
  id: number;
  name: string;
  mobile_number: string;
  boat_name: string;
  boat_registration: string;
  home_harbour: string;
  preferred_language: SupportedLanguage;
  emergency_contact: string;
  last_sync: string;
  profile_completed: boolean;
}

export interface SeaCondition {
  sea_state: string;
  wave_height: number;
  wind_speed: number;
  condition: string;
}

export interface PFZItem {
  id: number;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  direction: string;
  sst: number;
  chlorophyll: number;
  wave_height: number;
  wind_speed: number;
  confidence: number;
  source: string;
  timestamp: string;
}

export interface SafetyStatus {
  status: string;
  imbl_distance_km: number;
  wave_height: number;
  weather: string;
  current_alert: string;
  boundary_level: 'SAFE' | 'CAUTION' | 'WARNING';
}

export interface XAIEvidence {
  sst: string;
  chlorophyll: string;
  wave_height: string;
  wind_speed: string;
  distance: string;
  imbl_distance: string;
  confidence: string;
  updated: string;
  data_source: string;
  reasoning_chain: string[];
  recommendation_summary: string;
}

export interface MarineTodayData {
  date: string;
  sea_condition: SeaCondition;
  nearby_pfz: PFZItem;
  safety_status: SafetyStatus;
  orca_recommendation: string;
  orca_evidence: XAIEvidence;
  is_demo_data: boolean;
  data_source: string;
  timestamp: string;
}

export interface AlertItem {
  id: number;
  type: string;
  title: string;
  message: string;
  action_recommended: string;
  severity: 'SAFE' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  time: string;
  read_status: boolean;
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  step_label: string;
  risk_level: string;
}

export interface SafeRouteData {
  pfz_code: string;
  distance_km: number;
  estimated_time_mins: number;
  risk_level: string;
  boundary_status: string;
  weather_status: string;
  hazards_detected: string;
  waypoints: RouteWaypoint[];
}

export interface MapLayerConfig {
  baseMap: 'satellite' | 'standard' | 'terrain';
  showPFZ: boolean;
  showBoat: boolean;
  showIMBL: boolean;
  showProtectedAreas: boolean;
  showWeather: boolean;
  showRoute: boolean;
  showHeatmap: boolean;
  showSST: boolean;
  showWaveOverlay: boolean;
}
