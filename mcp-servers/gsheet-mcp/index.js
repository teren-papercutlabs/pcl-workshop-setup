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
const CREDENTIALS_PATH = join(__dirname, "credentials.json");
const TOKEN_PATH = join(__dirname, "token.json");

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

let sheetsApi = null;
let driveApi = null;

async function authorize() {
  if (!existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Missing credentials.json. Download OAuth credentials from Google Cloud Console and save to: ${CREDENTIALS_PATH}`
    );
  }

  if (!existsSync(TOKEN_PATH)) {
    throw new Error(
      `Not authenticated. Run 'node mcp-servers/gsheet-mcp/auth.js' first to authenticate with Google.`
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
        `Token expired. Run 'node mcp-servers/gsheet-mcp/auth.js' to re-authenticate.`
      );
    }
  }

  return oauth2Client;
}

async function getApis() {
  if (!sheetsApi || !driveApi) {
    const auth = await authorize();
    sheetsApi = google.sheets({ version: "v4", auth });
    driveApi = google.drive({ version: "v3", auth });
  }
  return { sheets: sheetsApi, drive: driveApi };
}

// API Functions
async function getData({ spreadsheet_id, sheet, range }) {
  const { sheets } = await getApis();
  const rangeStr = sheet ? (range ? `${sheet}!${range}` : sheet) : range || "";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheet_id,
    range: rangeStr || "A:ZZ",
  });

  return {
    range: response.data.range,
    values: response.data.values || [],
  };
}

async function listSheets({ spreadsheet_id }) {
  const { sheets } = await getApis();

  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheet_id,
    fields: "sheets.properties",
  });

  return {
    sheets: response.data.sheets.map((s) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
    })),
  };
}

async function createSpreadsheet({ title }) {
  const { sheets } = await getApis();

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
    },
  });

  return {
    spreadsheetId: response.data.spreadsheetId,
    spreadsheetUrl: response.data.spreadsheetUrl,
    title: response.data.properties.title,
  };
}

async function rawBatchUpdate({ spreadsheet_id, requests }) {
  const { sheets } = await getApis();

  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheet_id,
    requestBody: { requests },
  });

  return {
    spreadsheetId: response.data.spreadsheetId,
    replies: response.data.replies,
  };
}

async function getSummary({ spreadsheet_id }) {
  const { sheets } = await getApis();

  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheet_id,
    includeGridData: true,
    ranges: [], // Get all sheets
  });

  const summary = {
    title: response.data.properties.title,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheet_id}`,
    sheets: [],
  };

  for (const sheet of response.data.sheets) {
    const props = sheet.properties;
    const gridData = sheet.data?.[0];

    let rowCount = 0;
    let sampleData = [];

    if (gridData?.rowData) {
      rowCount = gridData.rowData.length;
      // Get first 3 rows as sample
      sampleData = gridData.rowData.slice(0, 3).map((row) =>
        (row.values || []).map((cell) => cell.formattedValue || "")
      );
    }

    summary.sheets.push({
      title: props.title,
      sheetId: props.sheetId,
      rowCount,
      columnCount: props.gridProperties?.columnCount || 0,
      sampleData,
    });
  }

  return summary;
}

// MCP Server Setup
const server = new Server(
  { name: "gsheet-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "gsheet_get_data",
      description: "Read data from a Google Sheet. Returns cell values.",
      inputSchema: {
        type: "object",
        properties: {
          spreadsheet_id: {
            type: "string",
            description: "The spreadsheet ID from the URL",
          },
          sheet: {
            type: "string",
            description: "Sheet name (default: first sheet)",
          },
          range: {
            type: "string",
            description: "A1 notation range (e.g., 'A1:C10'). Optional.",
          },
        },
        required: ["spreadsheet_id"],
      },
    },
    {
      name: "gsheet_list_sheets",
      description: "List all sheets (tabs) in a spreadsheet",
      inputSchema: {
        type: "object",
        properties: {
          spreadsheet_id: {
            type: "string",
            description: "The spreadsheet ID from the URL",
          },
        },
        required: ["spreadsheet_id"],
      },
    },
    {
      name: "gsheet_create_spreadsheet",
      description: "Create a new Google Spreadsheet",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title for the new spreadsheet",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "gsheet_raw",
      description:
        "Execute raw batchUpdate requests on a spreadsheet. Use for writes, formatting, adding sheets, etc. See Google Sheets API batchUpdate docs for request types.",
      inputSchema: {
        type: "object",
        properties: {
          spreadsheet_id: {
            type: "string",
            description: "The spreadsheet ID",
          },
          requests: {
            type: "array",
            description:
              "Array of batchUpdate request objects. See: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request",
            items: { type: "object" },
          },
        },
        required: ["spreadsheet_id", "requests"],
      },
    },
    {
      name: "gsheet_get_summary",
      description:
        "Get a summary of a spreadsheet including sheet names, row counts, and sample data",
      inputSchema: {
        type: "object",
        properties: {
          spreadsheet_id: {
            type: "string",
            description: "The spreadsheet ID from the URL",
          },
        },
        required: ["spreadsheet_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "gsheet_get_data":
        result = await getData(args);
        break;
      case "gsheet_list_sheets":
        result = await listSheets(args);
        break;
      case "gsheet_create_spreadsheet":
        result = await createSpreadsheet(args);
        break;
      case "gsheet_raw":
        result = await rawBatchUpdate(args);
        break;
      case "gsheet_get_summary":
        result = await getSummary(args);
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
