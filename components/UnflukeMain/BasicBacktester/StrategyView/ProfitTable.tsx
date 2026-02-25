import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ProfitTable = (props) => {
  const {
    strategyDataFromCSV,
    downloadUrl,
    downloadUrl1,
    downloadUrl2,
    advancedBacktester,
    slippage,
  } = props;

  const colorScheme = useColorScheme();
  const isDark = false;
  const styles = createStyles(isDark);

  // Handle file download for React Native
  const handleDownload = async (url, filename) => {
    try {
      if (!url) return;

      // Show loading state
      Alert.alert('Downloading', 'Please wait while we download your file...');

      // Download the file
      const fileUri = FileSystem.documentDirectory + filename;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          'Download Complete',
          `File saved to: ${uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'There was an error downloading the file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Generate filename based on slippage
  const getFilename = (slippageType) => {
    const timestamp = new Date().toISOString().split('T')[0];
    switch (slippageType) {
      case 'no-slippage':
        return `strategy_data_${timestamp}.csv`;
      case '0.5-slippage':
        return `strategy_data_0.5_slippage_${timestamp}.csv`;
      case '1-slippage':
        return `strategy_data_1_slippage_${timestamp}.csv`;
      default:
        return `strategy_data_${timestamp}.csv`;
    }
  };

  const DownloadButton = ({ url, title, slippageType }) => {
    if (!url) return null;

    return (
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleDownload(url, getFilename(slippageType))}
        activeOpacity={0.7}
      >
        <Text style={styles.downloadButtonText}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.buttonContainer}>
            <DownloadButton
              url={downloadUrl}
              title="Download CSV file without slippage"
              slippageType="no-slippage"
            />

            <DownloadButton
              url={downloadUrl1}
              title="Download CSV file with 0.5% slippage"
              slippageType="0.5-slippage"
            />

            <DownloadButton
              url={downloadUrl2}
              title="Download CSV file with 1% slippage"
              slippageType="1-slippage"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (isDark) => StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderRadius: 8,
    // Removed border to match border-0 class
  },
  cardHeader: {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  downloadButton: {
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    // Hover effect simulation with shadow
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  downloadButtonText: {
    color: isDark ? '#60A5FA' : '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default ProfitTable;