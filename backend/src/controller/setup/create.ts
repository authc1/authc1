import { Context } from "hono";
import { boolean, z } from "zod";
import { ApplicationClient } from "../../do/AuthC1App";
import { AccessedApp, UserClient, UserData } from "../../do/AuthC1User";
import { hash } from "../../utils/hash";
import { defaultSettings, storeProviderSettings } from "../../utils/kv";
import {
  generateRandomID,
  generateUniqueIdWithAuthC1App,
  generateUniqueIdWithPrefix,
} from "../../utils/string";

export const schema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  settings: z
    .object({
      expires_in: z.number().default(86400),
      secret: z.string().default(() => generateRandomID() + generateRandomID()),
      algorithm: z.string().default("HS256"),
      is_dev_mode: z.boolean().default(true),
      dev_mode_code: z.string().default("333333"),
      redirect_uri: z.array(z.string().url()).optional(),
      two_factor_authentication: z.boolean().default(false),
      allow_multiple_accounts: z.boolean().default(false),
      session_expiration_time: z.number().default(3600),
      account_deletion_enabled: z.boolean().default(false),
      failed_login_attempts: z.number().default(5),
      allow_registration: z.boolean().optional(),
    })
    .default({}),
});

type ApplicationRequest = z.infer<typeof schema>;

export const setupApplicationController = async (c: Context) => {
  const body: ApplicationRequest = await c.req.valid("json");
  const { name, email, password, settings } = body;

  const applicationId = generateUniqueIdWithAuthC1App(c);
  const key = `${applicationId}:email:${email}`;
  const userObjId = c.env.AuthC1User.idFromName(key);
  const userId = userObjId.toString();

  const id = c.env.AuthC1App.idFromString(applicationId);
  const applicationObj = c.env.AuthC1App.get(id);
  const applicationClient = new ApplicationClient(applicationObj);

  const hashPassword = await hash().make(password);

  const userData: UserData = {
    id: userId,
    applicationId,
    name,
    email,
    password: hashPassword,
    provider: "email",
    emailVerified: false,
  };

  const appData = await applicationClient.create(
    {
      id: applicationId,
      name,
      settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      providerSettings: {
        ...defaultSettings,
        email_verification_enabled: true,
      },
    },
    {
      id: userId,
      name,
      email,
      invited: false,
    }
  );

  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);
  await userClient.createUser(userData, appData);
  await userClient.setAccess(
    {
      id: applicationId,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      accessType: "owner",
    } as AccessedApp,
    appData
  );

  return c.json({
    applicationId,
    userId: userData?.id,
  });
};
