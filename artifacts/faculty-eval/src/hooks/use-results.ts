import {
  useListResults,
  useGetFacultyResult,
  useListAcademicYears,
} from "@workspace/api-client-react";

export function useResultsQuery(params?: { academicYear?: string; semester?: string }) {
  return useListResults(params);
}

export function useFacultyResultDetailQuery(facultyId: number) {
  return useGetFacultyResult(facultyId, {
    query: {
      enabled: !!facultyId,
    },
  });
}

export function useAcademicYearsQuery() {
  return useListAcademicYears();
}
