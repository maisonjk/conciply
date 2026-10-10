// Single source of truth for the legal identity shown in Terms, Privacy and checkout.
// TODO(owner): fill ENTITY and ADDRESS before merging. GDPR requires a named
// controller with a postal address, and the Terms need a party that can be sued
// instead of you personally (form an LLC first).
export const LEGAL = {
  brand: "Conciply",
  entity: "[LEGAL ENTITY NAME, e.g. Conciply LLC]",
  address: "[BUSINESS MAILING ADDRESS]",
  email: "hello@conciply.com",
  state: "California",
  venue: "Los Angeles County, California",
  updated: "October 10, 2026",
  consentVersion: "2026-10-10",
} as const;

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
