// Production constants
export const PRODUCTION_CLERK_BASE_URL = "https://clerk.darbot-coder.com"
export const PRODUCTION_DARBOT_CODE_API_URL = "https://app.darbot-coder.com"

// Functions with environment variable fallbacks
export const getClerkBaseUrl = () => process.env.CLERK_BASE_URL || PRODUCTION_CLERK_BASE_URL
export const getDarbotCodeApiUrl = () => process.env.DARBOT_CODE_API_URL || PRODUCTION_DARBOT_CODE_API_URL
