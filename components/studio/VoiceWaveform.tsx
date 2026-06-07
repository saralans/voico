import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'

interface Props {
  active: boolean
  color?: string
}

const BAR_CONFIG = [
  { height: 14, delay: 0 },
  { height: 22, delay: 90 },
  { height: 32, delay: 60 },
  { height: 22, delay: 120 },
  { height: 14, delay: 40 },
  { height: 26, delay: 80 },
  { height: 18, delay: 100 },
]

export function VoiceWaveform({ active, color = '#FFFFFF' }: Props) {
  return (
    <View style={styles.container}>
      {BAR_CONFIG.map((cfg, i) => (
        <WaveBar key={i} baseHeight={cfg.height} delay={cfg.delay} active={active} color={color} />
      ))}
    </View>
  )
}

function WaveBar({
  baseHeight,
  delay,
  active,
  color,
}: {
  baseHeight: number
  delay: number
  active: boolean
  color: string
}) {
  const height = useSharedValue(4)

  useEffect(() => {
    if (active) {
      height.value = withRepeat(
        withSequence(
          withTiming(baseHeight * 1.6, {
            duration: 350 + delay,
            easing: Easing.inOut(Easing.sine),
          }),
          withTiming(baseHeight * 0.4, {
            duration: 350 + delay,
            easing: Easing.inOut(Easing.sine),
          }),
        ),
        -1,
        true,
      )
    } else {
      height.value = withTiming(4, { duration: 250 })
    }
  }, [active])

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }))

  return (
    <Animated.View
      style={[styles.bar, animatedStyle, { backgroundColor: color }]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 52,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
})
