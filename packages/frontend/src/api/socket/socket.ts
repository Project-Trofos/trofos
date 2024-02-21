import { io, Socket } from 'socket.io-client';

export enum UpdateType {
  BACKLOG = 'backlog',
  RETRO = 'retro',
  STAND_UP_NOTES = 'stand-up-notes',
  STAND_UP = 'stand-up',
}

type ServerToClientEvents = {
  updated: (id: string, type?: string) => void;
};

type ClientToServerEvents = {
  subscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  unsubscribeToUpdate: (updateType: UpdateType, roomId: string) => void;
  update: (roomId: string, type?: string) => void;
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('/', {
  path: '/api/socket.io/',
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
