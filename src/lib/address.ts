const STREETS = [
  "Sorrel Close",
  "Bramble Way",
  "Hawthorn Drive",
  "Willow Court",
  "Maple Gardens",
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
  const seed = hashString(clean);
  const street = STREETS[seed % STREETS.length];
  const town = "Peterborough";
  const area = "Hampton Vale";
  const count = 5;
  const addresses: string[] = [];
  for (let i = 1; i <= count; i++) {
    addresses.push(`${i}, ${street}, ${area}, ${town}`);
  }
  return addresses;
}
