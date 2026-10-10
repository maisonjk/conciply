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
  updated: "October 10, 2026",
  consentVersion: "2026-10-10",
} as const;

/** Who the contract is with: the legal entity once set, otherwise the brand. */
export const operator = (): string => LEGAL.entity || LEGAL.brand;
/** ", <address>" when an address is set, otherwise nothing. */
export const addressSuffix = (): string => (LEGAL.address ? `, ${LEGAL.address}` : "");

export type BillingInterval = "monthly" | "annual";

/** The exact sentence the buyer agrees to. Stored with the Stripe session as proof of consent. */
export function renewalConsentText(interval: BillingInterval): string {
  const period = interval === "annual" ? "year" : "month";
  return (
    `I agree to the Terms of Use. My plan renews automatically every ${period} at the price shown ` +
    `until I cancel. I can cancel anytime online at conciply.com/manage, effective at the end of the ` +
    `current billing period. I want immediate access and understand that this means I lose any ` +
    `statutory right to withdraw once access starts.`
  );
}
