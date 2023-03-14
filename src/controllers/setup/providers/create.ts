import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";
import {
  createApplicationError,
  handleError,
} from "../../../utils/error-responses";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";

export const schema = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
  })
);

type ApplicationRequest = z.infer<typeof schema>;

const providerController = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: ApplicationRequest = await c.req.valid("json");

    const data = await Promise.all(
      body.map((item) =>
        db.insert({
          tableName: "providers",
          data: item,
        })
      )
    );
    const response: SuccessResponse = {
      message: "Providers added successfully",
      data,
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);
    return handleError(createApplicationError, c, err);
  }
};

export default providerController;
