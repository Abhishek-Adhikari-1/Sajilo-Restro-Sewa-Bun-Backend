import { db } from "../../config/db";
import { UserRepo } from "./user.repository";
import { Password } from "../../utils/hash";
import { AppError } from "../../utils/app-error";
import { HTTP_STATUS } from "../../utils/http-status";

export abstract class UserService {
  static async getAllUsers() {
    const users = await UserRepo.findAllUsers();
    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified,
      role: user.role,
      avatar: user.avatar?.secureUrl || null,
      imageId: user.imageId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  static async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "waiter" | "cashier" | "kitchen";
    imageId?: string;
  }) {
    const existingUser = await UserRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, "Email is already registered.");
    }

    // Generate random 12-char secure password
    const rawPassword = crypto.randomUUID().substring(0, 12);
    const passwordHash = await Password.hash(rawPassword);

    const createdUser = await db.transaction(async (tx) => {
      const user = await UserRepo.createUser(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          status: "active",
          role: data.role,
          imageId: data.imageId || null,
          emailVerified: true,
        } as any,
        tx,
      );

      await UserRepo.createAccount(
        {
          userId: user.id,
          providerId: "credentials",
          password: passwordHash,
          accountId: user.id,
        },
        tx,
      );

      return user;
    });

    const userWithAvatar = await UserRepo.findUserById(createdUser.id);

    console.log({ rawPassword });

    return {
      user: {
        id: userWithAvatar!.id,
        firstName: userWithAvatar!.firstName,
        lastName: userWithAvatar!.lastName,
        email: userWithAvatar!.email,
        status: userWithAvatar!.status,
        emailVerified: userWithAvatar!.emailVerified,
        role: userWithAvatar!.role,
        avatar: userWithAvatar!.avatar?.secureUrl || null,
        imageId: userWithAvatar!.imageId,
        createdAt: userWithAvatar!.createdAt,
        updatedAt: userWithAvatar!.updatedAt,
      },
    };
  }

  static async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: "admin" | "waiter" | "cashier" | "kitchen";
      status?: "active" | "inactive" | "suspended" | "disabled";
      imageId?: string | null;
    },
  ) {
    const existing = await UserRepo.findUserById(id);
    if (!existing) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found.");
    }

    const updated = await UserRepo.updateUser(id, data);
    if (!updated) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Failed to update user.",
      );
    }

    const userWithAvatar = await UserRepo.findUserById(id);

    return {
      id: userWithAvatar!.id,
      firstName: userWithAvatar!.firstName,
      lastName: userWithAvatar!.lastName,
      email: userWithAvatar!.email,
      status: userWithAvatar!.status,
      emailVerified: userWithAvatar!.emailVerified,
      role: userWithAvatar!.role,
      avatar: userWithAvatar!.avatar?.secureUrl || null,
      imageId: userWithAvatar!.imageId,
      createdAt: userWithAvatar!.createdAt,
      updatedAt: userWithAvatar!.updatedAt,
    };
  }
}
