import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authenticationRouter from './routes/authentication.route';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';
import backlogRouter from './routes/backlog.route';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get('/', (req : express.Request, res: express.Response) => {
  res.send('Hello World!');
});

app.use('/auth', authenticationRouter);

// Routes for course
app.use('/course', courseRouter);

// Routes for project
app.use('/project', projectRouter);

// Routes for backlog
app.use('/backlog', backlogRouter);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`);
});

// For unit testing
export default server;
