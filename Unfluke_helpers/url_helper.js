//REGISTER
export const POST_FAKE_REGISTER = "/auth/signup";

//LOGIN
export const POST_FAKE_LOGIN = "/auth/signin";
export const POST_FAKE_JWT_LOGIN = "/post-jwt-login";
export const POST_FAKE_PASSWORD_FORGET = "/auth/forgot-password";
export const POST_FAKE_JWT_PASSWORD_FORGET = "/jwt-forget-pwd";
export const SOCIAL_LOGIN = "/social-login";

// USER EVENTS TRACKING
export const POST_USER_TRACK_EVENT = "/api/user-events/track";
export const POST_USER_BATCH_TRACK_EVENT = "/api/user-events/batch-track";

// UNFLUKE-LOGIN / REGISTRATION
export const POST_JWT_LOGIN = "/api/user/login";
export const POST_PASSWORD_FORGET = "/api/user/forgot-password";
export const POST_LOGIN_REFRESH_TOKEN = "/api/user/refresh_token";
export const GET_USER_INFO = "/api/user/info";
export const POST_USER_REGISTRATION = "/api/user/register";
export const POST_ACCOUNT_ACTIVATION = "/api/user/activation";
export const POST_CHANGE_PASSWORD = "api/user/changePassword";
export const POST_PHONE_SEND_OTP = "/api/phone/sendOTP";
export const POST_PHONE_VERIFY_OTP = "/api/phone/verifyOTP";
export const POST_EMAIL_SEND_OTP = "/api/user/sendVerificationMail";
export const POST_EMAIL_VERIFY_OTP = "/api/user/verifyMail";

// UNFLUKE BUY BASIC BACKTEST STRATEGY
export const POST_BUY_BASIC_STRATEGY = "api/strategy/createStrategy";

// Unfluke - HistoricalTrading
export const GET_HISTORICAL_TRADING_CHART_DATA =
  "api/historicData/data/histoTradingminute";
export const GET_HISTORICAL_CHART_DATA =
  "api/historicData/data/historicalChartIndexMinute";
export const HISTORICAL_ORDERS = "api/historicTrading/historicOrders";
export const GET_HISTORICAL_HOLDINGS =
  "api/historicHoldings/getHistoricHoldings";
export const GET_HISTORICAL_POSITIONS =
  "api/historicPositions/getHistoricPositions";
export const POST_HISTORICAL_FEED = "api/historicTrading/getHistoricFeed";
export const GET_INSTRUMENTS = "api/historicData/getInstrument";

// Unfluke -Historical Orders
export const GET_HISTORICAL_INSTRUMENT_DATA =
  "api/trading/getHistoricInstrumentData";
export const POST_HISTORICAL_TRADE =
  "api/historicTrading/setHistoricTradeBuySell";

// Unfluke - HistoricalTrading - watchList
export const HISTORICAL_WATCHLIST =
  "api/historicTrading/historicTradingWatchlist";
export const GET_LAST_DATE = "api/historicTrading/getLastDate";

export const GET_HISTORICAL_SEARCH_RESULTS =
  "api/trading/getHistoricSearchResults";
export const GET_HISTORICAL_OPTIONS_EXPIRY_DATE =
  "api/trading/getOptionsExpiryDate";
export const GET_HISTORICAL_OPTIONS_STRIKE_PRICES =
  "api/trading/gitHistoricOptionsStikePrices";
export const GET_HISTORICAL_OPTIONS_RESULTS =
  "api/trading/getHistoricOptionsResults";

// Unfluke - Straegy Charts
export const GET_OPTIONS_NAMES = "api/historicalChart/getOptionNames";
export const GET_OPTIONS_CHART_RESULT =
  "api/historicalChart/getHistoricOptionsResults";
export const GET_STRADLE_CHART_RESULT =
  "api/historicalChart/getStradleOptionResults";
export const GET_SPREAD_CHART_RESULT =
  "api/historicalChart/getSpreadOptionResults";
export const GET_BUTTERFLY_CHART_RESULT =
  "api/historicalChart/getButterFlyResults";
