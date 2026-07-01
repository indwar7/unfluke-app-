import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicBacktester from '../components/BasicBacktester'
import { ScreenWithHeader } from '../components/AppHeader'
import { useTheme } from '@/constants/ThemeContext'
import type { AppColors } from '@/constants/Colors'

const BasicBacktesterPage = () => {
  return (
    <ScreenWithHeader>
      <BasicBacktester />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterPage

const makeStyles = (c: AppColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: c.background,
  }
})
