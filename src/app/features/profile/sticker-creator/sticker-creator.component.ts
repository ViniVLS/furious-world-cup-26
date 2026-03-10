import { Component, ElementRef, ViewChild, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { toPng } from 'html-to-image';

@Component({
  selector: 'app-sticker-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './sticker-creator.component.html',
  styleUrl: './sticker-creator.component.css'
})
export class StickerCreatorComponent {
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
    // CONMEBOL
    { code: 'BRA', name: 'Brasil 🇧🇷' },
    { code: 'ARG', name: 'Argentina 🇦🇷' },
    { code: 'URU', name: 'Uruguai 🇺🇾' },
    { code: 'COL', name: 'Colômbia 🇨🇴' },
    { code: 'CHI', name: 'Chile 🇨🇱' },
    { code: 'ECU', name: 'Equador 🇪🇨' },
    { code: 'PER', name: 'Peru 🇵🇪' },
    { code: 'PAR', name: 'Paraguai 🇵🇾' },
    { code: 'BOL', name: 'Bolívia 🇧🇴' },
    { code: 'VEN', name: 'Venezuela 🇻🇪' },
    // UEFA
    { code: 'FRA', name: 'França 🇫🇷' },
    { code: 'ENG', name: 'Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { code: 'ESP', name: 'Espanha 🇪🇸' },
    { code: 'GER', name: 'Alemanha 🇩🇪' },
    { code: 'POR', name: 'Portugal 🇵🇹' },
    { code: 'ITA', name: 'Itália 🇮🇹' },
    { code: 'NED', name: 'Holanda 🇳🇱' },
    { code: 'BEL', name: 'Bélgica 🇧🇪' },
    { code: 'CRO', name: 'Croácia 🇭🇷' },
    { code: 'SUI', name: 'Suíça 🇨🇭' },
    { code: 'DEN', name: 'Dinamarca 🇩🇰' },
    { code: 'SEN', name: 'Senegal 🇸🇳' },
    { code: 'POL', name: 'Polônia 🇵🇱' },
    { code: 'SRB', name: 'Sérvia 🇷🇸' },
    { code: 'WAL', name: 'País de Gales 🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'ECW', name: 'Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { code: 'AUT', name: 'Áustria 🇦🇹' },
    { code: 'SVK', name: 'Eslováquia 🇸🇰' },
    { code: 'SVN', name: 'Eslovênia 🇸🇮' },
    { code: 'HUN', name: 'Hungria 🇭🇺' },
    { code: 'TUR', name: 'Turquia 🇹🇷' },
    { code: 'UKR', name: 'Ucrânia 🇺🇦' },
    { code: 'ROU', name: 'Romênia 🇷🇴' },
    { code: 'GRE', name: 'Grécia 🇬🇷' },
    { code: 'NOR', name: 'Noruega 🇳🇴' },
    { code: 'SWE', name: 'Suécia 🇸🇪' },
    { code: 'FIN', name: 'Finlândia 🇫🇮' },
    { code: 'IRL', name: 'Irlanda 🇮🇪' },
    // AFC
    { code: 'JPN', name: 'Japão 🇯🇵' },
    { code: 'KOR', name: 'Coreia do Sul 🇰🇷' },
    { code: 'AUS', name: 'Austrália 🇦🇺' },
    { code: 'IRN', name: 'Irã 🇮🇷' },
    { code: 'SAU', name: 'Arábia Saudita 🇸🇦' },
    { code: 'QAT', name: 'Qatar 🇶🇦' },
    { code: 'UAE', name: 'Emirados Árabes 🇦🇪' },
    { code: 'CHN', name: 'China 🇨🇳' },
    { code: 'IND', name: 'Índia 🇮🇳' },
    { code: 'UZB', name: 'Uzbequistão 🇺🇿' },
    // CAF
    { code: 'MAR', name: 'Marrocos 🇲🇦' },
    { code: 'SEN', name: 'Senegal 🇸🇳' },
    { code: 'GHA', name: 'Gana 🇬🇭' },
    { code: 'CMR', name: 'Camarões 🇨🇲' },
    { code: 'TUN', name: 'Tunísia 🇹🇳' },
    { code: 'NGA', name: 'Nigéria 🇳🇬' },
    { code: 'CIV', name: 'Costa do Marfim 🇨🇮' },
    { code: 'ALG', name: 'Argélia 🇩🇿' },
    { code: 'EGY', name: 'Egito 🇪🇬' },
    { code: 'ZAF', name: 'África do Sul 🇿🇦' },
    // CONCACAF
    { code: 'USA', name: 'Estados Unidos 🇺🇸' },
    { code: 'MEX', name: 'México 🇲🇽' },
    { code: 'CAN', name: 'Canadá 🇨🇦' },
    { code: 'CRC', name: 'Costa Rica 🇨🇷' },
    { code: 'PAN', name: 'Panamá 🇵🇦' },
    { code: 'HON', name: 'Honduras 🇭🇳' },
    { code: 'JAM', name: 'Jamaica 🇯🇲' },
    { code: 'CUB', name: 'Cuba 🇨🇺' },
    // OFC
    { code: 'NZL', name: 'Nova Zelândia 🇳🇿' },
  ];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImage = e.target?.result as string;
        this.bgRemoved = false;
      };
      reader.readAsDataURL(file);
    }
  }

  removeBackground() {
    if (!this.uploadedImage) return;
    this.isRemovingBg = true;
    // Simulação: em produção integrar com Remove.bg API ou similar
    setTimeout(() => {
      this.isRemovingBg = false;
      this.bgRemoved = true;
    }, 2000);
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  private async generatePng(): Promise<Blob> {
    const el = this.stickerPreviewRef.nativeElement;
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async downloadSticker() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isDownloading.set(true);
    try {
      const blob = await this.generatePng();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `furious-wc26-${this.name.toLowerCase().replace(/\s+/g, '-')}-fan-made.png`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('✅ Figurinha salva com sucesso!');
    } catch {
      this.showToast('❌ Erro ao gerar o PNG. Tente novamente.');
    } finally {
      this.isDownloading.set(false);
    }
  }

  async shareSticker() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isSharing.set(true);
    try {
      const blob = await this.generatePng();
      const file = new File([blob], `furious-wc26-${this.name}-fan-made.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Minha Figurinha Lendária 🔥',
          text: `Crie a sua no FURIOUS WORLD CUP 26! #FuriousWC26`,
        });
        this.showToast('✅ Compartilhado com sucesso!');
      } else {
        // Fallback: copiar URL para clipboard
        await navigator.clipboard.writeText('https://furious-wc26.app');
        this.showToast('🔗 Link copiado! Cole no WhatsApp ou Instagram.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        this.showToast('❌ Erro ao compartilhar. Tente baixar e compartilhar manualmente.');
      }
    } finally {
      this.isSharing.set(false);
    }
  }
}
