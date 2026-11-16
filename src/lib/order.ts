import { ORDER_EMAIL, WEB3FORMS_KEY } from "./catalog";

export type OrderMail = {
  subject: string;
  message: string;
  name: string;
  phone: string;
  email: string;
  /** Honeypot: real visitors never fill it, bots do. */
  trap?: string;
};

export type MailResult = "sent" | "mail-app" | "failed";

/**
 * Sends an order to the business inbox.
 * With a Web3Forms key the e-mail is sent from the page itself; without one, the
 * visitor's own mail app opens with the order already written (needs ORDER_EMAIL).
 */
export async function sendOrderEmail(o: OrderMail): Promise<MailResult> {
  if (o.trap) return "sent";

  if (WEB3FORMS_KEY) {
    try {
      // FormData keeps this a "simple" request (no CORS preflight, which the API rejects).
      const body = new FormData();
      body.append("access_key", WEB3FORMS_KEY);
      body.append("subject", o.subject);
      body.append("from_name", "Software Fabrika website");
      body.append("name", o.name);
      if (o.phone) body.append("phone", o.phone);
      if (o.email) body.append("email", o.email);
      body.append("message", o.message);
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body });
      const json = (await res.json()) as { success?: boolean };
      return res.ok && json.success ? "sent" : "failed";
    } catch {
      return "failed";
    }
  }

  if (ORDER_EMAIL) {
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(o.subject)}&body=${encodeURIComponent(o.message)}`;
    return "mail-app";
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("E-mail orders are not connected yet: set WEB3FORMS_KEY (or ORDER_EMAIL) in src/lib/catalog.ts");
  }
  return "failed";
}
