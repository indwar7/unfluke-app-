import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AdvancedBacktesterHome from '../components/AdvancedBacktester/AdvancedBacktestHome'
import { ScreenWithHeader } from '../components/AppHeader'

const AdvancedBakctesterHomePage = () => {
    return (
        <ScreenWithHeader>
            <AdvancedBacktesterHome />
        </ScreenWithHeader>
    )
}

export default AdvancedBakctesterHomePage

const styles = StyleSheet.create({})