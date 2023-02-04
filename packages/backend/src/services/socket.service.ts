import { Server } from 'socket.io';
import sessionService from './session.service';

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export enum UpdateType {
  BACKLOG = 'backlog',
  RETRO = 'retro',
}

type ServerToClientEvents = {
  updated: (type?: string) => void;
};

type ClientToServerEvents = {
  subscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  unsubscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  update: (roomId: string, type?: string) => void;
};

// Initialise socket io server
export function init(socketServer: Server) {
  io = socketServer;

  io.on('connection', async (socket) => {
    const sessionId = (socket.request as typeof socket.request & { cookies: { [key: string]: string } }).cookies
      ?.trofos_sessioncookie;

    // Use session to track user connection
    if (!sessionId) {
      socket.disconnect();
      return;
    }

    // Disconnect if cannot find user session information
    try {
      await sessionService.getUserSession(sessionId);
    } catch (err) {
      socket.disconnect();
      return;
    }

    socket.on('disconnect', () => {
      socket.disconnect();
    });

    socket.on('subscribeToUpdate', (updateType, roomId) => {
      socket.join(`${updateType}/${roomId}`);
    });

    socket.on('unsubscribeToUpdate', (updateType, roomId) => {
      socket.leave(`${updateType}/${roomId}`);
    });

    socket.on('update', (roomId, type) => {
      socket.to(roomId).emit('updated', type);
    });
  });
}

export function getIo() {
  return io;
}
