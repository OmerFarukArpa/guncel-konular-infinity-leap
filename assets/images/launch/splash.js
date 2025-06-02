import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    console.log("Splash screen loaded, waiting to finish...");
    
    // Splash ekranını 2 saniye sonra kapat
    const timer = setTimeout(() => {
      console.log("Splash screen timer completed, calling onFinish");
      if (onFinish) {
        onFinish();
      }
    }, 3000);
    
    // Cleanup fonksiyonu
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <View style={styles.ball} />
        <Text style={styles.title}>Infinity Leap</Text>
        <Text style={styles.subtitle}>Gerçekliği Yakala!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
  },
  content: {
    alignItems: 'center',
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6700',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#000',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFF',
  }
}); 
