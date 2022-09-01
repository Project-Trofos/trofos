import express from 'express';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import authentication from './controllers/authentication';
import courseRouter from './routes/course.route';
import projectRouter from './routes/project.route';

const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());

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
