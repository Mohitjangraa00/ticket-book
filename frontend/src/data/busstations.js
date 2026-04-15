// ─────────────────────────────────────────────────────────────────────────────
// BusStations.js
// Complete Indian bus station / boarding-point database with helpers.
// Import wherever you need city lists, station lookups, or route validation.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Station Schema ───────────────────────────────────────────────────────────
// {
//   id:           string  — unique station identifier
//   name:         string  — official station name
//   city:         string  — city name (matches search value)
//   state:        string
//   type:         "isbt" | "central" | "private" | "railway_adj"
//   lat:          number
//   lng:          number
//   popular:      boolean — show in quick-select / popular cities
//   boardingPoints: string[]  — common boarding sub-points for this station
//   facilities:   string[]
// }

export const BUS_STATIONS = [
  // ── DELHI ──────────────────────────────────────────────────────────────────
  {
    id: "STN_DEL_ISBT_KASHMIRI",
    name: "Kashmiri Gate ISBT",
    city: "Delhi",
    state: "Delhi",
    type: "isbt",
    lat: 28.6672,
    lng: 77.2274,
    popular: true,
    boardingPoints: ["Kashmiri Gate ISBT Gate 1", "Kashmiri Gate ISBT Gate 2", "Kashmiri Gate Metro"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Court", "ATM", "Parking"],
  },
  {
    id: "STN_DEL_ISBT_ANAND",
    name: "Anand Vihar ISBT",
    city: "Delhi",
    state: "Delhi",
    type: "isbt",
    lat: 28.6462,
    lng: 77.3160,
    popular: false,
    boardingPoints: ["Anand Vihar ISBT Main Gate", "Anand Vihar Metro Gate 1"],
    facilities: ["Waiting Lounge", "Restrooms", "ATM"],
  },
  {
    id: "STN_DEL_SARAI",
    name: "Sarai Kale Khan ISBT",
    city: "Delhi",
    state: "Delhi",
    type: "isbt",
    lat: 28.5921,
    lng: 77.2575,
    popular: false,
    boardingPoints: ["Sarai Kale Khan Gate 1", "Hazrat Nizamuddin Station Side"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls"],
  },

  // ── MUMBAI ─────────────────────────────────────────────────────────────────
  {
    id: "STN_MUM_DADAR",
    name: "Dadar Bus Depot",
    city: "Mumbai",
    state: "Maharashtra",
    type: "central",
    lat: 19.0176,
    lng: 72.8562,
    popular: true,
    boardingPoints: ["Dadar TT", "Dadar West", "Dadar East"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls", "ATM"],
  },
  {
    id: "STN_MUM_BORIVALI",
    name: "Borivali Bus Depot",
    city: "Mumbai",
    state: "Maharashtra",
    type: "central",
    lat: 19.2307,
    lng: 72.8567,
    popular: false,
    boardingPoints: ["Borivali Station East", "Borivali Station West"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── BANGALORE ──────────────────────────────────────────────────────────────
  {
    id: "STN_BLR_MAJES",
    name: "Kempegowda Bus Station (Majestic)",
    city: "Bangalore",
    state: "Karnataka",
    type: "central",
    lat: 12.9775,
    lng: 77.5713,
    popular: true,
    boardingPoints: ["Majestic Platform 1-5", "Majestic Platform 6-10", "Gubbi Thotadappa Road"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Court", "ATM", "Cloak Room"],
  },
  {
    id: "STN_BLR_SHIVAJI",
    name: "Shivajinagar Bus Stand",
    city: "Bangalore",
    state: "Karnataka",
    type: "central",
    lat: 12.9850,
    lng: 77.5937,
    popular: false,
    boardingPoints: ["Shivajinagar Main", "Brigade Road Pick-up"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── HYDERABAD ──────────────────────────────────────────────────────────────
  {
    id: "STN_HYD_MGBS",
    name: "Mahatma Gandhi Bus Station (MGBS)",
    city: "Hyderabad",
    state: "Telangana",
    type: "central",
    lat: 17.3727,
    lng: 78.4810,
    popular: true,
    boardingPoints: ["MGBS Platform 1", "MGBS Platform 2", "Imlibun"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Court", "ATM", "Pharmacy"],
  },
  {
    id: "STN_HYD_JBS",
    name: "Jubilee Bus Station",
    city: "Hyderabad",
    state: "Telangana",
    type: "central",
    lat: 17.4447,
    lng: 78.4998,
    popular: false,
    boardingPoints: ["JBS Main Gate", "Secunderabad Station"],
    facilities: ["Waiting Lounge", "Restrooms", "ATM"],
  },

  // ── CHENNAI ────────────────────────────────────────────────────────────────
  {
    id: "STN_CHN_CMBT",
    name: "Chennai CMBT (Koyambedu)",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "isbt",
    lat: 13.0694,
    lng: 80.1948,
    popular: true,
    boardingPoints: ["CMBT Bay 1-10", "CMBT Bay 11-20", "Koyambedu Market Side"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Court", "ATM", "Cloak Room", "Pharmacy"],
  },
  {
    id: "STN_CHN_BROADWAY",
    name: "Broadway Bus Terminus",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "central",
    lat: 13.0878,
    lng: 80.2785,
    popular: false,
    boardingPoints: ["Broadway Main", "Rajaji Salai"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── KOLKATA ────────────────────────────────────────────────────────────────
  {
    id: "STN_KOL_ESPLANADE",
    name: "Esplanade Bus Stand",
    city: "Kolkata",
    state: "West Bengal",
    type: "central",
    lat: 22.5647,
    lng: 88.3509,
    popular: true,
    boardingPoints: ["Esplanade East Gate", "Esplanade West Gate"],
    facilities: ["Waiting Area", "Restrooms", "Food Stalls"],
  },
  {
    id: "STN_KOL_BABUGHAT",
    name: "Babughat Bus Stand",
    city: "Kolkata",
    state: "West Bengal",
    type: "central",
    lat: 22.5583,
    lng: 88.3358,
    popular: false,
    boardingPoints: ["Babughat Main", "Strand Road"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── PUNE ───────────────────────────────────────────────────────────────────
  {
    id: "STN_PUN_SWARGATE",
    name: "Swargate Bus Stand",
    city: "Pune",
    state: "Maharashtra",
    type: "central",
    lat: 18.5018,
    lng: 73.8636,
    popular: true,
    boardingPoints: ["Swargate Main Gate", "Swargate Platform 1-5"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls", "ATM"],
  },
  {
    id: "STN_PUN_SHIVAJI",
    name: "Shivajinagar Bus Stand",
    city: "Pune",
    state: "Maharashtra",
    type: "central",
    lat: 18.5308,
    lng: 73.8475,
    popular: false,
    boardingPoints: ["Shivajinagar Stand", "FC Road Side"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── JAIPUR ─────────────────────────────────────────────────────────────────
  {
    id: "STN_JAI_SINDHI",
    name: "Sindhi Camp Bus Stand",
    city: "Jaipur",
    state: "Rajasthan",
    type: "central",
    lat: 26.9124,
    lng: 75.7873,
    popular: true,
    boardingPoints: ["Sindhi Camp Main", "Naraina Singh Circle"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls", "ATM"],
  },

  // ── AHMEDABAD ──────────────────────────────────────────────────────────────
  {
    id: "STN_AMD_GEETA",
    name: "Geeta Mandir Bus Stand",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "central",
    lat: 23.0225,
    lng: 72.5714,
    popular: true,
    boardingPoints: ["Geeta Mandir Main", "Geeta Mandir Annex"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls", "ATM"],
  },
  {
    id: "STN_AMD_PALDI",
    name: "Paldi Bus Stand",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "central",
    lat: 23.0048,
    lng: 72.5646,
    popular: false,
    boardingPoints: ["Paldi Main"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── CHANDIGARH ─────────────────────────────────────────────────────────────
  {
    id: "STN_CHD_ISBT43",
    name: "ISBT Sector 43",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "isbt",
    lat: 30.7046,
    lng: 76.7179,
    popular: true,
    boardingPoints: ["ISBT 43 Platform 1-8", "ISBT 43 Pvt. Operators Wing"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Court", "ATM", "Wi-Fi"],
  },
  {
    id: "STN_CHD_ISBT17",
    name: "ISBT Sector 17",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "isbt",
    lat: 30.7413,
    lng: 76.7784,
    popular: false,
    boardingPoints: ["ISBT 17 Main"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── LUCKNOW ────────────────────────────────────────────────────────────────
  {
    id: "STN_LKO_ALAMBAGH",
    name: "Alambagh Bus Station",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "central",
    lat: 26.8293,
    lng: 80.9058,
    popular: true,
    boardingPoints: ["Alambagh Main", "Alambagh Railway Side"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls", "ATM"],
  },
  {
    id: "STN_LKO_KAISERBAGH",
    name: "Kaiserbagh Bus Stand",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "central",
    lat: 26.8615,
    lng: 80.9317,
    popular: false,
    boardingPoints: ["Kaiserbagh Main"],
    facilities: ["Waiting Area", "Restrooms"],
  },

  // ── NAGPUR ─────────────────────────────────────────────────────────────────
  {
    id: "STN_NAG_CENTRAL",
    name: "Nagpur Central Bus Stand",
    city: "Nagpur",
    state: "Maharashtra",
    type: "central",
    lat: 21.1458,
    lng: 79.0882,
    popular: false,
    boardingPoints: ["Central Bus Stand Main"],
    facilities: ["Waiting Lounge", "Restrooms", "Food Stalls"],
  },

  // ── BHUBANESWAR ────────────────────────────────────────────────────────────
  {
    id: "STN_BHU_BARAMUNDA",
    name: "Baramunda Bus Terminal",
    city: "Bhubaneswar",
    state: "Odisha",
    type: "central",
    lat: 20.2691,
    lng: 85.7890,
    popular: false,
    boardingPoints: ["Baramunda Main", "Baramunda NH Side"],
    facilities: ["Waiting Lounge", "Restrooms", "ATM"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// POPULAR CITIES  (for search dropdowns / quick-select UI)
// ─────────────────────────────────────────────────────────────────────────────

export const POPULAR_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Chandigarh",
  "Lucknow",
  "Nagpur",
  "Bhubaneswar",
];

// All unique cities from station list (for autocomplete)
export const ALL_CITIES = [...new Set(BUS_STATIONS.map((s) => s.city))].sort();

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all stations in a city.
 * @param {string} city
 * @returns {Array}
 */
export const getStationsByCity = (city) =>
  BUS_STATIONS.filter((s) => s.city.toLowerCase() === city.toLowerCase());

/**
 * Get a single station by ID.
 * @param {string} id
 * @returns {Object|undefined}
 */
export const getStationById = (id) =>
  BUS_STATIONS.find((s) => s.id === id);

/**
 * Get the primary (first) station for a city.
 * @param {string} city
 * @returns {Object|undefined}
 */
export const getPrimaryStation = (city) =>
  BUS_STATIONS.find((s) => s.city.toLowerCase() === city.toLowerCase() && s.popular);

/**
 * Get all boarding points for a city (flattened from all its stations).
 * @param {string} city
 * @returns {string[]}
 */
export const getBoardingPoints = (city) =>
  getStationsByCity(city).flatMap((s) => s.boardingPoints);

/**
 * Search cities by partial name (for autocomplete input).
 * @param {string} query
 * @param {number} limit
 * @returns {string[]}
 */
export const searchCities = (query, limit = 8) => {
  if (!query) return POPULAR_CITIES.slice(0, limit);
  const q = query.toLowerCase();
  return ALL_CITIES.filter((c) => c.toLowerCase().startsWith(q)).slice(0, limit);
};

/**
 * Calculate straight-line distance between two cities (km).
 * Uses Haversine formula.
 * @param {string} fromCity
 * @param {string} toCity
 * @returns {number} distance in km, or -1 if either city not found
 */
export const getCityDistance = (fromCity, toCity) => {
  const from = getPrimaryStation(fromCity);
  const to   = getPrimaryStation(toCity);
  if (!from || !to) return -1;

  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/**
 * Estimate travel duration based on distance (rough: 60 km/h avg).
 * @param {string} fromCity
 * @param {string} toCity
 * @returns {string} e.g. "5h 30m"
 */
export const estimateDuration = (fromCity, toCity) => {
  const dist = getCityDistance(fromCity, toCity);
  if (dist < 0) return "N/A";
  const totalMinutes = Math.round((dist / 60) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
};

/**
 * Get nearby cities within a radius (km) of a given city.
 * @param {string} city
 * @param {number} radiusKm
 * @returns {string[]}
 */
export const getNearbyCities = (city, radiusKm = 300) => {
  return ALL_CITIES.filter(
    (c) => c !== city && getCityDistance(city, c) <= radiusKm && getCityDistance(city, c) > 0
  );
};

/**
 * Group all stations by state.
 * @returns {Object} { [stateName]: Station[] }
 */
export const getStationsByState = () =>
  BUS_STATIONS.reduce((acc, station) => {
    if (!acc[station.state]) acc[station.state] = [];
    acc[station.state].push(station);
    return acc;
  }, {});

/**
 * Check if a direct route exists between two cities (has at least one station each).
 * @param {string} fromCity
 * @param {string} toCity
 * @returns {boolean}
 */
export const routeExists = (fromCity, toCity) =>
  getStationsByCity(fromCity).length > 0 && getStationsByCity(toCity).length > 0;

// ─────────────────────────────────────────────────────────────────────────────
// STATIC ROUTE MAP  (popular operator routes — used for seeding/suggestions)
// ─────────────────────────────────────────────────────────────────────────────

export const POPULAR_ROUTES = [
  { from: "Delhi",     to: "Jaipur",       distanceKm: 282,  operators: 42, minPrice: 350,  maxPrice: 950  },
  { from: "Mumbai",    to: "Pune",         distanceKm: 149,  operators: 80, minPrice: 200,  maxPrice: 600  },
  { from: "Bangalore", to: "Hyderabad",    distanceKm: 570,  operators: 35, minPrice: 650,  maxPrice: 1400 },
  { from: "Delhi",     to: "Chandigarh",   distanceKm: 248,  operators: 55, minPrice: 300,  maxPrice: 800  },
  { from: "Chennai",   to: "Bangalore",    distanceKm: 346,  operators: 28, minPrice: 500,  maxPrice: 1100 },
  { from: "Kolkata",   to: "Bhubaneswar",  distanceKm: 440,  operators: 22, minPrice: 400,  maxPrice: 900  },
  { from: "Mumbai",    to: "Goa",          distanceKm: 597,  operators: 30, minPrice: 600,  maxPrice: 1500 },
  { from: "Delhi",     to: "Agra",         distanceKm: 204,  operators: 38, minPrice: 250,  maxPrice: 700  },
  { from: "Hyderabad", to: "Bangalore",    distanceKm: 570,  operators: 32, minPrice: 650,  maxPrice: 1300 },
  { from: "Ahmedabad", to: "Mumbai",       distanceKm: 526,  operators: 25, minPrice: 500,  maxPrice: 1200 },
  { from: "Lucknow",   to: "Delhi",        distanceKm: 550,  operators: 45, minPrice: 400,  maxPrice: 1000 },
  { from: "Jaipur",    to: "Ahmedabad",    distanceKm: 660,  operators: 18, minPrice: 550,  maxPrice: 1200 },
];

/**
 * Find a popular route object by city pair.
 * @param {string} from
 * @param {string} to
 * @returns {Object|undefined}
 */
export const getPopularRoute = (from, to) =>
  POPULAR_ROUTES.find(
    (r) =>
      (r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()) ||
      (r.from.toLowerCase() === to.toLowerCase()   && r.to.toLowerCase() === from.toLowerCase())
  );

// ─────────────────────────────────────────────────────────────────────────────
// BUS TYPE CONSTANTS  (shared across all components)
// ─────────────────────────────────────────────────────────────────────────────

export const BUS_TYPES = [
  { value: "all",           label: "All Buses" },
  { value: "ac_sleeper",    label: "AC Sleeper" },
  { value: "non_ac_sleeper",label: "Non-AC Sleeper" },
  { value: "ac_seater",     label: "AC Seater" },
  { value: "non_ac_seater", label: "Non-AC Seater" },
  { value: "volvo",         label: "Volvo / Multi-Axle" },
];

export const BUS_TYPE_LABEL = Object.fromEntries(
  BUS_TYPES.filter((t) => t.value !== "all").map((t) => [t.value, t.label])
);

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

const BusStations = {
  BUS_STATIONS,
  POPULAR_CITIES,
  ALL_CITIES,
  POPULAR_ROUTES,
  BUS_TYPES,
  BUS_TYPE_LABEL,
  getStationsByCity,
  getStationById,
  getPrimaryStation,
  getBoardingPoints,
  searchCities,
  getCityDistance,
  estimateDuration,
  getNearbyCities,
  getStationsByState,
  routeExists,
  getPopularRoute,
};

export default BusStations;