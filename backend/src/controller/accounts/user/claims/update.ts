import { z } from "zod";
import { Context } from "hono";

import { handleSuccess, SuccessResponse } from "../../../../utils/success-responses";
import { handleError, updateUserError } from "../../../../utils/error-responses";

export const updateUserSchema = z.object({
  name: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

export const updateUserClaimsController = async (c: Context) => {
  try {
    const user = c.get("user");
    const data: UpdateUserData = await c.req.valid("json");

    const response: SuccessResponse = {
      message: "User updated successfully",
      data: user,
    };

    return handleSuccess(c, response);
  } catch (err) {
    return handleError(updateUserError, c, err);
  }
};
