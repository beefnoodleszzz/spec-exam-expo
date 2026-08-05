// @ts-nocheck
/**
 * LEGACY SIGNATURE ALGORITHM — DO NOT MODIFY
 *
 * This file is preserved exactly from the original implementation for
 * backend protocol compatibility. It is deliberately exempt from strict
 * TypeScript rules (ts-nocheck) because:
 * 1. The original code used loose types throughout.
 * 2. Any modification risks breaking the signature algorithm.
 * 3. The algorithm is tested via its public API (FuckingDSign) in signature.test.ts.
 *
 * To verify correctness: run `pnpm test src/shared/utils/__tests__/signature.test.ts`
 */
 
import md5 from 'js-md5'

/**
 * Request signature algorithm.
 * Original implementation preserved exactly for backend compatibility.
 * Do NOT modify without running the compatibility test suite.
 *
 * @param pid - random1 value
 * @param cid - random2 value
 * @param c   - byte array from stringToByte(CHECK_KEY), mutated in-place
 * @returns md5 hex of the obfuscated key buffer encoded as base64
 */
export function FuckingDSign(pid: number, cid: number, c: number[]): string {
  const index: number = (pid + cid) % 3

  switch (index) {
    case 2:
      SignFun3(index, c)
      break
    case 1:
      SignFun0(index, c, 16)
      break
    case 0:
      SignFun0(index, c, 32)
      break
  }

  return md5.hex(arrayBufferToBase64(c))
}

function arrayBufferToBase64(buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return encode(binary)
}

function SignFun3(index: number, c: any[]) {
  let data = Uint8Array.from([
    0x37, 0x92, 0x44, 0x68, 0xa5, 0x3d, 0xcc, 0x7f, 0xbb, 0xf, 0xd9, 0x88, 0xee, 0x9a, 0xe9, 0x5a,
  ])
  let key = KeyIndex(index)
  let cLen = c.length
  for (let i = 0; i < cLen; i++) {
    let x = data[i & 0xf]
    let xx = (x + (x ^ c[i] ^ key[i & 7])) ^ x
    c[i] = key[i & 7] ^ xx
  }
}

function SignFun0(index, c, b) {
  let v8 = KeyIndex(index)
  let times = c.length >> 3
  for (let i = 0; i < times; i++) {
    let start = i * 8
    var s = c.slice(start, start + 8)
    MagicFixByte(v8, s, b)
    for (let j = 0; j < 8; j++) {
      c[start + j] = s[j]
    }
  }
}

