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

const app = express();

export const port = 3001;
export const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost';

export const corsOptions = {
  origin: frontendUrl,
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!');
});

app.use('/account', accountRouter);

// Routes for course
app.use('/course', courseRouter);

// Routes for project
app.use('/project', projectRouter);

// Routes for backlog
app.use('/backlog', backlogRouter);

// Routes for user
app.use('/user', userRouter);

// Routes for backlog
app.use('/sprint', sprintRouter);

// Routes for settings
app.use('/feedback', feedbackRouter);

// Routes for role
app.use('/role', roleRouter);

// Routes for github app
app.use('/github', githubRouter);

// Routes for settings
app.use('/settings', settingsRouter);

// For unit testing
export default app;
