import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';

const MessageModal = ({ message, setResultsMessage }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
        <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
          {/* Modal Header */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
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
                            color: ${isDark ? '#FFFFFF' : '#000000'};
                            background-color: ${isDark ? '#374151' : '#FFFFFF'};
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
                <Text style={[styles.messageText, isDark && styles.messageTextDark]}>
                  {stripHtml(message)}
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Modal Footer */}
          <View style={[styles.footer, isDark && styles.footerDark]}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContainerDark: {
    backgroundColor: '#374151',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerDark: {
    borderBottomColor: '#4B5563',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  headerTitleDark: {
    color: '#FFFFFF',
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
    color: '#374151',
  },
  messageTextDark: {
    color: '#D1D5DB',
  },
  webView: {
    flex: 1,
    minHeight: 150,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerDark: {
    borderTopColor: '#4B5563',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MessageModal;