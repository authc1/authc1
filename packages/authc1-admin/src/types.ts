export interface UserUpdateRequest {
  name?: string;
  nickname?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  claims?: Record<string, any> | null;
  segments?: Record<string, any> | null;
}

export interface UserData {
  id: string;
  applicationId: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  provider: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatarUrl?: string;
  providerUserId?: string;
  emailVerifyCode?: string;
  phoneVerifyCode?: string;
  expirationTimestamp?: number;
  created_at?: string;
  updated_at?: string;
  claims?: Record<string, any> | null;
  segments?: Record<string, any> | null;
}


export interface UpdateUserResponse {
  data: Partial<UserData>;
  status: number;
  statusText: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
  status: number;
}