import { ScrollView, Text } from "react-native";
import financialData from "../charts/data/financialData";
import { transformFinancialData } from "../charts/transformData";

import GrowthStrategyChart from "../charts/strategies/GrowthStrategyChart";

const StrategyDashboard = () => {
  const chartData = transformFinancialData(financialData.results);

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Growth Strategy
      </Text>
      <GrowthStrategyChart data={chartData} />
    </ScrollView>
  );
};

export default StrategyDashboard;
