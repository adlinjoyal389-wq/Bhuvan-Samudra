import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { StorageService } from '../../services/storage';

export default function TabLayout() {
  const lang = StorageService.getLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F',
          borderTopColor: '#1E293B',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: lang === 'ta' ? 'முகப்பு' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: lang === 'ta' ? 'வரைபடம்' : 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: lang === 'ta' ? 'எச்சரிக்கைகள்' : 'Alerts',
          tabBarBadge: 2,
          tabBarBadgeStyle: {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orca"
        options={{
          title: lang === 'ta' ? 'ORCA' : 'Ask ORCA',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="whatsapp"
        options={{
          title: 'WhatsApp',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="logo-whatsapp" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: lang === 'ta' ? 'சுயவிவரம்' : 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
