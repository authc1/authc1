import { Context } from "hono";
import { D1QB } from "workers-qb";
import { userSchema, UserSchema } from "../controllers/accounts/me";
import { ITokens } from "../models/tokens";
import { IUsers } from "../models/users";
import { ErrorResponse, handleError, userNotFound } from "./error-responses";

export const getUserByEmail = async (
  c: Context,
  email: string,
  applicationId: string,
  columns: string[]
): Promise<IUsers | null> => {
  try {
    const columnsString = columns.join(", ");
    const { results } = await c.env.AUTHC1.prepare(
      `SELECT ${columnsString} FROM users WHERE email = ? AND application_id = ?`
    )
      .bind(email, applicationId)
      .all();
    if (results?.length) {
      const [result] = results;
      return result;
    }

    return null;
  } catch (err: any) {
    throw err;
  }
};

export const getUserByEmailWithProviderId = async (
  c: Context,
  email: string,
  applicationId: string,
  providerId: number,
  select: string[]
): Promise<UserSchema | null> => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const userData = await db.fetchOne({
      tableName: "users",
      fields: select,
      where: {
        conditions:
          "users.email = ?1 AND users.provider_id = ?2 AND application_id = ?3",
        params: [email, providerId, applicationId],
      },
    });

    if (!userData?.results) {
      return null;
    }

    const data: UserSchema = userSchema.parse(userData.results);

    return data;
  } catch (err: any) {
    throw err;
  }
};

export const getUserById = async (
  c: Context,
  id: string,
  applicationId: string,
  select: string[]
): Promise<UserSchema | Response> => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const userData = await db.fetchOne({
      tableName: "users",
      fields: select,
      where: {
        conditions: "users.id = ?1 AND application_id = ?2",
        params: [id, applicationId],
      },
    });

    if (!userData?.results) {
      return handleError(userNotFound, c);
    }

    const data: UserSchema = userSchema.parse(userData.results);

    return data;
  } catch (err: any) {
    throw err;
  }
};

export async function getTokenByUserIdAndAccessToken(
  c: Context,
  user_id: string,
  access_token: string,
  columns: string[]
): Promise<ITokens | null> {
  try {
    const columnsString = columns.join(", ");
    const { results } = await c.env.AUTHC1.prepare(
      `SELECT ${columnsString} FROM tokens WHERE user_id = ? AND access_token = ?`
    )
      .bind(user_id, access_token)
      .all();
    if (results?.length) {
      const [result] = results;
      return result;
    }
    return null;
  } catch (err) {
    throw err;
  }
}

export const getUserBySessionId = async (
  c: Context,
  sessionId: string,
  columns: string[]
): Promise<IUsers | null> => {
  try {
    const columnsString = columns.join(", ");
    const { results } = await c.env.AUTHC1.prepare(
      `SELECT ${columnsString} FROM users
            INNER JOIN tokens ON tokens.user_id = users.id
            WHERE tokens.session_id = ?`
    )
      .bind(sessionId)
      .all();
    if (results?.length) {
      const [result] = results;
      return result;
    }

    return null;
  } catch (err: any) {
    throw err;
  }
};

export const updateUser = async (
  c: Context,
  userId: string,
  updates: object
): Promise<void> => {
  try {
    const setString = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    await c.env.AUTHC1.prepare(`UPDATE users SET ${setString} WHERE id = ?`)
      .bind(...values, userId)
      .run();
  } catch (err) {
    throw err;
  }
};

export const getUserByIdAndProviderUserId = async (
  c: Context,
  email: string,
  providerUserId: string,
  applicationId: string,
  select: string[]
): Promise<UserSchema | null> => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const userData = await db.fetchOne({
      tableName: "users",
      fields: select,
      where: {
        conditions:
          "users.email = ?1 AND users.provider_user_id = ?2 AND application_id = ?3",
        params: [email, providerUserId, applicationId],
      },
    });

    if (!userData?.results) {
      return null;
    }

    const data: UserSchema = userSchema.parse(userData.results);

    return data;
  } catch (err: any) {
    throw err;
  }
};
