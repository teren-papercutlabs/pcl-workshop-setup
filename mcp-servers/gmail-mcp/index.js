#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = join(__dirname, "../gsheet-mcp/credentials.json");
const TOKEN_PATH = join(__dirname, "token.json");

let gmailApi = null;

async function authorize() {
  if (!existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Missing credentials.json. Ensure gsheet-mcp has credentials.json.`
    );
  }

  if (!existsSync(TOKEN_PATH)) {
    throw new Error(
      `Not authenticated. Run 'node mcp-servers/gmail-mcp/auth.js' first to authenticate with Gmail.`
    );
  }

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  const token = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
  oauth2Client.setCredentials(token);

  // Check if token is expired and refresh if needed
  if (token.expiry_date && token.expiry_date < Date.now()) {
    try {
      const { credentials: newCreds } = await oauth2Client.refreshAccessToken();
      writeFileSync(TOKEN_PATH, JSON.stringify(newCreds, null, 2));
      oauth2Client.setCredentials(newCreds);
    } catch (err) {
      throw new Error(
        `Token expired. Run 'node mcp-servers/gmail-mcp/auth.js' to re-authenticate.`
      );
    }
  }

  return oauth2Client;
}

async function getApi() {
  if (!gmailApi) {
    const auth = await authorize();
    gmailApi = google.gmail({ version: "v1", auth });
  }
  return gmailApi;
}

// API Functions
async function listMessages({ query, maxResults = 10 }) {
  const gmail = await getApi();
  const response = await gmail.users.messages.list({
    userId: "me",
    q: query || "",
    maxResults,
  });

  if (!response.data.messages) {
    return { messages: [] };
  }

  // Get details for each message
  const messages = await Promise.all(
    response.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });

      const headers = detail.data.payload.headers;
      const getHeader = (name) =>
        headers.find((h) => h.name === name)?.value || "";

      return {
        id: msg.id,
        threadId: msg.threadId,
        from: getHeader("From"),
        to: getHeader("To"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: detail.data.snippet,
      };
    })
  );

  return { messages };
}

async function getMessage({ id }) {
  const gmail = await getApi();
  const response = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });

  const headers = response.data.payload.headers;
  const getHeader = (name) =>
    headers.find((h) => h.name === name)?.value || "";

  // Extract body
  let body = "";
  const payload = response.data.payload;

  if (payload.body?.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  } else if (payload.parts) {
    const textPart = payload.parts.find(
      (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }

  return {
    id: response.data.id,
    threadId: response.data.threadId,
    from: getHeader("From"),
    to: getHeader("To"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    body,
  };
}

async function sendEmail({ to, subject, body }) {
  const gmail = await getApi();

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    id: response.data.id,
    threadId: response.data.threadId,
    status: "sent",
  };
}

async function createDraft({ to, subject, body }) {
  const gmail = await getApi();

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: {
        raw: encodedMessage,
      },
    },
  });

  return {
    id: response.data.id,
    messageId: response.data.message.id,
    status: "draft_created",
  };
}

// MCP Server Setup
const server = new Server(
  { name: "gmail-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "gmail_list",
      description: "List emails from Gmail. Supports Gmail search query syntax.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Gmail search query (e.g., 'from:someone@email.com', 'is:unread', 'subject:hello')",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of emails to return (default: 10)",
          },
        },
      },
    },
    {
      name: "gmail_read",
      description: "Read a specific email by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The email ID",
          },
        },
        required: ["id"],
      },
    },
    {
      name: "gmail_send",
      description: "Send an email",
      inputSchema: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient email address",
          },
          subject: {
            type: "string",
            description: "Email subject",
          },
          body: {
            type: "string",
            description: "Email body (plain text)",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
    {
      name: "gmail_draft",
      description: "Create an email draft",
      inputSchema: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient email address",
          },
          subject: {
            type: "string",
            description: "Email subject",
          },
          body: {
            type: "string",
            description: "Email body (plain text)",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "gmail_list":
        result = await listMessages(args);
        break;
      case "gmail_read":
        result = await getMessage(args);
        break;
      case "gmail_send":
        result = await sendEmail(args);
        break;
      case "gmail_draft":
        result = await createDraft(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
