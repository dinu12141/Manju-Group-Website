const REQUIRED_VARS: Array<[keyof typeof ENV, string]> = [
  ["cookieSecret", "JWT_SECRET"],
  ["databaseUrl", "DATABASE_URL"],
];

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "",
};

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter(([key]) => !ENV[key]);
  if (missing.length > 0) {
    const names = missing.map(([, envVar]) => envVar).join(", ");
    throw new Error(
      `[startup] Missing required environment variable(s): ${names}. ` +
        `Copy .env.example to .env and fill in all required values.`,
    );
  }
}
