import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const AppId = (cell) => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      onPress={() => {
        // Handle navigation if needed
        // navigation.navigate('Details', { id: cell.getValue() });
      }}
    >
      <Text style={styles.appIdText}>
        {cell.getValue() ? cell.getValue() < 10 ? cell.getValue() : cell.getValue() : ""}
      </Text>
    </TouchableOpacity>
  );
};

const Name = (cell) => {
  return <Text style={styles.text}>{cell.getValue()}</Text>;
};

const Month = (cell) => {
  return (
    <Text style={styles.text}>
      {cell.getValue().date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    </Text>
  );
};

const Designation = (cell) => {
  return <Text style={styles.text}>{cell.getValue()}</Text>;
};

const DateCell = (cell) => {
  return <Text style={styles.text}>{cell.getValue()}</Text>;
};

const Contact = (cell) => {
  return <Text style={styles.text}>{cell.getValue()}</Text>;
};

const Type = (cell) => {
  return <Text style={styles.text}>{cell.getValue()}</Text>;
};

const Status = (cell) => {
  const status = cell.getValue();
  let statusStyle = {};
  let statusTextStyle = {};

  switch (status) {
    case "New":
      statusStyle = styles.statusNew;
      statusTextStyle = styles.statusTextNew;
      break;
    case "Rejected":
      statusStyle = styles.statusRejected;
      statusTextStyle = styles.statusTextRejected;
      break;
    case "Pending":
      statusStyle = styles.statusPending;
      statusTextStyle = styles.statusTextPending;
      break;
    case "Approved":
      statusStyle = styles.statusApproved;
      statusTextStyle = styles.statusTextApproved;
      break;
    default:
      break;
  }

  return (
    <View style={[styles.statusBadge, statusStyle]}>
      <Text style={[styles.statusText, statusTextStyle]}>
        {status ? status.toUpperCase() : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  appIdText: {
    fontWeight: 'bold',
    color: '#000',
  },
  text: {
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusNew: {
    backgroundColor: '#cfe2ff',
  },
  statusTextNew: {
    color: '#084298',
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
  },
  statusTextRejected: {
    color: '#842029',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusTextPending: {
    color: '#664d03',
  },
  statusApproved: {
    backgroundColor: '#d1e7dd',
  },
  statusTextApproved: {
    color: '#0f5132',
  },
});

export { AppId, Name, Designation, DateCell as Date, Contact, Type, Status };