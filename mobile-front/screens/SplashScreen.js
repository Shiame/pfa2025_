import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const featuresSlideAnim = useRef(new Animated.Value(100)).current;
  const loadingDotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo rotation animation (continuous)
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 300000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for logo ring (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingDotsAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(loadingDotsAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Main entrance animations
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 8,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // Text slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // Features slide in
      Animated.timing(featuresSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Enhanced Gradient Background */}
      <LinearGradient
        colors={['#1a365d', '#2d5a87', '#3182ce', '#4299e1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated Background Pattern */}
        <View style={styles.patternContainer}>
          <Animated.View 
            style={[
              styles.pattern,
              {
                transform: [
                  { rotate: logoRotate },
                  { scale: pulseAnim }
                ]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.pattern, 
              styles.pattern2,
              {
                transform: [
                  { rotate: logoRotate },
                  { scale: pulseAnim }
                ]
              }
            ]} 
          />
          <View style={[styles.pattern, styles.pattern3]} />
          <View style={[styles.pattern, styles.pattern4]} />
        </View>

        {/* Floating particles */}
        <View style={styles.particlesContainer}>
          <View style={[styles.particle, styles.particle1]} />
          <View style={[styles.particle, styles.particle2]} />
          <View style={[styles.particle, styles.particle3]} />
          <View style={[styles.particle, styles.particle4]} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Enhanced Logo Section */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.logoRing,
                {
                  transform: [
                    { rotate: logoRotate },
                    { scale: pulseAnim }
                  ]
                }
              ]}
            />
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={['#f6ad55', '#ed8936', '#dd6b20']}
                style={styles.logoGradient}
              >
                <FontAwesome5 name="flag" size={45} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.logoShadow} />
          </Animated.View>

          {/* Enhanced Text Section */}
          <Animated.View 
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.appName}>Un Maroc Meilleur</Text>
            <View style={styles.arabicContainer}>
              <Text style={styles.slogan}>وطن أفضل للجميع</Text>
            </View>
            <Text style={styles.subSlogan}>Vos plaintes, notre priorité</Text>
            <View style={styles.divider} />
          </Animated.View>

          {/* Enhanced Features Section */}
          <Animated.View 
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: featuresSlideAnim }]
              }
            ]}
          >
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="location-on" size={24} color="#bd661e" />
              </View>
              <Text style={styles.featureText}>Géolocalisa.</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="camera-alt" size={24} color="#bd661e" />
              </View>
              <Text style={styles.featureText}>Photos</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialIcons name="track-changes" size={24} color="#bd661e" />
              </View>
              <Text style={styles.featureText}>Suivi</Text>
            </View>
          </Animated.View>
        </View>

        {/* Enhanced Bottom Section */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.loadingContainer}>
            <Animated.View 
              style={[
                styles.loadingDot,
                {
                  opacity: loadingDotsAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                  transform: [{
                    scale: loadingDotsAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1.2, 0.8],
                    })
                  }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.loadingDot,
                {
                  opacity: loadingDotsAnim.interpolate({
                    inputRange: [0, 0.3, 0.8, 1],
                    outputRange: [0.3, 0.3, 1, 0.3],
                  }),
                  transform: [{
                    scale: loadingDotsAnim.interpolate({
                      inputRange: [0, 0.3, 0.8, 1],
                      outputRange: [0.8, 0.8, 1.2, 0.8],
                    })
                  }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.loadingDot,
                {
                  opacity: loadingDotsAnim.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.3, 0.3, 1],
                  }),
                  transform: [{
                    scale: loadingDotsAnim.interpolate({
                      inputRange: [0, 0.6, 1],
                      outputRange: [0.8, 0.8, 1.2],
                    })
                  }]
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Initialisation en cours...</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  pattern: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    top: '15%',
    right: -125,
  },
  pattern2: {
    width: 180,
    height: 180,
    borderRadius: 90,
    top: '65%',
    left: -90,
    borderWidth: 2,
  },
  pattern3: {
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '8%',
    left: '25%',
    borderColor: 'rgba(246,173,85,0.3)',
  },
  pattern4: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: '75%',
    right: '20%',
    borderColor: 'rgba(246,173,85,0.4)',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  particle1: {
    top: '20%',
    left: '15%',
  },
  particle2: {
    top: '40%',
    right: '25%',
  },
  particle3: {
    top: '70%',
    left: '30%',
  },
  particle4: {
    top: '85%',
    right: '40%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    position: 'relative',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(246,173,85,0.6)',
    borderStyle: 'dashed',
  },
  logoShadow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.2)',
    top: 6,
    zIndex: -1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  arabicContainer: {
    backgroundColor: 'rgba(246,173,85,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  slogan: {
    fontSize: 20,
    color: '#f6ad55',
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subSlogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#f6ad55',
    marginTop: 15,
    borderRadius: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f6ad55',
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    fontWeight: '500',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 8,
  },
  betaBadge: {
    backgroundColor: '#f6ad55',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betaText: {
    fontSize: 10,
    color: '#1a365d',
    fontWeight: 'bold',
  },
});