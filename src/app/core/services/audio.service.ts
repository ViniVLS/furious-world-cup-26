import { Injectable, signal, computed, inject } from '@angular/core';
import { DebugService } from '../../../debug/debug.service';

export type AudioEvent =
  'login' | 'pack_open' | 'trade_success' | 'ranking_enter' |
  'album_enter' | 'buy_pack' | 'quiz_correct' | 'quiz_wrong' | 'mission_complete';

export interface AudioDebugInfo {
  event: AudioEvent;
  path: string;
  exists: boolean | null;
  loadError: string | null;
  readyState: number;
  networkState: number;
  lastPlayError: string | null;
  lastPlaySuccess: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly debug = inject(DebugService);
  private readonly STORAGE_KEY = 'furia-copas-audio-muted';

  private _isMuted = signal<boolean>(false);
  isMuted = computed(() => this._isMuted());

  private audioMap: Record<AudioEvent, string> = {
    'login': '/assets/audio/login.mp3',
    'pack_open': '/assets/audio/pack_open.mp3',
    'trade_success': '/assets/audio/trade_success.mp3',
    'ranking_enter': '/assets/audio/ranking_enter.mp3',
    'album_enter': '/assets/audio/album_enter.mp3',
    'buy_pack': '/assets/audio/buy_pack.mp3',
    'quiz_correct': '/assets/audio/quiz_correct.mp3',
    'quiz_wrong': '/assets/audio/quiz_wrong.mp3',
    'mission_complete': '/assets/audio/mission_complete.mp3'
  };

  private audioElements: Partial<Record<AudioEvent, HTMLAudioElement>> = {};
  private activeAudio: HTMLAudioElement | null = null;
  private hasUserInteracted = false;

  readonly debugInfo = signal<Record<AudioEvent, AudioDebugInfo>>(
    Object.keys(this.audioMap).reduce((acc, key) => {
      const event = key as AudioEvent;
      acc[event] = {
        event, path: this.audioMap[event],
        exists: null, loadError: null, readyState: 0, networkState: 0,
        lastPlayError: null, lastPlaySuccess: null,
      };
      return acc;
    }, {} as Record<AudioEvent, AudioDebugInfo>)
  );

