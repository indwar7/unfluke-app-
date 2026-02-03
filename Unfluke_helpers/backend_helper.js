import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

// //is user is logged in
export const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

export const fetchStrategyChartData = (link, params) => api.get(link, params);
export const fetchData = (link, params) => api.get(link, params);
export const postData = (link, data) => api.create(link, data);

// Login Method
export const postJwtLogin = (data) => api.create(url.POST_JWT_LOGIN, data);
export const postForgetPwd = (data) =>
  api.create(url.POST_PASSWORD_FORGET, data);

// User Events Tracking
export const postUserTrackEvent = (data) =>
  api.create(url.POST_USER_TRACK_EVENT, data);
export const postUserBatchTrackEvent = (data) =>
  api.create(url.POST_USER_BATCH_TRACK_EVENT, data);

// CHANGE PASSWORD
export const postChangePassword = (data) =>
  api.create(url.POST_CHANGE_PASSWORD, data);
// Referesh Token Method
export const postLoginRefeshToken = (data) =>
  api.create(url.POST_LOGIN_REFRESH_TOKEN, data);

// GET USER INFO
export const getUserInfo = (data) => api.get(url.GET_USER_INFO, data);

// EMAIL ACTIVTION
export const postAccountActivation = (data) =>
  api.create(url.POST_ACCOUNT_ACTIVATION, data);
export const postEmailSendOtp = (data) =>
  api.create(url.POST_EMAIL_SEND_OTP, data);
export const postVerifyEmailOtp = (data) =>
  api.create(url.POST_EMAIL_VERIFY_OTP, data);

// PHONE VERIFICATION
export const postPhoneSendOtp = (data) =>
  api.create(url.POST_PHONE_SEND_OTP, data);
export const postVerifyPhoneOtp = (data) =>
  api.create(url.POST_ACCOUNT_ACTIVATION, data);

// ChatBot Search
export const getSearch = (data) => api.get(url.GET_SEARCH, data);
export const getProfitLoss = (data) => api.get(url.GET_PROFIT_LOSS, data);
export const getBalanceSheet = (data) => api.get(url.GET_BALANCE_SHEET, data);
// fundamentals, balance sheet data. new table.
export const getBalanceSheetData = (data) =>
  api.get(url.GET_BALANCE_SHEET_DATA, data);
export const getProfitLossData = (data) =>
  api.get(url.GET_PROFIT_LOSS_DATA, data);
export const getQuaterlyResultData = (data) =>
  api.get(url.GET_QUATERLY_RESULT_DATA, data);
export const getBankingData = (data) => api.get(url.GET_BANKING_DATA, data);

export const getCashFlow = (data) => api.get(url.GET_CASH_FLOW, data);
export const getCashFlowData = (data) => api.get(url.GET_CASH_FLOW_DATA, data); //new
export const getQuaterlyResult = (data) =>
  api.get(url.GET_QUATERLY_RESULT, data);
export const getRatiosData = (data) => api.get(url.GET_RATIOS_DATA, data);
export const getEventsData = (data) => api.get(url.GET_EVENTS_DATA, data);
export const getDealsData = (data) => api.get(url.GET_DEALS_DATA, data);
export const getBulkBlockDealsData = (data) =>
  api.get(url.GET_BULK_BLOCK_DEALS_DATA, data); //new
export const getDailyRatiosData = (data) =>
  api.get(url.GET_DAILY_RATIOS_DATA, data);
export const getShareholdingData = (data) =>
  api.get(url.GET_SHAREHOLDING_DATA, data);
export const getDocumentsData = (data) => api.get(url.GET_DOCUMENTS_DATA, data);
export const getCompanyName = (data) => api.get(url.GET_COMPANY_NAME, data);
export const getStockSymbol = (data) => api.get(url.GET_STOCK_SYMBOL, data);
export const getCompanyCode = (data) => api.get(url.GET_COMPANY_CODE, data);

export const getAscrData = (data) => api.get(url.GET_ASCR_DATA, data);
export const getAnnualReportData = (data) =>
  api.get(url.GET_ANNUAL_REPORT_DATA, data);

// Historical Data
export const getHistoricalChartData = (data) =>
  api.get(url.GET_HISTORICAL_TRADING_CHART_DATA, data);
export const getHistoricTradingLastDate = (data) =>
  api.get(url.GET_LAST_DATE, data);
export const getSampleChartData = (data) =>
  api.get(url.GET_HISTORICAL_CHART_DATA, data);
