import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card, CardContent } from "@/components/common/Card";

function friendlyError(err: unknown): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Unable to connect. Please check your internet connection and try again.";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred. Please try again.";
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectMessage = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      navigate(role === "super_admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(friendlyError(err));
      setGoogleLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate("/dashboard");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {redirectMessage && (
          <div className="mb-4 rounded-lg border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-sm text-gold-300">
            {redirectMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn-google w-full"
        >
          {googleLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-dark-300 border-t-transparent" />
              Connecting...
            </span>
          ) : (
            <>
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark-900/60 px-2 text-dark-500">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            to="/auth/forgot-password"
            className="text-gold-400 hover:text-gold-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dark-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark-900/60 px-2 text-dark-500">or</span>
          </div>
        </div>

        <button type="button" onClick={handleGuest} className="btn-guest w-full">
          Continue as Guest
        </button>

        <div className="mt-5 text-center text-sm text-dark-400">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
