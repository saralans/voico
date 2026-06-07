import React from 'react'
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { DetectedFace } from '@/types/composition'

interface Props {
  onFacesDetected?: (faces: DetectedFace[]) => void
  onViewLayout?: (layout: { width: number; height: number }) => void
}

export function CameraPreview({ onFacesDetected, onViewLayout }: Props) {
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
      onFacesDetected={
        onFacesDetected
          ? (result) => onFacesDetected(result.faces as DetectedFace[])
          : undefined
      }
      faceDetectorSettings={{
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
        minDetectionInterval: 200,
        tracking: true,
      }}
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
