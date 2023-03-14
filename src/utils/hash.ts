type HashObject = { salt: string; hash: string };

export async function createHash(password: string): Promise<HashObject> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const passwordWithSalt = new TextEncoder().encode(password + salt);

  const digest = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    passwordWithSalt
  );

  const hexString = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  console.log(salt.toString(), hexString);
  return { salt: salt.toString(), hash: hexString };
}

export async function checkHash(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const passwordWithSalt = new TextEncoder().encode(password + salt);

  const digest = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    passwordWithSalt
  );

  const hexString = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexString === hash;
}
