import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { PFZItem, SafeRouteData, MapLayerConfig } from '../types';
import { getTranslation } from '../constants/translations';
import { StorageService } from '../services/storage';

const SATELLITE_IMG = require('../assets/satellite_wadge_bank.png');
const BATHYMETRY_IMG = require('../assets/ocean_bathymetry.png');
const TOPO_IMG = require('../assets/standard_topo.png');

const Iframe = 'iframe' as any;

interface Props {
  pfzList: PFZItem[];
  selectedPFZ: PFZItem | null;
  onSelectPFZ: (pfz: PFZItem) => void;
  safeRoute: SafeRouteData | null;
  onCreateRoute: (pfz: PFZItem) => void;
  onAskOrca: (query: string) => void;
  onSaveZone: (pfz: PFZItem) => void;
}

export const InteractiveSatelliteMap: React.FC<Props> = ({
  pfzList,
  selectedPFZ,
  onSelectPFZ,
  safeRoute,
  onCreateRoute,
  onAskOrca,
  onSaveZone,
}) => {
  const lang = StorageService.getLanguage();
  const [baseMap, setBaseMap] = useState<'satellite' | 'standard' | 'terrain'>('satellite');
  const [layersOpen, setLayersOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [offlineDownloaded, setOfflineDownloaded] = useState(false);
  const [isDemoLocation, setIsDemoLocation] = useState(true);
  const [compassHeading, setCompassHeading] = useState(0);
  const [mapMode, setMapMode] = useState<'tactical' | 'live'>('tactical');

  const getMapBackground = () => {
    switch (baseMap) {
      case 'satellite':
        return SATELLITE_IMG;
      case 'terrain':
        return BATHYMETRY_IMG;
      case 'standard':
      default:
        return TOPO_IMG;
    }
  };

  const generateLeafletHtml = () => {
    const pfzMarkersJs = pfzList
      .map(
        (p) => `
      L.marker([${p.latitude}, ${p.longitude}]).addTo(map)
        .bindPopup("<b>🐟 ${p.code}: ${p.name}</b><br>SST: ${p.sst}°C | Chlorophyll: ${p.chlorophyll} mg/m³<br>Confidence: ${p.confidence}%<br>Distance: ${p.distance_km} km ${p.direction}");
    `
      )
      .join('\n');

    const routeJs = safeRoute
      ? `
      var routeWaypoints = ${JSON.stringify(safeRoute.waypoints.map((w) => [w.latitude, w.longitude]))};
      var safePath = L.polyline(routeWaypoints, { color: '#10B981', weight: 4 }).addTo(map);
      safePath.bindPopup("<b>✅ A* Risk-Weighted Safe Trajectory</b><br>Distance: ${safeRoute.distance_km} km | Time: ${safeRoute.estimated_time_mins} mins");
    `
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #071A2E; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-popup-content-wrapper { border-radius: 8px; font-size: 13px; line-height: 1.4; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .leaflet-popup-content { margin: 12px 14px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([8.0883, 77.5385], 10);

    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    }).addTo(map);

    var labelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(map);

    var oceanLayer = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 13,
      attribution: 'Esri Ocean Basemap'
    });

    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'OpenStreetMap'
    });

    L.control.layers({
      "🛰️ ESRI Satellite": satelliteLayer,
      "🌊 Ocean Bathymetry": oceanLayer,
      "🗺️ OpenStreetMap": osmLayer
    }, {
      "🏷️ Place & Coastal Labels": labelsLayer
    }).addTo(map);

    var boatIcon = L.divIcon({
      html: '<div style="background:#0284C7;border:3px solid white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px #38BDF8;font-size:14px;">🚤</div>',
      iconSize: [26, 26],
      className: ''
    });
    L.marker([8.0883, 77.5385], { icon: boatIcon }).addTo(map)
      .bindPopup("<b>🚤 Sea Star (Your Boat)</b><br>Harbour: Kanyakumari<br>Status: Navigating Indian EEZ").openPopup();

    ${pfzMarkersJs}

    var imblCoords = [[8.0000, 78.7000], [8.3500, 78.4500], [8.7000, 78.3500]];
    var imbl = L.polyline(imblCoords, { color: '#EF4444', weight: 4, dashArray: '8, 8' }).addTo(map);
    imbl.bindPopup("<b>⚠ IMBL Border Line (8.4 km separation)</b><br>India - Sri Lanka Maritime Boundary. Do not cross.");

    var mpaCoords = [[8.20, 78.00], [8.50, 78.30], [8.35, 78.50], [8.10, 78.20]];
    var mpa = L.polygon(mpaCoords, { color: '#0EA5E9', fillColor: '#0EA5E9', fillOpacity: 0.25, weight: 2, dashArray: '5, 5' }).addTo(map);
    mpa.bindPopup("<b>🛡️ Gulf of Mannar Marine Biosphere</b><br>Protected Marine Sanctuary. No trawling permitted.");

    ${routeJs}
  </script>
