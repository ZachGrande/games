// Must stay in sync with the code pattern in database.rules.json (no I or O).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 4;
const CODE_PATTERN = /^[A-HJ-NP-Z]{4}$/;

export function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z]/g, "").slice(0, CODE_LENGTH);
}

export function isValidCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}
