export interface IUsers {
    id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    nickname: string;
    avatar_url: string;
    email: string;
    phone: string;
    password: string;
    provider_id: number;
    application_id: string;
    last_login: Date;
    status: string;
    confirmed_at: Date;
    invited_at: Date;
    email_verified: boolean;
    phone_number_verified: boolean;
    exists: boolean;
}