export const GET_IRON_CONDOR_CHART_RESULT =
  "api/historicalChart/getIronFlyResults";
export const GET_DOUBLE_CALENDAR_CHART_RESULT =
  "api/historicalChart/getDCalResults";
export const GET_STRADDLE_COMBO_CHART_RESULT =
  "api/historicalChart/getComboResults";
export const GET_OPTIONS_EXPIRY = "api/option-simulator/getOptionsExpiryDates";
export const GET_OPTIONS_STRIKES =
  "api/historicalChart/gitHistoricOptionsStikePrices";
export const GET_STRADLE_EXPIRY = "api/historicalChart/getStradleExpiryDate";

// Unfluke - LeaderBoard
export const GET_BACKTEST_LEADERBOARD = "api/strategy/getBacktestLeaders";

// Unfluke - Basic Backtest
export const GET_SAVED_BACKTEST = "api/strategy";
export const GET_SAVED_BACKTEST_COUNT = "api/strategy/instrumentCount";
export const GET_PURCHASED_BACKTEST = "api/strategy/basic/purchased";

// top performers
export const GET_TOP_PERFORMERS = "api/movement";

// Unfluke - Scanner/Alert
export const POST_SCANNER_ALERT_LIST = "api/scanner/getScanners";
export const GET_ADMIN_SCANNER_LIST = "api/scanner/getAdminScanners";

// Unfluke - Membership Plans
export const GET_MEMBERSHIP_PLANS = "api/payment/paymentDatabase";
export const POST_CHECK_COUPON = "api/payment/coupon";
export const POST_BUY_MEMBERSHIP = "api/ccavenue/buyMembership";
// Apple In-App Purchase — server-side receipt/JWS verification + entitlement unlock.
// Backend must verify with Apple's App Store Server API before granting the tier.
export const POST_VERIFY_APPLE_PURCHASE = "api/payment/verifyApplePurchase";

// HDFC SmartGateway (Android in-app checkout — see PAYMENT_DOCS.md).
// createOrder is auth'd with the RAW access token (no "Bearer " prefix); status
// is public. The client never sends an amount — the server resolves it from planId.
export const POST_HDFC_CREATE_ORDER = "api/hdfc-payment/createOrder";
export const GET_HDFC_PAYMENT_STATUS = "api/hdfc-payment/status"; // append /:orderId

// Unfluke - Wallet History
export const GET_WALLET_HISTORY = "api/wallet/history";
export const POST_CCAVENUE_ORDER = "api/ccavenue/createOrder";
export const GET_ADDABLE_FUNDS_LIST = "api/payment/getAddableFundAmounts";

// Unfluke - Notifications
export const GET_ALL_NOTIFICATIONS = "api/notifications/getNotifications";
export const POST_READ_NOTIFICATIONS =
  "api/notifications/setAllNotificationsRead";

// Unfluke - Backtest My Strategy
export const GET_TESTED_STRATEGIES = "api/test-my-strategy/tested";
export const GET_PENDING_STRATEGIES = "api/test-my-strategy/pending";
export const GET_ALL_STRATEGIES = "api/test-my-strategy/all";
export const POST_STRATEGY = "api/test-my-strategy/create";
export const POST_STRATEGY_UPVOTE = "api/test-my-strategy/upvote/:id";
export const POST_STRATEGY_LIKE = "api/test-my-strategy/like/:id";

// Unfluke - Option Simulator
export const GET_OPTION_CHAIN = "api/optionChain";
// NOTE: the legacy "api/historicalChart/getOptionsExpiryDate" route hangs
// server-side (no response, connection kept open) which left the simulator
// stuck on "-" / "Loading Option Table...". The option-simulator route below
// serves the same expiry list and responds normally. The simulator's
// fetchExpiries adapts its string[] response into the {to_expiry,from_expiry}
// shape the date logic expects.
export const GET_SIMULATOR_EXPIRIES =
  "api/option-simulator/getOptionsExpiryDates";
