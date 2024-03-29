import { Context } from "hono";
import { UserClient } from "../../do/AuthC1User";

import {
  getUserError,
  handleError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { ApplicationRequest } from "../applications/create";

const getUserByIdController = async (c: Context) => {
  try {
    const user = c.get("user");
    const userObjId = c.env.AuthC1User.idFromString(user.user_id);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const data = await userClient.getUser();

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
