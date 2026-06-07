import { create } from 'zustand'
import { CompositionResult } from '@/types/composition'

interface CompositionState {
  result: CompositionResult | null
  isAnalyzing: boolean
  setResult: (r: CompositionResult | null) => void
  setAnalyzing: (v: boolean) => void
}

export const useCompositionStore = create<CompositionState>()((set) => ({
  result: null,
  isAnalyzing: false,
  setResult: (r) => set({ result: r }),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
}))
