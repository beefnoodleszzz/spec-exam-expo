import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './openapi/normalized/openapi.json',
    output: {
      target: './src/shared/api/generated/endpoints.ts',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      mode: 'tags-split',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './src/shared/api/client/request.ts',
          name: 'request',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
})
