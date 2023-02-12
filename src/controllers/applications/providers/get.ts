import { Context } from "hono";
import { z } from "zod";
import { JwtPayloadToUser } from "../../../models/tokens";

import {
  applicationNotFoundError,
  getApplicationError,
  handleError,
} from "../../../utils/error-responses";
import { hasRowAccess } from "../../../utils/hasRowAccess";
import { getProviderDefaultSettings } from "../../../utils/kv";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";

export const schema = z.object({
  select: z.string().trim().optional().default("*"),
});

interface Data {
  [key: string]: any;
}

const getApplicationProvidersController = async (c: Context) => {
  try {
    const fields = c.req.query("select");
    const user: JwtPayloadToUser = c.get("user");
    const applicationId = c.req.param("id");
    console.log("fields", fields);
    const hasAccess = await hasRowAccess(
      c,
      "applications",
      "id = ?1 AND user_id = ?2",
      [applicationId, user?.id]
    );
    if (!hasAccess) {
      return handleError(applicationNotFoundError, c);
    }

    const data = await getProviderDefaultSettings(c, applicationId);

    const response: SuccessResponse = {
      message: "Applications fetched successfully",
      data,
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getApplicationError, c, err);
  }
};

export default getApplicationProvidersController;

//eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2F1dGhjMS5jb20vMHhlMzFiOGMzOWFlYjA4Y2Y0OWU5NzgzNmYxN2ZhMmU2NzNiZmIyNGQ5IiwiYXVkIjoiQXV0aGMxIiwiYXV0aF90aW1lIjoxNjc1MzYyNTA4LjU5MiwidXNlcl9pZCI6IjB4NWE2OTJmZmRjOGU3NGExNTljOTFhMmI1NTRlMDYwZDUiLCJleHAiOjE2NzU0NDg5MDgsImlhdCI6MTY3NTM2MjUwOCwiZW1haWwiOiJzdWJoZW5kdWt1bmR1MTRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOjAsInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9.mygBKhQfDJQal6VCXol9qqE6toXXVPSXxqMkXEJGlg0