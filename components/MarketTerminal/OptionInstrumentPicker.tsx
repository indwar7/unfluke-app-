/**
 * components/MarketTerminal/OptionInstrumentPicker.tsx
 *
 * Shared instrument + expiry picker for the Option Mastery screens
 * (doc3.md §1.1) — backed by the same Option Simulator endpoints the web
 * Option Chain already uses: getOptionNames + getOptionsExpiryDateList.
 * expiry values from that endpoint are "DD-MMM-YY" (e.g. "01-Sep-26").
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";
import { useOptionNames, useOptionsExpiryDateList } from "../../hooks/useMarketTerminal";

export function useOptionInstrumentPicker(optionType: string = "CE - Call") {
  const userId = useSelector((state: any) => state?.Login?.user?._id ?? "");

  const names = useOptionNames();
  const nameList: string[] = (Array.isArray(names.data) ? names.data : Array.isArray(names.data?.rows) ? names.data.rows : [])
    .map((n: any) => (typeof n === "string" ? n : n?.name))
    .filter(Boolean);

  const [name, setName] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!name && nameList.length) setName(nameList.includes("NIFTY") ? "NIFTY" : nameList[0]);
  }, [nameList, name]);

  const expiries = useOptionsExpiryDateList(name ?? "", optionType, userId);
  const expiryList: string[] = (expiries.data?.expiry_date ?? []).map((e: any) => e?.to_expiry).filter(Boolean);

  const [expiry, setExpiry] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!expiry && expiryList.length) setExpiry(expiryList[0]);
  }, [expiryList, expiry]);

  return {
    name, setName: (n: string) => { setName(n); setExpiry(undefined); },
    expiry, setExpiry,
    nameList, expiryList,
    isLoading: names.isLoading || expiries.isLoading,
  };
}

export function OptionInstrumentPickerRow({
  nameList, name, onNameChange, expiryList, expiry, onExpiryChange,
}: {
  nameList: string[]; name?: string; onNameChange: (n: string) => void;
  expiryList: string[]; expiry?: string; onExpiryChange: (e: string) => void;
}) {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);

  return (
    <>
      {nameList.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
          {nameList.map((n) => (
            <TouchableOpacity key={n} style={[styles.chip, name === n && styles.chipActive]} onPress={() => onNameChange(n)}>
              <Text style={[styles.chipText, name === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.loadingText}>Loading instruments…</Text>
      )}
      {name && expiryList.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
          {expiryList.map((e) => (
            <TouchableOpacity key={e} style={[styles.chip, expiry === e && styles.chipActive]} onPress={() => onExpiryChange(e)}>
              <Text style={[styles.chipText, expiry === e && styles.chipTextActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  pickerRow: { flexGrow: 0, marginBottom: 10 },
  pickerRowContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border,
  },
  chipActive: { backgroundColor: c.goldLight, borderColor: c.gold },
  chipText: { color: c.textSecondary, fontSize: 12.5, fontWeight: "600" },
  chipTextActive: { color: c.gold },
  loadingText: { fontSize: 12, color: c.textMuted, marginBottom: 10 },
});
