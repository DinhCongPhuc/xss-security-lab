export const loopbacks = ["127.0.0.1", "::1"] as const;
export const localHostnames = ["localhost", "127.0.0.1", "[::1]"];
export const webPort = 5173;
export function localAuthorities(port: number) {
  return localHostnames.map((host) => host + ":" + port);
}
export function readPort(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  const port = Number(value);
  if (
    !/^\d+$/.test(value) ||
    !Number.isInteger(port) ||
    port < 1024 ||
    port > 65535
  ) {
    throw new Error("Expected a TCP port between 1024 and 65535");
  }
  return port;
}
