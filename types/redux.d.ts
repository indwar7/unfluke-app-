// Common Redux state interfaces to resolve most TypeScript errors

// Root State interface
export interface RootState {
  Login: LoginState;
  Account: AccountState;
  Layout: LayoutState;
  Scanner: ScannerState;
  BasicBacktester: BasicBacktesterState;
  [key: string]: any;
}

// Login state
export interface LoginState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  errorMsg: string | null;
  loginSuccess: boolean;
  errorCount: number;
}

// Account state
export interface AccountState {
  verificationMailSent: boolean;
  verificationOtpSent: boolean;
  success: boolean;
  error: string | null;
  loading: boolean;
}

// Layout state
export interface LayoutState {
  layoutType: string;
  leftSidebarType: string;
  layoutModeType: string;
  layoutWidthType: string;
  layoutPositionType: string;
  topbarThemeType: string;
  leftsidbarSizeType: string;
  leftSidebarViewType: string;
  leftSidebarImageType: string;
  preloader: boolean;
  sidebarVisibilitytype: string;
  layoutThemeType: string;
  layoutThemeColorType: string;
  appType: string;
}

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  profile?: UserProfile;
  permissions?: string[];
  subscription?: UserSubscription;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: UserAddress;
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  isActive: boolean;
  expiryDate: string;
  features: string[];
}

// Scanner state
export interface ScannerState {
  expression: any[];
  filters: any[];
  results: ScannerResult[];
  loading: boolean;
  error: string | null;
  lastScan: string | null;
}

export interface ScannerResult {
  symbol: string;
  data: Record<string, any>;
  timestamp: string;
  score?: number;
}

// Basic Backtester state
export interface BasicBacktesterState {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  results: BacktestResult | null;
  loading: boolean;
  error: string | null;
}

export interface Strategy {
  _id: string;
  name: string;
  description?: string;
  fileName?: string;
  resultFileName?: string;
  user: string;
  isPrivate: boolean;
  monetize: boolean;
  positions?: StrategyPositions;
  backtest?: BacktestConfig;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyPositions {
  legs: StrategyLeg[];
  legSummaries?: any[];
}

export interface StrategyLeg {
  _id?: string;
  id?: string;
  symbol: string;
  action: "BUY" | "SELL";
  quantity: number;
  type: "MARKET" | "LIMIT";
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  returns: number;
  trades: TradeResult[];
  equity: EquityCurve[];
}

export interface TradeResult {
  entryTime: string;
  exitTime: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  commission: number;
  slippage: number;
}

export interface EquityCurve {
  date: string;
  equity: number;
  drawdown: number;
}

// Component prop interfaces
export interface TableData {
  [key: string]: any;
}

export interface TableColumn {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (info: any) => React.ReactNode;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  size?: number;
}

export interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success?: boolean;
  error?: string;
}

// Form interfaces
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  required?: boolean;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: (field: string) => void;
  error?: string;
  touched?: boolean;
}

// Chart data interfaces
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: "line" | "bar" | "area" | "candlestick";
}

export interface ChartConfig {
  series: ChartSeries[];
  xAxis?: {
    title?: string;
    type?: "category" | "datetime" | "numeric";
  };
  yAxis?: {
    title?: string;
    min?: number;
    max?: number;
  };
  title?: string;
  height?: number;
  responsive?: boolean;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type ChangeHandler<T = any> = (value: T) => void;
export type ClickHandler = (event: any) => void;
export type SubmitHandler<T = any> = (values: T) => void;

// Utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export all for easy importing
export type {
  RootState,
  LoginState,
  AccountState,
  LayoutState,
  User,
  UserProfile,
  UserSubscription,
  ScannerState,
  ScannerResult,
  BasicBacktesterState,
  Strategy,
  StrategyPositions,
  StrategyLeg,
  BacktestConfig,
  BacktestResult,
  TradeResult,
  EquityCurve,
  TableData,
  TableColumn,
  ModalProps,
  ApiResponse,
  FormFieldProps,
  ChartDataPoint,
  ChartSeries,
  ChartConfig,
  EventHandler,
  ChangeHandler,
  ClickHandler,
  SubmitHandler,
};
