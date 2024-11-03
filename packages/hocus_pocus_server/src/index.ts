import express from 'express';
import { Server, onListenPayload } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import { SQLite } from "@hocuspocus/extension-sqlite";
import expressWebsockets from "express-ws";

const app = expressWebsockets(express());

const server = Server.configure({
  port: 3002,
  debounce: 0,
  address: '127.0.0.1',
  name: 'hocuspocus-trofos-01',
  extensions: [
    new Logger(),
    new SQLite(),
  ],
})

app.app.ws("/api/ws/collaboration", (ws, req) => {
  console.log("Hocus Pocus connection")
  server.handleConnection(ws, req);
});

app.app.listen(3002, () => {
  console.log("Hocus Pocus server listening on port 3002");
});
