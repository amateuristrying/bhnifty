/*
 * The instrument universe.
 *
 * `weight` is the index weight (%), `base` a resting last-traded price the mock
 * feed walks away from, and `token` the Angel One SmartAPI instrument token.
 * Tokens are null until the live feed is wired — filling them in (and pointing
 * `provider.jsx` at an Angel adapter) is the whole migration. Nothing in the UI
 * reads anything but the quote shape produced by the store.
 */

/* NIFTY BANK constituents — the "Top Banks" list and the bank weight map */
export const BANKS = [
  { sym: 'HDFCBANK',   short: 'HDFC',       name: 'HDFC Bank',            weight: 29.1, base: 1684.30, token: null },
  { sym: 'ICICIBANK',  short: 'ICICI',      name: 'ICICI Bank',           weight: 22.8, base: 1312.55, token: null },
  { sym: 'SBIN',       short: 'SBIN',       name: 'State Bank of India',  weight: 11.2, base: 842.15,  token: null },
  { sym: 'AXISBANK',   short: 'AXIS',       name: 'Axis Bank',            weight: 9.8,  base: 1128.40, token: null },
  { sym: 'KOTAKBANK',  short: 'KOTAK',      name: 'Kotak Mahindra Bank',  weight: 9.4,  base: 1795.20, token: null },
  { sym: 'INDUSINDBK', short: 'INDUSINDBK', name: 'IndusInd Bank',        weight: 5.7,  base: 1063.45, token: null },
  { sym: 'BANKBARODA', short: 'BARODA',     name: 'Bank of Baroda',       weight: 2.9,  base: 248.70,  token: null },
  { sym: 'PNB',        short: 'PNB',        name: 'Punjab National Bank', weight: 2.1,  base: 112.75,  token: null },
  { sym: 'FEDERALBNK', short: 'FEDERALBNK', name: 'Federal Bank',         weight: 2.0,  base: 204.35,  token: null },
  { sym: 'IDFCFIRSTB', short: 'IDFCFIRSTB', name: 'IDFC First Bank',      weight: 1.5,  base: 68.90,   token: null },
  { sym: 'AUBANK',     short: 'AU',         name: 'AU Small Finance Bank',weight: 1.2,  base: 612.05,  token: null },
  { sym: 'BANDHANBNK', short: 'BANDHANBNK', name: 'Bandhan Bank',         weight: 1.0,  base: 178.60,  token: null },
  { sym: 'CANBK',      short: 'CANBK',      name: 'Canara Bank',          weight: 0.9,  base: 108.25,  token: null },
  { sym: 'YESBANK',    short: 'YES',        name: 'Yes Bank',             weight: 0.8,  base: 21.40,   token: null },
]

