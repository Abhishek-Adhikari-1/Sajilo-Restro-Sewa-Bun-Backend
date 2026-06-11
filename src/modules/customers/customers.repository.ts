import { db, type TX } from "../../config/db";
import { customers } from "../../db/index";

export class CustomersRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async getCustomerById(id: string, tx?: TX) {
    const [customer] = await this.conn(tx).query.customers.findMany({
      where: (c, { eq }) => eq(c.id, id),
    });
    return customer || null;
  }

  static async getCustomerByPhone(phone: string, tx?: TX) {
    const [customer] = await this.conn(tx).query.customers.findMany({
      where: (c, { eq }) => eq(c.phone, phone),
    });
    return customer || null;
  }
}
