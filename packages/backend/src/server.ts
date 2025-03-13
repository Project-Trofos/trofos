import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/account.route';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';
import backlogRouter from './routes/backlog.route';
import userRouter from './routes/user.route';
import sprintRouter from './routes/sprint.route';
import feedbackRouter from './routes/feedback.route';
import roleRouter from './routes/role.route';
import githubRouter from './routes/github.route';
import settingsRouter from './routes/settings.route';
import epicRouter from './routes/epic.route';
import inviteRouter from './routes/invite.route';
import apiKeyRouter from './routes/apiKey.route';
import routerExternalV1 from './routes/external/v1/route.external.v1';
import aiRouter from './routes/ai.route';
import featureFlagRouter from './routes/featureFlag.route';
import issueRouter from './routes/issue.route';
import setUpSwagger from './swagger/swagger';
import promClient from 'prom-client';
import { trackApiUsage } from './middleware/api_usage_tracking.middleware';

// Prometheus metrics stuff
const register = new promClient.Registry();
register.setDefaultLabels({
  app: 'monitoring-article',
});
const collectDefaultMetrics = promClient.collectDefaultMetrics;
// Probe every 5th second.
collectDefaultMetrics({ register });

const httpRequestTimer = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  // buckets for response time from 0.1ms to 1s
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000],
});
register.registerMetric(httpRequestTimer);

// end of prometheus metrics stuff

const app = express();

export const port = 3003;
export const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

export const corsOptions = {
  origin: frontendUrl,
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// prometheus middleware to get metrics of response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTimeInMs = Date.now() - start;
    const route = req.originalUrl.replace(/\d+/g, ':id');
    httpRequestTimer.labels(req.method, route, res.statusCode.toString()).observe(responseTimeInMs);
  });
  next();
});

// Set up swagger documentation
setUpSwagger(app);

// API usage tracking middleware
app.use(trackApiUsage);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!');
});

app.get('/metrics', async (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

const router = express.Router();

router.use('/account', accountRouter);

// Routes for course
router.use('/course', courseRouter);

// Routes for project
router.use('/project', projectRouter);

// Routes for standUp are in projectRouter

// Routes for epic
router.use('/epic', epicRouter);

// Routes for backlog
router.use('/backlog', backlogRouter);

// Routes for user
router.use('/user', userRouter);

// Routes for backlog
router.use('/sprint', sprintRouter);

// Routes for settings
router.use('/feedback', feedbackRouter);

// Routes for role
router.use('/role', roleRouter);

// Routes for github app
router.use('/github', githubRouter);

// Routes for settings
router.use('/settings', settingsRouter);

// Routes for invites
router.use('/invite', inviteRouter);

// Routes for api keys
router.use('/api-key', apiKeyRouter);

// Routes for external api v1
router.use('/external/v1', routerExternalV1);

// Routes for ai actions
router.use('/ai', aiRouter);

// Routes for feature flags
router.use('/feature-flags', featureFlagRouter);

// Routes for issues
router.use('/issue', issueRouter);

app.use('/api', router);

export default app;
