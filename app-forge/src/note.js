// Pure builder for the Jira comment (Atlassian Document Format). No Forge imports, so it is testable in plain node.
import { flagsOf, sortRecalls } from './nhtsa.js';

const text = (t, strong) => ({ type: 'text', text: String(t), ...(strong && { marks: [{ type: 'strong' }] }) });
const para = (...content) => ({ type: 'paragraph', content });
const bullets = (items) => ({
  type: 'bulletList',
  content: items.map((i) => ({ type: 'listItem', content: [para(text(i))] })),
});

export const OPEN_RECALL_LABEL = 'open-recall';

// result = successful lookupVin() output ({ vin, vehicle, recalls }).
export function buildNote({ vin, vehicle, recalls }) {
  const v = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
  const sorted = sortRecalls(recalls);
  const content = [para(text('Recall Desk: ', true), text(`${v} (VIN ${vin})`))];
  if (vehicle.warning) content.push(para(text(`VIN note: ${vehicle.warning}`)));
  if (!sorted.length) {
    content.push(para(text('No open NHTSA recalls listed for this model and year today.')));
    return { version: 1, type: 'doc', content };
  }
  content.push(para(text(`${sorted.length} NHTSA recall(s)`, true)));
  content.push(
    bullets(
      sorted.map((r) => {
        const f = flagsOf(r);
        return `${r.id} [${r.date}] ${r.component}${f.length ? ` (${f.join(', ')})` : ''}. Remedy: ${r.remedy || 'n/a'}`;
      })
    )
  );
  const checklist = ['Confirm the VIN against the registration', ...sorted.map((r) => `Check remedy parts for ${r.id}`)];
  if (sorted.some((r) => r.parkIt)) checklist.push('Do not drive: tow the vehicle in');
  if (sorted.some((r) => r.parkOutSide)) checklist.push('Park outside, do not store indoors');
  checklist.push('Confirm completion against each NHTSA campaign number');
  content.push(para(text('Technician checklist', true)), bullets(checklist));
  return { version: 1, type: 'doc', content };
}
