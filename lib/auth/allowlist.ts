const ALLOWED_EMAILS = [
  "mihikasenkulkarni@gmail.com",
  "ashish@econforeverybody.com",
  "vasundharasen@gmail.com",
  "mihir.mahajan@gmail.com",
  "eklavya@genwise.in",
] as const;

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(
    email.toLowerCase() as (typeof ALLOWED_EMAILS)[number]
  );
}
