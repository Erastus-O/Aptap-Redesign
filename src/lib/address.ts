const STREETS = [
  "Sorrel Close",
  "Bramble Way",
  "Hawthorn Drive",
  "Willow Court",
  "Maple Gardens",
  "Cedar Row",
  "Foxglove Lane",
];

const PLACES = [
  { area: "Hampton Vale", town: "Peterborough" },
  { area: "Chorlton", town: "Manchester" },
  { area: "Southville", town: "Bristol" },
  { area: "Headingley", town: "Leeds" },
  { area: "Shawlands", town: "Glasgow" },
  { area: "Roath", town: "Cardiff" },
  { area: "Jesmond", town: "Newcastle" },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function normalizePostcode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function isLikelyPostcode(raw: string): boolean {
  return raw.trim().length >= 5;
}

export function findAddresses(postcode: string): string[] {
  const clean = normalizePostcode(postcode);
  const street = STREETS[hashString(`${clean}|street`) % STREETS.length];
  const place = PLACES[hashString(`${clean}|place`) % PLACES.length];
  const count = 5;
  const addresses: string[] = [];
  for (let i = 1; i <= count; i++) {
    addresses.push(`${i}, ${street}, ${place.area}, ${place.town}`);
  }
  return addresses;
}
