import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="p-8">
      <h1 className="text-lg font-black uppercase tracking-widest mb-1">
        New Password
      </h1>
      <p className="text-xs text-black/40 uppercase tracking-widest mb-8">
        Choose something you&apos;ll remember.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
