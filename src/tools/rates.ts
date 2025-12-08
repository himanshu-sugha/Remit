/**
 * Exchange Rate Tools
 * Fetches USD/KRW exchange rates and provides comparisons
 */

import { createTool } from "@iqai/adk";
import { z } from "zod";

// Simulated real-time rate (in production, fetch from forex API)
const getUsdKrwRate = () => {
    // Base rate with small random variation to simulate live market
    const baseRate = 1380;
    const variation = (Math.random() - 0.5) * 10; // ±5 KRW variation
    return Math.round(baseRate + variation);
};

/**
 * Get current USD/KRW exchange rate
 */
export const getExchangeRateTool = createTool({
    name: "get_exchange_rate",
    description: "Get the current USD to KRW (Korean Won) exchange rate",
    inputSchema: z.object({
        amount: z
            .number()
            .positive()
            .optional()
            .default(1)
            .describe("Amount in USD to convert (default: 1)"),
    }),
    outputSchema: z.object({
        rate: z.number(),
        usdAmount: z.number(),
        krwAmount: z.number(),
        timestamp: z.string(),
        source: z.string(),
    }),
    handler: async ({ amount }) => {
        const rate = getUsdKrwRate();
        return {
            rate,
            usdAmount: amount,
            krwAmount: Math.round(amount * rate),
            timestamp: new Date().toISOString(),
            source: "Forex Market Rate",
        };
    },
});

/**
 * Calculate conversion with fees
 */
export const calculateConversionTool = createTool({
    name: "calculate_conversion",
    description:
        "Calculate USD to KRW conversion including all fees and show net amount received",
    inputSchema: z.object({
        amountUsd: z.number().positive().describe("Amount in USD to send"),
        method: z
            .enum(["remit-ai", "bank", "western-union", "wise"])
            .optional()
            .default("remit-ai")
            .describe("Transfer method to calculate fees for"),
    }),
    outputSchema: z.object({
        method: z.string(),
        sendAmount: z.number(),
        exchangeRate: z.number(),
        fees: z.object({
            transferFee: z.number(),
            exchangeMarkup: z.number(),
            totalFees: z.number(),
            feePercent: z.number(),
        }),
        receiveAmount: z.number(),
        currency: z.string(),
        deliveryTime: z.string(),
    }),
    handler: async ({ amountUsd, method }) => {
        const rate = getUsdKrwRate();

        // Fee structures for different providers
        const feeStructures: Record<
            string,
            { transferFee: number; markupPercent: number; deliveryTime: string }
        > = {
            "remit-ai": {
                transferFee: 0.5, // $0.50 gas
                markupPercent: 0.003, // 0.3% DEX fee
                deliveryTime: "< 1 minute",
            },
            bank: {
                transferFee: 25, // $25 wire fee
                markupPercent: 0.05, // 5% markup
                deliveryTime: "2-5 business days",
            },
            "western-union": {
                transferFee: 10,
                markupPercent: 0.04, // 4% markup
                deliveryTime: "1-3 business days",
            },
            wise: {
                transferFee: 5,
                markupPercent: 0.01, // 1% markup
                deliveryTime: "1-2 business days",
            },
        };

        const structure = feeStructures[method];
        const transferFee = structure.transferFee;
        const exchangeMarkup = amountUsd * structure.markupPercent;
        const totalFees = transferFee + exchangeMarkup;
        const effectiveRate = rate * (1 - structure.markupPercent);
        const receiveAmount = Math.round((amountUsd - transferFee) * effectiveRate);

        return {
            method: method === "remit-ai" ? "REMIT-AI (KRWQ)" : method.toUpperCase(),
            sendAmount: amountUsd,
            exchangeRate: effectiveRate,
            fees: {
                transferFee,
                exchangeMarkup,
                totalFees,
                feePercent: (totalFees / amountUsd) * 100,
            },
            receiveAmount,
            currency: "KRW",
            deliveryTime: structure.deliveryTime,
        };
    },
});

// Export all rate tools
export const rateTools = [getExchangeRateTool, calculateConversionTool];
