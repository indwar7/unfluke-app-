import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import UnDashboard from '@/components/screens/Dashboard';
import { ScreenWithHeader } from '@/components/AppHeader';

const Dashboard = () => {
  const user = useSelector((state: any) => state.Login?.user);

  useEffect(() => {
    if (!user?._id) {
      router.replace('/login');
    }
  }, [user]);

  if (!user?._id) {
    return null;
  }

  return (
    <ScreenWithHeader>
      <UnDashboard />
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({});

export default Dashboard;