function MagicFixByte(v8, content, t) {
  var stack = []
  var rData = []
  let s = 0
  let index = 76
  while (s != 8) {
    let c = content[s]
    for (let i = 0; i < 8; i++) {
      stack[index + i] = c & (1 << i)
    }
    let c1 = content[s + 1]
    for (let i = 1; i < 9; i++) {
      stack[index - i] = c1 & (0x80 >> (i - 1))
    }
    s += 2
    index -= 16
  }
  while (t > 0) {
    let v8Offset = 0
    while (t != 0) {
      let vv = v8[v8Offset]
      if ((vv & 0x40) > 0) {
        rData[5] = stack[67]
        stack[199] = stack[66]
        rData[19] = stack[65]
        stack[215] = stack[65]
        rData[4] = stack[64]
        rData[20] = stack[60]
        stack[167] = stack[60]
        stack[107] = stack[56]
        stack[65] = stack[56]
        rData[3] = stack[52]
        stack[64] = stack[52]
        rData[17] = stack[53]
        stack[195] = stack[54]
        stack[56] = stack[54]
        rData[0] = stack[55]
        stack[52] = stack[55]
        stack[95] = stack[59]
        stack[53] = stack[59]
        rData[21] = stack[63]
        stack[163] = stack[63]
        stack[55] = stack[67]
        stack[59] = stack[66]
        stack[67] = rData[4]
        rData[11] = stack[79]
        stack[111] = stack[78]
        rData[22] = stack[77]
        stack[159] = stack[77]
        rData[10] = stack[76]
        stack[187] = stack[44]
        stack[77] = stack[44]
        rData[8] = stack[28]
        stack[76] = stack[28]
        stack[155] = stack[29]
        stack[60] = stack[29]
        stack[99] = stack[30]
        stack[44] = stack[30]
        rData[7] = stack[31]
        stack[28] = stack[31]
        rData[2] = stack[47]
        stack[29] = stack[47]
        stack[31] = stack[79]
        stack[47] = stack[78]
        stack[63] = rData[22]
        stack[79] = rData[10]
        rData[18] = stack[82]
        rData[23] = stack[74]
        stack[171] = stack[74]
        rData[16] = stack[70]
        stack[78] = rData[21]
        stack[91] = stack[38]
        stack[74] = stack[38]
        rData[15] = stack[22]
        stack[70] = stack[22]
        stack[175] = stack[26]
        stack[54] = stack[26]
        stack[38] = rData[19]
        rData[13] = stack[34]
        stack[22] = stack[34]
        stack[103] = stack[50]
        stack[26] = stack[50]
        stack[30] = rData[20]
        stack[34] = stack[82]
        stack[50] = rData[17]
        stack[66] = rData[23]
        stack[82] = rData[16]
      } else {
        rData[0] = stack[64]
        rData[1] = stack[65]
        stack[195] = stack[65]
        rData[2] = stack[66]
        rData[3] = stack[67]
        stack[107] = stack[63]
        stack[65] = stack[63]
        stack[91] = stack[59]
        rData[4] = stack[55]
        stack[67] = stack[55]
        stack[187] = stack[54]
        stack[199] = stack[53]
        stack[59] = stack[53]
        rData[5] = stack[52]
        stack[55] = stack[52]
        rData[6] = stack[56]
        stack[95] = stack[60]
        stack[53] = stack[60]
        stack[52] = stack[64]
        stack[56] = rData[1]
        stack[64] = rData[3]
        rData[7] = stack[76]
        stack[103] = rData[6]
        stack[99] = stack[77]
        stack[155] = stack[78]
        rData[8] = stack[79]
        stack[77] = stack[54]
        rData[9] = stack[47]
        stack[175] = stack[47]
        rData[10] = stack[31]
        stack[79] = stack[31]
        stack[159] = stack[30]
        stack[63] = stack[30]
        stack[111] = stack[29]
        stack[47] = stack[29]
        rData[11] = stack[28]
        stack[31] = stack[28]
        rData[12] = stack[44]
        stack[171] = stack[44]
        stack[29] = stack[66]
        stack[28] = stack[76]
        stack[44] = stack[99]
        stack[60] = stack[78]
        stack[76] = rData[8]
        rData[13] = stack[70]
        rData[14] = stack[74]
        stack[215] = stack[74]
        rData[15] = stack[82]
        stack[74] = stack[91]
        stack[163] = stack[50]
        stack[78] = stack[50]
        rData[16] = stack[34]
        stack[82] = stack[34]
        stack[66] = rData[12]
        rData[17] = stack[26]
        stack[50] = stack[26]
        rData[18] = stack[22]
        stack[34] = stack[22]
        stack[167] = stack[38]
        stack[30] = stack[38]
        stack[26] = rData[6]
        stack[22] = stack[70]
        stack[38] = rData[14]
        stack[54] = rData[9]
        stack[70] = rData[15]
      }
      if ((vv & 0x80) > 0) {
        stack[203] = stack[83]
        rData[34] = stack[81]
        rData[39] = stack[80]
        stack[119] = stack[80]
        rData[36] = stack[72]
        rData[35] = stack[68]
        rData[40] = stack[69]
        stack[76] = stack[69]
        stack[72] = rData[15]
        stack[115] = stack[71]
        stack[68] = stack[71]
        rData[38] = stack[75]
        stack[69] = stack[75]
        stack[70] = rData[10]
        stack[82] = rData[3]
        rData[33] = stack[48]
        stack[81] = stack[48]
        stack[123] = stack[32]
        stack[80] = stack[32]
        rData[26] = stack[33]
        stack[64] = stack[33]
        stack[48] = rData[18]
        rData[25] = stack[35]
        stack[32] = stack[35]
        stack[183] = rData[3]
        rData[3] = stack[51]
        stack[33] = stack[51]
        stack[34] = rData[4]
        stack[79] = rData[5]
        rData[37] = stack[39]
        stack[75] = stack[39]
        rData[30] = stack[23]
        stack[71] = stack[23]
        rData[24] = rData[15]
        rData[15] = stack[27]
        stack[55] = stack[27]
        stack[39] = rData[11]
        stack[23] = rData[39]
        stack[27] = rData[8]
        stack[31] = rData[36]
        stack[35] = rData[35]
        stack[51] = rData[34]
        stack[67] = rData[16]
        stack[207] = rData[16]
        stack[191] = rData[5]
        rData[16] = rData[40]
      } else {
        stack[115] = stack[80]
        rData[24] = stack[81]
        rData[25] = stack[83]
        rData[26] = stack[75]
        stack[123] = stack[71]
        rData[27] = stack[69]
        rData[28] = stack[68]
        stack[119] = stack[68]
        rData[29] = stack[72]
        stack[70] = stack[72]
        stack[69] = rData[8]
        stack[68] = stack[80]
        stack[72] = stack[81]
        stack[76] = rData[16]
        stack[81] = rData[4]
        stack[183] = stack[51]
        stack[82] = stack[51]
        rData[30] = stack[35]
        rData[31] = stack[33]
        stack[191] = stack[33]
        rData[32] = stack[32]
        stack[203] = stack[32]
        rData[33] = rData[4]
        rData[4] = stack[48]
        stack[34] = stack[48]
        stack[33] = rData[3]
        stack[32] = stack[83]
        stack[48] = rData[10]
        stack[64] = stack[75]
        stack[80] = stack[71]
        stack[75] = rData[18]
        stack[79] = rData[31]
        stack[83] = rData[32]
        stack[67] = rData[11]
        rData[34] = stack[27]
        stack[51] = stack[27]
        rData[35] = stack[23]
        stack[35] = stack[23]
        rData[36] = stack[39]
        stack[31] = stack[39]
        stack[27] = rData[5]
        stack[23] = rData[28]
        stack[39] = rData[27]
        stack[55] = rData[15]
        stack[207] = rData[11]
        rData[37] = rData[18]
        rData[18] = rData[10]
        stack[71] = rData[30]
        rData[11] = rData[27]
        rData[38] = rData[8]
        rData[10] = rData[29]
        rData[8] = rData[5]
      }
      if ((vv & 0x10) > 0) {
        stack[34] = rData[7]
        rData[45] = stack[24]
        stack[33] = stack[24]
        stack[211] = stack[20]
        rData[46] = stack[21]
        stack[27] = rData[4]
        stack[31] = rData[3]
        stack[35] = rData[25]
        stack[127] = rData[25]
        stack[70] = rData[0]
        rData[47] = stack[36]
        stack[69] = stack[36]
        stack[21] = rData[11]
        stack[22] = rData[15]
        stack[23] = rData[30]
        stack[39] = rData[10]
        stack[55] = rData[38]
        stack[71] = stack[115]
        stack[76] = rData[8]
        stack[72] = rData[36]
        stack[68] = rData[35]
        stack[52] = rData[13]
        stack[36] = rData[46]
        stack[24] = rData[18]
        stack[28] = rData[26]
        stack[235] = rData[26]
        stack[231] = rData[15]
        stack[239] = rData[13]
        stack[179] = rData[3]
        stack[32] = stack[123]
        stack[223] = rData[7]
        rData[44] = stack[123]
        stack[48] = rData[16]
        stack[64] = rData[24]
        stack[227] = rData[24]
        stack[243] = rData[0]
        stack[123] = rData[35]
        rData[15] = rData[47]
        rData[24] = rData[46]
        stack[80] = stack[119]
      } else {
        stack[33] = rData[36]
        stack[34] = rData[8]
        stack[35] = stack[119]
        stack[31] = rData[13]
        stack[179] = rData[13]
        rData[41] = stack[21]
        stack[27] = stack[21]
        rData[42] = stack[20]
        rData[43] = stack[24]
        stack[69] = rData[15]
        stack[70] = rData[11]
        stack[71] = stack[20]
        stack[55] = stack[24]
        stack[39] = rData[7]
        stack[23] = rData[25]
        stack[231] = stack[36]
        stack[22] = stack[36]
        stack[21] = rData[0]
        stack[72] = rData[26]
        stack[76] = rData[18]
        stack[80] = rData[35]
        stack[64] = rData[4]
        stack[48] = rData[3]
        rData[44] = stack[115]
        stack[32] = stack[115]
        stack[28] = rData[38]
        stack[24] = rData[10]
        stack[20] = rData[30]
        stack[211] = rData[30]
        stack[235] = rData[38]
        stack[36] = rData[24]
        stack[52] = rData[16]
        stack[243] = rData[11]
        stack[239] = rData[16]
        rData[30] = rData[25]
        rData[38] = rData[43]
        stack[127] = stack[119]
        stack[227] = rData[4]
        stack[223] = rData[8]
        stack[119] = rData[35]
        stack[115] = rData[42]
        rData[8] = rData[18]
        rData[45] = rData[36]
        rData[11] = rData[0]
        stack[68] = stack[123]
        rData[4] = rData[41]
        rData[18] = rData[10]
        rData[36] = rData[26]
        rData[10] = rData[7]
        rData[16] = rData[3]
      }
      stack[247] = rData[38]
      stack[219] = rData[30]
      stack[131] = rData[44]
      stack[151] = rData[8]
      rData[48] = stack[49]

      if ((vv & 0x20) > 0) {
        stack[50] = stack[99]
        rData[71] = stack[40]
        stack[48] = rData[24]
        rData[72] = stack[37]
        stack[44] = stack[37]
        stack[36] = rData[10]
        rData[73] = stack[43]
        stack[38] = stack[111]
        stack[39] = rData[34]
        stack[47] = stack[49]
        stack[51] = rData[16]
        stack[255] = stack[73]
        stack[74] = stack[195]
        stack[72] = rData[18]
        rData[56] = stack[25]
        stack[56] = stack[25]
        stack[40] = stack[103]
        stack[24] = rData[4]
        stack[26] = stack[199]
        stack[27] = rData[37]
        stack[43] = stack[91]
        stack[59] = stack[73]
        stack[251] = rData[11]
        stack[75] = rData[36]
        stack[77] = stack[95]
        stack[73] = rData[73]
        stack[69] = rData[11]
        stack[53] = rData[17]
        stack[37] = rData[2]
        rData[66] = rData[2]
        stack[21] = rData[45]
        stack[25] = rData[71]
        rData[59] = stack[107]
        stack[29] = stack[107]
        stack[33] = rData[33]
        rData[70] = stack[187]
        stack[49] = stack[187]
        stack[65] = stack[215]
        rData[62] = rData[37]
        rData[68] = stack[215]
        rData[58] = rData[33]
        rData[60] = rData[45]
        rData[61] = stack[95]
        rData[63] = stack[199]
        stack[95] = rData[71]
        rData[64] = rData[4]
        stack[107] = rData[73]
        rData[50] = stack[195]
        rData[65] = rData[34]
        rData[67] = rData[10]
        rData[69] = rData[72]
        stack[81] = rData[15]
      } else {
        rData[49] = stack[43]
        stack[50] = stack[43]
        stack[51] = rData[10]
        stack[47] = stack[215]
        rData[50] = stack[37]
        stack[39] = rData[24]
        rData[51] = stack[40]
        stack[38] = stack[40]
        stack[36] = rData[16]
        rData[52] = rData[17]
        stack[44] = rData[17]
        stack[48] = rData[34]
        rData[53] = rData[10]
        rData[54] = stack[73]
        stack[74] = stack[37]
        stack[75] = rData[4]
        stack[59] = stack[103]
        rData[55] = stack[25]
        stack[43] = stack[25]
        stack[27] = rData[18]
        stack[26] = stack[49]
        stack[24] = rData[36]
        stack[40] = stack[73]
        rData[56] = stack[91]
        stack[56] = stack[91]
        stack[72] = rData[37]
        stack[73] = stack[107]
        stack[77] = stack[111]
        stack[81] = rData[45]
        stack[65] = rData[2]
        rData[57] = rData[2]
        stack[49] = stack[195]
        stack[33] = rData[11]
        rData[58] = rData[11]
        rData[59] = stack[99]
        stack[29] = stack[99]
        stack[25] = stack[95]
        stack[21] = rData[15]
        rData[60] = rData[15]
        stack[37] = stack[199]
        rData[17] = stack[187]
        stack[53] = stack[187]
        stack[69] = rData[33]
        stack[255] = stack[103]
        stack[251] = rData[33]
        rData[61] = stack[111]
        rData[15] = rData[45]
        rData[62] = rData[18]
        rData[63] = rData[48]
        rData[64] = rData[36]
        rData[18] = rData[37]
        rData[36] = rData[4]
        rData[48] = stack[215]
        stack[91] = rData[55]
        rData[65] = rData[24]
        stack[111] = rData[51]
        rData[66] = stack[199]
        rData[67] = rData[16]
        stack[103] = rData[54]
        stack[99] = rData[49]
        rData[68] = rData[57]
        rData[24] = rData[34]
        rData[69] = rData[52]
        rData[70] = stack[195]
        rData[16] = rData[53]
      }
      rData[74] = stack[191]
      rData[75] = stack[207]

      if ((vv & 0x02) > 0) {
        stack[50] = rData[69]
        stack[48] = rData[67]
        stack[44] = rData[66]
        stack[36] = rData[65]
        stack[38] = rData[48]
        stack[39] = rData[16]
        stack[47] = rData[70]
        stack[51] = rData[24]
        stack[74] = rData[56]
        stack[72] = rData[64]
        stack[56] = stack[95]
        stack[40] = rData[63]
        stack[24] = rData[62]
        rData[76] = stack[255]
        stack[26] = stack[255]
        stack[27] = rData[36]
        stack[43] = rData[50]
        rData[77] = stack[107]
        stack[59] = stack[107]
        stack[75] = rData[18]
        stack[77] = rData[17]
        stack[187] = rData[17]
        stack[73] = stack[91]
        stack[69] = rData[60]
        stack[53] = stack[99]
        stack[37] = rData[59]
        stack[21] = rData[58]
        stack[25] = stack[103]
        stack[29] = rData[68]
        stack[191] = rData[68]
        stack[199] = rData[65]
        stack[33] = rData[15]
        stack[195] = rData[58]
        stack[207] = rData[62]
        stack[49] = rData[61]
        stack[91] = rData[69]
        stack[103] = rData[48]
        rData[59] = stack[111]
        stack[65] = stack[111]
        rData[78] = rData[36]
        rData[79] = rData[16]
        rData[80] = rData[15]
        rData[81] = stack[251]
        stack[81] = stack[251]
      } else {
        stack[50] = stack[91]
        stack[51] = rData[65]
        stack[47] = stack[111]
        stack[39] = rData[67]
        stack[38] = stack[103]
        stack[36] = rData[24]
        stack[44] = stack[99]
        stack[48] = rData[16]
        stack[74] = rData[66]
        stack[75] = rData[62]
        stack[59] = rData[63]
        stack[43] = stack[95]
        stack[27] = rData[64]
        stack[26] = rData[70]
        stack[24] = rData[18]
        stack[40] = stack[107]
        stack[56] = rData[50]
        stack[72] = rData[36]
        stack[73] = rData[68]
        stack[199] = rData[24]
        stack[77] = rData[48]
        stack[195] = stack[251]
        stack[207] = rData[18]
        stack[81] = rData[58]
        stack[65] = rData[59]
        stack[49] = rData[56]
        stack[33] = rData[60]
        stack[29] = rData[69]
        stack[25] = rData[17]
        stack[21] = stack[251]
        stack[37] = stack[255]
        rData[76] = rData[70]
        rData[56] = rData[66]
        rData[70] = stack[111]
        stack[191] = rData[69]
        stack[187] = rData[48]
        rData[66] = stack[99]
        rData[77] = rData[63]
        stack[99] = rData[61]
        stack[95] = rData[50]
        rData[78] = rData[64]
        rData[79] = rData[67]
        rData[24] = rData[65]
        rData[80] = rData[60]
        rData[67] = rData[16]
        rData[18] = rData[62]
        rData[60] = rData[15]
        stack[53] = rData[61]
        stack[69] = rData[15]
        rData[64] = rData[36]
        rData[81] = rData[58]
      }
      rData[83] = stack[119]
      rData[82] = stack[115]
      stack[107] = rData[56]
      rData[84] = stack[151]
      rData[85] = stack[123]
      rData[86] = stack[247]

      if ((vv & 0x08) > 0) {
        stack[76] = rData[60]
        stack[72] = stack[243]
        stack[68] = stack[115]
        stack[69] = rData[18]
        stack[70] = rData[74]
        stack[82] = stack[227]
        stack[81] = rData[67]
        stack[80] = stack[131]
        stack[64] = rData[80]
        rData[87] = stack[223]
        stack[48] = stack[223]
        stack[32] = stack[127]
        stack[33] = rData[24]
        stack[34] = rData[75]
        stack[79] = stack[247]
        stack[75] = rData[79]
        rData[91] = stack[219]
        stack[71] = stack[219]
        stack[55] = rData[78]
        stack[39] = stack[179]
        stack[23] = stack[119]
        stack[27] = stack[151]
        stack[31] = rData[64]
        stack[35] = stack[123]
        stack[51] = rData[81]
        rData[81] = stack[243]
        rData[88] = stack[179]
        rData[89] = stack[183]
        stack[67] = stack[183]
        rData[90] = rData[18]
        rData[92] = rData[24]
        rData[24] = stack[227]
        stack[83] = stack[203]
      } else {
        stack[70] = rData[64]
        stack[69] = stack[151]
        stack[68] = stack[119]
        stack[72] = rData[81]
        stack[76] = stack[183]
        stack[81] = rData[75]
        stack[82] = rData[24]
        stack[34] = rData[67]
        stack[33] = stack[227]
        stack[32] = stack[203]
        stack[48] = rData[74]
        stack[64] = rData[18]
        stack[80] = stack[115]
        stack[75] = stack[223]
        stack[79] = rData[80]
        rData[87] = rData[74]
        stack[83] = stack[131]
        stack[131] = stack[115]
        rData[88] = rData[60]
        rData[89] = stack[179]
        stack[67] = stack[179]
        rData[82] = stack[119]
        rData[90] = stack[151]
        stack[51] = rData[78]
        rData[91] = stack[127]
        rData[84] = stack[247]
        rData[83] = stack[123]
        stack[35] = stack[219]
        stack[31] = rData[79]
        stack[27] = stack[247]
        stack[23] = stack[123]
        stack[39] = rData[60]
        stack[55] = stack[243]
        stack[71] = stack[127]
        stack[127] = stack[203]
        rData[92] = stack[227]
        rData[85] = stack[219]
        rData[75] = rData[67]
        rData[74] = rData[64]
        rData[64] = rData[79]
        rData[60] = stack[183]
        rData[78] = stack[243]
        rData[86] = rData[80]
        rData[80] = rData[18]
      }
      if ((vv & 0x04) > 0) {
        stack[65] = stack[95]
        stack[64] = stack[239]
        stack[56] = stack[175]
        stack[52] = rData[78]
        stack[53] = rData[77]
        stack[55] = rData[89]
        stack[59] = stack[171]
        stack[67] = rData[80]
        stack[77] = rData[66]
        stack[76] = stack[235]
        stack[60] = stack[191]
        stack[44] = stack[167]
        stack[28] = rData[64]
        stack[29] = rData[70]
        stack[31] = rData[86]
        stack[47] = stack[163]
        stack[63] = stack[187]
        stack[79] = rData[60]
        stack[78] = stack[159]
        stack[74] = stack[103]
        stack[70] = stack[231]
        stack[54] = rData[76]
        stack[38] = rData[59]
        stack[22] = rData[75]
        stack[26] = stack[91]
        stack[30] = stack[155]
        stack[34] = rData[24]
        stack[50] = stack[99]
        stack[66] = stack[107]
        stack[82] = rData[74]
        rData[93] = stack[239]
        rData[94] = stack[235]
        rData[95] = stack[231]
      } else {
        stack[65] = stack[159]
        stack[67] = rData[78]
        stack[59] = stack[99]
        stack[55] = stack[239]
        stack[53] = stack[155]
        stack[52] = rData[80]
        stack[56] = rData[59]
        stack[64] = rData[89]
        stack[77] = stack[175]
        stack[79] = rData[64]
        stack[63] = stack[167]
        stack[47] = stack[191]
        stack[31] = stack[235]
        stack[29] = stack[171]
        stack[28] = rData[60]
        stack[44] = stack[187]
        stack[60] = stack[163]
        stack[76] = rData[86]
        stack[74] = rData[77]
        stack[78] = stack[91]
        stack[82] = rData[75]
        stack[66] = rData[66]
        stack[50] = rData[76]
        stack[34] = stack[231]
        stack[30] = stack[103]
        stack[26] = stack[95]
        rData[93] = rData[89]
        rData[75] = rData[74]
        rData[94] = rData[86]
        stack[22] = rData[75]
        rData[89] = stack[239]
        rData[78] = rData[80]
        stack[38] = stack[107]
        rData[95] = rData[24]
        rData[86] = stack[235]
        stack[54] = rData[70]
        rData[64] = rData[60]
        stack[70] = rData[24]
        rData[24] = stack[231]
      }
      if ((vv & 0x01) > 0) {
        stack[34] = rData[64]
        stack[33] = stack[207]
        stack[27] = rData[24]
        stack[31] = rData[92]
        stack[35] = stack[127]
        stack[70] = rData[78]
        stack[69] = stack[199]
        stack[21] = rData[88]
        stack[22] = rData[89]
        stack[23] = rData[91]
        stack[39] = rData[95]
        stack[55] = rData[90]
        stack[71] = rData[82]
        stack[76] = rData[84]
        stack[72] = rData[86]
        stack[68] = rData[85]
        stack[52] = rData[75]
        stack[36] = stack[195]
        stack[20] = stack[211]
        stack[24] = rData[87]
        stack[28] = rData[93]
        stack[32] = stack[131]
        stack[48] = rData[94]
        stack[64] = rData[81]
        stack[80] = rData[83]
      } else {
        stack[33] = rData[86]
        stack[34] = rData[84]
        stack[35] = rData[83]
        stack[31] = rData[75]
        stack[27] = stack[195]
        stack[69] = rData[89]
        stack[70] = rData[88]
        stack[71] = stack[211]
        stack[55] = stack[207]
        stack[39] = rData[64]
        stack[23] = stack[127]
        stack[22] = stack[199]
        stack[21] = rData[78]
        stack[72] = rData[93]
        stack[76] = rData[87]
        stack[80] = rData[85]
        stack[64] = rData[24]
        stack[48] = rData[92]
        stack[32] = rData[82]
        stack[28] = rData[90]
        stack[24] = rData[95]
        stack[20] = rData[91]
        stack[36] = rData[81]
        stack[52] = rData[94]
        stack[68] = stack[131]
      }
      t--
      v8Offset++
    }
  }
  s = 0
  index = 76
  while (s != 8) {
    content[s] =
      ((((((((((((Bool(stack[index + 7] != 0) << 7) & 0xbf) | (Bool(stack[index + 6] != 0) << 6)) & 0xdf) |
        (32 * Bool(stack[index + 5] != 0))) &
        0xef) |
        (16 * Bool(stack[index + 4] != 0))) &
        0xf7) |
        (8 * Bool(stack[index + 3] != 0))) &
        0xfb) |
        (4 * Bool(stack[index + 2] != 0))) &
        0xfd) |
      (2 * Bool(stack[index + 1] != 0)) |
      Bool(stack[index] != 0)
    content[s + 1] =
      ((((((((((((Bool(stack[index - 1] != 0) << 7) & 0xbf) | (Bool(stack[index - 2] != 0) << 6)) & 0xdf) |
        (32 * Bool(stack[index - 3] != 0))) &
        0xef) |
        (16 * Bool(stack[index - 4] != 0))) &
        0xf7) |
        (8 * Bool(stack[index - 5] != 0))) &
        0xfb) |
        (4 * Bool(stack[index - 6] != 0))) &
        0xfd) |
      (2 * Bool(stack[index - 7] != 0)) |
      Bool(stack[index - 8] != 0)
    s += 2
    index -= 16
  }
  //println(string(content))
}

