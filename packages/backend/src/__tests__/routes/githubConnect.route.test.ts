import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import * as connect from '../../services/githubConnect.service';
import router from '../../routes/githubConnect.route';

jest.mock('../../middleware/auth.middleware', () => ({ hasAuth: () => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.get('x-test-user')) return res.sendStatus(401);
  res.locals.userSession = { user_id: 1, session_id: 'session' }; next();
} }));
const app = express(); app.use(express.json(), cookieParser(), router);
const env = { ...process.env };
beforeEach(() => {
  process.env.GITHUB_APP_CLIENT_ID = 'client'; process.env.GITHUB_APP_CLIENT_SECRET = 'secret';
  process.env.GITHUB_APP_CALLBACK_URL = 'http://localhost:3000/api/github-connect/callback';
  process.env.GITHUB_APP_SLUG = 'trofos'; process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
  prismaMock.usersOnProjects.findUnique.mockResolvedValue({ user_id: 1, project_id: 3 } as any);
});
afterEach(() => { jest.restoreAllMocks(); process.env = { ...env }; });
it('rejects anonymous users and nonmembers', async () => {
  expect((await request(app).get('/3/status')).status).toBe(401);
  prismaMock.usersOnProjects.findUnique.mockResolvedValue(null);
  expect((await request(app).post('/3/start').set('x-test-user', '1').set('Origin', 'http://localhost:3000')).status).toBe(400);
});
it('rejects cross-origin mutations', async () => {
  expect((await request(app).post('/3/start').set('x-test-user', '1').set('Origin', 'https://evil.example')).status).toBe(403);
});
it('starts OAuth with state and S256 PKCE', async () => {
  const res = await request(app).post('/3/start').set('x-test-user', '1').set('Origin', 'http://localhost:3000');
  expect(res.status).toBe(200);
  const url = new URL(res.body.url);
  expect(url.searchParams.get('state')).toHaveLength(64);
  expect(url.searchParams.get('code_challenge_method')).toBe('S256');
});
it('rejects invalid callback state before exchanging the code', async () => {
  const exchange = jest.spyOn(connect, 'exchangeCode');
  expect((await request(app).get('/callback?state=bad&code=code').set('x-test-user', '1')).status).toBe(400);
  expect(exchange).not.toHaveBeenCalled();
});
it('accepts the callback once, sets an HTTP-only handle and returns to the originating project', async () => {
  const { state } = connect.createFlow(1, 'session', 3);
  const exchange = jest.spyOn(connect, 'exchangeCode').mockResolvedValue('private-user-token');
  const response = await request(app).get(`/callback?state=${state}&code=code`).set('x-test-user', '1');
  expect(response.status).toBe(302);
  expect(response.headers.location).toBe('http://localhost:3000/project/3/settings');
  expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  expect(response.headers['set-cookie'][0]).not.toContain('private-user-token');
  expect((await request(app).get(`/callback?state=${state}&code=code`).set('x-test-user', '1')).status).toBe(400);
  expect(exchange).toHaveBeenCalledTimes(1);
});
it('rejects using authorisation for a different project', async () => {
  const { state, flow } = connect.createFlow(1, 'session', 3); flow.token = 'token';
  expect((await request(app).get('/4/repositories').set('x-test-user', '1').set('Cookie', `trofos_github_connect=${state}`)).status).toBe(400);
});
it('rechecks repository access on save and prevents forged selections', async () => {
  const { state, flow } = connect.createFlow(1, 'session', 3); flow.token = 'token';
  jest.spyOn(connect, 'repositories').mockResolvedValue([]);
  const res = await request(app).post('/3/connection').set('x-test-user', '1').set('Origin', 'http://localhost:3000')
    .set('Cookie', `trofos_github_connect=${state}`).send({ installationId: 2, repositoryId: 4 });
  expect(res.status).toBe(400); expect(prismaMock.projectGitLink.upsert).not.toHaveBeenCalled();
});
it('saves a verified repository and removes temporary authorisation', async () => {
  const { state, flow } = connect.createFlow(1, 'session', 3); flow.token = 'token';
  jest.spyOn(connect, 'repositories').mockResolvedValue([{ id: 4, installationId: 2, full_name: 'owner/repo', clone_url: 'https://github.com/owner/repo.git' }]);
  const res = await request(app).post('/3/connection').set('x-test-user', '1').set('Origin', 'http://localhost:3000')
    .set('Cookie', `trofos_github_connect=${state}`).send({ installationId: 2, repositoryId: 4 });
  expect(res.status).toBe(200);
  expect(prismaMock.projectGitLink.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: expect.objectContaining({ installation_id: '2', repository_id: '4', connected_by: 1 }) }));
  expect(() => connect.getFlow(state, 1, 'session')).toThrow();
});
