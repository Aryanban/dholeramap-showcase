import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const oidcConfig = {
    issuer: 'https://dholeramap.com',
    authorization_endpoint: 'https://clerk.dholeramap.com/oauth/authorize',
    token_endpoint: 'https://clerk.dholeramap.com/oauth/token',
    revocation_endpoint: 'https://clerk.dholeramap.com/oauth/token/revoke',
    introspection_endpoint: 'https://clerk.dholeramap.com/oauth/token_info',
    userinfo_endpoint: 'https://clerk.dholeramap.com/oauth/userinfo',
    device_authorization_endpoint: 'https://clerk.dholeramap.com/oauth/device_authorization',
    jwks_uri: 'https://clerk.dholeramap.com/.well-known/jwks.json',
    scopes_supported: [
      'openid',
      'profile',
      'email',
      'public_metadata',
      'private_metadata',
      'offline_access',
    ],
    response_types_supported: ['code'],
    response_modes_supported: ['query', 'form_post'],
    grant_types_supported: [
      'authorization_code',
      'refresh_token',
      'urn:ietf:params:oauth:grant-type:device_code',
    ],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_methods_supported: [
      'client_secret_basic',
      'client_secret_post',
      'none',
    ],
    claims_supported: [
      'aud',
      'email',
      'email_verified',
      'exp',
      'family_name',
      'given_name',
      'iat',
      'iss',
      'name',
      'picture',
      'preferred_username',
      'sub',
    ],
    code_challenge_methods_supported: ['S256'],
    agent_auth: {
      skill: 'https://dholeramap.com/auth.md',
      register_uri: 'https://dholeramap.com/sign-up',
      claim_uri: 'https://dholeramap.com/sign-up',
      identity_types_supported: ['anonymous', 'identity_assertion'],
      credential_types_supported: ['bearer_token'],
      anonymous: {
        credential_types_supported: ['bearer_token'],
        claim_uri: 'https://dholeramap.com/sign-up',
      },
      identity_assertion: {
        assertion_types_supported: [
          'urn:ietf:params:oauth:token-type:id-jag',
          'verified_email',
        ],
        credential_types_supported: ['bearer_token'],
        claim_uri: 'https://dholeramap.com/sign-up',
      },
      verified_email: {
        credential_types_supported: ['bearer_token'],
        claim_uri: 'https://dholeramap.com/sign-up',
      },
    },
  };

  return NextResponse.json(oidcConfig, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
