import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
import { IncomingMessage } from 'http';

export function initWss(server: http.Server) {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    // You can check authentication/authorization here if needed
    console.log("upgrade req")

    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;

    console.log("here")
    setupWSConnection(ws, request);
  });

  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;
    const match = pathname.match(/^\/ws\/(.+)/);
    if (match) {
      // handle auth
      const id = match[1]; // Extract the dynamic part
      console.log(`Handling WebSocket connection for ID: ${id}`);
      console.log("cookie: ", request.headers.cookie)
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        console.log("here111")
        wss.emit('connection', ws, request);
      });
    } else {
      // handled by socket.io service
    }
  });
}
