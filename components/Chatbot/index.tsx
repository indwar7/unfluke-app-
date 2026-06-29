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
  Animated,
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
import {
  Bot,
  CircleUserRound,
  FileText,
  Filter,
  Search,
  LineChart,
  ArrowUp,
  RefreshCw,
  Sparkles,
} from "lucide-react-native";
import { ScrollView as HScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

// Animated three-dot "thinking" indicator for the bot bubble while streaming
const TypingDots = ({ color }: { color: string }) => {
  const dots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: color,
            opacity: dot,
            transform: [
              {
                scale: dot.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [0.85, 1.15],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
};

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

  // Map each bot to a lucide icon for the mode chips
  const botIcons = useMemo(
    () => ({
      "Company Fundamentals": FileText,
      "Fundamental Screener": Filter,
      Scanner: Search,
      "Basic Backtest": LineChart,
    }),
    []
  );

  // Short suggestion pills shown under the mode chips
  const botSuggestions = useMemo(
    () => ({
      "Company Fundamentals": [
        "P/E vs sector",
        "Debt trend",
        "Promoter holding",
        "ROE of Infosys",
      ],
      "Fundamental Screener": [
        "P/E < 15",
        "ROE > 20%",
        "Debt/Equity < 0.5",
        "Dividend yield > 3%",
      ],
      Scanner: [
        "52-week high",
        "Volume surge",
        "RSI divergence",
        "MACD crossover",
      ],
      "Basic Backtest": [
        "SMA crossover",
        "RSI strategy",
        "Bollinger Bands",
        "Mean reversion",
      ],
    }),
    []
  );

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

      // Inner content shared between the gold-gradient user bubble and the
      // surface bot bubble — keeps every render branch identical.
      const bubbleContent = (
        <>
          {msg.resultsLink ? (
            <Text
              style={[s.messageText, { color: isUser ? c.onGold : c.text }]}
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
                  fontSize: 15.5,
                  lineHeight: 23,
                },
                link: {
                  color: isUser ? c.onGold : c.gold,
                  fontWeight: "700",
                },
                strong: {
                  color: isUser ? c.onGold : c.text,
                  fontWeight: "800",
                },
                code_inline: {
                  backgroundColor: isUser ? c.transparent : c.surfaceElevated,
                  color: isUser ? c.onGold : c.gold,
                  fontVariant: ["tabular-nums"],
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  borderRadius: 6,
                },
                code_block: {
                  backgroundColor: isUser ? c.transparent : c.surfaceElevated,
                  color: isUser ? c.onGold : c.text,
                  fontVariant: ["tabular-nums"],
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: isUser ? 0 : 1,
                  borderColor: c.border,
                  marginVertical: 6,
                },
                fence: {
                  backgroundColor: isUser ? c.transparent : c.surfaceElevated,
                  color: isUser ? c.onGold : c.text,
                  fontVariant: ["tabular-nums"],
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: isUser ? 0 : 1,
                  borderColor: c.border,
                  marginVertical: 6,
                },
                hr: {
                  backgroundColor: c.border,
                  height: 1,
                  marginVertical: 8,
                },
                table: {
                  borderColor: c.border,
                  borderRadius: 10,
                  marginVertical: 6,
                },
                th: {
                  color: isUser ? c.onGold : c.textMuted,
                  fontWeight: "700",
                },
                td: {
                  color: isUser ? c.onGold : c.text,
                  fontVariant: ["tabular-nums"],
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
                  activeOpacity={0.7}
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
        </>
      );

      return (
        <View
          key={index}
          style={[
            s.messageContainer,
            isBot ? s.botMessageContainer : s.userMessageContainer,
          ]}
        >
          {/* Bot avatar */}
          {isBot && (
            <View style={[s.iconContainer, s.botIconContainer]}>
              <Bot size={16} color={c.gold} />
            </View>
          )}

          {/* User avatar */}
          {isUser && (
            <View style={[s.iconContainer, s.userIconContainer]}>
              <CircleUserRound size={16} color={c.textSecondary} />
            </View>
          )}

          {/* User bubble — gold gradient with tail */}
          {isUser && (
            <LinearGradient
              colors={[c.goldBright, c.gold, c.goldDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.messageBubble, s.userMessage]}
            >
              {bubbleContent}
            </LinearGradient>
          )}

          {/* Bot bubble — surface card */}
          {isBot && msg.sender !== "bot-stream" && (
            <View
              style={[
                s.messageBubble,
                s.botMessage,
                msg.sender === "bot-loading" && s.loadingMessage,
              ]}
            >
              {bubbleContent}
            </View>
          )}

          {/* Streaming bot bubble — shows live text or a thinking indicator */}
          {isStream && index === messages.length - 1 && (
            <View style={[s.messageBubble, s.botMessage]}>
              {streamingMessage ? (
                <Markdown
                  style={{
                    body: { color: c.text, fontSize: 15.5, lineHeight: 23 },
                    link: { color: c.gold, fontWeight: "700" },
                    strong: { color: c.text, fontWeight: "800" },
                    code_inline: {
                      backgroundColor: c.surfaceElevated,
                      color: c.gold,
                      fontVariant: ["tabular-nums"],
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                      borderRadius: 6,
                    },
                    code_block: {
                      backgroundColor: c.surfaceElevated,
                      color: c.text,
                      fontVariant: ["tabular-nums"],
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: c.border,
                      marginVertical: 6,
                    },
                  }}
                >
                  {streamingMessage}
                </Markdown>
              ) : (
                <View style={s.thinkingRow}>
                  <TypingDots color={c.gold} />
                  <Text style={s.thinkingText}>Thinking…</Text>
                </View>
              )}
            </View>
          )}

          {/* Sources button */}
          {isBot &&
            !isStream &&
            msg.docs &&
            Object.keys(msg.docs).length > 0 && (
              <TouchableOpacity
                style={s.sourcesButton}
                activeOpacity={0.7}
                onPress={() => {
                  setSources(msg.docs);
                  setSourcesModalOpen(true);
                }}
              >
                <FileText size={15} color={c.textSecondary} />
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

      {/* Header row — live status + refresh */}
      <View style={s.headerRow}>
        <View style={s.headerTitleWrap}>
          <View style={s.headerTitleLine}>
            <View style={s.liveDot} />
            <Text style={s.headerTitle}>AI Bot</Text>
          </View>
          <Text style={s.headerSubtitle} numberOfLines={1}>
            {loading ? `· analysing ${selectedBot}` : selectedBot}
          </Text>
        </View>
        <TouchableOpacity
          style={s.refreshButton}
          activeOpacity={0.7}
          disabled={loading}
          onPress={() => {
            if (loading) return;
            setMessages([]);
            addChatHistory([]);
          }}
        >
          <RefreshCw size={17} color={loading ? c.textMuted : c.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Mode chips — bot selector */}
      <View style={s.tabContainer}>
        <HScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabScrollContent}
        >
          {bots.map((bot, i) => {
            const isActive = selectedBot === bot;
            const ChipIcon = botIcons[bot] || Sparkles;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                onPress={() => {
                  if (loading) return;
                  setSelectedBot(bot);
                  setBotExplanation(aboutBots[i]);
                  if (onTabChange) {
                    onTabChange(bot);
                  }
                }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[c.goldBright, c.gold, c.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.pillTab, s.pillTabActive]}
                  >
                    <ChipIcon size={14} color={c.onGold} />
                    <Text style={[s.pillTabText, s.pillTabTextActive]}>
                      {bot}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[s.pillTab, s.pillTabInactive]}>
                    <ChipIcon size={14} color={c.textSecondary} />
                    <Text style={[s.pillTabText, s.pillTabTextInactive]}>
                      {bot}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </HScrollView>
      </View>

      {/* Suggestion pills */}
      {messages.filter((msg) => msg.mode === selectedBot).length === 0 && (
        <View style={s.suggestionContainer}>
          <HScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.suggestionScrollContent}
          >
            {botSuggestions[selectedBot]?.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={s.suggestionChip}
                activeOpacity={0.7}
                onPress={() => {
                  if (!loading) {
                    setInput(suggestion);
                  }
                }}
              >
                <Text style={s.suggestionChipText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </HScrollView>
        </View>
      )}

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
            placeholder="Ask anything about the markets…"
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
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[c.goldBright, c.gold, c.goldDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.sendButtonGradient}
            >
              <ArrowUp size={20} color={c.onGold} strokeWidth={2.5} />
            </LinearGradient>
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

    // Header row
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 4,
    },
    headerTitleWrap: {
      flex: 1,
      marginRight: 12,
    },
    headerTitleLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.profit,
      shadowColor: c.profit,
      shadowOpacity: 0.6,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 0 },
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.2,
      color: c.text,
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      color: c.textMuted,
      marginTop: 2,
      marginLeft: 15,
    },
    refreshButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },

    // Mode chips
    tabContainer: {
      paddingTop: 10,
      paddingBottom: 6,
    },
    tabScrollContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    pillTab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      paddingHorizontal: 15,
      paddingVertical: 9,
      borderRadius: 22,
      borderWidth: 1,
    },
    pillTabActive: {
      borderColor: c.goldDeep,
      shadowColor: c.gold,
      shadowOpacity: isDark ? 0.45 : 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
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

    // Suggestion pills
    suggestionContainer: {
      paddingBottom: 4,
    },
    suggestionScrollContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    suggestionChip: {
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceElevated,
    },
    suggestionChipText: {
      fontSize: 12.5,
      fontWeight: "600",
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
      gap: 18,
    },
    explanationIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: isDark ? c.goldDeep : c.border,
    },
    explanationText: {
      fontSize: 16.5,
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
      width: 30,
      height: 30,
      borderRadius: 15,
      marginHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    botIconContainer: {
      backgroundColor: c.goldLight,
      borderColor: isDark ? c.goldDeep : c.border,
    },
    userIconContainer: {
      backgroundColor: c.surfaceElevated,
      borderColor: c.border,
    },
    messageBubble: {
      maxWidth: "82%",
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 18,
      marginHorizontal: 4,
    },
    userMessage: {
      alignSelf: "flex-end",
      borderBottomRightRadius: 6,
      shadowColor: c.gold,
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
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
      fontSize: 15.5,
      lineHeight: 23,
    },
    linkText: {
      color: c.gold,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    thinkingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 6,
    },
    thinkingText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.textMuted,
      fontStyle: "italic",
    },
    sourcesButton: {
      width: 32,
      height: 32,
      marginLeft: 6,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },

    // Options
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 10,
      marginBottom: 6,
      gap: 8,
    },
    optionButton: {
      backgroundColor: c.goldLight,
      borderWidth: 1,
      borderColor: c.gold,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 12,
      flex: 1,
      minWidth: 100,
    },
    optionButtonText: {
      color: c.gold,
      fontSize: 12.5,
      textAlign: "center",
      fontWeight: "700",
    },

    // Quick Questions (the "Try asking" block)
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
      paddingTop: 10,
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
      borderRadius: 26,
      paddingLeft: 6,
      paddingRight: 6,
      paddingVertical: 6,
    },
    textInput: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 10 : 8,
      fontSize: 15.5,
      maxHeight: 120,
      color: c.text,
      backgroundColor: "transparent",
    },
    sendButton: {
      marginLeft: 6,
      borderRadius: 21,
      shadowColor: c.gold,
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    sendButtonGradient: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

export default AIChatbot;
