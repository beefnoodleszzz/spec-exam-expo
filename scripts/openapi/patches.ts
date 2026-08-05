import { createHash } from 'node:crypto'

import {
  forEachOperation,
  getPathTemplateParameterNames,
} from './operations'
import {
  asRecord,
} from './utils'
import type { JsonObject } from './types'

interface OpenApiPatch {
  id: string
  description: string
  apply(document: JsonObject): boolean
}

interface OpenApiParameter extends JsonObject {
  name?: unknown
  in?: unknown
}

function createOperationId(
  method: string,
  path: string,
): string {
  const parts = path
    .split('/')
    .filter(Boolean)
    .flatMap((part) =>
      part
        .replace(/[{}]/g, '')
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean),
    )

  const pascalPath = parts
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join('')

  return method.toLowerCase() + pascalPath
}

function getParameterArray(
  container: JsonObject,
): JsonObject[] {
  if (!Array.isArray(container.parameters)) {
    return []
  }

  return container.parameters
    .filter(
      (
        value,
      ): value is JsonObject =>
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value),
    )
}

function hasPathParameter(
  parameters: JsonObject[],
  name: string,
): boolean {
  return parameters.some((parameterValue) => {
    const parameter =
      parameterValue as OpenApiParameter

    return (
      parameter.in === 'path' &&
      parameter.name === name
    )
  })
}

function collectDeclaredPathParameters(
  pathItem: JsonObject,
  operation: JsonObject,
): Set<string> {
  const parameters = [
    ...getParameterArray(pathItem),
    ...getParameterArray(operation),
  ]

  return new Set(
    parameters
      .filter(
        (parameter) =>
          parameter.in === 'path' &&
          typeof parameter.name === 'string',
      )
      .map(
        (parameter) =>
          parameter.name as string,
      ),
  )
}

function appendInferredPathParameter(
  operation: JsonObject,
  name: string,
): void {
  const currentParameters =
    getParameterArray(operation)

  if (
    hasPathParameter(
      currentParameters,
      name,
    )
  ) {
    return
  }

  operation.parameters = [
    ...currentParameters,
    {
      name,
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
      description:
        'Client-inferred path parameter. The source API document uses this placeholder in the route but does not declare the parameter.',
      'x-client-inferred': true,
      'x-client-inference-reason':
        'missing-path-parameter-definition',
    },
  ]
}

function ensureOperationIds(
  document: JsonObject,
): boolean {
  let changed = false
  const usedOperationIds = new Set<string>()

  forEachOperation(
    document,
    ({ operation }) => {
      if (
        typeof operation.operationId ===
        'string'
      ) {
        usedOperationIds.add(
          operation.operationId,
        )
      }
    },
  )

  forEachOperation(
    document,
    ({
      path,
      method,
      operation,
    }) => {
      if (
        typeof operation.operationId ===
        'string'
      ) {
        return
      }

      const baseOperationId =
        createOperationId(method, path)

      let operationId = baseOperationId
      let suffix = 2

      while (
        usedOperationIds.has(operationId)
      ) {
        operationId =
          `${baseOperationId}${suffix}`
        suffix += 1
      }

      operation.operationId =
        operationId

      usedOperationIds.add(operationId)
      changed = true
    },
  )

  return changed
}

export function inferMissingPathParameters(
  document: JsonObject,
): boolean {
  let changed = false

  forEachOperation(
    document,
    ({
      path,
      pathItem,
      operation,
    }) => {
      const templateNames =
        getPathTemplateParameterNames(
          path,
        )

      if (templateNames.length === 0) {
        return
      }

      const declared =
        collectDeclaredPathParameters(
          pathItem,
          operation,
        )

      for (const name of templateNames) {
        if (declared.has(name)) {
          continue
        }

        appendInferredPathParameter(
          operation,
          name,
        )

        declared.add(name)
        changed = true
      }
    },
  )

  return changed
}

