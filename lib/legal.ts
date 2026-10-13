// Single source of truth for the legal identity shown in Terms, Privacy and checkout.
// Fill these in when you have them. Until then the pages show "Conciply" and
// leave the address out, so it is safe to deploy as-is.
//   entity:  your LLC name once formed, or "Your Name, doing business as Conciply" as a sole proprietor
//   address: a mailing address for legal notices (a PO box or virtual mailbox is fine; avoid your home address)
export const LEGAL = {
  brand: "Conciply",
  entity: "",
  address: "",
  email: "hello@conciply.com",
  state: "California",
  venue: "Los Angeles County, California",
  updated: "October 13, 2026",
  consentVersion: "2026-10-13",
} as const;

/** Who the contract is with: the legal entity once set, otherwise the brand. */
export const operator = (): string => LEGAL.entity || LEGAL.brand;
/** ", <address>" when an address is set, otherwise nothing. */
export const addressSuffix = (): string => (LEGAL.address ? `, ${LEGAL.address}` : "");

export type BillingInterval = "monthly" | "annual";

/**
 * The checkbox text shown on Stripe Checkout, right above the Pay button
 * (Stripe consent_collection.terms_of_service). Stripe records the acceptance
 * on the Checkout Session; we also store this exact wording in its metadata.
 * Markdown links are supported by Stripe; keep it under ~1,000 characters.
 */
export function renewalConsentText(interval: BillingInterval, price = ""): string {
  const period = interval === "annual" ? "year" : "month";
  const at = price ? ` at ${price}` : "";
  return (
    `I agree to the [Terms](https://www.conciply.com/terms). My plan renews every ${period}${at} until I cancel ` +
    `anytime at [conciply.com/manage](https://www.conciply.com/manage). Access starts now, so any statutory ` +
    `withdrawal right ends once I start using it.`
  );
}
