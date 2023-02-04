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

    const connectListener = () => {
      setIsConnected(true);
    };

    socket.on('connect', connectListener);

    if (roomId) {
      socket.emit('subscribeToUpdate', updateType, roomId);
      callbackFuncs[`${updateType}/${roomId}`] = callback;
    }

    const disconnectListener = () => {
      setIsConnected(false);
    };

    socket.on('disconnect', disconnectListener);

    const updatedListener = (id: string, type?: string) => {
      if (id !== `${updateType}/${roomId}`) return;
      callbackFuncs[id]?.(type);
    };

    socket.on('updated', updatedListener);

    return () => {
      if (roomId) {
        socket.emit('unsubscribeToUpdate', updateType, roomId);
        delete callbackFuncs[`${updateType}/${roomId}`];
      }
      socket.off('updated', updatedListener);
      socket.off('connect', connectListener);
      socket.off('disconnect', disconnectListener);
    };
  }, [roomId, updateType, callback]);

  return { isConnected };
}

export function emitUpdateEvent(roomId: string, type?: string): void {
  socket.volatile.emit('update', roomId, type);
}
