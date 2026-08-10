// Centralized configuration helper for accessing environment variables
// Works across development (Expo Go) and production (APK/EAS builds)

import Constants from 'expo-constants';

// Hardcoded fallback values - these will be used if environment variables aren't found
const FALLBACK_CONFIG = {
    BACKEND_URL: 'https://api.unfluke.in',
    PUBLIC_URL: 'https://unfluke.in',
    REACT_APP_CHATBOT_URL: 'https://edbot.unfluke.in',
    REACT_APP_CHATBOT_TOKEN: 'ELRIKHJDFOIPJGHER9567802B43J9M5703459-BH78JM34589067',
    DEFAULT_AUTH: 'jwt',
    GA_ID: 'G-TXPTX3V04',
    // Google Sign-In OAuth client IDs. These are PUBLIC values (they ship in the
    // web bundle too) — there is no client secret anywhere in this flow.
    //
    // The backend verifies every ID token against an allowlist of accepted
    // audiences (its GOOGLE_CLIENT_IDS env var). The Web client ID below is
    // already allowlisted, and Android ID tokens carry it as their `aud` because
    // we pass it as `webClientId` — so Android needs no backend change.
    //
    // iOS ID tokens carry the iOS client ID as their `aud` instead, so the iOS
    // client ID MUST be appended to the backend's GOOGLE_CLIENT_IDS or every iOS
    // sign-in fails with 401 "Google sign-in failed. Please try again.".
    //
    // Now that GOOGLE_IOS_CLIENT_ID is set, googleAuth.ts reports iOS as
    // configured and renders the button — so the backend allowlist has to
    // include the iOS ID below before any iOS build ships. To disable the
    // button again (e.g. to unblock a release), set this back to ''.
    GOOGLE_WEB_CLIENT_ID: '1033885854116-ac9a96oua280itad1aq252958jk95une.apps.googleusercontent.com',
    GOOGLE_IOS_CLIENT_ID: '1033885854116-s1a5uj4362bau46b3ug1577m34p0krvn.apps.googleusercontent.com',
};

// Helper function to get config value with fallbacks
const getConfigValue = (key) => {
    // Try expo-constants expoConfig (development)
    try {
        if (Constants.expoConfig?.extra?.[key]) {
            return Constants.expoConfig.extra[key];
        }
    } catch (_e) {
        // expoConfig not available
    }
    
    // Try manifest2 for EAS builds
    try {
        if (Constants.manifest2?.extra?.expoClient?.extra?.[key]) {
            return Constants.manifest2.extra.expoClient.extra[key];
        }
    } catch (_e) {
        // manifest2 not available
    }
    
    // Try manifest for older/classic builds
    try {
        if (Constants.manifest?.extra?.[key]) {
            return Constants.manifest.extra[key];
        }
    } catch (_e) {
        // manifest not available
    }
    
    // Return hardcoded fallback - this ensures APK builds always work
    return FALLBACK_CONFIG[key] || '';
};

// Export all config values with their fallbacks
export const Config = {
    BACKEND_URL: getConfigValue('BACKEND_URL'),
    PUBLIC_URL: getConfigValue('PUBLIC_URL'),
    REACT_APP_CHATBOT_URL: getConfigValue('REACT_APP_CHATBOT_URL'),
    REACT_APP_CHATBOT_TOKEN: getConfigValue('REACT_APP_CHATBOT_TOKEN'),
    DEFAULT_AUTH: getConfigValue('DEFAULT_AUTH'),
    GA_ID: getConfigValue('GA_ID'),
    GOOGLE_WEB_CLIENT_ID: getConfigValue('GOOGLE_WEB_CLIENT_ID'),
    GOOGLE_IOS_CLIENT_ID: getConfigValue('GOOGLE_IOS_CLIENT_ID'),
};

// Always log configuration for debugging (works in both dev and production)
console.log('=== App Configuration ===');
console.log('BACKEND_URL:', Config.BACKEND_URL);
console.log('PUBLIC_URL:', Config.PUBLIC_URL);
console.log('REACT_APP_CHATBOT_URL:', Config.REACT_APP_CHATBOT_URL);
console.log('=========================');

export default Config;
