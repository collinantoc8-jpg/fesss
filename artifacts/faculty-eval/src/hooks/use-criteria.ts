import { useQueryClient } from "@tanstack/react-query";
import {
  useListCriteria,
  useCreateCriterion,
  useDeleteCriterion,
  getListCriteriaQueryKey,
} from "@workspace/api-client-react";

export function useCriteriaQuery() {
  return useListCriteria();
}

export function useCriteriaMutations() {
  const queryClient = useQueryClient();

  const createMut = useCreateCriterion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCriteriaQueryKey() });
      },
    },
  });

  const deleteMut = useDeleteCriterion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCriteriaQueryKey() });
      },
    },
  });

  return {
    createCriterion: createMut.mutateAsync,
    isCreating: createMut.isPending,
    deleteCriterion: deleteMut.mutateAsync,
    isDeleting: deleteMut.isPending,
  };
}
