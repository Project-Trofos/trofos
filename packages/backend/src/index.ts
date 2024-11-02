import cookieParser from 'cookie-parser';
import { Server, Socket } from 'socket.io';
import app, { corsOptions, port } from './server';
import { init } from './services/socket.service';
import { init as initBot} from './notifications/NotificationHandler'
import { initHocusPocus } from './hocus_pocus';
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening at port ${port}.`);
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

// Init hocus pocus for nots collab
// initHocusPocus();

// For unit testing
export default server;
