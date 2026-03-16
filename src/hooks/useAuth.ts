import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook to access auth state and actions from any client component.
 *
 * Usage:
 *   const { user, loading, login, logout, register } = useAuth();
 */
export const useAuth = useAuthContext;
