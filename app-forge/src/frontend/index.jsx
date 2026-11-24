import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Textfield, Button, Stack, Inline, Lozenge, Strong, SectionMessage, Heading, useProductContext } from '@forge/react';
import { invoke, requestJira } from '@forge/bridge';
import { findVin, flagsOf, sortRecalls } from '../nhtsa';

const App = () => {
  const ctx = useProductContext();
  const [vin, setVin] = useState('');
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState({});
  const [post, setPost] = useState(null);
  const issueKey = ctx?.extension?.issue?.key;

  const lookup = async (v) => {
    setBusy(true);
    setOpen({});
    setPost(null);
    setState(await invoke('lookup', { vin: v, issueKey }));
    setBusy(false);
  };

  const postNote = async () => {
    setBusy(true);
    setPost(await invoke('addNote', { issueKey, vin: state.vin }));
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
        else setState({ error: 'No VIN found in this request. Enter the 17-character VIN above.' });
      })
      .catch(() => {});
  }, [ctx?.extension?.issue?.key]);

  const vehicle = state?.vehicle;
  return (
    <Stack space="space.100">
      <Inline space="space.100" alignBlock="end">
        <Textfield value={vin} placeholder="17-character VIN" onChange={(e) => setVin(e.target.value)} />
        <Button appearance="primary" isLoading={busy} onClick={() => (findVin(vin) ? lookup(vin) : setState({ error: 'Invalid VIN: it must be 17 characters (letters I, O, Q are not used).' }))}>Look up</Button>
      </Inline>
      {state?.error && <SectionMessage appearance="error"><Text>{state.error}</Text></SectionMessage>}
      {vehicle && (
        <>
          <Heading size="small">{vehicle.year} {vehicle.make} {vehicle.model}</Heading>
          {vehicle.warning && <Text>Note: {vehicle.warning}</Text>}
          {issueKey && <Button isLoading={busy} onClick={postNote}>Post to issue</Button>}
          {post?.ok && <SectionMessage appearance="success"><Text>Note posted to the issue.</Text></SectionMessage>}
          {post?.error && <SectionMessage appearance="error"><Text>{post.error}</Text></SectionMessage>}
          {state.recalls.length === 0 ? (
            <SectionMessage appearance="success"><Text>No recalls on record for this model and year.</Text></SectionMessage>
          ) : (
            <>
              <Lozenge appearance="removed" isBold>{state.recalls.length} recall(s)</Lozenge>
              {sortRecalls(state.recalls).map((r) => (
                <Stack key={r.id} space="space.050">
                  <Inline space="space.100" alignBlock="center">
                    <Strong>{r.id}</Strong>
                    <Text>{r.date} - {r.component}</Text>
                    {flagsOf(r).map((f) => <Lozenge key={f} appearance={f === 'OTA update' ? 'inprogress' : 'removed'}>{f}</Lozenge>)}
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
