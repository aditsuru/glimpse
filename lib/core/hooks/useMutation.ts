import {
	type UseMutationOptions,
	useMutation as useTanstackMutation,
} from "@tanstack/react-query";

/**
 * A wrapper to fix the TypeScript inference issue where
 * variables default to 'void'.
 */
export function useMutation<TData, TVariables, TError = Error>(
	// We explicitly ask for the function here (e.g. client.user.signIn)
	mutationFn: (variables: TVariables) => Promise<TData>,
	// We exclude 'mutationFn' from options because we passed it above
	options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn">
) {
	return useTanstackMutation<TData, TError, TVariables>({
		mutationFn,
		...options,
	});
}
