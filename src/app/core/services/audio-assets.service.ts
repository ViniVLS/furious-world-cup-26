import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AudioAsset, AudioEventMapping, AudioSettings,
  AUDIO_EVENTS, AudioEvent
} from '../models/audio.model';
import { DebugService } from '../../../debug/debug.service';

const STORAGE_ASSETS = 'furia-audio-assets';
const STORAGE_MAPPINGS = 'furia-audio-mappings';
const STORAGE_SETTINGS = 'furia-audio-settings';

const DEFAULT_SETTINGS: AudioSettings = {
  globalVolume: 0.8,
  globalMute: false,
  maxFileSizeMB: 5,
  allowedFormats: ['mp3', 'wav', 'ogg'],
  autoplayEnabled: true
};

const DEFAULT_ASSETS: AudioAsset[] = AUDIO_EVENTS.map(event => ({
  id: `default-${event}`,
  name: `Default - ${event.replace('_', ' ').toUpperCase()}`,
  fileName: `${event}.mp3`,
  event: event,
  duration: 1.0,
  fileSize: 300000,
  format: 'mp3',
  uploadedAt: new Date().toISOString(),
  uploadedBy: 'system',
  playCount: 0,
  isActive: true,
  storageRef: `/assets/audio/${event}.mp3`
}));

const DEFAULT_MAPPINGS: AudioEventMapping[] = AUDIO_EVENTS.map(event => ({
  event,
  assignedAudios: [`default-${event}`],
  volume: 0.8,
  isEnabled: true,
  playMode: 'random'
}));

@Injectable({ providedIn: 'root' })
export class AudioAssetsService {
  private readonly debug = inject(DebugService);

  readonly assets = signal<AudioAsset[]>(this.loadAssets());
  readonly mappings = signal<AudioEventMapping[]>(this.loadMappings());
  readonly settings = signal<AudioSettings>(this.loadSettings());

