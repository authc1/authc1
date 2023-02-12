import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

export interface SuccessResponse {
  message: string;
  data: any;
}

export function handleSuccess(
  c: Context,
  response: SuccessResponse,
  status: StatusCode = 200
) {
  return c.json(response, status);
}
