import express from 'express';
import { hasAuth } from '../middleware/auth.middleware';
import prisma from '../models/prismaClient';
import * as connect from '../services/githubConnect.service';

const router = express.Router();
const cookieName = 'trofos_github_connect';
const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/api/github-connect', maxAge: 600000 };
const frontend = () => new URL(process.env.FRONTEND_BASE_URL || 'http://localhost:3000').origin;
const wrap = (handler: express.RequestHandler): express.RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch((error) => {
    // Only controlled messages are returned; never serialize upstream errors.
    res.status(400).json({ error: error instanceof Error && !('clientVersion' in error) ? error.message : 'Unable to update GitHub connection.' });
  });
};
async function member(userId: number, projectId: number) {
  if (!Number.isSafeInteger(projectId) || projectId <= 0) throw new Error('Invalid project ID.');
  const membership = await prisma.usersOnProjects.findUnique({ where: { project_id_user_id: { project_id: projectId, user_id: userId } } });
  if (!membership) throw new Error('You must be a member of this project.');
}
router.use(hasAuth(null, null));
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (req.method !== 'GET' && req.get('origin') !== frontend()) {
    res.status(403).json({ error: 'Invalid request origin.' });
    return;
  }
  next();
});
router.get('/callback', wrap(async (req, res) => {
  const session = res.locals.userSession;
  if (typeof req.query.state !== 'string') throw new Error('Missing GitHub state.');
  const flow = connect.consumeFlow(req.query.state, session.user_id, session.session_id);
  await member(session.user_id, flow.projectId);
  if (req.query.error || typeof req.query.code !== 'string') throw new Error('GitHub authorisation was cancelled. Return to project settings and try again.');
  const token = await connect.exchangeCode(req.query.code, flow.verifier);
  const next = connect.createFlow(session.user_id, session.session_id, flow.projectId);
  next.flow.token = token;
  res.cookie(cookieName, next.state, cookieOptions);
  res.redirect(`${frontend()}/project/${flow.projectId}/settings`);
}));
router.use('/:projectId', wrap(async (req, res, next) => {
  await member(res.locals.userSession.user_id, Number(req.params.projectId));
  next();
}));
router.get('/:projectId/status', wrap(async (req, res) => {
  const c = connect.config();
  const connection = await prisma.projectGitLink.findUnique({ where: { project_id: Number(req.params.projectId) } });
  let authorised = false;
  try {
    const flow = connect.getFlow(req.cookies[cookieName], res.locals.userSession.user_id, res.locals.userSession.session_id);
    authorised = flow.projectId === Number(req.params.projectId) && !!flow.token;
  } catch { /* No pending authorisation. */ }
  res.json({ connection, authorised, installUrl: `https://github.com/apps/${c.slug}/installations/new` });
}));
router.post('/:projectId/start', wrap(async (req, res) => {
  connect.config();
  const { state, flow } = connect.createFlow(res.locals.userSession.user_id, res.locals.userSession.session_id, Number(req.params.projectId));
  res.json({ url: connect.authorizeUrl(state, flow.verifier) });
}));
function authorisedFlow(req: express.Request, res: express.Response) {
  const flow = connect.getFlow(req.cookies[cookieName], res.locals.userSession.user_id, res.locals.userSession.session_id);
  if (flow.projectId !== Number(req.params.projectId) || !flow.token) throw new Error('Authorise GitHub for this project first.');
  return flow;
}
router.get('/:projectId/repositories', wrap(async (req, res) => {
  const flow = authorisedFlow(req, res);
  res.json(await connect.repositories(flow.token!));
}));
router.post('/:projectId/connection', wrap(async (req, res) => {
  const flow = authorisedFlow(req, res);
  const { installationId, repositoryId } = req.body;
  if (!Number.isSafeInteger(installationId) || !Number.isSafeInteger(repositoryId)) throw new Error('Select a valid repository.');
  // Re-fetch on save: IDs from the browser are not trusted and access may have changed.
  const repo = (await connect.repositories(flow.token!)).find((r) => r.installationId === installationId && r.id === repositoryId);
  if (!repo) throw new Error('The repository is not accessible to your GitHub account and this App.');
  await member(res.locals.userSession.user_id, flow.projectId);
  const data = { repo: repo.clone_url, installation_id: String(installationId), repository_id: String(repositoryId), connected_by: flow.userId, active: true };
  await prisma.projectGitLink.upsert({ where: { project_id: flow.projectId }, create: { project_id: flow.projectId, ...data }, update: data });
  connect.deleteFlow(req.cookies[cookieName]);
  res.clearCookie(cookieName, cookieOptions);
  res.json({ message: 'GitHub repository connected.' });
}));
router.delete('/:projectId/connection', wrap(async (req, res) => {
  await prisma.projectGitLink.deleteMany({ where: { project_id: Number(req.params.projectId) } });
  const state = req.cookies[cookieName];
  if (state) {
    try { authorisedFlow(req, res); connect.deleteFlow(state); } catch { /* Nothing to clear. */ }
  }
  res.clearCookie(cookieName, cookieOptions);
  res.json({ message: 'GitHub repository disconnected.' });
}));
export default router;
