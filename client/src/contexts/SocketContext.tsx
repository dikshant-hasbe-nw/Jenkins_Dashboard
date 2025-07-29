import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = io('http://localhost:3001', {
    autoConnect: false
  });

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    connected: socket.connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 