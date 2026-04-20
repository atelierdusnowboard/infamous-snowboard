import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-12">
      <Link href="/" className="mb-12">
        <Image
          src="/logo.png"
          alt="Infamous Snowboard"
          width={120}
          height={40}
          className="h-8 w-auto object-contain"
        />
      </Link>
      <div className="w-full max-w-sm border border-black">
        {children}
      </div>
      <p className="mt-8 text-xs text-black/40 uppercase tracking-widest text-center">
        Less Noise. More Shapes.
      </p>
    </div>
  );
}
