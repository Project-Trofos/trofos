import axios from 'axios';
import { generateKeyPairSync } from 'crypto';
import jwt from 'jsonwebtoken';
import { GithubAppService } from '../../services/githubApp.service';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const request = jest.spyOn(axios, 'request');
const service = new GithubAppService('123', privateKey);

afterEach(() => jest.resetAllMocks());

it('signs a verifiable RS256 JWT with clock skew allowance and short expiry', async () => {
  request.mockResolvedValueOnce({ data: [] });
  await service.listInstallations();
  const config = request.mock.calls[0][0];
  const token = String(config.headers?.Authorization).replace('Bearer ', '');
  const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'], issuer: '123' }) as jwt.JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  expect(payload.iat).toBeLessThanOrEqual(now - 60);
  expect(payload.exp).toBeGreaterThan(now);
  expect(payload.exp).toBeLessThanOrEqual(now + 540);
  expect(config.timeout).toBe(15000);
  expect(config.maxRedirects).toBe(0);
});

it('paginates installations', async () => {
  request.mockResolvedValueOnce({ data: Array.from({ length: 100 }, (_, id) => ({ id })) });
  request.mockResolvedValueOnce({ data: [{ id: 101 }] });
  expect(await service.listInstallations()).toHaveLength(101);
  expect(request.mock.calls[1][0].url).toContain('page=2');
});

it('requests metadata-only access and paginates repositories using the installation token', async () => {
  request.mockResolvedValueOnce({ data: { token: 'test-installation-token' } });
  request.mockResolvedValueOnce({ data: { repositories: Array.from({ length: 100 }, (_, id) => ({ id })) } });
  request.mockResolvedValueOnce({ data: { repositories: [{ id: 101 }] } });
  expect(await service.listRepositories(42)).toHaveLength(101);
  expect(request.mock.calls[0][0]).toMatchObject({
    method: 'POST', url: 'https://api.github.com/app/installations/42/access_tokens',
    data: { permissions: { metadata: 'read' } },
  });
  expect(request.mock.calls[1][0].headers?.Authorization).toBe('Bearer test-installation-token');
  expect(request.mock.calls[2][0].url).toContain('page=2');
});

it.each([0, -1, 1.5, NaN])('rejects invalid installation ID %s before calling GitHub', async (id) => {
  await expect(service.listRepositories(id)).rejects.toThrow('positive safe integer');
  expect(request).not.toHaveBeenCalled();
});

it('does not leak Axios request headers or response bodies on API failure', async () => {
  request.mockRejectedValueOnce({
    isAxiosError: true, response: { status: 401, data: 'sensitive-body' },
    config: { headers: { Authorization: 'sensitive-token' } },
  });
  await expect(service.listInstallations()).rejects.toEqual(new Error('GitHub API request failed (HTTP 401).'));
});

it('sanitises network errors', async () => {
  request.mockRejectedValueOnce(new Error('sensitive network details'));
  await expect(service.listInstallations()).rejects.toThrow('GitHub API request failed (network or timeout).');
});

it('requires configuration only when the service is explicitly constructed', () => {
  const previous = process.env.GITHUB_APP_ID;
  delete process.env.GITHUB_APP_ID;
  try {
    expect(() => GithubAppService.fromEnvironment()).toThrow('GITHUB_APP_ID');
  } finally {
    if (previous !== undefined) process.env.GITHUB_APP_ID = previous;
  }
});
