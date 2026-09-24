export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "alihassan.coder@gmail.com";
export const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "";
/** Optional. Shown as "Call or text" on the contact page, e.g. "+1 813 555 0100". */
export const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";

export function mailto(subject: string, body = "") {
  const q = `subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
  return `mailto:${contactEmail}?${q}`;
}

/** Opens a Gmail compose window in the browser. Works without a desktop mail app, unlike mailto. */
export function gmailUrl(subject: string, body = "") {
  const q = new URLSearchParams({ view: "cm", fs: "1", to: contactEmail, su: subject, body });
  return `https://mail.google.com/mail/?${q}`;
}

export function telUrl(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function smsUrl(phone: string) {
  return `sms:${phone.replace(/[^\d+]/g, "")}`;
}