function normalizePathParameterNames(
  document: JsonObject,
): boolean {
  let changed = false

  forEachOperation(
    document,
    ({
      path,
      operation,
    }) => {
      const templateNames =
        getPathTemplateParameterNames(path)

      const parameters =
        getParameterArray(operation)

      for (const parameter of parameters) {
        if (
          parameter.in === 'path' &&
          typeof parameter.name === 'string'
        ) {
          const declaredName = parameter.name
          const matchingTemplate =
            templateNames.find(
              (name) =>
                name.toLowerCase() ===
                declaredName.toLowerCase(),
            )

          if (
            matchingTemplate &&
            matchingTemplate !==
            declaredName
          ) {
            parameter.name = matchingTemplate
            changed = true
          }
        }
      }
    },
  )

  return changed
}

function createShortSchemaName(
  originalName: string,
): string {
  const hash = createHash('sha256')
    .update(originalName)
    .digest('hex')
    .slice(0, 12)

  const readablePrefix = originalName
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 48)

  return `${readablePrefix}_${hash}`
}

function normalizeSchemaNames(
  document: JsonObject,
): boolean {
  const components = asRecord(document.components)
  const schemas = asRecord(components.schemas)

  const nameMapping = new Map<string, string>()
  let changed = false

  // First pass: identify schema names that need shortening
  for (const schemaName of Object.keys(schemas)) {
    if (schemaName.length > 128) {
      const shortName = createShortSchemaName(schemaName)
      nameMapping.set(schemaName, shortName)
      changed = true
    }
  }

  if (nameMapping.size === 0) {
    return false
  }

  // Second pass: rename schemas
  for (const [
    oldName,
    newName,
  ] of nameMapping.entries()) {
    const schema = schemas[oldName]
    delete schemas[oldName]
    schemas[newName] = schema
  }

  // Third pass: recursively update all $ref pointers
  function updateRefs(value: unknown): void {
    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value)
    ) {
      if (Array.isArray(value)) {
        for (const item of value) {
          updateRefs(item)
        }
      }
      return
    }

    const obj = value as JsonObject

    if (typeof obj.$ref === 'string') {
      for (const [
        oldName,
        newName,
      ] of nameMapping.entries()) {
        if (
          obj.$ref ===
          `#/components/schemas/${oldName}`
        ) {
          obj.$ref =
            `#/components/schemas/${newName}`
        }
      }
    }

    for (const propValue of Object.values(obj)) {
      updateRefs(propValue)
    }
  }

  updateRefs(document)

  // Store mapping in document for reporting
  if (!document['x-client-schema-name-mapping']) {
    document['x-client-schema-name-mapping'] = {}
  }

  const mapping = document['x-client-schema-name-mapping'] as Record<string, string>
  for (const [originalName, shortName] of nameMapping.entries()) {
    mapping[shortName] = originalName
  }

  return changed
}

export const patches: OpenApiPatch[] = [
  {
    id: 'PATCH-001-ENSURE-OPERATION-ID',
    description:
      'Add deterministic operationId values to operations that do not declare one.',
    apply(document): boolean {
      return ensureOperationIds(document)
    },
  },

  {
    id:
      'PATCH-002-INFER-MISSING-PATH-PARAMETERS',
    description:
      'Declare route-template path parameters that are missing from operation and path-item parameter lists.',
    apply(document): boolean {
      return inferMissingPathParameters(
        document,
      )
    },
  },

  {
    id:
      'PATCH-003-NORMALIZE-PATH-PARAMETER-NAMES',
    description:
      'Normalize declared path parameter names to match the case used in route templates.',
    apply(document): boolean {
      return normalizePathParameterNames(
        document,
      )
    },
  },

  {
    id: 'PATCH-004-NORMALIZE-SCHEMA-NAMES',
    description:
      'Shorten excessively long schema names to avoid file system path length limitations.',
    apply(document): boolean {
      return normalizeSchemaNames(document)
    },
  },
]
