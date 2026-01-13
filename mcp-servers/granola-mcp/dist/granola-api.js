import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
const GRANOLA_APP_SUPPORT_PATH = join(homedir(), "Library", "Application Support", "Granola");
export class GranolaApiClient {
    accessToken = null;
    tokenExpiry = 0;
    apiUrl = "https://api.granola.ai/v2/get-documents";
    loadCredentials() {
        try {
            const credsPath = join(GRANOLA_APP_SUPPORT_PATH, "supabase.json");
            const fileContent = readFileSync(credsPath, "utf-8");
            const data = JSON.parse(fileContent);
            const workosTokens = JSON.parse(data.workos_tokens);
            const accessToken = workosTokens.access_token;
            const expiresIn = workosTokens.expires_in || 21600; // Default 6 hours
            const obtainedAt = workosTokens.obtained_at || Date.now();
            this.tokenExpiry = obtainedAt + expiresIn * 1000;
            this.accessToken = accessToken;
            return accessToken;
        }
        catch (error) {
            console.error("Error loading Granola credentials:", error);
            return null;
        }
    }
    getAccessToken() {
        if (!this.accessToken || Date.now() >= this.tokenExpiry - 5 * 60 * 1000) {
            return this.loadCredentials();
        }
        return this.accessToken;
    }
    async fetchDocuments(limit = 100, offset = 0) {
        const token = this.getAccessToken();
        if (!token) {
            throw new Error("Failed to load Granola credentials");
        }
        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
            "User-Agent": "Granola/5.354.0",
            "X-Client-Version": "5.354.0",
        };
        const body = {
            limit,
            offset,
            include_last_viewed_panel: true,
        };
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`Granola API error: ${response.status} ${response.statusText}`);
            }
            const data = (await response.json());
            return data.docs || [];
        }
        catch (error) {
            console.error("Error fetching documents from Granola API:", error);
            throw error;
        }
    }
    async getAllDocuments() {
        const allDocs = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const docs = await this.fetchDocuments(limit, offset);
            if (docs.length === 0) {
                break;
            }
            allDocs.push(...docs);
            offset += limit;
            if (offset > 10000) {
                break;
            }
        }
        return allDocs;
    }
    async searchDocuments(query, limit = 10) {
        const allDocs = await this.getAllDocuments();
        const lowerQuery = query.toLowerCase();
        return allDocs
            .filter((doc) => {
            const title = doc.title?.toLowerCase() || "";
            const markdown = doc.markdown?.toLowerCase() || "";
            const content = doc.content?.toLowerCase() || "";
            return (title.includes(lowerQuery) ||
                markdown.includes(lowerQuery) ||
                content.includes(lowerQuery));
        })
            .slice(0, limit);
    }
    async getDocumentById(id) {
        const allDocs = await this.getAllDocuments();
        return allDocs.find((doc) => doc.id === id) || null;
    }
}
