import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAdminSettings() {
  return useQuery({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/admin/login", credentials);
      return response.json();
    },
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: { aiModel: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });
}
