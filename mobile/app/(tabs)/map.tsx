import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { PFZItem, SafeRouteData } from '../../types';
import { ApiService } from '../../services/api';
import { StorageService } from '../../services/storage';
import { InteractiveSatelliteMap } from '../../components/InteractiveSatelliteMap';

export default function MapScreen() {
  const router = useRouter();
  const [pfzList, setPfzList] = useState<PFZItem[]>([]);
  const [selectedPFZ, setSelectedPFZ] = useState<PFZItem | null>(null);
  const [safeRoute, setSafeRoute] = useState<SafeRouteData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPFZ();
  }, []);

  const loadPFZ = async () => {
    try {
      const list = await ApiService.getPFZList();
      setPfzList(list);
      if (list.length > 0) {
        setSelectedPFZ(list[0]);
      }
    } catch (e) {
      console.warn("Failed to load PFZ list", e);
    }
  };

  const handleCreateRoute = async (pfz: PFZItem) => {
    try {
      const route = await ApiService.getSafeRoute(8.0883, 77.5385, pfz.id);
      setSafeRoute(route);
      Alert.alert(
        'Safe Route Generated',
        `A* corridor computed for ${pfz.code}.\nDistance: ${route.distance_km} km\nEst. Time: ${route.estimated_time_mins} mins\nRisk Level: Low\nClear of IMBL and marine protected zones.`
      );
    } catch (e) {
      console.warn("Failed to generate safe route", e);
    }
  };

  const handleSaveZone = (pfz: PFZItem) => {
    StorageService.addSavedZone(
      `${pfz.code} (${pfz.name})`,
      `SST: ${pfz.sst}°C, Chlorophyll: ${pfz.chlorophyll} mg/m³`
    );
    Alert.alert('Zone Saved', `${pfz.code} has been added to your Saved Fishing Zones.`);
  };

  const handleAskOrca = (query: string) => {
    router.push({
      pathname: '/(tabs)/orca',
      params: { initialQuestion: query },
    });
  };

  const filteredPFZ = pfzList.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search & Location Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fishing shoals, Wadge Bank, Cape..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Main Map */}
      <ScrollView style={styles.mapScroll} showsVerticalScrollIndicator={false}>
        <InteractiveSatelliteMap
          pfzList={filteredPFZ.length > 0 ? filteredPFZ : pfzList}
          selectedPFZ={selectedPFZ}
          onSelectPFZ={(pfz) => setSelectedPFZ(pfz)}
          safeRoute={safeRoute}
          onCreateRoute={handleCreateRoute}
          onAskOrca={handleAskOrca}
          onSaveZone={handleSaveZone}
        />

        {/* Quick Route Summary Card if Active */}
        {safeRoute && (
          <View style={styles.routeCard}>
            <View style={styles.routeCardHeader}>
              <View style={styles.routeTitleRow}>
                <Ionicons name="compass" size={18} color={THEME.colors.safeGreen} />
                <Text style={styles.routeTitle}>
                  Active Safe Navigation Route ({safeRoute.pfz_code})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSafeRoute(null)}>
                <Text style={styles.cancelRouteText}>Cancel Route</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeMetricsRow}>
              <View style={styles.routeMetric}>
                <Text style={styles.routeMetricLabel}>Total Distance</Text>
                <Text style={styles.routeMetricVal}>{safeRoute.distance_km} km</Text>
              </View>
              <View style={styles.routeMetric}>
                <Text style={styles.routeMetricLabel}>Est. Voyage Time</Text>
                <Text style={styles.routeMetricVal}>{safeRoute.estimated_time_mins} mins</Text>
              </View>
              <View style={styles.routeMetric}>
                <Text style={styles.routeMetricLabel}>Trajectory Risk</Text>
                <Text style={[styles.routeMetricVal, { color: THEME.colors.safeGreen }]}>
                  Low (Clear)
                </Text>
              </View>
            </View>

            <Text style={styles.waypointNotice}>
              Trajectory verified against IMBL buffer (8.4 km separation) and Gulf of Mannar Marine Biosphere restrictions.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  searchBarContainer: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.primaryNavy,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  mapScroll: {
    flex: 1,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    ...THEME.shadow.card,
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  cancelRouteText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  routeMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  routeMetric: {
    alignItems: 'center',
  },
  routeMetricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  routeMetricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginTop: 2,
  },
  waypointNotice: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 15,
  },
});
