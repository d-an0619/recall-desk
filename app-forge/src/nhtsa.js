// Pure NHTSA helpers, shared by the panel resolver and (later) the Rovo action.
export const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/i;

export const findVin = (text) => (String(text || '').match(VIN_RE) || [])[0]?.toUpperCase();

export const decodeUrl = (vin) =>
  `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;

export const recallsUrl = ({ make, model, year }) =>
  'https://api.nhtsa.gov/recalls/recallsByVehicle?' +
  new URLSearchParams({ make, model, modelYear: year });

// vPIC reports check-digit problems (ErrorCode 1) yet still decodes; only fail when nothing decoded.
export function parseDecode(json) {
  const r = json?.Results?.[0] || {};
  if (!r.Make || !r.Model || !r.ModelYear) {
    return { error: r.ErrorText || 'VIN could not be decoded' };
  }
  const warning = r.ErrorCode && r.ErrorCode !== '0' ? r.ErrorText : undefined;
  return { make: r.Make, model: r.Model, year: r.ModelYear, trim: r.Trim, warning };
}

export const parseRecalls = (json) =>
  (json?.results || []).map((x) => ({
    id: x.NHTSACampaignNumber,
    component: x.Component,
    summary: x.Summary,
    consequence: x.Consequence,
    remedy: x.Remedy,
    date: x.ReportReceivedDate,
    parkIt: !!x.parkIt,
    parkOutSide: !!x.parkOutSide,
    overTheAirUpdate: !!x.overTheAirUpdate,
  }));

// fetchFn(url) must return a Response; pass @forge/api fetch on the backend.
export async function lookupVin(fetchFn, vin) {
  vin = findVin(vin);
  if (!vin) return { error: 'Enter a valid 17-character VIN' };
  const get = async (url) => {
    const res = await fetchFn(url);
    if (!res.ok) throw new Error(`NHTSA returned HTTP ${res.status}`);
    return res.json();
  };
  const vehicle = parseDecode(await get(decodeUrl(vin)));
  if (vehicle.error) return { vin, error: vehicle.error };
  return { vin, vehicle, recalls: parseRecalls(await get(recallsUrl(vehicle))) };
}

// "DD/MM/YYYY" -> sortable "YYYYMMDD".
const dateKey = (d) => String(d || '').split('/').reverse().join('');

// Urgent flags first (do not drive, park outside), then newest first. Returns a new array.
export const sortRecalls = (recalls) =>
  [...recalls].sort(
    (a, b) =>
      (b.parkIt - a.parkIt) ||
      (b.parkOutSide - a.parkOutSide) ||
      dateKey(b.date).localeCompare(dateKey(a.date))
  );

export const flagsOf = (r) =>
  [r.parkIt && 'Do not drive', r.parkOutSide && 'Park outside', r.overTheAirUpdate && 'OTA update'].filter(Boolean);
