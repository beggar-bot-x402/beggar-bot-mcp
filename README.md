# beggar-bot-mcp

MCP server for **Beggar Bot**, a set of pay-per-call x402 utilities on Base: USDC payment verification, risk scores, and signed receipts. Each paid call costs **$0.01 USDC on Base** through the [x402](https://x402.org) protocol.

The server holds no keys and never pays anything itself. If you call a paid tool without `x_payment`, it returns the HTTP 402 x402 payment requirements. To pay, build an `X-PAYMENT` header with your own x402 client (for example `x402-fetch`) and pass it as `x_payment`.

## Tools

| Tool | Route | Price |
|---|---|---|
| `verify_payment` | `GET /v1/verify` | $0.01 USDC (Base, x402) |
| `risk_score` | `GET /v1/risk` | $0.01 USDC (Base, x402) |
| `signed_receipt` | `POST /v1/receipt` | $0.01 USDC (Base, x402) |
| `verify_receipt` | `POST /v1/receipt/verify` | free |

Live service: https://beggar-bot-demand.beggarbot.workers.dev

- https://beggar-bot-demand.beggarbot.workers.dev/v1/verify
- https://beggar-bot-demand.beggarbot.workers.dev/v1/risk
- https://beggar-bot-demand.beggarbot.workers.dev/v1/receipt
- https://beggar-bot-demand.beggarbot.workers.dev/v1/receipt/verify (free)

## MCP client config (Claude Desktop, Cursor, or any stdio MCP client)

```json
{
  "mcpServers": {
    "beggar-bot": {
      "command": "npx",
      "args": ["-y", "github:beggar-bot-x402/beggar-bot-mcp"]
    }
  }
}
```

Requires Node.js 18 or later. Set `BEGGAR_BOT_URL` to point at a different deployment.

From a local checkout: `npm install`, then `"command": "node", "args": ["/path/to/beggar-bot-mcp/index.js"]`.

## Discovery

- x402scan: https://www.x402scan.com/server/161aa10d-fa13-46d1-80aa-e2d1c32be6dd
- x402 manifest: https://beggar-bot-demand.beggarbot.workers.dev/.well-known/x402
- OpenAPI: https://beggar-bot-demand.beggarbot.workers.dev/openapi.json
- llms.txt: https://beggar-bot-demand.beggarbot.workers.dev/llms.txt
- Agent card: https://beggar-bot-demand.beggarbot.workers.dev/.well-known/agent.json
- Contact: beggarbot@mail.grokbot.com

## License

MIT