export const GET_CURRENT_DATA = "api/optionChain/fetchCurrentData";
export const POST_PAYOFF_CHART_DATA = "api/optionChain/fetchPayoffChartData";
export const POST_TICKER_PRICE = "api/optionChain/getPrice";

// Unfluke - Chat Search
export const GET_SEARCH = "api/historicData/search";
export const GET_PROFIT_LOSS = "api/historicData/profitloss";
export const GET_BALANCE_SHEET = "api/historicData/balancesheet";
export const GET_BALANCE_SHEET_DATA = "api/screener/getBalanceSheet"; //new
export const GET_PROFIT_LOSS_DATA = "api/screener/getProfitLoss"; // new
export const GET_QUATERLY_RESULT_DATA = "api/screener/getQuarterly"; //new
export const GET_BANKING_DATA = "api/screener/getBanking"; // new
export const GET_CASH_FLOW = "api/historicData/cashflow";
export const GET_CASH_FLOW_DATA = "api/screener/getCashFlow"; // new
export const GET_QUATERLY_RESULT = "api/historicData/quaterlyresult";
export const GET_RATIOS_DATA = "api/historicData/ratios";
export const GET_EVENTS_DATA = "api/historicData/events";
export const GET_DEALS_DATA = "api/historicData/deals";
export const GET_BULK_BLOCK_DEALS_DATA = "api/screener/getBulkBlockDeals";
export const GET_DAILY_RATIOS_DATA = "api/historicData/dailyratios";
export const GET_SHAREHOLDING_DATA = "api/historicData/shareholding";
export const GET_DOCUMENTS_DATA = "api/historicData/documents";
export const GET_COMPANY_NAME = "api/historicData/companyname";
export const GET_STOCK_SYMBOL = "api/scanner/getStockSymbolByCapitaline";
export const GET_COMPANY_CODE = "api/historicData/companycode";
export const GET_ASCR_DATA = "api/historicData/getascr";
export const GET_ANNUAL_REPORT_DATA = "api/historicData/getannual";

//PROFILE
export const POST_EDIT_JWT_PROFILE = "/post-jwt-profile";
export const POST_EDIT_PROFILE = "/user";

// Calendar
export const GET_EVENTS = "/events";
export const GET_CATEGORIES = "/categories";
export const GET_UPCOMMINGEVENT = "/upcommingevents";
export const ADD_NEW_EVENT = "/add/event";
export const UPDATE_EVENT = "/update/event";
export const DELETE_EVENT = "/delete/event";

// Chat
export const GET_DIRECT_CONTACT = "/chat";
export const GET_MESSAGES = "/messages";
export const ADD_MESSAGE = "add/message";
export const GET_CHANNELS = "/channels";
export const DELETE_MESSAGE = "delete/message";

//Mailbox
export const GET_MAIL_DETAILS = "/mail";
export const DELETE_MAIL = "/delete/mail";

// Ecommerce
// Product
export const GET_PRODUCTS = "/apps/product";
export const DELETE_PRODUCT = "/apps/product";
export const ADD_NEW_PRODUCT = "/apps/product";
export const UPDATE_PRODUCT = "/apps/product";

// Orders
export const GET_ORDERS = "/apps/order";
export const ADD_NEW_ORDER = "/apps/order";
export const UPDATE_ORDER = "/apps/order";
export const DELETE_ORDER = "/apps/order";

// Customers
export const GET_CUSTOMERS = "/apps/customer";
export const ADD_NEW_CUSTOMER = "/apps/customer";
export const UPDATE_CUSTOMER = "/apps/customer";
export const DELETE_CUSTOMER = "/apps/customer";

// Sellers
export const GET_SELLERS = "/sellers";

// Project list
export const GET_PROJECT_LIST = "/project/list";

// Task
export const GET_TASK_LIST = "/apps/task";
export const ADD_NEW_TASK = "/apps/task";
export const UPDATE_TASK = "/apps/task";
export const DELETE_TASK = "/apps/task";

// CRM
// Conatct
export const GET_CONTACTS = "/apps/contact";
export const ADD_NEW_CONTACT = "/apps/contact";
export const UPDATE_CONTACT = "/apps/contact";
export const DELETE_CONTACT = "/apps/contact";

