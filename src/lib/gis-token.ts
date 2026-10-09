const FIREBASE_API_KEY = "AIzaSyB2r13V8v3bm6jrSX8apZnX1HZSOwqFQ0I";
const TILESERVER_BASE = "https://tileserver-585432733039.asia-south1.run.app";

interface CachedTokenState {
  idToken: string | null;
  idTokenExpiresAt: number;
  tileData: {
    dp_tile_url: string;
    tp_tile_url: string;
    village_tile_url: string;
    pmtiles_base_url: string;
    pmtiles_token: string;
    expires_at: string;
    ttl_seconds: number;
  } | null;
  tileDataExpiresAt: number;
}

const tokenCache: CachedTokenState = {
  idToken: null,
  idTokenExpiresAt: 0,
  tileData: null,
  tileDataExpiresAt: 0,
};

export async function getFirebaseIdToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache.idToken && tokenCache.idTokenExpiresAt > now + 60000) {
    return tokenCache.idToken;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Firebase token request failed with status ${res.status}`);
  }

  const data = await res.json();
  const expiresInMs = (parseInt(data.expiresIn, 10) || 3600) * 1000;
  tokenCache.idToken = data.idToken;
  tokenCache.idTokenExpiresAt = now + expiresInMs;

  return data.idToken;
}

export async function getCachedTileToken() {
  const now = Date.now();
  if (tokenCache.tileData && tokenCache.tileDataExpiresAt > now + 60000) {
    return tokenCache.tileData;
  }

  const idToken = await getFirebaseIdToken();
  const res = await fetch(`${TILESERVER_BASE}/auth/tile-token`, {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Tile token request failed with status ${res.status}`);
  }

  const data = await res.json();
  const ttlMs = (data.ttl_seconds || 21600) * 1000;
  tokenCache.tileData = data;
  tokenCache.tileDataExpiresAt = now + ttlMs;

  return data;
}
