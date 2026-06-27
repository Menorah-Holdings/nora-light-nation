import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type SignInEmailInput, type SignUpEmailInput } from "../auth";
import { queryKeys } from "../queryKeys";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: authApi.getSession,
    retry: false,
  });
}

export function useSignInEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInEmailInput) => authApi.signInEmail(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useSignUpEmail() {
  return useMutation({
    mutationFn: (input: SignUpEmailInput) => authApi.signUpEmail(input),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
