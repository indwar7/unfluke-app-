import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicBacktesterHomePage from '../components/BasicBacktester/BasicBacktesterHomePage'
import { ScreenWithHeader } from '../components/AppHeader'

const BasicBacktesterHome = () => {
  return (
    <ScreenWithHeader>
      <BasicBacktesterHomePage />
    </ScreenWithHeader>
  )
}

export default BasicBacktesterHome

const styles = StyleSheet.create({})