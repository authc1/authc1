import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  createApiKeyError,
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { z } from "zod";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";
import { generateUniqueIdWithPrefix } from "../../../utils/string";

export const ApiKeySchema = z.object({
  description: z.string().optional(),
  resources: z
    .array(
      z.object({
        resource: z.string(),
        accessLevel: z.enum(["read", "write", "none"]),
      })
    )
    .optional(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

export const createApiKeyController = async (c: Context) => {
  const body = (await c.req.valid("json")) as Partial<ApiKey>;
  const user = c.get("user");
  const applicationId = c.req.param("id");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);

  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1App.idFromString(applicationId);
  const obj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(obj);

  try {
    const apikeyId = generateUniqueIdWithPrefix();
    const data = { ...body, id: apikeyId };
    await appClient.addApiKey(data);
    const response: SuccessResponse = {
      message: "API key endpoint created successfully",
      data: {
        id: apikeyId,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    console.log(err);
    return handleError(createApiKeyError, c, err);
  }
};
