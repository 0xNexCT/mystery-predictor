import { cookies } from "next/headers";

export const UUID_COOKIE = "mp_uuid";
export const USERNAME_COOKIE = "mp_username";

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,15}$/;

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

export function isValidUsername(value: unknown): value is string {
  return typeof value === "string" && USERNAME_REGEX.test(value);
}

export function getUuid(): string | null {
  const value = cookies().get(UUID_COOKIE)?.value ?? null;
  if (value && isValidUuid(value)) return value;
  return null;
}

export function getUser(): { uuid: string; username: string } | null {
  const uuid = getUuid();
  if (!uuid) return null;
  const username = cookies().get(USERNAME_COOKIE)?.value ?? null;
  if (!username) return null;
  return { uuid, username };
}

export function getUuidFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${UUID_COOKIE}=`));
  if (!match) return null;
  const value = match.slice(`${UUID_COOKIE}=`.length);
  return isValidUuid(value) ? value : null;
}
