import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

const COLORS = ['#30D158', '#30D158', '#248A3D', '#1E9E46', '#000000', '#000000', '#1A1A1A', '#0D0D0D'];
const PARTICLE_COUNT = 70;

type ParticleConfig = {
  id: number;
  x: number;
  size: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotationEnd: number;
  wobble: number;
};

function createParticles(width: number): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
    id,
    x: Math.random() * width,
    size: 5 + Math.random() * 7,
    height: 3 + Math.random() * 9,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 600,
    duration: 2200 + Math.random() * 2200,
    drift: (Math.random() - 0.5) * 140,
    rotationEnd: (Math.random() - 0.5) * 900,
    wobble: 20 + Math.random() * 40,
  }));
}

function ConfettiPiece({
  config,
  screenHeight,
}: {
  config: ParticleConfig;
  screenHeight: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: config.duration,
      delay: config.delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [config, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.height - 20, screenHeight + 40],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, config.wobble, config.drift * 0.5, config.drift * 0.8, config.drift],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${config.rotationEnd}deg`],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: config.x,
          width: config.size,
          height: config.height,
          backgroundColor: config.color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    />
  );
}

export function Confetti() {
  const { width, height } = useWindowDimensions();
  const particles = useMemo(() => createParticles(width), [width]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiPiece key={p.id} config={p} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 10,
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 1,
  },
});
