import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { insertNewsSchema } from "@shared/schema";
import { z } from "zod";

type NewsInput = z.infer<typeof insertNewsSchema>;

export function useNews() {
  return useQuery({
    queryKey: [api.news.list.path],
    queryFn: async () => {
      const res = await fetch(api.news.list.path);
      if (!res.ok) throw new Error("Failed to fetch news");
      return api.news.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: NewsInput) => {
      const res = await fetch(api.news.create.path, {
        method: api.news.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create news");
      return api.news.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.news.list.path] }),
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.news.delete.path, { id });
      const res = await fetch(url, { method: api.news.delete.method });
      if (!res.ok) throw new Error("Failed to delete news");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.news.list.path] }),
  });
}
