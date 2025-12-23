
export enum ZoneType {
  MAJOR_STRUCTURE = 'MAJOR_STRUCTURE',
  TRAP_INDUCTION = 'TRAP_INDUCTION',
  HIGH_PROB_POI = 'HIGH_PROB_POI',
  WICK_RETEST = 'WICK_RETEST'
}

export interface TradingZone {
  id: string;
  type: ZoneType;
  label: string;
  description: string;
  coordinates: {
    x: number; // 0-100 percentage
    y: number; // 0-100 percentage
    width: number;
    height: number;
  };
  probability: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AnalysisResult {
  summary: string;
  zones: TradingZone[];
  mentorAdvice: string;
  slRationale?: string;
  tpRationale?: string;
}
