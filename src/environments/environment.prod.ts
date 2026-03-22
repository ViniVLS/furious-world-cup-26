export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
  useMockData: false,
  debugConfig: { enabled: false, maxHistory: 0, visibleByDefault: false, panel: { width: 0, height: 0, position: 'bottom-right' as const }, services: {}, categories: {} as any, levels: {} as any, defaultFilter: [] },
};
