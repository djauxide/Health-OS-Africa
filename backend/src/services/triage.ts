export type Priority = "ROUTINE" | "URGENT" | "CRITICAL";
export interface Vitals { systolicBp?: number | null; pulse?: number | null; temperatureC?: number | null; spo2?: number | null; }
export function suggestPriority(v: Vitals): Priority { const { systolicBp: sys, pulse, temperatureC: t, spo2 } = v; if ((sys ?? 0) >= 180 || (spo2 ?? 100) < 90 || (pulse ?? 0) > 130 || (t ?? 0) >= 39.5) return "CRITICAL"; if ((sys ?? 0) >= 160 || (spo2 ?? 100) < 94 || (pulse ?? 0) > 110 || (t ?? 0) >= 38.5) return "URGENT"; return "ROUTINE"; }
