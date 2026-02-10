import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api,  } from "@shared/routes";
import { z } from "zod";
import axios from "axios";
import { type InsertUser } from "@shared/schema";
// Helper for Login Type since it's defined inline in routes
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
type LoginInput = z.infer<typeof loginSchema>;

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(api.auth.me.path, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      const payload = api.auth.login.responses[200].parse(await res.json());
      // persist token for subsequent requests
      if (payload?.token) {
        localStorage.setItem("token", payload.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${payload.token}`;
        window.dispatchEvent(new Event("auth-changed"));
      }
      return payload;
    },
    onSuccess: (user) => {
      // server returns { token, user }
      const u = (user as any)?.user ?? user;
      queryClient.setQueryData([api.auth.me.path], u);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Registration failed");
        }
        throw new Error("Registration failed");
      }
      const payload = api.auth.register.responses[201].parse(await res.json());
      if ((payload as any)?.token) {
        localStorage.setItem("token", (payload as any).token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${(payload as any).token}`;
        window.dispatchEvent(new Event("auth-changed"));
      }
      return payload;
    },
    onSuccess: (user) => {
      const u = (user as any)?.user ?? user;
      queryClient.setQueryData([api.auth.me.path], u);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async () => {
      // immediately clear local auth state for instant logout UX
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      queryClient.setQueryData([api.auth.me.path], null);
      window.dispatchEvent(new Event("auth-changed"));
    },
    mutationFn: async () => {
      const res = await axios.post(api.auth.logout.path, undefined, { withCredentials: true });
      if (res.status !== 200 && res.status !== 204) throw new Error("Logout failed");
    },
    onError: () => {
      // On error, ensure local state is cleared anyway (safe fallback)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      queryClient.setQueryData([api.auth.me.path], null);
      window.dispatchEvent(new Event("auth-changed"));
    },
  });
}
