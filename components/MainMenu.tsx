import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Easing 
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Yüksek skor kayıt anahtarı
const HIGH_SCORE_KEY = '@ar_basket_high_score';

// Basketbol SVG'si
const basketballSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200px" height="200px" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <title>Basketball</title>
    <defs>
        <radialGradient id="ballGradient" cx="50%" cy="50%" r="70%" fx="30%" fy="30%">
            <stop offset="0%" stop-color="#FF8C3D" />
            <stop offset="80%" stop-color="#FF6700" />
            <stop offset="100%" stop-color="#E05600" />
        </radialGradient>
    </defs>
    <g id="ball-group">
        <circle id="ball" fill="url(#ballGradient)" cx="100" cy="100" r="90" />
        <path id="lines" d="M10,100 L190,100 M100,10 L100,190 M30,30 C70,70 130,70 170,30 M30,170 C70,130 130,130 170,170" stroke="#000000" stroke-width="3" fill="none" />
    </g>
</svg>`;

export default function MainMenu({ onStartGame, lastScore = 0 }: { onStartGame: () => void, lastScore?: number }) {
  const [highScore, setHighScore] = useState(0);

  // Animasyon değerleri
  const ballRotate = useRef(new Animated.Value(0)).current;
  const ballBounce = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;

  // Yüksek skoru yükleme
  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (savedScore !== null) {
        setHighScore(parseInt(savedScore));
      }
    } catch (error) {
      console.error('Yüksek skor yüklenirken hata oluştu:', error);
    }
  };

  // Yüksek skoru kaydetme
  const saveHighScore = async (score: number) => {
    try {
      if (score > highScore) {
        await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
        setHighScore(score);
        
        // Skor güncellendiğinde animasyon
        Animated.sequence([
          Animated.timing(scoreAnim, {
            toValue: 1.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scoreAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }
    } catch (error) {
      console.error('Yüksek skor kaydedilirken hata oluştu:', error);
    }
  };

  useEffect(() => {
    // Yüksek skoru yükle
    loadHighScore();

    // Son skoru kontrol et ve gerekirse yüksek skoru güncelle
    if (lastScore > 0) {
      saveHighScore(lastScore);
    }

    // Dönme animasyonu
    Animated.loop(
      Animated.timing(ballRotate, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Zıplama animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(ballBounce, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ballBounce, {
          toValue: 0,
          duration: 600, 
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        })
      ])
    ).start();

    // Başlık animasyonu
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [lastScore]);

  // Buton animasyonu
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleStartGame = () => {
    animateButton();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Kısa bir gecikme ile oyunu başlat (buton animasyonu için)
    setTimeout(() => {
      onStartGame();
    }, 200);
  };

  // Dönme animasyonu için interpolasyon
  const spin = ballRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Zıplama animasyonu için interpolasyon
  const bounce = ballBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40] // Yukarı zıplama mesafesi
  });

  // Başlık animasyonu için interpolasyon
  const titleTranslate = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0]
  });

  const titleOpacity = titleAnim;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Üst Başlık */}
      <Animated.View style={[styles.header, {
        transform: [{ translateY: titleTranslate }],
        opacity: titleOpacity
      }]}>
        <Text style={styles.title}>Infinity Leap</Text>
        <Text style={styles.subtitle}>Gerçekliği Yakala!</Text>
      </Animated.View>

      {/* Orta Alan - Basketbol Topu */}
      <View style={styles.ballArea}>
        <Animated.View style={[styles.ballContainer, {
          transform: [
            { rotate: spin },
            { translateY: bounce }
          ]
        }]}>
          <SvgXml xml={basketballSvg} width={150} height={150} />
          <View style={styles.shadow} />
        </Animated.View>
      </View>

      {/* Alt Menü */}
      <View style={styles.footer}>
        {/* Yüksek Skor */}
        <View style={styles.scoreContainer}>
          {/* <Text style={styles.scoreTitle}>EN YÜKSEK SKOR</Text> */}
          {/* <Animated.Text 
            style={[
              styles.scoreValue, 
              { transform: [{ scale: scoreAnim }] }
            ]}
          >
            {highScore}
          </Animated.Text> */}
          
          {/* Son skor gösterimi */}
          {lastScore > 0 && lastScore < highScore && (
            <Text style={styles.lastScore}>Son skor: {lastScore}</Text>
          )}
          
          {/* Yeni yüksek skor durumunda */}
          {lastScore > 0 && lastScore >= highScore && (
            <Text style={styles.newHighScore}>Yeni Rekor!</Text>
          )}
        </View>
      <Text style={styles.title}>Eğlence başlasın!</Text>

        {/* Butonlar */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handleStartGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF8C3D', '#FF6700', '#E05600']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>OYNA</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.smallButton}>
              {/* <Text style={styles.smallButtonText}>AYARLAR</Text> */}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.smallButton}>
              {/* <Text style={styles.smallButtonText}>HAKKINDA</Text> */}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  background: {
    position: 'absolute',
    width: width,
    height: height,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textShadowColor: '#FF6700',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ballArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballContainer: {
    alignItems: 'center',
  },
  shadow: {
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
    marginTop: 10,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreTitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  playButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  secondaryButtons: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  smallButtonText: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    textDecorationLine: 'underline',
  },
  lastScore: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 5,
  },
  newHighScore: {
    fontSize: 14, 
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
}); 
