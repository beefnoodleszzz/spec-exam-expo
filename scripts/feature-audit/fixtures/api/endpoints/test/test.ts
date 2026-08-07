/**
 * @summary Search subject list
 */
export type apiExamV2AppSearchQueryEsSubjectListGetResponse200 = {
  data: string;
  status: 200;
};

export type apiExamV2AppSearchQueryEsSubjectListGetResponse = apiExamV2AppSearchQueryEsSubjectListGetResponse200;

export const getApiExamV2AppSearchQueryEsSubjectListGetUrl = () => {
  return `/api/examV2/app/search/queryEsSubjectList`;
}

export const apiExamV2AppSearchQueryEsSubjectListGet = async (options?: any): Promise<apiExamV2AppSearchQueryEsSubjectListGetResponse> => {
  return orvalRequest<apiExamV2AppSearchQueryEsSubjectListGetResponse>(
    getApiExamV2AppSearchQueryEsSubjectListGetUrl(),
    {
      ...options,
      method: 'GET'
    }
  );
}

export const orvalRequest = <T>(url: string, config: any): Promise<T> => {
  return Promise.resolve({} as T);
}
