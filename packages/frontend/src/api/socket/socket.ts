import { io, Socket } from 'socket.io-client';

export enum UpdateType {
  BACKLOG = 'backlog',
}

type ServerToClientEvents = {
  updated: () => void;
};

type ClientToServerEvents = {
  subscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  unsubscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  update: (roomId: string) => void;
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.REACT_APP_SOCKET_IO_BASE_URL || 'http://localhost:3001',
  {
    path: process.env.REACT_APP_SOCKET_IO_PATH || '/socket.io/',
    withCredentials: true,
  },
);

export default socket;
