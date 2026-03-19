import { useQueryClient } from "@tanstack/react-query";
import {
  useListEvaluations,
  useSubmitEvaluation,
  getListEvaluationsQueryKey,
  getListResultsQueryKey,
} from "@workspace/api-client-react";

export function useEvaluationsQuery(facultyId?: number) {
  return useListEvaluations({ facultyId });
}

export function useSubmitEvaluationMutation() {
  const queryClient = useQueryClient();

  return useSubmitEvaluation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEvaluationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListResultsQueryKey() });
      },
    },
  });
}
