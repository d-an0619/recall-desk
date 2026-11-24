import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findVin, parseDecode, parseRecalls, recallsUrl } from '../src/nhtsa.js';

const load = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url)));
assert.equal(findVin('Customer VIN 5npe24af4fh000000 please check'), '5NPE24AF4FH000000');
assert.equal(findVin('bad VIN 5NPE24AF4FH00000I'), undefined); // I is illegal
assert.equal(findVin('too short 5NPE24AF4FH'), undefined);

const v = parseDecode(load('decode.json'));
assert.deepEqual([v.make, v.model, v.year], ['HYUNDAI', 'Sonata', '2015']);
assert.ok(v.warning); // sample VIN has a bad check digit but decodes
assert.ok(parseDecode({ Results: [{ ErrorText: 'x' }] }).error);
assert.match(recallsUrl(v), /make=HYUNDAI&model=Sonata&modelYear=2015/);

const r = parseRecalls(load('recalls.json'));
assert.equal(r.length, 9);
assert.ok(r[0].id && r[0].component && r[0].remedy);
assert.equal(r.filter((x) => x.parkIt).length, 2);
assert.ok(r.every((x) => x.parkOutSide === false && x.overTheAirUpdate === false));
console.log('ok');
