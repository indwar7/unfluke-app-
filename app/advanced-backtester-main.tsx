import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AdvancedBacktestMainPage from '../components/AdvancedBacktester/AdvancedBacktestMain'
import { ScreenWithHeader } from '../components/AppHeader'

const AdvancedBacktesterMain = () => {
  return (
    <ScreenWithHeader>
      <AdvancedBacktestMainPage />
    </ScreenWithHeader>
  )
}

export default AdvancedBacktesterMain

const styles = StyleSheet.create({})