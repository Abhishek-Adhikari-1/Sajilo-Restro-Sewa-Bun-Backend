const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ID_LENGTH = 8;

export function generateShortId(length: number = ID_LENGTH): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}
