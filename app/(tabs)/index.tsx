import React from 'react';
import { View, Button, Linking, StyleSheet, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import BouncingBall from '@/components/BouncingBall';
import { ThemedView } from '@/components/ThemedView';

export default function App() {

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Top Sektirme Oyunu</ThemedText>
      <View style={styles.gameContainer}>
        <BouncingBall></BouncingBall>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameContainer: {
    flex: 1,
    width: '100%',
  },
});



