import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
const { setupWSConnection, setPersistence, WSSharedDoc } = require('y-websocket/bin/utils');
type WSSharedDocType = typeof WSSharedDoc;
import { IncomingMessage } from 'http';
import * as Y from 'yjs';
import { LeveldbPersistence } from 'y-leveldb'

export function initWss(server: http.Server) {
  const wss = new WebSocket.Server({ noServer: true });
  const ldb = new LeveldbPersistence('./yPersistence');
  setPersistence({
    provider: ldb,
    bindState: async (docName: string, ydoc: WSSharedDocType) => {
      const persistedYdoc = await ldb.getYDoc(docName);
      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      ldb.storeUpdate(docName, newUpdates);
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      ydoc.on('update', (update: Uint8Array) => {
        console.log("update bindstate")
        console.log(Y.decodeStateVector(update))
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async (docName: string, ydoc: WSSharedDocType) => {
      console.log("write state")
      console.log(docName)
      console.log(ydoc)
    }
  })

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