  constructor() {
    this.debug.logLifecycle('AudioService', 'constructor');
    this.loadSettings();
    this.preloadAudios();

    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
          this.debug.info('LIFECYCLE', 'AudioService', 'Primeira interação detectada. Modo interativo ativado.');
          const silentAudio = new Audio();
          silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
          silentAudio.volume = 0;
          silentAudio.play().then(() => {
            this.debug.info('AUDIO', 'AudioService', 'Audio silencioso desbloqueado com sucesso');
          }).catch(() => {});
          this.preloadAudios();
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
        }
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    }
  }

  private preloadAudios(): void {
    if (typeof window === 'undefined') return;
    this.debug.debug('METHOD', 'AudioService', 'Iniciando pré-carregamento de todos os áudios');

    (Object.keys(this.audioMap) as AudioEvent[]).forEach(event => {
      if (this.audioElements[event]) return;

      const path = this.audioMap[event];
      this.debug.info('AUDIO', 'AudioService', `Pre-carregando: ${event} → ${path}`, { path });

      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = 0.8;

      audio.addEventListener('loadstart', () => {
        this.updateDebug(event, { readyState: 0 });
        this.debug.debug('AUDIO', 'AudioService', `[LOAD] ${event}: loadstart - buscando arquivo`, { path });
      });

      audio.addEventListener('loadedmetadata', () => {
        this.debug.info('AUDIO', 'AudioService', `[LOAD] ${event}: loadedmetadata - arquivo encontrado!`, { path, duration: audio.duration, readyState: audio.readyState });
        this.updateDebug(event, { exists: true, readyState: audio.readyState, networkState: audio.networkState });
        this.checkFileExists(path, event);
      });

      audio.addEventListener('canplay', () => {
        this.debug.debug('AUDIO', 'AudioService', `[LOAD] ${event}: canplay - pronto para tocar`, { readyState: audio.readyState });
        this.updateDebug(event, { readyState: audio.readyState });
      });

      audio.addEventListener('canplaythrough', () => {
        this.debug.debug('AUDIO', 'AudioService', `[LOAD] ${event}: canplaythrough - carregado completamente`, { readyState: audio.readyState });
      });

      audio.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement;
        let errorMsg = 'Erro desconhecido';
        switch (target.error?.code) {
          case 1: errorMsg = 'MEDIA_ERR_ABORTED - carregamento abortado'; break;
          case 2: errorMsg = 'MEDIA_ERR_NETWORK - erro de rede'; break;
          case 3: errorMsg = 'MEDIA_ERR_DECODE - erro de decodificação'; break;
          case 4: errorMsg = 'MEDIA_ERR_SRC_NOT_SUPPORTED - formato não suportado ou 404'; break;
          default: errorMsg = `Código: ${target.error?.code}`; break;
        }
        this.debug.error('ERROR', 'AudioService', `[ERROR] ${event}: ${errorMsg}`, { path, errorCode: target.error?.code, networkState: target.networkState }, 'preloadAudios');
        this.updateDebug(event, { exists: false, loadError: errorMsg, networkState: target.networkState });
        this.checkFileExists(path, event);
      });

      audio.addEventListener('ended', () => {
        this.debug.debug('AUDIO', 'AudioService', `[ENDED] ${event}: reprodução finalizada`, { duration: audio.duration });
      });

      this.audioElements[event] = audio;
      this.debug.debug('AUDIO', 'AudioService', `Elemento audio criado para: ${event}`, { path });
    });
  }

  private async checkFileExists(path: string, event: AudioEvent): Promise<void> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (response.ok) {
        this.debug.debug('AUDIO', 'AudioService', `${event}: HEAD ${path} → ${response.status} OK`);
      } else {
        this.debug.error('ERROR', 'AudioService', `${event}: HEAD ${path} → ${response.status} ${response.statusText}`, { status: response.status }, 'checkFileExists');
        this.updateDebug(event, { exists: false, loadError: `HTTP ${response.status}` });
      }
    } catch (e) {
      this.debug.error('ERROR', 'AudioService', `${event}: fetch HEAD falhou para ${path}`, e, 'checkFileExists');
    }
  }

  private updateDebug(event: AudioEvent, patch: Partial<AudioDebugInfo>): void {
    this.debugInfo.update(info => ({
      ...info,
      [event]: { ...info[event], ...patch }
    }));
  }

  private loadSettings(): void {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored === 'true') {
        this._isMuted.set(true);
        this.debug.info('STATE', 'AudioService', 'Audio mutado pelo usuário (localStorage)');
      }
    }
  }

  toggleMute(): void {
    this.debug.logMethodEntry('AudioService', 'toggleMute');
    const newState = !this._isMuted();
    this._isMuted.set(newState);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, String(newState));
    }

    if (newState && this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
    }

    this.debug.info('STATE', 'AudioService', `Mute toggle: ${newState ? 'MUTED' : 'UNMUTED'}`, { previousState: !newState, newState });
    this.debug.logMethodExit('AudioService', 'toggleMute', { muted: newState });
  }

  play(event: AudioEvent): void {
    this.debug.logMethodEntry('AudioService', 'play', { event, muted: this._isMuted(), interacted: this.hasUserInteracted });
    const timer = this.debug.startTimer('audio-play');

    if (this._isMuted()) {
      this.debug.warn('WARN', 'AudioService', 'play() IGNORADO: áudio está mutado', null, 'play');
      const ms = this.debug.endTimer('audio-play');
      this.debug.logMethodExit('AudioService', 'play', { ignored: true, reason: 'muted' }, ms);
      return;
    }

    if (typeof window === 'undefined') {
      this.debug.warn('WARN', 'AudioService', 'play() IGNORADO: contexto SSR', null, 'play');
      const ms = this.debug.endTimer('audio-play');
      this.debug.logMethodExit('AudioService', 'play', { ignored: true, reason: 'ssr' }, ms);
      return;
    }

    const audio = this.audioElements[event];

    if (!audio) {
      this.debug.error('ERROR', 'AudioService', `Elemento audio não existe para "${event}". Tentando preload...`, null, 'play');
      this.preloadAudios();
      const retry = this.audioElements[event];
      if (!retry) {
        this.debug.error('ERROR', 'AudioService', `FATAL: mesmo após preload, audio "${event}" não foi criado`, null, 'play');
        const ms = this.debug.endTimer('audio-play');
        this.debug.logMethodExit('AudioService', 'play', { error: 'element_not_created' }, ms);
        return;
      }
    }

    const el = this.audioElements[event]!;
    const path = this.audioMap[event];

    this.debug.debug('AUDIO', 'AudioService', `Elemento encontrado para ${event}`, {
      src: el.src, readyState: el.readyState, networkState: el.networkState
    });

    if (el.networkState === 3) {
      this.debug.error('ERROR', 'AudioService', `ERRO: noSource - o caminho "${path}" não é uma fonte válida de audio`, { path, networkState: el.networkState }, 'play');
    }
    if (el.networkState === 2) {
      this.debug.error('ERROR', 'AudioService', `ERRO: networkError - falha ao carregar "${path}"`, { path, networkState: el.networkState }, 'play');
    }

    if (this.activeAudio && this.activeAudio !== el) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
    }

    this.activeAudio = el;
    el.volume = 0.8;
    el.muted = false;

    if (el.readyState < 2) {
      this.debug.warn('WARN', 'AudioService', `readyState=${el.readyState} - áudio ainda não carregou. Forçando carregamento...`, { readyState: el.readyState }, 'play');
      el.load();
    }

    if (typeof document !== 'undefined') {
      let container = document.getElementById('audio-shell-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'audio-shell-container';
        container.style.cssText = 'position:fixed;width:1px;height:1px;top:-9999px;left:-9999px;pointer-events:none;';
        document.body.appendChild(container);
      }
      if (el.parentElement !== container) {
        container.appendChild(el);
      }
    }

    const playPromise = el.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.debug.info('AUDIO', 'AudioService', `✅ SUCESSO: "${event}" tocando agora!`, {
          event, src: el.src, readyState: el.readyState, networkState: el.networkState
        });
        this.updateDebug(event, { lastPlaySuccess: true, lastPlayError: null });
        const ms = this.debug.endTimer('audio-play');
        this.debug.logMethodExit('AudioService', 'play', { success: true, event }, ms);
      }).catch((err) => {
        let cause = 'desconhecida';
        if (err.name === 'NotAllowedError') cause = 'autoplay bloqueado pelo navegador';
        else if (err.name === 'AbortError') cause = 'arquivo não encontrado (404) ou URL inválida';
        else if (err.name === 'NotFoundError') cause = 'arquivo não existe no caminho especificado';

        this.debug.error('ERROR', 'AudioService', `❌ FALHA ao tocar "${event}": ${cause}`, {
          event, errorName: err.name, errorMessage: err.message,
          readyState: el.readyState, networkState: el.networkState, src: el.src, path
        }, 'play');

        this.updateDebug(event, { lastPlaySuccess: false, lastPlayError: `${err.name}: ${err.message}` });

        if (err.name === 'AbortError' || err.name === 'NotFoundError') {
          this.checkFileExists(path, event);
        }

        const ms = this.debug.endTimer('audio-play');
        this.debug.logMethodExit('AudioService', 'play', { success: false, error: err.name }, ms);
      });
    }
  }

  testAudio(event: AudioEvent): void {
    this.debug.info('AUDIO', 'AudioService', '========== TESTE MANUAL ==========', {
      event, path: this.audioMap[event],
      hasElement: !!this.audioElements[event],
      debugInfo: this.debugInfo()[event]
    });
    this.play(event);
  }

  testAll(): void {
    this.debug.info('AUDIO', 'AudioService', '========== TESTE DE TODOS OS AUDIOS ==========');
    (Object.keys(this.audioMap) as AudioEvent[]).forEach(event => this.testAudio(event));
  }

  getDebugInfo(): Record<AudioEvent, AudioDebugInfo> {
    return this.debugInfo();
  }
}
