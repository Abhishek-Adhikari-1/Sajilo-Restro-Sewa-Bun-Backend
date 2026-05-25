import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { Server } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import { env } from "./config/env";

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
  .use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    }),
  )
  .get("/", () => ({
    success: true,
    message: "Elysia + Socket.IO + Bun",
  }));

export { app, io, ioHandler };
