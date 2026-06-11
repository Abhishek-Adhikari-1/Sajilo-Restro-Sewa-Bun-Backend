import Elysia from "elysia";
import { CustomersService } from "./customers.service";
import { authPlugin } from "../../middleware/auth.plugin";
import { authorizationPlugin } from "../../middleware/authorization-plugin";

export const customers_router = new Elysia({
  name: "customers-router",
  prefix: "/customers",
  tags: ["Customers"],
})
  .use(authPlugin)
  .use(authorizationPlugin)
  .get(
    "/search",
    async ({ query }) => {
      const phone = query.phone as string;
      if (!phone) {
        throw new Error("Phone number is required");
      }
      try {
        const customer = await CustomersService.getCustomerByPhone(phone);
        return { data: customer, message: "Customer details fetched successfully" };
      } catch (e: any) {
        throw new Error("Customer not found");
      }
    },
    {
      restrictTo: ["admin", "waiter", "cashier", "kitchen"],
      detail: { summary: "Search customer by phone number" },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const customer = await CustomersService.getCustomerById(id);
      return { data: customer, message: "Customer details fetched successfully" };
    },
    {
      restrictTo: ["admin", "waiter", "cashier", "kitchen"],
      detail: { summary: "Get customer details by ID" },
    },
  );
