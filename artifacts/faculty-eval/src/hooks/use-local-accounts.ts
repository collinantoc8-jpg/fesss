import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface LocalAccount {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
}

export interface CreateLocalAccountInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "student" | "peer";
}

const localAccountsQueryKey = ["local-accounts"];

async function readJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "include",
    ...init,
  });
  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as T;
}

export function useLocalAccountsQuery(enabled: boolean) {
  return useQuery({
    queryKey: localAccountsQueryKey,
    enabled,
    queryFn: () =>
      readJson<{ accounts: LocalAccount[]; allowedRoles: Array<"student" | "peer"> }>(
        "/api/auth/accounts",
      ),
  });
}

export function useLocalAccountsMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: localAccountsQueryKey });

  const createMutation = useMutation({
    mutationFn: (input: CreateLocalAccountInput) =>
      readJson<{ user: LocalAccount }>("/api/auth/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/auth/accounts/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || `HTTP ${response.status}`);
      }
    },
    onSuccess: invalidate,
  });

  return {
    createAccount: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteAccount: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
