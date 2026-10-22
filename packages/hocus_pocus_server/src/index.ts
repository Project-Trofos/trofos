import './tracing';
import express from 'express';
import { Server, onListenPayload } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";
import { Database } from "@hocuspocus/extension-database";
import expressWebsockets from "express-ws";
import { PrismaClient } from '@prisma/client';
import { trace, Span } from '@opentelemetry/api';
import { getLogger } from '@trofos-nus/common';

const app = expressWebsockets(express());

const prisma = new PrismaClient();
const logger = getLogger();
const tracer = trace.getTracer('trofos-hocus-pocus');

const server = Server.configure({
  port: 3002,
  debounce: 0,
  address: '127.0.0.1',
  name: 'hocuspocus-trofos-01',
  extensions: [
    new Logger({
      log: (message) => logger.debug(message),
    }),
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
          logger.error({ error, sprint_id: documentName }, 'Error fetching collab_notes');
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
          logger.error({ error, sprint_id: documentName }, 'Error storing collab_notes');
          throw error;
        }
      },
    })
  ],
  async onAuthenticate(data) {
    return await tracer.startActiveSpan('hocus_pocus.authenticate', async (span: Span) => {
      try {
        span.setAttribute('sprint_id', data.documentName);

        const url = `${process.env.BACKEND_URL}/api/sprint/${data.documentName}/live-notes/auth`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Cookie': data.requestHeaders.cookie || '',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          logger.warn({ status: res.status, sprint_id: data.documentName }, 'Live-notes authentication failed');
          throw new Error("Failed to authenticate");
        }

        logger.info({ sprint_id: data.documentName }, 'Live-notes authenticated successfully');
        return data;
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }
})

app.app.ws("/api/ws/collaboration", (ws, req) => {
  logger.info({ url: req.url, remote_addr: req.socket.remoteAddress }, 'Hocus Pocus WebSocket connection started');

  ws.on('close', (code, reason) => {
    logger.info({ code, reason: reason.toString() }, 'Hocus Pocus WebSocket connection closed');
  });

  server.handleConnection(ws, req);
});

app.app.listen(3002, () => {
  logger.info('Hocus Pocus server listening on port 3002');
});
