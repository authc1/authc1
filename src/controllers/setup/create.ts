import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";
import { getApplicationProviderSettings } from "../../utils/application";
import {
  createApplicationError,
  handleError,
  invalidPassword,
} from "../../utils/error-responses";
import { createHash } from "../../utils/hash";
import { storeProviderSettings } from "../../utils/kv";
import { createSession } from "../../utils/session";
import {
  generateRandomID,
  generateUniqueIdWithPrefix,
} from "../../utils/string";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { createAndSaveTokens } from "../../utils/token";
import { saveUser, validatePassword } from "../register/email";

export const schema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  settings: z
    .object({
      expires_in: z.number().default(86400),
      secret: z.string().default(() => generateRandomID() + generateRandomID()),
      algorithm: z.string().default("HS256"),
      redirect_uri: z.string().optional(),
      two_factor_authentication: z.coerce.string().optional(),
      allow_multiple_accounts: z.coerce.boolean().optional(),
      session_expiration_time: z.number().default(3600),
      account_deletion_enabled: z.coerce.string().optional(),
      failed_login_attempts: z.number().optional(),
    })
    .default({}),
});

type ApplicationRequest = z.infer<typeof schema>;

const setupApplicationController = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: ApplicationRequest = await c.req.valid("json");
    const { name, email, password, settings } = body;
    const id = generateUniqueIdWithPrefix();
    const applicationData = {
      id,
      name,
    };
    const settingsData = {
      application_id: id,
      ...settings,
    };

    await Promise.all([
      db.insert({
        tableName: "applications",
        data: applicationData,
      }),
      db.insert({
        tableName: "application_settings",
        data: settingsData,
      }),
      storeProviderSettings(c, id),
    ]);

    const { password_regex: passwordRegex } =
      await getApplicationProviderSettings(c, id);
    console.log("passwordRegex", passwordRegex);
    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const { salt, hash } = await createHash(password);
    console.log("salt, hash", salt, hash);
    const userId = await saveUser(c, name as string, email, hash, 1, id, 1);
    const sessionId = await createSession(c, id, userId);

    console.log("sessionId", sessionId);

    await Promise.all([
      await c.env.AUTHC1_USER_DETAILS.put(userId, salt),
      db.update({
        tableName: "applications",
        data: { user_id: userId },
        where: { conditions: "id = ?1", params: [id] },
      }),
    ]);

    const response: SuccessResponse = {
      message: "Application Setup successfully",
      data: {
        id,
        name,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);
    return handleError(createApplicationError, c, err);
  }
};

export default setupApplicationController;
