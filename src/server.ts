import { app, ioHandler } from "./app";
import { env } from "./config/env";
import { startEmailWorker } from "./queue/email.worker";

// ─── Start Email Worker ────────────────────────────────────────────────────────
const emailWorker = startEmailWorker();

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = Bun.serve({
  port: env.PORT,
  hostname: "0.0.0.0",
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

console.log(
  `🚀 Server running on http://localhost:${env.PORT} as ${env.NODE_ENV}`,
);
console.log(`🔌 Socket.IO running on /realtime/`);

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.stop();
  console.log("🌐 HTTP server closed.");
  await emailWorker.close();
  console.log("📪 Email worker closed.");
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { server };
