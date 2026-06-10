import { and, eq, lt, ne } from "drizzle-orm";
import { db, type TX } from "../../config/db";
import { sessions, verifications, type VerificationType } from "../../db";

export abstract class AuthRepo {
  private static conn(tx?: TX) {
    return tx ?? db;
  }

  static async createSession(
    data: {
      userId: string;
      token: string;
      expiresAt: Date;
      userAgent?: string;
      ipAddress?: string;
    },
    tx?: TX,
  ) {
    const [session] = await this.conn(tx)
      .insert(sessions)
      .values(data)
      .returning();

    return session!;
  }

  static async findSessionByToken(token: string, tx?: TX) {
    return (
      (await this.conn(tx).query.sessions.findFirst({
        where: eq(sessions.token, token),
        with: {
          user: {
            with: {
              avatar: true,
            },
          },
        },
      })) ?? null
    );
  }

  static async findSessionById(id: string, tx?: TX) {
    return (
      (await this.conn(tx).query.sessions.findFirst({
        where: eq(sessions.id, id),
      })) ?? null
    );
  }

  static async deleteSessionByToken(token: string, tx?: TX) {
    await this.conn(tx).delete(sessions).where(eq(sessions.token, token));
  }

  static async deleteSessionById(id: string, tx?: TX) {
    await this.conn(tx).delete(sessions).where(eq(sessions.id, id));
  }

  static async deleteAllSessionsByUserId(userId: string, tx?: TX) {
    await this.conn(tx).delete(sessions).where(eq(sessions.userId, userId));
  }

  static async deleteAllSessionsByUserIdExcept(
    userId: string,
    sessionId: string,
    tx?: TX,
  ) {
    await this.conn(tx)
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), ne(sessions.id, sessionId)));
  }

  static async deleteExpiredSessions(tx?: TX) {
    await this.conn(tx)
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));
  }

  static async createVerification(
    data: {
      identifier: string;
      type: VerificationType;
      tokenHash: string;
      expiresAt: Date;
      metadata?: Record<string, unknown>;
    },
    tx?: TX,
  ) {
    const [verification] = await this.conn(tx)
      .insert(verifications)
      .values({
        identifier: data.identifier,
        type: data.type,
        token: data.tokenHash,
        expiresAt: data.expiresAt,
        metadata: data.metadata ?? null,
      })
      .returning();

    return verification!;
  }

  static async findVerificationByToken(
    tokenHash: string,
    type: VerificationType,
    tx?: TX,
  ) {
    return (
      (await this.conn(tx).query.verifications.findFirst({
        where: and(
          eq(verifications.token, tokenHash),
          eq(verifications.type, type),
        ),
      })) ?? null
    );
  }

  static async deleteVerificationById(id: string, tx?: TX) {
    await this.conn(tx).delete(verifications).where(eq(verifications.id, id));
  }

  static async deleteVerificationsByIdentifier(
    identifier: string,
    type: VerificationType,
    tx?: TX,
  ) {
    await this.conn(tx)
      .delete(verifications)
      .where(
        and(
          eq(verifications.identifier, identifier),
          eq(verifications.type, type),
        ),
      );
  }
}
