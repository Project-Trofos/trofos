import { useState, useEffect } from 'react';
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
};

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:3001',
  {
    withCredentials: true,
  },
);

// Use socket to connect to a room and callback when update is detected
export default function useSocket(updateType: UpdateType, roomId: string | undefined, callback: () => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    if (roomId) {
      socket.emit('subscribeToUpdate', updateType, roomId);
    }

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('updated', () => {
      callback();
    });

    return () => {
      if (roomId) {
        socket.emit('unsubscribeToUpdate', updateType, roomId);
      }
      socket.off('updated');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [roomId, updateType, callback]);

  return { isConnected };
}
