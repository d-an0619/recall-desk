import Resolver from '@forge/resolver';
import api, { fetch } from '@forge/api';
import { lookupVin } from '../nhtsa';
import { addLabel, postNote } from '../post';

const resolver = new Resolver();

resolver.define('lookup', async ({ payload }) => {
  try {
    const result = await lookupVin(fetch, payload.vin);
    if (payload.issueKey && result.recalls?.length) {
      await addLabel(api.asUser(), payload.issueKey).catch((e) => console.error(e.message));
    }
    return result;
  } catch (e) {
    return { error: `Lookup failed: ${e.message}` };
  }
});

// Posts the recall note as the current user.
resolver.define('addNote', ({ payload }) => postNote(api.asUser(), payload.issueKey, payload.vin));

export const handler = resolver.getDefinitions();
