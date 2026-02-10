import { useState } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // set axios default header
      try { (await import('axios')).default.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; } catch {}
      window.dispatchEvent(new Event("auth-changed"));

      toast({ title: "Success", description: "Logged in successfully!" });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">DR Gabriel</h1>
            <p className="text-gray-600">Welcome back</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </a>
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-center text-xs text-gray-500">
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
