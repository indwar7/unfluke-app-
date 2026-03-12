import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import Markdown from "react-native-markdown-display";
// import unfluke_logo from "../../../assets/images/unfluke/UNFLUKE -10.png";
import axios, { all } from "axios";
import SourcesModal from "../../components/UnflukeMain/Chatbot/SourcesModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { initialLegPositions } from "../../components/UnflukeMain/Utils/common_vars";
import { addStrategy } from "../../apis/BasicBacktester";
import ProgressEventBar from "../../components/UnflukeMain/Chatbot/ProgressEventBar";
import StreamingMessage from "../../components/UnflukeMain/Chatbot/StreamingMessage";
import { backendSocket, chatbotSocket } from "../../socket/socket";
import ChatbotGuide from "../../components/UnflukeMain/Chatbot/ChatbotGuide";
import ScannerResultsModal from "../../components/UnflukeMain/Chatbot/ScannerResultsModal";
import baseScanForm from "./baseScanForm";
import baseBacktestForm from "./baseBacktestForm";
import ShowResultsLink from "../../components/UnflukeMain/Chatbot/ShowResultsLink";
import { createSelector } from "reselect";
import { layoutModeTypes } from "../../components/UnflukeMain/constants/layout";
import { Config } from "../../helpers/config";
import { Bot, CircleUserRound } from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";

