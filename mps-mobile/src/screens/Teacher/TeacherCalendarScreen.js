import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TeacherCalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TeacherCalendarScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  text: {
    color: '#00DE85',
    fontSize: 24,
    fontWeight: 'bold',
  }
});
