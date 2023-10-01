import { z } from "zod";
import { Context } from "hono";
import { handleError, updateUserError } from "../../../utils/error-responses";
import { UserClient } from "../../../do/AuthC1User";
import { ApplicationRequest } from "../../applications/create";
import { generateSessionResponse } from "../../../utils/token";

export const updateUserSchema = z.object({
  name: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  claims: z.record(z.any()).nullish(),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

const updateUserController = async (c: Context) => {
  const data: UpdateUserData = await c.req.valid("json");
  const user = c.get("user");
  const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
  const { session_id: sessionId } = user;

  const userObjId = c.env.AuthC1User.idFromString(user.user_id);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);
  try {
    const updatedData = await userClient.updateUser(
      applicationInfo,
      sessionId,
      data
    );

    if (updatedData && "error" in updatedData) {
      return handleError(updatedData, c);
    }

    const response = generateSessionResponse({
      accessToken: updatedData.accessToken,
      refreshToken: updatedData.refreshToken as string,
      expiresIn: applicationInfo?.settings?.expires_in,
      sessionId,
      userId: updatedData?.user?.id as string,
      provider: updatedData?.user?.provider as string,
      emailVerified: updatedData?.user?.emailVerified as boolean,
      phoneVerified: updatedData?.user?.phoneVerified as boolean,
      email: updatedData?.user?.email as string,
      phone: updatedData?.user?.phone as string,
      name: updatedData?.user?.name as string,
      avatarUrl: updatedData?.user?.avatarUrl as string,
      claims: updatedData?.user?.claims,
      segments: updatedData?.user?.segments,
    });

    return c.json(response);
  } catch (err) {
    return handleError(updateUserError, c, err);
  }
};

export default updateUserController;
