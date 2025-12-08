/**
 * Frax Finance Integration Tools
 * Tools for interacting with Frax stablecoins (frxUSD)
 */

import { createTool } from "@iqai/adk";
import { z } from "zod";

/**
 * Get frxUSD information
 */
export const getFrxUSDInfoTool = createTool({
    name: "get_frxusd_info",
    description:
        "Get information about frxUSD stablecoin from Frax Finance. frxUSD is a fully-backed USD stablecoin.",
    inputSchema: z.object({}),
    outputSchema: z.object({
        symbol: z.string(),
        name: z.string(),
        peg: z.string(),
        backing: z.string(),
        networks: z.array(z.string()),
        website: z.string(),
    }),
    handler: async () => {
        return {
            symbol: "frxUSD",
            name: "Frax USD",
            peg: "1 frxUSD = 1 USD",
            backing:
                "Fully backed by BlackRock BUIDL, Superstate USTB, and other RWAs",
            networks: ["Ethereum", "Fraxtal", "Base", "Arbitrum", "Polygon"],
            website: "https://frax.finance",
        };
    },
});

/**
 * Get multi-hop route through Frax
 */
export const getFraxRouteTool = createTool({
    name: "get_frax_route",
    description:
        "Get a multi-hop swap route using Frax infrastructure: USD → frxUSD → KRWQ",
    inputSchema: z.object({
        amountUsd: z.number().positive().describe("Amount in USD"),
    }),
    outputSchema: z.object({
        route: z.array(
            z.object({
                step: z.number(),
                from: z.string(),
                to: z.string(),
                protocol: z.string(),
                fee: z.number(),
            })
        ),
        totalFee: z.number(),
        estimatedOutput: z.number(),
        outputCurrency: z.string(),
    }),
    handler: async ({ amountUsd }) => {
        const USD_KRW_RATE = 1380;

        const route = [
            {
                step: 1,
                from: "USD/USDC",
                to: "frxUSD",
                protocol: "Frax Swap",
                fee: amountUsd * 0.001, // 0.1% fee
            },
            {
                step: 2,
                from: "frxUSD",
                to: "KRWQ",
                protocol: "Aerodrome/Fraxtal",
                fee: amountUsd * 0.0025, // 0.25% fee
            },
        ];

        const totalFee = route.reduce((sum, r) => sum + r.fee, 0);
        const estimatedOutput = Math.floor((amountUsd - totalFee) * USD_KRW_RATE);

        return {
            route,
            totalFee,
            estimatedOutput,
            outputCurrency: "KRWQ",
        };
    },
});

// Export all Frax tools
export const fraxTools = [getFrxUSDInfoTool, getFraxRouteTool];
