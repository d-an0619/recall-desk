import api, { route, fetch } from '@forge/api';
import { findVin, lookupVin } from './nhtsa';

export async function lookupVehicleRecalls({ vin, issueKey } = {}) {
  try {
    if (!findVin(vin) && issueKey) {
      const res = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}?fields=summary,description`);
      if (!res.ok) return { error: `Could not read issue ${issueKey} (HTTP ${res.status})` };
      vin = JSON.stringify((await res.json()).fields); // description is ADF JSON
    }
    return await lookupVin(fetch, vin);
  } catch (e) {
    return { error: `Lookup failed: ${e.message}` };
  }
}
