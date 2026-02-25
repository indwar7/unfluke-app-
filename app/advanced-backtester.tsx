import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AdvancedBacktester from '../components/AdvancedBacktester'
import { ScreenWithHeader } from '../components/AppHeader'

const AdvancedBacktesterPage = () => {
  return (
    <ScreenWithHeader>
      <AdvancedBacktester />
    </ScreenWithHeader>
  )
}

export default AdvancedBacktesterPage

const styles = StyleSheet.create({})