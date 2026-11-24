# Recall Desk — Devpost submission draft

Category: Apps for Specialized Industries (automotive)
Bonus: Best Agents (Rovo `rovo:agent` + `action`)

## Tagline
Open safety recalls, right inside the service request — for dealership and repair-shop service desks.

## Inspiration
When a car owner contacts a dealership or repair shop, the first question an agent should answer is "does this vehicle have an open safety recall?" Today that means copying the VIN out of the ticket, pasting it into a government website, reading long recall notices, then retyping the answer to the customer and the technician. It is slow, easy to skip, and recalls with a "park outside" fire warning get missed.

## What it does
- **Issue panel in Jira Service Management.** Open a request and Recall Desk finds the VIN in the summary or description. One click decodes the vehicle (make, model, year, trim) and lists every NHTSA recall campaign with component, consequence and remedy. Urgent flags such as *Park outside* and *Do not drive* are shown up front. Invalid check digits are flagged so the agent can confirm the VIN.
- **Recall Desk Rovo agent.** Ask "Check open recalls for this request" in Rovo chat. The agent calls the app's `lookup-vehicle-recalls` action (by VIN, or by issue key — it reads the VIN from the request itself) and returns:
  1. the vehicle,
  2. the open recalls with campaign numbers,
  3. a polite customer reply draft,
  4. a technician checklist (parts check, remedy per campaign, safety notes).
  The agent is instructed never to invent recalls: every fact comes from the live NHTSA data.

## How we built it
- Atlassian Forge, UI Kit (`jira:issuePanel`), Node.js 24 runtime.
- `rovo:agent` + `action` modules; the action and the panel resolver share one small NHTSA module.
- Data: NHTSA vPIC VIN decoder and NHTSA Recalls API (public, no key). Declared in `permissions.external.fetch.backend`.
- No storage, no personal data kept.

## Challenges
- The Rovo agent does not appear in the agent selector until it is enabled/favourited.
- vPIC still decodes VINs with a wrong check digit, so we surface a warning instead of failing.

## What's next
- More recall sources (e.g. Korea, EU) behind the same action.
- Post the checklist as an internal note and create sub-tasks per campaign.
- Expose the lookup as an Atlassian MCP tool (`rovo:mcp`) for third-party agents.

## Installation (for judges)
1. Open the installation link (see `install-link.txt`) while logged in as a site admin, choose your site, and approve. The app installs on **Jira** (works in Jira Service Management projects).
2. Open any request whose summary or description contains a 17-character VIN, for example `5XYPG4A33KG000000`.
3. In the issue view, click the **Recall Desk** app button to open the panel, then **Look up**.
4. Rovo: open **Chat** in the top bar → agent selector → **Browse agents** → enable/favourite **Recall Desk** → "Check open recalls for this request". Requires Rovo enabled on the site.

## Built with
forge, rovo, jira-service-management, ui-kit, javascript, node.js, nhtsa-api

## Video
TODO (< 5 min, YouTube)
