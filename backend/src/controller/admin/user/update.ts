import { z } from "zod";
import { Context } from "hono";
import { handleError, updateUserError } from "../../../utils/error-responses";
import { UserClient } from "../../../do/AuthC1User";

export const updateUserByAdminSchema = z.object({
  name: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  claims: z.record(z.any()).nullish(),
  segments: z.record(z.any()).nullish(),
});

type UpdateUserData = z.infer<typeof updateUserByAdminSchema>;

const updateUserByAdminController = async (c: Context) => {
  const data: UpdateUserData = await c.req.valid("json");
  console.log(
    "updateUserByAdminController data---------------------------------",
    data
  );
  const userId = c.req.param("userId") as string;
  const userObjId = c.env.AuthC1User.idFromString(userId);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);
  try {
    const updatedData = await userClient.updateUserByAdmin(data);

    if (updatedData && "error" in updatedData) {
      return handleError(updatedData, c);
    }

    return c.json(updatedData);
  } catch (err) {
    return handleError(updateUserError, c, err);
  }
};

export default updateUserByAdminController;
