// Tab order — EXACT order required, never change
export const SECTIONS = [
    "Balance Sheet",
    "Profit & Loss",
    "Cash Flow",
    "Quarterly Results",
    "Key Ratios",
    "Charts",
    "Bulk and Block Deals",
    "Corporate Events",
    "Shareholding Patterns",
    "Documents",
] as const;

export type SectionType = typeof SECTIONS[number];

// ─── Color Palette (matching unfluke.in website) ───────
export const ACCENT = "#1A1A2E";       // Primary dark navy
export const ACCENT_LIGHT = "#F1F5F9"; // Light border bg
export const BG = "#F7F7F8";           // Page background
export const CARD_BG = "#FFFFFF";      // Card background
export const GREEN = "#059669";        // Positive values
export const RED = "#DC2626";          // Negative values
export const TEXT_PRIMARY = "#0F172A";
export const TEXT_SECONDARY = "#64748B";
export const TEXT_MUTED = "#94A3B8";
export const BORDER_COLOR = "#E2E8F0";
export const ZEBRA_LIGHT = "#F8FAFC";
export const ZEBRA_DARK = "#F1F5F9";

// Dark theme colors (for tables, matching website)
export const DARK_BG = "#0B0E1A";
export const DARK_CARD = "#13162A";
export const DARK_ZEBRA = "#1A1D2E";
export const DARK_TEXT = "#E5E7EB";
export const DARK_BORDER = "#2A2D3E";

// Format numbers for display
export const fmt = (val: any): string => {
    if (val === undefined || val === null || val === "") return "-";
    if (typeof val === "number") {
        if (isNaN(val)) return "-";
        if (Math.abs(val) >= 100) return val.toLocaleString("en-IN");
        return Number(val.toFixed(2)).toString();
    }
    const num = parseFloat(String(val));
    if (!isNaN(num)) {
        if (Math.abs(num) >= 100) return num.toLocaleString("en-IN");
        return Number(num.toFixed(2)).toString();
    }
    return String(val);
};

// Determine color based on value (green for positive, red for negative)
export const valueColor = (val: any): string => {
    if (val === undefined || val === null) return TEXT_PRIMARY;
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return TEXT_PRIMARY;
    if (num > 0) return GREEN;
    if (num < 0) return RED;
    return TEXT_PRIMARY;
};

// Badge colors for event types
export const EVENT_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
    Dividends: { bg: "#DCFCE7", text: "#166534" },
    Bonus: { bg: "#FEF3C7", text: "#92400E" },
    StockSplit: { bg: "#E0E7FF", text: "#3730A3" },
    InsiderTrading: { bg: "#FCE7F3", text: "#9D174D" },
    default: { bg: "#F3F4F6", text: "#374151" },
};

// Chart colors
export const CHART_COLORS = {
    primary: "#1A1A2E",
    secondary: "#8B5CF6",
    tertiary: "#06B6D4",
    quaternary: "#F59E0B",
    line: "#6366F1",
    bar: "#8B5CF6",
    area: "rgba(99, 102, 241, 0.15)",
};

// Shareholding pie colors
export const SHAREHOLDING_COLORS = {
    Promoter: "#1A1A2E",
    FII: "#EF4444",
    DII: "#F59E0B",
    Public: "#22C55E",
    Others: "#94A3B8",
};
