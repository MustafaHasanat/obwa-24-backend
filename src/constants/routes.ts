// Allowed origins list
export const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3003",
  "capacitor://localhost",
  "https://localhost",
  "https://obwa-24-backend.vercel.app",
];

export function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
