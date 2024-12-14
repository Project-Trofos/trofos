import express from 'express';
import { Server, onListenPayload } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import { Database } from "@hocuspocus/extension-database";
import expressWebsockets from "express-ws";
import { PrismaClient } from '@prisma/client';

const app = expressWebsockets(express());

const prisma = new PrismaClient();

const server = Server.configure({
  port: 3002,
  debounce: 0,
  address: '127.0.0.1',
  name: 'hocuspocus-trofos-01',
  extensions: [
    new Logger(),
    new Database({
      fetch: async ({ documentName }) => {
        // Lets standardize document name to be sprint id
        const sprintId = Number(documentName);
        try {
          const sprint = await prisma.sprint.findUnique({
            where: {
              id: sprintId,
            }
          });
      
          if (sprint && sprint.collab_notes) {
            return sprint.collab_notes
          } else {
            return null;
          }
        } catch (error) {
          throw error;
        }
      },
      store: async ({ documentName, state }) => {
        const sprintId = Number(documentName);
        try {
          await prisma.sprint.update({
            where: {
              id: sprintId,
            },
            data: {
              collab_notes: state,
            }
          });
        } catch (error) {
          throw error;
        }
      },
    })
  ],
  async onAuthenticate(data) {
    const url = `${process.env.BACKEND_URL}/api/sprint/${data.documentName}/live-notes/auth`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': data.requestHeaders.cookie || '',
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error("Failed to authenticate");
    }

    return data;
  }
})

app.app.ws("/api/ws/collaboration", (ws, req) => {
  console.log("Hocus Pocus connection")
  server.handleConnection(ws, req);
});

app.app.listen(3002, () => {
  console.log("Hocus Pocus server listening on port 3002");
});