  private loadAssets(): AudioAsset[] {
    if (typeof window === 'undefined') return DEFAULT_ASSETS;
    try {
      const stored = localStorage.getItem(STORAGE_ASSETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ASSETS;
    } catch { return DEFAULT_ASSETS; }
  }

  private saveAssets(assets: AudioAsset[]): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_ASSETS, JSON.stringify(assets)); } catch {}
  }

  private loadMappings(): AudioEventMapping[] {
    if (typeof window === 'undefined') return DEFAULT_MAPPINGS;
    try {
      const stored = localStorage.getItem(STORAGE_MAPPINGS);
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If stored mappings have absolutely no assigned audios, assume they were the default empty ones and replace
          if (parsed.every((m: AudioEventMapping) => m.assignedAudios.length === 0)) {
            parsed = DEFAULT_MAPPINGS;
            this.saveMappings(parsed);
          }
          
          const missing = AUDIO_EVENTS.filter(e => !parsed.find((m: AudioEventMapping) => m.event === e));
          return [...parsed, ...missing.map(e => DEFAULT_MAPPINGS.find(m => m.event === e)!)]
            .filter(Boolean);
        }
      }
    } catch {}
    return DEFAULT_MAPPINGS;
  }

  private saveMappings(mappings: AudioEventMapping[]): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_MAPPINGS, JSON.stringify(mappings)); } catch {}
  }

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  }

  private saveSettings(settings: AudioSettings): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch {}
  }

  async uploadAudio(file: File, name: string, event?: AudioEvent): Promise<AudioAsset> {
    this.debug.logMethodEntry('AudioAssetsService', 'uploadAudio', { name, fileName: file.name, event, size: file.size });

    const settings = this.settings();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!settings.allowedFormats.includes(ext)) {
      throw new Error(`Formato ${ext} não permitido. Permitidos: ${settings.allowedFormats.join(', ')}`);
    }
    if (file.size > settings.maxFileSizeMB * 1024 * 1024) {
      throw new Error(`Arquivo muito grande. Máximo: ${settings.maxFileSizeMB}MB`);
    }

    const dataUrl = await this.fileToBase64(file);
    const audio = document.createElement('audio');
    audio.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error('Não foi possível carregar o arquivo de áudio'));
    });

    const asset: AudioAsset = {
      id: `audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      fileName: file.name,
      event: event || null,
      duration: audio.duration,
      fileSize: file.size,
      format: ext,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin',
      playCount: 0,
      isActive: true,
      dataUrl
    };

    this.assets.update(list => {
      const updated = [asset, ...list];
      this.saveAssets(updated);
      return updated;
    });

    if (event) {
      this.assignToEvent(asset.id, event);
    }

    this.debug.logAudit('AudioAssetsService', `Áudio upload: ${name}`, { assetId: asset.id, event });
    this.debug.logMethodExit('AudioAssetsService', 'uploadAudio', { assetId: asset.id });
    return asset;
  }

  deleteAudio(id: string): void {
    this.debug.logMethodEntry('AudioAssetsService', 'deleteAudio', { id });
    const asset = this.assets().find(a => a.id === id);
    this.assets.update(list => {
      const updated = list.filter(a => a.id !== id);
      this.saveAssets(updated);
      return updated;
    });
    this.mappings.update(list => {
      const updated = list.map(m => ({ ...m, assignedAudios: m.assignedAudios.filter(aid => aid !== id) }));
      this.saveMappings(updated);
      return updated;
    });
    this.debug.logAudit('AudioAssetsService', `Áudio deletado: ${asset?.name}`, { assetId: id });
    this.debug.logMethodExit('AudioAssetsService', 'deleteAudio');
  }

  assignToEvent(audioId: string, event: AudioEvent): void {
    this.debug.logMethodEntry('AudioAssetsService', 'assignToEvent', { audioId, event });
    this.mappings.update(list => {
      const updated = list.map(m => {
        if (m.event !== event) return m;
        if (m.assignedAudios.includes(audioId)) return m;
        return { ...m, assignedAudios: [...m.assignedAudios, audioId] };
      });
      this.saveMappings(updated);
      return updated;
    });
    this.debug.logMethodExit('AudioAssetsService', 'assignToEvent');
  }

  removeFromEvent(audioId: string, event: AudioEvent): void {
    this.debug.logMethodEntry('AudioAssetsService', 'removeFromEvent', { audioId, event });
    this.mappings.update(list => {
      const updated = list.map(m => {
        if (m.event !== event) return m;
        return { ...m, assignedAudios: m.assignedAudios.filter(id => id !== audioId) };
      });
      this.saveMappings(updated);
      return updated;
    });
    this.debug.logMethodExit('AudioAssetsService', 'removeFromEvent');
  }

  setEventVolume(event: AudioEvent, volume: number): void {
    this.mappings.update(list => {
      const updated = list.map(m => m.event === event ? { ...m, volume } : m);
      this.saveMappings(updated);
      return updated;
    });
  }

  toggleEventEnabled(event: AudioEvent, enabled: boolean): void {
    this.mappings.update(list => {
      const updated = list.map(m => m.event === event ? { ...m, isEnabled: enabled } : m);
      this.saveMappings(updated);
      return updated;
    });
  }

  setPlayMode(event: AudioEvent, mode: 'sequential' | 'random'): void {
    this.mappings.update(list => {
      const updated = list.map(m => m.event === event ? { ...m, playMode: mode } : m);
      this.saveMappings(updated);
      return updated;
    });
  }

  reorderPool(event: AudioEvent, orderedIds: string[]): void {
    this.mappings.update(list => {
      const updated = list.map(m => m.event === event ? { ...m, assignedAudios: orderedIds } : m);
      this.saveMappings(updated);
      return updated;
    });
  }

  setGlobalVolume(volume: number): void {
    this.settings.update(s => {
      const updated = { ...s, globalVolume: volume };
      this.saveSettings(updated);
      return updated;
    });
  }

  setGlobalMute(muted: boolean): void {
    this.settings.update(s => {
      const updated = { ...s, globalMute: muted };
      this.saveSettings(updated);
      return updated;
    });
  }

  setAutoplay(enabled: boolean): void {
    this.settings.update(s => {
      const updated = { ...s, autoplayEnabled: enabled };
      this.saveSettings(updated);
      return updated;
    });
  }

  incrementPlayCount(audioId: string): void {
    this.assets.update(list => {
      const updated = list.map(a => a.id === audioId ? { ...a, playCount: a.playCount + 1 } : a);
      this.saveAssets(updated);
      return updated;
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
