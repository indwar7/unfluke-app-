import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/constants/ThemeContext';

const MessageModal = ({ message, setResultsMessage }) => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  // Function to strip HTML tags for basic text display
  const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };

  // Check if message contains HTML tags
  const containsHtml = /<[^>]*>/.test(message);

  const handleClose = () => {
    setResultsMessage("");
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Message
            </Text>
          </View>

          {/* Modal Body */}
          <View style={styles.body}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollView}
            >
              {containsHtml ? (
                <WebView
                  source={{ html: `
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-size: 16px;
                            line-height: 1.5;
                            color: ${c.text};
                            background-color: ${c.card};
                            margin: 0;
                            padding: 16px;
                          }
                        </style>
                      </head>
                      <body>${message}</body>
                    </html>
                  ` }}
                  style={styles.webView}
                  scalesPageToFit={false}
                />
              ) : (
                // Option 2: Display as plain text if no HTML
                <Text style={styles.messageText}>
                  {stripHtml(message)}
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Modal Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (c, isDark) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: c.card,
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    minHeight: 100,
    maxHeight: 400,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: c.textSecondary,
  },
  webView: {
    flex: 1,
    minHeight: 150,
    backgroundColor: c.card,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: c.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: c.surfaceElevated,
  },
  buttonText: {
    color: c.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MessageModal;