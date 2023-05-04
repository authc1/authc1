import { Context } from "hono";
import { z } from "zod";

import { AuthResponse, UserClient, UserData } from "../../do/AuthC1User";

import {
  emailInUse,
  handleError,
  invalidPassword,
} from "../../utils/error-responses";
import { hash } from "../../utils/hash";
import { ApplicationRequest } from "../applications/create";

async function verifyPassword(
  password: string,
  hashPassword: string
): Promise<boolean> {
  console.log(password, hash);
  const isValid = await hash().check(password, hashPassword);
  console.log(isValid);
  return isValid;
}

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  password: z.string(),
});

export const validatePassword = (
  password: string,
  passwordRegex: string
): boolean => {
  const re = new RegExp(passwordRegex);
  return re.test(password);
};

export async function emailRegistrationController(c: Context) {
  const { email, password, name } = await c.req.json();

  console.log("emailRegistrationController", name, email, password);
  const applicationInfo: ApplicationRequest = c.get("applicationInfo");
  const applicationId = applicationInfo.id as string;
  console.log("applicationId", applicationId);
  const key = `${applicationId}:email:${email}`;
  const userObjId = c.env.AuthC1User.idFromName(key);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);

  const user = await userClient.getUser();
  console.log("user", user);

  if (user?.id) {
    return handleError(emailInUse, c);
  }

  const { password_regex: passwordRegex } = applicationInfo.providerSettings;

  const isValidPassword = validatePassword(password, passwordRegex);

  if (passwordRegex && !isValidPassword) {
    return handleError(invalidPassword, c);
  }
  const hashPassword = await hash().make(password);

  const userData: UserData = {
    id: userObjId.toString(),
    applicationId,
    name,
    email,
    password: hashPassword,
    provider: "email",
    emailVerified: false,
  };

  console.log("userData", userData);
  const promises = await Promise.all([
    userClient.createUser(userData, applicationInfo),
    c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "Registered",
      userId: userData?.id,
      applicationId,
      name: applicationInfo.name,
      email,
      created_at: new Date(),
    }),
  ]);

  const [authDetails] = promises;
  const { accessToken, refreshToken } = authDetails as AuthResponse;

  return c.json({
    access_token: accessToken,
    email,
    refresh_token: refreshToken,
    expires_in: applicationInfo.settings.expires_in,
    expires_at:
      Math.floor(Date.now() / 1000) + applicationInfo.settings.expires_in,
    local_id: userData.id,
    name: userData?.name,
  });
}
