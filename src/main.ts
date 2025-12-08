/**
 * REMIT-AI - Main Entry Point
 * Korean Won Remittance AI Agent
 * 
 * Built for IQAI Agent Arena Hackathon
 * Using ADK-TS (Agent Development Kit for TypeScript)
 */

import { createRemitAIAgent } from "./agents/orchestrator/agent.ts";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗███╗   ███╗██╗████████╗     █████╗ ██╗     ║
║   ██╔══██╗██╔════╝████╗ ████║██║╚══██╔══╝    ██╔══██╗██║     ║
║   ██████╔╝█████╗  ██╔████╔██║██║   ██║       ███████║██║     ║
║   ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║       ██╔══██║██║     ║
║   ██║  ██║███████╗██║ ╚═╝ ██║██║   ██║       ██║  ██║██║     ║
║   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ║
║                                                               ║
║   Korean Won Remittance AI Agent                              ║
║   Powered by KRWQ • Frax • IQAI ADK-TS                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

    // Check for API key
    if (!process.env.GOOGLE_API_KEY && !process.env.OPENAI_API_KEY) {
        console.error("❌ Error: No API key found!");
        console.error("Please set GOOGLE_API_KEY or OPENAI_API_KEY in .env file");
        console.error("\nExample .env:");
        console.error("GOOGLE_API_KEY=your_api_key_here");
        process.exit(1);
    }

    console.log("🚀 Initializing REMIT-AI Agent...\n");

    try {
        const { runner } = await createRemitAIAgent();

        // Demo interaction
        const queries = [
            "What's the current USD to KRW exchange rate?",
            "I want to send $500 to Korea. What are my options?",
        ];

        for (const query of queries) {
            console.log(`\n👤 User: ${query}`);
            console.log("─".repeat(50));

            const response = await runner.ask(query);
            console.log(`🤖 REMIT-AI: ${response}`);
            console.log("─".repeat(50));
        }

        console.log("\n✅ REMIT-AI Agent is ready!");
        console.log("💡 Run 'npm run web' to start the web interface");
        console.log("💡 Run 'npm run run' for interactive CLI mode\n");

    } catch (error) {
        console.error("❌ Error initializing agent:", error);
        process.exit(1);
    }
}

// Run main
main().catch(console.error);
