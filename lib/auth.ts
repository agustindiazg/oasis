export const isClerkAuthConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const appSecret = process.env.OASIS_APP_SECRET;
