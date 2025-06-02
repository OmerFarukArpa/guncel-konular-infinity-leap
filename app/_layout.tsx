import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from '../assets/images/launch/splash';
import MainMenu from '../components/MainMenu';
import BouncingBall from '../components/BouncingBall';

// Oyun yükleme ekranı
const GameLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FF6700" />
    <Text style={styles.loadingText}>Oyun Yükleniyor...</Text>
  </View>
);

// Splash ekranının gösterilmesini sağla
SplashScreen.preventAutoHideAsync().catch(e => console.log("SplashScreen error:", e));

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showMenu, setShowMenu] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);

  useEffect(() => {
    
    async function prepare() {
      try {
        // 3D kaynakları önbelleğe almak için ön yükleme yapılabilir
        // Uygulamanın yüklenmesi gereken şeyler burada yapılabilir
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } catch (e) {
        console.warn("Hazırlık hatası:", e);
      } finally {
        console.log("Uygulama hazır");
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Expo splash screen'i gizle
      const hideSplash = async () => {
        try {
          console.log("Expo splash screen gizleniyor");
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("SplashScreen.hideAsync hatası:", e);
        }
      };
      
      hideSplash();
    }
  }, [appIsReady]);

  // Özel splash screen'in kapanma fonksiyonu
  const handleSplashFinish = useCallback(() => {
    console.log("handleSplashFinish çağrıldı");
    setShowSplash(false);
  }, []);

  // Oyunu başlatma
  const handleStartGame = () => {
    // Önce yükleme ekranını göster
    setGameLoading(true);
    
    // Kısa bir gecikmeden sonra oyunu başlat - 3D oyun başlatmadan önce UI'ın render olması için
    setTimeout(() => {
      setShowMenu(false);
      setGameLoading(false);
    }, 300);
  };

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  if (showMenu) {
    return (
      <>
        <MainMenu onStartGame={handleStartGame} />
        {gameLoading && <GameLoading />}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <BouncingBall />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  loadingText: {
    color: '#333',
    fontSize: 18,
    marginTop: 10,
  }
}); 
