import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

const authBaseURL = process.env.BETTER_AUTH_URL;

if (!authBaseURL) {
  throw new Error("BETTER_AUTH_URL is not configured");
}

const jwksURL = new URL("/api/auth/jwks", authBaseURL);

const JWKS = createRemoteJWKSet(jwksURL);

export async function verifyJWT(token: string) {
  const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
    issuer: authBaseURL,
    audience: authBaseURL,
    algorithms: ["EdDSA"],
  });

  return {
    payload,
    protectedHeader,
  };
}
