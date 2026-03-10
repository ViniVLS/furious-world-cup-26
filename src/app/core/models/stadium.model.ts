import { WorldCupEdition } from './player.model';

export interface Stadium {
    id: string;
    name: string;
    city: string;
    country: string;
    countryCode: string;          // ISO 3166-1 alpha-3
    capacity: number;
    worldCupEdition: WorldCupEdition;
    imageUrl: string;
    latitude?: number;
    longitude?: number;
    gamesHosted?: number;         // Número de jogos sediados nessa Copa
    inaugurated?: number;         // Ano de inauguração
}

/** Lista de estádios da Copa 2022 (Qatar) */
export const STADIUMS_2022: Stadium[] = [
    { id: 'lusail', name: 'Lusail Stadium', city: 'Lusail', country: 'Qatar', countryCode: 'QAT', capacity: 88966, worldCupEdition: '2022', imageUrl: '/assets/stadiums/lusail.jpg', gamesHosted: 10, inaugurated: 2021 },
    { id: 'al-bayt', name: 'Al Bayt Stadium', city: 'Al Khor', country: 'Qatar', countryCode: 'QAT', capacity: 60000, worldCupEdition: '2022', imageUrl: '/assets/stadiums/al-bayt.jpg', gamesHosted: 7, inaugurated: 2021 },
    { id: 'khalifa', name: 'Khalifa International Stadium', city: 'Doha', country: 'Qatar', countryCode: 'QAT', capacity: 45857, worldCupEdition: '2022', imageUrl: '/assets/stadiums/khalifa.jpg', gamesHosted: 6, inaugurated: 1976 },
    { id: 'education-city', name: 'Education City Stadium', city: 'Al Rayyan', country: 'Qatar', countryCode: 'QAT', capacity: 45350, worldCupEdition: '2022', imageUrl: '/assets/stadiums/education-city.jpg', gamesHosted: 6, inaugurated: 2020 },
    { id: 'al-thumama', name: 'Al Thumama Stadium', city: 'Doha', country: 'Qatar', countryCode: 'QAT', capacity: 44400, worldCupEdition: '2022', imageUrl: '/assets/stadiums/al-thumama.jpg', gamesHosted: 6, inaugurated: 2021 },
    { id: 'ahmed-bin-ali', name: 'Ahmed bin Ali Stadium', city: 'Al Rayyan', country: 'Qatar', countryCode: 'QAT', capacity: 44740, worldCupEdition: '2022', imageUrl: '/assets/stadiums/ahmed-bin-ali.jpg', gamesHosted: 6, inaugurated: 2020 },
    { id: '974', name: 'Stadium 974', city: 'Doha', country: 'Qatar', countryCode: 'QAT', capacity: 44089, worldCupEdition: '2022', imageUrl: '/assets/stadiums/974.jpg', gamesHosted: 6, inaugurated: 2021 },
    { id: 'al-janoub', name: 'Al Janoub Stadium', city: 'Al Wakrah', country: 'Qatar', countryCode: 'QAT', capacity: 44325, worldCupEdition: '2022', imageUrl: '/assets/stadiums/al-janoub.jpg', gamesHosted: 6, inaugurated: 2019 },
];

/** Lista de estádios confirmados da Copa 2026 (USA/CAN/MEX) */
export const STADIUMS_2026: Stadium[] = [
    { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', country: 'Estados Unidos', countryCode: 'USA', capacity: 82500, worldCupEdition: '2026', imageUrl: '/assets/stadiums/metlife.jpg', inaugurated: 2010 },
    { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', country: 'Estados Unidos', countryCode: 'USA', capacity: 70240, worldCupEdition: '2026', imageUrl: '/assets/stadiums/sofi.jpg', inaugurated: 2020 },
    { id: 'att', name: 'AT&T Stadium', city: 'Arlington, TX', country: 'Estados Unidos', countryCode: 'USA', capacity: 80000, worldCupEdition: '2026', imageUrl: '/assets/stadiums/att.jpg', inaugurated: 2009 },
    { id: 'levi', name: "Levi's Stadium", city: 'Santa Clara, CA', country: 'Estados Unidos', countryCode: 'USA', capacity: 68500, worldCupEdition: '2026', imageUrl: '/assets/stadiums/levis.jpg', inaugurated: 2014 },
    { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City, MO', country: 'Estados Unidos', countryCode: 'USA', capacity: 76416, worldCupEdition: '2026', imageUrl: '/assets/stadiums/arrowhead.jpg', inaugurated: 1972 },
    { id: 'lincoln-financial', name: 'Lincoln Financial Field', city: 'Philadelphia, PA', country: 'Estados Unidos', countryCode: 'USA', capacity: 69796, worldCupEdition: '2026', imageUrl: '/assets/stadiums/lincoln-financial.jpg', inaugurated: 2003 },
    { id: 'seattle', name: 'Lumen Field', city: 'Seattle, WA', country: 'Estados Unidos', countryCode: 'USA', capacity: 68740, worldCupEdition: '2026', imageUrl: '/assets/stadiums/lumen.jpg', inaugurated: 2002 },
    { id: 'boston', name: 'Gillette Stadium', city: 'Foxborough, MA', country: 'Estados Unidos', countryCode: 'USA', capacity: 65878, worldCupEdition: '2026', imageUrl: '/assets/stadiums/gillette.jpg', inaugurated: 2002 },
    { id: 'vancouver', name: 'BC Place', city: 'Vancouver', country: 'Canadá', countryCode: 'CAN', capacity: 54500, worldCupEdition: '2026', imageUrl: '/assets/stadiums/bc-place.jpg', inaugurated: 1983 },
    { id: 'toronto', name: 'BMO Field', city: 'Toronto', country: 'Canadá', countryCode: 'CAN', capacity: 45000, worldCupEdition: '2026', imageUrl: '/assets/stadiums/bmo-field.jpg', inaugurated: 2007 },
    { id: 'azteca', name: 'Estadio Azteca', city: 'Cidade do México', country: 'México', countryCode: 'MEX', capacity: 87523, worldCupEdition: '2026', imageUrl: '/assets/stadiums/azteca.jpg', inaugurated: 1966 },
    { id: 'guadalajara', name: 'Estadio Akron', city: 'Guadalajara', country: 'México', countryCode: 'MEX', capacity: 49850, worldCupEdition: '2026', imageUrl: '/assets/stadiums/akron.jpg', inaugurated: 2010 },
];
