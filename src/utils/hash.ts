export abstract class Password {
  static async hash(plain: string): Promise<string> {
    return Bun.password.hash(plain, {
      algorithm: "argon2id",
      memoryCost: 65536, // 64 MiB
      timeCost: 3,
    });
  }

  static async verify(plain: string, hash: string): Promise<boolean> {
    return Bun.password.verify(plain, hash);
  }
}
