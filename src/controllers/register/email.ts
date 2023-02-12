import { Context, Validator } from "hono";
import {
  getApplicationProviderSettings,
  getApplicationSettings,
} from "../../utils/application";
import {
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
import { getUserByEmail } from "../../utils/user";

type EmailRequest = {
  name: string;
  email: string;
  password: string;
};

export function validator(v: Validator) {
  return {
    name: v.json("name").isOptional(),
    email: v.json("email").isRequired(),
    password: v.json("password").isRequired(),
  };
}

export const validatePassword = (
  password: string,
  passwordRegex: string
): boolean => {
  const re = new RegExp(passwordRegex);
  return re.test(password);
};

const saveUser = async (
  c: Context,
  name: string,
  email: string,
  password: string,
  providerId: number,
  applicationId: string
): Promise<string> => {
  try {
    const id = generateUniqueIdWithPrefix();
    await c.env.AUTHC1.prepare(
      `INSERT INTO users (id, name, email, password, provider_id, application_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`
    )
      .bind(id, name, email, password, providerId, applicationId)
      .run();
    return id;
  } catch (err: any) {
    throw err;
  }
};

const emailRegistrationController = async (c: Context) => {
  const body = await c.req.json<EmailRequest>();
  const { email, password, name } = body;
  try {
    const applicationId = c.get("applicationId") as string;
    const applicationName = c.get("applicationName") as string;
    const user = await getUserByEmail(c, email, applicationId, ["id"]);
    if (user) {
      return handleError(emailInUse, c);
    }

    const {
      expires_in: expiresIn,
      secret,
      algorithm,
    } = await getApplicationSettings(c, applicationId, [
      "expires_in",
      "secret",
      "algorithm",
    ]);
    const { password_regex: passwordRegex } =
      await getApplicationProviderSettings(c, applicationId);
    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const { salt, hash } = await createHash(password);
    const id = await saveUser(c, name, email, hash, 1, applicationId);
    await c.env.AUTHC1_USER_DETAILS.put(id, salt);
    const sessionId = await createSession(c, applicationId, id);

    const { accessToken, refreshToken } = await createAndSaveTokens(c, {
      id,
      expiresIn,
      sessionId,
      applicationName,
      email,
      emailVerified: false,
      applicationId,
      secret,
      algorithm,
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
    }
    return handleError(registrationError, c, err);
  }
};

export default emailRegistrationController;
