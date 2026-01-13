#!/usr/bin/env node
/**
 * Run this script to authenticate with Gmail.
 * Usage: node auth.js
 */
import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import open from "open";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = join(__dirname, "../gsheet-mcp/credentials.json"); // Share with gsheet
const TOKEN_PATH = join(__dirname, "token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.compose",
];

const PORT = 3457; // Different port from gsheet

async function main() {
  console.log("\n=== Gmail MCP Authentication ===\n");

  if (!existsSync(CREDENTIALS_PATH)) {
    console.error(`ERROR: Missing credentials.json`);
    console.error(`\nRun gsheet-mcp/auth.js first or copy credentials.json to gsheet-mcp/`);
    process.exit(1);
  }

  if (existsSync(TOKEN_PATH)) {
    console.log("Existing token found. Testing it...");
    try {
      const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
      const { client_id, client_secret } = credentials.installed || credentials.web;
      const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
      const token = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
      oauth2Client.setCredentials(token);

      // Test the token
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      await gmail.users.labels.list({ userId: "me" });

      console.log("\nToken is valid! You're all set.\n");
      process.exit(0);
    } catch (err) {
      console.log("Token invalid or expired. Re-authenticating...\n");
    }
  }

  // Get new token via localhost callback
  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = credentials.installed || credentials.web;
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${PORT}`
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  // Start local server to receive callback
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Authentication failed</h1><p>Error: ${error}</p><p>You can close this window.</p>`);
      server.close();
      console.error(`\nAuthentication failed: ${error}`);
      process.exit(1);
    }

    if (code) {
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Authentication successful!</h1><p>You can close this window and return to the terminal.</p>`);

        console.log("\nAuthentication successful!");
        console.log(`Token saved to: ${TOKEN_PATH}`);
        console.log("\nYou can now use the Gmail MCP.\n");

        server.close();
        process.exit(0);
      } catch (err) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<h1>Authentication failed</h1><p>Error: ${err.message}</p>`);
        server.close();
        console.error("\nError getting token:", err.message);
        process.exit(1);
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Waiting for authentication...</h1>`);
    }
  });

  server.listen(PORT, () => {
    console.log(`Local server started on port ${PORT}`);
    console.log("Opening browser for Google authentication...\n");
    open(authUrl);
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    console.error("\nAuthentication timed out.");
    server.close();
    process.exit(1);
  }, 5 * 60 * 1000);
}

main();
