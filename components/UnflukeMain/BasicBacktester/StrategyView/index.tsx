import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import GraphicalInfo from "./GraphicalInfo";
import BackupTable from "./BackupTable";
import ProfitTable from "./ProfitTable";
import ProfitGraph from "./Graphs";

const GraphicBlocks = (props) => {
  const {
    NewstrategyDataFromCSV,
    Loading,
    numberOfTrade,
    downloadUrl,
    downloadUrl1,
    downloadUrl2,
    advancedBacktester,
    analysis,
    slippage,
  } = props;

  const [dates, setDates] = useState([]);

  useEffect(() => {
    // console.log("ANALYSIS", analysis);
  }, [analysis]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {analysis && (
        <GraphicalInfo
          strategyDataFromCSV={NewstrategyDataFromCSV}
          numberOfTrades={analysis.numberOfTrades}
          totalPNL={analysis.profitGraph}
          drawDawn={analysis.ddGraph}
          drawDawnDays={analysis.drawDownDays}
          winner={analysis.winner}
          losser={analysis.losser}
          winStreak={analysis.winStreak}
          lossStreak={analysis.lossStreak}
          years={analysis.YEARS}
          overallProfit={analysis.overallProfit}
          averageProfit={analysis.averageProfit}
          avgDailyProfit={analysis.avgDailyProfit}
          maxDailyProfit={analysis.maxDailyProfit}
          maxDailyLoss={analysis.maxDailyLoss}
          winPercentage={analysis.winPercent}
          lossPercentage={analysis.lossPercent}
          maxWinStreak={analysis.maxWinStreak}
          maxLossStreak={analysis.maxLossStreak}
          maxDDdays={analysis.maxDDDays}
          DDdays={analysis.DDDays}
          avgProfitOnWinDays={analysis.avgProfitWinDays}
          avgProfitOnLossDays={analysis.avgProfitLossDays}
          expectancy={analysis.expectancy}
          profitFactor={analysis.profitFactor}
          returnToMDD={analysis.returnToMDD}
          winTotal={analysis.winTotal}
          lossTotal={analysis.lossTotal}
        />
      )}

      {/* {analysis?.profitGraph?.length > 0 &&
        analysis?.ddGraph?.length > 0 &&
        analysis?.cumulativeGraph?.length > 0 &&
        analysis?.MONTHS?.length > 0 &&
        analysis?.YEARS?.length > 0 && (
          <ProfitGraph
            dates={dates}
            totalPNL={analysis.profitGraph}
            drawDawn={analysis.ddGraph}
            cummulative={analysis.cumulativeGraph}
            months={analysis.MONTHS}
            years={analysis.YEARS}
          />
        )} */}

      {NewstrategyDataFromCSV && analysis && (
        <View style={styles.combinedSection}>
          <ProfitTable
            strategyDataFromCSV={NewstrategyDataFromCSV}
            downloadUrl={downloadUrl}
            downloadUrl1={downloadUrl1}
            downloadUrl2={downloadUrl2}
            advancedBacktester={advancedBacktester}
            slippage={slippage}
          />

          <BackupTable backupTable={analysis.backupTable} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
  },
  combinedSection: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
});

export default GraphicBlocks;
