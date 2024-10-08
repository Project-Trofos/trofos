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
import setUpSwagger from './swagger/swagger';

const app = express();

export const port = 3001;
export const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

export const corsOptions = {
  origin: frontendUrl,
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Set up swagger documentation
setUpSwagger(app);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!');
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

app.use('/api', router);
// For unit testing
export default app;
