import { CustomersRepo } from "./customers.repository";

export class CustomersService {
  static async getCustomerById(id: string) {
    const customer = await CustomersRepo.getCustomerById(id);
    if (!customer) throw new Error("Customer not found");
    return customer;
  }

  static async getCustomerByPhone(phone: string) {
    const customer = await CustomersRepo.getCustomerByPhone(phone);
    if (!customer) throw new Error("Customer not found");
    return customer;
  }
}
