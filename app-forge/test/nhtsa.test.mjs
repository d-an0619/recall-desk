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

// note builder + sorting
import { buildNote } from '../src/note.js';
import { sortRecalls, flagsOf } from '../src/nhtsa.js';
const sorted = sortRecalls(r);
assert.ok(sorted[0].parkIt && sorted[1].parkIt); // urgent first
const rest = sorted.slice(2).map((x) => x.date.split('/').reverse().join(''));
assert.deepEqual(rest, [...rest].sort().reverse()); // then newest first
assert.deepEqual(flagsOf({ parkIt: true, overTheAirUpdate: true }), ['Do not drive', 'OTA update']);
const note = buildNote({ vin: '5NPE24AF4FH000000', vehicle: v, recalls: r });
assert.equal(note.type, 'doc');
const flat = JSON.stringify(note);
assert.ok(flat.includes('2015 HYUNDAI Sonata') && flat.includes(r[0].id) && flat.includes('Do not drive'));
assert.ok(JSON.stringify(buildNote({ vin: 'X', vehicle: v, recalls: [] })).includes('No open NHTSA recalls'));
console.log('ok note');
