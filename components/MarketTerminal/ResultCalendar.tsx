/**
 * components/MarketTerminal/ResultCalendar.tsx
 * Result Calendar page (spec §5): board meetings by month, own month
 * navigation (not the shared date picker) — paged past the 500-row cap.
 *
 * The backend has no "truncated" flag: a month is fully loaded once a page
 * comes back with fewer than 500 rows, so `usePagedBoardMeetings` below just
 * keeps requesting with an increasing `skip` until that happens.
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useBoardMeetings } from "../../hooks/useMarketTerminal";
import { GenericTable, type Column } from "./GenericTable";

const PAGE_SIZE = 500;

function usePagedBoardMeetings(from: string, to: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [done, setDone] = useState(false);
  // Tracks the highest `skip` already appended to `rows`, so a refetch/retry
  // of the same page (React Query can hand back a new `data` reference for
  // an unchanged page) doesn't append its rows a second time.
  const appliedSkip = useRef(-1);

  useEffect(() => {
    setRows([]);
    setSkip(0);
    setDone(false);
    appliedSkip.current = -1;
  }, [from, to]);

  const page = useBoardMeetings(from, to, PAGE_SIZE, skip);
  const pageRows: any[] = Array.isArray(page.data) ? page.data : Array.isArray(page.data?.rows) ? page.data.rows : [];

  useEffect(() => {
    if (!page.data || appliedSkip.current === skip) return;
    appliedSkip.current = skip;
    setRows((prev) => (skip === 0 ? pageRows : [...prev, ...pageRows]));
    if (pageRows.length < PAGE_SIZE) {
      setDone(true);
    } else {
      setSkip((s) => s + PAGE_SIZE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.data, skip]);

  return { rows, isLoading: page.isLoading || (!done && skip === 0), isError: page.isError };
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", flex: 1.2 },
  { key: "purpose", label: "Purpose", flex: 1.8 },
  { key: "meetingDate", label: "Date", flex: 1, format: (v) => (typeof v === "string" ? v.slice(0, 10) : v ?? "—") },
];

export default function ResultCalendar() {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const meetings = usePagedBoardMeetings(from, to);
  const rows = meetings.rows;

  const shift = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Result Calendar</Text>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => shift(-1)} style={styles.navBtn}><ChevronLeft size={18} color={c.text} /></TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={() => shift(1)} style={styles.navBtn}><ChevronRight size={18} color={c.text} /></TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <GenericTable rows={rows} columns={COLUMNS} c={c} isLoading={meetings.isLoading} isError={meetings.isError} emptyLabel="No board meetings this month." />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: "700", color: c.text, marginBottom: 14 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 },
  navBtn: { padding: 8, borderRadius: 8, backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border },
  monthLabel: { fontSize: 15, fontWeight: "700", color: c.text, width: 150, textAlign: "center" },
  list: { flex: 1 },
  listContent: { flexGrow: 1, backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.border },
});
