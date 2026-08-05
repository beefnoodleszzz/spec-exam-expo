import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: './openapi/normalized/openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated/endpoints',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: './src/shared/api/client/orval-mutator.ts',
          name: 'orvalRequest',
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
