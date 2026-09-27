import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { XAIEvidence } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  evidence: XAIEvidence | null;
}

export const ExplainableEvidenceModal: React.FC<Props> = ({ visible, onClose, evidence }) => {
  if (!evidence) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="brain" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>ORCA XAI Evidence</Text>
                <Text style={styles.subtitle}>Transparent Reasoning & Multi-Agent Telemetry</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Recommendation Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>GENERATED RECOMMENDATION</Text>
              <Text style={styles.summaryText}>{evidence.recommendation_summary}</Text>
            </View>

            {/* Oceanographic Sensor Inputs Table */}
            <Text style={styles.sectionHeader}>MULTI-SENSOR TELEMETRY INPUTS</Text>
            <View style={styles.grid}>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>Sea Surface Temp (SST)</Text>
                <Text style={styles.gridVal}>{evidence.sst}</Text>
                <Text style={styles.gridSub}>Thermal front threshold</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>Chlorophyll-a</Text>
                <Text style={styles.gridVal}>{evidence.chlorophyll}</Text>
                <Text style={styles.gridSub}>Phytoplankton bloom</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>Wave Height</Text>
                <Text style={styles.gridVal}>{evidence.wave_height}</Text>
                <Text style={styles.gridSub}>INCOIS safety limit &lt; 2.0m</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>Wind Speed</Text>
                <Text style={styles.gridVal}>{evidence.wind_speed}</Text>
                <Text style={styles.gridSub}>Moderate breeze (NE)</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>PFZ Proximity</Text>
                <Text style={styles.gridVal}>{evidence.distance}</Text>
                <Text style={styles.gridSub}>Calculated via Haversine</Text>
              </View>
              <View style={styles.gridCard}>
                <Text style={styles.gridLabel}>IMBL Boundary Clearance</Text>
                <Text style={[styles.gridVal, { color: THEME.colors.warningRed }]}>
                  {evidence.imbl_distance}
                </Text>
                <Text style={styles.gridSub}>Safe buffer (&gt; 5 km)</Text>
              </View>
            </View>

            {/* Agent Reasoning Chain */}
            <Text style={styles.sectionHeader}>ORCA MULTI-AGENT INFERENCE CHAIN</Text>
            <View style={styles.reasoningCard}>
              {evidence.reasoning_chain.map((step, idx) => (
                <View key={idx} style={styles.reasoningRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Validation & Timestamp */}
            <View style={styles.footerInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Confidence Level:</Text>
                <Text style={styles.infoVal}>{evidence.confidence} (SIH Prototype model)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telemetry Timestamp:</Text>
                <Text style={styles.infoVal}>{evidence.updated}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Authoritative Source:</Text>
                <Text style={styles.infoVal}>{evidence.data_source}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
            <Text style={styles.actionBtnText}>Understand &amp; Close</Text>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primaryBlue,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primaryBlue,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  gridVal: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginVertical: 2,
  },
  gridSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  reasoningCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    marginBottom: 16,
    gap: 10,
  },
  reasoningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#3B0764',
    lineHeight: 17,
  },
  footerInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
