import Elysia from "elysia";
import { ExpensesService } from "./expenses.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";
import z from "zod";

const router = new Elysia({
  name: "expenses-router",
  prefix: "/expenses",
  tags: ["Expenses"],
})
  .use(authPlugin)
  .use(authorizationPlugin);

router.get(
  "/",
  async ({ query }) => {
    const category = Array.isArray(query.category) ? query.category.join(",") : query.category;
    const result = await ExpensesService.getAllExpenses(query.limit, query.offset, category, query.search);
    return { expenses: result.expenses, total: result.total, message: "Expenses fetched successfully" };
  },
  {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).optional().default(25),
      offset: z.coerce.number().min(0).optional().default(0),
      category: z.union([z.string(), z.array(z.string())]).optional(),
      search: z.string().optional(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Get all expenses" },
  },
);

router.post(
  "/",
  async ({ body, user }) => {
    const result = await ExpensesService.createExpense({
      description: body.description,
      amount: body.amount,
      category: body.category,
      notes: body.notes,
      date: new Date(body.date),
      createdBy: user.id,
    });
    return { data: result, message: "Expense created successfully" };
  },
  {
    body: z.object({
      description: z.string().min(1),
      amount: z.string().min(1),
      category: z.string().min(1),
      notes: z.string().optional(),
      date: z.string().datetime(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Create a new expense" },
  },
);

router.patch(
  "/:id",
  async ({ params, body }) => {
    const result = await ExpensesService.updateExpense(params.id, {
      description: body.description,
      amount: body.amount,
      category: body.category,
      notes: body.notes,
      date: body.date ? new Date(body.date) : undefined,
    });
    return { data: result, message: "Expense updated successfully" };
  },
  {
    body: z.object({
      description: z.string().min(1).optional(),
      amount: z.string().min(1).optional(),
      category: z.string().min(1).optional(),
      notes: z.string().optional(),
      date: z.string().datetime().optional(),
    }),
    restrictTo: ["admin"],
    detail: { summary: "Update an expense" },
  },
);

router.delete(
  "/:id",
  async ({ params }) => {
    await ExpensesService.deleteExpense(params.id);
    return { message: "Expense deleted successfully" };
  },
  {
    restrictTo: ["admin"],
    detail: { summary: "Delete an expense" },
  },
);

export { router as expenses_router };