export const postHistoricalFeed = (data) =>
  api.create(url.POST_HISTORICAL_FEED, data);
export const getHistoricalHoldings = (data) =>
  api.get(url.GET_HISTORICAL_HOLDINGS, data);
export const getHistoricalPositions = (data) =>
  api.get(url.GET_HISTORICAL_POSITIONS, data);
export const getHistoricalInstruments = (data) =>
  api.get(url.GET_INSTRUMENTS, data);
export const getHistoricalInstrumentData = (data) =>
  api.get(url.GET_HISTORICAL_INSTRUMENT_DATA, data);

// Historical orders
export const getHistoricalOrders = (data) =>
  api.get(url.HISTORICAL_ORDERS, data);
export const postHistoricalOrders = (data) =>
  api.create(url.HISTORICAL_ORDERS, data);
export const postHistoricalTrades = (data) =>
  api.create(url.POST_HISTORICAL_TRADE, data);
export const updateHistoricalOrders = (data) =>
  api.put(url.HISTORICAL_ORDERS, data);
export const deleteHistoricalOrders = (data) =>
  api.delete(url.HISTORICAL_ORDERS, data);

// Historical Watchlist
export const getHistoricalWatchlist = (data) =>
  api.get(url.HISTORICAL_WATCHLIST, data);
export const postHistoricalWatchlist = (data) =>
  api.create(url.HISTORICAL_WATCHLIST, data);
export const updateHistoricalWatchlist = (data) =>
  api.put(url.HISTORICAL_WATCHLIST, data);
export const deleteHistoricalWatchlist = (data) =>
  api.delete(url.HISTORICAL_WATCHLIST, data);

export const getWatchlistSearchResults = (data) =>
  api.get(url.GET_HISTORICAL_SEARCH_RESULTS, data);
export const getWatchlistExpiryDate = (data) =>
  api.get(url.GET_HISTORICAL_OPTIONS_EXPIRY_DATE, data);
export const getWatchlistStrikePrices = (data) =>
  api.get(url.GET_HISTORICAL_OPTIONS_STRIKE_PRICES, data);
export const getWatchlistOptionsResults = (data) =>
  api.get(url.GET_HISTORICAL_OPTIONS_RESULTS, data);

// Strategy Charts
export const getOptionNames = (data) => api.get(url.GET_OPTIONS_NAMES, data);
export const getOptionChartResult = (data) =>
  api.get(url.GET_OPTIONS_CHART_RESULT, data);
export const getStradleChartResult = (data) =>
  api.get(url.GET_STRADLE_CHART_RESULT, data);
export const getSpreadChartResult = (data) =>
  api.get(url.GET_SPREAD_CHART_RESULT, data);
export const getButterflyChartResult = (data) =>
  api.get(url.GET_BUTTERFLY_CHART_RESULT, data);
export const getIronChartResult = (data) =>
  api.get(url.GET_IRON_CONDOR_CHART_RESULT, data);
export const getDoubleCalChartResult = (data) =>
  api.get(url.GET_DOUBLE_CALENDAR_CHART_RESULT, data);
export const getStraddleComboChartResult = (data) =>
  api.get(url.GET_STRADDLE_COMBO_CHART_RESULT, data);
export const getOptionsExpiries = (data) =>
  api.get(url.GET_OPTIONS_EXPIRY, data);
export const getOptionsStrikes = (data) =>
  api.get(url.GET_OPTIONS_STRIKES, data);
export const getStradleStrikes = (data) =>
  api.get(url.GET_STRADLE_EXPIRY, data);

// BACKTEST MY STRATEGY
export const postStrategy = (data) => api.create(url.POST_STRATEGY, data);
export const getTestedStrategies = (data) =>
  api.get(url.GET_TESTED_STRATEGIES, data);
export const getPendingStrategies = (data) =>
  api.get(url.GET_PENDING_STRATEGIES, data);
export const postStrategyLike = (data) =>
  api.create(url.POST_STRATEGY_LIKE, data);
export const postStrategyUpvote = (data) =>
  api.create(url.POST_STRATEGY_UPVOTE, data);
export const getStrategies = (data) => api.get(url.GET_ALL_STRATEGIES, data);

// OPTION SIMULATOR
export const getSimulatorExpiries = (data) =>
  api.get(url.GET_SIMULATOR_EXPIRIES, data);
