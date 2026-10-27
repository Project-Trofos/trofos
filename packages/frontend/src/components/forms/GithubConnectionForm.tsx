import React, { useEffect, useState } from 'react';
import { Alert, Button, message, Popconfirm, Select, Space, Typography } from 'antd';
import { useParams } from 'react-router-dom';

interface Repository { id: number; installationId: number; full_name: string }
interface Status {
  connection: { repo: string; installation_id: string | null; active: boolean } | null;
  authorised: boolean;
  installUrl: string;
}
export default function GithubConnectionForm(): JSX.Element {
  const { projectId } = useParams();
  const [status, setStatus] = useState<Status>();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selected, setSelected] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const base = `/api/github-connect/${projectId}`;
  async function request(path: string, method = 'GET', body?: unknown) {
    const response = await fetch(`${base}/${path}`, {
      method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Unable to connect GitHub. Please sign in and try again.');
    return data;
  }
  async function refresh() {
    const next: Status = await request('status');
    setStatus(next); setSelected(undefined);
    setRepositories(next.authorised ? await request('repositories') : []);
  }
  async function run(action: () => Promise<void>) {
    setBusy(true); setError('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'GitHub connection failed.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { setStatus(undefined); setRepositories([]); void run(refresh); }, [projectId]);
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {error && <Alert type="error" message={error} showIcon />}
      {status?.connection && <Typography.Text>
        {status.connection.active ? 'Connected' : 'Access unavailable'}: {status.connection.repo}
        {!status.connection.installation_id && ' (legacy webhook link)'}
      </Typography.Text>}
      <Typography.Text>Any project member can connect a repository accessible to their GitHub account and the TROFOS App.</Typography.Text>
      <Space wrap>
        <Button type="primary" loading={busy} onClick={() => void run(async () => {
          const { url } = await request('start', 'POST'); window.location.assign(url);
        })}>{status?.authorised ? 'Authorise GitHub again' : 'Connect GitHub'}</Button>
        {status && <Button href={status.installUrl} target="_blank" rel="noopener noreferrer">Install App / grant repository access</Button>}
        <Button disabled={busy} onClick={() => void run(refresh)}>Refresh</Button>
        {status?.connection && <Popconfirm title="Disconnect this repository for the project?" onConfirm={() => run(async () => {
          await request('connection', 'DELETE'); await refresh(); message.success('GitHub disconnected');
        })}><Button danger disabled={busy}>Disconnect</Button></Popconfirm>}
      </Space>
      {status?.authorised && <>
        {!repositories.length && <Alert type="info" message="No accessible repositories found. Install the App or request organisation approval, then refresh this page." />}
        <Select aria-label="GitHub repository" placeholder="Select a GitHub repository" showSearch
          optionFilterProp="label" style={{ width: '100%' }} value={selected} onChange={setSelected}
          disabled={busy} options={repositories.map((r) => ({ value: `${r.installationId}:${r.id}`, label: r.full_name }))} />
        <Button disabled={!selected || busy} onClick={() => void run(async () => {
          const [installationId, repositoryId] = selected!.split(':').map(Number);
          await request('connection', 'POST', { installationId, repositoryId });
          await refresh(); message.success('GitHub connected. PR synchronisation enabled.');
        })}>Save repository</Button>
      </>}
    </Space>
  );
}
