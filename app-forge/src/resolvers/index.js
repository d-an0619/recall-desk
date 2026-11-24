import Resolver from '@forge/resolver';
import { fetch } from '@forge/api';
import { lookupVin } from '../nhtsa';

const resolver = new Resolver();

resolver.define('lookup', async ({ payload }) => {
  try {
    return await lookupVin(fetch, payload.vin);
  } catch (e) {
    return { error: `Lookup failed: ${e.message}` };
  }
});

export const handler = resolver.getDefinitions();
