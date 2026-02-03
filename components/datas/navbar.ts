
interface SubItem {
  id: string;
  label: string;
  icon?: string;
  link: string;
  parentId?: string;
}

interface MenuItem {
  id?: string;
  label: string;
  icon?: string;
  link?: string;
  isHeader?: boolean;
  subItems?: SubItem[];
}

export const menuItems: MenuItem[] = [
  // {
  //   label: "Menu",
  //   isHeader: true,
  // },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "ri-dashboard-2-line",
    link: "/dashboard",
  },
  {
    id: "chatbot",
    label: "AI-Bot",
    icon: "bx bx-bot",
    link: "/chatbot",
  },
  {
    id: "fundamental",
    label: "Fundamental",
    icon: "ri-quill-pen-fill",
    link: "/fundamental",
  },
  {
    id: "chartsCombined",
    label: "Charts",
    icon: "ri-line-chart-line",
    subItems: [
      {
        id: "historicalCharts",
        label: "Historical Charts",
        icon: "ri-funds-box-line",
        link: "/historical",
        parentId: "chartsCombined",
      },
      {
        id: "strategyCharts",
        label: "Strategy Charts",
        icon: "ri-stock-line",
        link: "/strategycharts",
        parentId: "chartsCombined",
      },
    ],
  },
  {
    id: "scanner",
    label: "Scanners",
    icon: "ri-scan-2-line",
    subItems: [
      {
        id: "technical",
        label: "Technical Scanner",
        link: "/scannermain",
        parentId: "scanner",
      },
      {
        id: "fundamental",
        label: "Fundamental Scanner",
        link: "/scannerfundamental",
        parentId: "scanner",
      },
    ],
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: "ri-alarm-line",
    link: "/alerts",
  },
  {
    id: "backtesters",
    label: "Backtest",
    icon: "ri-scan-2-line",
    subItems: [
      {
        id: "basicBacktest",
        label: "Simple Backtest",
        icon: "ri-stack-line",
        link: "/basic-backtester-main",
      },
      {
        id: "advancedBacktest",
        label: "Advanced Backtest",
        icon: "ri-vip-crown-line",
        link: "/advanced-backtester-main",
      },
    ],
  },
  {
    id: "simulator",
    label: "Option Simulator",
    icon: "ri-quill-pen-fill",
    link: "/simulator",
  },
];
