import axios from 'axios';
import { createPrivateKey, KeyObject } from 'crypto';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';

export interface GithubInstallation {
  id: number;
  account: { login?: string; name?: string } | null;
  suspended_at: string | null;
}

export interface GithubRepository {
  id: number;
  full_name: string;
  html_url: string;
  private: boolean;
}

// Backend/operator use only. Installation access is not proof that a TROFOS user
// may connect that installation to a project.
export class GithubAppService {
  constructor(private readonly appId: string, private readonly privateKey: KeyObject) {}

  static fromEnvironment(): GithubAppService {
    const appId = process.env.GITHUB_APP_ID?.trim();
    const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH?.trim();
    if (!appId || !/^\d+$/.test(appId) || !/[1-9]/.test(appId)) {
      throw new Error('Set GITHUB_APP_ID to the numeric GitHub App ID.');
    }
    if (!keyPath) throw new Error('Set GITHUB_APP_PRIVATE_KEY_PATH to the App PEM file.');
    try {
      const key = createPrivateKey(readFileSync(keyPath));
      if (key.asymmetricKeyType !== 'rsa') throw new Error('Invalid key type');
      return new GithubAppService(appId, key);
    } catch {
      throw new Error('Cannot load the GitHub App RSA private key. Check the PEM file and its permissions.');
    }
  }

  private createJwt(): string {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({ iat: now - 60, exp: now + 540, iss: this.appId }, this.privateKey, { algorithm: 'RS256' });
  }

  private async request<T>(method: 'GET' | 'POST', path: string, token: string, data?: unknown): Promise<T> {
    try {
      const response = await axios.request<T>({
        method,
        url: `https://api.github.com${path}`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'TROFOS',
        },
        data,
        timeout: 15000,
        maxRedirects: 0,
      });
      return response.data;
    } catch (error) {
      // Axios errors contain request headers (including tokens). Never propagate them.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      throw new Error(status ? `GitHub API request failed (HTTP ${status}).` : 'GitHub API request failed (network or timeout).');
    }
  }

  async listInstallations(): Promise<GithubInstallation[]> {
    const result: GithubInstallation[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.request<GithubInstallation[]>(
        'GET', `/app/installations?per_page=100&page=${page}`, this.createJwt(),
      );
      result.push(...batch);
      if (batch.length < 100) return result;
    }
  }

  async listRepositories(installationId: number): Promise<GithubRepository[]> {
    if (!Number.isSafeInteger(installationId) || installationId <= 0) {
      throw new Error('Installation ID must be a positive safe integer.');
    }
    // Only metadata access is needed for this verification. Tokens remain in memory
    // and are obtained afresh for each listing, avoiding stale cached credentials.
    const { token } = await this.request<{ token: string }>(
      'POST', `/app/installations/${installationId}/access_tokens`, this.createJwt(),
      { permissions: { metadata: 'read' } },
    );
    const result: GithubRepository[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.request<{ repositories: GithubRepository[] }>(
        'GET', `/installation/repositories?per_page=100&page=${page}`, token,
      );
      result.push(...batch.repositories);
      if (batch.repositories.length < 100) return result;
    }
  }
}