export const getOptionChain = (data) => api.get(url.GET_OPTION_CHAIN, data);
export const getSpotFutureData = (data) => api.get(url.GET_CURRENT_DATA, data);
export const postPayOffChartData = (data) =>
  api.create(url.POST_PAYOFF_CHART_DATA, data);
export const postTickerPrice = (data) =>
  api.create(url.POST_TICKER_PRICE, data);

// LEADERBOARD DATA
export const getBacktestLeaders = (data) =>
  api.get(url.GET_BACKTEST_LEADERBOARD, data);

// Basic Backtest
export const getSavedBasicBacktestCount = (data) =>
  api.get(url.GET_SAVED_BACKTEST_COUNT, data);
export const getSavedBasicBacktest = (data) =>
  api.get(url.GET_SAVED_BACKTEST, data);
export const getPurchasedBasicBacktest = (data) =>
  api.get(url.GET_PURCHASED_BACKTEST, data);

// Top Performers
export const getTopPerformers = (data) => api.get(url.GET_TOP_PERFORMERS, data);

// Notification
export const getNotifications = (data) =>
  api.get(url.GET_ALL_NOTIFICATIONS, data);
export const postReadNotifications = (data) =>
  api.create(url.POST_READ_NOTIFICATIONS, data);

// SCANNER / ALERT
export const postScannerAlertList = (data) =>
  api.create(url.POST_SCANNER_ALERT_LIST, data);
export const getAdminScannerList = (data) =>
  api.get(url.GET_ADMIN_SCANNER_LIST, data);

// Memebership Plans
export const getMembershipPlans = (data) =>
  api.get(url.GET_MEMBERSHIP_PLANS, data);
export const postCheckCoupon = (data) =>
  api.create(url.POST_CHECK_COUPON, data);
export const postBuyMembership = (data) =>
  api.create(url.POST_BUY_MEMBERSHIP, data);

//
export const postBuyBasicStrategy = (data) =>
  api.create(url.POST_BUY_BASIC_STRATEGY, data);

// Wallet History
export const getWalletHistory = (data) => api.get(url.GET_WALLET_HISTORY, data);
export const postCcAvenueOrder = (data) =>
  api.create(url.POST_CCAVENUE_ORDER, data);
export const getAddableFundList = (data) =>
  api.get(url.GET_ADDABLE_FUNDS_LIST, data);

// Register Method
export const postFakeRegister = (data) =>
  api.create(url.POST_FAKE_REGISTER, data);

// Login Method
export const postFakeLogin = (data) => api.create(url.POST_FAKE_LOGIN, data);

// postForgetPwd
export const postFakeForgetPwd = (data) =>
  api.create(url.POST_FAKE_PASSWORD_FORGET, data);

// Edit profile
export const postJwtProfile = (data) =>
  api.create(url.POST_EDIT_JWT_PROFILE, data);

export const postFakeProfile = (data) =>
  api.update(url.POST_EDIT_PROFILE + "/" + data.idx, data);

// Register Method
export const postJwtRegister = (url, data) => {
  return api.create(url, data).catch((err) => {
    if (err.includes("Network Error")) {
      window.location.href = "/maintenance";
    }
    var message;
    if (err.response && err.response.status) {
      switch (err.response.status) {
        case 404:
          message = "Sorry! the page you are looking for could not be found";
          break;
        case 500:
          message =
            "Sorry! something went wrong, please contact our support team";
          break;
        case 401:
          message = "Invalid credentials";
          break;
        default:
          message = err;
          break;
      }
    }
    throw message;
  });
};

