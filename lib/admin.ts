export function isAdminToken(token: string): boolean {
  const adminToken = process.env.ADMIN_BYPASS_TOKEN;
  if (!adminToken) return false;
  return token === adminToken;
}
