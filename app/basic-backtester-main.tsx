import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicBacktesterMainPage from '../components/BasicBacktester/BasicBacktesterMainPage'
import { ScreenWithHeader } from '../components/AppHeader'

const BasicBacktesterMain = () => {
  return (
    <ScreenWithHeader>
      <BasicBacktesterMainPage />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterMain

const styles = StyleSheet.create({})