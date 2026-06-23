import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { Server } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import { env } from "./config/env";
import { api_v1_router } from "./routes/v1/index.route";
import { responseWrapper } from "./middleware/response-wrapper";
import openapi from "@elysia/openapi";

const io = new Server({
  cors: {
    origin: env.ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

const engine = new Engine({
  path: "/realtime/",
});

io.bind(engine);

const ioHandler = engine.handler();

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.emit("connected", {
    socketId: socket.id,
  });

  socket.on("message", (data) => {
    console.log("📩", data);
    socket.emit("message", data);
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Disconnected: ${socket.id}`);
    console.log("Reason:", reason);
  });
});

const app = new Elysia({
  name: "sajilo-restro-sewa",
})
  .use(openapi())
  .use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    }),
  )
  .use(responseWrapper)
  .get("/", () => ({
    message: "Elysia + Socket.IO + Bun",
  }))
  .get("/auth/verify-email", ({ query }) => {
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Email - Sajilo Restro Sewa</title>
          <style>
              body { font-family: sans-serif; text-align: center; padding: 40px 20px; background: #FFFBF0; }
              .btn { display: inline-block; padding: 14px 24px; background: #06d969; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 20px; }
          </style>
      </head>
      <body>
          <h2>Email Verification</h2>
          <p>If the app didn't open automatically, click the button below to verify your email inside the Sajilo Restro Sewa app.</p>
          <a class="btn" href="intent://pathway.iamscammer.com/auth/verify-email?token=${query.token}&email=${query.email}#Intent;scheme=https;package=com.example.sajilo_restro_sewa;end;">Open in App</a>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  })
  .get("/.well-known/assetlinks.json", () => [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.example.sajilo_restro_sewa",
        sha256_cert_fingerprints: [
          "2A:DE:D5:A5:5A:70:48:39:4E:17:EC:5C:DC:97:24:B5:64:03:20:58:18:CE:89:E8:A7:B9:89:9C:FA:A3:97:40",
          "B4:3F:B6:5E:DF:E5:2E:F0:69:AF:AB:B4:FD:39:5A:DD:1B:81:54:83:31:41:42:B8:47:F7:32:29:FD:6C:04:40",
        ],
      },
    },
  ])
  .group("/api/v1", (router) => router.use(api_v1_router));

export { app, io, ioHandler };
