// Da paese di spedizione a zona di produzione Printful (usato da sito e server).
// Una taglia si può ordinare se Printful la produce nella zona del cliente; per i paesi
// fuori da queste zone Printful spedisce da dove la produce, quindi va bene qualsiasi zona.
const EU = 'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE CH NO IS LI MC SM VA AD'.split(' ');
const ZONES = { GB: 'UK', US: 'US', CA: 'CA', AU: 'AU', NZ: 'AU', JP: 'JP', BR: 'BR' };

export const regionOf = (country) => (EU.includes(country) ? 'EU' : ZONES[country] || null);

export function sizeAvailable(size, country) {
  if (!size.inStock) return false;
  const zone = regionOf(country);
  return !zone || !size.regions?.length || size.regions.includes(zone);
}
