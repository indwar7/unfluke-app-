import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { backendSocket } from "../../../../socket/socket";

const ProgressBarBacktest = ({ auth, setIsBacktesting, stratId, setCsvFilename, setResultsMessage }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (auth?.user?._id === undefined) return;

    backendSocket.emit("setSocketId", auth.user._id);

    const handleCsvFilename = (data) => {
      if (data && data.user === auth.user._id && data.stratid === stratId) {
        setCsvFilename(data.filename);
        setIsBacktesting(false);
        setResultsMessage(data.message);
      }
    };

    const handleProgressUpdate = (data) => {
      if (data && data.user === auth.user._id && data.stratid === stratId) {
        // convert to 0-1 for ProgressBar in RN
        setProgress(data.progress / 100);
      }
    };

    // If the socket never connects, don't leave the caller stuck on the
    // "Processing your strategy..." bar forever with no feedback.
    const handleConnectError = () => {
      setIsBacktesting(false);
      setResultsMessage("Couldn't reach the server. Please try again.");
    };

    backendSocket.on("csv-filename", handleCsvFilename);
    backendSocket.on("progress-update", handleProgressUpdate);
    backendSocket.on("connect_error", handleConnectError);

    return () => {
      backendSocket.off("csv-filename", handleCsvFilename);
      backendSocket.off("progress-update", handleProgressUpdate);
      backendSocket.off("connect_error", handleConnectError);
    };
  }, [auth, stratId]);

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <ProgressBar progress={progress} color="#f0ad4e" style={styles.progressBar} />
      </View>
      <View style={styles.textRow}>
        <Text style={styles.text}>Processing your strategy...</Text>
      </View>
    </View>
  );
};

export default ProgressBarBacktest;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 10,
  },
  progressRow: {
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  textRow: {
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
});
