/**
 * Contract redaction utilities for auth evidence.
 *
 * Redacts sensitive values while preserving structure and field names.
 * Uses exact field name matching to avoid false positives.
 */

const EXACT_REDACTIONS: Record<
  string,
  string
> = {
  token: '<ACCESS_TOKEN>',
  accessToken: '<ACCESS_TOKEN>',
  examToken: '<ACCESS_TOKEN>',
  refreshToken: '<REFRESH_TOKEN>',

  userId: '<USER_ID>',
  uid: '<USER_ID>',
  memberId: '<USER_ID>',

  phone: '138****0000',
  phoneNumber: '138****0000',
  mobile: '138****0000',
  mobilePhone: '138****0000',

  deviceId: '<DEVICE_ID>',
  terminalId: '<DEVICE_ID>',

  cookie: '<COOKIE>',
  sessionId: '<COOKIE>',

  ip: '<IP_ADDRESS>',
  ipAddress: '<IP_ADDRESS>',

  inviteCode: '<INVITE_CODE>',
  iptInviteCode: '<INVITE_CODE>',
}

const CASE_INSENSITIVE_REDACTIONS =
  new Map(
    Object.entries(EXACT_REDACTIONS).map(
      ([key, value]) => [
        key.toLowerCase(),
        value,
      ],
    ),
  )

export function sanitizeContract(
  value: unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeContract)
  }

  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return value
  }

  const source =
    value as Record<string, unknown>

  const result:
    Record<string, unknown> = {}

  for (
    const [key, child]
    of Object.entries(source)
  ) {
    if (child === null) {
      result[key] = null
      continue
    }

    const replacement =
      CASE_INSENSITIVE_REDACTIONS.get(
        key.toLowerCase(),
      )

    if (replacement !== undefined) {
      if (
        key.toLowerCase().includes(
          'phone',
        ) ||
        key.toLowerCase().includes(
          'mobile',
        )
      ) {
        const phoneStr = String(child)
        result[key] =
          phoneStr.replace(
            /\d{4}$/,
            '****',
          )
      } else {
        result[key] = replacement
      }

      continue
    }

    result[key] =
      sanitizeContract(child)
  }

  return result
}
