import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-black mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo.png"
              alt="Infamous Snowboard"
              width={120}
              height={40}
              className="h-8 w-auto object-contain mb-4"
            />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black mt-4">
              Less Noise. More Shapes.
            </p>
            <p className="text-sm text-black/60 mt-3 max-w-xs">
              We build boards for riders who don&apos;t need a backstory.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  All Boards
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  Snowboards
                </Link>
              </li>
              <li>
                <Link
                  href="/account/wishlist"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4">
              Info
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  Account
                </Link>
              </li>
              <li>
                <Link
                  href="/pro"
                  className="text-sm hover:opacity-60 transition-opacity"
                >
                  Pro
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-black/40 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Infamous Snowboard. All rights reserved.
          </p>
          <p className="text-xs text-black/40 uppercase tracking-widest">
            Made for the mountain.
          </p>
        </div>
      </div>
    </footer>
  );
}
