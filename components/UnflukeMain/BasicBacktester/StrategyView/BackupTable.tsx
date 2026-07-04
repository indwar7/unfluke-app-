import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useTheme } from "@/constants/ThemeContext";

const BackupTable = ({ backupTable }) => {
  const { colors: c, isDark } = useTheme();
  const styles = createStyles(c, isDark);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatNumber = (value) => {
    const num = parseInt(value);
    return num.toLocaleString('en-IN');
  };

  const getTextColor = (value) => {
    const num = parseInt(value);
    if (num < 0) {
      return isDark ? styles.negativeTextDark : styles.negativeText;
    } else {
      return isDark ? styles.positiveTextDark : styles.positiveText;
    }
  };

  const renderHeaderCell = (content, isFirst = false) => (
    <View style={[styles.headerCell, isFirst && styles.firstHeaderCell]}>
      <Text style={styles.headerText}>{content}</Text>
    </View>
  );

  const renderDataCell = (content, style = {}, isFirst = false) => (
    <View style={[styles.dataCell, isFirst && styles.firstDataCell]}>
      <Text style={[styles.dataText, style]}>{content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Monthly Backup</Text>
      </View>

      {/* Table Card */}
      <View style={styles.card}>
        <View style={styles.cardBody}>
          {/* Horizontal ScrollView for table overflow */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableRow}>
                {renderHeaderCell('unfluke.in', true)}
                {months.map((month, idx) => (
                  <View key={`header-${month}-${idx}`} style={[styles.headerCell]}>
                    <Text style={styles.headerText}>{month}</Text>
                  </View>
                ))}
                {renderHeaderCell('Total')}
                {renderHeaderCell('MDD')}
              </View>

              {/* Table Body */}
              {backupTable && backupTable.map((data, rowIdx) => (
                <View key={`row-${data.year}-${rowIdx}`} style={styles.tableRow}>
                  {/* Year Cell */}
                  {renderDataCell(data.year, styles.yearText, true)}

                  {/* Monthly Data Cells */}
                  {months.map((month, monthIdx) => {
                    const monthData = (data.yearlyData || []).find(x => x.month === month);
                    const pnl = monthData ? parseInt(monthData.totalPnl) : 0;

                    return (
                      <View key={`data-${data.year}-${month}-${monthIdx}`} style={[styles.dataCell]}>
                        <Text style={[styles.dataText, getTextColor(pnl)]}>
                          {formatNumber(pnl)}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Yearly Total Cell */}
                  {renderDataCell(
                    formatNumber(data.yearlyPnl),
                    getTextColor(data.yearlyPnl)
                  )}

                  {/* MDD Cell */}
                  {renderDataCell(
                    formatNumber(data.MDD),
                    getTextColor(data.MDD)
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const createStyles = (c, isDark) => StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    marginBottom: 6,
  },
  card: {
    backgroundColor: c.card,
    // borderRadius: 6,
    // borderWidth: 1,
    // borderColor: c.border,
  },
  cardBody: {
    padding: 0,
  },
  table: {
    minWidth: '100%',
  },
  tableRow: {
    flexDirection: 'row',
  },
  headerCell: {
    // backgroundColor: c.surfaceElevated, // light gray
    paddingVertical: 8,
    paddingHorizontal: 6,
    // borderTopWidth: 1,
    borderColor: c.border,
    minWidth: 80,
    flex: 1,
  },
  firstHeaderCell: {
    minWidth: 80,
    flex: 1.5,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  dataCell: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderColor: c.border,
    backgroundColor: c.card,
    minWidth: 80,
    flex: 1,
  },
  firstDataCell: {
    minWidth: 80,
    flex: 1.5,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: c.textSecondary,
    textAlign: 'center',   // ensure center
  },

  dataText: {
    fontSize: 13,
    textAlign: 'center',   // center numbers too
  },

  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',   // center year also
  },

  positiveText: {
    color: c.profit,
  },
  negativeText: {
    color: c.loss,
  },
  positiveTextDark: {
    color: c.profit,
  },
  negativeTextDark: {
    color: c.loss,
  },
});

export default BackupTable;