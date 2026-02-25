import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ViewStrategy from '../components/BasicBacktester/ViewStrategy'
import { ScreenWithHeader } from '../components/AppHeader'

const BasicBacktesterView = () => {
  return (
    <ScreenWithHeader>
      <ViewStrategy />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterView

const styles = StyleSheet.create({})