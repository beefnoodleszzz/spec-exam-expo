/**
 * Signature Utility for Legacy Request Check Result
 */
import { FuckingDSign } from './magic-sign'

/**
 * Converts a string to a byte array (UTF-8 encoded).
 * Matches the legacy implementation used for LEGACY_CHECK_KEY conversion.
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

/**
 * Generates the legacy request signature hash.
 * Wraps the legacy signature algorithm without altering its output.
 */
export function generateLegacyCheckResult(
  pid: number,
  cid: number,
  keyBytes: number[],
): string {
  return FuckingDSign(pid, cid, keyBytes)
}

export { FuckingDSign }
