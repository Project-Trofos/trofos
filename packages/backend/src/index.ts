import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/newBacklog', async (req, res) => {
  const {
    summary,
    type,
    sprintId,
    priority,
    reporterId,
    assigneeId,
    points,
    description,
    projectId,
  } = req.body;
  try {
    const backlog = await prisma.backlog.create({
      data: {
        summary,
        type,
        sprint : {
          connect: { id: sprintId },
        },
        priority,
        reporter: {
          connect: { id: reporterId },
        },
        assignee: {
          connect: { id: assigneeId },
        },
        points,
        description,
        project: {
          connect: { id: projectId },
        },
      },
    });

    res.status(200).json({ backlog });
  } catch (e) {
    console.error(e);
    res.status(500).send('Failed to create new backlog');
  } finally {
    await prisma.$disconnect();
  }
});

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Example app listening at http://localhost:${port}`);
});

// For unit testing
export default server;
