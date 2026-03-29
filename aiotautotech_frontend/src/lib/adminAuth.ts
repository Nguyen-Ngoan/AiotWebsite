/**
 * Quyền admin dựa trên Basic Auth (cùng cơ chế với middleware).
 * - Mặc định: trùng BASIC_AUTH_USER / BASIC_AUTH_PASS → user đăng nhập site là admin.
 * - Tùy chọn: ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASS để chỉ định tài khoản admin.
 */
export function isAdminFromBasicAuth(authHeader: string | null): boolean {
  const defaultUser = process.env.BASIC_AUTH_USER || 'test';
  const defaultPass = process.env.BASIC_AUTH_PASS || '1234';
  const adminUser = process.env.ADMIN_BASIC_AUTH_USER || defaultUser;
  const adminPass = process.env.ADMIN_BASIC_AUTH_PASS || defaultPass;

  if (!authHeader?.startsWith('Basic ')) {
    return false;
  }
  try {
    const decoded = atob(authHeader.slice(6));
    const colon = decoded.indexOf(':');
    const user = colon >= 0 ? decoded.slice(0, colon) : decoded;
    const pass = colon >= 0 ? decoded.slice(colon + 1) : '';
    return user === adminUser && pass === adminPass;
  } catch {
    return false;
  }
}
