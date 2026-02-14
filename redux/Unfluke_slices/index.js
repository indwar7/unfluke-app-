import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication
import LoginReducer from "./auth/login/reducer";
import AccountReducer from "./auth/register/reducer";
import {forgotPasswordReducer, otpVerificationReducer, resetPasswordReducer} from "./auth/forgetpwd/reducer";
import ProfileReducer from "./auth/profile/reducer";

// ScannerAlert
import ScannerAlertReducer from "./scannerAlerts/reducer"

// HistoricalTrading
import HistoricalTradingReducer from './historicalTrading/reducer'

// StrategyCharts
import StrategyChartsReducer from "./strategyCharts/reducer"

// Leaderboard
import LeaderboardReducer from './leaderboard/reducer'
import LtpWebSocketReducer from "./ltpWebSocket/reducer"
import TopPerformerReducer from "./topPerformers/reducer"

// Membership Plans
import MemebershipPlanReducer from "./membershipPlans/reducer"

// Wallet
import WalletReducer from "./wallet/reducer"

// //Calendar
// import CalendarReducer from "./calendar/reducer";
// //Chat
// import chatReducer from "./chat/reducer";
// //Ecommerce
// import EcommerceReducer from "./ecommerce/reducer";

// //Project
import TestMyStrategyReducer from "./backtestMyStrategy/reducer";

// // Tasks
// import TasksReducer from "./tasks/reducer";

//Crypto
import CryptoReducer from "./crypto/reducer";

// //TicketsList
// import TicketsReducer from "./tickets/reducer";
// //Crm
// import CrmReducer from "./crm/reducer";

// //Invoice
// import InvoiceReducer from "./invoice/reducer";

// //Mailbox
// import MailboxReducer from "./mailbox/reducer";

// // Dashboard Analytics
// import DashboardAnalyticsReducer from "./dashboardAnalytics/reducer";

// // Dashboard CRM
// import DashboardCRMReducer from "./dashboardCRM/reducer";

// // Dashboard Ecommerce
// import DashboardEcommerceReducer from "./dashboardEcommerce/reducer";

// Dashboard Cryto
import DashboardCryptoReducer from "./dashboardCrypto/reducer";
// import TopPerformersReducer from "../pages/DashboardCrypto/TopPerformers";

// // Dashboard Cryto
// import DashboardProjectReducer from "./dashboardProject/reducer";

// // Dashboard NFT
// import DashboardNFTReducer from "./dashboardNFT/reducer";

// // Pages > Team
// import TeamDataReducer from "./team/reducer";

// // File Manager
// import FileManagerReducer from "./fileManager/reducer";

// // To do
// import TodosReducer from "./todos/reducer";

// // Job
// import JobReducer from "./jobs/reducer";

// // API Key
// import APIKeyReducer from "./apiKey/reducer";

import BasicBacktestReducer from "../slices/basicBacktester/reducer"
import ScannerReducer from "../slices/scanner/reducer"
import AdvancedBacktesterReducer from "../slices/advancedBacktester/reducer"
import BasicBacktestDashReducer from "./basicBacktest/reducer"

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
    Account: AccountReducer,
    ForgetPassword: forgotPasswordReducer,
    OtpVerification: otpVerificationReducer,
    ResetPassword: resetPasswordReducer,
    Profile: ProfileReducer,
    ScannerAlert: ScannerAlertReducer,
    Historical:HistoricalTradingReducer,
    Leaderboard:LeaderboardReducer,
    LtpSocket:LtpWebSocketReducer,
    TopPerformers:TopPerformerReducer,
    MemebershipPlans:MemebershipPlanReducer,
    Wallet:WalletReducer,
    StrategyCharts:StrategyChartsReducer,
    TestMyStrategy: TestMyStrategyReducer,
    // Calendar: CalendarReducer,
    // Chat: chatReducer,
    // Ecommerce: EcommerceReducer,
    // Tasks: TasksReducer,
    Crypto: CryptoReducer,
    // Tickets: TicketsReducer,
    // Crm: CrmReducer,
    // Invoice: InvoiceReducer,
    // Mailbox: MailboxReducer,
    // DashboardAnalytics: DashboardAnalyticsReducer,
    // DashboardCRM: DashboardCRMReducer,
    // DashboardEcommerce: DashboardEcommerceReducer,
    DashboardCrypto: DashboardCryptoReducer,
    // DashboardProject: DashboardProjectReducer,
    // DashboardNFT: DashboardNFTReducer,
    // Team: TeamDataReducer,
    // FileManager: FileManagerReducer,
    // Todos: TodosReducer,
    // Jobs: JobReducer,
    // APIKey: APIKeyReducer,
    BasicBacktestDash: BasicBacktestDashReducer,
    BasicBacktester: BasicBacktestReducer,
    AdvancedBacktester: AdvancedBacktesterReducer,
    Scanner: ScannerReducer
});

export default rootReducer;
