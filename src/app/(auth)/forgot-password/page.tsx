import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="p-8">
      <h1 className="text-lg font-black uppercase tracking-widest mb-1">
        Reset Password
      </h1>
      <p className="text-xs text-black/40 uppercase tracking-widest mb-8">
        We&apos;ll send you a link.
      </p>

      <ForgotPasswordForm />

      <div className="mt-6 pt-6 border-t border-black">
        <p className="text-xs text-center text-black/40 uppercase tracking-widest">
          <Link
            href="/login"
            className="text-black font-bold hover:opacity-60 transition-opacity"
          >
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
