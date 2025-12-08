/**
 * Execution Agent
 * Handles transaction simulation and execution summary
 */

import { AgentBuilder } from "@iqai/adk";
import { createTool } from "@iqai/adk";
import { z } from "zod";

// Tool to simulate transaction execution
export const simulateTransactionTool = createTool({
    name: "simulate_transaction",
    description: "Simulate a KRWQ remittance transaction and return execution details",
    inputSchema: z.object({
        amountUsd: z.number().positive().describe("Amount in USD to send"),
        route: z.string().describe("The swap route to use"),
        recipientAddress: z.string().optional().describe("Optional recipient wallet address"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        simulation: z.object({
            transactionId: z.string(),
            status: z.string(),
            inputAmount: z.number(),
            inputCurrency: z.string(),
            outputAmount: z.number(),
            outputCurrency: z.string(),
            route: z.string(),
            fees: z.object({
                swapFee: z.number(),
                gasFee: z.number(),
                totalFee: z.number(),
            }),
            network: z.string(),
            estimatedTime: z.string(),
            timestamp: z.string(),
        }),
        nextSteps: z.array(z.string()),
    }),
    handler: async ({ amountUsd, route, recipientAddress }) => {
        const USD_KRW_RATE = 1380;
        const swapFee = amountUsd * 0.003;
        const gasFee = 0.5;
        const totalFee = swapFee + gasFee;
        const outputAmount = Math.floor((amountUsd - totalFee) * USD_KRW_RATE);

        // Generate mock transaction ID
        const txId = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

        return {
            success: true,
            simulation: {
                transactionId: txId,
                status: "SIMULATED",
                inputAmount: amountUsd,
                inputCurrency: "USD",
                outputAmount,
                outputCurrency: "KRWQ",
                route: route || "USD → USDC → Aerodrome → KRWQ",
                fees: {
                    swapFee,
                    gasFee,
                    totalFee,
                },
                network: "Base (Coinbase L2)",
                estimatedTime: "< 30 seconds",
                timestamp: new Date().toISOString(),
            },
            nextSteps: [
                "Connect wallet to confirm transaction",
                "Approve USDC spending",
                "Execute swap on Aerodrome",
                "KRWQ will be delivered to recipient address",
            ],
        };
    },
});

// Tool to generate transaction summary
export const generateSummaryTool = createTool({
    name: "generate_transaction_summary",
    description: "Generate a human-readable summary of the remittance transaction",
    inputSchema: z.object({
        amountUsd: z.number().describe("Amount sent in USD"),
        amountKrwq: z.number().describe("Amount received in KRWQ"),
        fees: z.number().describe("Total fees"),
        route: z.string().describe("Swap route used"),
    }),
    outputSchema: z.object({
        summary: z.string(),
        comparison: z.string(),
    }),
    handler: async ({ amountUsd, amountKrwq, fees, route }) => {
        const bankFee = amountUsd * 0.05 + 25;
        const savings = bankFee - fees;
        const savingsPercent = ((savings / bankFee) * 100).toFixed(1);

        const summary = `
💸 REMIT-AI Transaction Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Sent: $${amountUsd.toFixed(2)} USD
📥 Received: ₩${amountKrwq.toLocaleString()} KRWQ
💰 Fees: $${fees.toFixed(2)} (${((fees / amountUsd) * 100).toFixed(2)}%)
🛣️ Route: ${route}
⏱️ Time: < 1 minute
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

        const comparison = `
🏦 vs Traditional Bank Wire:
• Bank fees would be: $${bankFee.toFixed(2)}
• You saved: $${savings.toFixed(2)} (${savingsPercent}% less!)
• Time saved: 2-5 business days

✅ Powered by KRWQ (Korean Won stablecoin)
✅ Built on IQAI's Agent Tokenization Platform
`;

        return { summary, comparison };
    },
});

/**
 * Create the Execution Agent
 */
export async function createExecutionAgent() {
    return await AgentBuilder.create("execution-agent")
        .withModel("gemini-2.0-flash")
        .withInstruction(`You are the Execution Agent for REMIT-AI.

Your job is to simulate and summarize remittance transactions.

When a user confirms they want to proceed with a remittance:
1. Simulate the transaction with all details
2. Generate a clear summary showing:
   - Amount sent and received
   - All fees (swap fee + gas)
   - The route taken
   - Estimated completion time
3. Compare with traditional bank wire to show savings
4. Provide next steps for actual execution

This is a SIMULATION for the hackathon demo. In production, this would:
- Connect to Base/Fraxtal for actual swaps
- Use KRWQ smart contracts
- Verify recipient addresses
- Execute atomic swaps

Always emphasize:
- The transaction uses KRWQ, the first Korean Won stablecoin
- Built using IQAI's ADK-TS framework
- Much cheaper and faster than traditional remittance`)
        .withTools([simulateTransactionTool, generateSummaryTool])
        .build();
}
