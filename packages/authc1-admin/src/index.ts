import { ErrorResponse, UpdateUserResponse, UserUpdateRequest } from "./types";
export * from "./types";
import { UserClient } from "./auth/user";

export interface Authc1AdminClientOptions {
  baseUrl?: string;
  apiKey: string;
}

export class Authc1AdminClient {
  private readonly endpoint: string;
  private readonly options: Authc1AdminClientOptions;
  private readonly userClient: UserClient;

  constructor(appId: string, options: Authc1AdminClientOptions) {
    const apiBaseUrl = options?.baseUrl ?? "https://api.authc1.com/v1";
    const endpoint = `${apiBaseUrl}/${appId}`;
    this.endpoint = endpoint;
    this.options = options;
    this.userClient = new UserClient(options.apiKey, endpoint);
  }

  public get appUrl(): string {
    return this.endpoint;
  }

  public async updateUser(
    userId: string,
    data: UserUpdateRequest
  ): Promise<UpdateUserResponse | ErrorResponse> {
    return this.userClient.updateUser(userId, data);
  }
}