// Companies
export const GET_COMPANIES = "/apps/company";
export const ADD_NEW_COMPANIES = "/apps/company";
export const UPDATE_COMPANIES = "/apps/company";
export const DELETE_COMPANIES = "/apps/company";

// Lead
export const GET_LEADS = "/apps/lead";
export const ADD_NEW_LEAD = "/apps/lead";
export const UPDATE_LEAD = "/apps/lead";
export const DELETE_LEAD = "/apps/lead";

// Deals
export const GET_DEALS = "/deals";

// Crypto
export const GET_TRANSACTION_LIST = "/transaction-list";
export const GET_ORDRER_LIST = "/order-list";

// Invoice
export const GET_INVOICES = "/apps/invoice";
export const ADD_NEW_INVOICE = "/apps/invoice";
export const UPDATE_INVOICE = "/apps/invoice";
export const DELETE_INVOICE = "/apps/invoice";

// TicketsList
export const GET_TICKETS_LIST = "/apps/ticket";
export const ADD_NEW_TICKET = "/apps/ticket";
export const UPDATE_TICKET = "/apps/ticket";
export const DELETE_TICKET = "/apps/ticket";

// kanban
export const GET_TASKS = "/apps/tasks";
export const ADD_TASKS = "/add/tasks";
export const UPDATE_TASKS = "/update/tasks";
export const DELETE_TASKS = "/delete/tasks";

// Dashboard Analytics

// Sessions by Countries
export const GET_ALL_DATA = "/all-data";
export const GET_HALFYEARLY_DATA = "/halfyearly-data";
export const GET_MONTHLY_DATA = "/monthly-data";

// Audiences Metrics
export const GET_ALLAUDIENCESMETRICS_DATA = "/allAudiencesMetrics-data";
export const GET_MONTHLYAUDIENCESMETRICS_DATA = "/monthlyAudiencesMetrics-data";
export const GET_HALFYEARLYAUDIENCESMETRICS_DATA =
  "/halfyearlyAudiencesMetrics-data";
export const GET_YEARLYAUDIENCESMETRICS_DATA = "/yearlyAudiencesMetrics-data";

// Users by Device
export const GET_TODAYDEVICE_DATA = "/todayDevice-data";
export const GET_LASTWEEKDEVICE_DATA = "/lastWeekDevice-data";
export const GET_LASTMONTHDEVICE_DATA = "/lastMonthDevice-data";
export const GET_CURRENTYEARDEVICE_DATA = "/currentYearDevice-data";

// Audiences Sessions by Country
export const GET_TODAYSESSION_DATA = "/todaySession-data";
export const GET_LASTWEEKSESSION_DATA = "/lastWeekSession-data";
export const GET_LASTMONTHSESSION_DATA = "/lastMonthSession-data";
export const GET_CURRENTYEARSESSION_DATA = "/currentYearSession-data";

// Dashboard CRM

// Balance Overview
export const GET_TODAYBALANCE_DATA = "/todayBalance-data";
export const GET_LASTWEEKBALANCE_DATA = "/lastWeekBalance-data";
export const GET_LASTMONTHBALANCE_DATA = "/lastMonthBalance-data";
export const GET_CURRENTYEARBALANCE_DATA = "/currentYearBalance-data";

// Deal type
export const GET_TODAYDEAL_DATA = "/todayDeal-data";
export const GET_WEEKLYDEAL_DATA = "/weeklyDeal-data";
export const GET_MONTHLYDEAL_DATA = "/monthlyDeal-data";
export const GET_YEARLYDEAL_DATA = "/yearlyDeal-data";

// Sales Forecast

export const GET_OCTSALES_DATA = "/octSales-data";
export const GET_NOVSALES_DATA = "/novSales-data";
export const GET_DECSALES_DATA = "/decSales-data";
export const GET_JANSALES_DATA = "/janSales-data";

