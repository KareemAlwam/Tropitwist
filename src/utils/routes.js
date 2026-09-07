export function route(path = '/') {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalizedPath}`;
}

export function currentRoute(pathname) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const appPath = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return appPath.replace(/\/+$/, '') || '/';
}
