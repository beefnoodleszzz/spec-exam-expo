/**
 * Map Domain commands to Generated API DTOs.
 *
 * All Domain → Generated DTO conversions are centralized here.
 * Generated DTOs are never used directly in business code.
 *
 * Evidence: docs/auth/legacy-auth-mapping.md
 */

import type {
  OneClickLoginCommand,
  SendShortMessageCommand,
  ShortMessageLoginCommand,
  V2LoginCommand,
} from '../domain/auth.types'
import type {
  ExaminationManageContractDtoUserUserLoginInput,
} from '@/shared/api/generated/models/examinationManageContractDtoUserUserLoginInput'
import type {
  ExaminationManageContractDtoUserUserLoginInputSystem,
} from '@/shared/api/generated/models/examinationManageContractDtoUserUserLoginInputSystem'
import type {
  ExaminationManageContractDtoUserUserLoginInputClientType,
} from '@/shared/api/generated/models/examinationManageContractDtoUserUserLoginInputClientType'
import type {
  ExaminationManageContractDtoUserShortMessageLoginInput,
} from '@/shared/api/generated/models/examinationManageContractDtoUserShortMessageLoginInput'
import type {
  ExaminationManageContractDtoUserShortMessageLoginInputSystem,
} from '@/shared/api/generated/models/examinationManageContractDtoUserShortMessageLoginInputSystem'
import type {
  ExaminationManageContractDtoUserShortMessageLoginInputClientType,
} from '@/shared/api/generated/models/examinationManageContractDtoUserShortMessageLoginInputClientType'
import {
  getAuthClientConfig,
} from './auth-client.config'

/**
 * Safely assign optional string field (avoid undefined).
 */
function assignString(
  obj: Record<string, unknown>,
  key: string,
  ...values: (string | undefined)[]
): void {
  for (const val of values) {
    if (val !== undefined) {
      obj[key] = val
      return
    }
  }
}

/**
 * Map ShortMessageLoginCommand to Generated DTO.
 *
 * Critical mapping: inviteCode → iptInviteCode
 * (old project uses 'iptInviteCode' field name)
 *
 * Evidence: login.dto.ts:47 (iptInviteCode)
 */
export function mapShortMessageLogin(
  command: ShortMessageLoginCommand,
  config = getAuthClientConfig(),
): ExaminationManageContractDtoUserShortMessageLoginInput {
  const dto: Record<string, unknown> = {
    mobile: command.phone,
    code: command.verificationCode,
    system: (command.system ??
      config.system) as ExaminationManageContractDtoUserShortMessageLoginInputSystem,
    terminal:
      command.terminal ?? config.terminal,
    clientType: (command.clientType ??
      config.clientType) as ExaminationManageContractDtoUserShortMessageLoginInputClientType,
  }

  assignString(
    dto,
    'province',
    command.province,
    config.province,
  )
  assignString(
    dto,
    'provinceCode',
    command.provinceCode,
    config.provinceCode,
  )
  assignString(
    dto,
    'examTypeId',
    command.examTypeId,
    config.examTypeId,
  )
  assignString(
    dto,
    'iptInviteCode',
    command.inviteCode,
    config.inviteCode,
  )

  return dto as ExaminationManageContractDtoUserShortMessageLoginInput
}

/**
 * Map V2LoginCommand to Generated DTO.
 *
 * Used for WeChat authorization code login.
 */
export function mapV2Login(
  command: V2LoginCommand,
  config = getAuthClientConfig(),
): ExaminationManageContractDtoUserUserLoginInput {
  const dto: Record<string, unknown> = {
    code: command.code,
    system: (command.system ??
      config.system) as ExaminationManageContractDtoUserUserLoginInputSystem,
    terminal:
      command.terminal ?? config.terminal,
    clientType: (command.clientType ??
      config.clientType) as ExaminationManageContractDtoUserUserLoginInputClientType,
  }

  assignString(
    dto,
    'province',
    command.province,
    config.province,
  )
  assignString(
    dto,
    'provinceCode',
    command.provinceCode,
    config.provinceCode,
  )
  assignString(
    dto,
    'examTypeId',
    command.examTypeId,
    config.examTypeId,
  )
  assignString(
    dto,
    'iptInviteCode',
    command.inviteCode,
    config.inviteCode,
  )
  assignString(dto, 'package', config.packageName)

  return dto as ExaminationManageContractDtoUserUserLoginInput
}

/**
 * Map OneClickLoginCommand to Generated DTO.
 *
 * Uses accessToken (from phone OS SDK) instead of code.
 */
export function mapOneClickLogin(
  command: OneClickLoginCommand,
  config = getAuthClientConfig(),
): ExaminationManageContractDtoUserUserLoginInput {
  const dto: Record<string, unknown> = {
    code: command.accessToken,
    system: (command.system ??
      config.system) as ExaminationManageContractDtoUserUserLoginInputSystem,
    terminal:
      command.terminal ?? config.terminal,
    clientType: (command.clientType ??
      config.clientType) as ExaminationManageContractDtoUserUserLoginInputClientType,
  }

  assignString(
    dto,
    'province',
    command.province,
    config.province,
  )
  assignString(
    dto,
    'provinceCode',
    command.provinceCode,
    config.provinceCode,
  )
  assignString(
    dto,
    'examTypeId',
    command.examTypeId,
    config.examTypeId,
  )
  assignString(dto, 'package', config.packageName)

  return dto as ExaminationManageContractDtoUserUserLoginInput
}

/**
 * Map SendShortMessageCommand to Generated DTO.
 */
export function mapSendShortMessage(
  command: SendShortMessageCommand,
): { mobile: string } {
  return {
    mobile: command.phone,
  }
}
