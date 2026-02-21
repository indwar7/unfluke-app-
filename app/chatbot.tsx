import { View } from "react-native";
import React, { useState, useCallback } from "react";
import Chatbot from "../components/Chatbot";
import { question_tab_mapping } from "../components/UnflukeMain/Utils/common_vars";
import { ScreenWithHeader } from "@/components/AppHeader";

const ChatbotPage = () => {
  const [botType, setBotType] = useState("");
  const [defaultInput, setDefaultInput] = useState("");
  const [activeTab, setActiveTab] = useState("Company Fundamentals");

  const typeAndAsk = useCallback((question: any) => {
    console.log("Question-->", question);
    console.log(question_tab_mapping[question]);
    const targetTab = question_tab_mapping[question];
    if (targetTab) {
      setActiveTab(targetTab);
      setBotType(targetTab);
    }
    setDefaultInput(question);
  }, []);

  const handleTabChange = useCallback((newTab: any) => {
    setActiveTab(newTab);
    setBotType(newTab);
  }, []);

  return (
    <ScreenWithHeader>
      <Chatbot
        defaultInput={defaultInput}
        botType={botType}
        setBotType={setBotType}
        typeAndAsk={typeAndAsk}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </ScreenWithHeader>
  );
};

export default ChatbotPage;
