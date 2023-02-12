export interface ITokens {
  id: number;
  created_at: Date;
  user_id: string;
  application_id: string;
  session_id: number;
  access_token: string;
  refresh_token: string;
  access_token_expiration: Date;
  refresh_token_expiration: Date;
}

export interface JwtPayloadToUser {
  iss: string;
  aud: string | undefined;
  auth_time: number;
  id: string;
  exp: number;
  iat: number;
  email: string;
  sign_in_provider: string;
}
