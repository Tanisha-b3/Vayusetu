import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Play,
  Pause,
  Layers,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info,
  Maximize2,
} from 'lucide-react';
import { GlassPanel, AQIBadge, ConfidenceBadge, CitationPill } from './ui';

const BHOPAL_COORDS = {
  'hamidia road': [23.2625, 77.4110],
  'hamidia rd': [23.2625, 77.4110],
  'mp nagar': [23.2332, 77.4350],
  'arera': [23.2156, 77.4337],
  'arera colony': [23.2156, 77.4337],
  'new market': [23.2384, 77.3995],
  'kolar': [23.1670, 77.4180],
  'kolar road': [23.1670, 77.4180],
  'tt nagar': [23.2350, 77.4080],
  'habibganj': [23.2205, 77.4385],
  'berasia road': [23.2840, 77.4020],
  'govindpura': [23.2510, 77.4640],
};

const CPCB_COLORS = {
  Good: '#3DBE6B',
  Satisfactory: '#A3CF4A',
  Moderate: '#F2C230',
  Poor: '#F28C28',
  'Very Poor': '#E5483D',
  Severe: '#9B1C3B',
};

export function AirQualityMap({
  locations = [],
  onSelectEvidence,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  const [activePollutant, setActivePollutant] = useState('AQI'); // 'AQI' | 'PM2.5' | 'PM10'
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(12); // simulated hour (0 to 23)
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  // Play animation loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % 24);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isDarkMode = document.documentElement.classList.contains('dark');

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([23.245, 77.4126], 12);

      // CartoDB Muted basemap (Dark Matter in dark mode, Positron in light mode)
      const tileUrl = isDarkMode
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      // Zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    markersRef.current = {};

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    locations.forEach((loc, index) => {
      const name = (loc.location || loc.name || '').trim();
      const key = name.toLowerCase();
      let coords = BHOPAL_COORDS[key];

      if (!coords) {
        const angle = index * (360 / Math.max(locations.length, 1)) * (Math.PI / 180);
        coords = [23.245 + 0.035 * Math.sin(angle), 77.4126 + 0.04 * Math.cos(angle)];
      }

      bounds.extend(coords);

      const aqi = Math.round(loc.avgAqi || loc.aqi || 120);
      const band = loc.band || (aqi <= 100 ? 'Satisfactory' : aqi <= 200 ? 'Moderate' : 'Poor');
      const color = CPCB_COLORS[band] || '#F28C28';
      const isHotspot = band === 'Poor' || band === 'Very Poor' || band === 'Severe';

      // Soft glowing disc custom marker HTML
      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; items-center: center; justify-content: center; cursor: pointer;">
          ${
            isHotspot
              ? `<div style="position: absolute; inset: -4px; border-radius: 999px; background: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ''
          }
          <div style="
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 999px;
            background: ${color};
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 800;
          ">
            ${aqi}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'vayu-map-marker',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup Glass Card
      const popupContent = document.createElement('div');
      popupContent.className = 'font-body text-xs p-1 space-y-2';
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 4px;">
          <strong style="font-size: 13px; color: #10201c;">${name}</strong>
          <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: ${color};">${band}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #555;">
          <span>PM2.5: <strong>${Math.round(loc.avgPm25 || aqi * 0.55)} µg/m³</strong></span>
          <span>AQI: <strong style="color: ${color};">${aqi}</strong></span>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current[name] = { marker, coords };

      // Optional heat radius circle
      if (showHeatmap && isHotspot) {
        L.circle(coords, {
          radius: 900,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);
      }
    });

    if (locations.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [locations, showHeatmap]);

  const handleFlyToStation = (stationName) => {
    setSelectedStation(stationName);
    const entry = markersRef.current[stationName];
    if (entry && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(entry.coords, 14, { duration: 1.2 });
      entry.marker.openPopup();
    }
  };

  return (
    <div className={`relative w-full h-[540px] rounded-2xl overflow-hidden border border-obs-hairline shadow-elevated ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" tabIndex={0} aria-label="Interactive Air Quality Ward Map" />

      {/* Floating Glass Panel (Left): Ranked Hotspot List */}
      <div className="absolute top-4 left-4 z-10 w-72 max-h-[460px] flex flex-col pointer-events-none">
        <GlassPanel className="p-4 pointer-events-auto space-y-3 max-h-[460px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-obs-hairline">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cpcb-poor" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-obs-ink">
                Priority Corridors
              </span>
            </div>
            <span className="text-[10px] font-mono text-obs-muted">
              {locations.length} Sites
            </span>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {locations.map((loc, idx) => {
              const name = loc.location || loc.name;
              const aqi = Math.round(loc.avgAqi || loc.aqi || 120);
              const isSelected = selectedStation === name;

              return (
                <div
                  key={name || idx}
                  onClick={() => handleFlyToStation(name)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-obs-teal bg-obs-teal/15 shadow-xs'
                      : 'border-obs-hairline bg-obs-surface/80 hover:bg-obs-surface'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-obs-ink block">{name}</span>
                    <span className="text-[10px] text-obs-muted font-mono">
                      PM2.5: {Math.round(loc.avgPm25 || aqi * 0.55)} µg/m³
                    </span>
                  </div>
                  <AQIBadge band={loc.band} aqi={aqi} size="sm" />
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      {/* Floating Glass Panel (Top-Right): Legend & Heatmap Toggle */}
      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2 pointer-events-none">
        <GlassPanel className="p-3 pointer-events-auto flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              showHeatmap ? 'bg-obs-teal text-obs-canvas font-bold' : 'bg-obs-canvas text-obs-muted'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heat Surface</span>
          </button>
        </GlassPanel>
      </div>

      {/* Floating Glass Panel (Bottom): Time Scrubber & Pollutant Switcher */}
      <div className="absolute bottom-4 left-4 right-16 z-10 pointer-events-none flex justify-center">
        <GlassPanel className="p-3.5 pointer-events-auto w-full max-w-2xl flex flex-col sm:flex-row items-center gap-4">
          {/* Pollutant Tabs */}
          <div className="inline-flex p-1 bg-obs-canvas rounded-lg text-xs font-mono font-bold shrink-0">
            {['AQI', 'PM2.5', 'PM10'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePollutant(p)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activePollutant === p ? 'bg-obs-surface text-obs-teal shadow-xs' : 'text-obs-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Time Scrubber Slider with Play Button */}
          <div className="flex-1 flex items-center gap-3 w-full">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-lg bg-obs-teal text-obs-canvas flex items-center justify-center shrink-0 shadow-xs hover:bg-obs-teal-hover transition-colors"
              aria-label={isPlaying ? 'Pause timeline playback' : 'Play timeline playback'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-obs-muted">
                <span>Diurnal Cycle</span>
                <span className="text-obs-teal font-bold">{String(timeIndex).padStart(2, '0')}:00 hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={timeIndex}
                onChange={(e) => setTimeIndex(Number(e.target.value))}
                className="w-full h-1.5 bg-obs-hairline rounded-lg appearance-none cursor-pointer accent-obs-teal focus:outline-none"
              />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
