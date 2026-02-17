const BASE_URL = "https://api.unfluke.in";

export type StockType = "C" | "S";

export interface CompanyInfo {
  companyName: string;
  symbol: string;
  capcode: string;
  marketCap: number;
  isABank: boolean;
}

export interface FinancialResponse {
  results: { [year: string]: Array<Record<string, number | string | null>> };
  headings: Array<{ title: string; children?: string[] }>;
}

export interface RatioResponse {
  results: { [year: string]: Array<Record<string, number | string | null>> };
  headings?: Array<{ title: string; children?: string[] }>;
}

class UnflukeAPIClient {
  private async fetchJSON<T>(endpoint: string): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    console.log("[UnflukeAPI] Fetching:", url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    return response.json();
  }

  async getCapcodeBySymbol(symbol: string): Promise<string> {
    const data = await this.fetchJSON<{ code: number }>(
      `/api/historicData/getCapcodeByStockSymbol?instrument=${encodeURIComponent(symbol)}`
    );
    if (!data.code) throw new Error("No capcode found for symbol: " + symbol);
    return String(data.code);
  }

  async getCompanyName(capcode: string): Promise<{ name: string; isABank: boolean }> {
    const data = await this.fetchJSON<{ name: string; company_name: string; isABank: boolean }>(
      `/api/historicData/companyname?instrument=${capcode}`
    );
    return { name: data.name, isABank: data.isABank };
  }

  async getSymbolByCapcode(capcode: string): Promise<string> {
    const data = await this.fetchJSON<{ symbol: string }>(
      `/api/historicData/getStockSymbolByCapcode?instrument=${capcode}`
    );
    return data.symbol;
  }

  async getMarketCap(capcode: string): Promise<number> {
    const data = await this.fetchJSON<{ market_cap: number }>(
      `/api/historicData/getMarketCapByCapcode?instrument=${capcode}&sc=C`
    );
    return data.market_cap;
  }

  async getCompanyInfo(symbolOrCapcode: string): Promise<CompanyInfo> {
    let capcode = symbolOrCapcode;
    // If it looks like a symbol (non-numeric), resolve to capcode first
    if (!/^\d+$/.test(symbolOrCapcode)) {
      capcode = await this.getCapcodeBySymbol(symbolOrCapcode);
    }
    const [companyData, symbol, marketCap] = await Promise.all([
      this.getCompanyName(capcode),
      this.getSymbolByCapcode(capcode),
      this.getMarketCap(capcode),
    ]);
    return {
      companyName: companyData.name,
      symbol,
      capcode,
      marketCap,
      isABank: companyData.isABank,
    };
  }

  async getBalanceSheet(capcode: string, type: StockType): Promise<FinancialResponse> {
    return this.fetchJSON(`/api/screener/getBalanceSheet?capcode=${capcode}&type=${type}`);
  }

  async getProfitLoss(capcode: string, type: StockType): Promise<FinancialResponse> {
    return this.fetchJSON(`/api/screener/getProfitLoss?capcode=${capcode}&type=${type}`);
  }

  async getCashFlow(capcode: string, type: StockType): Promise<FinancialResponse> {
    return this.fetchJSON(`/api/screener/getCashFlow?capcode=${capcode}&type=${type}`);
  }

  async getQuarterly(capcode: string, type: StockType): Promise<FinancialResponse> {
    return this.fetchJSON(`/api/screener/getQuarterly?capcode=${capcode}&type=${type}`);
  }

  async getRatios(capcode: string, type: StockType, section: string): Promise<RatioResponse> {
    return this.fetchJSON(
      `/api/screener/getCFRatio?capcode=${capcode}&type=${type}&section=${section}`
    );
  }

  async getAllFinancials(capcode: string, type: StockType) {
    const [
      balanceSheet,
      profitLoss,
      cashFlow,
      quarterly,
      keyFinancial,
      duPont,
      calculated,
      valuation1,
      valuation2,
      valuationCalculated,
    ] = await Promise.all([
      this.getBalanceSheet(capcode, type),
      this.getProfitLoss(capcode, type),
      this.getCashFlow(capcode, type),
      this.getQuarterly(capcode, type),
      this.getRatios(capcode, type, "KeyFinancial"),
      this.getRatios(capcode, type, "DuPont"),
      this.getRatios(capcode, type, "Calculated"),
      this.getRatios(capcode, type, "Valuation1"),
      this.getRatios(capcode, type, "Valuation2"),
      this.getRatios(capcode, type, "ValuationCalculated"),
    ]);
    return {
      balanceSheet,
      profitLoss,
      cashFlow,
      quarterly,
      ratios: {
        keyFinancial,
        duPont,
        calculated,
        valuation1,
        valuation2,
        valuationCalculated,
      },
    };
  }
}

export const unflukeAPI = new UnflukeAPIClient();