/* NIFTY 50 non-bank constituents — the company weight map and "Top Movers" */
export const COMPANIES = [
  { sym: 'RELIANCE',   short: 'RELIANCE',   name: 'Reliance Industries',  weight: 9.6, base: 2914.60, token: null },
  { sym: 'TCS',        short: 'TCS',        name: 'Tata Consultancy Svc', weight: 7.5, base: 3872.10, token: null },
  { sym: 'INFY',       short: 'INFY',       name: 'Infosys',              weight: 5.2, base: 1841.75, token: null },
  { sym: 'ITC',        short: 'ITC',        name: 'ITC',                  weight: 3.8, base: 442.90,  token: null },
  { sym: 'BHARTIARTL', short: 'BHARTIARTL', name: 'Bharti Airtel',        weight: 3.5, base: 1940.10, token: null },
  { sym: 'LT',         short: 'LT',         name: 'Larsen & Toubro',      weight: 3.4, base: 3612.45, token: null },
  { sym: 'HINDUNILVR', short: 'HINDUNILVR', name: 'Hindustan Unilever',   weight: 2.4, base: 2408.30, token: null },
  { sym: 'M&M',        short: 'M&M',        name: 'Mahindra & Mahindra',  weight: 2.2, base: 2986.55, token: null },
  { sym: 'BAJFINANCE', short: 'BAJFINANCE', name: 'Bajaj Finance',        weight: 2.1, base: 7104.80, token: null },
  { sym: 'HCLTECH',    short: 'HCLTECH',    name: 'HCL Technologies',     weight: 1.8, base: 1616.20, token: null },
  { sym: 'ASIANPAINT', short: 'ASIANPAINT', name: 'Asian Paints',         weight: 1.6, base: 2412.35, token: null },
  { sym: 'MARUTI',     short: 'MARUTI',     name: 'Maruti Suzuki',        weight: 1.5, base: 12864.00,token: null },
  { sym: 'SUNPHARMA',  short: 'SUNPHARMA',  name: 'Sun Pharmaceutical',   weight: 1.4, base: 1956.40, token: null },
  { sym: 'TITAN',      short: 'TITAN',      name: 'Titan Company',        weight: 1.3, base: 3428.90, token: null },
  { sym: 'TATASTEEL',  short: 'TATASTEEL',  name: 'Tata Steel',           weight: 1.2, base: 158.75,  token: null },
  { sym: 'NESTLEIND',  short: 'NESTLEIND',  name: 'Nestlé India',         weight: 1.1, base: 2278.15, token: null },
  { sym: 'NTPC',       short: 'NTPC',       name: 'NTPC',                 weight: 1.0, base: 364.20,  token: null },
  { sym: 'POWERGRID',  short: 'POWERGRID',  name: 'Power Grid Corp',      weight: 0.9, base: 296.85,  token: null },
  { sym: 'COALINDIA',  short: 'COALINDIA',  name: 'Coal India',           weight: 0.9, base: 412.50,  token: null },
  { sym: 'ADANIENT',   short: 'ADANIENT',   name: 'Adani Enterprises',    weight: 0.8, base: 2418.70, token: null },
  { sym: 'ADANIPORTS', short: 'ADANIPORTS', name: 'Adani Ports & SEZ',    weight: 0.8, base: 1382.25, token: null },
  { sym: 'BAJAJHLDNG', short: 'BAJAJHLDNG', name: 'Bajaj Holdings',       weight: 0.8, base: 11240.00,token: null },
  { sym: 'JSWSTEEL',   short: 'JSWSTEEL',   name: 'JSW Steel',            weight: 0.7, base: 1024.60, token: null },
  { sym: 'GRASIM',     short: 'GRASIM',     name: 'Grasim Industries',    weight: 0.7, base: 2684.90, token: null },
  { sym: 'TATAMOTORS', short: 'TATAMOTORS', name: 'Tata Motors',          weight: 0.7, base: 728.40,  token: null },
  { sym: 'HINDALCO',   short: 'HINDALCO',   name: 'Hindalco Industries',  weight: 0.6, base: 682.15,  token: null },
  { sym: 'ONGC',       short: 'ONGC',       name: 'Oil & Natural Gas',    weight: 0.6, base: 258.30,  token: null },
  { sym: 'SBILIFE',    short: 'SBILIFE',    name: 'SBI Life Insurance',   weight: 0.6, base: 1786.55, token: null },
  { sym: 'WIPRO',      short: 'WIPRO',      name: 'Wipro',                weight: 0.5, base: 268.95,  token: null },
  { sym: 'TATACONSUM', short: 'TATACONSUM', name: 'Tata Consumer Prods',  weight: 0.5, base: 1094.70, token: null },
  { sym: 'BPCL',       short: 'BPCL',       name: 'Bharat Petroleum',     weight: 0.5, base: 342.80,  token: null },
  { sym: 'LTIM',       short: 'LTIM',       name: 'LTIMindtree',          weight: 0.4, base: 5628.40, token: null },
  { sym: 'DRREDDY',    short: 'DRREDDY',    name: "Dr. Reddy's Labs",     weight: 0.4, base: 1284.15, token: null },
  { sym: 'CIPLA',      short: 'CIPLA',      name: 'Cipla',                weight: 0.4, base: 1542.30, token: null },
  { sym: 'BAJAJ-AUTO', short: 'BAJAJ-AUTO', name: 'Bajaj Auto',           weight: 0.4, base: 9128.75, token: null },
  { sym: 'APOLLOHOSP', short: 'APOLLOHOSP', name: 'Apollo Hospitals',     weight: 0.3, base: 7042.60, token: null },
  { sym: 'DIVISLAB',   short: 'DIVISLAB',   name: "Divi's Laboratories",  weight: 0.3, base: 6184.20, token: null },
  { sym: 'BRITANNIA',  short: 'BRITANNIA',  name: 'Britannia Industries', weight: 0.3, base: 5486.90, token: null },
  { sym: 'TECHM',      short: 'TECHM',      name: 'Tech Mahindra',        weight: 0.3, base: 1648.35, token: null },
  { sym: 'ADANIPOWER', short: 'ADANIPOWER', name: 'Adani Power',          weight: 0.3, base: 586.40,  token: null },
  { sym: 'HDFCLIFE',   short: 'HDFCLIFE',   name: 'HDFC Life Insurance',  weight: 0.3, base: 742.85,  token: null },
  { sym: 'SHRIRAMFIN', short: 'SHRIRAMFIN', name: 'Shriram Finance',      weight: 0.3, base: 3168.20, token: null },
  { sym: 'HEROMOTOCO', short: 'HEROMOTOCO', name: 'Hero MotoCorp',        weight: 0.3, base: 4826.10, token: null },
  { sym: 'EICHERMOT',  short: 'EICHERMOT',  name: 'Eicher Motors',        weight: 0.3, base: 7689.50, token: null },
]

/* The six banks that also sit inside the NIFTY 50 */
const NIFTY_BANK_MEMBERS = ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK']

export const NIFTY50 = [
  ...COMPANIES,
  ...BANKS.filter((b) => NIFTY_BANK_MEMBERS.includes(b.sym)),
]

/* Every instrument the store keeps a quote for, de-duplicated */
export const INSTRUMENTS = [...BANKS, ...COMPANIES]

export const BY_SYMBOL = Object.fromEntries(INSTRUMENTS.map((i) => [i.sym, i]))

/* The two indices the dashboard tracks. `members` drives the computed level. */
export const INDICES = {
  NIFTY50: {
    key: 'NIFTY50',
    name: 'NIFTY 50',
    prevClose: 24238.5,
    open: 24216.05,
    members: NIFTY50,
    token: null,
  },
  BANKNIFTY: {
    key: 'BANKNIFTY',
    name: 'NIFTY BANK',
    prevClose: 51482.35,
    open: 51520.8,
    members: BANKS,
    token: null,
  },
}

/* Chart ranges offered above the index chart */
export const RANGES = ['1D', '1W', '1M', '1Y', '5Y']

/* Candle timeframes offered in the analysis console */
export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W']

/* Everything here is cash-segment NSE */
export const EXCHANGE = 'NSE EXCHANGE'
