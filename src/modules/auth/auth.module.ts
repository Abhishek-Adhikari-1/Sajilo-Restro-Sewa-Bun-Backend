import Elysia, { t } from "elysia";
import { db } from "../../config/firebase";
import { AuthModel } from "./auth.model";
import { Auth } from "./auth.service";

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

  //  const parseResult = userCreateSchema.safeParse(body);

  //  if (!parseResult.success) {
  //    set.status = 400;
  //    return {
  //      error: "Validation failed",
  //      details: parseResult.error.format(),
  //    };
  //  }

  //  const userData = parseResult.data;

  //  const ref = await usersCollection.add({
  //    name: userData.name,
  //    email: userData.email,
  //    createdAt: new Date(),
  //  });

  //  set.status = 201;
  //  return {
  //    ref: ref.id,
  //    message: "User created securely",
  //  };
});

router.post(
  "/login",
  async ({ body }) => {
    const res = await Auth.signIn({
      email: body.email,
      password: body.password,
    });

    return {
      message: "User logged in successfully",
      ...res,
    };
  },
  {
    body: AuthModel["signInBody"],
  },
);

router.post(
  "/register",
  async ({ body }) => {
    const res = await Auth.signUp({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    return {
      message: "User registered successfully",
      ...res,
    };
  },
  {
    body: AuthModel["signUpBody"],
  },
);

export { router as auth_router };
