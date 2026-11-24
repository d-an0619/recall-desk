import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Textfield, Button, Stack, Inline, Lozenge, Strong, SectionMessage, Heading, useProductContext } from '@forge/react';
import { invoke, requestJira } from '@forge/bridge';
import { findVin } from '../nhtsa';

const App = () => {
  const ctx = useProductContext();
  const [vin, setVin] = useState('');
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState({});

  const lookup = async (v) => {
    setBusy(true);
    setOpen({});
    setState(await invoke('lookup', { vin: v }));
    setBusy(false);
  };

  // Prefill VIN from summary/description (description is ADF JSON; the regex works on its text).
  useEffect(() => {
    const key = ctx?.extension?.issue?.key;
    if (!key) return;
    requestJira(`/rest/api/3/issue/${key}?fields=summary,description`)
      .then((r) => r.json())
      .then((j) => {
        const found = findVin(j.fields?.summary) || findVin(JSON.stringify(j.fields?.description));
        if (found) setVin(found);
      })
      .catch(() => {});
  }, [ctx?.extension?.issue?.key]);

  const vehicle = state?.vehicle;
  return (
    <Stack space="space.100">
      <Inline space="space.100" alignBlock="end">
        <Textfield value={vin} placeholder="17-character VIN" onChange={(e) => setVin(e.target.value)} />
        <Button appearance="primary" isLoading={busy} onClick={() => lookup(vin)}>Look up</Button>
      </Inline>
      {state?.error && <SectionMessage appearance="error"><Text>{state.error}</Text></SectionMessage>}
      {vehicle && (
        <>
          <Heading size="small">{vehicle.year} {vehicle.make} {vehicle.model}</Heading>
          {vehicle.warning && <Text>Note: {vehicle.warning}</Text>}
          {state.recalls.length === 0 ? (
            <SectionMessage appearance="success"><Text>No recalls on record for this model and year.</Text></SectionMessage>
          ) : (
            <>
              <Lozenge appearance="removed" isBold>{state.recalls.length} recall(s)</Lozenge>
              {state.recalls.map((r) => (
                <Stack key={r.id} space="space.050">
                  <Inline space="space.100" alignBlock="center">
                    <Strong>{r.id}</Strong>
                    <Text>{r.date} - {r.component}</Text>
                    <Button appearance="subtle" onClick={() => setOpen({ ...open, [r.id]: !open[r.id] })}>
                      {open[r.id] ? 'Hide' : 'Details'}
                    </Button>
                  </Inline>
                  {open[r.id] && (
                    <>
                      <Text><Strong>Summary:</Strong> {r.summary}</Text>
                      <Text><Strong>Consequence:</Strong> {r.consequence}</Text>
                      <Text><Strong>Remedy:</Strong> {r.remedy}</Text>
                    </>
                  )}
                </Stack>
              ))}
            </>
          )}
        </>
      )}
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
