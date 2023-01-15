export interface ITokens {
    id: number;
    created_at: Date;
    user_id: string;
    application_id: string;
    session_id: number;
    id_token: string;
    access_token: string;
    refresh_token: string;
    access_token_expiration: Date;
    refresh_token_expiration: Date;
}