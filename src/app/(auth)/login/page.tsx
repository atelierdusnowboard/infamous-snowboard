import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ message?: string; redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="p-8">
      <h1 className="text-lg font-black uppercase tracking-widest mb-1">
        Sign In
      </h1>
      <p className="text-xs text-black/40 uppercase tracking-widest mb-8">
        Welcome back.
      </p>

      {params.message && (
        <div className="border border-black p-3 mb-6 bg-black/5">
          <p className="text-xs font-bold uppercase tracking-widest">
            {params.message}
          </p>
        </div>
      )}

      <LoginForm redirectTo={params.redirectTo} />

      <div className="mt-6 pt-6 border-t border-black space-y-3">
        <p className="text-xs text-center">
          <Link
            href="/forgot-password"
            className="text-black/40 uppercase tracking-widest hover:text-black transition-colors text-xs"
          >
            Forgot password?
          </Link>
        </p>
        <p className="text-xs text-center text-black/40 uppercase tracking-widest">
          No account?{" "}
          <Link
            href="/register"
            className="text-black font-bold hover:opacity-60 transition-opacity"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
