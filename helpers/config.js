// Centralized configuration helper for accessing environment variables
// Works across development (Expo Go) and production (APK/EAS builds)

import Constants from 'expo-constants';

// Hardcoded fallback values - these will be used if environment variables aren't found
const FALLBACK_CONFIG = {
    BACKEND_URL: 'https://api.unfluke.in',
    PUBLIC_URL: 'http://www.unfluke.in',
    REACT_APP_CHATBOT_URL: 'http://34.124.230.132',
    REACT_APP_CHATBOT_TOKEN: 'ELRIKHJDFOIPJGHER9567802B43J9M5703459-BH78JM34589067',
    DEFAULT_AUTH: 'jwt',
    GA_ID: 'G-TXPTX3V04',
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
};

// Always log configuration for debugging (works in both dev and production)
console.log('=== App Configuration ===');
console.log('BACKEND_URL:', Config.BACKEND_URL);
console.log('PUBLIC_URL:', Config.PUBLIC_URL);
console.log('REACT_APP_CHATBOT_URL:', Config.REACT_APP_CHATBOT_URL);
console.log('=========================');

export default Config;