const AIChatbot = ({
  defaultInput,
  botType,
  setBotType,
  typeAndAsk,
  showGuideOnLoad = true,
  allowedBots = null,
  showQuickQuestions = false,
  activeTab, // Pass active tab state
  onTabChange,
  className = "",
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);
  const [chatbotGuideOpen, setChatbotGuideOpen] = useState(showGuideOnLoad);
  const [scannerResultsModalOpen, setScannerResultsModalOpen] = useState(false);
  const [sources, setSources] = useState({});
  const scrollViewRef = useRef(null); // Changed from divRef
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState("Company Fundamentals");
  const [botExplanation, setBotExplanation] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [chatHistory, addChatHistory] = useState([]);
  const [scannerForm, setScannerForm] = useState(baseScanForm);
  const [basicBacktestForm, setBasicBacktestForm] = useState(baseBacktestForm);
  const [scannerResults, setScannerResults] = useState({});
  const [scannerResultsType, setScannerResultsType] = useState("fundamental");
  const { width } = useWindowDimensions()
  //stores
  const auth = useSelector((store) => store.Login);
  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (state) => ({
      layoutMode: state.layoutModeType,
    })
  );

  const { layoutMode } = useSelector(selectDashboardData);
  // Use navigation hook - adjust based on your navigation library
  // const navigation = useNavigation();
  const [isProgressing, setIsProgressing] = useState(false);

  // Note: document.title doesn't exist in React Native
  // You can use navigation options or a custom hook for title management
  useEffect(() => {
    // For React Navigation, you might do:
    // navigation.setOptions({ title: "AI Bot | Unfluke" });
    console.log("Page title would be: AI Bot | Unfluke");
  }, []);

  const dispatch = useDispatch();
  const uniqueUserIdRef = useRef(null);
  const [stratId, setStratId] = useState(new Date().getMilliseconds());

  // Initialize the unique user ID only once
  if (uniqueUserIdRef.current === null) {
    uniqueUserIdRef.current = new Date().getMilliseconds();
  }

  // Memoize static data to prevent recreations
  const allBots = useMemo(
    () => [
      "Company Fundamentals",
      "Fundamental Screener",
      "Scanner",
      "Basic Backtest",
    ],
    []
  );

  const bots = useMemo(() => allowedBots || allBots, [allowedBots, allBots]);

  // Add sample questions for each bot type
  const botQuestions = useMemo(
    () => ({
      "Company Fundamentals": [
        "What is the P/E ratio of Reliance?",
        "Show me debt-to-equity ratio of TCS",
        "Compare revenue growth of HDFC Bank vs ICICI Bank",
        "What is the ROE of Infosys?",
        "What is the market cap of Tata Motors?",
        "What is the EPS of HDFC Ltd?",
      ],
      "Fundamental Screener": [
        "Create a screener for companies with P/E ratio less than 15",
        "Find stocks with ROE greater than 20%",
        "Screen for companies with debt-to-equity ratio below 0.5",
        "Find companies with revenue growth above 10% in the last quarter",
        "Create a screener for companies with market cap above 1 trillion",
        "Screen for companies with dividend yield above 3%",
        "Find companies with EPS growth above 15% in the last year",
      ],
      Scanner: [
        "Scan for stocks breaking 52-week high",
        "Find stocks with volume surge",
        "Scan for bullish RSI divergence",
        "Find stocks with MACD crossover",
        "Scan for stocks with high volatility",
        "Find stocks with significant price action",
      ],
      "Basic Backtest": [
        "Backtest a simple moving average crossover strategy",
        "Test RSI overbought/oversold strategy",
        "Backtest momentum strategy with 20-day breakout",
        "Test Bollinger Bands strategy",
        "Backtest a mean reversion strategy",
        "Test a trend-following strategy with 50-day moving average",
      ],
    }),
    []
  );

  const scannerTypes = useMemo(
    () => ({
      "Fundamental Screener": "fundamental",
      Scanner: "scanner",
    }),
    []
  );

  const aboutBots = useMemo(
    () => [
      "You can ask about company ratios, financials, and other related queries.",
      "You can create screeners and scanners for stocks.",
      "You can get real-time scans on stocks.",
      "You can backtest your strategies and view the results.",
    ],
    []
  );

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prevState) => !prevState);
  }, []);

  // Memoize handleSelect to prevent recreation
  const handleSelect = useCallback((option) => {
    setSelectedBot(option);
  }, []);

  const setOptionToPrompt = useCallback((option) => {
    setInput(option);
  }, []);

  // Memoize all the chat handlers
  const handleScannerChat = useCallback(async () => {
    if (!loading && input.trim()) {
      try {
        addChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "user", content: input },
        ]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input, mode: selectedBot },
          { sender: "bot-stream", text: "", mode: selectedBot },
        ]);
        setLoading(true);
        setInput("");
        chatbotSocket.emit("alerts_chat", {
          userid: auth.user._id,
          uniquetoken: uniqueUserIdRef.current,
          message: input,
          api_key: Config.REACT_APP_CHATBOT_TOKEN,
          chat_history: chatHistory,
          scanner_form: scannerForm,
          bot_type: selectedBot,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [loading, input, selectedBot, auth.user._id, chatHistory, scannerForm]);

  const handleScreenerChat = useCallback(async () => {
    if (!loading && input.trim()) {
      try {
        addChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "user", content: input },
        ]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input, mode: selectedBot },
          { sender: "bot-stream", text: "", mode: selectedBot },
        ]);
        setLoading(true);
        setInput("");
        chatbotSocket.emit("alerts_chat", {
          userid: auth.user._id,
          uniquetoken: uniqueUserIdRef.current,
          message: input,
          api_key: Config.REACT_APP_CHATBOT_TOKEN,
          chat_history: chatHistory,
          scanner_form: scannerForm,
          bot_type: selectedBot,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [loading, input, selectedBot, auth.user._id, chatHistory, scannerForm]);

  const handleEdBotChat = useCallback(async () => {
    if (!loading && input.trim()) {
      try {
        addChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "user", content: input },
        ]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input, mode: selectedBot },
          { sender: "bot-stream", text: "", mode: selectedBot },
        ]);
        setLoading(true);
        setInput("");
        chatbotSocket.emit("chat", {
          userid: auth.user._id,
          uniquetoken: uniqueUserIdRef.current,
          message: input,
          api_key: Config.REACT_APP_CHATBOT_TOKEN,
          chat_history: chatHistory,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [loading, input, selectedBot, auth.user._id, chatHistory]);

  const handleBacktestScansChat = useCallback(async () => {
    if (!loading && input.trim()) {
      try {
        addChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "user", content: input },
        ]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input, mode: selectedBot },
          { sender: "bot-stream", text: "", mode: selectedBot },
        ]);
        setLoading(true);
        setInput("");
        chatbotSocket.emit("backtest_chat", {
          userid: auth.user._id,
          uniquetoken: uniqueUserIdRef.current,
          message: input,
          api_key: Config.REACT_APP_CHATBOT_TOKEN,
          chat_history: chatHistory,
          backtest_form: basicBacktestForm,
          bot_type: selectedBot,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [
    loading,
    input,
    selectedBot,
    auth.user._id,
    chatHistory,
    basicBacktestForm,
  ]);

  // Memoize handleMessage
  const handleMessage = useCallback(() => {
    if (selectedBot === "Company Fundamentals") {
      handleEdBotChat();
    } else if (selectedBot === "Fundamental Screener") {
      handleScreenerChat();
    } else if (selectedBot === "Scanner") {
      handleScannerChat();
    } else if (selectedBot === "Basic Backtest") {
      handleBacktestScansChat();
    }
  }, [
    selectedBot,
    handleEdBotChat,
    handleScreenerChat,
    handleScannerChat,
    handleBacktestScansChat,
  ]);

  // React Native version - using onChangeText instead of onChange
  const handleInputChange = useCallback((text) => {
    setInput(text);
  }, []);

  // For React Native, you'll handle this in the TextInput component
  // by using onSubmitEditing prop
  const handleKeyDown = useCallback(() => {
    handleMessage();
  }, [handleMessage]);

  // File picking in React Native requires expo-document-picker or react-native-document-picker
  const handleAttachFile = useCallback(async () => {
    try {
      // Example using expo-document-picker
      // import * as DocumentPicker from 'expo-document-picker';
      //
      // const result = await DocumentPicker.getDocumentAsync({
      //   type: '*/*',
      //   copyToCacheDirectory: true,
      // });
      //
      // if (result.type === 'success') {
      //   console.log(`Attached file: ${result.name}`);
      // }

      console.log(
        "File attachment feature needs document picker implementation"
      );
    } catch (error) {
      console.error("Error picking file:", error);
    }
  }, []);

  // React Native scrolling - using ScrollView ref
  const scrollToBottom = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  const submitScannerForm = useCallback(
    async (alerts) => {
      if (scannerForm && Object.keys(scannerForm).length > 0 && auth) {
        const finalForm = {
          ...scannerForm,
          windowId: uniqueUserIdRef.current,
          user: auth.user,
          scanner_type: scannerTypes[selectedBot],
          alert: "false",
          alerts: alerts,
          fnoLotSize: "",
          market: "in",
          segment1a: "Nifty 50",
        };
        console.log("Final Form", finalForm);
        const res = await axios.get(
          `${Config.BACKEND_URL}/api/stocks/`,
          {
            params: finalForm,
          }
        );
        if (res) {
          //console.log("Scanner results", res)
        }
      }
    },
    [scannerForm, auth, selectedBot, scannerTypes]
  );

  const submitBacktestForm = useCallback(async () => {
    if (
      basicBacktestForm &&
      Object.keys(basicBacktestForm).length > 0 &&
      auth
    ) {
      const strategyAdded = await addStrategy(
        axios,
        basicBacktestForm,
        // navigation, // Pass navigation instead of navigate
        stratId,
        auth.user._id,
        isProgressing,
        "in"
      );
      if (strategyAdded) {
        setIsProgressing(true);
      }
    }
  }, [basicBacktestForm, auth, stratId, isProgressing]);

  const fetchAndParseCSV = useCallback(async (csvUrl) => {
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const lines = csvText.trim().split("\n");
      // Extract headers
      const headers = lines[0]
        .split(",")
        .map((h) => h.replaceAll('"', "").trim());
      // Parse rows into objects
      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i].replaceAll('"', "");
          return obj;
        }, {});
      });
      return { headers, data };
    } catch (error) {
      console.error("Error fetching or parsing CSV:", error);
      return { headers: [], data: [] };
    }
  }, []);

  const replaceLastOccurrence = useCallback((str, search, replacement) => {
    const lastIndex = str.lastIndexOf(search);
    if (lastIndex === -1) return str;
    return (
      str.substring(0, lastIndex) +
      replacement +
      str.substring(lastIndex + search.length)
    );
  }, []);

  const resultsLinkAction = useCallback(
    async (link) => {
      const { headers, data } = await fetchAndParseCSV(link);
      setScannerResults({
        results: data,
        link: link,
        headers: headers,
      });
      setScannerResultsModalOpen(true);
    },
    [fetchAndParseCSV]
  );

  const setForm = useCallback(
    (form) => {
      if (selectedBot === "Fundamental Screener" || selectedBot === "Scanner") {
        setScannerForm(form);
      } else if (selectedBot === "Basic Backtest") {
        setBasicBacktestForm(form);
      }
    },
    [selectedBot]
  );

  const submitForm = useCallback(() => {
    //SUBMIT FORM ON CONFIRMATION
    if (selectedBot === "Fundamental Screener") {
      submitScannerForm("false");
    } else if (selectedBot === "Scanner") {
      submitScannerForm("false");
    } else if (selectedBot === "Basic Backtest") {
      submitBacktestForm();
    }
    setLoading(true);
  }, [selectedBot, submitScannerForm, submitBacktestForm]);

  // Socket effects with stable dependencies
  useEffect(() => {
    if (backendSocket && auth?.user?._id) {
      // ONCE RESULTS ARE GENERATED
      const handleScannerResults = (data) => {
        if (
          data &&
          data["userId"] == auth.user._id &&
          data["windowId"] == uniqueUserIdRef.current
        ) {
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, prevMessages.length - 1),
            {
              sender: "bot",
              text: "",
              mode: selectedBot,
              resultsLink: data.link,
            },
          ]);
          addChatHistory((prevHistory) => [
            ...prevHistory.slice(0, prevHistory.length - 1),
            { role: "model", content: "Thank you for using UnflukeAI." },
          ]);
          setScannerForm(baseScanForm);
          setScannerResults(data);
          setScannerResultsModalOpen(true);
          setLoading(false);
        }
      };

      const handleBacktestResults = (data) => {
        if (data) {
          if (data.user == auth.user._id && data.stratid == stratId) {
            const link = `${Config.PUBLIC_URL
              }/${"in"}/basic-backtester-view?filename=${data.filename.replace(
                ".csv",
                ""
              )}`;
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, prevMessages.length - 1),
              {
                sender: "bot",
                text: `Thank you for using UnflukeAI. You can now view your results [here](${link}).`,
                mode: selectedBot,
              },
            ]);
            addChatHistory((prevHistory) => [
              ...prevHistory.slice(0, prevHistory.length - 1),
              { role: "model", content: "Thank you for using UnflukeAI." },
            ]);
            setBasicBacktestForm(baseBacktestForm);
            setLoading(false);
          }
        }
      };

      backendSocket.on("scanner-results", handleScannerResults);
      backendSocket.on("csv-filename", handleBacktestResults);

      return () => {
        backendSocket.off("scanner-results", handleScannerResults);
        backendSocket.off("csv-filename", handleBacktestResults);
      };
    }
  }, [auth?.user?._id, selectedBot, stratId]); // Removed messages and chatHistory from dependencies

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    //console.log("scannerForm", scannerForm)
  }, [scannerForm]);

  useEffect(() => {
    if (auth && chatbotSocket) {
      // Listen for real-time messages from backend
      const handleChatResponse = (data) => {
        if (
          data &&
          data["user_id"] == auth.user._id &&
          data["unique_token"] == uniqueUserIdRef.current
        ) {
          const newContent = data.message;
          setStreamingMessage((prev) =>
            (prev + newContent).replace("<<IKNOW>>", "")
          );
        }
      };

      const handleError = () => {
        // React Native Alert instead of browser alert
        Alert.alert("Error", "An error occurred. Please try again later.");
        setLoading(false);
      };

      const handleStreamEnded = (data) => {
        if (
          data &&
          data["user_id"] == auth.user._id &&
          data["unique_token"] == uniqueUserIdRef.current
        ) {
          const docs = data.docs;
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, prevMessages.length - 1),
            {
              sender: "bot",
              text: data.message,
              mode: selectedBot,
              docs: data.message.indexOf("<<IKNOW>>") !== -1 ? docs : {},
            },
          ]);
          if (
            data.form &&
            data.message &&
            (data.form.indexOf("<<SUBMITTING>>") !== -1 ||
              data.message.indexOf("<<SUBMITTING>>") !== -1)
          ) {
            submitForm();
          } else {
            if (data.form) {
              const regex = /```json(.*?)```/s;
              const match = data.form.match(regex);
              if (match && match[1]) {
                try {
                  const parsedForm = JSON.parse(match[1]);
                  setForm(parsedForm);
                } catch (e) {
                  console.error("Error parsing JSON", e);
                }
              }
            }
            let botRole = "assistant";
            if (
              selectedBot === "Fundamental Screener" ||
              selectedBot === "Basic Backtest"
            ) {
              botRole = "model";
            }
            addChatHistory((prevHistory) => [
              ...prevHistory,
              { role: botRole, content: data.message },
            ]);
          }
          setStreamingMessage("");
          setLoading(false);
        }
      };

      chatbotSocket.on("chat_response", handleChatResponse);
      chatbotSocket.on("error", handleError);
      chatbotSocket.on("stream_ended", handleStreamEnded);

      return () => {
        chatbotSocket.off("chat_response", handleChatResponse);
        chatbotSocket.off("stream_ended", handleStreamEnded);
        chatbotSocket.off("error", handleError);
      };
    }
  }, [auth, chatbotSocket, selectedBot, submitForm, setForm]); // Removed chatHistory from dependencies

  // Handle defaultInput changes with proper dependency
  useEffect(() => {
    if (defaultInput) {
      setInput(defaultInput);
    }
  }, [defaultInput]); // Removed setInput from dependencies as it's a state setter

  // Handle botExplanation changes with stable dependencies
  useEffect(() => {
    const botIndex = bots.indexOf(selectedBot);
    if (botIndex !== -1) {
      setBotExplanation(aboutBots[botIndex]);
    }
  }, [selectedBot, bots, aboutBots]);

  // Handle bot type changes with stable dependencies
  useEffect(() => {
    setScannerResultsType(scannerTypes[selectedBot] || "fundamental");
    if (setBotType) {
      setBotType(selectedBot);
    }
    setMessages([]);
    addChatHistory([]);
  }, [selectedBot, scannerTypes]); // Removed setBotType from dependencies

  useEffect(() => {
    if (isProgressing) {
      setLoading(true);
    }
  }, [isProgressing]);

  // Handle activeTab changes with stable callback
  useEffect(() => {
    if (activeTab && activeTab !== selectedBot) {
      handleSelect(activeTab);
    }
  }, [activeTab, selectedBot, handleSelect]);

  const isDarkMode = layoutMode === "DARKMODE";

  const renderMessage = useCallback(
    (msg, index) => {
      const isBot = msg.sender.startsWith("bot");
      const isUser = msg.sender === "user";
      const isStream = msg.sender === "bot-stream";

      return (
        <View
          key={index}
          style={[
            styles.messageContainer,
            isBot ? styles.botMessageContainer : styles.userMessageContainer,
          ]}
        >
          {/* Bot icon */}
          {isBot && (
            <View style={styles.iconContainer}>
              <Bot />
            </View>
          )}

          {/* User icon */}
          {isUser && (
            <View style={styles.iconContainer}>
              <CircleUserRound />
            </View>
          )}

          {/* Message bubble */}
          {msg.sender !== "bot-stream" && (
            <View
              style={[
                styles.messageBubble,
                isUser
                  ? styles.userMessage
                  : [
                    styles.botMessage,
                    { backgroundColor: isDarkMode ? "#343A43" : "#EFF3FF" },
                  ],
                msg.sender === "bot-loading" && styles.loadingMessage,
              ]}
            >
              {msg.resultsLink ? (
                <Text
                  style={[
                    styles.messageText,
                    {
                      color:
                        isDarkMode && !isUser
                          ? "#FFFFFF"
                          : isUser
                            ? "#FFFFFF"
                            : "#171717",
                    },
                  ]}
                >
                  Thank you for using UnflukeAI. You can view your results{" "}
                  <Text
                    style={styles.linkText}
                    onPress={() => resultsLinkAction(msg.resultsLink)}
                  >
                    here
                  </Text>
                  .
                </Text>
              ) : (
                <Markdown
                  style={{
                    body: {
                      color:
                        isDarkMode && !isUser
                          ? "#FFFFFF"
                          : isUser
                            ? "#FFFFFF"
                            : "#171717",
                      fontSize: 16,
                      lineHeight: 22,
                    },
                    link: {
                      color: "#2563EB",
                    },
                    code_inline: {
                      backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                      padding: 2,
                      borderRadius: 4,
                    },
                    code_block: {
                      backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                      padding: 10,
                      borderRadius: 8,
                      marginVertical: 5,
                    },
                  }}
                >
                  {msg.text?.replace("<<IKNOW>>", "") || ""}
                </Markdown>
              )}

              {/* Progress bar for backtest */}
              {isProgressing &&
                index === messages.length - 1 &&
                ProgressEventBar && (
                  <ProgressEventBar
                    auth={auth}
                    setIsProgressing={setIsProgressing}
                    stratId={stratId}
                  />
                )}

              {/* Options buttons */}
              {msg.options && msg.options.length > 0 && (
                <View style={styles.optionsContainer}>
                  {msg.options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      style={styles.optionButton}
                      onPress={() => {
                        if (index === messages.length - 1) {
                          setOptionToPrompt(option);
                        }
                      }}
                    >
                      <Text style={styles.optionButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Streaming message */}
          {isStream && index === messages.length - 1 && streamingMessage && (
            <View style={[styles.messageBubble, styles.botMessage]}>
              <Markdown
                style={{
                  body: {
                    color: isDarkMode ? "#FFFFFF" : "#171717",
                    fontSize: 16,
                    lineHeight: 22,
                  },
                  link: {
                    color: "#2563EB",
                  },
                  code_inline: {
                    backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                    padding: 2,
                    borderRadius: 4,
                  },
                  code_block: {
                    backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
                    padding: 10,
                    borderRadius: 8,
                    marginVertical: 5,
                  },
                }}
              >
                {streamingMessage}
              </Markdown>
            </View>
          )}

          {/* Sources icon */}
          {isBot &&
            !isStream &&
            msg.docs &&
            Object.keys(msg.docs).length > 0 && (
              <TouchableOpacity
                style={styles.sourcesButton}
                onPress={() => {
                  setSources(msg.docs);
                  setSourcesModalOpen(true);
                }}
              >
                <Ionicons name="document-text" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
        </View>
      );
    },
    [isDarkMode, resultsLinkAction, setOptionToPrompt, streamingMessage]
  );
  console.log(chatbotGuideOpen, ChatbotGuide);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Modals */}
      {sourcesModalOpen && (
        <SourcesModal
          sourcesModalOpen={sourcesModalOpen}
          setSourcesModalOpen={setSourcesModalOpen}
          sources={sources}
        />
      )}

      {chatbotGuideOpen && (
        <ChatbotGuide
          setChatbotGuideOpen={setChatbotGuideOpen}
          botType={selectedBot}
          typeAndAsk={setInput}
        />
      )}

      {scannerResultsModalOpen && (
        <ScannerResultsModal
          modalOpen={scannerResultsModalOpen}
          setModalOpen={setScannerResultsModalOpen}
          resultsObj={scannerResults}
          type={scannerResultsType}
        />
      )}

      {/* Bot Navigation Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={selectedBot}
            onValueChange={(bot, index) => {
              if (loading) return;
              setSelectedBot(bot);
              setBotExplanation(aboutBots[index]);

              if (onTabChange) {
                onTabChange(bot);
              }
            }}
            style={[
              styles.dropdown,
              isDarkMode ? styles.dropdownDark : styles.dropdownLight,
            ]}
            dropdownIconColor={isDarkMode ? "#F9FAFB" : "#111827"}
          >
            {bots.map((bot, i) => (
              <Picker.Item
                key={i}
                label={bot}
                value={bot}
                color={isDarkMode ? "#F9FAFB" : "#111827"}
                style={{ fontSize: 15 }}
              />
            ))}
          </Picker>

          {/* Info Icon beside dropdown */}
          <TouchableOpacity
            style={styles.infoIcon}
            onPress={() => {
              if (loading) return;
              setChatbotGuideOpen(true);
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={isDarkMode ? "#F9FAFB" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={[styles.chatArea, isDarkMode && styles.darkChatArea]}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={scrollToBottom}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={250}
        extraScrollHeight={60}
        showsVerticalScrollIndicator={false}
      >
        {messages.length > 0 ? (
          messages
            .filter((msg) => msg.mode === selectedBot)
            .map((msg, index) => renderMessage(msg, index))
        ) : (
          <View style={styles.explanationContainer}>
            <Text
              style={[
                styles.explanationText,
                { color: isDarkMode ? "#FFFFFF" : "#171717" },
              ]}
            >
              {botExplanation}
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Quick Questions */}
      {showQuickQuestions &&
        messages.filter((msg) => msg.mode === selectedBot).length === 0 && (
          <View style={styles.quickQuestionsContainer}>
            <View style={styles.questionChipsContainer}>
              {botQuestions[selectedBot]?.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.questionChip,
                    isDarkMode && styles.questionChipDark,
                    { maxWidth: width - 40 }
                  ]}
                  onPress={() => {
                    if (!loading) {
                      setInput(question);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.questionChipText,
                      { color: isDarkMode ? "#FFFFFF" : "#6B7280" },
                    ]}
                  >
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {/* Input Area */}
      <View
        style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}
      >
        <View style={[styles.inputGroup, isDarkMode && styles.darkInputGroup]}>
          <TextInput
            style={[
              styles.textInput,
              { color: isDarkMode ? "#F9FAFB" : "#111827" },
            ]}
            placeholder="Type your message..."
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "#6B7280"}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleKeyDown}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabledButton]}
            onPress={handleMessage}
            disabled={loading}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  darkContainer: {
    backgroundColor: "#111827",
  },

  // Tab Navigation
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  inactiveTab: {
    backgroundColor: "#E5E7EB",
  },
  activeTabDark: {
    backgroundColor: "#2563EB",
  },
  inactiveTabDark: {
    backgroundColor: "#374151",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  inactiveTabText: {
    color: "#374151",
  },
  infoIcon: {
    marginLeft: 8,
  },
  dropdownWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
  },

  dropdown: {
    flex: 1,
    height: 50,
    paddingVertical: 26,
  },

  dropdownLight: {
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },

  dropdownDark: {
    backgroundColor: "#374151",
    color: "#F9FAFB",
  },
  // Chat Area
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  darkChatArea: {
    backgroundColor: "#111827",
  },
  chatContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  explanationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  explanationText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },

  // Messages
  messageContainer: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-start",
    flexDirection: "row-reverse",
  },
  iconContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  userMessage: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#EFF3FF",
    alignSelf: "flex-start",
  },
  loadingMessage: {
    opacity: 0.7,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  linkText: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  sourcesButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Options
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    minWidth: 100,
  },
  optionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },

  // Quick Questions
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  questionChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  questionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
  },
  questionChipDark: {
    borderColor: "#4B5563",
    backgroundColor: "#374151",
  },
  questionChipText: {
    fontSize: 14,
    textAlign: "center",
    flexShrink: 1,
  },

  // Input Area
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20
  },
  darkInputContainer: {
    backgroundColor: "#1F2937",
    borderTopColor: "#374151",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingBottom: 7,
    paddingRight: 8,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    color: "#111827",
    backgroundColor: "transparent",
  },
  darkTextInput: {
    color: "#F9FAFB",
    backgroundColor: "transparent",
  },
  darkInputGroup: {
    backgroundColor: "#374151",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AIChatbot;
