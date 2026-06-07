import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useCameraPermissions } from 'expo-camera'
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition'
import { useAppStore } from '@/stores/appStore'

export default function RootLayout() {
  const [, requestCameraPermission] = useCameraPermissions()
  const { setCameraPermission, setMicPermission, setSpeechPermission } = useAppStore()

  useEffect(() => {
    async function requestPermissions() {
      const camera = await requestCameraPermission()
      setCameraPermission(camera.granted ? 'granted' : 'denied')

      const speech = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
      setSpeechPermission(speech.granted ? 'granted' : 'denied')
      setMicPermission(speech.granted ? 'granted' : 'denied')
    }
    requestPermissions()
  }, [])

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'fade',
        }}
      />
    </SafeAreaProvider>
  )
}
