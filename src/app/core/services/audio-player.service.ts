import { Injectable, inject } from '@angular/core';
import { Howl } from 'howler';
import { AudioAssetsService } from './audio-assets.service';
import { DebugService } from '../../../debug/debug.service';
import { AudioEvent } from '../models/audio.model';

@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly debug = inject(DebugService);
  private readonly assetsService = inject(AudioAssetsService);
  private howls = new Map<string, Howl>();

  private getSrc(audioId: string): string | null {
    const asset = this.assetsService.assets().find(a => a.id === audioId);
    if (!asset) return null;
    if (asset.dataUrl) return asset.dataUrl;
    if (asset.storageRef) return asset.storageRef;
    return null;
  }

  load(id: string): boolean {
    if (this.howls.has(id)) return true;
    const src = this.getSrc(id);
    if (!src) {
      this.debug.error('ERROR', 'AudioPlayerService', `Source not found for audio: ${id}`, null, 'load');
      return false;
    }
    try {
      const howl = new Howl({
        src: [src],
        html5: true,
        volume: this.assetsService.settings().globalVolume,
        onloaderror: (_id, err) => {
          this.debug.error('ERROR', 'AudioPlayerService', `Howl load error for ${id}: ${err}`);
        }
      });
      this.howls.set(id, howl);
      this.debug.debug('AUDIO', 'AudioPlayerService', `Howl loaded: ${id}`);
      return true;
    } catch (e) {
      this.debug.error('ERROR', 'AudioPlayerService', `Failed to create Howl for ${id}`, e, 'load');
      return false;
    }
  }

  play(audioId: string): void {
    const settings = this.assetsService.settings();
    if (settings.globalMute) {
      this.debug.debug('AUDIO', 'AudioPlayerService', `Ignored: global mute is ON`);
      return;
    }
    if (!this.load(audioId)) return;
    const howl = this.howls.get(audioId);
    if (!howl) return;
    this.assetsService.incrementPlayCount(audioId);
    this.debug.info('AUDIO', 'AudioPlayerService', `Playing: ${audioId}`);
    howl.play();
  }

  stop(audioId: string): void {
    const howl = this.howls.get(audioId);
    if (howl) howl.stop();
  }

  setVolume(audioId: string, volume: number): void {
    const howl = this.howls.get(audioId);
    if (howl) howl.volume(volume);
  }

  pause(audioId: string): void {
    const howl = this.howls.get(audioId);
    if (howl) howl.pause();
  }

  unload(audioId: string): void {
    const howl = this.howls.get(audioId);
    if (howl) {
      howl.unload();
      this.howls.delete(audioId);
      this.debug.debug('AUDIO', 'AudioPlayerService', `Unloaded: ${audioId}`);
    }
  }

  playEvent(event: AudioEvent): void {
    const mapping = this.assetsService.mappings().find(m => m.event === event);
    if (!mapping || !mapping.isEnabled) {
      this.debug.debug('AUDIO', 'AudioPlayerService', `Event ${event} is disabled or has no audio`);
      return;
    }
    if (mapping.assignedAudios.length === 0) {
      this.debug.debug('AUDIO', 'AudioPlayerService', `Event ${event} has no assigned audios`);
      return;
    }
    let audioId: string;
    if (mapping.playMode === 'random') {
      audioId = mapping.assignedAudios[Math.floor(Math.random() * mapping.assignedAudios.length)];
    } else {
      audioId = mapping.assignedAudios[0];
    }
    this.setVolume(audioId, mapping.volume);
    this.play(audioId);
  }

  preloadAll(): void {
    this.debug.logMethodEntry('AudioPlayerService', 'preloadAll');
    for (const asset of this.assetsService.assets()) {
      if (asset.isActive) {
        this.load(asset.id);
      }
    }
    this.debug.logMethodExit('AudioPlayerService', 'preloadAll', { count: this.howls.size });
  }
}
