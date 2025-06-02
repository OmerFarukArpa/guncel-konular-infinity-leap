import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Dimensions, GestureResponderEvent, Animated, Easing } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { DeviceMotion } from 'expo-sensors';
import React from 'react';

const { width, height } = Dimensions.get('window');

// Motivasyon mesajları
const MOTIVATION_MESSAGES = [
  "Müthiş Oyun!",
  "Sen Bir Şampiyon!",
  "Böyle Devam Et!",
  "İnanılmazsın!",
  "Muhteşem!",
  "Hadi Hadi!",
  "Rekor Kırıyorsun!",
  "Süper Oynuyorsun!",
  "Efsane!",
  "Durmak Yok!",
  "Harikasın!",
  "Yıkıyorsun Ortalığı!",
  "Kazanmaya Çok Yakınsın!",
  "Tam Gaz Devam!",
  "İşte Bu!",
  "Senin Gibisi Yok!",
  "Yine Döktürdün!",
  "Fırtına Gibisin!",
  "Oyunun Efendisi!",
  "Zafer Senin!",
  "Kontrol Sende!",
  "Bitir Bu İşi!",
  "Rakipler Korksun!",
  "Oyunun Hakimi Sensin!",
  "Ustalık Bu İşte!",
  "Hep Böyle Oyna!",
  "Yükseliyorsun!",
  "Bir Efsane Doğuyor!",
  "Kim Tutar Seni!",
  "Sınır Tanımıyorsun!",
  "Güç Sende!",
  "Seninle Gurur Duyuyorum!",
  "Mücadeleye Devam!",
  "Bunu Da Başardın!",
  "Efsaneler Gibi Oynuyorsun!",
  "Hedefe Yaklaşıyorsun!",
  "Enerjin Harika!",
  "Moralin Süper!",
  "Yıldız Gibi Parlıyorsun!",
  "Tam Bir Stratejistsin!",
  "İşte Liderlik!",
  "Bravo!",
  "Helal Olsun!",
  "Bu Performans Başka!",
  "Rakipsizsin!",
  "Konsantrasyon Üst Düzey!",
  "Seninle Oynamak Zevk!",
  "Bu Oyunu Bitirdin!",
  "Sana Hayran Kaldım!",
  "Hataları Unut, Devam Et!",
  "Hedefin Zirve!",
  "Zirvedekiler Gibisin!",
  "Kararlılıkla İlerle!",
  "Zeka ve Güç Bir Arada!"
]
;

// Motivasyon animasyonu için props tipi
interface MotivationAnimationProps {
  message: string;
  onFinish: () => void;
}

// Motivasyon animasyonu bileşeni
const MotivationAnimation = ({ message, onFinish }: MotivationAnimationProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // Modern animasyon
    Animated.parallel([
      // Ölçek animasyonu
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5))
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]),
      // Yukarı kayma animasyonu
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      // Gecikmeli kaybolma
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ])
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);
  
  return (
    <View style={styles.motivationContainer}>
      <Animated.Text 
        style={[
          {
            fontSize: 38,
            fontWeight: '700',
            fontFamily: 'System',
            letterSpacing: 0.5,
            color: '#FFFFFF',
            textAlign: 'center',
            textShadowColor: 'rgba(0,0,0,0.4)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 10,
            backgroundColor: 'rgba(80, 80, 200, 0.15)',
            backdropFilter: 'blur(8px)',
            paddingHorizontal: 25,
            paddingVertical: 15,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
            transform: [
              { scale: scaleAnim },
              { translateY: translateY }
            ],
            opacity: opacityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0]
            })
          }
        ]}
      >
        {message}
      </Animated.Text>
    </View>
  );
};

