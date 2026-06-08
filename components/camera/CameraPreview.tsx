import React from 'react'
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'

interface Props {
  onViewLayout?: (layout: { width: number; height: number }) => void
}

export function CameraPreview({ onViewLayout }: Props) {
  const [permission] = useCameraPermissions()

  function handleLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout
    onViewLayout?.({ width, height })
  }

  if (!permission) {
    return <View style={styles.placeholder} />
  }

  if (!permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Camera access required</Text>
        <Text style={styles.placeholderSub}>Check your device settings</Text>
      </View>
    )
  }

  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      facing="front"
      onLayout={handleLayout}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  placeholderSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 6,
  },
})
