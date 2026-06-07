import { create } from 'zustand'

export type PermissionStatus = 'unknown' | 'granted' | 'denied'

interface AppState {
  cameraPermission: PermissionStatus
  micPermission: PermissionStatus
  speechPermission: PermissionStatus
  setCameraPermission: (s: PermissionStatus) => void
  setMicPermission: (s: PermissionStatus) => void
  setSpeechPermission: (s: PermissionStatus) => void
}

export const useAppStore = create<AppState>()((set) => ({
  cameraPermission: 'unknown',
  micPermission: 'unknown',
  speechPermission: 'unknown',
  setCameraPermission: (s) => set({ cameraPermission: s }),
  setMicPermission: (s) => set({ micPermission: s }),
  setSpeechPermission: (s) => set({ speechPermission: s }),
}))
