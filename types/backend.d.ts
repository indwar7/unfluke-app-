// TypeScript definitions for backend helper functions

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success?: boolean;
}

// Authentication types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  confirm_password: string;
  referral?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  userId: string;
}

export interface OtpData {
  phone: string;
  hash: string;
  otp: string;
  activation_token: string;
}

// User types
export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

// Notification types
export interface NotificationData {
  userID: string;
}

export interface ReadNotificationData {
  userID: string;
  notificationIds?: string[];
}

// Strategy types
export interface StrategyData {
  name: string;
  description?: string;
  indicators: any[];
  conditions: any[];
  timeframe: string;
  symbols: string[];
}

// Scanner types
export interface ScannerData {
  expression: any[];
  filters: any[];
  timeframe: string;
  exchange: string;
}

// Fundamental data types
export interface FundamentalData {
  symbol: string;
  companyId: number;
  period?: string;
}

// Chart data types
export interface ChartDataRequest {
  symbol: string;
  timeframe: string;
  from: string;
  to: string;
}

// Pricing types
export interface PricingData {
  planId: string;
  userId: string;
  paymentMethod: string;
}

// Backend helper function types
export declare function getLoggedInUser(): UserInfo | null;
export declare function isUserAuthenticated(): boolean;

// API calls
export declare function fetchStrategyChartData(link: string, params?: any): Promise<ApiResponse>;
export declare function fetchData(link: string, params?: any): Promise<ApiResponse>;
export declare function postData(link: string, data: any): Promise<ApiResponse>;

// Authentication
export declare function postJwtLogin(data: LoginData): Promise<ApiResponse<{ token: string; user: UserInfo }>>;
export declare function postForgetPwd(data: ForgotPasswordData): Promise<ApiResponse>;
export declare function postChangePassword(data: ChangePasswordData): Promise<ApiResponse>;
export declare function postLoginRefeshToken(data: { refreshToken: string }): Promise<ApiResponse>;

// User management
export declare function getUserInfo(data: { userId: string }): Promise<ApiResponse<UserInfo>>;
export declare function postAccountActivation(data: { token: string }): Promise<ApiResponse>;
export declare function postEmailSendOtp(data: { email: string }): Promise<ApiResponse>;
export declare function postVerifyEmailOtp(data: OtpData): Promise<ApiResponse>;
export declare function postPhoneSendOtp(data: { phone: string }): Promise<ApiResponse>;
export declare function postVerifyPhoneOtp(data: OtpData): Promise<ApiResponse>;

// Notifications
export declare function getNotifications(data: NotificationData): Promise<ApiResponse<Notification[]>>;
export declare function postReadNotifications(data: ReadNotificationData): Promise<ApiResponse>;

// Strategies
export declare function getStrategies(params?: any): Promise<ApiResponse>;
export declare function postStrategy(data: StrategyData): Promise<ApiResponse>;
export declare function updateStrategy(id: string, data: Partial<StrategyData>): Promise<ApiResponse>;
export declare function deleteStrategy(id: string): Promise<ApiResponse>;

// Scanner
export declare function postScannerResults(data: ScannerData): Promise<ApiResponse>;

// Fundamental data
export declare function getFundamentalData(data: FundamentalData): Promise<ApiResponse>;
export declare function getCompanyName(data: { companyId: number }): Promise<ApiResponse<{ name: string }>>;
export declare function getStockSymbol(data: { companyId: number }): Promise<ApiResponse<{ symbol: string }>>;
export declare function getDailyRatiosData(data: FundamentalData): Promise<ApiResponse>;
export declare function getBankingData(data: FundamentalData): Promise<ApiResponse>;
export declare function getCFRatiosData(data: FundamentalData): Promise<ApiResponse>;

// Chart data
export declare function getChartData(data: ChartDataRequest): Promise<ApiResponse>;

// Pricing
export declare function getPricingPlans(): Promise<ApiResponse>;
export declare function postPurchasePlan(data: PricingData): Promise<ApiResponse>;

// User tracking
export declare function postUserTrackEvent(data: { event: string; userId: string; metadata?: any }): Promise<ApiResponse>;
export declare function postUserBatchTrackEvent(data: { events: any[] }): Promise<ApiResponse>;

// Export all types for use in other files
export type {
  ApiResponse,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ChangePasswordData,
  OtpData,
  UserInfo,
  NotificationData,
  StrategyData,
  ScannerData,
  FundamentalData,
  ChartDataRequest,
  PricingData,
};
