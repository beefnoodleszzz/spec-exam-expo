export type JsonObject = Record<string, unknown>

export type ApiSpecVersion =
  | {
      kind: 'swagger-2'
      version: '2.0'
    }
  | {
      kind: 'openapi-3'
      version: string
    }

export interface ApiInspectionSummary {
  sourceUrl: string
  detectedVersion: ApiSpecVersion
  title: string | null
  apiVersion: string | null
  basePath: string | null
  serverUrls: string[]
  pathCount: number
  operationCount: number
  schemaCount: number
  tagCount: number
  deprecatedOperationCount: number
  missingOperationIdCount: number
  duplicateOperationIds: string[]
  methods: Record<string, number>
}
