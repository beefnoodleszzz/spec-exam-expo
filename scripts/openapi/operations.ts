import { asRecord } from './utils'
import type { JsonObject } from './types'

export const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
] as const

export type HttpMethod =
  (typeof HTTP_METHODS)[number]

export interface OpenApiOperationContext {
  path: string
  method: HttpMethod
  pathItem: JsonObject
  operation: JsonObject
}

export function forEachOperation(
  document: JsonObject,
  callback: (
    context: OpenApiOperationContext,
  ) => void,
): void {
  const paths = asRecord(document.paths)

  for (const [path, pathItemValue] of Object.entries(
    paths,
  )) {
    const pathItem = asRecord(pathItemValue)

    for (const method of HTTP_METHODS) {
      const operationValue = pathItem[method]

      if (operationValue === undefined) {
        continue
      }

      const operation = asRecord(operationValue)

      callback({
        path,
        method,
        pathItem,
        operation,
      })
    }
  }
}

export function getPathTemplateParameterNames(
  path: string,
): string[] {
  const names: string[] = []
  const expression = /\{([^{}]+)\}/g

  for (
    let match = expression.exec(path);
    match !== null;
    match = expression.exec(path)
  ) {
    const name = match[1]?.trim()

    if (name) {
      names.push(name)
    }
  }

  return [...new Set(names)]
}
