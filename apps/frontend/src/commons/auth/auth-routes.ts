const PUBLIC_PATHS = new Set(['/login', '/register']);

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export function isProtectedPath(pathname: string): boolean {
  return !isPublicPath(pathname);
}
