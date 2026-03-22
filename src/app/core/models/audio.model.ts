export type AudioEvent =
  | 'login'
  | 'pack_open'
  | 'trade_success'
  | 'ranking_enter'
  | 'album_enter'
  | 'buy_pack'
  | 'quiz_correct'
  | 'quiz_wrong'
  | 'mission_complete';

export interface AudioAsset {
  id: string;
  name: string;
  fileName: string;
  event: AudioEvent | null;
  duration: number;
  fileSize: number;
  format: string;
  uploadedAt: string;
  uploadedBy: string;
  playCount: number;
  isActive: boolean;
  dataUrl?: string;
  storageRef?: string;
  startTime?: number;
  endTime?: number;
}

export interface AudioEventMapping {
  event: AudioEvent;
  assignedAudios: string[];
  volume: number;
  isEnabled: boolean;
  playMode: 'sequential' | 'random';
}

export interface AudioSettings {
  globalVolume: number;
  globalMute: boolean;
  maxFileSizeMB: number;
  allowedFormats: string[];
  autoplayEnabled: boolean;
}

export const AUDIO_EVENTS: AudioEvent[] = [
  'login', 'pack_open', 'trade_success', 'ranking_enter',
  'album_enter', 'buy_pack', 'quiz_correct', 'quiz_wrong', 'mission_complete'
];

export const AUDIO_EVENT_LABELS: Record<AudioEvent, string> = {
  login: 'Login',
  pack_open: 'Abrir Pacote',
  trade_success: 'Troca Concluída',
  ranking_enter: 'Entrar no Ranking',
  album_enter: 'Entrar no Álbum',
  buy_pack: 'Comprar Pacote',
  quiz_correct: 'Quiz Correto',
  quiz_wrong: 'Quiz Incorreto',
  mission_complete: 'Missão Completa'
};
