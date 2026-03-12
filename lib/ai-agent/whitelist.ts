/**
 * Whitelist of official URLs per provider (slug).
 * Source Discovery step uses this; rejects forums, aggregators, Wikipedia.
 */
export const PROVIDER_URL_WHITELIST: Record<string, string[]> = {
  amina: ["https://www.aminabank.com/terms", "https://www.aminabank.com/legal", "https://www.aminabank.com/faq"],
  sygnum: ["https://www.sygnum.com/terms", "https://www.sygnum.com/legal"],
  xapo: ["https://xapo.com/terms", "https://xapo.com/borrow"],
  unchained: ["https://unchained.com/terms", "https://unchained.com/custody"],
  matrixport: ["https://www.matrixport.com/terms", "https://www.matrixport.com/faq"],
  ledn: ["https://ledn.io/terms", "https://ledn.io/borrow"],
  nexo: ["https://nexo.com/terms", "https://nexo.com/faq"],
  salt: ["https://saltlending.com/terms", "https://saltlending.com/loan-terms"],
  "hodl-hodl": ["https://hodlhodl.com/terms", "https://hodlhodl.com/faq"],
  strc: ["https://example.com/strc/terms"],
  strk: ["https://example.com/strk/terms"],
  "morpho-usdc": ["https://morpho.org/terms", "https://morpho.org/docs"],
  "aave-usdc": ["https://aave.com/terms", "https://docs.aave.com"],
  "compound-v3": ["https://compound.finance/terms", "https://docs.compound.finance"],
};

export function getWhitelistForProvider(slug: string): string[] {
  return PROVIDER_URL_WHITELIST[slug] ?? [];
}
