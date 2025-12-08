/**
 * KRWQ Stablecoin Tools
 * Tools for interacting with KRWQ (Korean Won) stablecoin
 * KRWQ is pegged 1:1 to Korean Won, built by IQ and Frax
 */

import { createTool } from "@iqai/adk";
import { z } from "zod";

// Current USD/KRW exchange rate (approximate)
const USD_KRW_RATE = 1380;

// KRWQ contract addresses
const KRWQ_CONTRACTS = {
    base: "0x1234...krwq", // Base network (Coinbase L2)
    fraxtal: "0x5678...krwq", // Fraxtal network
};

// Simulated liquidity pools
const LIQUIDITY_POOLS = {
    "aerodrome-krwq-usdc": {
        name: "Aerodrome KRWQ/USDC",
        network: "Base",
        tvl: 5_000_000,
        fee: 0.003, // 0.3%
        slippage: 0.001, // 0.1%
    },
    "frax-krwq-frxusd": {
        name: "Frax KRWQ/frxUSD",
        network: "Fraxtal",
        tvl: 2_000_000,
        fee: 0.0025, // 0.25%
        slippage: 0.0015, // 0.15%
    },
};

/**
 * Get current KRWQ price and info
 */
export const getKRWQPriceTool = createTool({
    name: "get_krwq_price",
    description:
        "Get the current KRWQ stablecoin price and exchange rate information. KRWQ is pegged 1:1 to Korean Won.",
    inputSchema: z.object({}),
    outputSchema: z.object({
        krwqPerUsd: z.number(),
        usdPerKrwq: z.number(),
        peg: z.string(),
        lastUpdated: z.string(),
        source: z.string(),
    }),
    handler: async () => {
        // KRWQ is pegged 1:1 to KRW
        const krwqPerUsd = USD_KRW_RATE;
        const usdPerKrwq = 1 / USD_KRW_RATE;

        return {
            krwqPerUsd,
            usdPerKrwq,
            peg: "1 KRWQ = 1 KRW (Korean Won)",
            lastUpdated: new Date().toISOString(),
            source: "KRWQ Oracle",
        };
    },
});

/**
 * Calculate USD to KRWQ swap quote
 */
export const getSwapQuoteTool = createTool({
    name: "get_swap_quote",
    description:
        "Get a quote for swapping USD (or USDC) to KRWQ. Returns the amount of KRWQ you will receive, fees, and the best route.",
    inputSchema: z.object({
        amountUsd: z
            .number()
            .positive()
            .describe("Amount in USD to convert to KRWQ"),
        preferredPool: z
            .enum(["aerodrome", "frax", "auto"])
            .optional()
            .default("auto")
            .describe("Preferred liquidity pool or auto for best rate"),
    }),
    outputSchema: z.object({
        inputAmount: z.number(),
        inputCurrency: z.string(),
        outputAmount: z.number(),
        outputCurrency: z.string(),
        exchangeRate: z.number(),
        fee: z.number(),
        feePercent: z.number(),
        slippage: z.number(),
        route: z.string(),
        network: z.string(),
        estimatedGas: z.number(),
        totalCostUsd: z.number(),
        savings: z.object({
            traditionalWireFee: z.number(),
            ourFee: z.number(),
            savedAmount: z.number(),
            savedPercent: z.number(),
        }),
    }),
    handler: async ({ amountUsd, preferredPool }) => {
        // Find best pool
        let pool;
        if (preferredPool === "aerodrome") {
            pool = LIQUIDITY_POOLS["aerodrome-krwq-usdc"];
        } else if (preferredPool === "frax") {
            pool = LIQUIDITY_POOLS["frax-krwq-frxusd"];
        } else {
            // Auto: pick lowest fee
            pool =
                LIQUIDITY_POOLS["aerodrome-krwq-usdc"].fee <
                    LIQUIDITY_POOLS["frax-krwq-frxusd"].fee
                    ? LIQUIDITY_POOLS["aerodrome-krwq-usdc"]
                    : LIQUIDITY_POOLS["frax-krwq-frxusd"];
        }

        const fee = amountUsd * pool.fee;
        const slippage = amountUsd * pool.slippage;
        const estimatedGas = 0.5; // $0.50 gas on L2
        const netAmount = amountUsd - fee - slippage - estimatedGas;
        const outputAmount = Math.floor(netAmount * USD_KRW_RATE);

        // Traditional wire transfer comparison
        const traditionalWireFee = amountUsd * 0.05; // 5% typical bank fee
        const ourFee = fee + slippage + estimatedGas;
        const savedAmount = traditionalWireFee - ourFee;
        const savedPercent = (savedAmount / traditionalWireFee) * 100;

        return {
            inputAmount: amountUsd,
            inputCurrency: "USD",
            outputAmount,
            outputCurrency: "KRWQ",
            exchangeRate: USD_KRW_RATE,
            fee,
            feePercent: pool.fee * 100,
            slippage,
            route: `USD → USDC → ${pool.name} → KRWQ`,
            network: pool.network,
            estimatedGas,
            totalCostUsd: fee + slippage + estimatedGas,
            savings: {
                traditionalWireFee,
                ourFee,
                savedAmount,
                savedPercent,
            },
        };
    },
});

