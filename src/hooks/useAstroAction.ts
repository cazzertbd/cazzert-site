import type { FormEvent } from "react";
import { useState } from "react";

/**
 * Hook for working with Astro Actions, supporting both form submissions and direct action calls.
 *
 * @template T - The type of state returned by the action
 * @template R - The expected return type of the action itself
 *
 * @param action - The Astro action function to execute
 * @param initialState - Initial state before the action is called (default: null)
 *
 * @returns {Object} Hook methods and state
 * @returns {T|null} state - Current state after action execution with data and error properties
 * @returns {boolean} isPending - Indicates if the action is currently processing
 * @returns {Function} formAction - Event handler for form submissions
 * @returns {Function} execute - Function to execute the action directly with optional data
 * @returns {Function} setState - React setState function to manually update state
 *
 * @example
 * // With forms:
 * const { state, isPending, formAction } = useAstroAction(authActions.login);
 * <form onSubmit={formAction}>...</form>
 *
 * @example
 * // With buttons:
 * const { execute, isPending } = useAstroAction(authActions.logout);
 * <button onClick={() => execute()} disabled={isPending}>Logout</button>
 *
 * @example
 * // With Custom Data:
 * const handleClick = () => {
 *  execute({ id: userId, action: "delete" });
 * };
 */

export function useAstroAction<T = any, R = any>(
  action: (data: any) => Promise<any>,
  initialState: T | null = null,
): R | any {
  const [state, setState] = useState<T | null>(initialState);
  const [isPending, setIsPending] = useState(false);

  // For form submissions
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await action(formData);
      setState(result.data as unknown as T);
      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      setState({ error: message } as unknown as T);
      return { error: message };
    } finally {
      setIsPending(false);
    }
  };

  // For direct action calls (buttons, etc.)
  const execute = async (data?: any) => {
    setIsPending(true);

    try {
      const result = await action(data);
      setState(result.data as unknown as T);
      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      setState({ error: message } as unknown as T);
      return { error: message };
    } finally {
      setIsPending(false);
    }
  };

  return {
    state,
    isPending,
    formAction: handleFormSubmit, // For forms
    execute, // For direct calls
    setState,
  };
}
