/**
 * components/MarketTerminal/TradingCalendar.tsx
 * Trading Calendar page (spec §5): /holidays?segment=CM&year=.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useHolidays } from "../../hooks/useMarketTerminal";
import { GenericTable, isoDateFormat, type Column } from "./GenericTable";

const COLUMNS: Column[] = [
  { key: "date", label: "Date", flex: 1, format: isoDateFormat },
  { key: "description", label: "Description", flex: 1.6 },
  { key: "type", label: "Type", flex: 1 },
];

export default function TradingCalendar() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [year, setYear] = useState(new Date().getFullYear());

  const holidays = useHolidays("CM", year);
  const rows: any[] = Array.isArray(holidays.data) ? holidays.data : Array.isArray(holidays.data?.rows) ? holidays.data.rows : [];

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Trading Calendar</Text>

      <View style={styles.yearNav}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)} style={styles.navBtn}><ChevronLeft size={18} color={c.text} /></TouchableOpacity>
        <Text style={styles.yearLabel}>{year}</Text>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)} style={styles.navBtn}><ChevronRight size={18} color={c.text} /></TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={holidays.isLoading} isError={holidays.isError} emptyLabel="No holidays on record for this year." />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  yearNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 },
  navBtn: { padding: 8, borderRadius: 8, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border },
  yearLabel: { fontSize: 15, fontWeight: "700", color: c.text, width: 60, textAlign: "center" },
  list: { flex: 1 },
  listContent: { flexGrow: 1, backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
});
