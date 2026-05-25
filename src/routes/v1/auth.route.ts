import Elysia, { t } from "elysia";
import { db } from "../../config/firebase";
import { userCreateSchema, usersCollection } from "../../schemas/user.schema";

const router = new Elysia({
  name: "auth-router",
  prefix: "/auth",
});

router.get("/", async () => {
  const snapshot = await db.collection("users").get();

  const users = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return users;
});

router.post("/login", ({ set }) => {
  set.status = "Failed Dependency";
  throw new Error("nIgger ko bann");
});

router.post(
  "/register",
  async ({ body, set }) => {
    const parseResult = userCreateSchema.safeParse(body);

    if (!parseResult.success) {
      set.status = 400;
      return {
        error: "Validation failed",
        details: parseResult.error.format(),
      };
    }

    const userData = parseResult.data;

    const ref = await usersCollection.add({
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
    });

    set.status = 201;
    return {
      ref: ref.id,
      message: "User created securely",
    };
  },
  {
    body: t.Object({
      name: t.String(),
      name2: t.String(),
    }),
  },
);

export { router as auth_router };
