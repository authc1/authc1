import { Context } from "hono";
import { z } from "zod";
import { D1QB } from "workers-qb";
import {
  getApplicationProviderSettings,
  getApplicationSettings,
} from "../../utils/application";
import {
  applicationNotFound,
  emailInUse,
  handleError,
  invalidPassword,
  registrationError,
} from "../../utils/error-responses";
import { ApplicationNotFoundError } from "../../utils/errors";
import { createHash } from "../../utils/hash";
import { createSession } from "../../utils/session";
import { generateUniqueIdWithPrefix } from "../../utils/string";
import { createAndSaveTokens } from "../../utils/token";
import { getUserByEmailWithProviderId } from "../../utils/user";
import { ApplicationSchema } from "../applications/getById";

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  password: z.string(),
});

export type EmailRequest = z.infer<typeof registerSchema>;

export const validatePassword = (
  password: string,
  passwordRegex: string
): boolean => {
  const re = new RegExp(passwordRegex);
  return re.test(password);
};

export const saveUser = async (
  c: Context,
  name: string,
  email: string,
  password: string,
  providerId: number,
  applicationId: string,
  emailVerified: number
): Promise<string> => {
  try {
    const id = generateUniqueIdWithPrefix();
    const db = new D1QB(c.env.AUTHC1);
    await db.insert({
      tableName: "users",
      data: {
        id,
        name,
        email,
        password,
        provider_id: providerId,
        application_id: applicationId,
        email_verified: emailVerified as number,
      },
    });
    return id;
  } catch (err: any) {
    throw err;
  }
};

const emailRegistrationController = async (c: Context) => {
  const body: EmailRequest = c.req.valid("json");
  const { email, password, name } = body;
  try {
    const applicationId = c.get("applicationId") as string;
    const applicationName = c.get("applicationName") as string;
    const user = await getUserByEmailWithProviderId(
      c,
      email as string,
      applicationId,
      1,
      ["id"]
    );
    if (user) {
      return handleError(emailInUse, c);
    }
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;

    const {
      expires_in: expiresIn,
      secret,
      algorithm,
    } = applicationInfo?.settings;

    const { password_regex: passwordRegex } =
      await getApplicationProviderSettings(c, applicationId);
    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const { salt, hash } = await createHash(password);
    const id = await saveUser(
      c,
      name as string,
      email,
      hash,
      1,
      applicationId,
      0
    );
    await c.env.AUTHC1_USER_DETAILS.put(id, salt);
    const sessionId = await createSession(c, applicationId, id);

    const { accessToken, refreshToken } = await createAndSaveTokens(c, {
      id,
      expiresIn: expiresIn as number,
      sessionId,
      applicationName,
      email,
      emailVerified: false,
      applicationId,
      secret: secret as string,
      algorithm: algorithm as string,
    });

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "Registered",
      id,
      applicationId,
      created_at: Date.now(),
    });

    return c.json({
      email,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      local_id: id,
      name,
    });
  } catch (err: any) {
    console.log(err);
    if (err?.cause?.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return handleError(emailInUse, c, err);
    }
    if (err instanceof ApplicationNotFoundError) {
      // handle application not found error
      return handleError(applicationNotFound, c, err);
    }
    return handleError(registrationError, c, err);
  }
};

export default emailRegistrationController;
