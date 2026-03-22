import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStateService, SystemConfig } from '../../../core/services/admin-state.service';
import { AudioAssetsService } from '../../../core/services/audio-assets.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AudioEvent, AUDIO_EVENT_LABELS, AUDIO_EVENTS } from '../../../core/models/audio.model';
import { DebugService } from '../../../../debug/debug.service';
import { DebugBotOverlayComponent } from '../debug-bot-overlay/debug-bot-overlay.component';

type AdminTab = 'dashboard' | 'users' | 'economy' | 'packs' | 'stickers' | 'trades' | 'missions' | 'plans' | 'configs' | 'debug' | 'audio';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DebugBotOverlayComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent {
  private adminState = inject(AdminStateService);
  readonly audioAssets = inject(AudioAssetsService);
  private audioPlayer = inject(AudioPlayerService);
  private toast = inject(ToastService);
  private debug = inject(DebugService);

  readonly tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'Usuários', icon: 'people' },
    { id: 'economy', label: 'Economia', icon: 'account_balance_wallet' },
    { id: 'packs', label: 'Pacotes', icon: 'inventory_2' },
    { id: 'stickers', label: 'Figurinhas', icon: 'collections' },
    { id: 'trades', label: 'Trocas', icon: 'swap_horiz' },
    { id: 'missions', label: 'Missões/Badges', icon: 'emoji_events' },
    { id: 'plans', label: 'Planos', icon: 'subscriptions' },
    { id: 'configs', label: 'Configs', icon: 'settings' },
    { id: 'debug', label: 'Debug', icon: 'bug_report' },
    { id: 'audio', label: 'Áudio', icon: 'music_note' },
  ];

  activeTab = signal<AdminTab>('dashboard');
  searchQuery = signal('');
  selectedAudioEvent = signal<AudioEvent>('pack_open');
  activityFilter = signal<'all' | 'admin' | 'system'>('all');
  debugFilter = signal<'ERROR' | 'WARN' | 'INFO' | 'all'>('ERROR');

  stats = computed(() => this.adminState.getStats());
  users = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.adminState.users().filter(u =>
      u.username.toLowerCase().includes(q) || u.country?.toLowerCase().includes(q)
    );
  });
  activityLog = computed(() => {
    const filter = this.activityFilter();
    return this.adminState.activityLog().filter(e =>
      filter === 'all' || e.adminId === (filter === 'admin' ? 'u1' : 'system')
    );
  });
  config = computed(() => this.adminState.systemConfig());
  audioAssetsList = computed(() => this.audioAssets.assets());
  audioMappings = computed(() => this.audioAssets.mappings());

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.debug.logNavigation(this.activeTab(), `/painel-admin/${tab}`);
  }

  toggleRole(userId: string): void {
    this.adminState.toggleUserRole(userId);
    this.toast.success('Role atualizado com sucesso!');
  }

  toggleActive(userId: string): void {
    this.adminState.toggleUserActive(userId);
    this.toast.success('Status do usuário atualizado!');
  }

  resetCoins(userId: string): void {
    this.adminState.resetUserCoins(userId);
    this.toast.success('Coins resetados!');
  }

  addCoins(userId: string): void {
    const input = prompt('Quantidade de coins:');
    if (!input) return;
    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) { this.toast.error('Valor inválido'); return; }
    this.adminState.addCoinsToUser(userId, amount);
    this.toast.success(`+${amount} coins concedidos!`);
  }

  updatePackCost(type: string, value: string): void {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) { this.toast.error('Valor inválido'); return; }
    this.adminState.updateSystemConfig({ packCosts: { ...this.config().packCosts, [type]: val } as SystemConfig['packCosts'] });
    this.toast.success('Custo do pacote atualizado!');
  }

  updateDuplicateRate(rarity: number, value: string): void {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) { this.toast.error('Valor inválido'); return; }
    this.adminState.updateSystemConfig({ duplicateRates: { ...this.config().duplicateRates, [rarity]: val } });
    this.toast.success('Taxa de duplicata atualizada!');
  }

  updateConfig(key: string, value: unknown): void {
    this.adminState.updateSystemConfig({ [key]: value } as Partial<SystemConfig>);
    this.toast.success('Configuração salva!');
  }

  toggleFeature(key: 'phygital' | 'quiz'): void {
    const current = this.config().features[key];
    this.updateConfig('features', { ...this.config().features, [key]: !current });
  }

  clearActivityLog(): void {
    this.adminState.clearActivityLog();
    this.toast.success('Log de atividades limpo!');
  }

  testAudio(audioId: string): void {
    this.audioPlayer.play(audioId);
  }

  assignAudio(audioId: string, event: AudioEvent): void {
    this.audioAssets.assignToEvent(audioId, event);
    this.toast.success(`Áudio atribuído ao evento ${AUDIO_EVENT_LABELS[event]}!`);
  }

  removeAudio(audioId: string, event: AudioEvent): void {
    this.audioAssets.removeFromEvent(audioId, event);
    this.toast.info(`Áudio removido do evento ${AUDIO_EVENT_LABELS[event]}`);
  }

  setGlobalVolume(volume: number): void {
    this.audioAssets.setGlobalVolume(volume);
  }

  toggleGlobalMute(): void {
    this.audioAssets.setGlobalMute(!this.audioAssets.settings().globalMute);
  }

  deleteAudio(audioId: string): void {
    this.audioAssets.deleteAudio(audioId);
    this.toast.info('Áudio deletado');
  }

  testEventAudio(event: AudioEvent): void {
    this.audioPlayer.playEvent(event);
  }

  async onUploadAudio(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const name = prompt('Nome do áudio:', file.name.split('.')[0]);
      if (name) {
        try {
          await this.audioAssets.uploadAudio(file, name);
        } catch (e: any) {
          console.error('Erro no upload', e);
          alert('Erro no upload: ' + e.message);
        }
      }
      input.value = '';
    }
  }

  AUDIO_EVENT_LABELS = AUDIO_EVENT_LABELS;
  AUDIO_EVENTS = AUDIO_EVENTS;
}
