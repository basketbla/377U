import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text>Onboarding</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})