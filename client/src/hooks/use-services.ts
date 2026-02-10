import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertServiceSchema } from "@shared/schema";
import { API_URL } from "@/lib/api";
import { z } from "zod";

type ServiceInput = z.infer<typeof insertServiceSchema>;

export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(`${API_URL}${api.services.list.path}`);
      if (!res.ok) throw new Error("Failed to fetch services");
      return api.services.list.responses[200].parse(await res.json());
    },
  });
}

export function useService(id: number) {
  return useQuery({
    queryKey: [api.services.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.services.get.path, { id });
      const res = await fetch(`${API_URL}${url}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch service");
      return api.services.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ServiceInput) => {
      const res = await fetch(`${API_URL}${api.services.create.path}`, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return api.services.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<ServiceInput>) => {
      const url = buildUrl(api.services.update.path, { id });
      const res = await fetch(`${API_URL}${url}`, {
        method: api.services.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update service");
      return api.services.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.services.get.path] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(`${API_URL}${url}`, { method: api.services.delete.method });
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}
