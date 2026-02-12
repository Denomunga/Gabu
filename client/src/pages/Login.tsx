import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { email, password },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Logged in successfully!" });
          navigate("/");
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Login failed",
          });
        },
      }
    );
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
              disabled={isPending}
              className="w-full h-10"
            >
              {isPending ? "Logging in..." : "Login"}
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
