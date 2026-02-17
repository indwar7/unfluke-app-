// Global type definitions for the Unfluke app

// Common API response types
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// User types
interface User {
  _id: string;
  email: string;
  name: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  [key: string]: any;
}

// Notification types
interface Notification {
  _id: string;
  content: string;
  userID: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
  type?: string;
}

// Strategy types
interface Strategy {
  _id: string;
  name: string;
  description?: string;
  indicators?: any[];
  conditions?: any[];
  backtest?: any;
  isPrivate?: boolean;
  isMonetized?: boolean;
  [key: string]: any;
}

// Chart types
interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Indicator {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  settings?: Record<string, any>;
}

// Scanner types
interface ScannerFilter {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: "AND" | "OR";
}

interface ScannerResult {
  symbol: string;
  data: Record<string, any>;
  timestamp: string;
}

// Component prop types
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

interface TableColumn {
  id: string;
  header: string;
  accessorKey?: string;
  cell?: (info: any) => React.ReactNode;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
  isGlobalFilter?: boolean;
  customPageSize?: number;
  tableClass?: string;
  theadClass?: string;
  trClass?: string;
  thClass?: string;
  divClass?: string;
  searchPlaceholder?: string;
  onEdit?: (row: any) => void;
  onView?: (row: any) => void;
  onDelete?: (row: any) => void;
  onTogglePrivate?: (row: any) => void;
  onToggleMonetize?: (row: any) => void;
}

// Redux types
interface RootState {
  Login: {
    user: User | null;
    isAuthenticated: boolean;
  };
  [key: string]: any;
}

// React Native Navigation types
declare module "@react-navigation/native" {
  export interface RootParamList {
    [key: string]: any;
  }
}

// Socket.io types
interface SocketNotificationData {
  notification: Notification;
}

// Backtest types
interface BacktestResult {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
}

interface Trade {
  entryTime: string;
  exitTime: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
}

// Form types
interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "select" | "checkbox";
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: any;
}

// Option chain types
interface OptionData {
  strike: number;
  callPrice: number;
  putPrice: number;
  callIV: number;
  putIV: number;
  callDelta: number;
  putDelta: number;
  callGamma: number;
  putGamma: number;
  callTheta: number;
  putTheta: number;
  callVega: number;
  putVega: number;
}

// Pricing types
interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  billingCycle: "monthly" | "annual";
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_BACKEND_URL: string;
    REACT_APP_PUBLIC_URL: string;
    REACT_APP_DEFAULTAUTH: string;
    REACT_APP_GA_ID: string;
    REACT_NATIVE_ENV: "development" | "production";
  }
}

// Utility types
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Common component ref types
interface DropdownRef {
  toggle: () => void;
  close: () => void;
  open: () => void;
}

interface ModalRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Export for module augmentation
export {};