// postForgetPwd
export const postJwtForgetPwd = (data) =>
  api.create(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// postSocialLogin
export const postSocialLogin = (data) => api.create(url.SOCIAL_LOGIN, data);

// Calendar
// get Events
export const getEvents = () => api.get(url.GET_EVENTS);

// get Events
export const getCategories = () => api.get(url.GET_CATEGORIES);

// get Upcomming Events
export const getUpCommingEvent = () => api.get(url.GET_UPCOMMINGEVENT);

// add Events
export const addNewEvent = (event) => api.create(url.ADD_NEW_EVENT, event);

// update Event
export const updateEvent = (event) => api.put(url.UPDATE_EVENT, event);

// delete Event
export const deleteEvent = (event) =>
  api.delete(url.DELETE_EVENT, { headers: { event } });

// Chat
// get Contact
export const getDirectContact = () => api.get(url.GET_DIRECT_CONTACT);

// get Messages
export const getMessages = (roomId) =>
  api.get(`${url.GET_MESSAGES}/${roomId}`, { params: { roomId } });

// add Message
export const addMessage = (message) => api.create(url.ADD_MESSAGE, message);

// add Message
export const deleteMessage = (message) =>
  api.delete(url.DELETE_MESSAGE, { headers: { message } });

// get Channels
export const getChannels = () => api.get(url.GET_CHANNELS);

// MailBox
//get Mail
export const getMailDetails = () => api.get(url.GET_MAIL_DETAILS);

// delete Mail
export const deleteMail = (forId) =>
  api.delete(url.DELETE_MAIL, { headers: { forId } });

// Ecommerce
// get Products
export const getProducts = () => api.get(url.GET_PRODUCTS);

// delete Product
export const deleteProducts = (product) =>
  api.delete(url.DELETE_PRODUCT + "/" + product);

// add Products
export const addNewProduct = (product) =>
  api.create(url.ADD_NEW_PRODUCT, product);

// update Products
export const updateProduct = (product) =>
  api.update(url.UPDATE_PRODUCT + "/" + product._id, product);

// get Orders
export const getOrders = () => api.get(url.GET_ORDERS);

// add Order
export const addNewOrder = (order) => api.create(url.ADD_NEW_ORDER, order);

// update Order
export const updateOrder = (order) =>
  api.update(url.UPDATE_ORDER + "/" + order._id, order);

// delete Order
export const deleteOrder = (order) =>
  api.delete(url.DELETE_ORDER + "/" + order);

// get Customers
export const getCustomers = () => api.get(url.GET_CUSTOMERS);

// add Customers
export const addNewCustomer = (customer) =>
  api.create(url.ADD_NEW_CUSTOMER, customer);

// update Customers
export const updateCustomer = (customer) =>
  api.update(url.UPDATE_CUSTOMER + "/" + customer._id, customer);

// delete Customers
export const deleteCustomer = (customer) =>
  api.delete(url.DELETE_CUSTOMER + "/" + customer);

// get Sellers
export const getSellers = () => api.get(url.GET_SELLERS);

// Project
// get Project list
export const getProjectList = () => api.get(url.GET_PROJECT_LIST);

// Tasks
// get Task
export const getTaskList = () => api.get(url.GET_TASK_LIST);

// add Task
export const addNewTask = (task) => api.create(url.ADD_NEW_TASK, task);

// update Task
export const updateTask = (task) =>
  api.update(url.UPDATE_TASK + "/" + task._id, task);

// delete Task
export const deleteTask = (task) => api.delete(url.DELETE_TASK + "/" + task);

// Kanban Board
export const getTasks = () => api.get(url.GET_TASKS);
export const addNewTasks = (card) => api.create(url.ADD_TASKS, card);
export const updateTasks = (card) => api.put(url.UPDATE_TASKS, card);
export const deleteTasks = (card) =>
  api.delete(url.DELETE_TASKS, { headers: { card } });

// CRM
// get Contacts
export const getContacts = () => api.get(url.GET_CONTACTS);

// add Contact
export const addNewContact = (contact) =>
  api.create(url.ADD_NEW_CONTACT, contact);

// update Contact
export const updateContact = (contact) =>
  api.update(url.UPDATE_CONTACT + "/" + contact._id, contact);

// delete Contact
export const deleteContact = (contact) =>
  api.delete(url.DELETE_CONTACT + "/" + contact);

// get Companies
export const getCompanies = () => api.get(url.GET_COMPANIES);

// add Companies
export const addNewCompanies = (company) =>
  api.create(url.ADD_NEW_COMPANIES, company);

// update Companies
export const updateCompanies = (company) =>
  api.update(url.UPDATE_COMPANIES + "/" + company._id, company);

// delete Companies
export const deleteCompanies = (company) =>
  api.delete(url.DELETE_COMPANIES + "/" + company);

// get Deals
export const getDeals = () => api.get(url.GET_DEALS);

// get Leads
export const getLeads = () => api.get(url.GET_LEADS);

// add Lead
export const addNewLead = (lead) => api.create(url.ADD_NEW_LEAD, lead);

// update Lead
export const updateLead = (lead) =>
  api.update(url.UPDATE_LEAD + "/" + lead._id, lead);

// delete Lead
export const deleteLead = (lead) => api.delete(url.DELETE_LEAD + "/" + lead);

// Crypto
// Transation
export const getTransationList = () => api.get(url.GET_TRANSACTION_LIST);

// Order List
export const getOrderList = () => api.get(url.GET_ORDRER_LIST);

// Invoice
//get Invoice
export const getInvoices = () => api.get(url.GET_INVOICES);

// add Invoice
export const addNewInvoice = (invoice) =>
  api.create(url.ADD_NEW_INVOICE, invoice);

// update Invoice
export const updateInvoice = (invoice) =>
  api.update(url.UPDATE_INVOICE + "/" + invoice._id, invoice);

// delete Invoice
export const deleteInvoice = (invoice) =>
  api.delete(url.DELETE_INVOICE + "/" + invoice);

// Support Tickets
// Tickets
export const getTicketsList = () => api.get(url.GET_TICKETS_LIST);

// add Tickets
export const addNewTicket = (ticket) => api.create(url.ADD_NEW_TICKET, ticket);

// update Tickets
export const updateTicket = (ticket) =>
  api.update(url.UPDATE_TICKET + "/" + ticket._id, ticket);

// delete Tickets
export const deleteTicket = (ticket) =>
  api.delete(url.DELETE_TICKET + "/" + ticket);

// Dashboard Analytics

// Sessions by Countries
export const getAllData = () => api.get(url.GET_ALL_DATA);
export const getHalfYearlyData = () => api.get(url.GET_HALFYEARLY_DATA);
export const getMonthlyData = () => api.get(url.GET_MONTHLY_DATA);

// Audiences Metrics
export const getAllAudiencesMetricsData = () =>
  api.get(url.GET_ALLAUDIENCESMETRICS_DATA);
export const getMonthlyAudiencesMetricsData = () =>
  api.get(url.GET_MONTHLYAUDIENCESMETRICS_DATA);
export const getHalfYearlyAudiencesMetricsData = () =>
  api.get(url.GET_HALFYEARLYAUDIENCESMETRICS_DATA);
export const getYearlyAudiencesMetricsData = () =>
  api.get(url.GET_YEARLYAUDIENCESMETRICS_DATA);

// Users by Device
export const getTodayDeviceData = () => api.get(url.GET_TODAYDEVICE_DATA);
export const getLastWeekDeviceData = () => api.get(url.GET_LASTWEEKDEVICE_DATA);
export const getLastMonthDeviceData = () =>
  api.get(url.GET_LASTMONTHDEVICE_DATA);
export const getCurrentYearDeviceData = () =>
  api.get(url.GET_CURRENTYEARDEVICE_DATA);

// Audiences Sessions by Country
export const getTodaySessionData = () => api.get(url.GET_TODAYSESSION_DATA);
export const getLastWeekSessionData = () =>
  api.get(url.GET_LASTWEEKSESSION_DATA);
export const getLastMonthSessionData = () =>
  api.get(url.GET_LASTMONTHSESSION_DATA);
export const getCurrentYearSessionData = () =>
  api.get(url.GET_CURRENTYEARSESSION_DATA);

// Dashboard CRM

// Balance Overview
export const getTodayBalanceData = () => api.get(url.GET_TODAYBALANCE_DATA);
export const getLastWeekBalanceData = () =>
  api.get(url.GET_LASTWEEKBALANCE_DATA);
export const getLastMonthBalanceData = () =>
  api.get(url.GET_LASTMONTHBALANCE_DATA);
export const getCurrentYearBalanceData = () =>
  api.get(url.GET_CURRENTYEARBALANCE_DATA);

// Dial Type
export const getTodayDealData = () => api.get(url.GET_TODAYDEAL_DATA);
export const getWeeklyDealData = () => api.get(url.GET_WEEKLYDEAL_DATA);
export const getMonthlyDealData = () => api.get(url.GET_MONTHLYDEAL_DATA);
export const getYearlyDealData = () => api.get(url.GET_YEARLYDEAL_DATA);

// Sales Forecast
export const getOctSalesData = () => api.get(url.GET_OCTSALES_DATA);
export const getNovSalesData = () => api.get(url.GET_NOVSALES_DATA);
export const getDecSalesData = () => api.get(url.GET_DECSALES_DATA);
export const getJanSalesData = () => api.get(url.GET_JANSALES_DATA);

// Dashboard Ecommerce
// Revenue
export const getAllRevenueData = () => api.get(url.GET_ALLREVENUE_DATA);
export const getMonthRevenueData = () => api.get(url.GET_MONTHREVENUE_DATA);
export const getHalfYearRevenueData = () =>
  api.get(url.GET_HALFYEARREVENUE_DATA);
export const getYearRevenueData = () => api.get(url.GET_YEARREVENUE_DATA);

// Dashboard Crypto
// Portfolio
export const getBtcPortfolioData = () => api.get(url.GET_BTCPORTFOLIO_DATA);
export const getUsdPortfolioData = () => api.get(url.GET_USDPORTFOLIO_DATA);
export const getEuroPortfolioData = () => api.get(url.GET_EUROPORTFOLIO_DATA);

// Market Graph
export const getAllMarketData = () => api.get(url.GET_ALLMARKETDATA_DATA);
export const getYearMarketData = () => api.get(url.GET_YEARMARKET_DATA);
export const getMonthMarketData = () => api.get(url.GET_MONTHMARKET_DATA);
export const getWeekMarketData = () => api.get(url.GET_WEEKMARKET_DATA);
export const getHourMarketData = () => api.get(url.GET_HOURMARKET_DATA);

// Dashboard Project
// Project Overview
export const getAllProjectData = () => api.get(url.GET_ALLPROJECT_DATA);
export const getMonthProjectData = () => api.get(url.GET_MONTHPROJECT_DATA);
export const gethalfYearProjectData = () =>
  api.get(url.GET_HALFYEARPROJECT_DATA);
export const getYearProjectData = () => api.get(url.GET_YEARPROJECT_DATA);

// Project Status
export const getAllProjectStatusData = () =>
  api.get(url.GET_ALLPROJECTSTATUS_DATA);
export const getWeekProjectStatusData = () =>
  api.get(url.GET_WEEKPROJECTSTATUS_DATA);
export const getMonthProjectStatusData = () =>
  api.get(url.GET_MONTHPROJECTSTATUS_DATA);
export const getQuarterProjectStatusData = () =>
  api.get(url.GET_QUARTERPROJECTSTATUS_DATA);

// Dashboard NFT
// Marketplace
export const getAllMarketplaceData = () => api.get(url.GET_ALLMARKETPLACE_DATA);
export const getMonthMarketplaceData = () =>
  api.get(url.GET_MONTHMARKETPLACE_DATA);
export const gethalfYearMarketplaceData = () =>
  api.get(url.GET_HALFYEARMARKETPLACE_DATA);
export const getYearMarketplaceData = () =>
  api.get(url.GET_YEARMARKETPLACE_DATA);

// Project
export const addProjectList = (project) =>
  api.create(url.ADD_NEW_PROJECT, project);
export const updateProjectList = (project) =>
  api.put(url.UPDATE_PROJECT, project);
export const deleteProjectList = (project) =>
  api.delete(url.DELETE_PROJECT, { headers: { project } });

// Pages > Team
export const getTeamData = (team) => api.get(url.GET_TEAMDATA, team);
export const deleteTeamData = (team) =>
  api.delete(url.DELETE_TEAMDATA, { headers: { team } });
export const addTeamData = (team) => api.create(url.ADD_NEW_TEAMDATA, team);
export const updateTeamData = (team) => api.put(url.UPDATE_TEAMDATA, team);

// File Manager

// Folder
export const getFolders = (folder) => api.get(url.GET_FOLDERS, folder);
export const deleteFolder = (folder) =>
  api.delete(url.DELETE_FOLDER, { headers: { folder } });
export const addNewFolder = (folder) => api.create(url.ADD_NEW_FOLDER, folder);
export const updateFolder = (folder) => api.put(url.UPDATE_FOLDER, folder);

// File
export const getFiles = (file) => api.get(url.GET_FILES, file);
export const deleteFile = (file) =>
  api.delete(url.DELETE_FILE, { headers: { file } });
export const addNewFile = (file) => api.create(url.ADD_NEW_FILE, file);
export const updateFile = (file) => api.put(url.UPDATE_FILE, file);

// To Do
export const getTodos = (todo) => api.get(url.GET_TODOS, todo);
export const deleteTodo = (todo) =>
  api.delete(url.DELETE_TODO, { headers: { todo } });
export const addNewTodo = (todo) => api.create(url.ADD_NEW_TODO, todo);
export const updateTodo = (todo) => api.put(url.UPDATE_TODO, todo);

// To do Project
export const getProjects = (project) => api.get(url.GET_PROJECTS, project);
export const addNewProject = (project) =>
  api.create(url.ADD_NEW_TODO_PROJECT, project);

//Job Application
export const getJobApplicationList = () => api.get(url.GET_APPLICATION_LIST);

//API Key
export const getAPIKey = () => api.get(url.GET_API_KEY);
