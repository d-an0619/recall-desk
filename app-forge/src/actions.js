import api, { route, fetch } from '@forge/api';
import { findVin, lookupVin } from './nhtsa';
import { addLabel, postNote } from './post';

export async function lookupVehicleRecalls({ vin, issueKey } = {}) {
  try {
    if (!findVin(vin) && issueKey) {
      const res = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueKey}?fields=summary,description`);
      if (!res.ok) return { error: `Could not read issue ${issueKey} (HTTP ${res.status})` };
      vin = JSON.stringify((await res.json()).fields); // description is ADF JSON
    }
    const result = await lookupVin(fetch, vin);
    if (issueKey && result.recalls?.length) {
      await addLabel(api.asUser(), issueKey).catch((e) => console.error(e.message));
    }
    return result;
  } catch (e) {
    return { error: `Lookup failed: ${e.message}` };
  }
}

// Rovo action: post the recall note to the issue (VIN optional, read from the issue otherwise).
export async function postRecallNote({ issueKey, vin } = {}) {
  if (!issueKey) return { error: 'issueKey is required' };
  const result = await lookupVehicleRecalls({ vin, issueKey });
  if (result.error) return result;
  return postNote(api.asUser(), issueKey, vin, result);
}

// Trigger: new issue with a VIN in summary/description gets the note + label, as the app. Never throws.
export async function onIssueCreated(event) {
  try {
    const key = event?.issue?.key;
    console.log(`onIssueCreated ${key}`);
    if (!key) return;
    const res = await api.asApp().requestJira(route`/rest/api/3/issue/${key}?fields=summary,description`);
    if (!res.ok) return console.error(`Could not read ${key} (HTTP ${res.status})`);
    const { fields } = await res.json();
    const vin = findVin(fields?.summary) || findVin(JSON.stringify(fields?.description));
    if (!vin) return;
    const out = await postNote(api.asApp(), key, vin);
    if (out.error) console.error(`${key}: ${out.error}`);
  } catch (e) {
    console.error(`onIssueCreated failed: ${e.message}`);
  }
}
