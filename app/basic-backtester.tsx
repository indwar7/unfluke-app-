import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicBacktester from '../components/BasicBacktester'

const BasicBacktesterPage = () => {
  return (
    <BasicBacktester/>
  )
}

export default BasicBacktesterPage

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingTop:85,
        paddingHorizontal:12,
    }
})