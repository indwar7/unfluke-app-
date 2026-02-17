import { useQuery } from "@tanstack/react-query";
import { unflukeAPI, StockType } from "../api/unfluke";

export function useCompanyInfo(symbolOrCapcode?: string) {
  return useQuery({
    queryKey: ["company", symbolOrCapcode],
    queryFn: () => unflukeAPI.getCompanyInfo(symbolOrCapcode!),
    enabled: !!symbolOrCapcode,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFinancials(capcode?: string, type: StockType = "C") {
  return useQuery({
    queryKey: ["financials", capcode, type],
    queryFn: () => unflukeAPI.getAllFinancials(capcode!, type),
    enabled: !!capcode,
    staleTime: 1000 * 60 * 10,
  });
}
