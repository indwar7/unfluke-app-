/**
 * components/MarketTerminal/MarketDatePicker.tsx
 *
 * Date-only picker for Market Terminal pages, plus the closed-day fallback
 * banner (spec §4.2): the backend resolves any picked date to the last real
 * trading session (§3.1), so the client just needs to compare requestedDate
 * vs. the date actually returned and show a notice when they differ.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const FLOOR_DATE = new Date(2020, 0, 1); // spec §6: snapshot features earliest 2020-01-01

export function MarketDatePicker({
  date,
  onChange,
}: {
  date: string | undefined; // "YYYY-MM-DD", undefined = latest
  onChange: (date: string | undefined) => void;
}) {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  const [visible, setVisible] = useState(false);

  const label = date ? moment(date).format("DD MMM YYYY") : "Latest";

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
      {date && (
        <TouchableOpacity style={styles.liveButton} onPress={() => onChange(undefined)}>
          <Text style={styles.liveText}>Go live</Text>
        </TouchableOpacity>
      )}
      <DateTimePickerModal
        isVisible={visible}
        mode="date"
        date={date ? new Date(date) : new Date()}
        minimumDate={FLOOR_DATE}
        maximumDate={new Date()}
        onConfirm={(d) => {
          setVisible(false);
          onChange(moment(d).format("YYYY-MM-DD"));
        }}
        onCancel={() => setVisible(false)}
      />
    </View>
  );
}

/** Amber notice: "no data for X — showing Y, the last trading day." */
export function DateNotice({ requestedDate, actualDate }: { requestedDate?: string; actualDate?: string }) {
  const { colors: c } = useTheme();
  const styles = makeStyles(c);
  // actualDate often comes straight off the API response, which some
  // endpoints return as a full ISO timestamp rather than a bare
  // YYYY-MM-DD — slice both sides so a same-day match doesn't fire this
  // banner just because of timestamp vs. date-only formatting.
  const requested = requestedDate?.slice(0, 10);
  const actual = actualDate?.slice(0, 10);
  if (!requested || !actual || requested === actual) return null;
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        No data for {moment(requestedDate).format("DD MMM YYYY")} — showing{" "}
        {moment(actualDate).format("DD MMM YYYY")}, the last trading day.
      </Text>
    </View>
  );
}

const makeStyles = (c: AppColors) => StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  button: {
    backgroundColor: c.surfaceElevated, borderRadius: 6, borderWidth: 1, borderColor: c.border,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  label: { color: c.text, fontSize: 13, fontWeight: "600" },
  liveButton: {
    backgroundColor: c.goldLight, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8,
  },
  liveText: { color: c.gold, fontSize: 12, fontWeight: "700" },
  notice: {
    backgroundColor: c.warningLight, borderRadius: 8, padding: 10, marginBottom: 12,
  },
  noticeText: { color: c.warning, fontSize: 12 },
});
