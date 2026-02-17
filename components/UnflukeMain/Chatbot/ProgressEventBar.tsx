import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { io } from 'socket.io-client';
import Constants from "expo-constants";

const ProgressEventBar = ({ auth, setIsProgressing, stratId }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (auth.user._id !== undefined) {
            const socket = io(Constants?.expoConfig?.extra?.BACKEND_URL, {
                transports: ["websocket"],
                query: { userID: auth.user._id },
            });

            socket.emit("setSocketId", auth.user._id);

            socket.on("csv-filename", function (data) {
                if (data) {
                    if (data.user == auth.user._id && data.stratid == stratId) {
                        setIsProgressing(false);
                    }
                }
            });

            socket.on("progress-update", function (data) {
                if (data) {
                    if (data.user == auth.user._id && data.stratid == stratId) {
                        setProgress(data.progress / 100); // Convert to decimal for ProgressBar
                    }
                }
            });

            // Clean up socket connection on unmount
            return () => {
                socket.disconnect();
            };
        }
    }, [auth, stratId, setIsProgressing]);

    return (
        <View style={styles.container}>
            <ProgressBar 
                progress={progress} 
                color="#FFA500" 
                style={styles.progressBar}
            />
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingHorizontal: 16,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
    },
    progressText: {
        textAlign: 'center',
        marginTop: 4,
        fontSize: 12,
        color: '#666',
    },
});

export default ProgressEventBar;