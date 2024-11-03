# Hocus pocus

[Hocus pocus](https://tiptap.dev/docs/hocuspocus/introduction) enables lives collaboration of sprint notes, like google docs. This is the backend server for CRDT to support live collab.

## Prisma

Ideally, this should be part of `backend` server, as we would want to share the db to access and update the `sprint` table. However, `express-ws` conflicts with socket.io library, so I shifted it into its own server. The prisma client is configured to access only the cols (in backend db) hocus pocus needs to do live collab

## Quick start

1. `pnpm run prisma-generate-dev`

2. `pnpm run start-dev`
