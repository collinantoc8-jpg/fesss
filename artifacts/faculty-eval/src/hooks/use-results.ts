import {
  useListResults,
  useGetFacultyResult,
} from "@workspace/api-client-react";

export function useResultsQuery() {
  return useListResults();
}

export function useFacultyResultDetailQuery(facultyId: number) {
  return useGetFacultyResult(facultyId, {
    query: {
      enabled: !!facultyId,
    },
  });
}
