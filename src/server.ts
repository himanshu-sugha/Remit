/**
 * REMIT-AI API Server
 * Express server that bridges the web UI to the ADK-TS agent
 */

import express from "express";
import cors from "cors";
import { createRemitAIAgent } from "./agents/orchestrator/agent.ts";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "web")));

// Store agent runner instance
let agentRunner: any = null;

// Initialize agent
async function initAgent() {
    try {
        console.log("🚀 Initializing REMIT-AI Agent...");
        const { runner } = await createRemitAIAgent();
        agentRunner = runner;
        console.log("✅ Agent initialized successfully!");
    } catch (error) {
        console.error("❌ Failed to initialize agent:", error);
        console.log("⚠️ Running in demo mode with simulated responses");
    }
}

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        agent: agentRunner ? "connected" : "demo-mode",
        timestamp: new Date().toISOString(),
    });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    console.log(`📩 User: ${message}`);

    try {
        let response: string;

        if (agentRunner) {
            // Use actual ADK-TS agent
            response = await agentRunner.ask(message);
        } else {
            // Fallback to simulated response
            response = await getSimulatedResponse(message);
        }

        console.log(`🤖 Agent: ${response.substring(0, 100)}...`);
        res.json({ response });
    } catch (error: any) {
        console.error("❌ Error processing message:", error);
        res.status(500).json({ error: "Failed to process message" });
    }
});

// Simulated responses for demo mode
async function getSimulatedResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    const USD_KRW_RATE = 1380;

    // Rate inquiry
    if (lowerMessage.includes("rate")) {
        return `📊 **Current Exchange Rate**

💱 $1 USD = ₩${USD_KRW_RATE.toLocaleString()} KRW

**Via KRWQ Stablecoin:**
• Rate: 1 KRWQ = 1 KRW (1:1 peg)
• Fee: ~0.3% (swap) + ~$0.50 (gas)
• Speed: < 1 minute

KRWQ gives you the best rate with instant settlement! 🚀`;
    }

    // Send money
    if (lowerMessage.includes("send") || lowerMessage.includes("보내")) {
        let amount = 500;
        const amountMatch = message.match(/\$?([\d,]+)/);
        if (amountMatch) {
            amount = parseInt(amountMatch[1].replace(/,/g, ""));
        }

        const swapFee = amount * 0.003;
        const gasFee = 0.5;
        const totalFee = swapFee + gasFee;
        const receiveAmount = Math.floor((amount - totalFee) * USD_KRW_RATE);

        return `💸 **REMIT-AI Quote for $${amount}**

**You send:** $${amount} USD
**You receive:** ₩${receiveAmount.toLocaleString()} KRWQ

**Fee Breakdown:**
• Swap fee: $${swapFee.toFixed(2)} (0.3%)
• Gas fee: $${gasFee.toFixed(2)}
• **Total fees: $${totalFee.toFixed(2)}**

**Route:** USD → USDC → Aerodrome → KRWQ
**Time:** < 1 minute

Would you like to proceed? 🚀`;
    }

    // Default
    return `I'm REMIT-AI, your Korean Won remittance assistant!

I can help you:
• 💱 Check USD/KRW exchange rates
• 💰 Get quotes for sending money to Korea
• 🏦 Compare with traditional bank fees

Try: "Send $500 to Korea" or "What's the current rate?"`;
}

// Serve the web UI
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "web", "index.html"));
});

// Start server
app.listen(PORT, async () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║   REMIT-AI Server Started!                                    ║
╠═══════════════════════════════════════════════════════════════╣
║   🌐 Web UI: http://localhost:${PORT}                            ║
║   📡 API: http://localhost:${PORT}/chat                          ║
║   ❤️  Health: http://localhost:${PORT}/health                     ║
╚═══════════════════════════════════════════════════════════════╝
  `);

    await initAgent();
});
