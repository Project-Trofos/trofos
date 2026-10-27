import axios from 'axios';
import { createHash, randomBytes } from 'crypto';

export interface ConnectionFlow {
  userId: number;
  sessionId: string;
  projectId: number;
  verifier: string;
  expires: number;
  token?: string;
}

// Temporary authorisation only: never persisted, and expires after ten minutes.
// A restart requires reconnecting. Multi-worker deployments need a shared store.
const flows = new Map<string, ConnectionFlow>();
function prune() {
  for (const [id, flow] of flows) if (flow.expires <= Date.now()) flows.delete(id);
}
export function createFlow(userId: number, sessionId: string, projectId: number) {
  prune();
  for (const [id, flow] of flows) if (flow.sessionId === sessionId) flows.delete(id);
  if (flows.size >= 1000) throw new Error('Too many pending GitHub connections. Try again later.');
  const state = randomBytes(32).toString('hex');
  const flow: ConnectionFlow = { userId, sessionId, projectId, verifier: randomBytes(32).toString('base64url'), expires: Date.now() + 600000 };
  flows.set(state, flow);
  return { state, flow };
}
export function getFlow(state: string, userId: number, sessionId: string) {
  prune();
  const flow = flows.get(state);
  if (!flow || flow.userId !== userId || flow.sessionId !== sessionId) throw new Error('GitHub connection expired or does not belong to this session. Connect again.');
  return flow;
}
export function deleteFlow(state: string) { flows.delete(state); }
export function consumeFlow(state: string, userId: number, sessionId: string) {
  const flow = getFlow(state, userId, sessionId);
  deleteFlow(state);
  return flow;
}
export function config() {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  const callback = process.env.GITHUB_APP_CALLBACK_URL;
  const slug = process.env.GITHUB_APP_SLUG;
  if (!clientId || !clientSecret || !callback || !slug || !/^[a-zA-Z0-9-]+$/.test(slug)) {
    throw new Error('GitHub connection is not configured. Set the App client ID, client secret, callback URL and slug.');
  }
  return { clientId, clientSecret, callback, slug };
}
export function authorizeUrl(state: string, verifier: string) {
  const c = config();
  return `https://github.com/login/oauth/authorize?${new URLSearchParams({
    client_id: c.clientId, redirect_uri: c.callback, state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
  })}`;
}
export async function exchangeCode(code: string, verifier: string): Promise<string> {
  const c = config();
  let data: { access_token?: unknown; error?: unknown };
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.callback, code, code_verifier: verifier,
    }, { headers: { Accept: 'application/json' }, timeout: 15000, maxRedirects: 0 });
    data = response.data || {};
  } catch (error) {
    // Never propagate Axios errors: they contain client secrets and authorisation codes.
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    throw new Error(status
      ? `GitHub token exchange failed (HTTP ${status}). Check the App credentials and try again.`
      : 'Cannot reach GitHub to exchange the authorisation code. Check backend network access and try again.');
  }
  const errors: Record<string, string> = {
    incorrect_client_credentials: 'GitHub rejected the client credentials. Check GITHUB_APP_CLIENT_SECRET belongs to the configured App client ID, then restart the backend.',
    redirect_uri_mismatch: 'GitHub rejected the callback URL. Match GITHUB_APP_CALLBACK_URL exactly to a registered redirect URI for this App.',
    bad_verification_code: 'GitHub rejected the authorisation code or PKCE verifier. Start a fresh Connect GitHub attempt; do not refresh the callback page.',
    unverified_user_email: 'Verify your GitHub account email address, then start Connect GitHub again.',
  };
  if (typeof data.error === 'string') {
    throw new Error(Object.prototype.hasOwnProperty.call(errors, data.error)
      ? errors[data.error] : 'GitHub rejected the token exchange. Start Connect GitHub again and check the App authorisation settings.');
  }
  if (typeof data.access_token !== 'string' || !data.access_token) {
    throw new Error('GitHub returned no user access token. Start Connect GitHub again.');
  }
  return data.access_token;
}
export async function userGet<T>(path: string, token: string): Promise<T> {
  try {
    return (await axios.get<T>(`https://api.github.com${path}`, { headers: {
      Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'TROFOS',
    }, timeout: 15000, maxRedirects: 0 })).data;
  } catch { throw new Error('Unable to verify GitHub access. Check App access and authorise again.'); }
}
export interface UserRepository { id: number; full_name: string; clone_url: string }
export async function repositories(token: string) {
  const result: (UserRepository & { installationId: number })[] = [];
  for (let page = 1; ; page++) {
    const { installations } = await userGet<{ installations: { id: number; suspended_at: string | null }[] }>(`/user/installations?per_page=100&page=${page}`, token);
    for (const installation of installations) {
      if (installation.suspended_at) continue;
      for (let repoPage = 1; ; repoPage++) {
        const data = await userGet<{ repositories: UserRepository[] }>(`/user/installations/${installation.id}/repositories?per_page=100&page=${repoPage}`, token);
        result.push(...data.repositories.map((repo) => ({ ...repo, installationId: installation.id })));
        if (data.repositories.length < 100) break;
      }
    }
    if (installations.length < 100) return result;
  }
}
