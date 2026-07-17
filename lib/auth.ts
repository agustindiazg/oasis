import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/lib/db";
import {
  account,
  accountRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "@/lib/db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const isGoogleAuthConfigured = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  appName: "Oasis",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: { user, session, account, verification, userRelations, sessionRelations, accountRelations },
  }),
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
    },
  },
  socialProviders: isGoogleAuthConfigured ? {
    google: {
      clientId: googleClientId!,
      clientSecret: googleClientSecret!,
      prompt: "select_account",
    },
  } : {},
});
