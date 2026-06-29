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
import { Bot, CircleUserRound, Send, FileText } from "lucide-react-native";
import { ScrollView as HScrollView } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

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
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c, isDark);
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
            s.messageContainer,
            isBot ? s.botMessageContainer : s.userMessageContainer,
          ]}
        >
          {/* Bot icon */}
          {isBot && (
            <View style={[s.iconContainer, s.botIconContainer]}>
              <Bot size={18} color={c.gold} />
            </View>
          )}

          {/* User icon */}
          {isUser && (
            <View style={[s.iconContainer, s.userIconContainer]}>
              <CircleUserRound size={18} color={c.textSecondary} />
            </View>
          )}

          {/* Message bubble */}
          {msg.sender !== "bot-stream" && (
            <View
              style={[
                s.messageBubble,
                isUser ? s.userMessage : s.botMessage,
                msg.sender === "bot-loading" && s.loadingMessage,
              ]}
            >
              {msg.resultsLink ? (
                <Text
                  style={[
                    s.messageText,
                    { color: isUser ? c.onGold : c.text },
                  ]}
                >
                  Thank you for using UnflukeAI. You can view your results{" "}
                  <Text
                    style={s.linkText}
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
                      color: isUser ? c.onGold : c.text,
                      fontSize: 16,
                      lineHeight: 22,
                    },
                    link: {
                      color: isUser ? c.onGold : c.gold,
                    },
                    code_inline: {
                      backgroundColor: isUser ? c.transparent : c.surfaceElevated,
                      color: isUser ? c.onGold : c.text,
                      padding: 2,
                      borderRadius: 4,
                    },
                    code_block: {
                      backgroundColor: isUser ? c.transparent : c.surfaceElevated,
                      color: isUser ? c.onGold : c.text,
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
                <View style={s.optionsContainer}>
                  {msg.options.map((option, optionIndex) => (
                    <TouchableOpacity
                      key={optionIndex}
                      style={s.optionButton}
                      onPress={() => {
                        if (index === messages.length - 1) {
                          setOptionToPrompt(option);
                        }
                      }}
                    >
                      <Text style={s.optionButtonText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Streaming message */}
          {isStream && index === messages.length - 1 && streamingMessage && (
            <View style={[s.messageBubble, s.botMessage]}>
              <Markdown
                style={{
                  body: {
                    color: c.text,
                    fontSize: 16,
                    lineHeight: 22,
                  },
                  link: {
                    color: c.gold,
                  },
                  code_inline: {
                    backgroundColor: c.surfaceElevated,
                    color: c.text,
                    padding: 2,
                    borderRadius: 4,
                  },
                  code_block: {
                    backgroundColor: c.surfaceElevated,
                    color: c.text,
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
                style={s.sourcesButton}
                onPress={() => {
                  setSources(msg.docs);
                  setSourcesModalOpen(true);
                }}
              >
                <FileText size={18} color={c.textSecondary} />
              </TouchableOpacity>
            )}
        </View>
      );
    },
    [isDarkMode, c, s, resultsLinkAction, setOptionToPrompt, streamingMessage]
  );
  console.log(chatbotGuideOpen, ChatbotGuide);

  return (
    <View style={s.container}>
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
      <View style={s.tabContainer}>
        <HScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabScrollContent}
        >
          {bots.map((bot, i) => {
            const isActive = selectedBot === bot;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.pillTab,
                  isActive ? s.pillTabActive : s.pillTabInactive,
                ]}
                onPress={() => {
                  if (loading) return;
                  setSelectedBot(bot);
                  setBotExplanation(aboutBots[i]);
                  if (onTabChange) {
                    onTabChange(bot);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.pillTabText,
                    isActive ? s.pillTabTextActive : s.pillTabTextInactive,
                  ]}
                >
                  {bot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </HScrollView>
      </View>

      {/* Chat Messages */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={s.chatArea}
        contentContainerStyle={s.chatContent}
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
          <View style={s.explanationContainer}>
            <View style={s.explanationIcon}>
              <Bot size={28} color={c.gold} />
            </View>
            <Text style={s.explanationText}>{botExplanation}</Text>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Quick Questions */}
      {showQuickQuestions &&
        messages.filter((msg) => msg.mode === selectedBot).length === 0 && (
          <View style={s.quickQuestionsContainer}>
            <Text style={s.quickQuestionsLabel}>Try asking</Text>
            <View style={s.questionChipsContainer}>
              {botQuestions[selectedBot]?.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[s.questionChip, { maxWidth: width - 40 }]}
                  onPress={() => {
                    if (!loading) {
                      setInput(question);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={s.questionChipText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      {/* Input Area */}
      <View style={s.inputContainer}>
        <View style={s.inputGroup}>
          <TextInput
            style={s.textInput}
            placeholder="Type your message..."
            placeholderTextColor={c.textMuted}
            value={input}
            onChangeText={handleInputChange}
            onSubmitEditing={handleKeyDown}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[s.sendButton, loading && s.disabledButton]}
            onPress={handleMessage}
            disabled={loading}
          >
            <Send size={18} color={c.onGold} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    // Tab Navigation
    tabContainer: {
      paddingTop: 10,
      paddingBottom: 6,
    },
    tabScrollContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    pillTab: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1,
    },
    pillTabActive: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    pillTabInactive: {
      backgroundColor: c.surface,
      borderColor: c.border,
    },
    pillTabText: {
      fontSize: 13,
      fontWeight: "700",
    },
    pillTabTextActive: {
      color: c.onGold,
    },
    pillTabTextInactive: {
      color: c.textSecondary,
    },

    // Chat Area
    chatArea: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: c.background,
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
      gap: 16,
    },
    explanationIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.border,
    },
    explanationText: {
      fontSize: 17,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 26,
      color: c.textSecondary,
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
      borderRadius: 16,
      marginHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    botIconContainer: {
      backgroundColor: c.goldLight,
      borderColor: c.border,
    },
    userIconContainer: {
      backgroundColor: c.surfaceElevated,
      borderColor: c.border,
    },
    messageBubble: {
      maxWidth: "80%",
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 16,
      marginHorizontal: 4,
    },
    userMessage: {
      backgroundColor: c.gold,
      alignSelf: "flex-end",
      borderBottomRightRadius: 6,
    },
    botMessage: {
      backgroundColor: c.card,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: 6,
    },
    loadingMessage: {
      opacity: 0.7,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    linkText: {
      color: c.gold,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    sourcesButton: {
      padding: 8,
      marginLeft: 6,
      borderRadius: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },

    // Options
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 10,
      gap: 8,
    },
    optionButton: {
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.gold,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      flex: 1,
      minWidth: 100,
    },
    optionButtonText: {
      color: c.gold,
      fontSize: 12,
      textAlign: "center",
      fontWeight: "700",
    },

    // Quick Questions
    quickQuestionsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    quickQuestionsLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: c.textMuted,
      textAlign: "center",
      marginBottom: 12,
    },
    questionChipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
    },
    questionChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      backgroundColor: c.card,
    },
    questionChipText: {
      fontSize: 13,
      textAlign: "center",
      flexShrink: 1,
      color: c.textSecondary,
      fontWeight: "500",
    },

    // Input Area
    inputContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    inputGroup: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 24,
      paddingHorizontal: 4,
      paddingBottom: 4,
      paddingRight: 6,
      paddingVertical: 4,
    },
    textInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      maxHeight: 120,
      color: c.text,
      backgroundColor: "transparent",
    },
    sendButton: {
      backgroundColor: c.gold,
      padding: 11,
      borderRadius: 20,
      marginLeft: 4,
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

export default AIChatbot;
