import { ErrorResponse, UpdateUserResponse, UserUpdateRequest } from "../types";
import { patch } from "../utils/http";

export class UserClient {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  public async updateUser(
    userId: string,
    request: UserUpdateRequest
  ): Promise<UpdateUserResponse | ErrorResponse> {
    const url = `${this.endpoint}/admin/users/${userId}`;
    try {
      const response = await patch<UpdateUserResponse>(
        url,
        this.apiKey,
        request
      );
      return response;
    } catch (error: any) {
      console.log(error);
      const errorResponse: ErrorResponse = {
        error: {
          code: "UPDATE_USER_ERROR",
          message: "An error occurred while updating the user information.",
        },
        status: 500,
      };
      return errorResponse;
    }
  }
}