// Dashboard Ecommerce
// Revenue
export const GET_ALLREVENUE_DATA = "/allRevenue-data";
export const GET_MONTHREVENUE_DATA = "/monthRevenue-data";
export const GET_HALFYEARREVENUE_DATA = "/halfYearRevenue-data";
export const GET_YEARREVENUE_DATA = "/yearRevenue-data";

// Dashboard Crypto
// Portfolio
export const GET_BTCPORTFOLIO_DATA = "/btcPortfolio-data";
export const GET_USDPORTFOLIO_DATA = "/usdPortfolio-data";
export const GET_EUROPORTFOLIO_DATA = "/euroPortfolio-data";

// Market Graph
export const GET_ALLMARKETDATA_DATA = "/allMarket-data";
export const GET_YEARMARKET_DATA = "/yearMarket-data";
export const GET_MONTHMARKET_DATA = "/monthMarket-data";
export const GET_WEEKMARKET_DATA = "/weekMarket-data";
export const GET_HOURMARKET_DATA = "/hourMarket-data";

// Dashboard Crypto
// Project Overview
export const GET_ALLPROJECT_DATA = "/allProject-data";
export const GET_MONTHPROJECT_DATA = "/monthProject-data";
export const GET_HALFYEARPROJECT_DATA = "/halfYearProject-data";
export const GET_YEARPROJECT_DATA = "/yearProject-data";

// Project Status
export const GET_ALLPROJECTSTATUS_DATA = "/allProjectStatus-data";
export const GET_WEEKPROJECTSTATUS_DATA = "/weekProjectStatus-data";
export const GET_MONTHPROJECTSTATUS_DATA = "/monthProjectStatus-data";
export const GET_QUARTERPROJECTSTATUS_DATA = "/quarterProjectStatus-data";

// Dashboard NFT
// Marketplace
export const GET_ALLMARKETPLACE_DATA = "/allMarketplace-data";
export const GET_MONTHMARKETPLACE_DATA = "/monthMarketplace-data";
export const GET_HALFYEARMARKETPLACE_DATA = "/halfYearMarketplace-data";
export const GET_YEARMARKETPLACE_DATA = "/yearMarketplace-data";

// Project
export const ADD_NEW_PROJECT = "/add/project";
export const UPDATE_PROJECT = "/update/project";
export const DELETE_PROJECT = "/delete/project";

// Pages > Team
export const GET_TEAMDATA = "/teamData";
export const DELETE_TEAMDATA = "/delete/teamData";
export const ADD_NEW_TEAMDATA = "/add/teamData";
export const UPDATE_TEAMDATA = "/update/teamData";

// File Manager
// Folder
export const GET_FOLDERS = "/folder";
export const DELETE_FOLDER = "/delete/folder";
export const ADD_NEW_FOLDER = "/add/folder";
export const UPDATE_FOLDER = "/update/folder";

// File
export const GET_FILES = "/file";
export const DELETE_FILE = "/delete/file";
export const ADD_NEW_FILE = "/add/file";
export const UPDATE_FILE = "/update/file";

// To do
export const GET_TODOS = "/todo";
export const DELETE_TODO = "/delete/todo";
export const ADD_NEW_TODO = "/add/todo";
export const UPDATE_TODO = "/update/todo";

// To do Project
export const GET_PROJECTS = "/projects";
export const ADD_NEW_TODO_PROJECT = "/add/project";

//JOB APPLICATION
export const GET_APPLICATION_LIST = "/application-list";

//JOB APPLICATION
export const GET_API_KEY = "/api-key";

