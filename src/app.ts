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
          <a class="btn" href="intent://pathway.iamscammer.com/auth/verify-email?token=${query.token}&email=${query.email}#Intent;scheme=https;package=com.pathway.sajilo_restro_sewa;end;">Open in App</a>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  })
  .group("/api/v1", (router) => router.use(api_v1_router));

export { app, io, ioHandler };
