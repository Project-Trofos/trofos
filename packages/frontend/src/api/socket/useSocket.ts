import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import socket, { UpdateType } from './socket';

const callbackFuncs: { [key: string]: (type?: string) => void } = {};

// Use socket to connect to a room and callback when update is detected
export default function useSocket(
  updateType: UpdateType,
  roomId: string | undefined,
  callback: (type?: string) => void,
) {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Try to reconnect
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      setIsConnected(true);
    });

    if (roomId) {
      socket.emit('subscribeToUpdate', updateType, roomId);
      callbackFuncs[`${updateType}/${roomId}`] = callback;
    }

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('updated', (type?: string) => {
      callbackFuncs[`${updateType}/${roomId}`]?.(type);
    });

    return () => {
      if (roomId) {
        socket.emit('unsubscribeToUpdate', updateType, roomId);
        delete callbackFuncs[`${updateType}/${roomId}`];
      }
      // only disconnect if there are no more callback functions
      if (isEmpty(callbackFuncs)) {
        socket.off('updated');
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [roomId, updateType, callback]);

  return { isConnected };
}

export function emitUpdateEvent(roomId: string, type?: string): void {
  socket.volatile.emit('update', roomId, type);
}