// ─────────────────────────────────────────────────────────────
// CRYPTO FUNDAMENTALS (mirrors website's /api/crypto/* endpoints)
// All GET. Base is Config.BACKEND_URL (https://api.unfluke.in).
// The axios interceptor auto-attaches the `mrkt` header, so these
// return crypto-scoped data when the market is "crypto".
// ─────────────────────────────────────────────────────────────
// Registry / search
export const GET_CRYPTO_ALL_COINS = "/api/crypto/getAllCoins";
export const GET_CRYPTO_SEARCH_COINS = "/api/crypto/searchCoins";
export const GET_CRYPTO_ALL_EQUITIES = "/api/crypto/getAllEquities";
export const GET_CRYPTO_ALL_FUTURES = "/api/crypto/getAllFutures";
export const GET_CRYPTO_ALL_OPTIONS = "/api/crypto/getAllOptions";
// Coin fundamentals
export const GET_CRYPTO_COIN_INFO = "/api/crypto/getCoinInfo";
export const GET_CRYPTO_COIN_INFO_ALT = "/api/crypto/getCryptoCoinInfo";
export const GET_CRYPTO_DERIVATIVES = "/api/crypto/getDerivativesData";
export const GET_CRYPTO_DERIVATIVES_ALT = "/api/crypto/getCryptoDerivativesData";
export const GET_CRYPTO_LIGHTNING = "/api/crypto/getLightningNetwork";
export const GET_CRYPTO_ONCHAIN = "/api/crypto/getOnChainData";
export const GET_CRYPTO_PRICE_HISTORY = "/api/crypto/getPriceHistory";
export const GET_CRYPTO_ETHERSCAN_ONCHAIN = "/api/crypto/getCryptoEtherScanOnChains";
// Bitcoin on-chain time series (no params)
export const GET_CRYPTO_BTC_LIGHTNINGS = "/api/crypto/getCryptoBitcoinLightings";
export const GET_CRYPTO_BTC_NETWORK_ACTIVITIES = "/api/crypto/getCryptoBitcoinNetworkActivities";
export const GET_CRYPTO_BTC_TXN_COUNT = "/api/crypto/getCryptoBitcoinChainsTransactionCount";
export const GET_CRYPTO_BTC_TXN_VOLUME = "/api/crypto/getCryptoBitcoinChainsTransactionVolume";
export const GET_CRYPTO_BTC_UTXO_COUNT = "/api/crypto/getCryptoBitcoinChainsUtxoCount";
export const GET_CRYPTO_BTC_TOTAL_BITCOINS = "/api/crypto/getCryptoBitcoinChainsTotalBitcoins";
export const GET_CRYPTO_BTC_TOTAL_FEES = "/api/crypto/getCryptoBitcoinChainsTotalFees";
export const GET_CRYPTO_BTC_HASH_RATE = "/api/crypto/getCryptoBitcoinChainsHashRate";
export const GET_CRYPTO_BTC_DIFFICULTY = "/api/crypto/getCryptoBitcoinChainsDifficulty";
export const GET_CRYPTO_BTC_MINERS_REVENUE = "/api/crypto/getCryptoBitcoinChainsMinersRevenue";
export const GET_CRYPTO_BTC_MEMPOOL_SIZE = "/api/crypto/getCryptoBitcoinChainsMempoolSizeBytes";
export const GET_CRYPTO_BTC_AVG_BLOCK_SIZE = "/api/crypto/getCryptoBitcoinChainsAvgBlockSize";
export const GET_CRYPTO_BTC_BLOCKCHAIN_SIZE = "/api/crypto/getCryptoBitcoinChainsBlockchainSize";
export const GET_CRYPTO_BTC_MARKET_CAP = "/api/crypto/getCryptoBitcoinChainsMarketCap";
// Price-history projections (?symbol=)
export const GET_CRYPTO_PH_DATAPOINTS = "/api/crypto/getCryptoPriceHistoryDataPoints";
export const GET_CRYPTO_PH_PRICES = "/api/crypto/getCryptoPriceHistoryPrices";
export const GET_CRYPTO_PH_MARKET_CAPS = "/api/crypto/getCryptoPriceHistoryMarketCaps";
export const GET_CRYPTO_PH_VOLUMES = "/api/crypto/getCryptoPriceHistoryVolumes";
export const GET_CRYPTO_PH_OHLC = "/api/crypto/getCryptoPriceHistoryOhlc";
// Market-wide
export const GET_CRYPTO_FEAR_GREED = "/api/crypto/getCryptoFearGreedIndexes";
export const GET_CRYPTO_GLOBAL_MARKET = "/api/crypto/getCryptoGlobalMarketDatas";
