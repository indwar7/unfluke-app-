import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicBacktester from '../components/BasicBacktester'
import { ScreenWithHeader } from '../components/AppHeader'

const BasicBacktesterPage = () => {
  return (
    <ScreenWithHeader>
      <BasicBacktester />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  }
})