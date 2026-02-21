import React from 'react';
import { View, StyleSheet } from 'react-native';
import UnDashboard from '@/components/screens/Dashboard';
import { ScreenWithHeader } from '@/components/AppHeader';

const Dashboard = () => {
  return (
    <ScreenWithHeader>
      <UnDashboard />
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({});

export default Dashboard;