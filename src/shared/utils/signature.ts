/**
 * Converts a string to a byte array (UTF-8 encoded).
 * Matches the legacy implementation used for CHECK_KEY conversion.
 */
export function stringToByte(str: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push((code >> 6) | 0xc0, (code & 0x3f) | 0x80)
    } else {
      bytes.push(
        (code >> 12) | 0xe0,
        ((code >> 6) & 0x3f) | 0x80,
        (code & 0x3f) | 0x80,
      )
    }
  }
  return bytes
}

export { FuckingDSign } from './magic-sign'
