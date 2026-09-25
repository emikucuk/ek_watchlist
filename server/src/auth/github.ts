import { env } from "../config/env.js";

export interface GitHubProfile {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export function isOAuthConfigured(): boolean {
  return Boolean(env.githubOAuthClientId && env.githubOAuthClientSecret);
}

export function isLoginAllowed(login: string): boolean {
  const allowed = env.githubOAuthAllowedLogins;
  if (allowed.length === 0) return false;
  return allowed.includes(login.toLowerCase());
}

export function buildAuthorizeUrl(state: string): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.githubOAuthClientId);
  url.searchParams.set("redirect_uri", env.githubOAuthCallbackUrl);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForProfile(code: string): Promise<GitHubProfile> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.githubOAuthClientId,
      client_secret: env.githubOAuthClientSecret,
      code,
      redirect_uri: env.githubOAuthCallbackUrl,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`GitHub token exchange failed (${tokenRes.status})`);
  }

  const tokenBody = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenBody.access_token) {
    throw new Error(tokenBody.error_description ?? tokenBody.error ?? "No access token");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenBody.access_token}`,
      "User-Agent": "ek-watchlist",
    },
  });

  if (!userRes.ok) {
    throw new Error(`GitHub user fetch failed (${userRes.status})`);
  }

  const user = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string | null;
  };

  return {
    id: user.id,
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
  };
}
