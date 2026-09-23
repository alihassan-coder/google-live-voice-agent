export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "alihassan.coder@gmail.com";
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "";

export function mailto(subject: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}
