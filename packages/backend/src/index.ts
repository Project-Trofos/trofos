import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authentication from './controllers/authentication';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';

const prisma = new PrismaClient();
const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(cookieParser());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/newBacklog', async (req, res) => {
  backlogController.newBacklog(req, res, prisma);
});

app.get('/', (req : express.Request, res: express.Response) => {
  res.send('Hello World!');
});

app.post('/login', (req : express.Request, res: express.Response) => {
  authentication.loginUser(req, res, prisma);
});

// Routes for course
app.use('/course', courseRouter);

// Routes for project
app.use('/project', projectRouter);


const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`);
});

// For unit testing
export default server;
