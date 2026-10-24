#!/usr/bin/env node
// Beggar Bot MCP server. Holds no keys and never signs or pays: paid tools return the x402
// payment requirements unless the caller passes a ready-made X-PAYMENT header (x_payment).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = (process.env.BEGGAR_BOT_URL || "https://beggar-bot-demand.beggarbot.workers.dev").replace(/\/$/, "");
const net = z.enum(["base", "base-sepolia"]).optional().describe("default base");
const xp = z.string().optional().describe("optional base64 X-PAYMENT header from your own x402 wallet client");

async function call(path, { method = "GET", query, body, x_payment }) {
  const u = new URL(BASE + path);
  for (const [k, v] of Object.entries(query || {})) if (v !== undefined && v !== "") u.searchParams.set(k, String(v));
  const headers = { accept: "application/json" };
  if (body) headers["content-type"] = "application/json";
  if (x_payment) headers["x-payment"] = x_payment;
  const r = await fetch(u, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text();
  const note = r.status === 402 ? "\n\nPayment required ($0.01 USDC on Base via x402). Pay with an x402 client (e.g. x402-fetch) and retry with x_payment." : "";
  const pr = r.headers.get("x-payment-response");
  return { content: [{ type: "text", text: `HTTP ${r.status}\n${text}${pr ? "\nX-PAYMENT-RESPONSE: " + pr : ""}${note}` }], isError: r.status >= 400 && r.status !== 402 };
}

const server = new McpServer({ name: "beggar-bot", version: "0.1.0" });
server.tool("verify_payment", "Check that a USDC payment payer->payee for an exact amount landed on Base (paid: $0.01 via x402).",
  { payer: z.string(), payee: z.string(), amount: z.string().describe("USDC decimal, e.g. 0.01"), invoice: z.string(), lookback_blocks: z.number().int().optional(), network: net, x_payment: xp },
  ({ x_payment, ...q }) => call("/v1/verify", { query: q, x_payment }));
server.tool("risk_score", "Risk score for a Base address or an x402 endpoint manifest (paid: $0.01 via x402). Give address or endpoint.",
  { address: z.string().optional(), endpoint: z.string().url().optional(), network: net, x_payment: xp },
  ({ x_payment, ...q }) => call("/v1/risk", { query: q, x_payment }));
server.tool("signed_receipt", "Ed25519-signed, hash-chained receipt for a verified Base USDC payment tx (paid: $0.01 via x402).",
  { tx_hash: z.string(), payer: z.string(), payee: z.string(), amount: z.string(), invoice: z.string().optional(), resource: z.string().optional(), network: net, x_payment: xp },
  ({ x_payment, ...b }) => call("/v1/receipt", { method: "POST", body: b, x_payment }));
server.tool("verify_receipt", "Verify a Beggar Bot receipt signature (free).",
  { receipt: z.record(z.any()), signature: z.string() },
  (b) => call("/v1/receipt/verify", { method: "POST", body: b }));

await server.connect(new StdioServerTransport());