function Bool(b: boolean): number {
  if (b) {
    return 1
  }
  return 0
}

function KeyIndex(i: number) {
  switch (i) {
    case 2:
      return stringToByte(`80306f4370b39fd5630ad0529f77adb6`)
    case 1:
      return stringToByte(`7d0069660c9b5d32074facf37c3738a1`)
    default:
      return stringToByte(`44e715a6e322ccb7d028f7a42fa55040`)
  }
}

export function stringToByte(str) {
  var arr = []
  for (var i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i))
  }
  var tmpUint8Array = new Uint8Array(arr)
  return tmpUint8Array
}

var encode = function (input) {
  var TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  input = String(input)
  if (/[^\0-\xFF]/.test(input)) {
    // Note: no need to special-case astral symbols here, as surrogates are
    // matched, and the input is supposed to only contain ASCII anyway.
    console.log(input)
  }
  var padding = input.length % 3
  var output = ''
  var position = -1
  var a
  var b
  var c
  var buffer
  // Make sure any padding is handled outside of the loop.
  var length = input.length - padding

  while (++position < length) {
    // Read three bytes, i.e. 24 bits.
    a = input.charCodeAt(position) << 16
    b = input.charCodeAt(++position) << 8
    c = input.charCodeAt(++position)
    buffer = a + b + c
    // Turn the 24 bits into four chunks of 6 bits each, and append the
    // matching character for each of them to the output.
    output +=
      TABLE.charAt((buffer >> 18) & 0x3f) +
      TABLE.charAt((buffer >> 12) & 0x3f) +
      TABLE.charAt((buffer >> 6) & 0x3f) +
      TABLE.charAt(buffer & 0x3f)
  }

  if (padding == 2) {
    a = input.charCodeAt(position) << 8
    b = input.charCodeAt(++position)
    buffer = a + b
    output += TABLE.charAt(buffer >> 10) + TABLE.charAt((buffer >> 4) & 0x3f) + TABLE.charAt((buffer << 2) & 0x3f) + '='
  } else if (padding == 1) {
    buffer = input.charCodeAt(position)
    output += TABLE.charAt(buffer >> 2) + TABLE.charAt((buffer << 4) & 0x3f) + '=='
  }

  return output
}
