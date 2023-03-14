import { Context } from "hono";
import { D1QB } from "workers-qb";
import { JoinTypes } from "workers-qb/dist/types/enums";
import { z } from "zod";
import { JwtPayloadToUser } from "../../models/tokens";

import {
  applicationNotFoundError,
  getApplicationError,
  handleError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";

export const schema = z.object({
  select: z.string().trim().optional().default("*"),
});

const listApplicationController = async (c: Context) => {
  try {
    const fields = c.req.query("select");
    const user: JwtPayloadToUser = c.get("user");
    const db = new D1QB(c.env.AUTHC1);
    console.log("fields", fields);
    const application = await db.fetchAll({
      tableName: "applications",
      fields: fields || "applications.*",
      where: {
        conditions: "applications.user_id = ?1",
        params: [user.id],
      },
    });

    if (!application?.results) {
      return handleError(applicationNotFoundError, c);
    }

    const response: SuccessResponse = {
      message: "Applications fetched successfully",
      data: application?.results,
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getApplicationError, c, err);
  }
};

export default listApplicationController;
