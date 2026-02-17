import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import {
  useCapcode,
  useCompany,
  useFinancials,
  getPeriodKeys,
  getSectionDataForPeriod,
  getHeadings,
  formatPeriodLabel,
  getMergedRatioData,
  getRatioPeriodKeys,
  getMergedRatioHeadings,
} from "../hooks/useFundamentalData";
import { StockType } from "../api/unfluke";

const { width } = Dimensions.get("window");

const SECTIONS = [
  "Balance Sheet",
  "Profit & Loss",
  "Cash Flow",
  "Quarterly Results",
  "Key Ratios",
] as const;

type SectionType = typeof SECTIONS[number];

// ─── Dropdown Picker ─────────────────────────────────────
const DropdownPicker = ({
  items,
  selected,
  onSelect,
  formatLabel,
  placeholder,
  compact,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  formatLabel?: (item: string) => string;
  placeholder?: string;
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const label = selected
    ? formatLabel
      ? formatLabel(selected)
      : selected
    : placeholder || "Select";

  return (
    <View>
      <TouchableOpacity
        style={[styles.dropdown, compact && styles.dropdownCompact]}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[styles.dropdownText, compact && styles.dropdownTextCompact]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Ionicons name="chevron-down" size={compact ? 14 : 16} color="#555" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {placeholder || "Select Option"}
            </Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item === selected && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === selected && styles.modalItemTextSelected,
                    ]}
                  >
                    {formatLabel ? formatLabel(item) : item}
                  </Text>
                  {item === selected && (
                    <Ionicons name="checkmark" size={20} color="#6C5CE7" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Section Group Card ──────────────────────────────────
const SectionGroupCard = ({
  heading,
  children,
  data,
}: {
  heading: string;
  children?: string[];
  data: Record<string, any>;
}) => {
  const headingVal = data[heading];

  return (
    <View style={styles.groupCard}>
      {/* Header row */}
      <View style={styles.groupRow}>
        <Text style={styles.groupHeaderText}>{heading} -</Text>
        <Text style={styles.groupHeaderValue}>
          {headingVal !== undefined && headingVal !== null ? fmt(headingVal) : ""}
        </Text>
      </View>

      {/* Child rows */}
      {children &&
        children.map((child, idx) => (
          <View key={child + idx} style={styles.groupRow}>
            <Text style={styles.groupChildText}>{child}</Text>
            <Text style={styles.groupChildValue}>
              {data[child] !== undefined && data[child] !== null
                ? fmt(data[child])
                : "-"}
            </Text>
          </View>
        ))}
    </View>
  );
};

// ─── Simple Table Row (for P&L, Cash Flow, Ratios) ──────
const DataRow = ({
  label,
  value,
  isBold,
  isChild,
}: {
  label: string;
  value: string;
  isBold?: boolean;
  isChild?: boolean;
}) => (
  <View style={[styles.dataRow, isBold && styles.dataRowBold]}>
    <Text
      style={[
        styles.dataRowLabel,
        isBold && styles.boldText,
        isChild && styles.childIndent,
      ]}
      numberOfLines={2}
    >
      {label}
    </Text>
    <Text style={[styles.dataRowValue, isBold && styles.boldText]}>
      {value}
    </Text>
  </View>
);

// ─── Format Number ──────────────────────────────────────
const fmt = (val: any): string => {
  if (val === undefined || val === null) return "-";
  if (typeof val === "number") {
    if (Math.abs(val) >= 100) return val.toLocaleString("en-IN");
    return Number(val.toFixed(2)).toString();
  }
  return String(val);
};

// ─── Render Balance Sheet ────────────────────────────────
function renderBalanceSheet(
  data: Record<string, any>,
  headings: Array<{ title: string; children?: string[] }>
) {
  if (!data || Object.keys(data).length === 0) {
    return <Text style={styles.emptyText}>No data available for this period.</Text>;
  }

  return (
    <View>
      {headings.map((h, i) => (
        <SectionGroupCard
          key={h.title + i}
          heading={h.title}
          children={h.children}
          data={data}
        />
      ))}
    </View>
  );
}

// ─── Render P&L / CashFlow / Quarterly ──────────────────
function renderPLStyle(
  data: Record<string, any>,
  headings: Array<{ title: string; children?: string[] }>
) {
  if (!data || Object.keys(data).length === 0) {
    return <Text style={styles.emptyText}>No data available for this period.</Text>;
  }

  const rows: { label: string; value: string; isBold: boolean; isChild: boolean }[] = [];

  if (headings.length > 0) {
    for (const heading of headings) {
      rows.push({
        label: heading.title,
        value: fmt(data[heading.title]),
        isBold: true,
        isChild: false,
      });
      if (heading.children) {
        for (const child of heading.children) {
          rows.push({
            label: child,
            value: fmt(data[child]),
            isBold: false,
            isChild: true,
          });
        }
      }
    }
  } else {
    for (const [key, val] of Object.entries(data)) {
      rows.push({ label: key, value: fmt(val), isBold: false, isChild: false });
    }
  }

  return (
    <View style={styles.plCard}>
      {rows.map((row, i) => (
        <DataRow
          key={row.label + i}
          label={row.label}
          value={row.value}
          isBold={row.isBold}
          isChild={row.isChild}
        />
      ))}
    </View>
  );
}

// ─── Render Ratios ──────────────────────────────────────
function renderRatios(
  data: Record<string, any>,
  headings: Array<{ title: string; children?: string[] }>
) {
  if (!data || Object.keys(data).length === 0) {
    return <Text style={styles.emptyText}>No data available for this period.</Text>;
  }

  // Group by heading sections
  const sections: { title: string; items: { label: string; value: string }[] }[] = [];

  if (headings.length > 0) {
    let currentSection: { title: string; items: { label: string; value: string }[] } | null = null;

    for (const heading of headings) {
      // Start a new section for each top-level heading
      currentSection = { title: heading.title, items: [] };

      // The heading children are the ratio items
      if (heading.children && heading.children.length > 0) {
        for (const child of heading.children) {
          currentSection.items.push({ label: child, value: fmt(data[child]) });
        }
      } else {
        // If no children, all the data keys under this heading are items
        // Just list all data keys that are in the data
        for (const [key, val] of Object.entries(data)) {
          if (key !== heading.title) {
            // We'll handle this below
          }
        }
      }

      if (currentSection.items.length > 0) {
        sections.push(currentSection);
      }
    }

    // If no organized sections, fallback to flat list
    if (sections.length === 0) {
      sections.push({
        title: "Ratios",
        items: Object.entries(data).map(([k, v]) => ({ label: k, value: fmt(v) })),
      });
    }
  } else {
    sections.push({
      title: "Ratios",
      items: Object.entries(data).map(([k, v]) => ({ label: k, value: fmt(v) })),
    });
  }

  return (
    <View>
      {sections.map((section, i) => (
        <View key={section.title + i} style={styles.ratioSection}>
          <Text style={styles.ratioSectionTitle}>{section.title}</Text>
          {section.items.map((item, j) => (
            <View key={item.label + j} style={styles.ratioRow}>
              <Text style={styles.ratioLabel}>{item.label}</Text>
              <Text style={styles.ratioValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── MAIN SCREEN ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
export default function FundamentalScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<SectionType>("Balance Sheet");
  const [stockType, setStockType] = useState<StockType>("C");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery.trim().toUpperCase()), 600);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ── Data Hooks ──
  const { data: capcode, isLoading: loadingCapcode } = useCapcode(debouncedSearch);
  const { data: company, isLoading: loadingCompany } = useCompany(capcode || undefined);
  const { data: financials, isLoading: loadingFinancials } = useFinancials(
    capcode || undefined,
    stockType
  );

  // ── Reset ALL state when company (capcode) changes ──
  useEffect(() => {
    // When capcode changes, reset period, section, scroll
    setSelectedPeriod("");
    setActiveSection("Balance Sheet");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    // Invalidate all financials queries to ensure fresh data
    if (capcode) {
      queryClient.invalidateQueries({ queryKey: ["financials", capcode] });
    }
  }, [capcode]);

  // ── Reset period when stockType (C/S) changes ──
  useEffect(() => {
    setSelectedPeriod("");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stockType]);

  // ── Current section's response & period keys ──
  const currentResponse = useMemo(() => {
    if (!financials) return undefined;
    switch (activeSection) {
      case "Balance Sheet":
        return financials.balanceSheet;
      case "Profit & Loss":
        return financials.profitLoss;
      case "Cash Flow":
        return financials.cashFlow;
      case "Quarterly Results":
        return financials.quarterly;
      default:
        return undefined;
    }
  }, [financials, activeSection]);

  const periodKeys = useMemo(() => {
    if (activeSection === "Key Ratios") {
      return getRatioPeriodKeys(financials?.ratios);
    }
    return getPeriodKeys(currentResponse);
  }, [currentResponse, financials, activeSection]);



  // Auto-select latest period when period keys change or current selection is invalid
  useEffect(() => {
    if (periodKeys.length > 0) {
      if (!selectedPeriod || !periodKeys.includes(selectedPeriod)) {
        setSelectedPeriod(periodKeys[0]);
      }
    } else {
      if (selectedPeriod) setSelectedPeriod("");
    }
  }, [periodKeys, selectedPeriod]);


  const isLoading = loadingCapcode || loadingCompany || loadingFinancials;

  // ── Render section content ──
  const renderSectionContent = () => {
    if (!financials || !selectedPeriod) {
      return <Text style={styles.emptyText}>No data available.</Text>;
    }

    if (activeSection === "Balance Sheet") {
      const data = getSectionDataForPeriod(financials.balanceSheet, selectedPeriod);
      const headings = getHeadings(financials.balanceSheet);
      return renderBalanceSheet(data, headings);
    }

    if (activeSection === "Profit & Loss") {
      const data = getSectionDataForPeriod(financials.profitLoss, selectedPeriod);
      const headings = getHeadings(financials.profitLoss);
      return renderPLStyle(data, headings);
    }

    if (activeSection === "Cash Flow") {
      const data = getSectionDataForPeriod(financials.cashFlow, selectedPeriod);
      const headings = getHeadings(financials.cashFlow);
      return renderPLStyle(data, headings);
    }

    if (activeSection === "Quarterly Results") {
      const data = getSectionDataForPeriod(financials.quarterly, selectedPeriod);
      const headings = getHeadings(financials.quarterly);
      return renderPLStyle(data, headings);
    }

    if (activeSection === "Key Ratios") {
      const data = getMergedRatioData(financials.ratios, selectedPeriod);
      const headings = getMergedRatioHeadings(financials.ratios);
      return renderRatios(data, headings);
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>
          Fundamental Screener{" "}
          <Text style={styles.sectionNameHighlight}>({activeSection})</Text>
        </Text>
        <Text style={styles.subTitle}>Get all your summary at one place</Text>
      </View>

      {/* ── Search + Period Row ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Company"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
            placeholderTextColor="#bbb"
          />
        </View>

        {periodKeys.length > 0 && (
          <DropdownPicker
            items={periodKeys}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
            formatLabel={formatPeriodLabel}
            placeholder="Year"
            compact
          />
        )}
      </View>

      {/* ── Section Tabs (horizontal scroll) ── */}
      <View style={styles.sectionTabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabScroll}
        >
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section}
              style={[
                styles.sectionTab,
                activeSection === section && styles.sectionTabActive,
              ]}
              onPress={() => {
                setActiveSection(section);
                scrollRef.current?.scrollTo({ y: 0, animated: false });
              }}
            >
              <Text
                style={[
                  styles.sectionTabText,
                  activeSection === section && styles.sectionTabTextActive,
                ]}
              >
                {section}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Consolidated / Standalone toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, stockType === "C" && styles.typeBtnActive]}
            onPress={() => setStockType("C")}
          >
            <Text
              style={[
                styles.typeText,
                stockType === "C" && styles.typeTextActive,
              ]}
            >
              C
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, stockType === "S" && styles.typeBtnActive]}
            onPress={() => setStockType("S")}
          >
            <Text
              style={[
                styles.typeText,
                stockType === "S" && styles.typeTextActive,
              ]}
            >
              S
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.loadingText}>Fetching data...</Text>
        </View>
      ) : company ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderSectionContent()}
        </ScrollView>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={48} color="#ddd" />
          <Text style={styles.placeholderText}>
            {debouncedSearch
              ? "Company not found"
              : "Search for a company to view fundamentals"}
          </Text>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// ─── STYLES ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const ACCENT = "#6C5CE7";
const BG = "#FAFBFC";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header ──
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 12,
  },
  iconBtn: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  sectionNameHighlight: {
    color: ACCENT,
    fontWeight: "700",
  },
  subTitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 8,
  },

  // ── Search Row ──
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#E8E9EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
  },

  // ── Dropdown ──
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: "#E8E9EB",
    gap: 6,
  },
  dropdownCompact: {
    paddingHorizontal: 12,
    height: 42,
    minWidth: 80,
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  dropdownTextCompact: {
    fontSize: 14,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: width * 0.8,
    maxHeight: 500,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelected: {
    backgroundColor: "#F8F7FF",
    borderRadius: 8,
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalItemTextSelected: {
    color: ACCENT,
    fontWeight: "600",
  },

  // ── Section Tabs ──
  sectionTabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingLeft: 20,
  },
  sectionTabScroll: {
    paddingRight: 12,
  },
  sectionTab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  sectionTabActive: {
    borderBottomColor: ACCENT,
  },
  sectionTabText: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  sectionTabTextActive: {
    color: ACCENT,
    fontWeight: "600",
  },

  // ── Type Toggle ──
  typeToggle: {
    flexDirection: "row",
    marginRight: 16,
    marginLeft: 4,
    backgroundColor: "#F4F5F7",
    borderRadius: 6,
    padding: 2,
  },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  typeBtnActive: {
    backgroundColor: ACCENT,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  typeTextActive: {
    color: "#fff",
  },

  // ── Center / Loading ──
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#888",
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyText: {
    padding: 32,
    textAlign: "center",
    color: "#999",
    fontSize: 15,
  },

  // ── Scroll Content ──
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },

  // ── Balance Sheet Group Cards ──
  groupCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  groupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  groupHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  groupHeaderValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "right",
  },
  groupChildText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
    paddingLeft: 8,
  },
  groupChildValue: {
    fontSize: 14,
    color: "#444",
    textAlign: "right",
    fontWeight: "500",
  },

  // ── P&L Style Card ──
  plCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  dataRowBold: {
    backgroundColor: "#FAFBFC",
  },
  dataRowLabel: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  dataRowValue: {
    fontSize: 14,
    color: "#1a1a1a",
    textAlign: "right",
    fontWeight: "500",
    minWidth: 80,
  },
  boldText: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  childIndent: {
    paddingLeft: 16,
    color: "#666",
  },

  // ── Ratios ──
  ratioSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ratioSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEFF",
    backgroundColor: "#FAFAFF",
  },
  ratioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  ratioLabel: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  ratioValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
    textAlign: "right",
    minWidth: 80,
  },
});