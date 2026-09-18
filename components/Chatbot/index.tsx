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
  Animated,
} from "react-native";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import Markdown from "react-native-markdown-display";
// import unfluke_logo from "../../../assets/images/unfluke/UNFLUKE -10.png";
import axios, { all } from "axios";
import SourcesModal from "../../components/UnflukeMain/Chatbot/SourcesModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  initialLegPositions,
  question_tab_mapping,
} from "../../components/UnflukeMain/Utils/common_vars";
import { addStrategy } from "../../apis/BasicBacktester";
import ProgressEventBar from "../../components/UnflukeMain/Chatbot/ProgressEventBar";
import { backendSocket, chatbotSocket } from "../../socket/socket";
import ChatbotGuide from "../../components/UnflukeMain/Chatbot/ChatbotGuide";
import ScannerResultsModal from "../../components/UnflukeMain/Chatbot/ScannerResultsModal";
import {
  getBaseScanForm,
  getBaseBacktestForm,
  getBaseAdvancedForm,
} from "./chatbotForms";
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
  Layers,
  ArrowUp,
  RefreshCw,
  Sparkles,
  HelpCircle,
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

  // Watchdog: if a response never arrives (socket down / backend silent), don't
  // leave the "Thinking…" spinner stuck forever — clear it and show an error.
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      setLoading(false);
      setStreamingMessage("");
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.sender === "bot-stream" && !last.text) {
          next[next.length - 1] = {
            sender: "bot",
            text: "Sorry, I couldn't get a response right now. Please try again.",
            mode: selectedBot,
          };
        }
        return next;
      });
    }, 45000);
    return () => clearTimeout(t);
  }, [loading, selectedBot]);
  const [chatHistory, addChatHistory] = useState([]);
  // Forms are (re)seeded with the market-correct base by the market effect
  // below, mirroring the web app which remounts per market route.
  const [scannerForm, setScannerForm] = useState(() => getBaseScanForm("in"));
  const [basicBacktestForm, setBasicBacktestForm] = useState(() =>
    getBaseBacktestForm("in")
  );
  const [advancedForm, setAdvancedForm] = useState(() =>
    getBaseAdvancedForm("in")
  );
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
      appType: state.appType,
    })
  );

  const { layoutMode, appType } = useSelector(selectDashboardData);
  // Current market ("in" | "crypto"). Falls back to "in" so behaviour is
  // unchanged for the Indian market. Used to send the correct `market` field
  // in chatbot scanner/backtest forms so crypto mode returns crypto results.
  const market = appType || "in";
  const marketKey = market === "crypto" ? "crypto" : "in";
  // Use navigation hook - adjust based on your navigation library
  // const navigation = useNavigation();
  const [isProgressing, setIsProgressing] = useState(false);

  const dispatch = useDispatch();
  const uniqueUserIdRef = useRef(null);
  // Set when the backend reclassifies the prompt to a different bot — the
  // bot-change effect must not wipe the conversation in that case.
  const preserveChatRef = useRef(false);
  const [stratId, setStratId] = useState(new Date().getMilliseconds());

  // Initialize the unique user ID only once
  if (uniqueUserIdRef.current === null) {
    uniqueUserIdRef.current = new Date().getMilliseconds();
  }

  // Bot mode chips per market — mirrored from the unfluke.in web app's chat
  // page. "Youtube Bot" is not a chip (pasting a YouTube link anywhere gets
  // classified server-side via classify_prompt), so each market's chips are its
  // guide tabs minus "Youtube Bot". Crypto has no "Company Fundamentals" — the
  // web bundle's crypto set is [Scanner, Basic Backtest, Advanced Backtest,
  // Youtube Bot], i.e. no company reports for coins.
  const allBots = useMemo(
    () =>
      marketKey === "crypto"
        ? ["Scanner", "Basic Backtest", "Advanced Backtest"]
        : [
            "Company Fundamentals",
            "Fundamental Screener",
            "Scanner",
            "Basic Backtest",
            "Advanced Backtest",
          ],
    [marketKey]
  );

  const bots = useMemo(() => allowedBots || allBots, [allowedBots, allBots]);

  // Map each bot to a lucide icon for the mode chips
  const botIcons = useMemo(
    () => ({
      "Company Fundamentals": FileText,
      "Fundamental Screener": Filter,
      Scanner: Search,
      "Basic Backtest": LineChart,
      "Advanced Backtest": Layers,
    }),
    []
  );

  // Short suggestion pills shown under the mode chips
  const botSuggestions = useMemo(
    () =>
      marketKey === "crypto"
        ? {
            "Company Fundamentals": [
              "BTC market cap",
              "ETH supply",
              "Token overview",
              "Compare BTC vs ETH",
            ],
            Scanner: [
              "BTC daily EMA > SMA",
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
            "Advanced Backtest": [
              "ETH MACDFIX cross",
              "Multi-leg conditions",
              "1-min chart strategy",
              "Profit/stop-loss exits",
            ],
          }
        : {
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
            "Advanced Backtest": [
              "SMA 50 with exits",
              "Multi-leg conditions",
              "MACD cross entry",
              "Trailing stop exit",
            ],
          },
    [marketKey]
  );

  // Add sample questions for each bot type
  const botQuestions = useMemo(
    () =>
      marketKey === "crypto"
        ? {
            "Company Fundamentals": [
              "What is the market cap of Bitcoin?",
              "Compare BTC and ETH performance",
              "What is the circulating supply of ETH?",
            ],
            Scanner: [
              "I want to know where BTC is true for daily EMA > SMA.",
              "Find coins with volume surge",
              "Scan for bullish RSI divergence",
              "Find coins with MACD crossover",
            ],
            "Basic Backtest": [
              "Create a backtest with 1% target and 0.5% stop loss.",
              "I want to backtest a strategy with 2 legs. Both should have 2% target and 1% stop loss.",
              "Backtest a simple moving average crossover strategy",
              "Test RSI overbought/oversold strategy",
            ],
            "Advanced Backtest": [
              "When does ETH spot MACDFIX cross signal line upwards? Use 1 min chart 00:00 to 23:59.",
              "Test a SMA 50 on BTC with exit condition of 20% profit or 10% stop loss",
            ],
          }
        : {
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
            "Advanced Backtest": [
              "Test a SMA 50 on stocks with exit condition of 20% profit or 10% stop loss",
              "Buy when RSI crosses above 30 and exit at 5% profit or 2% stop loss",
            ],
          },
    [marketKey]
  );

  const scannerTypes = useMemo(
    () => ({
      "Fundamental Screener": "fundamental",
      Scanner: "scanner",
    }),
    []
  );

  const aboutBots = useMemo(
    () => ({
      "Company Fundamentals":
        "You can ask about company ratios, financials, and other related queries.",
      "Fundamental Screener":
        "You can create screeners and scanners for stocks.",
      Scanner: "You can get real-time scans on stocks.",
      "Basic Backtest":
        "You can backtest your strategies and view the results.",
      "Advanced Backtest":
        "You can backtest advanced strategies with multiple conditions and view the results.",
    }),
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

  // Single entry point for every bot — web parity. The backend classifies the
  // prompt ("classify_prompt") using the selected bot as a hint plus all three
  // forms, and its stream_ended response tells us which bot actually answered
  // (this is how YouTube links become "Youtube Bot" strategies without a chip).
  const handleMessage = useCallback(() => {
    if (loading || !input.trim()) return;
    if (!auth?.user?._id) {
      Alert.alert("Error", "Please log in again.");
      return;
    }
    if (!chatbotSocket?.connected) {
      Alert.alert(
        "Chat unavailable",
        "Couldn't reach the AI service. Please check your connection and try again."
      );
      return;
    }
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
      chatbotSocket.emit("classify_prompt", {
        userid: auth?.user?._id,
        uniquetoken: uniqueUserIdRef.current,
        message: input,
        api_key: Config.REACT_APP_CHATBOT_TOKEN,
        chat_history: chatHistory,
        scanner_form: scannerForm,
        backtest_form: basicBacktestForm,
        advanced_form: advancedForm,
        market: market,
        bot_type: selectedBot,
      });
    } catch (e) {
      console.error(e);
    }
  }, [
    loading,
    input,
    selectedBot,
    auth?.user?._id,
    chatHistory,
    scannerForm,
    basicBacktestForm,
    advancedForm,
    market,
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
    async (alerts, botOverride) => {
      if (scannerForm && Object.keys(scannerForm).length > 0 && auth) {
        const finalForm = {
          ...scannerForm,
          windowId: uniqueUserIdRef.current,
          user: auth.user,
          scanner_type: scannerTypes[botOverride || selectedBot],
          alert: "false",
          alerts: alerts,
          fnoLotSize: "",
          market: market,
        };
        try {
          await axios.get(`${Config.BACKEND_URL}/api/stocks/`, {
            params: finalForm,
          });
        } catch (e) {
          console.error("Scanner submit failed", e);
          setLoading(false);
          Alert.alert("Error", "Failed to submit scanner. Please try again.");
        }
      }
    },
    [scannerForm, auth, selectedBot, scannerTypes, market]
  );

  const submitBacktestForm = useCallback(async () => {
    if (
      basicBacktestForm &&
      Object.keys(basicBacktestForm).length > 0 &&
      auth
    ) {
      try {
        const result = await addStrategy(
          axios,
          basicBacktestForm,
          null, // navigate — unused inside addStrategy, kept only to match its (axios, strategy, navigate, randomSocketID, ID, isBacktesting, subUrl) signature
          stratId,
          auth?.user?._id,
          isProgressing,
          market
        );
        if (result?.success) {
          setIsProgressing(true);
        } else {
          setLoading(false);
          Alert.alert("Error", result?.message || "Failed to start backtest. Please try again.");
        }
      } catch (e) {
        console.error("Backtest submit failed", e);
        setLoading(false);
        Alert.alert("Error", "Failed to start backtest. Please try again.");
      }
    }
  }, [basicBacktestForm, auth, stratId, isProgressing, market]);

  // Advanced Backtest submit — same endpoint/payload the web chat and the
  // in-app Advanced Backtester screen use.
  const submitAdvancedForm = useCallback(async () => {
    if (advancedForm && Object.keys(advancedForm).length > 0 && auth?.user) {
      const payload = JSON.parse(JSON.stringify(advancedForm));
      payload.user = {
        backtests: parseInt(auth.user.backtests || 0),
        tier: parseInt(auth.user.tier || 0),
        _id: auth.user._id,
      };
      payload.market = market;
      payload.windowId = String(uniqueUserIdRef.current);
      try {
        await axios.post(
          `${Config.BACKEND_URL}/api/stocks/advbacktest`,
          payload
        );
      } catch (e) {
        console.error("Advanced backtest submit failed", e);
        setLoading(false);
        Alert.alert("Error", "Failed to submit backtest. Please try again.");
      }
    }
  }, [advancedForm, auth, market]);

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

  // Route a form returned by the backend to the right state slot. `bot` is
  // the bot_type from the response — the backend may have reclassified the
  // prompt to a different bot than the selected chip.
  const setForm = useCallback((form, bot) => {
    if (bot === "Fundamental Screener" || bot === "Scanner") {
      setScannerForm(form);
    } else if (bot === "Basic Backtest") {
      setBasicBacktestForm(form);
    } else if (bot === "Advanced Backtest") {
      setAdvancedForm(form);
    }
  }, []);

  const submitForm = useCallback(
    (bot) => {
      //SUBMIT FORM ON CONFIRMATION
      const target = bot || selectedBot;
      if (target === "Fundamental Screener" || target === "Scanner") {
        submitScannerForm("false", target);
      } else if (target === "Basic Backtest") {
        submitBacktestForm();
      } else if (target === "Advanced Backtest") {
        submitAdvancedForm();
      }
      setLoading(true);
    },
    [selectedBot, submitScannerForm, submitBacktestForm, submitAdvancedForm]
  );

  // Socket effects with stable dependencies
  useEffect(() => {
    if (backendSocket && auth?.user?._id) {
      // ONCE RESULTS ARE GENERATED
      const handleScannerResults = (data) => {
        if (
          data &&
          data["userId"] == auth?.user?._id &&
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
          setScannerForm(getBaseScanForm(marketKey));
          setScannerResults(data);
          setScannerResultsModalOpen(true);
          setLoading(false);
        }
      };

      const handleBacktestResults = (data) => {
        if (data) {
          if (data.user == auth?.user?._id && data.stratid == stratId) {
            // Same results URL the web app builds for basic backtests.
            const link = `${Config.PUBLIC_URL
              }/${market}/backtester-view?filename=${(data.filename || "").replace(
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
            setBasicBacktestForm(getBaseBacktestForm(marketKey));
            setLoading(false);
          }
        }
      };

      const handleAdvancedResults = (data) => {
        if (
          data &&
          data.userId == auth?.user?._id &&
          data.windowId == uniqueUserIdRef.current
        ) {
          if (data.filename) {
            const link = `${Config.PUBLIC_URL
              }/${market}/backtester-view?filename=${(data.filename || "").replace(
                ".csv",
                ""
              )}&advanced=yes`;
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, prevMessages.length - 1),
              {
                sender: "bot",
                text: `Thank you for using UnflukeAI. You can now view your results [here](${link}).`,
                mode: selectedBot,
              },
            ]);
            setAdvancedForm(getBaseAdvancedForm(marketKey));
          } else {
            // Web parity: no rows for this timeframe — offer the 5-min retry
            // and pre-rewrite every leg expression to the 5-min timeframe so
            // a "yes" simply resubmits.
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, prevMessages.length - 1),
              {
                sender: "bot",
                text: "No results generated for this timeframe. Can I run the strategy on 5-min instead?",
                mode: selectedBot,
              },
            ]);
            setAdvancedForm((prev) => {
              if (!prev?.legs) return prev;
              const next = JSON.parse(JSON.stringify(prev));
              ["entry", "exit"].forEach((side) => {
                (next.legs[side] || []).forEach((leg) => {
                  (leg.scannerExpr || []).forEach((subExpr) => {
                    (subExpr || []).forEach((item) => {
                      if (item.timeframe && item.timeframe !== "5-min") {
                        item.timeframe = "5-min";
                      }
                    });
                  });
                });
              });
              return next;
            });
          }
          addChatHistory((prevHistory) => [
            ...prevHistory,
            { role: "model", content: "Thank you for using UnflukeAI." },
          ]);
          setLoading(false);
        }
      };

      backendSocket.on("scanner-results", handleScannerResults);
      backendSocket.on("csv-filename", handleBacktestResults);
      backendSocket.on("advbacktest-results", handleAdvancedResults);

      return () => {
        backendSocket.off("scanner-results", handleScannerResults);
        backendSocket.off("csv-filename", handleBacktestResults);
        backendSocket.off("advbacktest-results", handleAdvancedResults);
      };
    }
  }, [auth?.user?._id, selectedBot, stratId, market, marketKey]); // Removed messages and chatHistory from dependencies

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
          data["user_id"] == auth?.user?._id &&
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
          data["user_id"] == auth?.user?._id &&
          data["unique_token"] == uniqueUserIdRef.current
        ) {
          const docs = data.docs;
          // The backend classifies the prompt and tells us which bot actually
          // answered — switch the active chip to it (web parity) without
          // wiping the conversation.
          const respBot = data.bot_type || selectedBot;
          if (respBot !== selectedBot && bots.includes(respBot)) {
            preserveChatRef.current = true;
            setSelectedBot(respBot);
            if (onTabChange) {
              onTabChange(respBot);
            }
          }
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, prevMessages.length - 1),
            {
              sender: "bot",
              text: data.message,
              mode: bots.includes(respBot) ? respBot : selectedBot,
              docs: (data.message || "").indexOf("<<IKNOW>>") !== -1 ? docs : {},
            },
          ]);
          if (
            data.form &&
            data.message &&
            (data.form.indexOf("<<SUBMITTING>>") !== -1 ||
              data.message.indexOf("<<SUBMITTING>>") !== -1)
          ) {
            submitForm(respBot);
          } else {
            if (data.form) {
              const regex = /```json([\s\S]*?)```/;
              const match = data.form.match(regex);
              if (match && match[1]) {
                try {
                  // The bot sometimes emits Python literals — normalise to
                  // JSON before parsing (same fixups as the web app).
                  const raw = match[1]
                    .trim()
                    .replace(/\bTrue\b/g, "true")
                    .replace(/\bFalse\b/g, "false")
                    .replace(/\bNone\b/g, "null")
                    .replace(/,(\s*[}\]])/g, "$1");
                  const parsedForm = JSON.parse(raw);
                  setForm(parsedForm, respBot);
                } catch (e) {
                  console.error("Error parsing JSON", e);
                }
              }
            }
            let botRole = "assistant";
            if (
              respBot === "Fundamental Screener" ||
              respBot === "Basic Backtest"
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
  }, [auth, chatbotSocket, selectedBot, bots, onTabChange, submitForm, setForm]); // Removed chatHistory from dependencies

  // Handle defaultInput changes with proper dependency
  useEffect(() => {
    if (defaultInput) {
      setInput(defaultInput);
    }
  }, [defaultInput]); // Removed setInput from dependencies as it's a state setter

  // Handle botExplanation changes with stable dependencies
  useEffect(() => {
    if (aboutBots[selectedBot]) {
      setBotExplanation(aboutBots[selectedBot]);
    }
  }, [selectedBot, aboutBots]);

  // Handle bot type changes with stable dependencies
  useEffect(() => {
    setScannerResultsType(scannerTypes[selectedBot] || "fundamental");
    if (setBotType) {
      setBotType(selectedBot);
    }
    if (preserveChatRef.current) {
      // Backend-driven reclassification — keep the conversation.
      preserveChatRef.current = false;
      return;
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

  // Re-seed the bot forms whenever the market changes — the web app gets this
  // for free because its chat page remounts per market route. Also runs on
  // mount, so the initial "in"-seeded state is corrected for crypto users.
  useEffect(() => {
    setScannerForm(getBaseScanForm(marketKey));
    setBasicBacktestForm(getBaseBacktestForm(marketKey));
    setAdvancedForm(getBaseAdvancedForm(marketKey));
    if (!allBots.includes(selectedBot)) {
      // e.g. "Fundamental Screener" doesn't exist in crypto mode.
      setSelectedBot(allBots[0]);
    }
    // TODO(human): decide what happens to the ongoing conversation
    // (messages + chatHistory) when the user flips NSE <-> crypto while
    // this screen stays mounted.
  }, [marketKey]);

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
          market={market}
          typeAndAsk={(question) => {
            // Jump to the tab the question belongs to (web parity); YouTube
            // links have no tab — the backend classifies them on send.
            const targetTab = question_tab_mapping[question];
            if (targetTab && bots.includes(targetTab)) {
              setSelectedBot(targetTab);
              if (onTabChange) {
                onTabChange(targetTab);
              }
            }
            setInput(question);
          }}
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
          onPress={() => setChatbotGuideOpen(true)}
        >
          <HelpCircle size={17} color={c.textSecondary} />
        </TouchableOpacity>
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
                  setBotExplanation(aboutBots[bot]);
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={80}
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

      {/* Input Area — KeyboardStickyView pins it directly above the keyboard */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
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
      </KeyboardStickyView>
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
