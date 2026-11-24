import { route, fetch } from '@forge/api';
import { buildNote, OPEN_RECALL_LABEL } from './note';
import { lookupVin } from './nhtsa';

// Adds the label without touching existing ones. `as` is api.asUser() or api.asApp().
export async function addLabel(as, issueKey) {
  const res = await as.requestJira(route`/rest/api/3/issue/${issueKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ update: { labels: [{ add: OPEN_RECALL_LABEL }] } }),
  });
  if (!res.ok) throw new Error(`label failed (HTTP ${res.status})`);
}

// Looks up the VIN (unless a result is given), posts an internal comment, and labels the issue when recalls exist.
export async function postNote(as, issueKey, vin, result) {
  try {
    result = result || (await lookupVin(fetch, vin));
    if (result.error) return { error: result.error };
    // sd.public.comment internal=true makes it an internal note in JSM; other projects ignore the property.
    const res = await as.requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: buildNote(result),
        properties: [{ key: 'sd.public.comment', value: { internal: true } }],
      }),
    });
    if (!res.ok) return { error: `Could not post comment (HTTP ${res.status})` };
    if (result.recalls.length) await addLabel(as, issueKey);
    return { ok: true, recalls: result.recalls.length };
  } catch (e) {
    return { error: `Post failed: ${e.message}` };
  }
}
