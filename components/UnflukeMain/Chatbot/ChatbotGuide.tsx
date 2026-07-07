import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";
import {
  chatbotInfo,
  chatbotQuestions,
  chatbotQuestionsCrypto,
  chatbotGuideTabs,
} from "../Utils/common_vars";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// "Welcome to UnflukeAI" guide modal — web parity: one tab per bot the
// current market supports (NSE shows 6 incl. Youtube Bot, crypto shows 4),
// each with an intro line and tappable sample questions.
const ChatbotGuide = ({
  setChatbotGuideOpen,
  typeAndAsk,
  market = "in",
  isVisible = true,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { colors: c } = useTheme();
  const s = makeStyles(c);

  const marketKey = market === "crypto" ? "crypto" : "in";
  const tabs = chatbotGuideTabs[marketKey];
  const questionsByBot =
    marketKey === "crypto" ? chatbotQuestionsCrypto : chatbotQuestions;

  const [activeTab, setActiveTab] = React.useState(tabs[0]);
  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0]);
  }, [tabs, activeTab]);

  // Handle back button on Android
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        setChatbotGuideOpen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isVisible, setChatbotGuideOpen]);

  const handleQuestionPress = (question) => {
    typeAndAsk(question);
    setChatbotGuideOpen(false);
  };

  const handleClose = () => {
    setChatbotGuideOpen(false);
  };

  const questions = useMemo(
    () => questionsByBot[activeTab] || [],
    [questionsByBot, activeTab]
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.modalOverlay}
      >
        <View
          style={[
            s.modalContainer,
            {
              width: screenWidth * 0.92,
              maxHeight: screenHeight * 0.8,
            },
          ]}
        >
          {/* Modal Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Welcome to UnflukeAI!</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={s.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Bot tabs */}
          <View style={s.tabBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabScrollContent}
            >
              {tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[s.tab, isActive && s.tabActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[s.tabText, isActive && s.tabTextActive]}
                      numberOfLines={1}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Modal Body */}
          <ScrollView
            style={s.modalBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            <Text style={s.infoText}>{chatbotInfo[activeTab]}</Text>

            <View style={s.questionsSection}>
              {questions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={s.questionContainer}
                  onPress={() => handleQuestionPress(question)}
                  activeOpacity={0.7}
                >
                  <View style={s.questionRow}>
                    <Text style={s.bulletPoint}>•</Text>
                    <Text style={s.questionText}>{question}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={s.modalFooter}>
            <TouchableOpacity
              style={s.closeButtonFooter}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={s.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: c.surface,
      borderRadius: 16,
      maxWidth: 520,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: "bold",
      color: c.text,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    tabBar: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    tabScrollContent: {
      paddingHorizontal: 12,
      gap: 4,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: c.gold,
    },
    tabText: {
      fontSize: 13.5,
      fontWeight: "600",
      color: c.textSecondary,
    },
    tabTextActive: {
      color: c.gold,
    },
    modalBody: {
      paddingHorizontal: 20,
    },
    scrollContent: {
      paddingVertical: 18,
    },
    infoText: {
      fontSize: 15,
      lineHeight: 22,
      color: c.textSecondary,
      marginBottom: 16,
    },
    questionsSection: {
      marginTop: 4,
    },
    questionContainer: {
      marginBottom: 12,
      paddingVertical: 4,
    },
    questionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    bulletPoint: {
      fontSize: 16,
      color: c.gold,
      marginRight: 10,
      marginTop: 2,
    },
    questionText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: c.gold,
    },
    modalFooter: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    closeButtonFooter: {
      backgroundColor: c.surfaceElevated,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: "center",
    },
    closeButtonText: {
      color: c.text,
      fontSize: 15.5,
      fontWeight: "600",
    },
  });

export default ChatbotGuide;
