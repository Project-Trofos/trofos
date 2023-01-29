import { UserSession } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import sessionService from './session.service';

let io: Server<ClientToServerEvents, ServerToClientEvents>;
const userSocketMap: Map<number, Socket> = new Map();

export enum UpdateType {
  BACKLOG = 'backlog',
}

type ServerToClientEvents = {
  updated: () => void;
};

type ClientToServerEvents = {
  subscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  unsubscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
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
    let sessionInformation: UserSession | undefined;
    try {
      sessionInformation = await sessionService.getUserSession(sessionId);
    } catch (err) {
      socket.disconnect();
      return;
    }

    // By default, each user joins a room with his user id
    socket.join(`user/${sessionInformation.user_id.toString()}`);

    // Store user's socket
    userSocketMap.set(sessionInformation.user_id, socket);

    socket.on('disconnect', () => {
      if (sessionInformation) {
        userSocketMap.delete(sessionInformation.user_id);
      }
      socket.disconnect();
    });

    socket.on('subscribeToUpdate', (updateType, roomId) => {
      socket.join(`${updateType}/${roomId}`);
    });

    socket.on('unsubscribeToUpdate', (updateType, roomId) => {
      socket.leave(`${updateType}/${roomId}`);
    });
  });
}

export function getIo() {
  return io;
}

export function getSocket(userId: number) {
  return userSocketMap.get(userId);
}