const Ball = React.forwardRef(({ onGameOver, setScore }: { onGameOver: () => void, setScore: (score: number) => void }, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const position = useRef(new THREE.Vector3(0, 0, 0));
  const gameActiveRef = useRef(true);
  const scoreRef = useRef(0);
  const randomVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const cameraRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const cameraDirectionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const bounceCountRef = useRef(0);
  const isFirstRenderRef = useRef(true);
  const screenPosition = useRef(new THREE.Vector3());
  const lastClickTime = useRef(0);
  // Yerçekimi değerini tutacak ref
  const gravityRef = useRef(5); // Başlangıç değeri
  const maxGravity = useRef(100); // Maksimum değer
  const minGravity = useRef(5);  // Minimum değer
  // Dönme animasyonu için referanslar
  const rotationRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationSpeedRef = useRef(new THREE.Vector3(0, 0, 0));
  
  // İlk ayarları yapıp hemen renderlamayı önleyen flag
  const isReadyRef = useRef(false);

  // Three.js'in sahneye erişmek için hook
  const { camera, size } = useThree();

  React.useImperativeHandle(ref, () => ({
    handleClick: () => {
      handleClick();
    },
    // Top pozisyonunu ekran koordinatlarına çevir ve geri döndür
    getScreenPosition: () => {
      if (meshRef.current) {
        // 3D pozisyonu ekran koordinatlarına çevir
        const worldPos = meshRef.current.getWorldPosition(new THREE.Vector3());
        screenPosition.current.copy(worldPos);
        screenPosition.current.project(camera);
        
        // [-1, 1] aralığından piksel koordinatlarına çevir
        const x = (screenPosition.current.x * 0.5 + 0.5) * size.width;
        const y = (-(screenPosition.current.y * 0.5) + 0.5) * size.height;
        
        return { x, y };
      }
      return null;
    },
    getWorldPosition: () => {
      if (meshRef.current) {
        return meshRef.current.getWorldPosition(new THREE.Vector3());
      }
      return null;
    }
  }));

  useEffect(() => {
    // useEffect içinde referansları sıfırlamaların performansı etkilememesi için
    // requestAnimationFrame kullanarak daha uygun bir zamanda ayarları yapalım
    requestAnimationFrame(() => {
      // useEffect içinde sadece referansları sıfırla
      gameActiveRef.current = true;
      scoreRef.current = 0;
      setScore(0);
      bounceCountRef.current = 0;
      isFirstRenderRef.current = true; // İlk frame'de pozisyon ayarlanacak
      randomVelocity.current.set(0, 0, 0);
      gravityRef.current = 12; // Başlangıç yerçekimi değerini ayarla value 12
      
      // Başlangıç hızını ayarla - hafif X ve Z, sıfır Y
      velocity.current.set(
        (Math.random() - 0.5) * 2,  // Rastgele X yönü
        0,  // Y yönü
        (Math.random() - 0.5) * 2   // Rastgele Z yönü
      );
      
      isReadyRef.current = true;
    });
    
    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  useFrame((state, delta) => {
    // Oyun aktif değilse veya mesh yüklenmemişse ya da hazır değilse işlem yapma
    if (!gameActiveRef.current || !meshRef.current || !isReadyRef.current) return;
    
    // Kameranın pozisyonunu ve yönünü al
    const cameraPosition = state.camera.position;
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
    
    // İlk render kontrolü
    if (isFirstRenderRef.current) {
      // Top kameranın 5 metre önünde başlasın
      const forward = cameraDirection.clone().normalize().multiplyScalar(5);
      position.current.copy(cameraPosition).add(forward);
      
      // Pozisyonu biraz yukarı çıkar (yerden 1.5 birim yukarı)
      position.current.y += 1.5;
      
      // Topun görünür olması için pozisyonu doğrudan ayarla
      if (meshRef.current) {
        meshRef.current.position.copy(position.current);
      }
      
      isFirstRenderRef.current = false;
    }
    
    // Kamera bilgilerini referanslara kaydet
    cameraRef.current.copy(cameraPosition);
    cameraDirectionRef.current.copy(cameraDirection);
    
    // Yerçekimi - sadece Y ekseninde uygula, tıklamaya bağlı değişen değer
    velocity.current.y -= gravityRef.current * delta;
    
    // Topun pozisyonunu güncelle
    position.current.addScaledVector(velocity.current, delta);
    
    // Kameradan uzaklığı hesapla
    const distanceToCamera = position.current.distanceTo(cameraPosition);
    
    // Ekranın kenarlarını hesapla (3D uzayda)
    // React-three-fiber için varsayılan değerler kullan
    const fov = 60; // Varsayılan perspektif kamera değeri
    const heightHalf = Math.tan(fov * (Math.PI / 180) / 2) * distanceToCamera;
    const widthHalf = heightHalf * (size.width / size.height);
    
    // Kameranın dünya koordinatlarında yön vektörleri
    const cameraForward = cameraDirection.clone().normalize();
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion).normalize();
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(state.camera.quaternion).normalize();
    
    // Topun kameraya göre bağıl pozisyonu
    const relativePos = position.current.clone().sub(cameraPosition);
    
    // Topun kamera düzlemindeki projeksiyonu
    const forwardDistance = relativePos.dot(cameraForward);
    const rightDistance = relativePos.dot(cameraRight);
    const upDistance = relativePos.dot(cameraUp);
    
    // Ekranın kenarları (X ekseni - sağ/sol)
    const screenEdgeRight = widthHalf * 0.9; // Biraz margin bırak
    const screenEdgeLeft = -widthHalf * 0.9;
    
    // Ekranın üst kenarı (Z ekseni)
    const screenEdgeTop = heightHalf * 0.9;
    const screenEdgeBottom = -heightHalf * 0.9;
    
    // Sağ kenara çarpma
    if (rightDistance > screenEdgeRight) {
      // Hızı ters yöne çevir (X ekseninde)
      velocity.current.x = -Math.abs(velocity.current.x) * 0.8; // Enerji kaybını simüle et
      
      // Pozisyonu kenarda sınırla
      const excess = rightDistance - screenEdgeRight;
      position.current.sub(cameraRight.clone().multiplyScalar(excess));
    }
    // Sol kenara çarpma
    else if (rightDistance < screenEdgeLeft) {
      // Hızı ters yöne çevir (X ekseninde)
      velocity.current.x = Math.abs(velocity.current.x) * 0.8; // Enerji kaybını simüle et
      
      // Pozisyonu kenarda sınırla
      const excess = screenEdgeLeft - rightDistance;
      position.current.add(cameraRight.clone().multiplyScalar(excess));
    }
    
    // Üst kenara çarpma
    if (upDistance > screenEdgeTop) {
      // Hızı ters yöne çevir (Y ekseninde)
      velocity.current.y = -Math.abs(velocity.current.y) * 0.8; // Enerji kaybını simüle et
      
      // Pozisyonu kenarda sınırla
      const excess = upDistance - screenEdgeTop;
      position.current.sub(cameraUp.clone().multiplyScalar(excess));
    }
    
    // Z kenarlarına çarpma (ileri/geri)
    const maxForwardDistance = 40; // Kameradan max uzaklık
    const minForwardDistance = 5;  // Kameradan min uzaklık
    
    if (forwardDistance > maxForwardDistance) {
      // Hızı ters yöne çevir (Z ekseninde)
      velocity.current.z = -Math.abs(velocity.current.z) * 0.8;
      
      // Pozisyonu kenarda sınırla
      const excess = forwardDistance - maxForwardDistance;
      position.current.sub(cameraForward.clone().multiplyScalar(excess));
    }
    else if (forwardDistance < minForwardDistance) {
      // Hızı ters yöne çevir (Z ekseninde)
      velocity.current.z = Math.abs(velocity.current.z) * 0.8;
      
      // Pozisyonu kenarda sınırla
      const excess = minForwardDistance - forwardDistance;
      position.current.add(cameraForward.clone().multiplyScalar(excess));
    }
    
    // Çarpışma kontrolü - yerden belirli bir yüksekliğe düşünce zıpla
    // Yer seviyesini kamera Y pozisyonundan 1.5 birim aşağıda varsayalım
    const floorLevel = cameraPosition.y - 7;
    
    if (position.current.y < floorLevel) {
      if (bounceCountRef.current < 1) { // iki kere zıplamasını sağlamak için
        // Zıplama - sadece Y ekseninde
        velocity.current.y = 5;  // Yukarı zıpla
        
        // X ve Z eksenlerinde hafif sürtünme uygula
        velocity.current.x *= 0.8;
        velocity.current.z *= 0.8;
        
        // Topun yere gömülmesini engelle
        position.current.y = floorLevel;
        
        bounceCountRef.current += 1;
      } else {
        // Oyun bitti
        gameActiveRef.current = false;
        onGameOver();
        return;
      }
    }
    
    // Topun pozisyonunu güncelle
    meshRef.current.position.copy(position.current);
    
    // Dönme animasyonunu güncelle
    rotationRef.current.x += rotationSpeedRef.current.x * delta;
    rotationRef.current.y += rotationSpeedRef.current.y * delta;
    rotationRef.current.z += rotationSpeedRef.current.z * delta;
    
    // Topun dönme açısını güncelle
    meshRef.current.rotation.set(
      rotationRef.current.x,
      rotationRef.current.y,
      rotationRef.current.z
    );
    
    // Dönme hızını zamanla azalt (sürtünme etkisi)
    rotationSpeedRef.current.x *= 0.98;
    rotationSpeedRef.current.y *= 0.98;
    rotationSpeedRef.current.z *= 0.98;
  });

  const handleClick = () => {
    if (gameActiveRef.current) {
      // Sadece Y ekseninde zıplama
      velocity.current.y = 8; // Güçlü yukarı zıplama
      
      // X ve Z ekseninde hafif rastgele hareket
      velocity.current.x = (Math.random() - 0.5) * 1.5; // Hafif X hareketi
      velocity.current.z = (Math.random() - 0.5) * 3.5; // Hafif Z hareketi
      
      // Rastgele dönme hızı ata
      rotationSpeedRef.current.x = (Math.random() - 0.5) * 5;
      rotationSpeedRef.current.y = (Math.random() - 0.5) * 5;
      rotationSpeedRef.current.z = (Math.random() - 0.5) * 5;
      
      // Yerçekimi kuvvetini 0.5 birim artır
      gravityRef.current += 0.5;
      
      // Maksimum değere ulaştıysa döngüsel olarak başa dön
      if (gravityRef.current > maxGravity.current) {
        gravityRef.current = minGravity.current;
      }
      
      // Skoru güncelle
      scoreRef.current += 1;
      setScore(scoreRef.current);
      
      // Zıplama sayısını sıfırla
      bounceCountRef.current = 0;
    }
  };

  return (
    <mesh ref={meshRef}>
  <sphereGeometry args={[1, 32, 32]} />
  <meshStandardMaterial
    color="#361C13"
    emissive="#F77E56"
    emissiveIntensity={0.3}
    roughness={0.4}
    metalness={0.2}

  />
  {/* Basketbol topu çizgileri için ikinci bir mesh */}
  <lineSegments>
    <edgesGeometry args={[new THREE.SphereGeometry(1.019, 8, 8)]} />
    <lineBasicMaterial color="black" linewidth={15} />
  </lineSegments>
  {/* Basketbol topunun daha detaylı bir görünüm için bir kaç ek çizgi */}
  {/* <lineSegments>
    <edgesGeometry args={[new THREE.SphereGeometry(0, 8 , 8)]} />
    <lineBasicMaterial color="black" linewidth={5} />
  </lineSegments> */}
</mesh>

  );
});

// Kamera kontrol bileşeni
function CameraController() {
  const { camera } = useThree();
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    // İlk açılışta kamerayı yere dik ayarla
    if (!isInitializedRef.current) {
      // Kamerayı aşağı yöne bakan şekilde ayarla (yere dik)
      const downRotation = new THREE.Quaternion();
      downRotation.setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0)); // -90 derece X ekseni
      camera.quaternion.copy(downRotation);
      isInitializedRef.current = true;
    }
    
    // Sensör başlatmayı geciktir - performans için
    const setupSensor = setTimeout(() => {
      // Cihaz hareket sensörünü ayarla
      DeviceMotion.setUpdateInterval(30); // 30ms - daha düşük bir yenileme hızı kullan (60fps yerine 33fps)
      
      const subscription = DeviceMotion.addListener(data => {
        // Eğer başlangıç ayarı yapılmışsa sensör verilerini kullan
        if (isInitializedRef.current && data.rotation) {
          // Sensorün yönünü ayarla
          const alpha = data.rotation.alpha || 0;
          const beta = data.rotation.beta || 0;
          const gamma = data.rotation.gamma || 0;
          
          // Başlangıç rotasyonunu (aşağı bakma) koruyarak sensör verilerini uygula
          const sensorQuaternion = new THREE.Quaternion();
          const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
          sensorQuaternion.setFromEuler(euler);
          
          // Başlangıç rotasyonunu aşağı bakacak şekilde ayarla ve sonra sensörü hafifçe uygula
          const initialRotation = new THREE.Quaternion();
          initialRotation.setFromEuler(new THREE.Euler(-Math.PI/3, 0, 0)); // -60 derece aşağı bakış
          
          // Sensör verilerini hafifçe uygula (sınırlı hareket)
          camera.quaternion.copy(initialRotation).slerp(sensorQuaternion, 0.2); // Daha az hassasiyet (0.3 yerine 0.2)
        }
      });
      
      return () => {
        subscription.remove();
      };
    }, 1000); // 1 saniye gecikme ile sensörü başlat
    
    return () => {
      clearTimeout(setupSensor);
    };
  }, [camera]);
  
  return null;
}

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const ballRef = useRef<any>(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
  };

  // Skoru güncelle ve gerekirse motivasyon mesajı göster
  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    
    // Skor 10'un katıysa motivasyon mesajı göster
    if (newScore > 0 && newScore % 10 === 0) {
      // Rastgele bir motivasyon mesajı seç
      const randomMessage = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
      setMotivationMessage(randomMessage);
      setShowMotivation(true);
      
      // Cihazı titret (opsiyonel)
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // Motivasyon animasyonu bittiğinde
  const handleMotivationFinish = () => {
    setShowMotivation(false);
  };

  // Ekrana tıklandığında kontrol et
  const handleScreenPress = (event: GestureResponderEvent) => {
    if (ballRef.current && !gameOver) {
      // Dokunma pozisyonunu al
      const touchX = event.nativeEvent.locationX;
      const touchY = event.nativeEvent.locationY;
      
      // Topun ekran pozisyonunu al
      const ballScreenPos = ballRef.current.getScreenPosition();
      
      if (ballScreenPos) {
        // Topun ekrandaki çapını hesapla (3D boyutu ekrana göre)
        const ballRadius = 50; // Piksel cinsinden tahmini yarıçap
        
        // Dokunma noktası top üzerinde mi kontrol et
        const distance = Math.sqrt(
          Math.pow(touchX - ballScreenPos.x, 2) + 
          Math.pow(touchY - ballScreenPos.y, 2)
        );
        
        // Dokunma topun yakınında ise
        if (distance < ballRadius) {
          ballRef.current.handleClick();
        }
      }
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Kamera izni gerekiyor</Text>
        <Button onPress={requestPermission} title="İzin Ver" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.canvasContainer}>
<Canvas
  style={styles.canvas}
  gl={{
    antialias: true,
    alpha: true,
  }}
  camera={{
    position: [0, 0, 5],  // Kamera biraz daha geri
    fov: 75,
    near: 0.1,
    far: 1000,
    matrixAutoUpdate: true,
  }}
  onCreated={({ gl, camera, scene }) => {
    try {
      camera.position.set(0, 0, 5); // Kamera biraz daha geri
      const downRotation = new THREE.Quaternion();
      downRotation.setFromEuler(new THREE.Euler(-Math.PI / 6, 0, 0)); // -30 derece X ekseni
      camera.quaternion.copy(downRotation);
      camera.matrixAutoUpdate = true;

      scene.fog = new THREE.Fog(0x000000, 5, 20);
    } catch (err) {
      console.error("Canvas oluşturulurken hata:", err);
    }
  }}
  frameloop="always"
>
  <CameraController />
  <ambientLight intensity={1.5} />
  <pointLight position={[10, 10, 10]} intensity={2} />
  <pointLight position={[-10, -10, -10]} intensity={1} />
  {!gameOver && (
    <Ball 
      ref={ballRef}
      onGameOver={() => setGameOver(true)} 
      setScore={handleScoreUpdate}
    />
  )}
</Canvas>
        </View>

        {/* Ekranın tamamını kaplayan dokunma alanı */}
        <TouchableOpacity 
          style={styles.touchArea} 
          onPress={handleScreenPress}
          activeOpacity={1}
        />

        {/* Skor gösterimi */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Skor: {score}</Text>
        </View>

        {/* Motivasyon animasyonu */}
        {showMotivation && (
          <MotivationAnimation 
            message={motivationMessage} 
            onFinish={handleMotivationFinish} 
          />
        )}

        {/* Oyun sonu ekranı */}
        {gameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Oyun Bitti!</Text>
            <Text style={styles.finalScoreText}>Skorunuz: {score}</Text>
            <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
              <Text style={styles.restartText}>Tekrar Başlat</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
    width: width,
    height: height,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    width: width,
    height: height,
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  motivationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  motivationText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFD700', // Altın rengi
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 20,
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  restartButton: {
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  }
});
