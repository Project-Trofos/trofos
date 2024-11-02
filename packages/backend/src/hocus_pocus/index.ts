import { Server } from "@hocuspocus/server";
import { expressWsApp } from "../server";

export function initHocusPocus() {
  console.log("Initializing Hocus Pocus");
  
  const server = Server.configure({
    async onAuthenticate(data) {
      const { request } = data;
      // authenticate cookie
    }
  });

  expressWsApp.app.ws("/api/ws/collaboration", (ws, req) => {
    console.log("Hocus Pocus connection")
    server.handleConnection(ws, req);
  });
};
