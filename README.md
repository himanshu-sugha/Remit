# REMIT-AI 💸

> **Korean Won Remittance AI Agent** - Send money to Korea instantly with near-zero fees using KRWQ stablecoin.

[![Built with ADK-TS](https://img.shields.io/badge/Built%20with-ADK--TS-blueviolet)](https://adk.iqai.com)
[![Hackathon](https://img.shields.io/badge/IQAI-Agent%20Arena-orange)](https://dorahacks.io/hackathon/agentarena)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Problem

Sending money to South Korea is slow and expensive:
- **Traditional banks** charge 5%+ fees and take 2-5 business days
- **Wire transfers** have hidden FX markups of 2-3%
- **$15+ billion** flows into/out of Korea annually in remittances

## 💡 Solution

**REMIT-AI** is an intelligent AI agent that enables instant, low-cost remittances to Korea using:

- **KRWQ** - The first Korean Won stablecoin (1:1 pegged to KRW)
- **Frax Finance** - Robust stablecoin infrastructure for USD side
- **IQAI ADK-TS** - Advanced agent framework for intelligent automation

### Key Features

| Feature | REMIT-AI | Traditional Bank |
|---------|----------|------------------|
| **Speed** | < 1 minute | 2-5 business days |
| **Fees** | < 1% | 5%+ |
| **Transparency** | On-chain | Hidden fees |
| **Availability** | 24/7 | Banking hours only |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REMIT-AI ORCHESTRATOR                    │
│                    (Master Agent - ADK-TS)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│  │   INTENT    │   │    ROUTE    │   │    EXECUTION    │   │
│  │   AGENT     │──▶│    AGENT    │──▶│     AGENT       │   │
│  │  (NLP/i18n) │   │ (Path Find) │   │  (Tx Simulate)  │   │
│  └─────────────┘   └─────────────┘   └─────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         TOOLS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │   KRWQ   │  │   FRAX   │  │   RATES  │                   │
│  │   Tools  │  │   Tools  │  │   Tools  │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Google AI API key (or OpenAI/Anthropic)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/remit-ai.git
cd remit-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your API key
```

### Running the Agent

```bash
# Terminal mode (ADK CLI)
npm start

# Web interface
npm run server
# Open http://localhost:3001

# ADK Web UI
npm run web
```

## 📸 Demo

### Web Interface
The web UI supports:
- 🌐 English and Korean (한국어)
- 💬 Natural language queries
- 📊 Real-time exchange rates
- 💰 Instant quotes with fee breakdown
- 🏦 Comparison with traditional banks

### Example Interactions

```
User: "Send $500 to Korea"

REMIT-AI: 💸 REMIT-AI Quote for $500

You send: $500 USD
You receive: ₩687,240 KRWQ

Fee Breakdown:
• Swap fee: $1.50 (0.3%)
• Gas fee: $0.50
• Total fees: $2.00 (0.4%)

Route: USD → USDC → Aerodrome → KRWQ
Time: < 1 minute

🏦 vs Bank Wire:
• Bank would charge: $50.00
• You save: $48.00 (96% less fees!)
```

## 🔧 How It Uses ADK-TS

### Multi-Agent Architecture
```typescript
// Orchestrator Agent with all tools
const { runner } = await AgentBuilder.create("remit-ai")
  .withModel("gemini-2.0-flash")
  .withInstruction(`You are REMIT-AI, a Korean Won remittance agent...`)
  .withTools([...krwqTools, ...fraxTools, ...rateTools])
  .build();
```

### Custom Tools
```typescript
// KRWQ Swap Quote Tool
export const getSwapQuoteTool = createTool({
  name: "get_swap_quote",
  description: "Get a quote for swapping USD to KRWQ",
  inputSchema: z.object({
    amountUsd: z.number().positive(),
  }),
  handler: async ({ amountUsd }) => {
    // Calculate swap with fees, slippage, routing
    return { outputAmount, fees, route, savings };
  },
});
```

## 🤝 Sponsor Integration

| Sponsor | Product | How We Use It |
|---------|---------|---------------|
| **IQAI** | ADK-TS | Multi-agent framework powering the entire application |
| **IQAI** | ATP | Tokenization platform for agent deployment (post-hackathon) |
| **Frax Finance** | frxUSD | USD-side stablecoin for multi-hop routing |
| **KRWQ** | KRWQ Token | Core Korean Won stablecoin for settlement |

## 📂 Project Structure

```
remit-ai/
├── src/
│   ├── agents/
│   │   ├── intent/          # NLP parsing agent
│   │   ├── route/           # Path finding agent
│   │   ├── execution/       # Transaction agent
│   │   └── orchestrator/    # Main coordinator
│   ├── tools/
│   │   ├── krwq.ts          # KRWQ stablecoin tools
│   │   ├── frax.ts          # Frax Finance tools
│   │   └── rates.ts         # Exchange rate tools
│   ├── web/                 # Web interface
│   ├── agent.ts             # ADK CLI entry point
│   ├── main.ts              # Demo script
│   └── server.ts            # API server
├── .env.example
├── package.json
└── README.md
```

## 🔮 Future Roadmap

- [ ] Real on-chain execution on Base mainnet
- [ ] KRWQ wallet integration (LayerZero OFT)
- [ ] Korean bank account linking (pending regulations)
- [ ] Mobile app with voice interface (OpenMind integration)
- [ ] ATP tokenization for community governance

## 👥 Team

- **Himanshu Soni** - Developer

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the **IQAI Agent Arena Hackathon**

Powered by: 🇰🇷 KRWQ | ⚗️ Frax | 🧠 IQAI ADK-TS
