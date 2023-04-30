import { Context } from "hono";

export function generateRandomID(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function generateUniqueIdWithPrefix(): string {
  return "0x" + crypto.randomUUID().replace(/-/g, "");
}

export function generateEmailVerificationCode(): string {
  return `${Math.floor(Math.random() * 900000) + 100000}` as string;
}

export function generateUniqueIdWithAuthC1App(c: Context): string {
  // return "0x" + crypto.randomUUID().replace(/-/g, "");
  const refreshToken = c.env.AuthC1App.newUniqueId();
  return refreshToken.toString();
}
