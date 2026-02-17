import { StyleSheet, View } from "react-native";
import React, { useState, useCallback } from "react";
import Chatbot from "../components/Chatbot";
import { question_tab_mapping } from "../components/UnflukeMain/Utils/common_vars";

const ChatbotPage = () => {
  const [botType, setBotType] = useState("");
  const [defaultInput, setDefaultInput] = useState("");
  const [activeTab, setActiveTab] = useState("Company Fundamentals"); // Add active tab state

  // React Native version of typeAndAsk - uses state instead of DOM manipulation
  const typeAndAsk = useCallback((question) => {
    console.log("Question-->", question);
    console.log(question_tab_mapping[question]);
    
    // Instead of clicking DOM element, directly change the active tab
    const targetTab = question_tab_mapping[question];
    if (targetTab) {
      setActiveTab(targetTab); // This replaces the DOM click
      setBotType(targetTab);   // Update bot type as well
    }
    
    setDefaultInput(question);
  }, []);

  // Handle tab change from within the chatbot component
  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    setBotType(newTab);
  }, []);

  return (
      <Chatbot 
        defaultInput={defaultInput}
        botType={botType}
        setBotType={setBotType}
        typeAndAsk={typeAndAsk}
        activeTab={activeTab}           // Pass active tab state
        onTabChange={handleTabChange}   // Pass tab change handler
      />
  );
};

export default ChatbotPage;

