export type DebugLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type DebugCategory =
  | 'LIFECYCLE'
  | 'METHOD'
  | 'STATE'
  | 'ECONOMY'
  | 'AUDIT'
  | 'NAVIGATION'
  | 'AUDIO'
  | 'PUSH'
  | 'ERROR'
  | 'WARN';

export interface DebugEntry {
  id: string;
  timestamp: Date;
  level: DebugLevel;
  category: DebugCategory;
  service: string;
  method?: string;
  message: string;
  data?: unknown;
  durationMs?: number;
}

export interface DebugConfig {
  enabled: boolean;
  maxHistory: number;
  visibleByDefault: boolean;
  panel: {
    width: number;
    height: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
  services: Record<string, boolean>;
  categories: Record<DebugCategory, boolean>;
  levels: Record<DebugLevel, boolean>;
  defaultFilter: DebugLevel[];
}

export const DEBUG_CONFIG: DebugConfig = {
  enabled: true,
  maxHistory: 200,
  visibleByDefault: true,
  panel: {
    width: 440,
    height: 380,
    position: 'bottom-right',
  },
  services: {
    UserService: true,
    StickerService: true,
    TradeService: true,
    PackService: true,
    GamificationService: true,
    AudioService: true,
    NotificationService: true,
    AlbumProgressService: true,
    AppComponent: true,
    BottomNavComponent: true,
    CookieConsentComponent: true,
    PackOpeningComponent: true,
    PackListComponent: true,
    PackOpeningPageComponent: true,
    TeamViewComponent: true,
    EditionViewComponent: true,
    StickerDetailComponent: true,
    AlbumHomeComponent: true,
    MarketplaceComponent: true,
    TradeOfferComponent: true,
    TradeGroupsComponent: true,
    MyProfileComponent: true,
    SettingsComponent: true,
    StickerCreatorComponent: true,
    HallOfFameComponent: true,
    ChallengeListComponent: true,
    QuizFuriaComponent: true,
    LoginComponent: true,
    RegisterComponent: true,
    OnboardingComponent: true,
    StepWelcomeComponent: true,
    StepTeamComponent: true,
    StepFirstPackComponent: true,
    StepAlbumPreviewComponent: true,
    LandingComponent: true,
    Relics2022Component: true,
    Prediction2026Component: true,
    LegalPageComponent: true,
    Router: true,
  },
  categories: {
    LIFECYCLE: true,
    METHOD: true,
    STATE: true,
    ECONOMY: true,
    AUDIT: true,
    NAVIGATION: true,
    AUDIO: true,
    PUSH: true,
    ERROR: true,
    WARN: true,
  },
  levels: {
    DEBUG: true,
    INFO: true,
    WARN: true,
    ERROR: true,
  },
  defaultFilter: ['ERROR', 'WARN'],
};
