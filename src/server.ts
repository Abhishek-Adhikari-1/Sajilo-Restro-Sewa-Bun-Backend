import { app, ioHandler } from "./app";
import { env } from "./config/env";

const server = Bun.serve({
  port: env.PORT,
  idleTimeout: 30,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/realtime/")) {
      return ioHandler.fetch(req, server);
    }
    return app.fetch(req);
  },
  websocket: ioHandler.websocket,
});

console.log(`🚀 Server running on http://localhost:${env.PORT} as ${env.NODE_ENV}`);
console.log(`🔌 Socket.IO running on /realtime/`);

export { server };