</body>
</html>`;
  };

  // Map Layer States
  const [layers, setLayers] = useState<MapLayerConfig>({
    baseMap: 'satellite',
    showPFZ: true,
    showBoat: true,
    showIMBL: true,
    showProtectedAreas: true,
    showWeather: true,
    showRoute: true,
    showHeatmap: false,
    showSST: false,
    showWaveOverlay: false,
  });

  // Current boat coordinates
  const boatCoords = isDemoLocation
    ? { lat: 8.0883, lon: 77.5385 }
    : { lat: 8.0883, lon: 77.5385 };

  // Calculate pixel coordinates for demo canvas
  // Bounds around Kanyakumari waters: Lat 7.8 - 8.4, Lon 77.1 - 78.6
  const mapWidth = Dimensions.get('window').width;
  const mapHeight = 440;

  const latToY = (lat: number) => {
    // 8.4 is top (y=20), 7.8 is bottom (y=mapHeight - 40)
    return ((8.4 - lat) / (8.4 - 7.8)) * (mapHeight - 60) + 30;
  };

  const lonToX = (lon: number) => {
    // 77.1 is left (x=20), 78.6 is right (x=mapWidth - 20)
    return ((lon - 77.1) / (78.6 - 77.1)) * (mapWidth - 40) + 20;
  };

  const boatX = lonToX(boatCoords.lon);
  const boatY = latToY(boatCoords.lat);

  // IMBL coordinates
  const imblPoints = [
    { lat: 8.0000, lon: 78.7000 },
    { lat: 8.3500, lon: 78.4500 },
    { lat: 8.7000, lon: 78.3500 },
  ];

  return (
    <View style={styles.container}>
      {/* Top Banner: Dynamic IMBL Warning */}
      <View style={styles.warningBanner}>
        <View style={styles.warningRow}>
          <MaterialCommunityIcons name="alert" size={18} color="#D97706" />
          <Text style={styles.warningText}>
            ⚠ IMBL PROXIMITY: Distance 8.4 km – Safe / Monitor
          </Text>
        </View>
        <Text style={styles.warningSub}>
          Vessel inside Indian territorial waters. Monitor GPS route continuously.
        </Text>
      </View>

      {/* Map Header Controls */}
      <View style={styles.topControlRow}>
        {/* Mode Switcher: Tactical vs Live Map (Web only) */}
        {Platform.OS === 'web' && (
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, mapMode === 'tactical' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('tactical')}
            >
              <Ionicons
                name="navigate"
                size={13}
                color={mapMode === 'tactical' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  mapMode === 'tactical' && styles.modeToggleTextActive,
                ]}
              >
                Satellite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeToggleBtn, mapMode === 'live' && styles.modeToggleBtnActive]}
              onPress={() => setMapMode('live')}
            >
              <Ionicons
                name="globe"
                size={13}
                color={mapMode === 'live' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.modeToggleText,
                  mapMode === 'live' && styles.modeToggleTextActive,
                ]}
              >
                Live Pan/Zoom
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map Style Selector (only for tactical canvas) */}
        {mapMode === 'tactical' && (
          <View style={styles.styleSelector}>
            {(['satellite', 'standard', 'terrain'] as const).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleBtn,
                  baseMap === style && styles.styleBtnActive,
                ]}
                onPress={() => setBaseMap(style)}
              >
                <Text
                  style={[
                    styles.styleBtnText,
                    baseMap === style && styles.styleBtnTextActive,
                  ]}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action icons */}
        <View style={styles.actionIconRow}>
          <TouchableOpacity
            style={styles.circleIconBtn}
            onPress={() => setLayersOpen(true)}
          >
            <Ionicons name="layers" size={18} color={THEME.colors.primaryNavy} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleIconBtn}
            onPress={() => setLegendOpen(true)}
          >
            <Ionicons name="information-circle" size={18} color={THEME.colors.primaryNavy} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleIconBtn}
            onPress={() => setStatusOpen(true)}
          >
            <Ionicons name="pulse" size={18} color={THEME.colors.primaryNavy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Map: Either Live Leaflet (Web only) or Real Satellite Image Canvas */}
      {Platform.OS === 'web' && mapMode === 'live' ? (
        <View style={styles.liveMapWrapper}>
          <Iframe
            srcDoc={generateLeafletHtml()}
            style={styles.liveIframe}
            title="Live Interactive Satellite Map"
          />
        </View>
      ) : (
        <ImageBackground
          source={getMapBackground()}
          style={styles.mapCanvas}
          imageStyle={styles.mapCanvasImage}
        >
          {/* Subtle contrast gradient for tactical overlay */}
          <View style={styles.mapDarkGradient} pointerEvents="none" />
        {/* Ocean Grid Lines & Depth markings */}
        <View style={styles.gridOverlay}>
          <Text style={styles.watermarkText}>
            {baseMap === 'satellite'
              ? 'BHUVAN-INCOIS SATELLITE (WADGE BANK SECTOR)'
              : 'MARINE SPATIAL NAVIGATOR'}
          </Text>
          <Text style={styles.latLonIndicator}>
            LAT: {boatCoords.lat.toFixed(4)}°N  |  LON: {boatCoords.lon.toFixed(4)}°E
          </Text>
        </View>

        {/* Marine Protected Area: Gulf of Mannar Shaded Polygon */}
        {layers.showProtectedAreas && (
          <View
            style={[
              styles.mpaShadedArea,
              {
                left: lonToX(78.1),
                top: latToY(8.35),
                width: 90,
                height: 70,
              },
            ]}
          >
            <Text style={styles.mpaLabel}>PROTECTED MPA</Text>
            <Text style={styles.mpaSub}>Gulf of Mannar</Text>
          </View>
        )}

        {/* IMBL Boundary Line Representation */}
        {layers.showIMBL && (
          <View
            style={[
              styles.imblLineWrapper,
              {
                left: lonToX(78.2),
                top: latToY(8.35),
              },
            ]}
          >
            <View style={styles.imblDashedLine} />
            <View style={styles.imblBadge}>
              <Text style={styles.imblBadgeText}>IMBL BORDER (8.4 km)</Text>
            </View>
          </View>
        )}

        {/* SST Heatmap Simulation Layer */}
        {layers.showSST && (
          <View style={styles.sstOverlayLayer}>
            <Text style={styles.sstLegendText}>SST GRADIENT: 27.8°C — 28.5°C (Thermal Front)</Text>
          </View>
        )}

        {/* PFZ Heatmap Simulation Layer */}
        {layers.showHeatmap && (
          <View style={styles.heatmapOverlayLayer}>
            <View style={[styles.heatmapBlob, { left: lonToX(77.55) - 30, top: latToY(8.15) - 30 }]} />
          </View>
        )}

        {/* Safe Route Drawn Path */}
        {layers.showRoute && safeRoute && (
          <View style={styles.routeContainer}>
            {safeRoute.waypoints.map((wp, idx) => (
              <View
                key={idx}
                style={[
                  styles.routePoint,
                  {
                    left: lonToX(wp.longitude) - 5,
                    top: latToY(wp.latitude) - 5,
                  },
                ]}
              >
                <View style={styles.routeDot} />
              </View>
            ))}
            {/* Safe Corridor label */}
            <View
              style={[
                styles.routeLabelBox,
                {
                  left: lonToX(77.54),
                  top: latToY(8.11),
                },
              ]}
            >
              <Text style={styles.routeLabelText}>A* Safe Route ({safeRoute.distance_km} km)</Text>
            </View>
          </View>
        )}

        {/* Weather Hazards / Wind Vectors */}
        {layers.showWeather && (
          <View
            style={[
              styles.weatherMarker,
              {
                left: lonToX(77.45),
                top: latToY(8.05),
              },
            ]}
          >
            <MaterialCommunityIcons name="weather-windy" size={16} color="#38BDF8" />
            <Text style={styles.weatherMarkerText}>12 km/h NE ↗ (1.4m)</Text>
          </View>
        )}

        {/* PFZ Markers (Fish icon) */}
        {layers.showPFZ &&
          pfzList.map((pfz) => {
            const isSelected = selectedPFZ?.id === pfz.id;
            return (
              <TouchableOpacity
                key={pfz.id}
                style={[
                  styles.pfzMarker,
                  isSelected && styles.pfzMarkerSelected,
                  {
                    left: lonToX(pfz.longitude) - 18,
                    top: latToY(pfz.latitude) - 18,
                  },
                ]}
                onPress={() => onSelectPFZ(pfz)}
              >
                <FontAwesome5 name="fish" size={16} color="#FFFFFF" />
                <View style={styles.pfzTag}>
                  <Text style={styles.pfzTagText}>{pfz.code}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

        {/* Boat Marker (User's Current Location) */}
        {layers.showBoat && (
          <View
            style={[
              styles.boatMarkerContainer,
              {
                left: boatX - 22,
                top: boatY - 22,
              },
            ]}
          >
            <View style={styles.radarPulse} />
            <View style={styles.boatMarker}>
              <FontAwesome5 name="ship" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.boatLabel}>
              <Text style={styles.boatLabelText}>Sea Star (You)</Text>
            </View>
          </View>
        )}

        {/* Right Floating Controls: Compass & My Location */}
        <View style={styles.rightFloatControls}>
          <TouchableOpacity
            style={styles.compassBtn}
            onPress={() => setCompassHeading(0)}
          >
            <MaterialCommunityIcons
              name="compass-outline"
              size={22}
              color={THEME.colors.primaryNavy}
            />
            <Text style={styles.compassText}>N</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.myLocationBtn}
            onPress={() => setIsDemoLocation(true)}
          >
            <Ionicons name="locate" size={22} color={THEME.colors.primaryBlue} />
          </TouchableOpacity>
        </View>

        {/* Bottom Demo Location Toggle Bar */}
        <View style={styles.demoLocationBar}>
          <TouchableOpacity
            style={styles.demoLocationBtn}
            onPress={() => setIsDemoLocation(!isDemoLocation)}
          >
            <Ionicons
              name={isDemoLocation ? 'checkbox' : 'square-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.demoLocationText}>
              {getTranslation('useDemoLocation', lang)} (Kanyakumari Offshore)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadAreaBtn}
            onPress={() => setOfflineModalOpen(true)}
          >
            <Ionicons name="cloud-download-outline" size={14} color="#FFFFFF" />
            <Text style={styles.downloadAreaText}>
              {offlineDownloaded ? 'Offline Cached' : 'Download Area'}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      )}

      {/* Selected PFZ Bottom Action Sheet */}
      {selectedPFZ && (
        <View style={styles.pfzBottomSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <View style={styles.pfzBadgeRow}>
                <Text style={styles.sheetTitle}>
                  {selectedPFZ.code} – {selectedPFZ.name}
                </Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {selectedPFZ.confidence}% Confidence (Demo)
                  </Text>
                </View>
              </View>
              <Text style={styles.sheetSubtitle}>
                {selectedPFZ.distance_km} km {selectedPFZ.direction} • {selectedPFZ.source}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onSelectPFZ(null as any)}>
              <Ionicons name="close-circle" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Metric Chips */}
          <View style={styles.metricChipsRow}>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipLabel}>SST</Text>
              <Text style={styles.metricChipVal}>{selectedPFZ.sst}°C</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipLabel}>Chlorophyll</Text>
              <Text style={styles.metricChipVal}>{selectedPFZ.chlorophyll} mg/m³</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipLabel}>Wave</Text>
              <Text style={styles.metricChipVal}>{selectedPFZ.wave_height} m</Text>
            </View>
            <View style={styles.metricChip}>
              <Text style={styles.metricChipLabel}>Wind</Text>
              <Text style={styles.metricChipVal}>{selectedPFZ.wind_speed} km/h</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.sheetButtonsRow}>
            <TouchableOpacity
              style={styles.sheetActionBtnPrimary}
              onPress={() => onCreateRoute(selectedPFZ)}
            >
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.sheetBtnTextPrimary}>
                {safeRoute ? 'Route Active' : 'Create Safe Route'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetActionBtnSecondary}
              onPress={() => onSaveZone(selectedPFZ)}
            >
              <Ionicons name="bookmark-outline" size={16} color={THEME.colors.primaryNavy} />
              <Text style={styles.sheetBtnTextSecondary}>Save Zone</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetActionBtnSecondary}
              onPress={() => onAskOrca(`Tell me about ${selectedPFZ.code} fishing conditions`)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={THEME.colors.primaryNavy} />
              <Text style={styles.sheetBtnTextSecondary}>Ask ORCA</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Layers Modal */}
      <Modal visible={layersOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Map Layers</Text>
              <TouchableOpacity onPress={() => setLayersOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.layerList}>
              <Text style={styles.layerSectionTitle}>Marine Intelligence</Text>
              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showPFZ: !layers.showPFZ })}
              >
                <Text style={styles.layerName}>Potential Fishing Zones (PFZ)</Text>
                <Ionicons
                  name={layers.showPFZ ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showBoat: !layers.showBoat })}
              >
                <Text style={styles.layerName}>Vessel Boat Location</Text>
                <Ionicons
                  name={layers.showBoat ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showIMBL: !layers.showIMBL })}
              >
                <Text style={styles.layerName}>International Maritime Boundary (IMBL)</Text>
                <Ionicons
                  name={layers.showIMBL ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.warningRed}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() =>
                  setLayers({ ...layers, showProtectedAreas: !layers.showProtectedAreas })
                }
              >
                <Text style={styles.layerName}>Marine Protected Areas (MPA)</Text>
                <Ionicons
                  name={layers.showProtectedAreas ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showWeather: !layers.showWeather })}
              >
                <Text style={styles.layerName}>Weather & Hazards (Wind/Wave)</Text>
                <Ionicons
                  name={layers.showWeather ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showRoute: !layers.showRoute })}
              >
                <Text style={styles.layerName}>A* Safe Route Corridors</Text>
                <Ionicons
                  name={layers.showRoute ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.safeGreen}
                />
              </TouchableOpacity>

              <Text style={styles.layerSectionTitle}>Advanced Oceanographic Layers</Text>
              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showSST: !layers.showSST })}
              >
                <Text style={styles.layerName}>Sea Surface Temperature (SST)</Text>
                <Ionicons
                  name={layers.showSST ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerToggleRow}
                onPress={() => setLayers({ ...layers, showHeatmap: !layers.showHeatmap })}
              >
                <Text style={styles.layerName}>PFZ Density Heatmap (Demo)</Text>
                <Ionicons
                  name={layers.showHeatmap ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={THEME.colors.primaryBlue}
                />
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setLayersOpen(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Legend Modal */}
      <Modal visible={legendOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Map Legend</Text>
              <TouchableOpacity onPress={() => setLegendOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <FontAwesome5 name="ship" size={16} color="#0D2240" />
                <Text style={styles.legendLabel}>Your Boat Location</Text>
              </View>
              <View style={styles.legendItem}>
                <FontAwesome5 name="fish" size={16} color="#0284C7" />
                <Text style={styles.legendLabel}>Potential Fishing Zone (PFZ)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendImblLine} />
                <Text style={styles.legendLabel}>IMBL Boundary Line (Strict)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendMpaBox} />
                <Text style={styles.legendLabel}>Marine Protected Area (MPA)</Text>
              </View>
              <View style={styles.legendItem}>
                <MaterialCommunityIcons name="weather-windy" size={18} color="#0284C7" />
                <Text style={styles.legendLabel}>Wind & Wave Direction</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendRouteLine} />
                <Text style={styles.legendLabel}>Suggested A* Safe Trajectory</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setLegendOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Data Status Modal */}
      <Modal visible={statusOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Data Freshness & Telemetry</Text>
              <TouchableOpacity onPress={() => setStatusOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.statusList}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Satellite Imagery</Text>
                <Text style={styles.statusValGreen}>Available (Esri / Bhuvan)</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Marine OceanSat-3</Text>
                <Text style={styles.statusVal}>Updated: 10:30 AM (Demo)</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Marine Weather</Text>
                <Text style={styles.statusVal}>Updated: 10:25 AM</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>IMBL Boundary Layer</Text>
                <Text style={styles.statusVal}>Synchronized: 9:00 AM</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>GPS Status</Text>
                <Text style={styles.statusValGreen}>Active (Accurate: 4.2m)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setStatusOpen(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offline Download Area Modal */}
      <Modal visible={offlineModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Offline Coastal Area</Text>
              <TouchableOpacity onPress={() => setOfflineModalOpen(false)}>
                <Ionicons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <Text style={styles.offlineModalDesc}>
              Before setting sail, download marine spatial layers, PFZ zones, and safety
              boundaries for offline navigation when mobile network is lost at sea.
            </Text>

            <TouchableOpacity
              style={styles.offlineAreaCard}
              onPress={() => {
                setOfflineDownloaded(true);
                StorageService.addOfflineArea('Kanyakumari Coast');
                setOfflineModalOpen(false);
              }}
            >
              <View>
                <Text style={styles.offlineAreaTitle}>Kanyakumari Coast & Wadge Bank</Text>
                <Text style={styles.offlineAreaSize}>42 MB • Includes Satellite Cache & IMBL</Text>
              </View>
              <Ionicons
                name={offlineDownloaded ? 'checkmark-circle' : 'download-outline'}
                size={22}
                color={offlineDownloaded ? THEME.colors.safeGreen : THEME.colors.primaryBlue}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.offlineAreaCard}
              onPress={() => {
                setOfflineDownloaded(true);
                StorageService.addOfflineArea('Tamil Nadu South Coast');
                setOfflineModalOpen(false);
              }}
            >
              <View>
                <Text style={styles.offlineAreaTitle}>Tamil Nadu South Coast (Rameswaram to Kanyakumari)</Text>
                <Text style={styles.offlineAreaSize}>88 MB • Includes Palk Strait & Mannar MPA</Text>
              </View>
              <Ionicons name="download-outline" size={22} color={THEME.colors.primaryBlue} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOfflineModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadow.card,
    marginHorizontal: THEME.spacing.md,
    marginVertical: THEME.spacing.sm,
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  warningSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  styleSelector: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.full,
    padding: 2,
  },
  styleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  styleBtnActive: {
    backgroundColor: THEME.colors.primaryNavy,
  },
  styleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  styleBtnTextActive: {
    color: '#FFFFFF',
  },
  actionIconRow: {
    flexDirection: 'row',
    gap: 8,
  },
  circleIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mapCanvas: {
    height: 440,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#071A2E',
  },
  mapCanvasImage: {
    resizeMode: 'cover',
  },
  mapDarkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 26, 46, 0.25)',
  },
  liveMapWrapper: {
    height: 440,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#071A2E',
  },
  liveIframe: {
    width: '100%',
    height: 440,
    borderWidth: 0,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: THEME.borderRadius.full,
    padding: 2,
    marginRight: 6,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  modeToggleBtnActive: {
    backgroundColor: THEME.colors.primaryNavy,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#FFFFFF',
  },
  satelliteBg: {
    backgroundColor: '#071A2E',
  },
  standardBg: {
    backgroundColor: '#93C5FD',
  },
  terrainBg: {
    backgroundColor: '#0F3A4A',
  },
  gridOverlay: {
    position: 'absolute',
    top: 10,
    left: 12,
    zIndex: 2,
  },
  watermarkText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  latLonIndicator: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  mpaShadedArea: {
    position: 'absolute',
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.8)',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  mpaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
  },
  mpaSub: {
    fontSize: 8,
    color: '#E0F2FE',
  },
  imblLineWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 4,
  },
  imblDashedLine: {
    width: 2,
    height: 180,
    backgroundColor: '#EF4444',
  },
  imblBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: -80,
  },
  imblBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  sstOverlayLayer: {
    position: 'absolute',
    bottom: 45,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 3,
  },
  sstLegendText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  heatmapOverlayLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  heatmapBlob: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  routeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  routePoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  routeLabelBox: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  weatherMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 4,
  },
  weatherMarkerText: {
    color: '#E0F2FE',
    fontSize: 9,
    fontWeight: '600',
  },
  pfzMarker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
    ...THEME.shadow.card,
  },
  pfzMarkerSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#FACC15',
    transform: [{ scale: 1.15 }],
  },
  pfzTag: {
    position: 'absolute',
    bottom: -14,
    backgroundColor: '#0D2240',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pfzTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  boatMarkerContainer: {
    position: 'absolute',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 7,
  },
  radarPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  boatMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boatLabel: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  boatLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  rightFloatControls: {
    position: 'absolute',
    right: 12,
    top: 50,
    gap: 8,
    zIndex: 8,
  },
  compassBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...THEME.shadow.card,
  },
  compassText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: -4,
  },
  myLocationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...THEME.shadow.card,
  },
  demoLocationBar: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 8,
  },
  demoLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  demoLocationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  downloadAreaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primaryBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
  },
  downloadAreaText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  pfzBottomSheet: {
    padding: THEME.spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pfzBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  confidenceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metricChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: THEME.spacing.md,
  },
  metricChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricChipLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricChipVal: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
    marginTop: 2,
  },
  sheetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetActionBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primaryDeep,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
  },
  sheetBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetActionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sheetBtnTextSecondary: {
    color: THEME.colors.primaryNavy,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  layerList: {
    maxHeight: 350,
  },
  layerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  layerToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  layerName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: THEME.colors.primaryDeep,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  legendGrid: {
    gap: 12,
    marginVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  legendImblLine: {
    width: 20,
    height: 3,
    backgroundColor: '#DC2626',
  },
  legendMpaBox: {
    width: 20,
    height: 14,
    backgroundColor: 'rgba(14, 165, 233, 0.4)',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  legendRouteLine: {
    width: 20,
    height: 3,
    backgroundColor: '#16A34A',
  },
  statusList: {
    gap: 12,
    marginVertical: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusLabel: {
    fontSize: 13,
    color: '#475569',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  statusValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  offlineModalDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  offlineAreaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  offlineAreaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryNavy,
  },
  offlineAreaSize: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
