export const THRESHOLDS = {
  battery: {
    warning: 0.20,
    critical: 0.10,
  },
  storage: {
    warningMB: 500,
    criticalMB: 200,
  },
  bitratePerMinuteMB: 17,
  silence: {
    dbLevel: -40,
    durationMs: 2500,
  },
  focus: {
    lossConfidence: 0.4,
    restoreConfidence: 0.7,
    lossFrameCount: 8,
  },
  composition: {
    headroomMinPct: 0.08,
    headroomMaxPct: 0.22,
    faceTooClosePct: 0.60,
    faceTooFarPct: 0.15,
  },
}
