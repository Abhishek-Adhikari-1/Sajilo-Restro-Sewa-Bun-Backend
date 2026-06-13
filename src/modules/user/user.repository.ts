import { and, eq } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import {
  accounts,
  users,
  type NewAccount,
  type NewUser,
  type UserStatus,
} from "../../db";

export abstract class UserRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async findUserByEmail(email: string, tx?: TX) {
    return (
      (await this.conn(tx).query.users.findFirst({
        where: eq(users.email, email),
        with: { avatar: true },
      })) ?? null
    );
  }

  static async findUserById(id: string, tx?: TX) {
    return (
      (await this.conn(tx).query.users.findFirst({
        where: eq(users.id, id),
        with: { avatar: true },
      })) ?? null
    );
  }

  static async findUserWithAccount(email: string, tx?: TX) {
    return (
      (await this.conn(tx).query.users.findFirst({
        where: eq(users.email, email),
        with: {
          avatar: true,
          accounts: {
            where: eq(accounts.providerId, "credentials"),
            limit: 1,
          },
        },
      })) ?? null
    );
  }

  static async createUser(
    data: Pick<NewUser, "firstName" | "lastName" | "email" | "status" | "role">,
    tx?: TX,
  ) {
    const [user] = await this.conn(tx).insert(users).values(data).returning();

    return user!;
  }

  static async updateUserStatus(userId: string, status: UserStatus, tx?: TX) {
    const [user] = await this.conn(tx)
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();

    return user ?? null;
  }

  static async markEmailVerified(userId: string, tx?: TX) {
    const [user] = await this.conn(tx)
      .update(users)
      .set({
        emailVerified: true,
        status: "active",
      })
      .where(eq(users.id, userId))
      .returning();

    return user ?? null;
  }

  static async createAccount(
    data: Pick<
      NewAccount,
      "userId" | "providerId" | "password" | "accountId"
    > & { accountId?: string },
    tx?: TX,
  ) {
    const [account] = await this.conn(tx)
      .insert(accounts)
      .values({
        ...data,
        accountId: data.accountId ?? data.userId,
      })
      .returning();

    return account!;
  }

  static async updateUserPassword(
    userId: string,
    passwordHash: string,
    tx?: TX,
  ) {
    await this.conn(tx)
      .update(accounts)
      .set({ password: passwordHash })
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.providerId, "credentials"),
        ),
      );
  }

  static async findAllUsers(tx?: TX) {
    return await this.conn(tx).query.users.findMany({
      with: { avatar: true },
    });
  }

  static async updateUser(
    userId: string,
    data: Partial<Pick<NewUser, "firstName" | "lastName" | "role" | "status" | "imageId">>,
    tx?: TX,
  ) {
    const [user] = await this.conn(tx)
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return user ?? null;
  }
}
