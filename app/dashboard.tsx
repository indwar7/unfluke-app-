import React from 'react';
import { View, StyleSheet } from 'react-native';
import UnDashboard from '@/components/screens/Dashboard';
import { ScreenWithHeader } from '@/components/AppHeader';

// Auth guard centralized in ScreenWithHeader — all protected screens
// inherit the redirect-to-login behavior from that wrapper.
const Dashboard = () => {
  return (
    <ScreenWithHeader>
      <UnDashboard />
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({});

export default Dashboard;