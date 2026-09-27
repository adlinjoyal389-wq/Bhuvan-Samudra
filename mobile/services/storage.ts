import { UserProfile, SupportedLanguage } from '../types';

let currentUserProfile: UserProfile = {
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

let isOfflineMode: boolean = false;
let savedZonesList: Array<{ id: number; name: string; date: string; notes: string }> = [
  { id: 1, name: "Wadge Bank Favorite Zone (PFZ-01)", date: "2026-09-26", notes: "Productive tuna grounds near thermal front" },
];

let offlineDownloadedAreas: string[] = ["Kanyakumari Coast"];

let whatsAppSettings = {
  status: "Connected",
  dailyUpdate: true,
  safetyAlerts: true,
  pfzUpdates: true,
  weatherAlerts: true,
};

export const StorageService = {
  getUserProfile(): UserProfile {
    return currentUserProfile;
  },

  setUserProfile(profile: Partial<UserProfile>): UserProfile {
    currentUserProfile = { ...currentUserProfile, ...profile };
    return currentUserProfile;
  },

  getLanguage(): SupportedLanguage {
    return currentUserProfile.preferred_language || 'en';
  },

  setLanguage(lang: SupportedLanguage) {
    currentUserProfile.preferred_language = lang;
  },

  isOffline(): boolean {
    return isOfflineMode;
  },

  setOffline(offline: boolean) {
    isOfflineMode = offline;
  },

  getSavedZones() {
    return savedZonesList;
  },

  addSavedZone(name: string, notes: string = "") {
    const newZone = {
      id: Date.now(),
      name,
      date: new Date().toISOString().split('T')[0],
      notes,
    };
    savedZonesList = [newZone, ...savedZonesList];
    return newZone;
  },

  getOfflineAreas() {
    return offlineDownloadedAreas;
  },

  addOfflineArea(area: string) {
    if (!offlineDownloadedAreas.includes(area)) {
      offlineDownloadedAreas.push(area);
    }
  },

  getWhatsAppSettings() {
    return whatsAppSettings;
  },

  updateWhatsAppSettings(settings: Partial<typeof whatsAppSettings>) {
    whatsAppSettings = { ...whatsAppSettings, ...settings };
    return whatsAppSettings;
  },
};
