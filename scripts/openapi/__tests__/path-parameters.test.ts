import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  inferMissingPathParameters,
} from '../patches'
import type { JsonObject } from '../types'

describe(
  'inferMissingPathParameters',
  () => {
    it(
      'adds pluginId from route template',
      () => {
        const document: JsonObject = {
          openapi: '3.0.1',
          paths: {
            '/api/config/{pluginId}': {
              get: {
                operationId:
                  'getConfigByPluginId',
                responses: {
                  200: {
                    description: 'OK',
                  },
                },
              },
            },
          },
        }

        const changed =
          inferMissingPathParameters(
            document,
          )

        expect(changed).toBe(true)

        const operation = (
          document.paths as JsonObject
        )['/api/config/{pluginId}'] as JsonObject

        const get =
          operation.get as JsonObject

        expect(get.parameters).toEqual([
          {
            name: 'pluginId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description:
              expect.any(String),
            'x-client-inferred': true,
            'x-client-inference-reason':
              'missing-path-parameter-definition',
          },
        ])
      },
    )

    it(
      'does not duplicate an operation parameter',
      () => {
        const document: JsonObject = {
          openapi: '3.0.1',
          paths: {
            '/api/user/{id}': {
              get: {
                parameters: [
                  {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                      type: 'integer',
                    },
                  },
                ],
              },
            },
          },
        }

        expect(
          inferMissingPathParameters(
            document,
          ),
        ).toBe(false)
      },
    )

    it(
      'respects path-item parameters',
      () => {
        const document: JsonObject = {
          openapi: '3.0.1',
          paths: {
            '/api/user/{id}': {
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              get: {},
            },
          },
        }

        expect(
          inferMissingPathParameters(
            document,
          ),
        ).toBe(false)
      },
    )

    it(
      'is idempotent',
      () => {
        const document: JsonObject = {
          openapi: '3.0.1',
          paths: {
            '/api/config/{pluginId}': {
              get: {},
            },
          },
        }

        expect(
          inferMissingPathParameters(
            document,
          ),
        ).toBe(true)

        expect(
          inferMissingPathParameters(
            document,
          ),
        ).toBe(false)
      },
    )
  },
)
