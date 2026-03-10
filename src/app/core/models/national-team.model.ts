import { WorldCupEdition } from './player.model';

export type CountryCode = string; // ISO 3166-1 alpha-3
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC';

export interface NationalTeam {
    id: string;
    countryCode: CountryCode;
    countryName: string;
    countryNamePT: string;         // Nome em português
    confederation: Confederation;
    worldCups: WorldCupEdition[];
    shieldImageUrl: string;
    teamPhotoUrl2022?: string;
    teamPhotoUrl2026?: string;
    groupCode2022?: string;        // Ex: "A", "B", "C"...
    groupCode2026?: string;
    bestResult2022?: CupResult;
    bestResult2026?: CupResult;
    flagEmoji: string;             // Ex: "🇧🇷"
}

export type CupResult =
    | 'GROUP_STAGE'
    | 'ROUND_OF_16'
    | 'QUARTER_FINAL'
    | 'SEMI_FINAL'
    | 'THIRD_PLACE'
    | 'RUNNER_UP'
    | 'CHAMPION';

/** Mapeia o resultado para label em português */
export const CUP_RESULT_LABEL: Record<CupResult, string> = {
    GROUP_STAGE: 'Fase de Grupos',
    ROUND_OF_16: 'Oitavas de Final',
    QUARTER_FINAL: 'Quartas de Final',
    SEMI_FINAL: 'Semifinal',
    THIRD_PLACE: '3º Lugar',
    RUNNER_UP: 'Vice-campeão',
    CHAMPION: 'Campeão 🏆',
};
