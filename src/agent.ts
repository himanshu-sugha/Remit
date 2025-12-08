/**
 * REMIT-AI Agent Export
 * Main entry point for ADK CLI (adk run, adk web)
 */

import { createRemitAIAgent } from "./agents/orchestrator/agent.ts";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Export the agent function for ADK CLI
export async function agent() {
    return await createRemitAIAgent();
}

// Also export as default
export default agent;
