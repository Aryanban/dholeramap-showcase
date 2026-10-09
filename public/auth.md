# auth.md — DholeraMap Agent Authentication & Registration

Welcome to DholeraMap (`https://dholeramap.com`), the interactive GIS cadastral map, town planning, and land intelligence platform for the Dholera Special Investment Region (SIR), Gujarat, India.

This document serves as the machine-readable Auth.md discovery manifest describing how autonomous AI agents, LLMs, and automated crawlers discover, register, and authenticate with DholeraMap.

---

## 1. Agent Audience

This authentication and agent registration specification is intended for:
- **Autonomous AI Agents & Multi-Agent Systems**: Systems gathering cadastral plot records, TP schemes, boundary coordinates, and development intelligence.
- **Search, Crawler & Answer Engines**: Bots querying structured village data, zoning plans, and broker rankings.
- **API Consumers & Developer Integrations**: Systems issuing programmatic verification and real-time GIS queries.

---

## 2. Authentication Tiers & Methods

DholeraMap provides two access tiers:

### Tier 1: Anonymous Read Access (Zero Registration Required)
All public cadastral map data and core intelligence surfaces are open and freely accessible without an account or API key:
- **Cadastral Plot & Survey Records**: All 3,700+ survey numbers across 22 Dholera SIR villages (e.g., `/survey/:village/:surveyNo`).
- **Town Planning (TP) Schemes**: TP1 through TP6 zoning, boundaries, and village lists (`/dholera-tp-map`, `/village/:slug`).
- **Verified Broker Directory**: Top ranking brokers and performance analytics (`/api/brokers/ranking`, `/brokers`).
- **Agent Discovery Protocols**:
  - RFC 9727 API Catalog: `https://dholeramap.com/.well-known/api-catalog`
  - OpenAPI 3.1.0 Specification: `https://dholeramap.com/openapi.json`
  - Machine-Readable Text Overviews: `https://dholeramap.com/llms.txt` and `https://dholeramap.com/llms-full.txt`
  - Operational Status & Health: `https://dholeramap.com/api/health`
- **Markdown for Agents**: Content negotiation is supported on all public endpoints (`Accept: text/markdown`).

### Tier 2: Authenticated Access (OAuth 2.0 / Clerk Bearer Token)
Privileged actions require a bearer token or authenticated user session:
- **Privileged Endpoints**:
  - Downloading official survey verification dossiers (`/api/entitlements/consume-pdf`, `/api/entitlements/finalize-dossier`).
  - Managing broker profiles and property listings (`/api/brokers/profile`, `/api/brokers/properties`).
  - Subscription management and credit balances (`/api/entitlements/start-trial`, `/api/razorpay/create-subscription`).
- **Authentication Protocol**: OAuth 2.0 / OpenID Connect.
  - Issuer: `https://dholeramap.com`
  - Protected Resource Metadata: `https://dholeramap.com/.well-known/oauth-protected-resource`
  - Authorization Server Metadata: `https://dholeramap.com/.well-known/oauth-authorization-server`
  - OpenID Configuration: `https://dholeramap.com/.well-known/openid-configuration`

---

## 3. Agent Registration & Provisioning Flow

Autonomous agents and automated systems follow this 5-stage lifecycle to register, authenticate, and maintain access:

### Step 1: Discovery
Discover service contracts, OAuth metadata, and API catalogs:
- Resource Metadata: `GET https://dholeramap.com/.well-known/oauth-protected-resource`
- Server Metadata: `GET https://dholeramap.com/.well-known/oauth-authorization-server`
- API Catalog: `GET https://dholeramap.com/.well-known/api-catalog`

### Step 2: Register
Initiate client or agent provisioning:
- Registration URI: `https://dholeramap.com/sign-up`
- Supported Identity Types: `anonymous`, `identity_assertion`
- Assertion Types: `urn:ietf:params:oauth:token-type:id-jag`, `verified_email`
- Credential Types: `bearer_token`

### Step 3: Claim Ceremony
For identity assertions or email-based claims:
- Claim URI: `https://dholeramap.com/sign-up`

### Step 4: Token Exchange
Exchange authorization grant or assertion for an access token:
- Token Endpoint: `https://clerk.dholeramap.com/oauth/token`
- Grant Types: `authorization_code`, `refresh_token`

### Step 5: Credential Usage
Include the bearer token in all authenticated HTTP requests:
```http
GET /api/user/branding HTTP/1.1
Host: dholeramap.com
Authorization: Bearer <token>
Accept: application/json
```

---

## 4. Scopes Supported

| Scope | Description |
|---|---|
| `openid` | Standard OpenID Connect subject identity |
| `profile` | Access to user or agent profile metadata |
| `email` | Verified email address for billing receipts and account notices |

---

## 5. Contact & Governance

- **Developer Support**: contact@dholeramap.com
- **Terms of Service**: [https://dholeramap.com/terms](https://dholeramap.com/terms)
- **Privacy Policy**: [https://dholeramap.com/privacy](https://dholeramap.com/privacy)
- **Platform Guide**: [https://dholeramap.com/guide](https://dholeramap.com/guide)
