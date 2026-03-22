import { Component, OnInit, ElementRef, ViewChild, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { toPng } from 'html-to-image';
import { DebugService } from '../../../../debug/debug.service';

@Component({
  selector: 'app-sticker-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './sticker-creator.component.html',
  styleUrl: './sticker-creator.component.css'
})
export class StickerCreatorComponent implements OnInit {
  private readonly debug = inject(DebugService);
  @ViewChild('stickerPreviewEl') stickerPreviewRef!: ElementRef<HTMLElement>;
  private platformId = inject(PLATFORM_ID);

  name = 'SEU NOME';
  country = 'BRA';
  position = 'FWD';
  number = '10';
  rarity = 'legendary';

  uploadedImage: string | null = null;
  isRemovingBg = false;
  bgRemoved = false;
  isDownloading = signal(false);
  isSharing = signal(false);
  toastMessage = signal<string | null>(null);

  positions = ['GK', 'DEF', 'MID', 'FWD'];

  countries: { code: string; name: string }[] = [
    { code: 'BRA', name: 'Brasil 🇧🇷' }, { code: 'ARG', name: 'Argentina 🇦🇷' },
    { code: 'URU', name: 'Uruguai 🇺🇾' }, { code: 'FRA', name: 'França 🇫🇷' },
    { code: 'ENG', name: 'Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿' }, { code: 'ESP', name: 'Espanha 🇪🇸' },
    { code: 'GER', name: 'Alemanha 🇩🇪' }, { code: 'POR', name: 'Portugal 🇵🇹' },
    { code: 'ITA', name: 'Itália 🇮🇹' }, { code: 'NED', name: 'Holanda 🇳🇱' },
    { code: 'JPN', name: 'Japão 🇯🇵' }, { code: 'KOR', name: 'Coreia do Sul 🇰🇷' },
    { code: 'AUS', name: 'Austrália 🇦🇺' }, { code: 'MAR', name: 'Marrocos 🇲🇦' },
    { code: 'USA', name: 'Estados Unidos 🇺🇸' }, { code: 'MEX', name: 'México 🇲🇽' },
    { code: 'CAN', name: 'Canadá 🇨🇦' },
  ];

  ngOnInit() {
    this.debug.logLifecycle('StickerCreatorComponent', 'ngOnInit');
  }

  onFileSelected(event: Event) {
    this.debug.logMethodEntry('StickerCreatorComponent', 'onFileSelected');
    const timer = this.debug.startTimer('onFileSelected');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.debug.info('METHOD', 'StickerCreatorComponent', `Arquivo selecionado: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, { fileName: file.name, size: file.size, type: file.type });
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target?.result as string;
        this.bgRemoved = false;
        this.debug.info('METHOD', 'StickerCreatorComponent', 'Imagem carregada no reader');
      };
      reader.readAsDataURL(file);
    }
    const ms = this.debug.endTimer('onFileSelected');
    this.debug.logMethodExit('StickerCreatorComponent', 'onFileSelected');
  }

  removeBackground() {
    this.debug.logMethodEntry('StickerCreatorComponent', 'removeBackground');
    const timer = this.debug.startTimer('removeBackground');
    if (!this.uploadedImage) {
      this.debug.warn('WARN', 'StickerCreatorComponent', 'Nenhuma imagem para processar');
      this.debug.logMethodExit('StickerCreatorComponent', 'removeBackground', { success: false });
      return;
    }
    this.isRemovingBg = true;
    setTimeout(() => {
      this.isRemovingBg = false;
      this.bgRemoved = true;
      this.debug.info('METHOD', 'StickerCreatorComponent', 'Background removido (simulado)');
      const ms = this.debug.endTimer('removeBackground');
      this.debug.logMethodExit('StickerCreatorComponent', 'removeBackground', { success: true }, ms);
    }, 2000);
  }

  private showToast(msg: string) {
    this.debug.debug('METHOD', 'StickerCreatorComponent', `Toast: ${msg}`);
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  private async generatePng(): Promise<Blob> {
    const el = this.stickerPreviewRef.nativeElement;
    const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2 });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async downloadSticker() {
    this.debug.logMethodEntry('StickerCreatorComponent', 'downloadSticker');
    const timer = this.debug.startTimer('downloadSticker');
    if (!isPlatformBrowser(this.platformId)) {
      this.debug.warn('WARN', 'StickerCreatorComponent', 'downloadSticker não suportado em SSR');
      this.debug.logMethodExit('StickerCreatorComponent', 'downloadSticker');
      return;
    }
    this.isDownloading.set(true);
    try {
      const blob = await this.generatePng();
      this.debug.info('METHOD', 'StickerCreatorComponent', `PNG gerado: ${(blob.size / 1024).toFixed(1)}KB`, { size: blob.size });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `furious-wc26-${this.name.toLowerCase().replace(/\s+/g, '-')}-fan-made.png`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('✅ Figurinha salva com sucesso!');
      const ms = this.debug.endTimer('downloadSticker');
      this.debug.logMethodExit('StickerCreatorComponent', 'downloadSticker', { success: true }, ms);
    } catch (err) {
      this.debug.error('ERROR', 'StickerCreatorComponent', 'Erro ao gerar PNG', err, 'downloadSticker');
      this.showToast('❌ Erro ao gerar o PNG. Tente novamente.');
      const ms = this.debug.endTimer('downloadSticker');
      this.debug.logMethodExit('StickerCreatorComponent', 'downloadSticker', { success: false }, ms);
    } finally {
      this.isDownloading.set(false);
    }
  }

  async shareSticker() {
    this.debug.logMethodEntry('StickerCreatorComponent', 'shareSticker');
    const timer = this.debug.startTimer('shareSticker');
    if (!isPlatformBrowser(this.platformId)) {
      this.debug.warn('WARN', 'StickerCreatorComponent', 'shareSticker não suportado em SSR');
      this.debug.logMethodExit('StickerCreatorComponent', 'shareSticker');
      return;
    }
    this.isSharing.set(true);
    try {
      const blob = await this.generatePng();
      const file = new File([blob], `furious-wc26-${this.name}-fan-made.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Minha Figurinha Lendária 🔥', text: `Crie a sua no FURIOUS WORLD CUP 26! #FuriousWC26` });
        this.showToast('✅ Compartilhado com sucesso!');
        this.debug.info('AUDIT', 'StickerCreatorComponent', 'Figurinha compartilhada via native share');
      } else {
        await navigator.clipboard.writeText('https://furious-wc26.app');
        this.showToast('🔗 Link copiado! Cole no WhatsApp ou Instagram.');
        this.debug.info('METHOD', 'StickerCreatorComponent', 'Native share não disponível, link copiado');
      }
      const ms = this.debug.endTimer('shareSticker');
      this.debug.logMethodExit('StickerCreatorComponent', 'shareSticker', { success: true }, ms);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        this.debug.error('ERROR', 'StickerCreatorComponent', 'Erro ao compartilhar', err, 'shareSticker');
        this.showToast('❌ Erro ao compartilhar. Tente baixar e compartilhar manualmente.');
      }
      const ms = this.debug.endTimer('shareSticker');
      this.debug.logMethodExit('StickerCreatorComponent', 'shareSticker', { success: false }, ms);
    } finally {
      this.isSharing.set(false);
    }
  }
}
