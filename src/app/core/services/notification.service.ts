import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private platformId = inject(PLATFORM_ID);

    // SK07/SK08 — Melhoria de engajamento via Web Notifications
    async requestPermission(): Promise<boolean> {
        if (!isPlatformBrowser(this.platformId) || !('Notification' in window)) return false;

        const permission = await Notification.requestPermission();
        console.log(`[PUSH LOG] Notification permission: ${permission}`);
        return permission === 'granted';
    }

    notify(title: string, body: string, icon = '/assets/icons/icon-192x192.png') {
        if (isPlatformBrowser(this.platformId) && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon,
                badge: '/assets/icons/badge-72x72.png',
                tag: 'furious-wc'
            });
            console.log(`[PUSH LOG] Notification sent: ${title}`);
        }
    }

    // Simula notificação de troca aceita
    notifyTradeCompleted(partnerName: string) {
        this.notify(
            'Troca Concluída! 🤝',
            `${partnerName} aceitou sua oferta. Confira seu novo sticker no álbum!`
        );
    }

    // Simula notificação de novo desafio
    notifyNewChallenge(challengeName: string) {
        this.notify(
            'Novo Desafio Fúria! ⚡',
            `O desafio "${challengeName}" está disponível. Ganhe moedas agora!`
        );
    }
}
