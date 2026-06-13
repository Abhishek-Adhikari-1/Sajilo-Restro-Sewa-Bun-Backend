import Elysia from "elysia";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import { UserService } from "./user.service";
import z from "zod";

const router = new Elysia({
  name: "user-router",
  prefix: "/users",
  tags: ["Users"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.get(
  "/",
  async ({ user }) => {
    let result = await UserService.getAllUsers();
    if (user && user.id) {
      result = result.filter((u: any) => u.id !== user.id);
    }
    return { users: result, message: "Users fetched successfully" };
  },
  {
    restrictTo: ["admin"],
    detail: { summary: "Get all users / staff" },
  },
);

// router.post(
//   "/",
//   async ({ body }) => {
//     const result = await UserService.createUser({
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       role: body.role as any,
//       imageId: body.imageId,
//     });
//     return {
//       message: "Staff member created successfully",
//       data: result.user,
//       generatedPassword: result.generatedPassword,
//     };
//   },
//   {
//     body: z.object({
//       firstName: z.string().min(1),
//       lastName: z.string().min(1),
//       email: z.string().email(),
//       role: z.enum(["admin", "waiter", "cashier", "kitchen"]),
//       imageId: z.string().uuid().optional(),
//     }),
//     restrictTo: ["admin"],
//     detail: { summary: "Create a new staff user" },
//   },
// );

router.patch(
  "/:id",
  async ({ params, body }) => {
    const result = await UserService.updateUser(params.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role as any,
      status: body.status as any,
      imageId: body.imageId,
    });
    return { data: result, message: "User updated successfully" };
  },
  {
    body: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      role: z.enum(["admin", "waiter", "cashier", "kitchen"]).optional(),
      status: z.enum(["inactive", "active", "suspended", "disabled"]).optional(),
      imageId: z.string().uuid().nullable().optional(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Update user details, role, or status" },
  },
);

export { router as user_router };
