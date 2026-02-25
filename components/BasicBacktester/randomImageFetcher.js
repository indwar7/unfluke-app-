// Replaced SVG imports with icon-based placeholders to avoid metro SVG crash.
// React Native cannot import .svg files without react-native-svg-transformer.
// Cards now render a colored icon background instead.

const CARD_CONFIGS = [
    { bg: '#EFF6FF', icon: 'bar-chart', color: '#3B82F6' },
    { bg: '#F0FDF4', icon: 'trending-up', color: '#10B981' },
    { bg: '#FFF7ED', icon: 'cash', color: '#F59E0B' },
    { bg: '#FDF2F8', icon: 'pie-chart', color: '#EC4899' },
    { bg: '#F5F3FF', icon: 'stats-chart', color: '#8B5CF6' },
    { bg: '#ECFDF5', icon: 'arrow-up-circle', color: '#059669' },
    { bg: '#FEF3C7', icon: 'analytics', color: '#D97706' },
    { bg: '#E0F2FE', icon: 'pulse', color: '#0284C7' },
    { bg: '#FCE7F3', icon: 'ribbon', color: '#DB2777' },
    { bg: '#F0FDF4', icon: 'checkmark-circle', color: '#16A34A' },
    { bg: '#FFF1F2', icon: 'flame', color: '#E11D48' },
    { bg: '#F5F3FF', icon: 'diamond', color: '#7C3AED' },
    { bg: '#ECFEFF', icon: 'swap-horizontal', color: '#0891B2' },
    { bg: '#FFF7ED', icon: 'options', color: '#EA580C' },
    { bg: '#F0FDF4', icon: 'leaf', color: '#15803D' },
    { bg: '#EFF6FF', icon: 'globe', color: '#1D4ED8' },
    { bg: '#FDF4FF', icon: 'layers', color: '#9333EA' },
    { bg: '#FFF1F2', icon: 'arrow-down-circle', color: '#BE123C' },
    { bg: '#F0FDF4', icon: 'trending-up', color: '#166534' },
    { bg: '#FEFCE8', icon: 'star', color: '#CA8A04' },
    { bg: '#F5F3FF', icon: 'rocket', color: '#6D28D9' },
    { bg: '#F0F9FF', icon: 'water', color: '#0369A1' },
    { bg: '#FFF8F1', icon: 'film', color: '#9A3412' },
    { bg: '#F5F3FF', icon: 'options-outline', color: '#4F46E5' },
    { bg: '#F0FDF4', icon: 'list', color: '#14532D' },
    { bg: '#EFF6FF', icon: 'checkmark-done', color: '#2563EB' },
    { bg: '#F0FDF4', icon: 'checkmark-done-circle', color: '#15803D' },
    { bg: '#FFF7ED', icon: 'cash-outline', color: '#B45309' },
    { bg: '#FDF2F8', icon: 'bar-chart-outline', color: '#9D174D' },
    { bg: '#F0FDF4', icon: 'arrow-down', color: '#065F46' },
    { bg: '#F5F3FF', icon: 'chevron-up-circle', color: '#5B21B6' },
    { bg: '#EFF6FF', icon: 'business', color: '#1E40AF' },
    { bg: '#FFF7ED', icon: 'cash', color: '#92400E' },
    { bg: '#F0FDF4', icon: 'leaf-outline', color: '#064E3B' },
    { bg: '#FEF2F2', icon: 'trending-down', color: '#991B1B' },
];

/**
 * Returns a config object { bg, icon, color } for a given index.
 * Use this to render a colored View + Ionicons instead of an Image.
 */
export const fetchRandomImage = (i) => {
    const idx = i % CARD_CONFIGS.length;
    return CARD_CONFIGS[idx];
};