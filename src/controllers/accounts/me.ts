import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";
import { JwtPayloadToUser } from "../../models/tokens";

import {
  userNotFound,
  getUserError,
  handleError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";

export const schema = z.object({
  select: z.string().trim().optional().default("*"),
});

interface Data {
  [key: string]: any;
}

export const userSchema = z.object({
  id: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  name: z.string().optional(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  provider_id: z.number().optional(),
  application_id: z.string().optional(),
  last_login: z.date().optional(),
  status: z.string().optional(),
  confirmed_at: z.date().optional(),
  invited_at: z.date().optional(),
  email_verified: z.coerce.boolean().optional(),
  phone_number_verified: z.coerce.boolean().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;

const getUserByIdController = async (c: Context) => {
  try {
    const user: JwtPayloadToUser = c.get("user");
    const fields: any = c.req.query("select");
    const db = new D1QB(c.env.AUTHC1);

    const userData = await db.fetchOne({
      tableName: "users",
      fields,
      where: {
        conditions: "users.id = ?1",
        params: [user.id],
      },
    });

    if (!userData?.results) {
      return handleError(userNotFound, c);
    }

    const data: UserSchema = userSchema.parse(userData.results);

    const response: SuccessResponse = {
      message: "User fetched successfully",
      data,
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getUserError, c, err);
  }
};

export default getUserByIdController;
