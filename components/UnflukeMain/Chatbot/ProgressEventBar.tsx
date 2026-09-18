import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { backendSocket } from '../../../socket/socket';

const ProgressEventBar = ({ auth, setIsProgressing, stratId }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (auth?.user?._id === undefined || auth?.user?._id === null) return;

        backendSocket.emit("setSocketId", auth.user._id);

        const handleCsvFilename = (data) => {
            if (data && data.user == auth.user._id && data.stratid == stratId) {
                setIsProgressing(false);
            }
        };

        const handleProgressUpdate = (data) => {
            if (data && data.user == auth.user._id && data.stratid == stratId) {
                setProgress(data.progress / 100); // Convert to decimal for ProgressBar
            }
        };

        const handleConnectError = () => {
            setIsProgressing(false);
        };

        backendSocket.on("csv-filename", handleCsvFilename);
        backendSocket.on("progress-update", handleProgressUpdate);
        backendSocket.on("connect_error", handleConnectError);

        return () => {
            backendSocket.off("csv-filename", handleCsvFilename);
            backendSocket.off("progress-update", handleProgressUpdate);
            backendSocket.off("connect_error", handleConnectError);
        };
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