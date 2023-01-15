export function generateUniqueId(): string {
    return "0x" + crypto.randomUUID().replace(/-/g, "");
}

export function generateEmailVerificationCode(): string {
    return `${Math.floor(Math.random() * 900000) + 100000}` as string;
}
