import { Handler } from "hono";
import { z, ZodType } from "zod";
import { handleError, invalidInputError } from "./error-responses";

export const zValidtor = <T extends ZodType>(
  schema: T
): Handler<z.infer<T>> => {
  return async (c: any, next) => {
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) {
      return handleError(invalidInputError, c, parsed.error);
    }
    c.req.valid(parsed.data);
    await next();
  };
};
