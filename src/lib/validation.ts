const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function dedupeEmails(emails: string[]): string[] {
  return Array.from(new Set(emails.map((e) => e.trim().toLowerCase())));
}
