export type EventType =
  | 'recording_start'
  | 'recording_stop'
  | 'focus_lost'
  | 'focus_restored'
  | 'hesitation'
  | 'silence'
  | 'user_marker'
  | 'battery_warning'
  | 'storage_warning'

export interface SessionEvent {
  id: string
  timestamp: number
  type: EventType
  note?: string
}

export interface FocusIssue {
  start: number
  end: number
}

export interface EditWindow {
  start: number
  end: number
  reason: string
}

export interface SessionSummary {
  duration: number
  focusIssues: FocusIssue[]
  suggestedEdits: EditWindow[]
  batteryWarnings: number[]
  storageWarnings: number[]
}
