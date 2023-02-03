import { useState, useEffect } from 'react';
import socket, { UpdateType } from './socket';

// Use socket to connect to a room and callback when update is detected
export default function useSocket(updateType: UpdateType, roomId: string | undefined, callback: () => void) {
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

export function emitUpdateEvent(roomId: string): void {
  socket.volatile.emit('update', roomId);
}