/**
 * Get available liquidity pools
 */
export const getLiquidityPoolsTool = createTool({
    name: "get_liquidity_pools",
    description:
        "Get information about available KRWQ liquidity pools for swapping",
    inputSchema: z.object({}),
    outputSchema: z.object({
        pools: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                network: z.string(),
                tvl: z.number(),
                feePercent: z.number(),
            })
        ),
    }),
    handler: async () => {
        const pools = Object.entries(LIQUIDITY_POOLS).map(([id, pool]) => ({
            id,
            name: pool.name,
            network: pool.network,
            tvl: pool.tvl,
            feePercent: pool.fee * 100,
        }));

        return { pools };
    },
});

/**
 * Compare with traditional remittance
 */
export const compareRemittanceTool = createTool({
    name: "compare_remittance",
    description:
        "Compare REMIT-AI costs with traditional bank wire transfers to Korea",
    inputSchema: z.object({
        amountUsd: z.number().positive().describe("Amount in USD to compare"),
    }),
    outputSchema: z.object({
        amount: z.number(),
        traditional: z.object({
            provider: z.string(),
            fee: z.number(),
            feePercent: z.number(),
            deliveryTime: z.string(),
            finalAmountKrw: z.number(),
        }),
        remitai: z.object({
            provider: z.string(),
            fee: z.number(),
            feePercent: z.number(),
            deliveryTime: z.string(),
            finalAmountKrw: z.number(),
        }),
        savings: z.object({
            amountUsd: z.number(),
            amountKrw: z.number(),
            percentSaved: z.number(),
            timeSaved: z.string(),
        }),
    }),
    handler: async ({ amountUsd }) => {
        // Traditional wire transfer (typical bank)
        const traditionalFee = amountUsd * 0.05 + 25; // 5% + $25 fixed fee
        const traditionalFeePercent =
            ((amountUsd * 0.05 + 25) / amountUsd) * 100;
        const traditionalFinalKrw = Math.floor(
            (amountUsd - traditionalFee) * USD_KRW_RATE * 0.98
        ); // 2% worse rate

        // REMIT-AI via KRWQ
        const remitaiFee = amountUsd * 0.003 + 0.5; // 0.3% + $0.50 gas
        const remitaiFeePercent = ((amountUsd * 0.003 + 0.5) / amountUsd) * 100;
        const remitaiFinalKrw = Math.floor((amountUsd - remitaiFee) * USD_KRW_RATE);

        return {
            amount: amountUsd,
            traditional: {
                provider: "Traditional Bank Wire",
                fee: traditionalFee,
                feePercent: traditionalFeePercent,
                deliveryTime: "2-5 business days",
                finalAmountKrw: traditionalFinalKrw,
            },
            remitai: {
                provider: "REMIT-AI (via KRWQ)",
                fee: remitaiFee,
                feePercent: remitaiFeePercent,
                deliveryTime: "< 1 minute",
                finalAmountKrw: remitaiFinalKrw,
            },
            savings: {
                amountUsd: traditionalFee - remitaiFee,
                amountKrw: remitaiFinalKrw - traditionalFinalKrw,
                percentSaved:
                    ((traditionalFee - remitaiFee) / traditionalFee) * 100,
                timeSaved: "2-5 days",
            },
        };
    },
});

// Export all tools
export const krwqTools = [
    getKRWQPriceTool,
    getSwapQuoteTool,
    getLiquidityPoolsTool,
    compareRemittanceTool,
];
