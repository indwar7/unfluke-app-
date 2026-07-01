import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  useWindowDimensions,
} from "react-native";
import { X } from "lucide-react-native";
import {
  chatbotInfo,
  chatbotQuestions,
  question_tab_mapping,
} from "../Utils/common_vars";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";


const ChatbotGuide = ({ setChatbotGuideOpen, typeAndAsk, botType, isVisible = true }) => {
  const [hoveredQuestion, setHoveredQuestion] = React.useState(null);
const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

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
console.log(chatbotInfo[botType])
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer,{    width: screenWidth * 0.9,    maxHeight: screenHeight * 0.8,
    height:screenHeight*0.8,
}]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Welcome to UnflukeAI!</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
           
              <>
                {/* Info Text */}
                <Text style={styles.infoText}>{chatbotInfo[botType]}</Text>

                {/* Questions Section */}
                <View style={styles.questionsSection}>
                  <Text style={styles.sectionTitle}>Try asking:</Text>
                  
                  {chatbotQuestions[botType].map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.questionContainer}
                      onPress={() => handleQuestionPress(question)}
                      onPressIn={() => setHoveredQuestion(index)}
                      onPressOut={() => setHoveredQuestion(null)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.questionRow}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text
                          style={[
                            styles.questionText,
                            hoveredQuestion === index && styles.questionTextHovered,
                          ]}
                        >
                          {question}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.closeButtonFooter}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: c.card,
    borderRadius: 16,
    maxWidth: 500,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontSize: 20,
    fontWeight: "bold",
    color: c.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: c.textSecondary,
    marginBottom: 24,
  },
  questionsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: c.text,
    marginBottom: 16,
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
  questionTextHovered: {
    textDecorationLine: "underline",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  closeButtonFooter: {
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: c.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChatbotGuide;