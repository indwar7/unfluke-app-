import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

const BackupTable = ({ backupTable }) => {
  const colorScheme = useColorScheme();
  const isDark = false;
  const styles = createStyles(isDark);

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
                    const monthData = data.yearlyData.find(x => x.month === month);
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

const createStyles = (isDark) => StyleSheet.create({
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
    color: isDark ? '#E5E7EB' : '#374151',
    marginBottom: 6,
  },
  card: {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    // borderRadius: 6,
    // borderWidth: 1,
    // borderColor: isDark ? '#374151' : '#E5E7EB',
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
    // backgroundColor: isDark ? '#1F2937' : '#F3F4F6', // light gray
    paddingVertical: 8,
    paddingHorizontal: 6,
    // borderTopWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
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
    borderColor: isDark ? '#374151' : '#E5E7EB',
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
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
    color: isDark ? '#D1D5DB' : '#374151',
    textAlign: 'center',   // ensure center
  },

  dataText: {
    fontSize: 13,
    textAlign: 'center',   // center numbers too
  },

  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
    textAlign: 'center',   // center year also
  },

  positiveText: {
    color: '#059669',
  },
  negativeText: {
    color: '#DC2626',
  },
  positiveTextDark: {
    color: '#10B981',
  },
  negativeTextDark: {
    color: '#EF4444',
  },
});

export default BackupTable;