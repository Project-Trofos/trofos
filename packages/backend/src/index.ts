import process from 'node:process';
import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import app, { corsOptions, port } from './server';
import { init } from './services/socket.service';
import { init as initBot} from './notifications/NotificationHandler'
import { initCompleteInsightSub } from './services/aiInsight.service';
import { getLogger } from './logger/loggerProvider';

const logger = getLogger();

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  logger.info(`App listening at port ${port}.`);
});

process.on('warning', (warning: Error) => {
  logger.warn({ err: warning }, 'Node process warning');
});

process.on('exit', (code: number) => {
  logger.info({ exit_code: code }, `Process exited with code ${code}`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ err: reason }, 'Unhandled Rejection detected. Shutting down...');

  server.close(() => process.exit(1));
  setTimeout(() => process.abort(), 1000).unref();
  process.exit(1);
});

process.on('uncaughtException', (err: Error, origin: NodeJS.UncaughtExceptionOrigin) => {
  logger.fatal({ err, origin }, 'Uncaught Exception detected. Shutting down...');

  server.close(() => process.exit(1));
  setTimeout(() => process.abort(), 1000).unref();
  process.exit(1);
});


const wrap = (middleware: any) => (socket: Socket, next: any) => middleware(socket.request, {}, next);

const io = new Server(server, {
  path: '/socket.io',
  cors: corsOptions,
  cookie: true,
  transports: ['websocket'],
});

io.use(wrap(cookieParser()));


//initialize telegram bot
initBot()

// Initialize socket io
init(io);

initCompleteInsightSub();

// For unit testing
export default server;
