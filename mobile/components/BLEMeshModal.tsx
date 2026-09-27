import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { ApiService } from '../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const BLEMeshModal: React.FC<Props> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      const timer = setTimeout(async () => {
        const res = await ApiService.simulateMeshSync();
        setData(res);
        setLoading(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="access-point-network" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>BLE / Wi-Fi Mesh Network</Text>
                <Text style={styles.subtitle}>Offshore Boat-to-Boat Hazard Exchange</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
              <Text style={styles.loadingText}>Searching for nearby fishing boats...</Text>
              <Text style={styles.loadingSub}>Scanning 2.4GHz BLE &amp; Wi-Fi Direct beacons</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                <Text style={styles.successText}>
                  {data?.devices_found} Nearby Boats Found • Packets Synchronized
                </Text>
              </View>

              <Text style={styles.listHeader}>SYNCHRONIZED MESH CLUSTER</Text>
              {data?.nearby_boats?.map((boat: any, idx: number) => (
                <View key={idx} style={styles.boatCard}>
                  <View style={styles.boatHeader}>
                    <View style={styles.boatNameRow}>
                      <FontAwesome5 name="ship" size={14} color={THEME.colors.primaryNavy} />
                      <Text style={styles.boatName}>{boat.boat_name}</Text>
                    </View>
                    <Text style={styles.boatDist}>{boat.distance}</Text>
                  </View>
                  <View style={styles.packetBubble}>
                    <Text style={styles.packetLabel}>Exchanged Safety Telemetry:</Text>
                    <Text style={styles.packetText}>"{boat.shared_packet}"</Text>
                  </View>
                </View>
              ))}

              <View style={styles.footerNotice}>
                <Ionicons name="shield-checkmark" size={16} color={THEME.colors.safeGreen} />
                <Text style={styles.footerNoticeText}>
                  Zero cellular data required. Mesh nodes forward localized IMBL warnings and wave anomalies across boat clusters.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...THEME.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.primaryDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primaryNavy,
  },
  loadingSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  content: {
    paddingVertical: 14,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  listHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  boatCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  boatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  boatNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boatName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  boatDist: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  packetBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  packetText: {
    fontSize: 12,
    color: '#1E293B',
    fontStyle: 'italic',
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  footerNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },
  closeBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
