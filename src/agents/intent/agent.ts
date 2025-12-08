/**
 * Intent Agent
 * Parses natural language remittance requests
 * Supports English and Korean (한국어)
 */

import { AgentBuilder } from "@iqai/adk";
import { createTool } from "@iqai/adk";
import { z } from "zod";

// Tool to parse and structure remittance intent
export const parseIntentTool = createTool({
    name: "parse_remittance_intent",
    description:
        "Parse a natural language remittance request and extract structured data including amount, currencies, and recipient info",
    inputSchema: z.object({
        userMessage: z.string().describe("The user's remittance request"),
    }),
    outputSchema: z.object({
        parsed: z.boolean(),
        intent: z.object({
            action: z.string(),
            amount: z.number(),
            sourceCurrency: z.string(),
            destinationCurrency: z.string(),
            destination: z.string(),
            urgency: z.enum(["normal", "urgent"]),
            recipientInfo: z.string().optional(),
        }),
        originalMessage: z.string(),
        language: z.string(),
    }),
    handler: async ({ userMessage }) => {
        // Simple intent parsing logic
        const lowerMessage = userMessage.toLowerCase();

        // Detect language
        const isKorean = /[가-힣]/.test(userMessage);
        const language = isKorean ? "Korean" : "English";

        // Extract amount (handles both $500 and 500 dollars patterns)
        let amount = 100; // default
        const amountMatch =
            userMessage.match(/\$?([\d,]+(?:\.\d{2})?)\s*(?:dollars?|usd|달러)?/i) ||
            userMessage.match(/([\d,]+(?:\.\d{2})?)\s*(?:dollars?|usd|달러)/i);
        if (amountMatch) {
            amount = parseFloat(amountMatch[1].replace(/,/g, ""));
        }

        // Detect urgency
        const urgentKeywords = ["urgent", "asap", "immediately", "fast", "급히", "빨리"];
        const urgency = urgentKeywords.some((k) => lowerMessage.includes(k))
            ? "urgent"
            : "normal";

        // Detect destination (Korea-related keywords)
        const koreaKeywords = ["korea", "korean", "seoul", "한국", "서울", "krw"];
        const isToKorea = koreaKeywords.some((k) => lowerMessage.includes(k));

        return {
            parsed: true,
            intent: {
                action: "send_remittance",
                amount,
                sourceCurrency: "USD",
                destinationCurrency: isToKorea ? "KRW" : "KRW", // Default to KRW for this agent
                destination: "South Korea",
                urgency,
                recipientInfo: undefined,
            },
            originalMessage: userMessage,
            language,
        };
    },
});

/**
 * Create the Intent Agent
 */
export async function createIntentAgent() {
    return await AgentBuilder.create("intent-agent")
        .withModel("gemini-2.0-flash")
        .withInstruction(`You are the Intent Agent for REMIT-AI, a Korean Won remittance service.

Your job is to understand user requests about sending money to Korea and extract key information.

You can understand both English and Korean (한국어).

When a user wants to send money, extract:
1. Amount (in USD)
2. Destination (Korea/한국)
3. Urgency level
4. Any recipient information

Examples of requests you handle:
- "Send $500 to Korea"
- "I want to transfer 1000 dollars to my mom in Seoul"
- "한국에 200달러 보내고 싶어요"
- "What's the rate for sending 300 USD to Korean Won?"

After parsing the intent, summarize what you understood and confirm with the user.
Always be helpful and explain the KRWQ stablecoin advantage:
- Near-instant settlement (< 1 minute vs 2-5 days)
- Very low fees (< 1% vs 5%+ with banks)
- 1:1 peg to Korean Won`)
        .withTools([parseIntentTool])
        .build();
}
