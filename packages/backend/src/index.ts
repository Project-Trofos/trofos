import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import accountRouter from './routes/account.route';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';
import backlogRouter from './routes/backlog.route';
import userRouter from './routes/user.route';
import sprintRouter from './routes/sprint.route';
import roleRouter from './routes/role.route';
import githubRouter from './routes/github.route';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

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

// Routes for role
app.use('/role', roleRouter);

// Routes for github app
app.use('/github', githubRouter);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`);
});

// For unit testing
export default server;
