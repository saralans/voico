export interface FaceBounds {
  x: number
  y: number
  width: number
  height: number
}

// Minimal shape compatible with expo-face-detector's FaceFeature
export interface DetectedFace {
  bounds: {
    origin: { x: number; y: number }
    size: { width: number; height: number }
  }
  faceID?: number
  rollAngle?: number
  yawAngle?: number
}

export interface CompositionResult {
  faceCentered: boolean
  headroomOk: boolean
  backlit: boolean
  faceTooClose: boolean
  faceTooFar: boolean
  noFace: boolean
  feedback: string[]
}
