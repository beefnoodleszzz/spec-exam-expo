import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  writeTextFile,
} from '../utils'

const directories: string[] = []

afterEach(() => {
  for (const directory of directories) {
    rmSync(directory, {
      recursive: true,
      force: true,
    })
  }

  directories.length = 0
})

describe('writeTextFile', () => {
  it(
    'writes real markdown instead of JSON-string encoding',
    () => {
      const directory =
        mkdtempSync(
          join(
            tmpdir(),
            'openapi-report-',
          ),
        )

      directories.push(directory)

      const filePath =
        join(directory, 'report.md')

      writeTextFile(
        filePath,
        '# Report\n\nContent',
      )

      const result =
        readFileSync(
          filePath,
          'utf8',
        )

      expect(result).toBe(
        '# Report\n\nContent\n',
      )

      expect(
        result.startsWith('"'),
      ).toBe(false)

      expect(
        result.includes('\\n'),
      ).toBe(false)
    },
  )
})
