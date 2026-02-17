import React from 'react'
import { Stack } from 'expo-router'
import UnDashboard from '../components/screens/Dashboard'

const Dashboard = () => {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      <UnDashboard />
    </>
  )
}

export default Dashboard