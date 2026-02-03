import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { io } from "socket.io-client";
import { ProgressBar } from "react-native-paper";
import { Config } from "../../../../helpers/config";

const ProgressBarBacktest = ({ auth, setIsBacktesting, stratId, setCsvFilename, setResultsMessage }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (auth?.user?._id !== undefined) {
      const socket = io(Config.BACKEND_URL, {
        transports: ["websocket"],
        query: { userID: auth.user._id },
      });

      socket.emit("setSocketId", auth.user._id);

      socket.on("csv-filename", (data) => {
        if (data && data.user === auth.user._id && data.stratid === stratId) {
          setCsvFilename(data.filename);
          setIsBacktesting(false);
          setResultsMessage(data.message);
        }
      });

      socket.on("progress-update", (data) => {
        if (data && data.user === auth.user._id && data.stratid === stratId) {
          // convert to 0-1 for ProgressBar in RN
          setProgress(data.progress / 100);
        }
      });

      // return () => {
      //   socket.disconnect();
      // };
    }
  }, [auth]);

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
