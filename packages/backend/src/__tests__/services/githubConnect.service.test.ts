import axios from 'axios';
import * as connect from '../../services/githubConnect.service';

afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
it('binds a flow to its user and session and consumes it once', () => {
  const { state } = connect.createFlow(1, 'session', 3);
  expect(() => connect.getFlow(state, 2, 'session')).toThrow();
  expect(() => connect.getFlow(state, 1, 'different')).toThrow();
  expect(connect.consumeFlow(state, 1, 'session').projectId).toBe(3);
  expect(() => connect.consumeFlow(state, 1, 'session')).toThrow();
});
it('expires pending credentials and invalidates an earlier flow on restart', () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(1000000);
  const old = connect.createFlow(1, 'session', 3);
  const next = connect.createFlow(1, 'session', 4);
  expect(() => connect.getFlow(old.state, 1, 'session')).toThrow();
  now.mockReturnValue(1600001);
  expect(() => connect.getFlow(next.state, 1, 'session')).toThrow();
});
it('only lists repositories returned for the authorised user and excludes suspended installations', async () => {
  const get = jest.spyOn(axios, 'get');
  get.mockResolvedValueOnce({ data: { installations: [{ id: 2, suspended_at: null }, { id: 3, suspended_at: 'now' }] } });
  get.mockResolvedValueOnce({ data: { repositories: [{ id: 4, full_name: 'owner/repo', clone_url: 'https://github.com/owner/repo.git' }] } });
  expect(await connect.repositories('user-token')).toEqual([{ id: 4, installationId: 2, full_name: 'owner/repo', clone_url: 'https://github.com/owner/repo.git' }]);
  expect(get).toHaveBeenCalledTimes(2);
});
it('sanitises upstream errors', async () => {
  jest.spyOn(axios, 'get').mockRejectedValue({ config: { headers: { Authorization: 'secret' } } });
  await expect(connect.repositories('token')).rejects.toThrow('Unable to verify GitHub access.');
});

describe('OAuth token exchange diagnostics', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    process.env.GITHUB_APP_CLIENT_ID = 'test-client';
    process.env.GITHUB_APP_CLIENT_SECRET = 'test-secret';
    process.env.GITHUB_APP_CALLBACK_URL = 'http://localhost:3000/api/github-connect/callback';
    process.env.GITHUB_APP_SLUG = 'test-app';
  });
  afterEach(() => { process.env = { ...originalEnv }; });

  it.each([
    ['incorrect_client_credentials', 'Check GITHUB_APP_CLIENT_SECRET'],
    ['redirect_uri_mismatch', 'Match GITHUB_APP_CALLBACK_URL'],
    ['bad_verification_code', 'Start a fresh Connect GitHub attempt'],
    ['unverified_user_email', 'Verify your GitHub account email'],
  ])('explains %s without reflecting upstream details', async (error, message) => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { error, error_description: 'sensitive-details' } });
    await expect(connect.exchangeCode('code', 'verifier')).rejects.toThrow(message);
  });

  it('does not expose request secrets on network failure', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('test-secret'));
    await expect(connect.exchangeCode('code', 'verifier')).rejects.toThrow('Cannot reach GitHub');
  });

  it('does not reflect unknown error strings', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { error: 'sensitive-details' } });
    await expect(connect.exchangeCode('code', 'verifier')).rejects.toThrow('GitHub rejected the token exchange.');
  });

  it('returns the token on success', async () => {
    jest.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: 'test-token' } });
    await expect(connect.exchangeCode('code', 'verifier')).resolves.toBe('test-token');
  });
});
