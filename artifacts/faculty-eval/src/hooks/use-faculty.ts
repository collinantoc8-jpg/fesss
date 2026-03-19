import { useQueryClient } from "@tanstack/react-query";
import {
  useListFaculty,
  useCreateFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
  useGetFaculty,
  getListFacultyQueryKey,
} from "@workspace/api-client-react";

export function useFacultyQuery() {
  return useListFaculty();
}

export function useFacultyDetailQuery(id: number) {
  return useGetFaculty(id);
}

export function useFacultyMutations() {
  const queryClient = useQueryClient();

  const createMut = useCreateFaculty({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
      },
    },
  });

  const updateMut = useUpdateFaculty({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
      },
    },
  });

  const deleteMut = useDeleteFaculty({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFacultyQueryKey() });
      },
    },
  });

  return {
    createFaculty: createMut.mutateAsync,
    isCreating: createMut.isPending,
    updateFaculty: updateMut.mutateAsync,
    isUpdating: updateMut.isPending,
    deleteFaculty: deleteMut.mutateAsync,
    isDeleting: deleteMut.isPending,
  };
}
