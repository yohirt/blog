const base = import.meta.env.BASE_URL || "/";

export function withBase(path) {
  if (!path || typeof path !== "string") return path;
  if (/^(https?:|mailto:|tel:|#|javascript:)/.test(path)) return path;
  if (base === "/") return path;
  if (!path.startsWith("/")) return path;

  return `${base.replace(/\/$/, "")}${path}`;
}
