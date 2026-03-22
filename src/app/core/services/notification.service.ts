import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DebugService } from '../../../debug/debug.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly debug = inject(DebugService);
  private platformId = inject(PLATFORM_ID);

  async requestPermission(): Promise<boolean> {
    this.debug.logMethodEntry('NotificationService', 'requestPermission');
    const timer = this.debug.startTimer('requestPermission');
    if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) {
      this.debug.warn('WARN', 'NotificationService', 'Notificações não suportadas nesta plataforma', null, 'requestPermission');
      const ms = this.debug.endTimer('requestPermission');
      this.debug.logMethodExit('NotificationService', 'requestPermission', { granted: false, reason: 'unsupported_platform' }, ms);
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      this.debug.logPush('NotificationService', `Permission request: ${permission}`, { permission });
      const granted = permission === 'granted';
      const ms = this.debug.endTimer('requestPermission');
      this.debug.logMethodExit('NotificationService', 'requestPermission', { granted }, ms);
      return granted;
    } catch (e) {
      this.debug.error('ERROR', 'NotificationService', 'Erro ao solicitar permissão de notificação', e, 'requestPermission');
      const ms = this.debug.endTimer('requestPermission');
      this.debug.logMethodExit('NotificationService', 'requestPermission', { granted: false, error: e }, ms);
      return false;
    }
  }

  notify(title: string, body: string, icon = '/assets/icons/icon-192x192.png') {
    this.debug.logMethodEntry('NotificationService', 'notify', { title, body, icon });
    const timer = this.debug.startTimer('notify');
    if (isPlatformBrowser(this.platformId) && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon, badge: '/assets/icons/badge-72x72.png', tag: 'furious-wc' });
        this.debug.logPush('NotificationService', `Notificação enviada: ${title}`, { title, body });
        const ms = this.debug.endTimer('notify');
        this.debug.logMethodExit('NotificationService', 'notify', { sent: true }, ms);
      } catch (e) {
        this.debug.error('ERROR', 'NotificationService', 'Erro ao exibir notificação', e, 'notify');
        const ms = this.debug.endTimer('notify');
        this.debug.logMethodExit('NotificationService', 'notify', { sent: false, error: e }, ms);
      }
    } else {
      this.debug.warn('WARN', 'NotificationService', 'Notificação não enviada: permissão negada', { permission: Notification.permission }, 'notify');
      const ms = this.debug.endTimer('notify');
      this.debug.logMethodExit('NotificationService', 'notify', { sent: false, reason: 'permission_denied' }, ms);
    }
  }

  notifyTradeCompleted(partnerName: string) {
    this.debug.logMethodEntry('NotificationService', 'notifyTradeCompleted', { partnerName });
    this.notify('Troca Concluída! 🤝', `${partnerName} aceitou sua oferta. Confira seu novo sticker no álbum!`);
    this.debug.logMethodExit('NotificationService', 'notifyTradeCompleted');
  }

  notifyNewChallenge(challengeName: string) {
    this.debug.logMethodEntry('NotificationService', 'notifyNewChallenge', { challengeName });
    this.notify('Novo Desafio Fúria! ⚡', `O desafio "${challengeName}" está disponível. Ganhe moedas agora!`);
    this.debug.logMethodExit('NotificationService', 'notifyNewChallenge');
  }
}
