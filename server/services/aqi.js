// CPCB (India) style bands. Verify breakpoints against the latest CPCB notification before production use.
export const BANDS = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];
const AQI_LIMITS = [50, 100, 200, 300, 400];
const PM25_LIMITS = [30, 60, 90, 120, 250];   // 24h, ug/m3
const PM10_LIMITS = [50, 100, 250, 350, 430]; // 24h, ug/m3

function idx(v, limits) {
  if (v == null) return null;
  let i = 0;
  while (i < limits.length && v > limits[i]) i++;
  return i;
}
export const aqiBandIndex = (v) => idx(v, AQI_LIMITS);
export const pm25BandIndex = (v) => idx(v, PM25_LIMITS);
export const pm10BandIndex = (v) => idx(v, PM10_LIMITS);
export const bandName = (i) => (i == null ? null : BANDS[i]);
export function worstBandIndex(list) {
  const xs = list.filter((x) => x != null);
  return xs.length ? Math.max(...xs) : null;
}
export const HOTSPOT_MIN_BAND = 3; // "Poor" or worse on any usable indicator
