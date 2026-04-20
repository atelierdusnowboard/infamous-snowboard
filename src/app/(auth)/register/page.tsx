import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="p-8">
      <h1 className="text-lg font-black uppercase tracking-widest mb-1">
        Create Account
      </h1>
      <p className="text-xs text-black/40 uppercase tracking-widest mb-8">
        Join the crew.
      </p>

      <RegisterForm />

      <div className="mt-6 pt-6 border-t border-black">
        <p className="text-xs text-center text-black/40 uppercase tracking-widest">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black font-bold hover:opacity-60 transition-opacity"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
