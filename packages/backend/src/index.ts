import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import accountRouter from './routes/account.route';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';
import backlogRouter from './routes/backlog.route';
import userRouter from './routes/user.route';
import sprintRouter from './routes/sprint.route';
import roleRouter from './routes/role.route';
import settingsRouter from './routes/settings.route';
import { init } from './services/socket.service';

const app = express();
const port = 3001;

const corsOptions = {
  origin: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
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

// Routes for role
app.use('/role', roleRouter);

// Routes for settings
app.use('/settings', settingsRouter);

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening at http://localhost:${port}`);
});

const wrap = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);

const io = new Server(server, {
  cors: corsOptions,
  cookie: true,
});

io.use(wrap(cookieParser()));

// Initialize socket io
init(io);

// For unit testing
export default server;
