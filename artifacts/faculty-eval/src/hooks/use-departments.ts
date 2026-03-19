import { useQueryClient } from "@tanstack/react-query";
import {
  useListDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  getListDepartmentsQueryKey,
} from "@workspace/api-client-react";

export function useDepartmentsQuery() {
  return useListDepartments();
}

export function useDepartmentsMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });

  const createMut = useCreateDepartment({ mutation: { onSuccess: invalidate } });
  const updateMut = useUpdateDepartment({ mutation: { onSuccess: invalidate } });
  const deleteMut = useDeleteDepartment({ mutation: { onSuccess: invalidate } });

  return {
    createDepartment: createMut.mutateAsync,
    isCreating: createMut.isPending,
    updateDepartment: updateMut.mutateAsync,
    isUpdating: updateMut.isPending,
    deleteDepartment: deleteMut.mutateAsync,
    isDeleting: deleteMut.isPending,
  };
}
