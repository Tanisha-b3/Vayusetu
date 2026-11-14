import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const BHOPAL_COORDS = {
  'mp nagar': [23.2332, 77.4350],
  'arera': [23.2156, 77.4337],
  'arera colony': [23.2156, 77.4337],
  'new market': [23.2384, 77.3995],
  'kolar': [23.1670, 77.4180],
  'tt nagar': [23.2350, 77.4080],
  'habibganj': [23.2205, 77.4385],
  'bairagarh': [23.2720, 77.3450],
};

const BAND_COLORS = {
  'Good': '#10b981',
  'Satisfactory': '#84cc16',
  'Moderate': '#eab308',
  'Poor': '#f97316',
  'Very Poor': '#ef4444',
  'Severe': '#881337',
  'Unknown': '#94a3b8',
};

export function AirQualityMap({ locations = [], onSelectEvidence }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Bhopal center
      const map = L.map(mapContainerRef.current).setView([23.2450, 77.4126], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    locations.forEach((loc, index) => {
      const key = (loc.location || '').toLowerCase().trim();
      let coords = BHOPAL_COORDS[key];

      // Fallback coordinate generation near center if station unknown
      if (!coords) {
        const angle = (index * (360 / Math.max(locations.length, 1))) * (Math.PI / 180);
        coords = [23.2450 + 0.04 * Math.sin(angle), 77.4126 + 0.04 * Math.cos(angle)];
      }

      bounds.extend(coords);

      const color = BAND_COLORS[loc.band] || '#64748b';
      const isHotspot = loc.band === 'Poor' || loc.band === 'Very Poor' || loc.band === 'Severe';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${color};
            width: ${isHotspot ? '28px' : '22px'};
            height: ${isHotspot ? '28px' : '22px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            ${isHotspot ? 'animation: pulse 2s infinite;' : ''}
          ">
            ${isHotspot ? '!' : ''}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a;">${loc.location}</h4>
          <div style="margin-bottom: 6px;">
            <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 11px;">
              ${loc.band || 'No Band'}
            </span>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <tr><td style="color: #64748b; padding: 2px 0;">PM2.5:</td><td style="font-weight: 600; text-align: right;">${loc.pm25?.value != null ? `${loc.pm25.value} µg/m³` : 'N/A'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">PM10:</td><td style="font-weight: 600; text-align: right;">${loc.pm10?.value != null ? `${loc.pm10.value} µg/m³` : 'N/A'}</td></tr>
            <tr><td style="color: #64748b; padding: 2px 0;">AQI:</td><td style="font-weight: 600; text-align: right;">${loc.aqi?.value != null ? loc.aqi.value : 'N/A'}</td></tr>
          </table>
          ${(loc.evidenceIds || []).length > 0 ? `
            <div style="font-size: 11px; color: #0369a1; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              Evidence: ${(loc.evidenceIds || []).map(id => `<span class="evidence-link" data-id="${id}" style="cursor: pointer; text-decoration: underline; margin-right: 4px;">[${id}]</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
    });

    if (locations.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [locations]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Air Quality Station Map</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({locations.length} monitoring stations)
          </span>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', flexWrap: 'wrap' }}>
          {Object.entries(BAND_COLORS).map(([name, col]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col }} />
              <span style={{ color: 'var(--text-muted)' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={mapContainerRef} style={{ height: '380px', width: '100%', zIndex: 1 }} />
    </div>
  );
}
