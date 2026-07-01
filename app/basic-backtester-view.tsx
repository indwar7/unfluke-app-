import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ViewStrategy from '../components/BasicBacktester/ViewStrategy'
import { ScreenWithHeader } from '../components/AppHeader'
import { useTheme } from '@/constants/ThemeContext'
import type { AppColors } from '@/constants/Colors'

const BasicBacktesterView = () => {
  return (
    <ScreenWithHeader>
      <ViewStrategy />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterView

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  }
})
